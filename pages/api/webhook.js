// pages/api/webhook.js
import { NextApiRequest, NextApiResponse } from "next";
import {
  getClientByPhoneNumberId,
  getBotByClientId,
  insertMessage,
} from "../../lib/db";

// Helper to safely get nested fields
function getNested(obj, path, defaultValue = undefined) {
  return path.reduce((acc, key) => (acc && acc[key] ? acc[key] : defaultValue), obj);
}

export default async function handler(req, res) {
  try {
    // ✅ Webhook verification (Meta sends GET for verification)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("Webhook verified successfully");
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    // Only accept POST for incoming messages
    if (req.method !== "POST") return res.sendStatus(405);

    const body = req.body;
    console.log("📩 Incoming Webhook:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    if (!entry) return res.status(400).send("No entry in webhook");

    const changes = entry.changes?.[0];
    if (!changes) return res.status(400).send("No changes in webhook");

    const value = changes.value;
    const metadata = value.metadata;
    const phoneNumberId = metadata.phone_number_id;

    // Find the server client by WhatsApp phone_number_id
    const client = await getClientByPhoneNumberId(phoneNumberId);
    if (!client) {
      console.error("❌ No client found for phone number", phoneNumberId);
      return res.sendStatus(404);
    }

    // Find the bot associated with this client
    const bot = await getBotByClientId(client.id);
    if (!bot) {
      console.error("❌ No bot found for client", client.id);
      return res.sendStatus(404);
    }

    // Handle status updates (sent, delivered, read)
    if (value.statuses?.length) {
      for (const status of value.statuses) {
        console.log(
          `⚡ Status update for bot ${bot.id} (client ${client.id}):`,
          status.status,
          "to user:",
          status.recipient_id
        );
      }
    }

    // Handle incoming messages
    if (value.messages?.length) {
      for (const message of value.messages) {
        const fromNumber = message.from; // User who sent the message
        const toNumber = message.to; // Bot/Server client
        const messageBody = getNested(message, ["text", "body"], null);

        if (!messageBody) {
          console.log("⚠️ No message content (probably media or unsupported type)");
          continue;
        }

        console.log(`💬 Message from ${fromNumber} to bot ${bot.id}:`, messageBody);

        // Log the message in DB
        await insertMessage({
          client_id: client.id,
          whatsapp_id: message.id,
          from_number: fromNumber,
          to_number: toNumber,
          direction: "incoming",
          body: messageBody,
          provider_payload: message,
        });

        // TODO: Add bot response logic here
        // Example: respond with a static message
        // await sendWhatsAppMessage(bot.access_token, fromNumber, "Thanks for your message!");
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).send("Internal server error");
  }
}
