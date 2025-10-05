// pages/api/webhook.js
import crypto from 'crypto';
import {
  insertMessage,
  getClientByPhoneNumberId,
  markClientVerified
} from '../../lib/db.js';

export const config = {
  api: { bodyParser: false } // ✅ Raw body needed for signature validation
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
  // ✅ Handle Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔎 Incoming Verification:', { mode, token, challenge });

    if (mode === 'subscribe' && token) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Verification failed');
    }
  }

  // ✅ Only allow POST for message events
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const raw = await getRawBody(req);
    const rawString = bufferToString(raw);

    // ✅ Optional: Verify signature (skip if not set)
    const signatureHeader = req.headers['x-hub-signature-256'];
    if (process.env.META_APP_SECRET && signatureHeader) {
      const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET);
      hmac.update(raw);
      const expected = 'sha256=' + hmac.digest('hex');
      const valid = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signatureHeader)
      );
      if (!valid) {
        console.warn('❌ Invalid signature');
        return res.status(401).send('Invalid signature');
      }
    }

    const body = JSON.parse(rawString);
    console.log('📩 Incoming Webhook:', JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account' && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const metadata = value.metadata || {};
          const phoneId = metadata.phone_number_id;

          if (!phoneId) {
            console.warn('⚠️ Missing phone_number_id in metadata');
            continue;
          }

          // ✅ Find client by phone_number_id
          const client = await getClientByPhoneNumberId(phoneId);
          const client_id = client?.id || null;

          // ✅ If this is the first time receiving webhook, mark verified
          if (client && !client.is_verified) {
            await markClientVerified(client.id, true);
            console.log(`✅ Client ${client.name} marked as verified`);
          }

          for (const m of value.messages || []) {
            const from = m.from;
            const text = m.text?.body || null;

            await insertMessage({
              client_id,
              whatsapp_id: m.id,
              from_number: from,
              to_number: phoneId,
              direction: 'inbound',
              body: text,
              provider_payload: m
            });

            // ✅ Send reply *using client’s access token*
            const reply = text ? `You said: ${text}` : "Thanks for your message.";
            if (client?.access_token) {
              try {
                const sendResp = await fetch(
                  `https://graph.facebook.com/${process.env.META_API_VERSION || 'v17.0'}/${phoneId}/messages`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${client.access_token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      messaging_product: "whatsapp",
                      to: from,
                      type: "text",
                      text: { body: reply }
                    })
                  }
                );

                const sendData = await sendResp.json();

                await insertMessage({
                  client_id,
                  whatsapp_id: sendData?.messages?.[0]?.id || null,
                  from_number: phoneId,
                  to_number: from,
                  direction: 'outbound',
                  body: reply,
                  provider_payload: sendData
                });
              } catch (err) {
                console.error('❌ Failed to send reply:', err);
              }
            } else {
              console.error(`🚫 No access token found for client ${client_id}`);
            }
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('🔥 Webhook Error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
