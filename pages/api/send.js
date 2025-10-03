// pages/api/send.js
import { sendText } from '../../lib/provider-meta.js';
import { insertMessage } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { to, text } = req.body;
    if (!to || !text) return res.status(400).json({ error: 'to and text required' });

    const sendRes = await sendText(to, text);
    // store outbound message
    await insertMessage({
      whatsapp_id: sendRes?.messages?.[0]?.id || null,
      from_number: process.env.WHATSAPP_PHONE_ID,
      to_number: to,
      direction: 'outbound',
      body: text,
      provider_payload: sendRes
    });

    return res.status(200).json({ ok: true, provider: sendRes });
  } catch (err) {
    console.error('Send API error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
