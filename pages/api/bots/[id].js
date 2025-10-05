import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const result = await pool.query('SELECT * FROM bots WHERE id=$1', [id]);
    return res.json(result.rows[0]);
  }

  if (req.method === 'PUT') {
    const { welcome_message, flows } = req.body;
    const result = await pool.query(
      'UPDATE bots SET config=$1 WHERE id=$2 RETURNING *',
      [JSON.stringify({ welcome_message, flows }), id]
    );
    return res.json(result.rows[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
