// pages/api/debug/db-check.js
import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const bots = await pool.query("SELECT * FROM bots");
    const clients = await pool.query("SELECT * FROM clients");
    res.status(200).json({ bots: bots.rows, clients: clients.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
