// pages/api/clients.js
import fetch from 'node-fetch';
import { createClient, getClientByPhoneNumberId, markClientVerified } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone_number_id, whatsapp_business_account_id, access_token, verify_token } = req.body;
  if (!name || !phone_number_id || !access_token || !verify_token) {
    return res.status(400).json({ error: 'name, phone_number_id, access_token and verify_token required' });
  }

  try {
    // Optional: check if phone_number_id already exists
    const exists = await getClientByPhoneNumberId(phone_number_id);
    if (exists) return res.status(409).json({ error: 'phone_number_id already registered' });

    // Create client record
    const client = await createClient({ name, phone_number_id, whatsapp_business_account_id, access_token, verify_token });

    // Try verify token by making a lightweight Graph API call using provided access_token
    // We'll request the phone number metadata to validate the token + phone_id pair
    const url = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v17.0'}/${phone_number_id}?fields=id&access_token=${encodeURIComponent(access_token)}`;

    const resp = await fetch(url);
    const data = await resp.json();

    if (resp.ok && data && data.id) {
      // Mark verified
      await markClientVerified(client.id, true);
    } else {
      // Not verified - keep false, return warning
      console.warn('Client creation: verification failed', data);
    }

    return res.status(201).json({ client, verification: resp.ok ? 'ok' : 'failed', meta: data });
  } catch (err) {
    console.error('Create client error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
