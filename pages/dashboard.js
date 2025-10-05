import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [recipient, setRecipient] = useState('whatsapp:+');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const user = cookies.find(c => c.startsWith('user='));
    if (!user) router.push('/');
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await fetch('/api/messages');
    if (res.ok) setMessages(await res.json());
  };

  const handleSend = async () => {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipient, body: message })
    });
    if (res.ok) {
      setMessage('');
      fetchMessages();
    }
  };

  const handleLogout = () => {
    document.cookie = 'user=; Path=/; Max-Age=0';
    router.push('/');
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>WhatsApp Bot Console</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="Recipient (whatsapp:+123456789)"
          style={{ flex: 1, padding: 8 }}
        />
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <button onClick={fetchMessages} style={{ marginBottom: 16 }}>Refresh</button>

      <div>
        {messages.length === 0 && <p>No messages yet</p>}
        {messages.map(m => (
          <div key={m.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
            <p><strong>{m.direction}</strong>: {m.body}</p>
            <p style={{ color: '#666', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
