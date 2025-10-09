// pages/api/bots/index.js
import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(`SELECT id, name, access_token FROM bots ORDER BY created_at DESC`);
      return res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch bots" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end("Method Not Allowed");
}
