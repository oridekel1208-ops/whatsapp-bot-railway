import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchBots() {
      try {
        const res = await fetch("/api/bots");
        const data = await res.json();
        setBots(data.bots || []);
      } catch (err) {
        console.error("Failed to fetch bots:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBots();
  }, []);

  const handleTokenChange = (id, value) => {
    setBots((prev) =>
      prev.map((b) => (b.id === id ? { ...b, access_token: value } : b))
    );
  };

  const handleSave = async (id) => {
    const bot = bots.find((b) => b.id === id);
    if (!bot) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/bots/${id}/update-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: bot.access_token }),
      });

      if (!res.ok) throw new Error("Failed to update token");

      setMessage(`✅ Token updated successfully for ${bot.name}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update token.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading settings...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage your bot tokens and connection settings below.
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700">
          {message}
        </div>
      )}

      {bots.length === 0 ? (
        <p>No bots found. Create one in the Bots section.</p>
      ) : (
        <div className="space-y-6">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white shadow rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">{bot.name}</h2>
                <button
                  onClick={() => handleSave(bot.id)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-md text-white ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              <label className="block text-sm text-gray-600 mb-1">
                Permanent WhatsApp Access Token
              </label>
              <input
                type="text"
                value={bot.access_token || ""}
                onChange={(e) => handleTokenChange(bot.id, e.target.value)}
                placeholder="Enter permanent token..."
                className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
