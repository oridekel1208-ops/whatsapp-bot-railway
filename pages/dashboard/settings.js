// pages/dashboard/settings.js
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/user/token");
        if (!res.ok) throw new Error("Failed to fetch token");
        const data = await res.json();
        setToken(data.token || "");
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Could not load your token.");
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/user/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) setMessage("✅ Token updated successfully!");
      else setMessage("❌ Failed to update token: " + (data.error || ""));
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating token.");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Permanent Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter your WhatsApp permanent token"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}
