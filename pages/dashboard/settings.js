// pages/dashboard/settings.js
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then((data) => {
        setBots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTokenChange = (botId, token) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, access_token: token } : b))
    );
  };

  const saveToken = async (botId, token) => {
    const res = await fetch(`/api/bots/${botId}/update-token`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    });
    if (res.ok) alert("Token updated!");
    else alert("Failed to update token.");
  };

  if (loading) return <div style={{ padding: 32 }}>Loading bots...</div>;

  return (
    <div style={{ padding: 32, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Settings</h1>
      {bots.length === 0 ? (
        <p>No bots found. Create one in the Bots section.</p>
      ) : (
        bots.map((bot) => (
          <div
            key={bot.id}
            style={{
              border: "1px solid #e6eef8",
              padding: 16,
              marginBottom: 12,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <strong>{bot.name || "Bot #" + bot.id}</strong>
              <div>
                Phone ID: <code>{bot.phone_number_id}</code>
              </div>
            </div>
            <input
              type="text"
              value={bot.access_token || ""}
              placeholder="Access token"
              onChange={(e) => handleTokenChange(bot.id, e.target.value)}
              style={{ flex: 2, padding: 6 }}
            />
            <button
              onClick={() => saveToken(bot.id, bot.access_token)}
              style={{
                padding: "6px 12px",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        ))
      )}
    </div>
  );
}
