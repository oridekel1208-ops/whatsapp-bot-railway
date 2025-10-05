// pages/api/auth/login.js
import { getClientByPhoneNumberId } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber required' });

  try {
    const client = await getClientByPhoneNumberId(phoneNumber);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // Return safe client info (no access tokens)
    const safeClient = { id: client.id, name: client.name, phone_number_id: client.phone_number_id, is_verified: client.is_verified };
    return res.status(200).json({ client: safeClient });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
