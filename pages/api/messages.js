// pages/api/messages.js
import { getRecentMessages } from "../../lib/db.js";

export default async function handler(req, res) {
  try {
    const messages = await getRecentMessages(50);
    res.status(200).json({ messages });
  } catch (err) {
    console.error("❌ Error in /api/messages:", err);
    res.status(500).json({ error: err.message });
  }
}
