// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardOverview() {
  const [client, setClient] = useState(null);
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
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return;
      const data = await res.json();
      const clientPhoneId = clientObj.phone_number_id || clientObj.phoneNumber;
      const filtered = data.filter(m => (m.client_id === clientObj.id) || (m.to_number === clientPhoneId) || (m.from_number === clientPhoneId));
      setMessages(filtered);
    } catch (err) {
      console.error('fetch messages', err);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>{client.name || client.phone_number_id}</h1>
          <div style={{ color: '#64748b' }}>{client.is_verified ? 'Verified' : 'Not verified'}</div>
        </div>
        <div>
          <button onClick={() => fetchMessages(client)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6eef8', background: '#fff', cursor: 'pointer' }}>
            Refresh messages
          </button>
        </div>
      </div>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 12 }}>Recent messages</h2>
        {messages.length === 0 ? (
          <div style={{ padding: 20, borderRadius: 8, background: '#fff', border: '1px solid #eef2ff' }}>No messages yet</div>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{ border: '1px solid #eef2ff', padding: 12, borderRadius: 8, background: '#fff', marginBottom: 10 }}>
              <div style={{ marginBottom: 6 }}>
                <strong>{(m.direction || (m.from_number === client.phone_number_id ? 'outbound' : 'inbound')).toUpperCase()}</strong> • {m.body}
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </section>
    </DashboardLayout>
  );
}
