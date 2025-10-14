// pages/api/bots/index.js
const {
  ensureTables,
  getBots,
  getClientByPhoneNumberId,
  createClient,
  addBot,
} = require("../../../lib/db.js");

export default async function handler(req, res) {
  await ensureTables();

  // GET all bots
  if (req.method === "GET") {
    try {
      const bots = await getBots();
      return res.status(200).json(bots);
    } catch (err) {
      console.error("❌ Failed to fetch bots:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST create a new bot
  if (req.method === "POST") {
    try {
      const { phoneNumberId, accessToken, name = "New Bot" } = req.body;
      if (!phoneNumberId || !accessToken) {
        return res.status(400).json({ error: "Missing phoneNumberId or accessToken" });
      }

      let client = await getClientByPhoneNumberId(phoneNumberId);
      if (!client) {
        client = await createClient({
          name: `Client ${phoneNumberId}`,
          phone_number_id: phoneNumberId,
          access_token: accessToken,
          verify_token: Math.random().toString(36).substring(2, 12),
        });
      }

      const bot = await addBot({
        client_id: client.id,
        name,
        access_token: accessToken,
        config: {},
      });

      return res.status(201).json(bot);
    } catch (err) {
      console.error("❌ Failed to create bot:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Unsupported method
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
