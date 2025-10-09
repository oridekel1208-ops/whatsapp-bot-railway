import { pool, ensureTables } from "../../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { id } = req.query;
  const { access_token } = req.body;

  if (!access_token || !id) {
    return res.status(400).json({ error: "Missing bot ID or token" });
  }

  try {
    await ensureTables();

    const result = await pool.query(
      `UPDATE bots SET access_token = $1, updated_at = now() WHERE id = $2 RETURNING *;`,
      [access_token, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.status(200).json({ ok: true, bot: result.rows[0] });
  } catch (err) {
    console.error("❌ Failed to update bot token:", err);
    res.status(500).json({ error: err.message });
  }
}
