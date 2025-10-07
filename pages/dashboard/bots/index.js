// pages/dashboard/bots/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function BotsList() {
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bots");
    if (stored) setBots(JSON.parse(stored));
    setLoading(false);
  }, []);

  const handleAdd = () => router.push("/dashboard/bots/add");
  const handleEdit = (botId) => router.push(`/dashboard/bots/${botId}/edit`);
  const handleDelete = (botId) => {
    if (!confirm("Are you sure you want to delete this bot?")) return;
    const updated = bots.filter((b) => b.id !== botId);
    setBots(updated);
    localStorage.setItem("bots", JSON.stringify(updated));
  };

  if (loading) return <p style={{ padding: 32 }}>Loading bots...</p>;

  return (
    <div style={{ padding: 32, fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Your Bots</h1>
        <button
          onClick={handleAdd}
          style={{ background: "#0070f3", color: "#fff", padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}
        >
          + Add New Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <p>No bots yet. Click "Add New Bot" to create one.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {bots.map((bot) => (
            <div key={bot.id} style={{ border: "1px solid #e2e8f0", padding: 16, borderRadius: 8 }}>
              <h3>Bot #{bot.id}</h3>
              <p>Phone ID: {bot.phoneNumberId}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(bot.id)}>Edit</button>
                <button onClick={() => handleDelete(bot.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
