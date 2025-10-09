// pages/api/bots/[id]/update-token.js
import { pool } from "../../../../lib/db.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    const result = await pool.query(
      `UPDATE bots SET access_token = $1 WHERE id = $2 RETURNING *`,
      [accessToken, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Bot not found" });

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to update token:", err);
    res.status(500).json({ error: err.message });
  }
}
