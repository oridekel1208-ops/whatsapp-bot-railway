// pages/dashboard/settings.js
import { useEffect, useState } from "react";

export default function Settings() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bots")
      .then(res => res.json())
      .then(data => {
        setBots(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleTokenChange = async (botId, newToken) => {
    try {
      const res = await fetch(`/api/bots/${botId}/update-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: newToken }),
      });
      if (!res.ok) throw new Error("Failed to update token");
      const updated = await res.json();
      setBots(bots.map(b => (b.id === updated.id ? updated : b)));
    } catch (err) {
      console.error(err);
      alert("Failed to update token");
    }
  };

  if (loading) return <div>Loading bots...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Settings</h1>
      {bots.length === 0 ? (
        <p>No bots found. Create one first.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Bot Name</th>
              <th>Client</th>
              <th>Phone Number ID</th>
              <th>Token</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bots.map(bot => (
              <tr key={bot.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{bot.bot_name}</td>
                <td>{bot.client_name}</td>
                <td>{bot.phone_number_id}</td>
                <td>
                  <input
                    type="text"
                    defaultValue={bot.access_token}
                    onBlur={e => handleTokenChange(bot.id, e.target.value)}
                    style={{ width: "100%" }}
                  />
                </td>
                <td>
                  <button
                    onClick={e =>
                      handleTokenChange(
                        bot.id,
                        e.target.previousSibling.value
                      )
                    }
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
