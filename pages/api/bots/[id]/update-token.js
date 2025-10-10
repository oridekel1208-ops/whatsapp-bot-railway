// pages/api/bots/[id]/update-token.js
import { updateBotAccessToken } from "../../../lib/db.js";

export default async function handler(req, res) {
  const botId = req.query.id;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Missing accessToken" });
    }

    const updatedBot = await updateBotAccessToken(botId, accessToken);
    return res.status(200).json(updatedBot);
  } catch (err) {
    console.error("❌ Failed to update bot token:", err);
    return res.status(500).json({ error: err.message });
  }
}
