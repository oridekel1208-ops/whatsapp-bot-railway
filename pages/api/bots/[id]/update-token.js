// pages/api/bots/[id]/update-token.js
import { updateBotAccessToken } from "../../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;
    const { newToken } = req.body;

    if (!id || !newToken) {
      return res.status(400).json({ error: "Missing bot ID or new token" });
    }

    const updatedBot = await updateBotAccessToken(id, newToken);

    if (!updatedBot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    return res.status(200).json(updatedBot);
  } catch (err) {
    console.error("❌ Failed to update bot token:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
