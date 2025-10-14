import { updateBotAccessToken, getBotById } from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.query;
  const { accessToken } = req.body;

  if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

  const bot = await getBotById(id);
  if (!bot) return res.status(404).json({ error: "Bot not found" });

  const updated = await updateBotAccessToken(id, accessToken);
  return res.status(200).json(updated);
}
