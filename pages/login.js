// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Signing in...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      let data;
      try { data = await res.clone().json(); } catch { data = { error: await res.clone().text() }; }

      if (res.ok) {
        // store minimal session info
        localStorage.setItem('client', JSON.stringify(data.client));
        setMessage('Signed in — redirecting...');
        setTimeout(() => router.push('/dashboard'), 600);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 520, margin: '40px auto', fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Login</h1>
      <p>Sign in with the WhatsApp phone number ID you registered.</p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="WhatsApp phone_number_id"
          style={{ padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }}
          required
        />
        <button type="submit" style={{ padding: 12, borderRadius: 8, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
          Sign in
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
