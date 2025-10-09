// pages/api/bots/[id]/update-token.js
import { pool, ensureTables } from "../../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  try {
    const result = await pool.query(
      `UPDATE bots
       SET access_token = $1, updated_at = now()
       WHERE id = $2
       RETURNING *;`,
      [access_token, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Bot not found" });

    res.status(200).json({ ok: true, bot: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
