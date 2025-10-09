// pages/api/bots/[id]/update-token.js
import { updateBotAccessToken, getBotById } from "../../../../lib/db.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const bot = await getBotById(id);
    if (!bot) return res.status(404).json({ error: "Bot not found" });

    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: "Missing access_token" });
    }

    const updated = await updateBotAccessToken(id, access_token);
    return res.status(200).json({ success: true, bot: updated });
  } catch (err) {
    console.error("❌ Failed to update token:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
