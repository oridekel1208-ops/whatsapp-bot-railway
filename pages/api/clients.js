// pages/api/clients.js
import { createClient, getClientByPhoneNumberId, markClientVerified } from '../../lib/db.js';

export default async function handler(req, res) {
  // Only allow POST for creating a client
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { name, phone_number_id, whatsapp_business_account_id, access_token, verify_token } = req.body;

  if (!name || !phone_number_id || !access_token || !verify_token) {
    return res.status(400).json({ error: 'Missing required fields: name, phone_number_id, access_token, verify_token' });
  }

  try {
    // Check if client already exists
    const existing = await getClientByPhoneNumberId(phone_number_id);
    if (existing) {
      return res.status(409).json({ error: 'Client with this phone_number_id already exists' });
    }

    // Create new client
    const client = await createClient({
      name,
      phone_number_id,
      whatsapp_business_account_id: whatsapp_business_account_id || null,
      access_token,
      verify_token
    });

    // Optional: verify WhatsApp by sending a test message (native fetch)
    try {
      const phoneId = phone_number_id;
      const messageRes = await fetch(
        `https://graph.facebook.com/${process.env.META_API_VERSION || 'v17.0'}/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneId,
            type: "text",
            text: { body: "✅ Your WhatsApp account is connected!" }
          })
        }
      );
      const sendData = await messageRes.json();

      // If the test message succeeded, mark client as verified
      if (!sendData.error) {
        await markClientVerified(client.id, true);
      }
    } catch (err) {
      console.warn('Could not send verification message:', err);
    }

    return res.status(201).json(client);
  } catch (err) {
    console.error('Error creating client:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
