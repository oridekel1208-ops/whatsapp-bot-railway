// pages/api/bots/index.js
import { ensureTables, addBot, getBotByClientId, pool } from "../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM bots ORDER BY id DESC;");
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Failed to fetch bots:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { client_id, name, access_token, config = {} } = req.body;
      if (!client_id || !name || !access_token)
        return res.status(400).json({ error: "Missing required fields" });

      const newBot = await addBot({ client_id, name, access_token, config });
      return res.status(201).json(newBot);
    } catch (err) {
      console.error("❌ Failed to add bot:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
