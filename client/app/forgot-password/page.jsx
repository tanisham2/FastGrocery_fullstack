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
    <div className="bg-white rounded-xl shadow p-8 mt-10 border border-orange-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
      <p className="text-sm text-gray-500 mb-6">
        {step === 1 && 'Enter your email to receive an OTP.'}
        {step === 2 && 'Enter the OTP sent to your email and set a new password.'}
        {step === 3 && 'All done!'}
      </p>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">{message}</p>}
      {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tanisha@example.com"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              placeholder="Enter 6-digit OTP"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {step === 3 && (
        <a
          href="/login"
          className="block text-center bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition"
        >
          Go to Login
        </a>
      )}
    </div>
  );
}