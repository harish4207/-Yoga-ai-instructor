/**
 * LiveCoach.jsx
 * Immersive Full-Screen Fitness Reel AI Live Yoga Coach.
 *
 * Guaranteed Camera Pipeline:
 * - Persistent, single-mount <video> and <canvas> architecture (eliminates blank video on phase transitions).
 * - Automatic full-viewport transition when user steps back and satisfies full-body readiness.
 * - Mobile responsive safe-area insets, touch-friendly controls, and resilient video attachment.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { ASANA_CURRICULUM, getAsanaConfig } from '../engine/poseRules';
import { runCoachingEngine } from '../engine/coachingEngine';
import { drawPoseSkeleton } from '../engine/skeletonDrawer';
import { createAngleSmoother } from '../engine/smoothing';
import { getScoreTier, computeImprovement } from '../engine/scoringEngine';
import { getPoseLandmarker, detectVideoFrame } from '../services/poseLandmarker';
import audioFeedbackService from '../services/audioFeedbackService';
import { getCorrectionText } from '../services/correctionRegistry';
import api from '../services/api';

const ASYMMETRIC_ASANAS = ['vrikshasana', 'trikonasana', 'virabhadrasanaII'];

export default function LiveCoach() {
  const { asanaId } = useParams();
  const navigate = useNavigate();
  const { language, changeLanguage } = useApp();
  const { user } = useUser();

  const currentAsanaId = asanaId && getAsanaConfig(asanaId) ? asanaId : 'virabhadrasanaII';
  const asanaConfig = getAsanaConfig(currentAsanaId) || getAsanaConfig('virabhadrasanaII');

  // Flow State: 'lang_select' | 'setup' | 'ready_preview' | 'coaching' | 'summary'
  const [sessionPhase, setSessionPhase] = useState('lang_select');
  const [selectedLangChoice, setSelectedLangChoice] = useState(language || 'en');

  // Side Selection for Asymmetric Poses: 'left' | 'right'
  const [selectedSide, setSelectedSide] = useState('left');

  // Camera & Stream State
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [isMirror, setIsMirror] = useState(true);
  const [autoVoice, setAutoVoice] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Active Session Controls
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReferenceOverlay, setShowReferenceOverlay] = useState(false);

  // Live Coaching Output State
  const [coachingResult, setCoachingResult] = useState(null);
  const [isGateReady, setIsGateReady] = useState(false);
  const [gateMessage, setGateMessage] = useState('Enable camera to begin setup.');
  const [checklist, setChecklist] = useState({
    cameraEnabled: false,
    modelReady: false,
    poseDetected: false,
    fullBodyVisible: false,
    sideSelected: true,
  });

  // Active Mode Tracking Loss Warning
  const [activeTrackingWarning, setActiveTrackingWarning] = useState(null);

  // Developer Diagnostics State
  const [showDevDiagnostics, setShowDevDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState(audioFeedbackService.getDiagnostics());

  // Metrics & Progression
  const [sessionDuration, setSessionDuration] = useState(0);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [progressHistory, setProgressHistory] = useState(null);
  const [sessionSummaryData, setSessionSummaryData] = useState(null);
  const [bestHoldDuration, setBestHoldDuration] = useState(0);

  // Persistent Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const smootherRef = useRef(createAngleSmoother(0.35));
  const lastUiUpdateRef = useRef(0);
  const stableHoldStartTimeRef = useRef(null);
  const gateStabilityCounterRef = useRef(0);
  const currentPhaseRef = useRef('lang_select');

  // Keep phase ref synchronized for requestAnimationFrame loop
  useEffect(() => {
    currentPhaseRef.current = sessionPhase;
  }, [sessionPhase]);

  // Re-attach video stream if needed
  useEffect(() => {
    if (streamRef.current && videoRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.debug('Video play error:', e));
    }
  }, [sessionPhase, isCameraRunning]);

  // Fetch past user progress
  useEffect(() => {
    async function fetchPastProgress() {
      if (!user) return;
      try {
        const res = await api.get(`/progress/${currentAsanaId}`);
        if (res.data && res.data.progress) {
          setProgressHistory(res.data.progress);
        }
      } catch (err) {
        console.debug('No prior progress found:', err.message);
      }
    }
    fetchPastProgress();
  }, [user, currentAsanaId]);

  // Clean up camera, timer, and audio on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      audioFeedbackService.stopCorrectionAudio();
      audioFeedbackService.resetCooldowns();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraRunning(false);
    audioFeedbackService.stopCorrectionAudio();
  }, []);

  // Initialize Camera & PoseLandmarker
  const startCamera = async () => {
    setModelLoading(true);
    setModelError(null);
    try {
      await getPoseLandmarker('VIDEO');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => console.warn('Autoplay error:', e));
          setIsCameraRunning(true);
          setModelLoading(false);
          setChecklist((prev) => ({ ...prev, cameraEnabled: true, modelReady: true }));
          startDetectionLoop();
        };
      }
    } catch (err) {
      console.error('Camera or MediaPipe initialization failed:', err);
      setModelError(`Camera access error: ${err.message}. Please check browser camera permissions.`);
      setModelLoading(false);
    }
  };

  // High-performance Detection & Render Loop
  const startDetectionLoop = () => {
    smootherRef.current.reset();
    gateStabilityCounterRef.current = 0;

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && canvas) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const now = performance.now();
        try {
          const detection = detectVideoFrame(video, now);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection && detection.landmarks && detection.landmarks.length > 0) {
            const lms = detection.landmarks[0];

            // Render skeleton directly on canvas
            drawPoseSkeleton(ctx, lms, canvas.width, canvas.height, {
              lineWidth: 4,
              jointRadius: 6,
              isMirrored: isMirror,
            });

            // If paused during active session, skip posture calculations
            if (isPaused) {
              animationFrameRef.current = requestAnimationFrame(loop);
              return;
            }

            // Run posture evaluation engine with temporal smoothing
            const result = runCoachingEngine(lms, asanaConfig, {
              smoother: smootherRef.current,
              side: selectedSide,
            });

            // Gate Persistence Stability Window (Requires 2 consecutive confident frames)
            if (result.sessionReady) {
              gateStabilityCounterRef.current = Math.min(5, gateStabilityCounterRef.current + 1);
            } else {
              gateStabilityCounterRef.current = Math.max(0, gateStabilityCounterRef.current - 1);
            }
            const isPersistentlyReady = gateStabilityCounterRef.current >= 2;

            // AUTOMATIC IMMERSIVE TRANSITION: When in setup and user is stably ready, expand viewport!
            if (currentPhaseRef.current === 'setup' && isPersistentlyReady) {
              currentPhaseRef.current = 'ready_preview';
              setSessionPhase('ready_preview');
            }

            // Stable hold duration tracker (active coaching only)
            if (currentPhaseRef.current === 'coaching' && result.isStable) {
              if (!stableHoldStartTimeRef.current) {
                stableHoldStartTimeRef.current = Date.now();
              } else {
                const currentHoldSecs = Math.floor((Date.now() - stableHoldStartTimeRef.current) / 1000);
                setBestHoldDuration((prev) => Math.max(prev, currentHoldSecs));
              }
            } else {
              stableHoldStartTimeRef.current = null;
            }

            // Dispatch local audio cue if meaningful correction detected (Single-Audio-Output Rule)
            if (currentPhaseRef.current === 'coaching' && autoVoice && result.sessionReady && result.shouldSpeak && result.candidateCue) {
              audioFeedbackService.playCorrection(result.candidateCue, language);
            }

            // Positive feedback on entering STABLE state (active coaching only)
            if (currentPhaseRef.current === 'coaching' && autoVoice && result.sessionReady && result.isStable) {
              audioFeedbackService.playCorrection('hold_position', language);
            }

            // Throttle React UI state updates to every 200 ms
            if (now - lastUiUpdateRef.current > 200) {
              lastUiUpdateRef.current = now;
              setCoachingResult(result);
              setIsGateReady(isPersistentlyReady);

              // Active tracking loss overlay (non-blocking in immersive views)
              if (!result.sessionReady) {
                setActiveTrackingWarning('Step back so your full body from head to feet is visible.');
              } else {
                setActiveTrackingWarning(null);
              }

              setChecklist({
                cameraEnabled: true,
                modelReady: true,
                poseDetected: true,
                fullBodyVisible: result.sessionReady,
                sideSelected: true,
              });

              setGateMessage(
                isPersistentlyReady
                  ? '✓ All vision checks passed. Ready to coach!'
                  : result.message || 'Move back so your full body from head to feet is inside the frame.'
              );

              if (result.sessionReady && result.score !== null) {
                setScoreHistory((prev) => [...prev.slice(-60), result.score]);
              }

              setDiagnostics(audioFeedbackService.getDiagnostics());
            }
          } else {
            if (now - lastUiUpdateRef.current > 300) {
              lastUiUpdateRef.current = now;
              setCoachingResult(null);
              setIsGateReady(false);
              gateStabilityCounterRef.current = 0;

              if (currentPhaseRef.current === 'coaching' || currentPhaseRef.current === 'ready_preview') {
                setActiveTrackingWarning('Looking for person in camera frame… Stand 2–3 meters away.');
              }

              setChecklist((prev) => ({
                ...prev,
                poseDetected: false,
                fullBodyVisible: false,
              }));
              setGateMessage('Looking for person in camera frame… Stand 2–3 meters away.');
              setDiagnostics(audioFeedbackService.getDiagnostics());
            }
          }
        } catch (e) {
          console.debug('Frame processing skipped:', e.message);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Confirm Coaching Language
  const handleConfirmLanguage = () => {
    changeLanguage(selectedLangChoice);
    setSessionPhase('setup');
    startCamera();
  };

  // Start Coaching Session (From Ready Preview)
  const handleStartCoaching = () => {
    if (isStartingSession) return;

    setIsStartingSession(true);

    // Optional user-gesture Fullscreen API request (graceful fallback if unsupported/rejected)
    if (typeof document !== 'undefined' && document.documentElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    setTimeout(() => {
      setSessionPhase('coaching');
      currentPhaseRef.current = 'coaching';
      setIsStartingSession(false);
      setScoreHistory([]);
      setSessionDuration(0);
      setBestHoldDuration(0);
      setIsPaused(false);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }, 150);
  };

  // Pause / Resume Toggle
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      audioFeedbackService.stopCorrectionAudio();
    }
  };

  // Finish Coaching Session
  const handleFinishSession = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    stopCamera();

    const validScores = scoreHistory.filter((s) => typeof s === 'number' && s > 0);
    const avgScore = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : (coachingResult?.score || 85);

    const peakScore = validScores.length > 0 ? Math.max(...validScores) : avgScore;
    const strengths = coachingResult?.strengths || [];
    const topCorrection = coachingResult?.topCorrection || null;

    const summary = {
      asanaId: currentAsanaId,
      asanaName: asanaConfig.name,
      sanskritName: asanaConfig.sanskritName,
      durationSeconds: sessionDuration,
      bestHoldDuration,
      avgScore,
      peakScore,
      strengths,
      topCorrection,
      firstScore: progressHistory?.firstScore ?? avgScore,
      previousScore: progressHistory?.previousScore ?? null,
    };

    setSessionSummaryData(summary);
    setSessionPhase('summary');
    currentPhaseRef.current = 'summary';
    setShowExitConfirm(false);

    // Save session metadata only (Zero video data sent)
    if (user && validScores.length > 0) {
      try {
        await api.post('/sessions', {
          asanaId: currentAsanaId,
          mode: 'live',
          language,
          durationSeconds: sessionDuration,
          snapshots: [{ score: avgScore, ruleResults: coachingResult?.ruleResults || [] }],
        });
      } catch (saveErr) {
        console.debug('Could not log session metadata:', saveErr.message);
      }
    }
  };

  // Restart Setup
  const handleRestartSetup = () => {
    setSessionPhase('setup');
    currentPhaseRef.current = 'setup';
    setCoachingResult(null);
    setScoreHistory([]);
    setSessionDuration(0);
    setBestHoldDuration(0);
    setIsPaused(false);
    startCamera();
  };

  const isAsymmetric = ASYMMETRIC_ASANAS.includes(currentAsanaId);
  const currentTier = coachingResult ? getScoreTier(coachingResult.score) : null;
  const isImmersive = sessionPhase === 'ready_preview' || sessionPhase === 'coaching';

  return (
    <div style={{ background: '#0B0E1C', minHeight: '100dvh', width: '100vw', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {/* ========================================================================= */}
      {/* PERSISTENT SINGLE-MOUNT VIDEO & SKELETON CANVAS (NEVER UNMOUNTED)          */}
      {/* ========================================================================= */}
      <div
        style={{
          position: isImmersive ? 'fixed' : (sessionPhase === 'setup' ? 'absolute' : 'fixed'),
          inset: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 1,
          display: (sessionPhase === 'lang_select' || sessionPhase === 'summary') ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0E1C',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: isMirror ? 'scaleX(-1)' : 'none',
            display: isCameraRunning ? 'block' : 'none',
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            display: isCameraRunning ? 'block' : 'none',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* PHASE 0: PRE-PRACTICE LANGUAGE SELECTION STEP */}
      {/* ========================================================================= */}
      {sessionPhase === 'lang_select' && (
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 520, margin: '60px auto', background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: '32px 24px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', width: 'calc(100% - 32px)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(232, 163, 61, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>
            🗣️
          </div>

          <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{asanaConfig.name} ({asanaConfig.sanskritName})</h2>
          <p style={{ color: '#C7CBE0', fontSize: 14.5, margin: '0 0 24px' }}>
            Which language are you comfortable with for live posture coaching?
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setSelectedLangChoice('en')}
              style={{
                flex: 1,
                padding: '16px 14px',
                borderRadius: 14,
                border: selectedLangChoice === 'en' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                background: selectedLangChoice === 'en' ? 'rgba(232, 163, 61, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedLangChoice === 'en' ? 'var(--gold-2)' : '#EDEEF6',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800 }}>English</div>
              <div style={{ fontSize: 11.5, color: '#9AA0C4', marginTop: 4 }}>Clear instructor cues</div>
            </button>

            <button
              onClick={() => setSelectedLangChoice('te')}
              style={{
                flex: 1,
                padding: '16px 14px',
                borderRadius: 14,
                border: selectedLangChoice === 'te' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                background: selectedLangChoice === 'te' ? 'rgba(232, 163, 61, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedLangChoice === 'te' ? 'var(--gold-2)' : '#EDEEF6',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'var(--font-indic)',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800 }}>తెలుగు</div>
              <div style={{ fontSize: 11.5, color: '#9AA0C4', marginTop: 4 }}>సహజమైన తెలుగు వాయిస్</div>
            </button>
          </div>

          <button
            onClick={handleConfirmLanguage}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--gold)',
              color: '#12172B',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 15.5,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(232, 163, 61, 0.35)',
            }}
          >
            Continue to Camera Setup →
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: PRE-SESSION SETUP & CALIBRATION STAGE (OVERLAY ON LIVE VIDEO)     */}
      {/* ========================================================================= */}
      {sessionPhase === 'setup' && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: 1100,
            margin: '0 auto',
            padding: '24px 16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', margin: '0 0 4px' }}>
                Setup & Alignment — {asanaConfig.name}
              </h1>
              <div style={{ color: '#9AA0C4', fontSize: 13 }}>
                {asanaConfig.sanskritName} · Coaching in <strong>{language === 'te' ? 'Telugu (తెలుగు)' : 'English'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={currentAsanaId}
                onChange={(e) => {
                  stopCamera();
                  navigate(`/live/${e.target.value}`);
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12.5,
                }}
              >
                {ASANA_CURRICULUM.map((a) => (
                  <option key={a.id} value={a.id} style={{ background: '#12172B' }}>
                    {a.name} ({a.sanskritName})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowDevDiagnostics(!showDevDiagnostics)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: showDevDiagnostics ? 'rgba(232, 163, 61, 0.2)' : 'transparent',
                  color: showDevDiagnostics ? 'var(--gold-2)' : '#9AA0C4',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                🛠️ {showDevDiagnostics ? 'Hide Debug' : 'Debug'}
              </button>
            </div>
          </div>

          {modelError && (
            <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
              ⚠️ {modelError}
            </div>
          )}

          {/* Developer Diagnostics Panel */}
          {showDevDiagnostics && (
            <div style={{ background: '#161B32', border: '1px solid rgba(232, 163, 61, 0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 11.5, display: 'flex', gap: 16, flexWrap: 'wrap', color: '#9AA0C4' }}>
              <div>Audio Source: <strong style={{ color: 'var(--gold-2)' }}>{diagnostics.audioSource}</strong></div>
              <div>Active Cue: <strong style={{ color: '#fff' }}>{diagnostics.activeCorrectionId || 'none'}</strong></div>
              <div>Gate Status: <strong style={{ color: isGateReady ? '#86EFAC' : '#F87171' }}>{isGateReady ? 'READY' : 'NOT_READY'}</strong></div>
              <div>MediaPipe: <strong style={{ color: checklist.modelReady ? '#86EFAC' : '#F4C878' }}>{checklist.modelReady ? 'READY' : 'LOADING'}</strong></div>
            </div>
          )}

          {/* Setup Guidance Card */}
          <div style={{ background: 'rgba(22, 27, 50, 0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 22, maxWidth: 540, boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Readiness Checklist</h3>

            {/* Asymmetric Profile Selector */}
            {isAsymmetric && (
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 10, borderRadius: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#C7CBE0', marginBottom: 6 }}>
                  Evaluated Lead Side:
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelectedSide('left')}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: 8,
                      border: selectedSide === 'left' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: selectedSide === 'left' ? 'rgba(232, 163, 61, 0.15)' : 'transparent',
                      color: selectedSide === 'left' ? 'var(--gold-2)' : '#C7CBE0',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    👈 Left Side (Default)
                  </button>
                  <button
                    onClick={() => setSelectedSide('right')}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: 8,
                      border: selectedSide === 'right' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: selectedSide === 'right' ? 'rgba(232, 163, 61, 0.15)' : 'transparent',
                      color: selectedSide === 'right' ? 'var(--gold-2)' : '#C7CBE0',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    👉 Right Side
                  </button>
                </div>
              </div>
            )}

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: checklist.cameraEnabled ? '#86EFAC' : '#9AA0C4' }}>
                <span>{checklist.cameraEnabled ? '✓' : '⏳'}</span>
                <span>Camera Enabled</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: checklist.modelReady ? '#86EFAC' : '#9AA0C4' }}>
                <span>{checklist.modelReady ? '✓' : '⏳'}</span>
                <span>AI Vision Model Ready</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: checklist.poseDetected ? '#86EFAC' : '#F87171' }}>
                <span>{checklist.poseDetected ? '✓' : '⏳'}</span>
                <span>Person Detected in Frame</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isGateReady ? '#86EFAC' : '#F4C878' }}>
                <span>{isGateReady ? '✓' : '⏳'}</span>
                <span>Full Body Visible (Head, Shoulders, Knees, Ankles)</span>
              </div>
            </div>

            {/* Step Back Instruction Alert */}
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: '1px solid rgba(232, 163, 61, 0.4)',
                background: 'rgba(232, 163, 61, 0.12)',
                fontSize: 13,
                lineHeight: 1.4,
                color: '#F4C878',
                fontWeight: 600,
              }}
            >
              👣 Step back 2–3 meters so your full body is in view. The screen will automatically expand into full-screen coaching as soon as you are visible.
            </div>

            {!isCameraRunning && (
              <button
                onClick={startCamera}
                disabled={modelLoading}
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: 'pointer',
                }}
              >
                {modelLoading ? '⏳ Loading AI Vision…' : '📷 Enable Camera'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2 & 3: IMMERSIVE FULL-VIEWPORT OVERLAYS (100dvh x 100vw REEL VIEW)   */}
      {/* Sits seamlessly over the persistent video element                          */}
      {/* ========================================================================= */}
      {isImmersive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'max(14px, env(safe-area-inset-top, 14px)) max(14px, env(safe-area-inset-right, 14px)) max(16px, env(safe-area-inset-bottom, 16px)) max(14px, env(safe-area-inset-left, 14px))',
            boxSizing: 'border-box',
          }}
        >
          {/* TOP IMMERSIVE OVERLAY BAR */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              pointerEvents: 'auto',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {/* Left: Exit + Pose Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowExitConfirm(true)}
                style={{
                  background: 'rgba(18, 23, 43, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#EDEEF6',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 15,
                }}
                title="Exit Session"
              >
                ←
              </button>

              <div style={{ background: 'rgba(18, 23, 43, 0.88)', backdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: 100, border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{asanaConfig.name}</span>
                <span style={{ fontSize: 11.5, color: 'var(--gold-2)', fontWeight: 600 }}>{asanaConfig.sanskritName}</span>
              </div>

              {isAsymmetric && (
                <span style={{ background: 'rgba(18, 23, 43, 0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 100, fontSize: 11.5, color: '#38BDF8', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  {selectedSide === 'left' ? '👈 Left' : '👉 Right'}
                </span>
              )}
            </div>

            {/* Right: Language + Timer + Guide */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(18, 23, 43, 0.88)', backdropFilter: 'blur(10px)', padding: '5px 10px', borderRadius: 100, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#EDEEF6', fontSize: 11.5, fontWeight: 700 }}>
                🔊 {language === 'te' ? 'తెలుగు' : 'English'}
              </span>

              {sessionPhase === 'coaching' && (
                <span style={{ background: 'rgba(18, 23, 43, 0.88)', backdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: 100, border: '1px solid rgba(232, 163, 61, 0.3)', color: 'var(--gold-2)', fontSize: 12.5, fontWeight: 700 }}>
                  ⏱️ {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
                </span>
              )}

              <button
                onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
                style={{
                  background: showReferenceOverlay ? 'var(--gold)' : 'rgba(18, 23, 43, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: showReferenceOverlay ? '#12172B' : '#EDEEF6',
                  padding: '5px 10px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🖼️ Guide
              </button>
            </div>
          </div>

          {/* REFERENCE THUMBNAIL OVERLAY (Top-right flyout) */}
          {showReferenceOverlay && (
            <div
              style={{
                position: 'absolute',
                top: 60,
                right: 14,
                width: 170,
                background: 'rgba(18, 23, 43, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(232, 163, 61, 0.4)',
                borderRadius: 14,
                padding: 8,
                zIndex: 20,
                pointerEvents: 'auto',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src={asanaConfig.referencePhoto || asanaConfig.image}
                alt={asanaConfig.name}
                style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 4 }}
              />
              <div style={{ fontSize: 11, color: '#C7CBE0', textAlign: 'center', fontWeight: 600 }}>
                Target Posture
              </div>
            </div>
          )}

          {/* NON-BLOCKING ACTIVE TRACKING LOSS FLOATING WARNING */}
          {activeTrackingWarning && !isPaused && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#FFFFFF', padding: '7px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span>
                <span>{activeTrackingWarning}</span>
              </div>
            </div>
          )}

          {/* IMMERSIVE READY / PREVIEW STATE HERO CARD */}
          {sessionPhase === 'ready_preview' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                pointerEvents: 'auto',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  background: 'rgba(18, 23, 43, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(232, 163, 61, 0.5)',
                  borderRadius: 22,
                  padding: '20px 24px',
                  maxWidth: 480,
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--gold-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {asanaConfig.name.toUpperCase()}
                </div>

                {/* Big Primary Score (48-64px) */}
                <div style={{ fontSize: 'clamp(42px, 7vw, 56px)', fontWeight: 800, color: currentTier?.color || 'var(--gold-2)', margin: '2px 0 0', lineHeight: 1 }}>
                  {coachingResult?.score !== null && coachingResult?.score !== undefined ? `${coachingResult.score}%` : '—'}
                </div>

                {/* Secondary Status Word (24-32px) */}
                <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 800, color: currentTier?.color || '#86EFAC', margin: '4px 0 12px', letterSpacing: '0.5px' }}>
                  {currentTier?.label || 'READY'}
                </div>

                {/* Readiness Badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: 12, color: '#86EFAC', fontWeight: 600, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span>✓ Full body visible</span>
                  <span>✓ Vision ready</span>
                  <span>✓ {selectedSide === 'left' ? 'Left lead' : 'Right lead'}</span>
                </div>

                {/* Prominent Start Coaching Button */}
                <button
                  onClick={handleStartCoaching}
                  disabled={isStartingSession}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--gold)',
                    color: '#12172B',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: isStartingSession ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(232, 163, 61, 0.45)',
                  }}
                >
                  {isStartingSession ? 'Starting Coaching…' : '▶ START COACHING'}
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE COACHING BOTTOM IMMERSIVE OVERLAY PANEL */}
          {sessionPhase === 'coaching' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                pointerEvents: 'auto',
              }}
            >
              {/* PRIMARY SPOKEN CORRECTION CUE PILL / EXCELLENT STATE */}
              {coachingResult?.topCorrection ? (
                <div
                  style={{
                    background: 'rgba(18, 23, 43, 0.94)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(232, 163, 61, 0.5)',
                    borderRadius: 16,
                    padding: '10px 20px',
                    textAlign: 'center',
                    maxWidth: 480,
                    width: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--gold-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎯 Adjustment
                  </div>
                  <div style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 700, color: '#FFFFFF', margin: '3px 0 1px', fontFamily: 'var(--font-indic)' }}>
                    {getCorrectionText(coachingResult.topCorrection.correctionKey, language, 'live') || coachingResult.topCorrection.description}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--gold-2)', fontWeight: 600 }}>
                    🔊 {language === 'te' ? 'తెలుగు' : 'English'}
                  </div>
                </div>
              ) : coachingResult?.isStable || (coachingResult?.score >= 90) ? (
                <div
                  style={{
                    background: 'rgba(18, 23, 43, 0.94)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(47, 109, 79, 0.8)',
                    borderRadius: 16,
                    padding: '8px 18px',
                    textAlign: 'center',
                    maxWidth: 400,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#86EFAC', textTransform: 'uppercase' }}>
                    ✓ Position Held
                  </div>
                  <div style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 700, color: '#FFFFFF', marginTop: 2, fontFamily: 'var(--font-indic)' }}>
                    {language === 'te' ? 'చాలా బాగుంది! ఇలాగే స్థిరంగా ఉండండి.' : 'Hold this position.'}
                  </div>
                </div>
              ) : null}

              {/* CONTROLS & SCORE HIERARCHY BAR */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 540,
                  background: 'rgba(18, 23, 43, 0.92)',
                  backdropFilter: 'blur(12px)',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Score & Status Hierarchy */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, color: currentTier?.color || 'var(--gold-2)', lineHeight: 1 }}>
                    {coachingResult?.score !== null && coachingResult?.score !== undefined ? `${coachingResult.score}%` : '—'}
                  </div>
                  {currentTier && (
                    <div style={{ fontSize: 'clamp(13px, 2.5vw, 18px)', fontWeight: 800, color: currentTier.color || '#86EFAC', letterSpacing: '0.5px' }}>
                      {currentTier.label}
                    </div>
                  )}
                </div>

                {/* Center Rhythmic Breathing Indicator */}
                <div className="breathe-dock" style={{ transform: 'scale(0.65)' }}>
                  <div className="breathe-circle">
                    <div className="breathe-core" />
                  </div>
                </div>

                {/* Actions: Pause & Finish */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={handleTogglePause}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#EDEEF6',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>

                  <button
                    onClick={handleFinishSession}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--clay)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(198, 93, 75, 0.35)',
                    }}
                  >
                    ⏹ Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAUSED STATE OVERLAY */}
          {isPaused && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 14, 28, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, pointerEvents: 'auto' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>⏸️</div>
              <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>Session Paused</h2>
              <p style={{ color: '#9AA0C4', fontSize: 13.5, margin: '0 0 18px' }}>
                Take a breather. Posture scoring and voice guidance are paused.
              </p>
              <button
                onClick={handleTogglePause}
                style={{
                  padding: '11px 26px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--gold)',
                  color: '#12172B',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                ▶ Resume Coaching
              </button>
            </div>
          )}

          {/* EXIT CONFIRMATION MODAL */}
          {showExitConfirm && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                zIndex: 50,
                pointerEvents: 'auto',
              }}
            >
              <div style={{ background: '#161B32', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 24, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 20px 48px rgba(0,0,0,0.6)' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 19 }}>Leave this session?</h3>
                <p style={{ color: '#9AA0C4', fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.5 }}>
                  Your session progress will be finalized and recorded.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'transparent',
                      color: '#EDEEF6',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleFinishSession}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--clay)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    End & Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 4: POST-SESSION PROGRESSION SUMMARY VIEW */}
      {/* ========================================================================= */}
      {sessionPhase === 'summary' && sessionSummaryData && (
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '40px auto', background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: '32px 20px', boxShadow: '0 20px 48px rgba(0,0,0,0.4)', textAlign: 'center', width: 'calc(100% - 32px)', boxSizing: 'border-box' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232, 163, 61, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26, color: 'var(--gold-2)' }}>
            ☀️
          </div>

          <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', margin: '0 0 6px' }}>
            Session Complete — {sessionSummaryData.asanaName}
          </h2>
          <p style={{ color: '#9AA0C4', fontSize: 13.5, margin: '0 0 24px' }}>
            {sessionSummaryData.sanskritName} practice session recorded.
          </p>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 14, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 11.5, color: '#9AA0C4' }}>Average Score</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: 'var(--gold-2)', marginTop: 2 }}>
                {sessionSummaryData.avgScore}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 14, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 11.5, color: '#9AA0C4' }}>Best Hold</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#86EFAC', marginTop: 2 }}>
                {Math.floor(sessionSummaryData.bestHoldDuration / 60)}:{(sessionSummaryData.bestHoldDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 14, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: 11.5, color: '#9AA0C4' }}>Duration</div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 800, color: '#EDEEF6', marginTop: 2 }}>
                {Math.floor(sessionSummaryData.durationSeconds / 60)}:{(sessionSummaryData.durationSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Personal Progression Delta */}
          {computeImprovement(sessionSummaryData.firstScore, sessionSummaryData.avgScore) && (
            <div style={{ background: 'rgba(232, 163, 61, 0.12)', border: '1px solid rgba(232, 163, 61, 0.3)', borderRadius: 12, padding: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gold-2)', fontWeight: 600 }}>
                Baseline: {sessionSummaryData.firstScore}% → Current: {sessionSummaryData.avgScore}%
              </span>
              <span style={{ background: 'var(--gold)', color: '#12172B', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                {computeImprovement(sessionSummaryData.firstScore, sessionSummaryData.avgScore).formatted} points
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleRestartSetup}
              style={{
                padding: '11px 22px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--gold)',
                color: '#12172B',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🔄 Practice Again
            </button>
            <button
              onClick={() => navigate('/asanas')}
              style={{
                padding: '11px 22px',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.18)',
                background: 'transparent',
                color: '#EDEEF6',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🌿 Asana Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
