/**
 * Progress.jsx
 * Personal Practice Progression Dashboard.
 * Responsive mobile and desktop layout displaying real user practice metrics,
 * pose-by-pose milestones, and session history logs.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ASANA_REGISTRY } from '../engine/poseRules';
import { getScoreTier } from '../engine/scoringEngine';
import api from '../services/api';

export default function Progress() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [progressList, setProgressList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [progRes, sessRes] = await Promise.all([
          api.get('/progress'),
          api.get('/sessions?limit=20'),
        ]);
        setProgressList(Array.isArray(progRes.data) ? progRes.data : []);
        setSessionList(Array.isArray(sessRes.data) ? sessRes.data : []);
      } catch (err) {
        console.error('Failed to load progress data:', err);
        setError('Unable to load progress. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute aggregate stats from real user data
  const totalSessions = sessionList.length;
  const uniquePosesPracticed = new Set(sessionList.map((s) => s.asanaId)).size;
  const avgOverallScore = totalSessions > 0
    ? Math.round(sessionList.reduce((sum, s) => sum + (s.finalScore || s.peakScore || 0), 0) / totalSessions)
    : 0;
  const personalBestScore = sessionList.length > 0
    ? Math.max(...sessionList.map((s) => s.peakScore || s.finalScore || 0))
    : 0;

  return (
    <div style={{ background: 'var(--night)', minHeight: 'calc(100vh - 65px)', color: '#FFFFFF', padding: '24px 16px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gold-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Personal Journey
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', margin: '4px 0 0', color: '#FFFFFF' }}>
              📈 Practice Progression & Milestones
            </h1>
            {user && (
              <p style={{ margin: '4px 0 0', color: '#9AA0C4', fontSize: 13.5 }}>
                Welcome back, <strong>{user.displayName || user.name || user.email}</strong>.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/asanas')}
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#EDEEF6',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
            }}
          >
            ← Practice Library
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9AA0C4' }}>
            <div style={{ width: 24, height: 24, border: '3px solid rgba(232,163,61,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading your practice history…
          </div>
        ) : error ? (
          <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        ) : totalSessions === 0 ? (
          /* Empty State */
          <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '36px 20px', textAlign: 'center', maxWidth: 640, margin: '24px auto', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🧘</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#FFFFFF' }}>No Practice Sessions Yet</h3>
            <p style={{ color: '#9AA0C4', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px' }}>
              Complete your first Live Coaching or Photo Analysis session to see your alignment progression, personal bests, and focus areas.
            </p>
            <Link to="/asanas" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(232, 163, 61, 0.35)',
                }}
              >
                🌿 Browse 8-Asana Library
              </button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Top Aggregate Metric Cards (Responsive Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 12, marginBottom: 28 }}>
              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9AA0C4', fontWeight: 600 }}>Total Sessions</div>
                <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: 'var(--gold-2)', marginTop: 2 }}>
                  {totalSessions}
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9AA0C4', fontWeight: 600 }}>Poses Practiced</div>
                <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#38BDF8', marginTop: 2 }}>
                  {uniquePosesPracticed} / 8
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9AA0C4', fontWeight: 600 }}>Average Accuracy</div>
                <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#86EFAC', marginTop: 2 }}>
                  {avgOverallScore}%
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9AA0C4', fontWeight: 600 }}>Personal Best</div>
                <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#F4C878', marginTop: 2 }}>
                  {personalBestScore}%
                </div>
              </div>
            </div>

            {/* Pose-by-Pose Breakdown Grid */}
            <h3 style={{ fontSize: 'clamp(18px, 4vw, 20px)', margin: '0 0 14px', color: '#FFFFFF' }}>Pose Milestones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
              {progressList.map((prog) => {
                const asanaInfo = ASANA_REGISTRY[prog.asanaId] || {};
                const first = prog.firstSessionScore || 0;
                const latest = prog.latestSessionScore || 0;
                const peak = prog.peakScore || latest;
                const delta = latest - first;

                return (
                  <div
                    key={prog.asanaId}
                    style={{
                      background: '#161B32',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15, color: '#FFFFFF' }}>
                          {asanaInfo.name || prog.asanaId}
                        </h4>
                        <span style={{ fontSize: 12, color: 'var(--gold-2)' }}>
                          {asanaInfo.sanskritName || ''}
                        </span>
                      </div>
                      <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.06)', fontSize: 11.5, color: '#C7CBE0' }}>
                        {prog.totalSessions} {prog.totalSessions === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 10.5, color: '#9AA0C4' }}>First</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#C7CBE0', marginTop: 1 }}>{first}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: '#9AA0C4' }}>Latest</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#86EFAC', marginTop: 1 }}>{latest}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, color: '#9AA0C4' }}>Peak</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-2)', marginTop: 1 }}>{peak}%</div>
                      </div>
                    </div>

                    {delta !== 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: delta > 0 ? '#86EFAC' : '#9AA0C4', fontWeight: 600, textAlign: 'right' }}>
                        {delta > 0 ? `+${delta} pts improvement` : `${delta} pts`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Session History Log with Horizontal Scroll & Touch Support */}
            <h3 style={{ fontSize: 'clamp(18px, 4vw, 20px)', margin: '0 0 14px', color: '#FFFFFF' }}>Recent Practice Sessions</h3>
            <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#9AA0C4', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <th style={{ padding: '10px 14px' }}>Date</th>
                      <th style={{ padding: '10px 14px' }}>Asana</th>
                      <th style={{ padding: '10px 14px' }}>Mode</th>
                      <th style={{ padding: '10px 14px' }}>Duration</th>
                      <th style={{ padding: '10px 14px' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionList.map((s, i) => {
                      const asanaInfo = ASANA_REGISTRY[s.asanaId] || {};
                      const score = s.finalScore || s.peakScore || 0;
                      const tier = getScoreTier(score) || {};
                      const formattedDate = new Date(s.startedAt || s.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '10px 14px', color: '#C7CBE0', whiteSpace: 'nowrap' }}>{formattedDate}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                            {asanaInfo.name || s.asanaId}
                          </td>
                          <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: '#38BDF8', whiteSpace: 'nowrap' }}>
                            {s.mode === 'live' ? '📹 Live' : '📷 Photo'}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#C7CBE0', whiteSpace: 'nowrap' }}>
                            {s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s` : '1 snapshot'}
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ padding: '2px 7px', borderRadius: 6, background: tier.bg || 'rgba(47,109,79,0.3)', color: tier.color || '#86EFAC', fontWeight: 700, fontSize: 11.5 }}>
                              {score}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
