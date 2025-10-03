// pages/api/messages.js
import { getRecentMessages } from '../../lib/db.js';

export default async function handler(req, res) {
  try {
    const messages = await getRecentMessages(200);
    return res.status(200).json(messages);
  } catch (err) {
    console.error('messages API error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
