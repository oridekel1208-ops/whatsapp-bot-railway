import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [bots, setBots] = useState([]);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState("");

  // ✅ Load bots
  useEffect(() => {
    fetch("/api/bots")
      .then((res) => res.json())
      .then(setBots)
      .catch(console.error);
  }, []);

  // ✅ Create bot
  const handleCreateBot = async () => {
    const res = await fetch("/api/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumberId, accessToken, name }),
    });

    if (res.ok) {
      const newBot = await res.json();
      setBots([newBot, ...bots]); // update UI instantly
    } else {
      alert("Failed to create bot");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bot Settings</h1>

      <h2>Create Bot</h2>
      <input placeholder="Phone Number ID" onChange={(e) => setPhoneNumberId(e.target.value)} />
      <input placeholder="Access Token (optional)" onChange={(e) => setAccessToken(e.target.value)} />
      <input placeholder="Bot Name (optional)" onChange={(e) => setName(e.target.value)} />
      <button onClick={handleCreateBot}>Create</button>

      <h2>Existing Bots</h2>
      {bots.length === 0 ? (
        <p>No bots found.</p>
      ) : (
        <ul>
          {bots.map((bot) => (
            <li key={bot.id}>
              <strong>{bot.name}</strong> — {bot.phone_number_id} — Token: {bot.access_token}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
