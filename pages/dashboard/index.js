// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardOverview() {
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
    const res = await fetch('/api/messages');
    if (!res.ok) return;
    const data = await res.json();
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

  if (!client) {
    return (
      <DashboardLayout>
        <div>Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: 8 }}>Overview</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Send and view messages linked to your WhatsApp bot</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={recipient} onChange={e => setRecipient(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }} placeholder="Recipient (whatsapp:+123...)" />
        <input value={message} onChange={e => setMessage(e.target.value)} style={{ flex: 2, padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }} placeholder="Type a message..." />
        <button onClick={handleSend} style={{ padding: '12px 16px', borderRadius: 8, background: '#0070f3', color: '#fff', border: 'none' }}>Send</button>
      </div>

      <button onClick={() => fetchMessages(client)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', marginBottom: 16 }}>Refresh</button>

      <div>
        {messages.length === 0 && <p>No messages yet</p>}
        {messages.map(m => (
          <div key={m.id} style={{ border: '1px solid #eef2ff', padding: 12, borderRadius: 8, marginBottom: 10, background: '#fff' }}>
            <div style={{ marginBottom: 6 }}>
              <strong>{m.direction?.toUpperCase() || (m.from_number === client.phone_number_id ? 'OUTBOUND' : 'INBOUND')}</strong> • {m.body}
            </div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
