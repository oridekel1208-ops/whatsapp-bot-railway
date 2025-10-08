// pages/dashboard/bots/add.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function AddBot() {
  const router = useRouter();
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!phoneNumberId || !accessToken) {
      alert("Please enter both fields");
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
        const stored = JSON.parse(localStorage.getItem("bots") || "[]");
        const newBot = {
          id: Date.now(),
          phoneNumberId,
          accessToken,
          createdAt: new Date().toISOString(),
        };
        stored.push(newBot);
        localStorage.setItem("bots", JSON.stringify(stored));
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
    <div style={{ padding: 40, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Add New WhatsApp Bot</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>
        Get your <strong>Phone Number ID</strong> and <strong>Access Token</strong> from
        <br />
        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noreferrer"
        >
          https://developers.facebook.com/apps
        </a>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
        <label>Phone Number ID</label>
        <input
          type="text"
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          style={inputStyle}
        />

        <label>Access Token</label>
        <input
          type="text"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            background: "#0070f3",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {verifying ? "Verifying..." : "Verify & Save"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid #e2e8f0",
  padding: "8px 10px",
  borderRadius: 6,
  fontSize: 15,
};
