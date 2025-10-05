import { createClient, getClientByPhoneNumberId } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const existing = await getClientByPhoneNumberId(phoneNumber);
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const verifyToken = Math.random().toString(36).substring(2, 10); // simple token
    const client = await createClient({
      name: 'User ' + phoneNumber,
      phone_number_id: phoneNumber,
      access_token: '', // leave blank for now
      verify_token: verifyToken
    });

    return res.status(200).json({ client, message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
