import { createUser, getUserByEmail } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  const existing = await getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'User already exists' });

  // WARNING: Plain password storage, not secure for production!
  const user = await createUser({ email, password_hash: password });
  return res.status(201).json({ id: user.id, email: user.email });
}
