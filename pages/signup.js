import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Signup successful! Please log in.');
        router.push('/login');
      } else {
        setMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      setMessage(err.message || 'Signup failed');
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 400, margin: '0 auto' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          placeholder="WhatsApp phone number (e.g., +1234567890)"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          style={{ marginBottom: 8, padding: 8 }}
          required
        />
        <button type="submit" style={{ padding: 8 }}>Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
