// pages/api/bots/[id]/update-token.js
import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: "access_token is required" });

    try {
      await pool.query(
        `UPDATE bots SET access_token = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [access_token, id]
      );
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update token" });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  return res.status(405).end("Method Not Allowed");
}
