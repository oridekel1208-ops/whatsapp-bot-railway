// ./pages/api/webhook.js

// ✅ Disable Next.js automatic body parsing (we need raw body for WhatsApp)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    // ✅ Handle Webhook Verification (GET request from Meta)
    if (req.method === "GET") {
      const VERIFY_TOKEN = "YOUR_VERIFY_TOKEN"; // <-- change this

      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send("Verification failed");
      }
    }

    // ✅ Handle Incoming Webhook Messages (POST)
    if (req.method === "POST") {
      // Collect raw body data
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString("utf8");

      // Parse JSON
      const data = JSON.parse(rawBody);
      console.log("📩 Incoming WhatsApp Webhook:", JSON.stringify(data, null, 2));

      // ✅ Detect if it's a status update or message
      const entry = data.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message) {
        console.log("⚠️ No user message detected (probably status update)");
        return res.status(200).send("OK");
      }

      const from = message.from;
      const text = message.text?.body || "";

      console.log(`👤 Message from ${from}: "${text}"`);

      // TODO: Call your bot logic here

      return res.status(200).send("OK");
    }

    return res.status(405).send("Method Not Allowed");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).send("Server Error");
  }
}
