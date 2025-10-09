// pages/api/user/token.js
import { getClientById, updateClientToken } from "../../../lib/db.js";

export default async function handler(req, res) {
  const userId = req.query.userId || req.headers["x-user-id"] || 1; // replace with real auth
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const client = await getClientById(userId);
      return res.status(200).json({ token: client?.access_token || "" });
    }

    if (req.method === "POST") {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: "Missing token" });
      const updated = await updateClientToken(userId, token);
      return res.status(200).json({ ok: true, token: updated.access_token });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Token API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
