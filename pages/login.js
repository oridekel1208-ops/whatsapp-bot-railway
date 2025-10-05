import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        router.push('/dashboard'); // redirect after login
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 400, margin: '0 auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          placeholder="WhatsApp phone number (e.g., +1234567890)"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          style={{ marginBottom: 8, padding: 8 }}
          required
        />
        <button type="submit" style={{ padding: 8 }}>Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
