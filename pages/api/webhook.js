// pages/api/webhook.js
import { json } from "body-parser";
import { getClientByPhoneNumberId, getBotByClientId, insertMessage, updateBotState } from "../../lib/db";

// Next.js API route
export const config = {
  api: {
    bodyParser: true, // Parse JSON automatically
  },
};

export default async function handler(req, res) {
  try {
    // ✅ Webhook verification (GET)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }

    // Only accept POST for incoming messages
    if (req.method !== "POST") return res.sendStatus(405);

    const body = req.body;
    console.log("📩 Incoming Webhook:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const phoneNumberId = value?.metadata?.phone_number_id;

    if (!phoneNumberId) {
      console.warn("⚠️ No phone number ID found in webhook");
      return res.status(200).send("No phone number ID");
    }

    // Get client based on phone number
    const client = await getClientByPhoneNumberId(phoneNumberId);
    if (!client) {
      console.warn(`⚠️ No client found for phone ${phoneNumberId}`);
      return res.status(200).send("No client");
    }

    // Get the bot associated with this client
    const bot = await getBotByClientId(client.id);
    if (!bot) {
      console.warn(`⚠️ No bot found for client ${client.id}`);
      return res.status(200).send("No bot configured for this client");
    }

    // Handle status updates
    if (value.statuses) {
      console.log("ℹ️ Status update received (not a message), skipping");
      return res.status(200).send("Status update ignored");
    }

    // Handle messages
    const messages = value.messages;
    if (!messages || messages.length === 0) {
      console.warn("⚠️ No message content (probably a status update)");
      return res.status(200).send("No message content");
    }

    for (const msg of messages) {
      const fromNumber = msg.from;
      const toNumber = msg.to;
      const bodyText = msg.text?.body || "";
      const whatsappId = msg.id;

      console.log(`💬 Message from ${fromNumber}:`, bodyText);

      // Insert message into DB
      await insertMessage({
        client_id: client.id,
        whatsapp_id: whatsappId,
        from_number: fromNumber,
        to_number: toNumber,
        direction: "inbound",
        body: bodyText,
        provider_payload: msg,
      });

      // Example: Update user state in bot config
      if (bodyText.trim()) {
        await updateBotState(bot.id, fromNumber, { lastMessage: bodyText, lastSeen: Date.now() });
      }

      // TODO: Here you can add auto-reply logic
      // Example placeholder:
      console.log(`ℹ️ Auto-reply placeholder for ${fromNumber}`);
    }

    return res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).send("Internal server error");
  }
}
