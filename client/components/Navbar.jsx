'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    if (token && userId) {
      setUser({ name: name || 'Account' });
    } else {
      setUser(null);
    }
  }, [pathname]); // re-runs on every page chang

  if (pathname === '/' || pathname.startsWith('/admin')) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUser(null);
    setShowDropdown(false);
    router.push('/login');
  };

  return (
    <nav style={{
      background: '#1AA7A8',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Fast<span style={{ color: '#f8d030' }}>Grocery</span>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>Delivery in 10 minutes</div>
      </Link>

      <div style={{ flex: 1 }} />
      <Link href="/" style={{
        color: '#fff', fontSize: '16px', fontWeight: 500, textDecoration: 'none',
        borderBottom: pathname === '/' ? '2px solid #f8d030' : 'none', paddingBottom: '2px'
        }}> Home </Link>

      <Link href="/orders" style={{
        color: '#fff', fontSize: '14px', fontWeight: 500,
        textDecoration: 'none',
        borderBottom: pathname === '/orders' ? '2px solid #f8d030' : 'none',
        paddingBottom: '2px'
      }}>
        My Orders
      </Link>

      <Link href="/cart" style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: '#fff', color: '#000707',
        fontWeight: 700, fontSize: '14px',
        borderRadius: '8px', padding: '8px 16px',
        textDecoration: 'none', whiteSpace: 'nowrap'
      }}>
        🛒 My Cart
      </Link>

      {user ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', borderRadius: '8px',
              padding: '8px 14px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            👤 {user.name} ▾
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              background: '#fff', borderRadius: '10px',
              border: '0.5px solid #e8e8e8',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              minWidth: '160px', zIndex: 100, overflow: 'hidden'
            }}>
              <Link
                href="/orders"
                onClick={() => setShowDropdown(false)}
                style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#1a1a1a', textDecoration: 'none', borderBottom: '0.5px solid #f0f0f0' }}
              >
                 My Orders
              </Link>
              <button
                onClick={handleLogout}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '14px', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                 Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" style={{
          background: '#fff', color: '#000000',
          fontWeight: 700, fontSize: '14px',
          borderRadius: '8px', padding: '8px 16px',
          textDecoration: 'none', whiteSpace: 'nowrap'
        }}>
        <div style={{ display: 'flex', gap: '8px' }}>
           Login
           </div>
        </Link>
      )}
    </nav>
  );
}