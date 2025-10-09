// pages/dashboard/settings.js
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch bots on mount
  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBots(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bots:", err);
        setLoading(false);
      });
  }, []);

  async function updateToken(botId, newToken) {
    setSaving(botId);
    setMessage(null);
    try {
      const res = await fetch(`/api/bots/${botId}/update-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: newToken }),
      });
      const result = await res.json();

      if (res.ok) {
        setBots((prev) =>
          prev.map((b) => (b.id === botId ? { ...b, access_token: newToken } : b))
        );
        setMessage({ type: "success", text: "✅ Token updated successfully" });
      } else {
        setMessage({ type: "error", text: `❌ ${result.error || "Update failed"}` });
      }
    } catch (err) {
      console.error("Error updating token:", err);
      setMessage({ type: "error", text: "🔥 Network or server error" });
    }
    setSaving(null);
  }

  if (loading) return <div className="p-6 text-gray-600">Loading bots...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {message && (
        <div
          className={`p-3 mb-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {bots.length === 0 ? (
        <div className="text-gray-500">No bots found. Create one first.</div>
      ) : (
        <div className="space-y-6">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium">
                  {bot.name || "Unnamed Bot"}
                </h2>
                <span className="text-sm text-gray-500">
                  ID: {bot.id}
                </span>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">
                  Access Token
                </label>
                <input
                  type="text"
                  defaultValue={bot.access_token}
                  onChange={(e) =>
                    setBots((prev) =>
                      prev.map((b) =>
                        b.id === bot.id
                          ? { ...b, access_token: e.target.value }
                          : b
                      )
                    )
                  }
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
                />
              </div>

              <button
                onClick={() => updateToken(bot.id, bot.access_token)}
                disabled={saving === bot.id}
                className={`px-4 py-2 rounded-md text-white ${
                  saving === bot.id
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving === bot.id ? "Saving..." : "Save Token"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
