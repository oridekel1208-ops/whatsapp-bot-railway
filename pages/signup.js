// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('Submitting...');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      let data;
      try { data = await res.clone().json(); } catch { data = { error: await res.clone().text() }; }

      if (res.ok) {
        // save client session (minimal)
        localStorage.setItem('client', JSON.stringify(data.client));
        setMessage('Signup complete — redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 800);
      } else {
        setMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      setMessage(err.message || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 520, margin: '40px auto', fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Sign up — Create your bot</h1>
      <p>Enter the WhatsApp Business phone number ID you control.</p>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="WhatsApp phone_number_id (e.g., 123456789012345)"
          style={{ padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }}
          required
        />
        <button type="submit" style={{ padding: 12, borderRadius: 8, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
          Create account
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
