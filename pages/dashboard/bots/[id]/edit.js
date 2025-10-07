import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EditBot() {
  const router = useRouter();
  const { id } = router.query;
  const [bot, setBot] = useState(null);
  const [flows, setFlows] = useState([]);
  const [welcome, setWelcome] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bots/${id}`)
      .then(r => r.json())
      .then(data => {
        setBot(data);
        setFlows(data.config?.flows || []);
        setWelcome(data.config?.welcome_message || '');
      });
  }, [id]);

  const addFlow = () => {
    setFlows([...flows, { question: '', answers: [{ text: '', reply: '' }] }]);
  };

  const addAnswer = (flowIndex) => {
    const newFlows = [...flows];
    newFlows[flowIndex].answers.push({ text: '', reply: '' });
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

  const saveConfig = async () => {
    const res = await fetch(`/api/bots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ welcome_message: welcome, flows })
    });
    if (res.ok) alert('Bot saved!');
    else alert('Save failed');
  };

  if (!bot) return <p>Loading...</p>;

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Edit Bot {bot.phone_number_id}</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Welcome Message:</label>
        <input value={welcome} onChange={e => setWelcome(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
      </div>

      <h2>Flows</h2>
      {flows.map((flow, fi) => (
        <div key={fi} style={{ border: '1px solid #e6eef8', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <input
            placeholder="Question"
            value={flow.question}
            onChange={e => handleFlowChange(fi, 'question', e.target.value)}
            style={{ width: '100%', padding: 6, marginBottom: 8 }}
          />
          {flow.answers.map((ans, ai) => (
            <div key={ai} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                placeholder="Answer text (option)"
                value={ans.text}
                onChange={e => handleAnswerChange(fi, ai, 'text', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
              <input
                placeholder="Reply (leave empty for open reply)"
                value={ans.reply}
                onChange={e => handleAnswerChange(fi, ai, 'reply', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
            </div>
          ))}
          <button onClick={() => addAnswer(fi)} style={{ padding: 6, marginTop: 4 }}>Add Answer</button>
        </div>
      ))}

      <button onClick={addFlow} style={{ padding: 8, marginBottom: 12 }}>Add Question</button>
      <br />
      <button onClick={saveConfig} style={{ padding: 8, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>Save Bot</button>
    </div>
  );
}
