// pages/dashboard/settings.js
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const [client, setClient] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored) { router.push('/login'); return; }
    const parsed = JSON.parse(stored);
    setClient(parsed);
    setName(parsed.name || '');
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    if (!client) return;
    setMessage('Saving...');
    try {
      const res = await fetch('/api/clients/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: client.phone_number_id, name })
      });
      const body = await res.json();
      if (res.ok) {
        setMessage('Saved');
        // update localStorage
        const updated = { ...client, name };
        localStorage.setItem('client', JSON.stringify(updated));
        setClient(updated);
      } else {
        setMessage(body.error || 'Save failed');
      }
    } catch (err) {
      setMessage(err.message || 'Save failed');
    }
  }

  if (!client) return (
    <DashboardLayout>
      <div>Loading settings...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <h1>Settings</h1>
      <form onSubmit={saveSettings} style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: 13, color: '#475569' }}>Bot / Account name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #eef2ff' }} />
        <button type="submit" style={{ padding: 10, borderRadius: 8, border: 'none', background: '#0070f3', color: '#fff' }}>Save</button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </DashboardLayout>
  );
}
