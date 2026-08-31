/**
 * Progress.jsx
 * Personal Practice Progression Dashboard.
 * Displays real user practice metrics, pose-by-pose milestones, and session history logs.
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
    <div style={{ background: 'var(--night)', minHeight: 'calc(100vh - 65px)', color: '#FFFFFF', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--gold-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Personal Journey
            </div>
            <h1 style={{ fontSize: 30, margin: '4px 0 0', color: '#FFFFFF' }}>
              📈 Practice Progression & Milestones
            </h1>
            {user && (
              <p style={{ margin: '4px 0 0', color: '#9AA0C4', fontSize: 14 }}>
                Welcome back, <strong>{user.displayName || user.name || user.email}</strong>.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/asanas')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#EDEEF6',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
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
          <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        ) : totalSessions === 0 ? (
          /* Empty State */
          <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 48, textAlign: 'center', maxWidth: 640, margin: '40px auto' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🧘</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 22, color: '#FFFFFF' }}>No Practice Sessions Yet</h3>
            <p style={{ color: '#9AA0C4', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              Complete your first Live Coaching or Photo Analysis session to see your alignment progression, personal bests, and focus areas.
            </p>
            <Link to="/asanas">
              <button
                style={{
                  padding: '13px 26px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 15,
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
            {/* Top Aggregate Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#9AA0C4', fontWeight: 600 }}>Total Sessions</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold-2)', marginTop: 4 }}>
                  {totalSessions}
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#9AA0C4', fontWeight: 600 }}>Poses Practiced</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#38BDF8', marginTop: 4 }}>
                  {uniquePosesPracticed} / 8
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#9AA0C4', fontWeight: 600 }}>Average Accuracy</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#86EFAC', marginTop: 4 }}>
                  {avgOverallScore}%
                </div>
              </div>

              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#9AA0C4', fontWeight: 600 }}>Personal Best</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#F4C878', marginTop: 4 }}>
                  {personalBestScore}%
                </div>
              </div>
            </div>

            {/* Pose-by-Pose Breakdown Grid */}
            <h3 style={{ fontSize: 20, margin: '0 0 16px', color: '#FFFFFF' }}>Pose Milestones</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18, marginBottom: 36 }}>
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
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, color: '#FFFFFF' }}>
                          {asanaInfo.name || prog.asanaId}
                        </h4>
                        <span style={{ fontSize: 12.5, color: 'var(--gold-2)' }}>
                          {asanaInfo.sanskritName || ''}
                        </span>
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.06)', fontSize: 12, color: '#C7CBE0' }}>
                        {prog.totalSessions} {prog.totalSessions === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9AA0C4' }}>First</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#C7CBE0', marginTop: 2 }}>{first}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9AA0C4' }}>Latest</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#86EFAC', marginTop: 2 }}>{latest}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9AA0C4' }}>Peak</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-2)', marginTop: 2 }}>{peak}%</div>
                      </div>
                    </div>

                    {delta !== 0 && (
                      <div style={{ marginTop: 10, fontSize: 12.5, color: delta > 0 ? '#86EFAC' : '#9AA0C4', fontWeight: 600, textAlign: 'right' }}>
                        {delta > 0 ? `+${delta} pts improvement` : `${delta} pts`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Session History Log */}
            <h3 style={{ fontSize: 20, margin: '0 0 16px', color: '#FFFFFF' }}>Recent Practice Sessions</h3>
            <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#9AA0C4', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Asana</th>
                    <th style={{ padding: '12px 16px' }}>Mode</th>
                    <th style={{ padding: '12px 16px' }}>Duration</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
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
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 16px', color: '#C7CBE0' }}>{formattedDate}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#FFFFFF' }}>
                          {asanaInfo.name || s.asanaId}
                        </td>
                        <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#38BDF8' }}>
                          {s.mode === 'live' ? '📹 Live' : '📷 Photo'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#C7CBE0' }}>
                          {s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s` : '1 snapshot'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 6, background: tier.bg || 'rgba(47,109,79,0.3)', color: tier.color || '#86EFAC', fontWeight: 700, fontSize: 12 }}>
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
        )}
      </div>
    </div>
  );
}
