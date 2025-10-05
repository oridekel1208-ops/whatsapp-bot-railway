import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { client_id } = req.query;
    const result = await pool.query('SELECT * FROM bots WHERE client_id=$1', [client_id]);
    return res.json(result.rows);
  }

  if (req.method === 'POST') {
    const { client_id, phone_number_id, access_token } = req.body;
    const result = await pool.query(
      'INSERT INTO bots (client_id, phone_number_id, access_token, connected, config) VALUES ($1,$2,$3,false,$4) RETURNING *',
      [client_id, phone_number_id, access_token, JSON.stringify({ welcome_message: '', flows: [] })]
    );
    return res.json(result.rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
