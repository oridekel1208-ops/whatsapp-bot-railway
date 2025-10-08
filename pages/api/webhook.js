// pages/api/webhook.js
import crypto from "crypto";
import {
  insertMessage,
  getClientByPhoneNumberId,
  markClientVerified,
  getBotByClientId,
} from "../../lib/db.js";
import { processIncomingMessage } from "../../lib/botLogic.js";

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

export default async function handler(req, res) {
  // ✅ GET Verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  // ✅ Only POST messages beyond this point
  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const raw = await getRawBody(req);
    const rawString = bufferToString(raw);

    // Optional: Verify Meta signature
    const signatureHeader = req.headers["x-hub-signature-256"];
    if (process.env.META_APP_SECRET && signatureHeader) {
      const hmac = crypto.createHmac("sha256", process.env.META_APP_SECRET);
      hmac.update(raw);
      const expected = "sha256=" + hmac.digest("hex");
      const valid = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signatureHeader)
      );
      if (!valid) {
        console.error("❌ Invalid signature");
        return res.status(401).send("Invalid signature");
      }
    }

    const body = JSON.parse(rawString);

    // ✅ Handle WhatsApp payload
    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const phoneId = value.metadata?.phone_number_id;
          if (!phoneId) continue;

          const client = await getClientByPhoneNumberId(phoneId);
          const client_id = client?.id || null;

          if (!client) {
            console.warn(`⚠️ No client found for phoneId ${phoneId}`);
            continue;
          }

          // Mark as verified if new
          if (!client.is_verified) {
            await markClientVerified(client.id, true);
            console.log(`✅ Client verified: ${client.name}`);
          }

          // Get the bot linked to this client
          const bot = await getBotByClientId(client_id);
          if (!bot) {
            console.warn(`⚠️ No bot found for client ${client.name}`);
            continue;
          }

          // ✅ Handle all incoming messages
          for (const m of value.messages || []) {
            const from = m.from;
            const text = m.text?.body || null;

            // Save inbound
            await insertMessage({
              client_id,
              whatsapp_id: m.id,
              from_number: from,
              to_number: phoneId,
              direction: "inbound",
              body: text,
              provider_payload: m,
            });

            // Generate reply using bot logic
            let reply = "Thanks for your message.";
            try {
              reply = await processIncomingMessage({
                client,
                bot,
                phoneId,
                from,
                text,
              });
            } catch (logicErr) {
              console.error("❌ Bot logic failed:", logicErr);
            }

            // ✅ Send reply back via WhatsApp
            const accessToken = client?.access_token || bot?.access_token;
            if (!accessToken) {
              console.error(`❌ Missing access token for ${client.name}`);
              continue;
            }

            try {
              const sendResp = await fetch(
                `https://graph.facebook.com/${process.env.META_API_VERSION || "v17.0"}/${phoneId}/messages`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
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
              if (!sendResp.ok) {
                console.error("❌ WhatsApp API error:", sendData);
              } else {
                console.log(`✅ Reply sent to ${from}: ${reply}`);
              }

              // Save outbound message
              await insertMessage({
                client_id,
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
