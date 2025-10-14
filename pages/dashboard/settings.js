"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchBots = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bots");
      const data = await res.json();
      setBots(data || []);
    } catch (err) {
      console.error("Failed to fetch bots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleUpdateToken = async (botId, newToken) => {
    setUpdating((prev) => ({ ...prev, [botId]: true }));
    try {
      const res = await fetch(`/api/bots/${botId}/update-token`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: newToken }),
      });
      if (!res.ok) throw new Error("Failed to update token");
      const updated = await res.json();
      setBots((prev) => prev.map((b) => (b.id === botId ? { ...b, access_token: updated.access_token } : b)));
      alert("Token updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating token");
    } finally {
      setUpdating((prev) => ({ ...prev, [botId]: false }));
    }
  };

  if (loading) return <p>Loading bots...</p>;
  if (!bots.length) return <p>No bots found. Create one first.</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bot Settings</h1>
      <div className="space-y-4">
        {bots.map((bot) => (
          <div key={bot.id} className="p-4 border rounded shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-semibold">{bot.name}</p>
              <p className="text-sm text-gray-600">Client: {bot.client_name}</p>
              <p className="text-sm text-gray-600">Phone ID: {bot.phone_number_id}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                className="border px-2 py-1 rounded w-full sm:w-64"
                defaultValue={bot.access_token}
                onChange={(e) => (bot.access_token = e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={() => handleUpdateToken(bot.id, bot.access_token)}
                disabled={updating[bot.id]}
              >
                {updating[bot.id] ? "Updating..." : "Update Token"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
