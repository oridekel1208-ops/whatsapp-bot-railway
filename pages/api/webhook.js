// pages/api/webhook.js
const crypto = require("crypto");
const {
  insertMessage,
  getClientByPhoneNumberId,
  markClientVerified,
  getBotByClientId,
  updateBotState,
} = require("../../lib/db.js");

export const config = { runtime: "nodejs", api: { bodyParser: false } };

function bufferToString(buffer) {
  return buffer.toString("utf8");
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Simple bot reply logic
async function processMessage(bot, userNumber, text) {
  bot.userStates = bot.userStates || {};
  const state = bot.userStates[userNumber] || { currentStep: 0 };
  const flows = bot.config?.flows || [];
  const currentFlow = flows[state.currentStep];

  let reply = bot.config?.welcome_message || "Hello!";

  if (currentFlow) {
    if (currentFlow.answers && currentFlow.answers.length > 0) {
      const matched = currentFlow.answers.find(
        (a) => a.text && a.text.toLowerCase() === text?.toLowerCase()
      );
      if (matched) reply = matched.reply || "Got it!";
      else {
        const open = currentFlow.answers.find((a) => !a.reply);
        if (open) reply = open.text || "Thanks for your reply!";
        else reply = "Sorry, I didn't understand that.";
      }
    } else {
      reply = currentFlow.question || "Next question?";
    }
    state.currentStep = Math.min(state.currentStep + 1, flows.length - 1);
  }

  bot.userStates[userNumber] = state;
  await updateBotState(bot.id, userNumber, state);

  return reply;
}

export default async function handler(req, res) {
  // ------------------ GET Verification ------------------
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("✅ Webhook verified");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const raw = await getRawBody(req);
    const rawString = bufferToString(raw);

    // Optional signature verification
    const signatureHeader = req.headers["x-hub-signature-256"];
    if (process.env.META_APP_SECRET && signatureHeader) {
      const hmac = crypto.createHmac("sha256", process.env.META_APP_SECRET);
      hmac.update(raw);
      const expected = "sha256=" + hmac.digest("hex");
      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))) {
        return res.status(401).send("Invalid signature");
      }
    }

    const body = JSON.parse(rawString);

    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const phoneId = value.metadata?.phone_number_id;
          if (!phoneId) continue;

          const client = await getClientByPhoneNumberId(phoneId);
          if (!client) continue;

          if (!client.is_verified) {
            await markClientVerified(client.id, true);
            console.log(`✅ Client verified: ${client.name}`);
          }

          const bot = await getBotByClientId(client.id);
          if (!bot) continue;

          for (const m of value.messages || []) {
            const from = m.from;
            const text = m.text?.body || "";

            console.log(`📩 Incoming Message from ${from}: "${text}"`);

            // Save inbound
            await insertMessage({
              client_id: client.id,
              whatsapp_id: m.id,
              from_number: from,
              to_number: phoneId,
              direction: "inbound",
              body: text,
              provider_payload: m,
            });

            // Generate reply
            const reply = await processMessage(bot, from, text);

            // Send via WhatsApp using BOT access token
            try {
              const sendResp = await fetch(
                `https://graph.facebook.com/${process.env.META_API_VERSION || "v17.0"}/${phoneId}/messages`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${bot.access_token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: from,
                    type: "text",
                    text: { body: reply },
                  }),
                }
              );

              const sendData = await sendResp.json();
              if (!sendResp.ok) console.error("❌ WhatsApp API error:", sendData);

              console.log(`📤 Outgoing Message to ${from}: "${reply}"`);

              // Save outbound
              await insertMessage({
                client_id: client.id,
                whatsapp_id: sendData?.messages?.[0]?.id || null,
                from_number: phoneId,
                to_number: from,
                direction: "outbound",
                body: reply,
                provider_payload: sendData,
              });
            } catch (err) {
              console.error("❌ Failed to send reply:", err);
            }
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
