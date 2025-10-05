import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #ccc'
      }}>
        <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>
          WhatsApp Bot Service
        </h2>
        <div>
          <button
            onClick={() => router.push('/signup')}
            style={{ marginRight: 8, padding: '8px 16px', cursor: 'pointer' }}
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        textAlign: 'center',
        padding: '64px 16px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>Build Your WhatsApp Bot</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: 600, margin: '0 auto 24px' }}>
          Easily create, manage, and interact with your WhatsApp chatbot. No complex backend required.
        </p>
        <div>
          <button
            onClick={() => router.push('/signup')}
            style={{ marginRight: 8, padding: '12px 24px', fontSize: '1rem', cursor: 'pointer' }}
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '12px 24px', fontSize: '1rem', cursor: 'pointer' }}
          >
            Login
          </button>
        </div>
      </header>

      {/* Pricing Section */}
      <section style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
        <h2>Pricing</h2>
        <ul>
          <li><strong>Free:</strong> Basic bot console, up to 100 messages/month</li>
          <li><strong>Pro:</strong> Unlimited messages, multi-client support</li>
        </ul>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '32px', maxWidth: 800, margin: '0 auto 64px' }}>
        <h2>How It Works</h2>
        <ol>
          <li>Sign up and connect your WhatsApp Business number</li>
          <li>Create your bot and configure automated responses</li>
          <li>Send and receive messages in real time from the dashboard</li>
        </ol>
      </section>
    </div>
  );
}
