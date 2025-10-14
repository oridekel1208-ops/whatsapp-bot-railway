import crypto from "crypto";
import {
  insertMessage,
  getClientByPhoneNumberId,
  markClientVerified,
  getBotByClientId,
  updateBotState,
} from "../../lib/db.js";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function processMessage(bot, userNumber, text) {
  bot.userStates = bot.userStates || {};
  const state = bot.userStates[userNumber] || { currentStep: 0 };
  const flows = bot.config?.flows || [];
  const currentFlow = flows[state.currentStep];

  let reply = bot.config?.welcome_message || "Hello!";

  if (currentFlow) {
    if (currentFlow.answers?.length > 0) {
      const matched = currentFlow.answers.find(
        (a) => a.text?.toLowerCase() === text?.toLowerCase()
      );
      reply = matched?.reply || currentFlow.answers.find((a) => !a.reply)?.text || "Sorry, I didn't understand that.";
    } else {
      reply = currentFlow.question || reply;
    }
    state.currentStep = Math.min(state.currentStep + 1, flows.length - 1);
  }

  bot.userStates[userNumber] = state;
  await updateBotState(bot.id, userNumber, state);
  return reply;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
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
    const body = JSON.parse(raw.toString("utf8"));

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
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

            // Send message using bot token
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

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
