// pages/dashboard/bots/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function BotsDashboard() {
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load bots from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bots");
    if (stored) {
      setBots(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Navigate to Add Bot page
  const handleAdd = () => {
    router.push("/dashboard/bots/add");
  };

  // Navigate to Edit Bot page
  const handleEdit = (botId) => {
    router.push(`/dashboard/bots/${botId}/edit`);
  };

  // Delete a bot
  const handleDelete = (botId) => {
    if (!confirm("Are you sure you want to delete this bot?")) return;

    const updated = bots.filter((b) => b.id !== botId);
    setBots(updated);
    localStorage.setItem("bots", JSON.stringify(updated));
  };

  if (loading) return <div style={{ padding: 32 }}>Loading bots...</div>;

  return (
    <div style={{ display: "flex", fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#f8fafc",
          borderRight: "1px solid #e5e7eb",
          height: "100vh",
          padding: "20px 16px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginBottom: 24, fontSize: 18 }}>Dashboard</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={navButtonStyle}
          >
            Overview
          </button>
          <button
            onClick={() => router.push("/dashboard/bots")}
            style={{ ...navButtonStyle, background: "#e0f2fe" }}
          >
            Bots
          </button>
          <button
            onClick={() => router.push("/dashboard/settings")}
            style={navButtonStyle}
          >
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0 }}>Your Bots</h1>
          <button
            onClick={handleAdd}
            style={{
              background: "#0070f3",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            + Add New Bot
          </button>
        </div>

        {bots.length === 0 ? (
          <div
            style={{
              background: "#f9fafb",
              padding: 24,
              borderRadius: 8,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No bots yet. Click <strong>“+ Add New Bot”</strong> to create one.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 16,
            }}
          >
            {bots.map((bot) => (
              <div
                key={bot.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3 style={{ marginBottom: 6 }}>
                    Bot #{bot.id.toString().slice(-5)}
                  </h3>
                  <p style={{ fontSize: 14, color: "#475569" }}>
                    📱 Phone ID: {bot.phoneNumberId || bot.phone_number_id}
                  </p>
                  <p style={{ fontSize: 14, color: "#94a3b8" }}>
                    Created: {new Date(bot.createdAt).toLocaleString()}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={() => handleEdit(bot.id)}
                    style={{
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bot.id)}
                    style={{
                      border: "1px solid #fee2e2",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const navButtonStyle = {
  background: "none",
  border: "none",
  textAlign: "left",
  padding: "8px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 15,
};
