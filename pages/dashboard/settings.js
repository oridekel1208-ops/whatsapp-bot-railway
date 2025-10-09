// pages/dashboard/settings.js
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newToken, setNewToken] = useState("");

  useEffect(() => {
    async function fetchBots() {
      try {
        const res = await fetch("/api/bots");
        const data = await res.json();
        setBots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBots();
  }, []);

  const handleEditClick = (bot) => {
    setEditingId(bot.id);
    setNewToken(bot.access_token);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/bots/${editingId}/update-token`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: newToken }),
      });

      if (!res.ok) throw new Error("Failed to update token");

      setBots((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, access_token: newToken } : b))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update token");
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <div style={{ padding: 32, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>
      <p>Manage your bot tokens and connection settings below.</p>

      {bots.length === 0 ? (
        <div style={{ marginTop: 16, color: "#64748b" }}>
          No bots found. Create one in the Bots section.
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {bots.map((bot) => (
            <div
              key={bot.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#f8fafc",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{bot.name}</strong>
                {editingId !== bot.id && (
                  <div style={{ color: "#475569", fontSize: 14 }}>Token: {bot.access_token}</div>
                )}
              </div>

              {editingId === bot.id ? (
                <>
                  <input
                    type="text"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #cbd5e1" }}
                  />
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "6px 12px",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: "6px 12px",
                      background: "#f87171",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEditClick(bot)}
                  style={{
                    padding: "6px 12px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Edit Token
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
