import { ensureTables, getBots, createClient, getClientByPhoneNumberId, addBot } from "../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  if (req.method === "GET") {
    try {
      const bots = await getBots();
      return res.status(200).json(bots);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    const { phoneNumberId, accessToken, name = "New Bot" } = req.body;
    if (!phoneNumberId || !accessToken) return res.status(400).json({ error: "Missing fields" });

    let client = await getClientByPhoneNumberId(phoneNumberId);
    if (!client) {
      client = await createClient({
        name: `Client ${phoneNumberId}`,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        verify_token: Math.random().toString(36).substring(2, 12)
      });
    }

    const bot = await addBot({ client_id: client.id, name, access_token: accessToken });
    return res.status(201).json(bot);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
