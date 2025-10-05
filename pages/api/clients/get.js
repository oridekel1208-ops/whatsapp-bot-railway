// pages/api/clients/get.js
const { getClientByPhoneNumberId } = require('../../../lib/db.js');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const phone = req.query.phone_number_id;
  if (!phone) return res.status(400).json({ error: 'phone_number_id required' });

  try {
    const client = await getClientByPhoneNumberId(phone);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    // Do not return sensitive tokens if present
    const safeClient = {
      id: client.id,
      name: client.name,
      phone_number_id: client.phone_number_id,
      is_verified: client.is_verified,
      verify_token: client.verify_token,
      access_token: client.access_token || ''
    };
    return res.status(200).json({ client: safeClient });
  } catch (err) {
    console.error('clients/get error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
