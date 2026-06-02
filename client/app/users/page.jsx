'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-20">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Users</h2>
      <div className="flex flex-col gap-4">
        {users.map(user => (
          <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <p className="ml-auto text-xs text-gray-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}