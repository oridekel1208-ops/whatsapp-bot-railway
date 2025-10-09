// pages/api/bots/index.js
import { pool, ensureTables } from "../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  try {
    const result = await pool.query(
      `SELECT b.id, b.name, b.access_token, c.phone_number_id
       FROM bots b
       JOIN clients c ON c.id = b.client_id
       ORDER BY b.created_at DESC;`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
