import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EditBot() {
  const router = useRouter();
  const { id } = router.query;
  const [bot, setBot] = useState(null);
  const [flows, setFlows] = useState([]);
  const [welcome, setWelcome] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem("bots");
    if (!stored) {
      alert("No bots found.");
      router.push("/dashboard/bots");
      return;
    }

    const bots = JSON.parse(stored);
    const foundBot = bots.find((b) => b.id === id || b.id.toString() === id.toString());

    if (!foundBot) {
      alert("Bot not found.");
      router.push("/dashboard/bots");
      return;
    }

    setBot(foundBot);
    setFlows(foundBot.flows || []);
    setWelcome(foundBot.welcome_message || "");
    setLoading(false);
  }, [id]);

  const addFlow = () => {
    setFlows([...flows, { question: "", answers: [{ text: "", reply: "" }] }]);
  };

  const addAnswer = (flowIndex) => {
    const newFlows = [...flows];
    newFlows[flowIndex].answers.push({ text: "", reply: "" });
    setFlows(newFlows);
  };

  const handleFlowChange = (flowIndex, key, value) => {
    const newFlows = [...flows];
    newFlows[flowIndex][key] = value;
    setFlows(newFlows);
  };

  const handleAnswerChange = (flowIndex, answerIndex, key, value) => {
    const newFlows = [...flows];
    newFlows[flowIndex].answers[answerIndex][key] = value;
    setFlows(newFlows);
  };

  const saveConfig = () => {
    const stored = JSON.parse(localStorage.getItem("bots")) || [];
    const updated = stored.map((b) =>
      b.id === bot.id
        ? { ...b, welcome_message: welcome, flows }
        : b
    );
    localStorage.setItem("bots", JSON.stringify(updated));
    alert("Bot saved!");
    router.push("/dashboard/bots");
  };

  if (loading) return <p style={{ padding: 32 }}>Loading bot...</p>;
  if (!bot) return <p style={{ padding: 32 }}>Bot not found.</p>;

  return (
    <div style={{ padding: 32, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Edit Bot #{bot.id}</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Welcome Message:</label>
        <input
          value={welcome}
          onChange={(e) => setWelcome(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 4,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        />
      </div>

      <h2>Conversation Flows</h2>
      {flows.map((flow, fi) => (
        <div
          key={fi}
          style={{
            border: "1px solid #e6eef8",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <input
            placeholder="Question"
            value={flow.question}
            onChange={(e) =>
              handleFlowChange(fi, "question", e.target.value)
            }
            style={{
              width: "100%",
              padding: 6,
              marginBottom: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
          {flow.answers.map((ans, ai) => (
            <div
              key={ai}
              style={{ display: "flex", gap: 8, marginBottom: 6 }}
            >
              <input
                placeholder="Answer text (option)"
                value={ans.text}
                onChange={(e) =>
                  handleAnswerChange(fi, ai, "text", e.target.value)
                }
                style={{ flex: 1, padding: 6 }}
              />
              <input
                placeholder="Reply (leave empty for open reply)"
                value={ans.reply}
                onChange={(e) =>
                  handleAnswerChange(fi, ai, "reply", e.target.value)
                }
                style={{ flex: 1, padding: 6 }}
              />
            </div>
          ))}
          <button
            onClick={() => addAnswer(fi)}
            style={{
              padding: 6,
              marginTop: 4,
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            + Add Answer
          </button>
        </div>
      ))}

      <button
        onClick={addFlow}
        style={{
          padding: 8,
          background: "#e2e8f0",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        + Add Question
      </button>
      <br />
      <button
        onClick={saveConfig}
        style={{
          padding: 10,
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        💾 Save Bot
      </button>
    </div>
  );
}
