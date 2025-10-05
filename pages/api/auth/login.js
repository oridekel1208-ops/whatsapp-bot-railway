import { getClientByPhoneNumberId } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const client = await getClientByPhoneNumberId(phoneNumber);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.status(200).json({ client, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
