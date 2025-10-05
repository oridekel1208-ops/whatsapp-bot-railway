import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [client, setClient] = useState(null);
  const [recipient, setRecipient] = useState('whatsapp:+');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const storedClient = JSON.parse(localStorage.getItem('client'));
    if (!storedClient) {
      router.push('/login');
    } else {
      setClient(storedClient);
      fetchMessages(storedClient.id);
    }
  }, []);

  // Fetch messages only for this client
  const fetchMessages = async (clientId) => {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const allMessages = await res.json();
      const clientMessages = allMessages.filter(m => m.client_id === clientId);
      setMessages(clientMessages);
    }
  };

  const handleSend = async () => {
    if (!recipient || !message) return;
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipient, body: message, client_id: client.id })
    });
    if (res.ok) {
      setMessage('');
      fetchMessages(client.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client');
    router.push('/');
  };

  if (!client) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>WhatsApp Bot Console</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Send Message Section */}
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
          style={{ flex: 2, padding: 8 }}
        />
        <button onClick={handleSend} style={{ padding: '8px 16px', cursor: 'pointer' }}>Send</button>
      </div>

      <button onClick={() => fetchMessages(client.id)} style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}>
        Refresh
      </button>

      {/* Messages List */}
      <div>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{ border: '1px solid #ccc', padding: 12, borderRadius: 4, marginBottom: 8 }}>
              <p>
                <strong>{m.direction.toUpperCase()}</strong>: {m.body}
              </p>
              <p style={{ color: '#666', fontSize: 12 }}>
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
