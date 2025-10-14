import crypto from "crypto";
import { getClientByPhoneNumberId, insertMessage, getBotById, updateBotAccessToken } from "../../lib/db.js";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function processMessage(bot, userNumber, text) {
  bot.userStates = bot.userStates || {};
  const state = bot.userStates[userNumber] || { currentStep: 0 };
  const reply = bot.config?.welcome_message || "Hello!";
  bot.userStates[userNumber] = state;
  return reply;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).send("Verification failed");
  }

  if (req.method !== "POST") return res.status(405).end();

  const raw = await getRawBody(req);
  const body = JSON.parse(raw.toString("utf8"));

  if (body.object === "whatsapp_business_account" && body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const phoneId = value.metadata?.phone_number_id;
        if (!phoneId) continue;

        const client = await getClientByPhoneNumberId(phoneId);
        if (!client) continue;

        const bot = await getBotById(client.id);
        if (!bot) continue;

        for (const m of value.messages || []) {
          const from = m.from;
          const text = m.text?.body || "";

          await insertMessage({
            client_id: client.id,
            whatsapp_id: m.id,
            from_number: from,
            to_number: phoneId,
            direction: "inbound",
            body: text,
            provider_payload: m
          });

          const reply = await processMessage(bot, from, text);

          // Send via WhatsApp using bot's own token
          try {
            const sendResp = await fetch(
              `https://graph.facebook.com/v17.0/${phoneId}/messages`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${bot.access_token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ messaging_product: "whatsapp", to: from, type: "text", text: { body: reply } })
              }
            );
            const sendData = await sendResp.json();
            await insertMessage({
              client_id: client.id,
              whatsapp_id: sendData?.messages?.[0]?.id || null,
              from_number: phoneId,
              to_number: from,
              direction: "outbound",
              body: reply,
              provider_payload: sendData
            });
          } catch (err) {
            console.error("Failed to send reply:", err);
          }
        }
      }
    }
  }

  return res.status(200).json({ ok: true });
}
