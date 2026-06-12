'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Field({ label, name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          padding: '11px 14px',
          border: `1.5px solid ${error ? '#e53e3e' : '#e0e0e0'}`,
          borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#333',
        }}
        onFocus={(e) => e.target.style.borderColor = '#1a6fe8'}
        onBlur={(e) => e.target.style.borderColor = error ? '#e53e3e' : '#e0e0e0'}
      />
      {error && <span style={{ fontSize: '12px', color: '#e53e3e' }}>{error}</span>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.user.id);
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('userEmail', data.data.user.email);
        localStorage.setItem('userPhone', data.data.user.phone || '');
        localStorage.setItem('userAddress', data.data.user.address || '');
        router.push('/');
      } else {
        setServerError(data.message || 'Login failed');
      }
    } catch {
      setServerError('Unable to connect to server');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#dec45b',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', border: '1px solid #eee',
        padding: '50px', width: '100%', maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '30px', marginBottom: '8px' }}>👋</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Welcome back</h2>
          <p style={{ fontSize: '15px', color: '#888', marginTop: '4px' }}>Login to your account</p>
        </div>

        {serverError && (
          <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#e53e3e' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field
            label="Email address" name="email" type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
          />
          <Field
            label="Password" name="password" type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
            error={errors.password}
          />

          <button type="submit" disabled={loading} style={{
            background: loading ? '#aaa' : '#1a6fe8', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#1a6fe8', fontWeight: 600, textDecoration: 'none' }}>Register here</a>
        </p>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '8px' }}>
          <a href="/forgot-password" style={{ color: '#1a6fe8', textDecoration: 'none' }}>Forgot password?</a>
        </p>
      </div>
    </div>
  );
}