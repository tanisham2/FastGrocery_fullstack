'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessage('OTP sent to your email. Check your inbox.');
      setStep(2);
    } 
    else {
      setError(data.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessage('Password updated successfully! You can now login.');
      setStep(3);
    } 
    else {
      setError(data.message);
    }
  };

  return (
  <div
    style={{
      minHeight: '100vh',
      background: '#f8d030',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
    }}
  >
    <div
      style={{
        background: '#fff',
        width: '100%',
        maxWidth: '750px',
        borderRadius: '20px',
        padding: '50px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid #eee',
      }}
    >
      <h2
        style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '10px',
        }}
      >
        Forgot Password
      </h2>

      <p
        style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '24px',
        }}
      >
        {step === 1 && 'Enter your email to receive an OTP.'}
        {step === 2 && 'Enter the OTP and create a new password.'}
        {step === 3 && 'Password updated successfully.'}
      </p>

      {message && (
        <div
          style={{
            background: '#f0fff4',
            color: '#2f855a',
            border: '1px solid #9ae6b4',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fff5f5',
            color: '#e53e3e',
            border: '1px solid #fed7d7',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <form
          onSubmit={handleSendOTP}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tanisha@example.com"
              required
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1AA7A8',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={handleUpdatePassword}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={form.otp}
            onChange={(e) =>
              setForm({ ...form, otp: e.target.value })
            }
            required
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({
                ...form,
                newPassword: e.target.value,
              })
            }
            required
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
            required
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1AA7A8',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {step === 3 && (
        <a
          href="/login"
          style={{
            display: 'block',
            textAlign: 'center',
            background: '#1AA7A8',
            color: '#fff',
            padding: '14px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '700',
          }}
        >
          Go To Login
        </a>
      )}
    </div>
  </div>
);
}