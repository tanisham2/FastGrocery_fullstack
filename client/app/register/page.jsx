'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Field({label,name, type = 'text', placeholder, hint, form, setForm, errors, }) 
{
  const commonStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: `1.5px solid ${errors[name] ? '#e53e3e' : '#e0e0e0'}`,
    borderRadius: '8px', fontSize: '14px', outline: 'none',color: '#333',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#444', }}
      >
        {label}
      </label>

      {name === 'address' ? (
        <textarea rows={3}   
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) =>
            setForm({ ...form, [name]: e.target.value })
          }
          style={{
            ...commonStyle, resize: 'vertical', fontFamily: 'inherit',
          }}
        />
      ) : (
        <input 
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })
          }
          style={commonStyle}
        />
      )}

      {errors[name] && (
        <span style={{ fontSize: '12px', color: '#e53e3e', }}
        >
          {errors[name]}
        </span>
      )}

      {hint && !errors[name] && (
        <span style={{ fontSize: '11px', color: '#888', }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};

    if (!/^[a-zA-Z\s]{2,50}$/.test(form.name.trim())) {
      e.name = 'Name must be 2–50 letters only';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      e.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (form.password.length < 6) {
      e.password = 'Password  MUST be at least 6 characters';
    } 
    else if (!/(?=.*[A-Z])/.test(form.password)) {
      e.password =
        'Password MUST contain at least one uppercase letter';
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    if (form.address.trim().length < 10) {
      e.address =
        'Please enter a valid address (minimum 10 characters)';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email,
            phone: form.phone,
            password: form.password,
            address: form.address.trim(),
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        router.push('/login');
      } 
      else {
        setServerError(
          data.message || 'Registration failed'
        );
      }
    } 
    catch (error) {
      setServerError('Unable to connect to server');
    }
    setLoading(false);
  };

  return (
  <div style={{minHeight: '100vh', display: 'flex', background: '#dec45b',}} >

    {/* LEFT SECTION */}
    <div style={{flex: 0.75, background: '#dec45b', color: '#fff', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px', }}
    >
      <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', }}
      >
        FAST • FRESH • RELIABLE
      </div>

      <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', margin: '0 0 20px 0', }}
      >
        Groceries
        <br />
        delivered
        <br />
        in 10 minutes
      </h1>

      <p
        style={{
          fontSize: '20px',
          lineHeight: '1.7',
          maxWidth: '500px',
          marginBottom: '40px',
          color: 'rgba(255,255,255,0.95)',
        }}
      >
        Order fruits, vegetables, dairy products, snacks,
        beverages and daily essentials with lightning-fast
        delivery right to your doorstep.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '14px',
          fontSize: '18px',
          fontWeight: '500',
        }}
      >
        <div>✓ 5000+ Products Available</div>
        <div>✓ Delivery Within 10 Minutes</div>
        <div>✓ Fresh Fruits & Vegetables</div>
        <div>✓ Secure Online Payments</div>
        <div>✓ Easy Returns & Refunds</div>
        <div>✓ Trusted By Thousands Of Customers</div>
      </div>
    </div>

    {/* RIGHT SECTION */}
    <div
      style={{
        flex: 1,
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
          maxWidth: '650px',
          borderRadius: '18px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #eee',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              fontSize: '36px',
              marginBottom: '8px',
              color: '#1a1a1a',
            }}
          >
            Create Account
          </h2>

          <p
            style={{
              color: '#666',
              fontSize: '14px',
            }}
          >
            Join FastGrocery today
          </p>
        </div>

        {serverError && (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fed7d7',
              color: '#e53e3e',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '18px',
            }}
          >
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Field
            label="Full Name"
            name="name"
            placeholder="Tanisha Mathur"
            hint="Letters only, 2–50 characters"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <Field
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <Field
            label="Mobile Number"
            name="phone"
            type="tel"
            placeholder="9876543210"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="Minimum 6 chars, 1 uppercase"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <Field
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <Field
            label="Delivery Address"
            name="address"
            placeholder="Flat No, Street, City, State, Pincode"
            form={form}
            setForm={setForm}
            errors={errors}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#999' : '#1AA7A8', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
            }}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <p  style={{ textAlign: 'center',marginTop: '20px', color: '#666',
          }}
        >
          Already have an account?{' '}
          <a href="/login"
            style={{ color: '#1162cc', fontWeight: '600', textDecoration: 'none', }}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  </div>
);
}
