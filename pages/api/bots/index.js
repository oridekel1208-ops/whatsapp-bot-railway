// ✅ POST: Create a new bot
if (req.method === "POST") {
  try {
    let { phoneNumberId, accessToken, name = "New Bot" } = req.body;

    // ✔ If no token provided, use a placeholder instead of rejecting
    if (!accessToken) {
      console.warn("⚠ No access token provided, using placeholder 'DUMMY_TOKEN'");
      accessToken = "DUMMY_TOKEN";
    }

    // ❌ Skip Meta verification temporarily
    // ✅ Ensure client exists
    let client = await getClientByPhoneNumberId(phoneNumberId);
    if (!client) {
      client = await createClient({
        name: `Client ${phoneNumberId}`,
        phone_number_id: phoneNumberId,
        whatsapp_business_account_id: null,
        access_token: accessToken,
        verify_token: Math.random().toString(36).substring(2, 12),
      });
    }

    // ✅ Create bot linked to client
    const newBot = await addBot({
      client_id: client.id,
      name,
      access_token: accessToken,
      config: {},
    });

    console.log(`✅ Created bot for ${phoneNumberId}`);
    return res.status(201).json(newBot);
  } catch (err) {
    console.error("🔥 Failed to create bot:", err);
    return res.status(500).json({ error: err.message });
  }
}
