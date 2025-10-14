const { updateBotAccessToken, getBotById } = require("../../../lib/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const { newToken } = req.body;

  if (!newToken) return res.status(400).json({ error: "newToken is required" });

  try {
    const bot = await getBotById(id);
    if (!bot) return res.status(404).json({ error: "Bot not found" });

    const updated = await updateBotAccessToken(id, newToken);
    return res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Failed to update bot token:", err);
    return res.status(500).json({ error: err.message });
  }
};
