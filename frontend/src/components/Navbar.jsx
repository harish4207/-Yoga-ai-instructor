/**
 * Navbar.jsx
 * Responsive Top Navigation with Mobile Drawer, Dawn Palette, language switcher, and account state.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useApp();
  const { user, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide standard navbar when inside immersive active coaching view
  if (location.pathname.startsWith('/live')) {
    // The live coaching view provides its own full-viewport immersive header
    return null;
  }

  const isDarkNav = !location.pathname.startsWith('/photo') && location.pathname !== '/photo';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        width: '100%',
        background: isDarkNav ? 'rgba(18, 23, 43, 0.94)' : 'rgba(241, 244, 238, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDarkNav ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #F4C878, #E8A33D)',
              boxShadow: '0 0 14px rgba(232, 163, 61, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              color: '#12172B',
            }}
          >
            ☀️
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '0.5px',
              color: isDarkNav ? '#FFFFFF' : '#12172B',
            }}
          >
            USHA
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: isDarkNav ? '#F4C878' : '#C65D4B',
              background: isDarkNav ? 'rgba(232, 163, 61, 0.15)' : 'rgba(198, 93, 75, 0.12)',
              padding: '2px 7px',
              borderRadius: 20,
              marginLeft: 2,
            }}
          >
            AI YOGA
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link
            to="/asanas"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: location.pathname.startsWith('/asanas') ? 'var(--gold)' : (isDarkNav ? '#C7CBE0' : '#4B5563'),
              textDecoration: 'none',
            }}
          >
            🌿 Asana Library
          </Link>
          <Link
            to="/live/virabhadrasanaII"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: location.pathname.startsWith('/live') ? 'var(--gold)' : (isDarkNav ? '#C7CBE0' : '#4B5563'),
              textDecoration: 'none',
            }}
          >
            📹 Live Coach
          </Link>
          <Link
            to="/photo/virabhadrasanaII"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: location.pathname.startsWith('/photo') ? 'var(--gold)' : (isDarkNav ? '#C7CBE0' : '#4B5563'),
              textDecoration: 'none',
            }}
          >
            📷 Photo Report
          </Link>
          <Link
            to="/progress"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: location.pathname.startsWith('/progress') ? 'var(--gold)' : (isDarkNav ? '#C7CBE0' : '#4B5563'),
              textDecoration: 'none',
            }}
          >
            📈 Progress
          </Link>
        </nav>

        {/* Right Tools: Language Selector + Auth + Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: isDarkNav ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid #D1D5DB',
              background: isDarkNav ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
              color: isDarkNav ? '#EDEEF6' : '#1F2937',
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: 'var(--font-indic)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} style={{ background: '#12172B', color: '#fff' }}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Desktop User Auth */}
          <div className="desktop-auth">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: isDarkNav ? '#9AA0C4' : '#6B7280', fontWeight: 500 }}>
                  {user.displayName || user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: isDarkNav ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #D1D5DB',
                    background: 'transparent',
                    color: isDarkNav ? '#EDEEF6' : '#374151',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(232, 163, 61, 0.3)',
                }}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: isDarkNav ? '#FFFFFF' : '#12172B',
              fontSize: 22,
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: isDarkNav ? '#12172B' : '#FFFFFF',
            borderTop: isDarkNav ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E5E7EB',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Link
            to="/asanas"
            onClick={closeMobileMenu}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDarkNav ? '#EDEEF6' : '#1F2937',
              textDecoration: 'none',
            }}
          >
            🌿 Asana Library
          </Link>
          <Link
            to="/live/virabhadrasanaII"
            onClick={closeMobileMenu}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDarkNav ? '#EDEEF6' : '#1F2937',
              textDecoration: 'none',
            }}
          >
            📹 Live Coach
          </Link>
          <Link
            to="/photo/virabhadrasanaII"
            onClick={closeMobileMenu}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDarkNav ? '#EDEEF6' : '#1F2937',
              textDecoration: 'none',
            }}
          >
            📷 Photo Report
          </Link>
          <Link
            to="/progress"
            onClick={closeMobileMenu}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDarkNav ? '#EDEEF6' : '#1F2937',
              textDecoration: 'none',
            }}
          >
            📈 Progress
          </Link>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 12 }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, color: isDarkNav ? '#9AA0C4' : '#6B7280' }}>
                  {user.displayName || user.name || user.email}
                </span>
                <button
                  onClick={() => { logout(); closeMobileMenu(); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { navigate('/auth'); closeMobileMenu(); }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
