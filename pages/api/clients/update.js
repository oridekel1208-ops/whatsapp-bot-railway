// pages/api/clients/update.js
const { pool, getClientByPhoneNumberId } = require('../../../lib/db.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { phone_number_id, access_token, name } = req.body;
  if (!phone_number_id) return res.status(400).json({ error: 'phone_number_id required' });

  try {
    const existing = await getClientByPhoneNumberId(phone_number_id);
    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const updates = [];
    const values = [];
    let idx = 1;

    if (access_token !== undefined) {
      updates.push(`access_token = $${idx++}`);
      values.push(access_token);
    }
    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    values.push(phone_number_id);
    const sql = `UPDATE clients SET ${updates.join(', ')}, updated_at = now() WHERE phone_number_id = $${idx} RETURNING id, name, phone_number_id, is_verified, verify_token, access_token;`;
    const r = await pool.query(sql, values);
    const client = r.rows[0];
    return res.status(200).json({ client });
  } catch (err) {
    console.error('clients/update error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
