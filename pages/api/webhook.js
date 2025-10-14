// pages/api/webhook.js
import { getClientByPhoneNumberId, getBotByClientId, insertMessage } from "../../lib/db";

export default async function handler(req, res) {
  try {
    // ---------------------------
    // ✅ Verification (GET)
    // ---------------------------
    if (req.method === "GET") {
      const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified!");
        return res.status(200).send(challenge);
      } else {
        console.log("Webhook verification failed");
        return res.status(403).end();
      }
    }

    // ---------------------------
    // ✅ Incoming webhook (POST)
    // ---------------------------
    if (req.method === "POST") {
      const body = req.body;
      console.log("📩 Incoming Webhook:", JSON.stringify(body, null, 2));

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];

      if (!changes) {
        console.log("⚠️ No changes found in webhook body");
        return res.status(200).end();
      }

      const value = changes.value;

      // Handle messages
      const message = value?.messages?.[0];

      if (message) {
        const fromNumber = message.from;
        const toNumber = value?.metadata?.phone_number_id;
        const whatsappId = message.id;
        const bodyText = message.text?.body || null;

        console.log(`💬 New message from ${fromNumber}: ${bodyText || "[No text]"}`);

        // Find client
        const client = await getClientByPhoneNumberId(toNumber);
        if (!client) {
          console.log(`❌ No client found for phone_number_id ${toNumber}`);
          return res.status(200).end();
        }

        // Find bot for this client
        const bot = await getBotByClientId(client.id);
        if (!bot) {
          console.log(`❌ No bot found for client ${client.id}`);
          return res.status(200).end();
        }

        // Insert message in DB
        await insertMessage({
          client_id: client.id,
          whatsapp_id: whatsappId,
          from_number: fromNumber,
          to_number: toNumber,
          direction: "inbound",
          body: bodyText,
          provider_payload: message,
        });

        console.log(`✅ Message logged for bot ${bot.id}`);
      } else {
        console.log("⚠️ No message content (probably a status update)");
      }

      // Always respond 200 to Meta
      return res.status(200).end();
    }

    // Method not allowed
    return res.status(405).end();
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).end();
  }
}
