// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [to, setTo] = useState('whatsapp:+'); // fill with e.g. whatsapp:+9725...
  const [loading, setLoading] = useState(false);

  async function loadMessages() {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadMessages();
    // simple polling every 3s for new messages (replace with SSE/WS if desired)
    const id = setInterval(loadMessages, 3000);
    return () => clearInterval(id);
  }, []);

  async function sendMessage() {
    if (!to || !text) return;
    setLoading(true);
    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text })
      });
      setText('');
      await loadMessages();
    } catch (err) {
      console.error(err);
      alert('Failed to send message. See console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>WhatsApp Bot Console (Railway)</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Recipient (include whatsapp: prefix): </label>
        <input style={{ width: 400 }} value={to} onChange={(e) => setTo(e.target.value)} placeholder="whatsapp:+1234567890" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          style={{ flex: 1 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading || !text}>
          {loading ? 'Sending…' : 'Send'}
        </button>
        <button onClick={loadMessages}>Refresh</button>
      </div>

      <div style={{ border: '1px solid #ddd', padding: 12, height: 480, overflow: 'auto', background: '#fafafa' }}>
        {messages.length === 0 ? <div>No messages yet</div> : messages.map((m) => (
          <div key={m.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(m.created_at).toLocaleString()}</div>
            <div><strong>{m.direction === 'inbound' ? m.from_number : 'BOT'}</strong></div>
            <div style={{ marginTop: 6 }}>{m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
