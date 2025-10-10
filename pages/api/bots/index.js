// pages/api/bots/index.js
import {
  ensureTables,
  getBotsByClientId,
  getClientByPhoneNumberId,
  createClient,
  addBot,
  pool,
} from "../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  // ✅ GET: fetch all bots
  if (req.method === "GET") {
    try {
      const result = await pool.query(`
        SELECT 
          bots.id,
          bots.name AS bot_name,
          bots.access_token,
          bots.created_at,
          clients.id AS client_id,
          clients.name AS client_name,
          clients.phone_number_id
        FROM bots
        LEFT JOIN clients ON bots.client_id = clients.id
        ORDER BY bots.id DESC;
      `);

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Failed to fetch bots:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ✅ POST: create new bot
  if (req.method === "POST") {
    try {
      const { phoneNumberId, accessToken, name = "New Bot" } = req.body;

      if (!phoneNumberId || !accessToken) {
        return res
          .status(400)
          .json({ error: "Missing phoneNumberId or accessToken" });
      }

      // ✅ Ensure client exists
      let client = await getClientByPhoneNumberId(phoneNumberId);
      if (!client) {
        client = await createClient({
          name: `Client ${phoneNumberId}`,
          phone_number_id: phoneNumberId,
          whatsapp_business_account_id: null,
          access_token: accessToken,
          verify_token: Math.random().toString(36).substring(2, 12),
        });
      }

      // ✅ Create bot
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

  // 🚫 Unsupported method
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
