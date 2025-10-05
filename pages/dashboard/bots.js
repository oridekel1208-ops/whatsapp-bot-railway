// pages/dashboard/bots.js
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useRouter } from 'next/router';

export default function BotsPage() {
  const [client, setClient] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored) {
      router.push('/login'); return;
    }
    const parsed = JSON.parse(stored);
    setClient(parsed);

    // fetch latest client record from server (to get id, is_verified, etc)
    fetchClient(parsed);
  }, []);

  async function fetchClient(localClient) {
    try {
      const phone = localClient.phone_number_id || localClient.phoneNumber;
      if (!phone) return;
      const res = await fetch(`/api/clients/get?phone_number_id=${encodeURIComponent(phone)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.client) {
        setClient(data.client);
        setAccessToken(data.client.access_token || '');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveToken(e) {
    e.preventDefault();
    if (!client) return;
    setMessage('Saving...');
    try {
      const res = await fetch('/api/clients/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: client.phone_number_id, access_token: accessToken })
      });
      const txt = await res.json();
      if (res.ok) {
        setMessage('Saved successfully');
        fetchClient(client);
      } else {
        setMessage(txt.error || 'Save failed');
      }
    } catch (err) {
      setMessage(err.message || 'Save failed');
    }
  }

  if (!client) return (
    <DashboardLayout>
      <div>Loading bots...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: 6 }}>{client.name || client.phone_number_id}</h1>
      <div style={{ color: '#64748b', marginBottom: 16 }}>{client.is_verified ? 'Webhook verified' : 'Webhook not verified'}</div>

      <section style={{ marginBottom: 20 }}>
        <h3>Bot credentials</h3>
        <form onSubmit={saveToken} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={accessToken}
            onChange={e => setAccessToken(e.target.value)}
            placeholder="Paste WhatsApp access token"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #eef2ff' }}
          />
          <button style={{ padding: '10px 14px', borderRadius: 8, background: '#0070f3', color: '#fff', border: 'none' }}>Save</button>
        </form>
        {message && <div style={{ marginTop: 8 }}>{message}</div>}
      </section>

      <section>
        <h3>Webhook verification token</h3>
        <div style={{ padding: 12, borderRadius: 8, background: '#fff', border: '1px solid #eef2ff' }}>
          <div><strong>Verify token:</strong> {client.verify_token}</div>
          <div style={{ marginTop: 8, color: '#64748b' }}>
            Copy this token to the Meta webhook setup page to verify your callback URL.
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
