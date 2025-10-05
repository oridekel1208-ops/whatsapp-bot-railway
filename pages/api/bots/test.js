export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { phone_number_id, access_token } = req.body;

  try {
    // Test connection with WhatsApp API
    const response = await fetch(`https://graph.facebook.com/v17.0/${phone_number_id}?access_token=${access_token}`);
    const data = await response.json();
    if (data.id) return res.json({ ok: true });
    return res.status(400).json({ ok: false, error: data.error?.message || 'Invalid token' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
