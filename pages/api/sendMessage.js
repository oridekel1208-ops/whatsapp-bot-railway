export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { phone_number_id, access_token, to, message } = req.body;

  if (!phone_number_id || !access_token || !to || !message)
    return res.status(400).json({ error: "Missing parameters" });

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw data.error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
}
