// pages/api/send.js
import { insertMessage, getClientByPhoneNumberId } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { to, body, client_phone_number_id } = req.body;
  if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });

  try {
    // find client by phone_number_id (owner of the bot)
    const client = client_phone_number_id ? await getClientByPhoneNumberId(client_phone_number_id) : null;
    const client_id = client?.id || null;

    // Insert outbound message record (optimistic)
    await insertMessage({
      client_id,
      whatsapp_id: null,
      from_number: client_phone_number_id || process.env.WHATSAPP_PHONE_ID || 'platform',
      to_number: to,
      direction: 'outbound',
      body,
      provider_payload: null
    });

    // Try sending via Meta Graph if access_token is present
    if (client?.access_token) {
      try {
        const phoneId = client.phone_number_id;
        const sendResp = await fetch(`https://graph.facebook.com/${process.env.META_API_VERSION || 'v17.0'}/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body }
          })
        });

        const sendData = await sendResp.json();
        // store provider payload (update last message row)
        await insertMessage({
          client_id,
          whatsapp_id: sendData?.messages?.[0]?.id || null,
          from_number: phoneId,
          to_number: to,
          direction: 'outbound',
          body,
          provider_payload: sendData
        });
      } catch (err) {
        console.warn('send via Graph failed', err);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
