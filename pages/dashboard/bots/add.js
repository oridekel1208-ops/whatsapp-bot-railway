import { useState } from "react";
import { useRouter } from "next/router";

export default function AddBot() {
  const router = useRouter();
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!phoneNumberId || !accessToken) {
      setStatus("Please fill both fields.");
      return;
    }

    setIsVerifying(true);
    setStatus("Verifying...");

    try {
      const res = await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}?access_token=${accessToken}`
      );

      if (res.ok) {
        setStatus("✅ Token verified successfully!");
      } else {
        const text = await res.text();
        setStatus(`❌ Verification failed: ${text}`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }

    setIsVerifying(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumberId || !accessToken) {
      setStatus("Please fill both fields.");
      return;
    }

    // ✅ Save bot data to your backend
    const res = await fetch("/api/bots/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumberId, accessToken }),
    });

    if (res.ok) {
      const bot = await res.json();
      // Save locally for demo purposes
      const bots = JSON.parse(localStorage.getItem("bots") || "[]");
      bots.push(bot);
      localStorage.setItem("bots", JSON.stringify(bots));

      setStatus("✅ Bot added successfully!");
      setTimeout(() => router.push("/dashboard/bots"), 1000);
    } else {
      const text = await res.text();
      setStatus(`❌ Failed to save: ${text}`);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Add New Bot</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Phone Number ID:
          <input
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="123456789012345"
            style={{ padding: 8, width: "100%" }}
          />
        </label>

        <label>
          Access Token:
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAG...XYZ"
            style={{ padding: 8, width: "100%" }}
          />
        </label>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          style={{
            padding: "10px 16px",
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {isVerifying ? "Verifying..." : "Verify Token"}
        </button>

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          Save Bot
        </button>
      </form>

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </div>
  );
}
