import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 36 }}>WhatsApp Bot Service</h1>
        <p style={{ fontSize: 18, maxWidth: 600, margin: '16px auto' }}>
          Build your own WhatsApp chatbot without writing complex backend code.
          Manage your bot, view messages, and interact with users in real time.
        </p>
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => router.push('/pages/signup')}
            style={{ marginRight: 8, padding: '8px 16px' }}
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/pages/login')}
            style={{ padding: '8px 16px' }}
          >
            Login
          </button>
        </div>
      </header>

      <section style={{ marginBottom: 48 }}>
        <h2>Pricing</h2>
        <ul>
          <li>Free: Basic bot console, up to 100 messages/month</li>
          <li>Pro: Unlimited messages, multi-client support</li>
        </ul>
      </section>

      <section>
        <h2>How It Works</h2>
        <ol>
          <li>Sign up and connect your WhatsApp Business number</li>
          <li>Create your bot and configure responses</li>
          <li>Send and receive messages via the dashboard</li>
        </ol>
      </section>
    </div>
  );
}
