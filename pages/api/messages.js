import { getRecentMessages } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const messages = await getRecentMessages();
  res.status(200).json(messages);
}
