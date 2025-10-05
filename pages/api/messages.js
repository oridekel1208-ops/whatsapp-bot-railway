// pages/api/messages.js
import { getRecentMessages } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const messages = await getRecentMessages(200);
    return res.status(200).json(messages);
  } catch (err) {
    console.error('messages error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
