/**
 * Auth.jsx
 * Sign In and Sign Up page with Usha design theme, clean validation,
 * and user-friendly error handling.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../services/api';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email.trim(), password: form.password }
          : { email: form.email.trim(), password: form.password, displayName: form.displayName.trim() };

      const res = await api.post(endpoint, payload);
      if (res.data && res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        navigate('/');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--night)', minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#FFFFFF' }}>
      <div
        style={{
          maxWidth: 440,
          width: '100%',
          background: '#161B32',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #F4C878, #E8A33D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: 24,
            }}
          >
            ☀️
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ color: '#9AA0C4', fontSize: 13.5, margin: 0 }}>
            {mode === 'login'
              ? 'Sign in to access your personal practice history and progress.'
              : 'Start your personalized AI-guided yoga journey.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', padding: 4, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 8,
              border: 'none',
              background: mode === 'login' ? 'var(--gold)' : 'transparent',
              color: mode === 'login' ? '#12172B' : '#C7CBE0',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 8,
              border: 'none',
              background: mode === 'register' ? 'var(--gold)' : 'transparent',
              color: mode === 'register' ? '#12172B' : '#C7CBE0',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12.5, color: '#C7CBE0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                placeholder="Enter your name"
                value={form.displayName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12.5, color: '#C7CBE0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, color: '#C7CBE0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#F87171', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '13px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--gold)',
              color: '#12172B',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(232, 163, 61, 0.3)',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Free Account'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            margin: '20px auto 0',
            background: 'none',
            border: 'none',
            color: '#9AA0C4',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#FFFFFF',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
