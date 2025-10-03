// pages/api/webhook.js
import crypto from 'crypto';
import { insertMessage } from '../../lib/db.js';
import { sendText } from '../../lib/provider-meta.js';

// Disable Next's default body parsing so we can verify raw body signature.
export const config = {
  api: {
    bodyParser: false
  }
};

function bufferToString(buffer) {
  return buffer.toString('utf8');
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // GET -> verification (Meta sends hub.challenge)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Verification failed');
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // POST -> message events
  try {
    const raw = await getRawBody(req);
    const rawString = bufferToString(raw);

    // Verify signature if we have app secret + signature header
    const signatureHeader = req.headers['x-hub-signature-256'];
    if (process.env.META_APP_SECRET && signatureHeader) {
      const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET);
      hmac.update(raw);
      const expected = 'sha256=' + hmac.digest('hex');
      const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
      if (!valid) {
        console.warn('Invalid signature for incoming webhook');
        return res.status(401).send('Invalid signature');
      }
    }

    const body = JSON.parse(rawString);

    // Minimal handling: iterate entries and messages, save to DB, simple echo reply
    if (body.object === 'whatsapp_business_account' || body.entry) {
      for (const entry of body.entry || []) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const messages = value.messages || [];
          const metadata = value.metadata || {};
          for (const m of messages) {
            const from = m.from;
            const text = m.text?.body || null;
            // Save inbound
            await insertMessage({
              whatsapp_id: m.id,
              from_number: from,
              to_number: metadata.phone_number_id || process.env.WHATSAPP_PHONE_ID,
              direction: 'inbound',
              body: text,
              provider_payload: m
            });

            // SIMPLE BOT: Echo back (only within the 24-hour window - this is inbound reply)
            // You can replace this with LLM/NLP logic, or enqueue into workers
            const reply = text ? `You said: ${text}` : "Thanks for your message.";
            try {
              const sendRes = await sendText(from, reply);
              await insertMessage({
                whatsapp_id: sendRes?.messages?.[0]?.id || null,
                from_number: process.env.WHATSAPP_PHONE_ID,
                to_number: from,
                direction: 'outbound',
                body: reply,
                provider_payload: sendRes
              });
            } catch (err) {
              console.error('Failed to send reply:', err?.message || err);
            }
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
