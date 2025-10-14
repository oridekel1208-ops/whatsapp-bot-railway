import { useState } from "react";
import { useRouter } from "next/router";

export default function AddBot() {
  const router = useRouter();
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!phoneNumberId || !accessToken || !customMessage) {
      alert("Please fill all fields");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}?fields=verified_name&access_token=${accessToken}`
      );
      const data = await res.json();

      if (data.error) {
        alert("❌ Invalid token or phone ID: " + data.error.message);
      } else {
        const botsFilePath = "/data/bots.json";

        // Add new bot
        const newBot = {
          id: Date.now(),
          phoneNumberId,
          accessToken,
          customMessage,
          createdAt: new Date().toISOString(),
        };

        // Save to file using API route or fs (depends on setup)
        await fetch("/api/bots/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBot),
        });

        alert("✅ Bot verified and saved!");
        router.push("/dashboard/bots");
      }
    } catch (err) {
      alert("Failed to verify: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Add New WhatsApp Bot</h1>

      <label>Phone Number ID</label>
      <input value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} />

      <label>Access Token</label>
      <input value={accessToken} onChange={e => setAccessToken(e.target.value)} />

      <label>Custom Welcome Message</label>
      <input value={customMessage} onChange={e => setCustomMessage(e.target.value)} />

      <button onClick={handleVerify} disabled={verifying}>
        {verifying ? "Verifying..." : "Verify & Save"}
      </button>
    </div>
  );
}
