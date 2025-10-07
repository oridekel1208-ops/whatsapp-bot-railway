export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { phoneNumberId, accessToken } = req.body;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // You can verify again here if you want
    const verifyRes = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}?access_token=${accessToken}`
    );

    if (!verifyRes.ok) {
      return res
        .status(400)
        .json({ error: "Invalid phone number ID or token" });
    }

    // Simulate saving to database
    const bot = {
      id: Date.now(),
      phoneNumberId,
      accessToken,
      createdAt: new Date().toISOString(),
    };

    res.status(200).json(bot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
