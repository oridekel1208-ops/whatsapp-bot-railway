// pages/api/webhook.js
import { getAllBots } from "../../utils/botsStore";

export const config = {
  api: {
    bodyParser: true, // Next.js built-in parser
  },
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Verification
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  if (req.method === "POST") {
    const body = req.body;
    console.log("📩 Incoming Webhook:", JSON.stringify(body, null, 2));

    if (body.object !== "whatsapp_business_account") {
      return res.status(400).send("Not a WhatsApp event");
    }

    try {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          const phoneNumberId = value?.metadata?.phone_number_id;
          const messages = value?.messages || [];

          if (messages.length === 0) {
            console.log("⚠️ No message content (status update?)");
            continue;
          }

          for (const msg of messages) {
            const fromNumber = msg.from;
            const bot = getAllBots().find(b => b.phoneNumberId === phoneNumberId);

            if (!bot) {
              console.log(`❌ No bot found for phone number ID ${phoneNumberId}`);
              continue;
            }

            // Respond with the custom bot message
            const replyText = bot.customMessage || "Welcome!";
            console.log(`💬 Sending to ${fromNumber}: ${replyText}`);

            // Here you would call WhatsApp API to send:
            // await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
            //   method: "POST",
            //   headers: { Authorization: `Bearer ${bot.accessToken}`, "Content-Type": "application/json" },
            //   body: JSON.stringify({ messaging_product: "whatsapp", to: fromNumber, text: { body: replyText } })
            // });
          }
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
      console.error("❌ Webhook error:", err);
      return res.status(500).send("Internal error");
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
