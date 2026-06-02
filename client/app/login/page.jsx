'use client';             //client-side rendering for this page
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {           //login page component
  const router = useRouter();                   //router object for navigation
  const [form, setForm] = useState({ email: '', password: '' });       //stores form data
  const [error, setError] = useState('');          //stores error message
  const [loading, setLoading] = useState(false);      //stores loading state

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });   //updates form state on input change

  const handleSubmit = async (e) => {             //handles form submission
    e.preventDefault();                           //prevents default form submission behavior
    setLoading(true);                            //stops page from refreshing
    setError('');                                //resets error message

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {    //sends POST request to login endpoint      
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.user.id);
      localStorage.setItem('userName', data.data.user.name);
      router.push('/users');
    } 
    else {
      setError(data.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Login</h2>

      {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tanisha22@gmail.com"
            required
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Forgot password?{' '}
        <a href="/forgot-password" className="text-orange-600 hover:underline">Reset it here</a>
      </p>
    </div>
  );
}