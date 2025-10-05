// pages/index.js
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const features = [
    { title: "Automated Replies", desc: "Respond instantly to customers 24/7" },
    { title: "Multi-Client", desc: "Manage multiple bots from one dashboard" },
    { title: "Analytics & Logs", desc: "Track message history & usage" },
    { title: "Easy Setup", desc: "Connect your WhatsApp Business number in minutes" },
  ];

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#0f172a' }}>
      <nav style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '1rem 2rem',
        borderBottom: '1px solid #e6eef8', position: 'sticky', top: 0, background: '#fff', zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontWeight: 700, color: '#0070f3', cursor: 'pointer' }} onClick={() => router.push('/')}>
            WhatsApp Bot
          </div>
          <a style={{ color: '#334155', textDecoration: 'none' }} href="#features">Features</a>
          <a style={{ color: '#334155', textDecoration: 'none' }} href="#pricing">Pricing</a>
          <a style={{ color: '#334155', textDecoration: 'none' }} href="#faq">FAQ</a>
        </div>

        <div>
          <button onClick={() => router.push('/login')} style={{ marginRight: 8, padding: '8px 14px', borderRadius: 6, border: '1px solid #e6eef8', background: '#fff', cursor: 'pointer' }}>
            Login
          </button>
          <button onClick={() => router.push('/signup')} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
            Get started
          </button>
        </div>
      </nav>

      <header style={{ textAlign: 'center', padding: '6rem 1rem', background: 'linear-gradient(180deg,#f7fbff, #fff)' }}>
        <h1 style={{ fontSize: '2.6rem', marginBottom: 12 }}>Launch your WhatsApp bot — fast</h1>
        <p style={{ maxWidth: 720, margin: '0 auto 24px', color: '#475569', fontSize: '1.05rem' }}>
          Create and manage WhatsApp chatbots for your customers. Multi-tenant support, message logs, templates and a smooth onboarding flow.
        </p>
        <div style={{ display: 'inline-flex', gap: 12 }}>
          <button onClick={() => router.push('/signup')} style={{ padding: '0.9rem 1.8rem', borderRadius: 8, border: 'none', background: '#0070f3', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
            Start free
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '0.9rem 1.6rem', borderRadius: 8, border: '1px solid #e6eef8', background: '#fff', cursor: 'pointer' }}>
            View demo
          </button>
        </div>

        <div style={{ marginTop: 40 }}>
          {/* Replace with an actual screenshot / mockup (put a file into public/) */}
          <img src="/hero-chat-mockup.png" alt="Chat mockup" style={{ width: '85%', maxWidth: 960, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }} />
        </div>
      </header>

      <section id="features" style={{ padding: '4rem 1rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 28 }}>Built for modern teams</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 20
        }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #eef2ff' }}>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#475569', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ padding: '3rem 1rem', background: '#fafafa' }}>
        <h2 style={{ textAlign: 'center' }}>Pricing</h2>
        <p style={{ textAlign: 'center', color: '#475569' }}>Simple pricing for teams and builders</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 280, padding: 20, borderRadius: 10, background: '#fff', border: '1px solid #e6eef8' }}>
            <h3>Free</h3>
            <p style={{ margin: '8px 0 16px' }}><strong>Up to 100 messages / month</strong></p>
            <ul style={{ paddingLeft: 18 }}>
              <li>Basic bot console</li>
              <li>1 WhatsApp number</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => router.push('/signup')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Start free
              </button>
            </div>
          </div>

          <div style={{ width: 280, padding: 20, borderRadius: 10, background: '#fff', border: '1px solid #e6eef8' }}>
            <h3>Pro</h3>
            <p style={{ margin: '8px 0 16px' }}><strong>Unlimited messages</strong></p>
            <ul style={{ paddingLeft: 18 }}>
              <li>Multi-account support</li>
              <li>Advanced templates & analytics</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => router.push('/signup')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '3rem 1rem', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>FAQ</h2>
        <div style={{ marginTop: 18 }}>
          <details style={{ padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #eef2ff', marginBottom: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Is there a free plan?</summary>
            <p>Yes — Free includes basic usage for testing and small projects.</p>
          </details>

          <details style={{ padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #eef2ff' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Which WhatsApp numbers can I use?</summary>
            <p>Our platform integrates with Meta's WhatsApp Business Cloud API. Businesses must provide their Business phone_number_id and access token.</p>
          </details>
        </div>
      </section>

      <footer style={{ padding: '2rem 1rem', background: '#0f172a', color: '#fff', textAlign: 'center' }}>
        <div style={{ marginBottom: 8 }}>© {new Date().getFullYear()} WhatsApp Bot Service</div>
        <div style={{ color: '#9ca3af' }}>Built with love — deploy on Render</div>
      </footer>
    </div>
  );
}
