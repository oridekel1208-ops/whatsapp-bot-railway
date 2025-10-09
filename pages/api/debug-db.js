// pages/api/debug-db.js
import { pool } from "../../lib/db.js";

export default async function handler(req, res) {
  try {
    const result = await pool.query("SELECT current_database(), current_user;");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
