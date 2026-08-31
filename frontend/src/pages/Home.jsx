/**
 * Home.jsx
 * Full-width Web Hero Landing Page with Dawn Sunrise Gradient, Live Skeleton Preview,
 * Interactive Language Chips, and 3-column Mode Strip.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LANGUAGES = [
  { code: 'te', label: 'తెలుగు' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function Home() {
  const { language, changeLanguage } = useApp();
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: 'radial-gradient(140% 100% at 15% 0%, #2A2F55 0%, #171B36 40%, var(--night) 100%)',
        color: '#FFFFFF',
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sunrise Radiant Glow Aura */}
      <div
        style={{
          position: 'absolute',
          top: -160,
          right: -80,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, var(--gold-2), var(--gold) 55%, transparent 72%)',
          opacity: 0.82,
          filter: 'blur(3px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Hero Container */}
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '60px 32px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          position: 'relative',
          zIndex: 2,
          flex: 1,
        }}
      >
        {/* Hero Left Content */}
        <div style={{ flex: 1.2, maxWidth: 580 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 30,
              background: 'rgba(232, 163, 61, 0.15)',
              border: '1px solid rgba(244, 200, 120, 0.3)',
              color: 'var(--gold-2)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            <span>✨</span> Intelligent On-Device Posture AI
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 48,
              lineHeight: 1.15,
              margin: '0 0 20px',
              letterSpacing: '-0.5px',
            }}
          >
            Practice yoga, guided in your{' '}
            <span style={{ color: 'var(--gold-2)', textDecoration: 'underline decoration-gold/40' }}>
              own language
            </span>
            .
          </h1>

          <p
            style={{
              fontSize: 16.5,
              color: '#C7CBE0',
              lineHeight: 1.6,
              margin: '0 0 32px',
              maxWidth: 520,
            }}
          >
            An AI yoga coach that evaluates your alignment in real-time through your webcam — speaking natural corrections just like a real teacher in Telugu and English.
          </p>

          {/* Language Selection Chips */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 13, color: '#9AA0C4', marginBottom: 10, fontWeight: 600 }}>
              SELECT COACHING LANGUAGE / భాషను ఎంచుకోండి:
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 100,
                    border: language === l.code ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.18)',
                    background: language === l.code ? 'var(--gold)' : 'rgba(255, 255, 255, 0.06)',
                    color: language === l.code ? '#12172B' : '#EDEEF6',
                    fontFamily: 'var(--font-indic)',
                    fontWeight: language === l.code ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/live/virabhadrasanaII">
              <button
                style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(232, 163, 61, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>▶</span> Start Live Session
              </button>
            </Link>

            <Link to="/photo/virabhadrasanaII">
              <button
                style={{
                  padding: '14px 26px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                📷 Upload Photo Report
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Right Visual Preview */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div
            style={{
              width: 390,
              height: 440,
              borderRadius: 24,
              background: 'linear-gradient(180deg, #232A4D, #12172B)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {/* Top Status Header */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 3,
              }}
            >
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#F4C878',
                }}
              >
                वीरभद्रासन II · Warrior II
              </span>
              <span
                style={{
                  background: 'rgba(47, 109, 79, 0.85)',
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#86EFAC',
                }}
              >
                94% Accuracy
              </span>
            </div>

            {/* Dynamic Skeleton Graphic */}
            <svg
              viewBox="0 0 190 420"
              style={{
                position: 'absolute',
                left: '50%',
                top: '52%',
                transform: 'translate(-50%, -50%)',
                width: 200,
                height: 380,
              }}
            >
              {/* Torso & Head */}
              <circle cx="95" cy="48" r="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
              <line x1="95" y1="66" x2="95" y2="200" stroke="#00E676" strokeWidth="3" />
              {/* Left & Right Extended Arms */}
              <line x1="95" y1="95" x2="30" y2="95" stroke="#00E676" strokeWidth="3" />
              <line x1="30" y1="95" x2="10" y2="95" stroke="#00E676" strokeWidth="3" />
              <line x1="95" y1="95" x2="160" y2="95" stroke="#00E676" strokeWidth="3" />
              <line x1="160" y1="95" x2="180" y2="95" stroke="#00E676" strokeWidth="3" />
              {/* Front Bent Left Knee */}
              <line x1="95" y1="200" x2="50" y2="280" stroke="#00E676" strokeWidth="3" />
              <line x1="50" y1="280" x2="50" y2="370" stroke="#00E676" strokeWidth="3" />
              {/* Back Straight Right Leg */}
              <line x1="95" y1="200" x2="155" y2="370" stroke="#00E676" strokeWidth="3" />

              {/* Joint Dots */}
              <circle cx="95" cy="95" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
              <circle cx="30" cy="95" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
              <circle cx="160" cy="95" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
              <circle cx="95" cy="200" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
              <circle cx="50" cy="280" r="6" fill="#E8A33D" stroke="#fff" strokeWidth="2" />
              <circle cx="50" cy="370" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
              <circle cx="155" cy="370" r="5" fill="#2F6D4F" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* Spoken Live Caption Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 16,
                right: 16,
                background: 'rgba(18, 23, 43, 0.9)',
                border: '1px solid rgba(232, 163, 61, 0.4)',
                borderRadius: 12,
                padding: '10px 14px',
                textAlign: 'center',
                color: '#F4C878',
                fontSize: 13,
                fontFamily: 'var(--font-indic)',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              🔊 "ముందు మోకాలిని ఇంకొంచెం వంచండి — చాలా బాగుంది!"
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Mode Strip */}
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 32px 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}
      >
        <div
          onClick={() => navigate('/live/virabhadrasanaII')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>📹</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
            Live Camera Coaching
          </div>
          <p style={{ fontSize: 13.5, color: '#B8BDDA', lineHeight: 1.5, margin: 0 }}>
            Real-time audio and visual posture corrections powered by on-device MediaPipe landmark tracking.
          </p>
        </div>

        <div
          onClick={() => navigate('/photo/virabhadrasanaII')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>📷</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
            Photo Report Card
          </div>
          <p style={{ fontSize: 13.5, color: '#B8BDDA', lineHeight: 1.5, margin: 0 }}>
            Upload a photo or capture a webcam snapshot to receive an annotated OpenCV skeleton and biomechanics card.
          </p>
        </div>

        <div
          onClick={() => navigate('/asanas')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>🌿</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
            8-Asana Curriculum
          </div>
          <p style={{ fontSize: 13.5, color: '#B8BDDA', lineHeight: 1.5, margin: 0 }}>
            Curated foundation postures with verified biomechanical targets, custom reference vector art, and local audio.
          </p>
        </div>
      </div>
    </div>
  );
}
