import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function BotsList() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [bots, setBots] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setClient(parsed);
    fetchBots(parsed.id);
  }, []);

  const fetchBots = async (clientId) => {
    const res = await fetch(`/api/bots?client_id=${clientId}`);
    if (res.ok) {
      const data = await res.json();
      setBots(data);
    }
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'Inter, Arial, sans-serif', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, padding: 20, borderRight: '1px solid #e6eef8' }}>
        <h3>Dashboard</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          <button onClick={() => router.push('/dashboard')}>Overview</button>
          <button style={{ fontWeight: 'bold' }}>Bots</button>
          <button onClick={() => router.push('/dashboard/settings')}>Settings</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>Your Bots</h1>
          <button
            onClick={() => router.push('/dashboard/bots/new')}
            style={{ padding: '8px 16px', borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Add Bot
          </button>
        </div>

        {bots.length === 0 ? (
          <p>No bots yet</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {bots.map(bot => (
              <div key={bot.id} style={{ border: '1px solid #e6eef8', padding: 16, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{bot.phone_number_id}</strong>
                  <div>Status: {bot.connected ? 'Connected ✅' : 'Not connected ❌'}</div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/bots/${bot.id}/edit`)}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
