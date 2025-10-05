import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AddBot() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored) {
      router.push('/login');
      return;
    }
    setClient(JSON.parse(stored));
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch('/api/bots/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneNumber, access_token: accessToken })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setConnected(true);
        setMessage('✅ Connection successful!');
      } else {
        setConnected(false);
        setMessage('❌ Connection failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setConnected(false);
      setMessage('❌ Connection error: ' + err.message);
    }
  };

  const createBot = async () => {
    if (!client) return;
    const res = await fetch('/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: client.id,
        phone_number_id: phoneNumber,
        access_token: accessToken
      })
    });
    if (res.ok) {
      router.push('/dashboard/bots');
    } else {
      const txt = await res.text();
      alert('Failed to create bot: ' + txt);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Add New Bot</h1>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400, gap: 12 }}>
        <input placeholder="Phone Number ID" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Access Token" value={accessToken} onChange={e => setAccessToken(e.target.value)} style={{ padding: 8 }} />
        <button onClick={testConnection} style={{ padding: 8, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Test Connection
        </button>
        {message && <p>{message}</p>}
        {connected && (
          <button onClick={createBot} style={{ padding: 8, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Create Bot
          </button>
        )}
      </div>
    </div>
  );
}
