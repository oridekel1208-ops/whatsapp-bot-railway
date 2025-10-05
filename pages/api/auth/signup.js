// pages/api/auth/signup.js
import { createClient, getClientByPhoneNumberId } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber required' });

  try {
    const existing = await getClientByPhoneNumberId(phoneNumber);
    if (existing) return res.status(409).json({ error: 'Phone number already registered' });

    const verifyToken = Math.random().toString(36).slice(2, 10);
    const client = await createClient({
      name: `Client ${phoneNumber}`,
      phone_number_id: phoneNumber,
      whatsapp_business_account_id: null,
      access_token: '', // client should fill in access token later in dashboard
      verify_token: verifyToken
    });

    // return created client (do NOT include access_token)
    const safeClient = { id: client.id, name: client.name, phone_number_id: client.phone_number_id, is_verified: client.is_verified, verify_token: client.verify_token };
    return res.status(200).json({ client: safeClient });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
