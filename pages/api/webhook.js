// pages/api/webhook.js

import { getClientByPhoneNumberId, getBotByClientId, insertMessage } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // ✅ Webhook Verification
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mytoken";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      return res.status(200).send(challenge);
    } else {
      console.warn("❌ Webhook verification failed");
      return res.sendStatus(403);
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body;

      console.log("📩 Incoming Webhook:", JSON.stringify(body, null, 2));

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (!message) {
        console.log("⚠️ No message content");
        return res.sendStatus(200);
      }

      const phone_number_id = changes?.value?.metadata?.phone_number_id;
      const from = message.from;
      const textBody = message.text?.body || "";

      console.log(`📨 Message from ${from}: ${textBody}`);

      // ✅ Load client
      const client = await getClientByPhoneNumberId(phone_number_id);
      if (!client) {
        console.warn("⚠️ No client found for phone_number_id:", phone_number_id);
        return res.sendStatus(200);
      }

      // ✅ Load linked bot
      const bot = await getBotByClientId(client.id);
      if (!bot) {
        console.warn("⚠️ No bot found for client_id:", client.id);
        return res.sendStatus(200);
      }

      // ✅ Save to DB (messages)
      await insertMessage({
        client_id: client.id,
        whatsapp_id: message.id,
        from_number: from,
        to_number: phone_number_id,
        direction: "inbound",
        body: textBody,
        provider_payload: body
      });

      // ✅ Get bot reply (from config.reply_text or fallback)
      const botResponse = bot.config?.reply_text || "Thanks for your message!";

      // ✅ Respond via WhatsApp API
      await fetch(`https://graph.facebook.com/v20.0/${phone_number_id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bot.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: botResponse },
        })
      });

      console.log("✅ Reply sent:", botResponse);
      res.sendStatus(200);
    } catch (error) {
      console.error("❌ Webhook error:", error);
      res.sendStatus(500);
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}
