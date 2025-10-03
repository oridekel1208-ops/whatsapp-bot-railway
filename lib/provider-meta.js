// lib/provider-meta.js
// Small wrapper for sending text messages through Meta Cloud API.

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const API_VERSION = process.env.META_API_VERSION || 'v17.0';

if (!TOKEN || !PHONE_ID) {
  // do not throw here to allow some dev tasks, but warn loudly
  console.warn('WARNING: WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set in env');
}

async function sendText(to, text) {
  if (!TOKEN || !PHONE_ID) {
    throw new Error('WHATSAPP_TOKEN and WHATSAPP_PHONE_ID must be set');
  }
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error('Meta API error: ' + JSON.stringify(data));
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

module.exports = { sendText };
