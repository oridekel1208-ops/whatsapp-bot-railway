import { insertMessage } from '../../lib/db.js';
import { sendText } from '../../lib/provider-meta.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { to, body } = req.body;
  if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });

  try {
    const sendRes = await sendText(to, body); // Use your WhatsApp provider
    await insertMessage({
      whatsapp_id: sendRes?.messages?.[0]?.id || null,
      from_number: process.env.WHATSAPP_PHONE_ID,
      to_number: to,
      direction: 'outbound',
      body,
      provider_payload: sendRes
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
