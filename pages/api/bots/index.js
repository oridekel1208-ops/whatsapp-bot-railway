// pages/api/bots/index.js
import {
  ensureTables,
  addBot,
  getClientByPhoneNumberId,
  createClient,
  pool,
} from "../../../lib/db.js";

export default async function handler(req, res) {
  await ensureTables();

  if (req.method === "GET") {
    try {
      const result = await pool.query(`
        SELECT 
          bots.id,
          bots.name,
          bots.access_token,
          bots.created_at,
          clients.phone_number_id,
          clients.name AS client_name
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

  if (req.method === "POST") {
    try {
      const { phoneNumberId, accessToken, name = "New Bot" } = req.body;
      if (!phoneNumberId || !accessToken) {
        return res.status(400).json({ error: "Missing fields" });
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

      // ✅ Always insert bot properly
      const newBot = await addBot({
        client_id: client.id,
        name,
        access_token: accessToken,
        config: {},
      });

      return res.status(201).json(newBot);
    } catch (err) {
      console.error("🔥 Failed to create bot:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
