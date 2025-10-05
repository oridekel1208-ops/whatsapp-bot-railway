import { getUserByEmail } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  const user = await getUserByEmail(email);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // For demo, we store logged-in user in a simple cookie
  res.setHeader('Set-Cookie', `user=${encodeURIComponent(user.email)}; Path=/; HttpOnly`);
  return res.status(200).json({ email: user.email });
}
