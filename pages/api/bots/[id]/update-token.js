// pages/api/bots/[id]/update-token.js
const { updateBotAccessToken, getBotById } = require("../../../lib/db.js");

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    const bot = await getBotById(id);
    if (!bot) return res.status(404).json({ error: "Bot not found" });

    const updatedBot = await updateBotAccessToken(id, accessToken);
    return res.status(200).json(updatedBot);
  } catch (err) {
    console.error("❌ Failed to update bot token:", err);
    return res.status(500).json({ error: err.message });
  }
};
