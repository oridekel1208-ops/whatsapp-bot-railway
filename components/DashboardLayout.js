// components/DashboardLayout.js
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const nav = [
    { id: 'overview', label: 'Overview', href: '/dashboard' },
    { id: 'bots', label: 'Bots', href: '/dashboard/bots' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Left sidebar */}
      <aside style={{
        width: 240,
        borderRight: '1px solid #e6eef8',
        padding: '20px 16px',
        boxSizing: 'border-box',
        background: '#fff'
      }}>
        <div style={{ marginBottom: 28, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <strong style={{ color: '#0070f3', fontSize: 18 }}>WhatsApp Bot</strong>
        </div>

        <nav>
          {nav.map(item => {
            const active = router.pathname === item.href || (item.href === '/dashboard' && router.pathname === '/dashboard');
            return (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <Link href={item.href}>
                  <a style={{
                    display: 'block',
                    padding: '10px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: active ? '#0070f3' : '#0f172a',
                    background: active ? 'rgba(0,112,243,0.06)' : 'transparent',
                    fontWeight: active ? 600 : 500
                  }}>
                    {item.label}
                  </a>
                </Link>
              </div>
            );
          })}
        </nav>

        <div style={{ marginTop: 28, fontSize: 13, color: '#64748b' }}>
          <div style={{ marginBottom: 6 }}>Account</div>
          <div style={{ marginBottom: 6 }}>
            <button onClick={() => {
              localStorage.removeItem('client');
              router.push('/');
            }} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #eef2ff', background: '#fff', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main style={{ flex: 1, padding: 24, background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}
