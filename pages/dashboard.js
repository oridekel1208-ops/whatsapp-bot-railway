// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [client, setClient] = useState(null);
  const [recipient, setRecipient] = useState('whatsapp:+');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setClient(parsed);
      fetchMessages(parsed);
    } catch {
      router.push('/login');
    }
  }, []);

  const fetchMessages = async (clientObj) => {
    // ask the API for recent messages, then filter by phone_number_id
    const res = await fetch('/api/messages');
    if (!res.ok) return;
    const data = await res.json();
    // messages include to/from and client_id if you stored it - we may also filter by phone_number_id
    const clientPhoneId = clientObj.phone_number_id || clientObj.phoneNumber || clientObj.phoneNumberId;
    const filtered = data.filter(m => (m.to_number === clientPhoneId || m.from_number === clientPhoneId || m.client_id === clientObj.id));
    setMessages(filtered);
  };

  const handleSend = async () => {
    if (!recipient || !message || !client) return;
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          body: message,
          client_phone_number_id: client.phone_number_id || client.phoneNumber || client.phoneNumberId
        })
      });
      if (res.ok) {
        setMessage('');
        fetchMessages(client);
      } else {
        const txt = await res.text();
        alert('Send failed: ' + txt);
      }
    } catch (err) {
      alert('Send error: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client');
    router.push('/');
  };

  if (!client) return <div style={{ padding: 32 }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>WhatsApp Bot Console</h2>
          <div style={{ color: '#6b7280' }}>{client.name || client.phone_number_id || client.phoneNumber}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={recipient} onChange={e => setRecipient(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }} placeholder="Recipient (whatsapp:+123...)" />
        <input value={message} onChange={e => setMessage(e.target.value)} style={{ flex: 2, padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }} placeholder="Type a message..." />
        <button onClick={handleSend} style={{ padding: '12px 16px', borderRadius: 8, background: '#0070f3', color: '#fff', border: 'none' }}>Send</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => fetchMessages(client)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8' }}>Refresh</button>
      </div>

      <div>
        {messages.length === 0 && <p>No messages yet</p>}
        {messages.map(m => (
          <div key={m.id} style={{ border: '1px solid #eef2ff', padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ marginBottom: 6 }}>
              <strong>{m.direction?.toUpperCase() || (m.from_number === client.phone_number_id ? 'OUTBOUND' : 'INBOUND')}</strong> • {m.body}
            </div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
