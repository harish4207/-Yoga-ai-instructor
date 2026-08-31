/**
 * PhotoAnalysis.jsx
 * Phase 4 & 5A — Desktop Two-Column Photo Report Card with Pre-Practice
 * Language Selection, Usha Paper Theme, and Single-Audio-Output Rule.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import {
  validatePhotoFile,
  analyzePhotoViaCvService,
  analyzePhotoInBrowser,
} from '../services/photoAnalysisService';
import audioFeedbackService from '../services/audioFeedbackService';
import { getCorrectionText, getCorrectionReportText } from '../services/correctionRegistry';
import { ASANA_CURRICULUM, getAsanaConfig } from '../engine/poseRules';
import { getScoreTier, computeImprovement } from '../engine/scoringEngine';
import api from '../services/api';

const ASYMMETRIC_ASANAS = ['vrikshasana', 'trikonasana', 'virabhadrasanaII'];

export default function PhotoAnalysis() {
  const { asanaId } = useParams();
  const navigate = useNavigate();
  const { language, changeLanguage } = useApp();
  const { user } = useUser();

  const currentAsanaId = asanaId && getAsanaConfig(asanaId) ? asanaId : 'virabhadrasanaII';
  const asanaConfig = getAsanaConfig(currentAsanaId) || getAsanaConfig('virabhadrasanaII');

  // Flow State: 'lang_select' | 'input' | 'report'
  const [phase, setPhase] = useState('lang_select');
  const [selectedLangChoice, setSelectedLangChoice] = useState(language || 'en');

  // Input Mode: 'upload' | 'camera'
  const [inputMode, setInputMode] = useState('upload');

  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Live Webcam Snapshot State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisError, setAnalysisError] = useState(null);

  // Report & View State
  const [report, setReport] = useState(null);
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' | 'original' | 'split'
  const [progressHistory, setProgressHistory] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const previewImgRef = useRef(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setCountdown(null);
  }, []);

  // Clean up object URLs and camera on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopCamera();
    };
  }, [previewUrl, stopCamera]);

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

  // Start Camera for Live Photo Mode
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access webcam. Please verify camera permissions or upload an image file.');
      setCameraActive(false);
    }
  };

  // Switch Input Mode
  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    setFileError(null);
    setAnalysisError(null);
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Capture Snapshot from Webcam
  const captureSnapshot = (useCountdown = true) => {
    if (useCountdown) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            executeCapture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const executeCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `webcam_snapshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  // Handle File Selection via Upload / Drop
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setReport(null);
    setAnalysisError(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Confirm Language Selection
  const handleConfirmLanguage = () => {
    changeLanguage(selectedLangChoice);
    setPhase('input');
  };

  // Run Photo Analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep('Connecting to CV Service…');

    try {
      let result = null;

      // 1. Try Flask CV Service (/analyze)
      try {
        setAnalysisStep('Extracting 33 Body Landmarks (MediaPipe IMAGE mode)…');
        result = await analyzePhotoViaCvService(selectedFile, currentAsanaId);
      } catch (cvErr) {
        console.warn('Flask CV Service unavailable, falling back to Browser MediaPipe:', cvErr.message);
        setAnalysisStep('Analyzing with on-device Browser MediaPipe…');

        if (previewImgRef.current) {
          result = await analyzePhotoInBrowser(previewImgRef.current, currentAsanaId);
        } else {
          throw cvErr;
        }
      }

      setReport(result);
      setPhase('report');
      setIsAnalyzing(false);

      // Auto-save session if user is authenticated and score is valid
      if (user && result.session_ready && result.score !== null) {
        try {
          await api.post('/sessions', {
            asanaId: currentAsanaId,
            mode: 'photo',
            language,
            durationSeconds: 1,
            snapshots: [
              {
                score: result.score,
                ruleResults: result.rule_results,
              },
            ],
          });
          const progRes = await api.get(`/progress/${currentAsanaId}`);
          if (progRes.data && progRes.data.progress) {
            setProgressHistory(progRes.data.progress);
          }
        } catch (saveErr) {
          console.debug('Could not auto-save session:', saveErr.message);
        }
      }
    } catch (err) {
      console.error('Photo analysis failed:', err);
      setAnalysisError(err.message || 'Failed to analyze the photograph. Please try another image.');
      setIsAnalyzing(false);
    }
  };

  // Local Audio Playback for Correction
  const handlePlayAudio = async (correctionKey) => {
    if (!correctionKey) return;
    setIsPlayingAudio(true);
    try {
      await audioFeedbackService.playCorrection(correctionKey, language, { force: true });
    } catch (err) {
      console.warn('Audio playback issue:', err);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Reset analysis
  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setReport(null);
    setFileError(null);
    setAnalysisError(null);
    setPhase('input');
    stopCamera();
  };

  // Compute personal improvement
  const improvement = report && report.score !== null && progressHistory
    ? computeImprovement(progressHistory.firstScore ?? report.score, report.score)
    : null;

  const scorePct = report && report.score !== null ? Math.min(100, Math.max(0, report.score)) : 0;

  return (
    <div style={{ background: phase === 'report' ? 'var(--paper)' : 'var(--night)', minHeight: 'calc(100vh - 65px)', color: phase === 'report' ? 'var(--ink)' : '#FFFFFF', transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Top Header & Asana Selection Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: phase === 'report' ? 'var(--muted)' : '#9AA0C4', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Photo Analysis & Report Card
            </div>
            <h1 style={{ fontSize: 28, margin: '4px 0 0', color: phase === 'report' ? 'var(--ink)' : '#FFFFFF' }}>
              {asanaConfig.name} <span style={{ fontSize: 18, color: phase === 'report' ? 'var(--leaf)' : 'var(--gold-2)', fontWeight: 600 }}>({asanaConfig.sanskritName})</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={currentAsanaId}
              onChange={(e) => {
                handleReset();
                navigate(`/photo/${e.target.value}`);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: phase === 'report' ? '1px solid #D1D5DB' : '1px solid rgba(255,255,255,0.18)',
                background: phase === 'report' ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                color: phase === 'report' ? '#1F2937' : '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {ASANA_CURRICULUM.map((a) => (
                <option key={a.id} value={a.id} style={{ background: '#12172B', color: '#fff' }}>
                  {a.name} ({a.sanskritName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hidden reference img for client-side fallback */}
        {previewUrl && (
          <img
            ref={previewImgRef}
            src={previewUrl}
            alt="Hidden reference"
            style={{ display: 'none' }}
            crossOrigin="anonymous"
          />
        )}

        {/* ========================================================================= */}
        {/* PHASE 0: PRE-PRACTICE LANGUAGE SELECTION */}
        {/* ========================================================================= */}
        {phase === 'lang_select' && (
          <div style={{ maxWidth: 540, margin: '60px auto', background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 36, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232, 163, 61, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>
              🗣️
            </div>

            <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{asanaConfig.name} ({asanaConfig.sanskritName})</h2>
            <p style={{ color: '#C7CBE0', fontSize: 15, margin: '0 0 24px' }}>
              Which language are you comfortable with for report analysis?
            </p>

            <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
              <button
                onClick={() => setSelectedLangChoice('en')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: selectedLangChoice === 'en' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedLangChoice === 'en' ? 'rgba(232, 163, 61, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedLangChoice === 'en' ? 'var(--gold-2)' : '#EDEEF6',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>English</div>
                <div style={{ fontSize: 12, color: '#9AA0C4', marginTop: 4 }}>Structured analysis</div>
              </button>

              <button
                onClick={() => setSelectedLangChoice('te')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: selectedLangChoice === 'te' ? '2px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: selectedLangChoice === 'te' ? 'rgba(232, 163, 61, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedLangChoice === 'te' ? 'var(--gold-2)' : '#EDEEF6',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'var(--font-indic)',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>తెలుగు</div>
                <div style={{ fontSize: 12, color: '#9AA0C4', marginTop: 4 }}>తెలుగు విశ్లేషణ</div>
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
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(232, 163, 61, 0.35)',
              }}
            >
              Continue to Photo Input →
            </button>

            <button
              onClick={() => navigate('/asanas')}
              style={{
                display: 'block',
                margin: '16px auto 0',
                background: 'none',
                border: 'none',
                color: '#9AA0C4',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back to Asana Library
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 1: INPUT MODES (UPLOAD PHOTO OR WEBCAM SNAPSHOT) */}
        {/* ========================================================================= */}
        {phase === 'input' && (
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <button
              onClick={() => setPhase('lang_select')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-2)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← Back to Language Selection
            </button>
            {/* Input Mode Selector Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', padding: 4, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => handleModeSwitch('upload')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: inputMode === 'upload' ? 'var(--gold)' : 'transparent',
                  color: inputMode === 'upload' ? '#12172B' : '#C7CBE0',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📁 Upload Photo File
              </button>
              <button
                onClick={() => handleModeSwitch('camera')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: inputMode === 'camera' ? 'var(--gold)' : 'transparent',
                  color: inputMode === 'camera' ? '#12172B' : '#C7CBE0',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📷 Take Live Snapshot (Webcam)
              </button>
            </div>

            {/* Mode A: File Upload Dropzone */}
            {inputMode === 'upload' && !previewUrl && (
              <div
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: 18,
                  padding: 44,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 12 }}>🖼️</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>Upload {asanaConfig.name} Photo</h3>
                <p style={{ color: '#9AA0C4', fontSize: 14, margin: '0 0 20px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                  Select a clear full-body image. Supported formats: <strong>JPEG, PNG, WebP</strong> (up to 10 MB).
                </p>

                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="photo-upload"
                  style={{
                    padding: '12px 26px',
                    borderRadius: 10,
                    background: 'var(--gold)',
                    color: '#12172B',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'inline-block',
                    boxShadow: '0 4px 16px rgba(232, 163, 61, 0.3)',
                  }}
                >
                  Choose Image File
                </label>

                {fileError && (
                  <div style={{ marginTop: 16, color: '#F87171', fontSize: 13, fontWeight: 600 }}>
                    ⚠️ {fileError}
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Live Webcam Snapshot */}
            {inputMode === 'camera' && !previewUrl && (
              <div style={{ background: '#0B0E1C', borderRadius: 18, overflow: 'hidden', textAlign: 'center', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: cameraActive ? 'block' : 'none' }}
                />

                {countdown && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 80, fontWeight: 800 }}>
                    {countdown}
                  </div>
                )}

                {cameraError && (
                  <div style={{ padding: 32, color: '#F87171', fontSize: 14 }}>
                    ⚠️ {cameraError}
                  </div>
                )}

                {cameraActive && (
                  <div style={{ padding: 18, background: '#12172B', display: 'flex', justifyContent: 'center', gap: 14 }}>
                    <button
                      onClick={() => captureSnapshot(true)}
                      style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--gold)', color: '#12172B', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⏱️ Snap (3s Countdown)
                    </button>
                    <button
                      onClick={() => captureSnapshot(false)}
                      style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      📸 Instant Capture
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Selected Image Preview & Analyze CTA */}
            {previewUrl && (
              <div style={{ background: '#161B32', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 18, padding: 24, textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 16 }}>Photo Preview</h4>
                <div style={{ maxWidth: 440, margin: '0 auto 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 380, objectFit: 'contain' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    style={{
                      padding: '12px 28px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'var(--gold)',
                      color: '#12172B',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 18px rgba(232, 163, 61, 0.35)',
                    }}
                  >
                    {isAnalyzing ? 'Analyzing…' : '⚡ Analyze Posture'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isAnalyzing}
                    style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Retake / Choose Another
                  </button>
                </div>

                {isAnalyzing && (
                  <div style={{ marginTop: 18, color: 'var(--gold-2)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(232,163,61,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {analysisStep}
                  </div>
                )}

                {analysisError && (
                  <div style={{ marginTop: 16, padding: 14, background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13 }}>
                    ⚠️ {analysisError}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: DESKTOP TWO-COLUMN REPORT CARD (PAPER THEME) */}
        {/* ========================================================================= */}
        {phase === 'report' && report && (
          <div>
            {!report.session_ready ? (
              <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: 18, padding: 40, textAlign: 'center', maxWidth: 680, margin: '0 auto', color: '#1B1F2A' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
                <h2 style={{ margin: '0 0 10px', color: '#991B1B', fontSize: 22 }}>
                  Unable to Confidently Evaluate Pose
                </h2>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.5, margin: '0 0 24px' }}>
                  {report.message || 'Please upload a photo where your full body is visible from head to toe.'}
                </p>
                <button onClick={handleReset} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'var(--gold)', color: '#12172B', fontWeight: 700, cursor: 'pointer' }}>
                  Try Another Photo
                </button>
              </div>
            ) : (
              <div>
                {/* 2-Column Hero Card (Responsive Grid) */}
                <div className="photo-report-hero-grid" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 22, padding: 'clamp(16px, 3vw, 28px)', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  {/* Left: Annotated Visualizer */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>Pose Annotation</span>
                      <div style={{ display: 'flex', gap: 4, background: '#F1F4EE', padding: 3, borderRadius: 8 }}>
                        <button
                          onClick={() => setViewMode('annotated')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: viewMode === 'annotated' ? '#fff' : 'transparent',
                            color: viewMode === 'annotated' ? 'var(--ink)' : 'var(--muted)',
                            fontWeight: viewMode === 'annotated' ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Annotated
                        </button>
                        <button
                          onClick={() => setViewMode('original')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: viewMode === 'original' ? '#fff' : 'transparent',
                            color: viewMode === 'original' ? 'var(--ink)' : 'var(--muted)',
                            fontWeight: viewMode === 'original' ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Original
                        </button>
                        <button
                          onClick={() => setViewMode('split')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: viewMode === 'split' ? '#fff' : 'transparent',
                            color: viewMode === 'split' ? 'var(--ink)' : 'var(--muted)',
                            fontWeight: viewMode === 'split' ? 700 : 500,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Split
                        </button>
                      </div>
                    </div>

                    <div style={{ borderRadius: 14, overflow: 'hidden', background: '#12172B', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {viewMode === 'annotated' && (
                        <img src={report.annotated_image || previewUrl} alt="Annotated Pose" style={{ width: '100%', height: 'auto', maxHeight: 420, objectFit: 'contain' }} />
                      )}
                      {viewMode === 'original' && (
                        <img src={previewUrl} alt="Original Pose" style={{ width: '100%', height: 'auto', maxHeight: 420, objectFit: 'contain' }} />
                      )}
                      {viewMode === 'split' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' }}>
                          <img src={previewUrl} alt="Original" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                          <img src={report.annotated_image || previewUrl} alt="Annotated" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Accuracy Score Ring Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ background: 'var(--night)', borderRadius: 18, padding: 24, color: '#fff', textAlign: 'center' }}>
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: '50%',
                          margin: '0 auto 16px',
                          background: `conic-gradient(var(--gold) 0% ${scorePct}%, rgba(255,255,255,0.12) ${scorePct}% 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ width: 112, height: 112, borderRadius: '50%', background: 'var(--night)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 36, color: '#fff' }}>
                            {report.score}%
                          </div>
                          <div style={{ fontSize: 11, color: '#9AA0C4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {(getScoreTier(report.score) || {}).label || 'ACCURACY'}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 14, color: '#C7CBE0', fontWeight: 600 }}>
                        {report.asana_name || asanaConfig.name}
                      </div>

                      {improvement && (
                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gold-2)', fontWeight: 700 }}>
                          Baseline: {progressHistory?.firstScore ?? report.score}% · Progression: {improvement.formatted} pts
                        </div>
                      )}
                    </div>

                    {/* Single Main Correction */}
                    {report.top_correction && (
                      <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 14, padding: 16, marginTop: 16, borderLeft: '4px solid #EA580C' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>
                          🎯 Primary Adjustment
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1B1F2A', margin: '4px 0' }}>
                          {getCorrectionText(report.top_correction.correction_key, language, 'live') || report.top_correction.description}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 8 }}>
                          {getCorrectionReportText(report.top_correction.correction_key, language) || 'Refine joint alignment.'}
                        </div>

                        <button
                          onClick={() => handlePlayAudio(report.top_correction.correction_key)}
                          disabled={isPlayingAudio}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #FDBA74',
                            background: '#FFF',
                            color: '#C2410C',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🔊 {isPlayingAudio ? 'Playing…' : 'Play Voice Cue'}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleReset}
                      style={{
                        marginTop: 16,
                        padding: '12px 20px',
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
                      📸 Analyze Another Photo
                    </button>
                  </div>
                </div>

                {/* Bottom: 2-Column Responsive Card Grid of Joint Breakdown */}
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ fontSize: 18, margin: '0 0 16px', color: 'var(--ink)' }}>
                    Biomechanical Joint Breakdown
                  </h3>
                  <div className="photo-breakdown-grid" style={{ gap: 14 }}>
                    {(report.rule_results || []).map((r, idx) => {
                      const isPass = r.direction === 'on_target' || (r.deviation_deg !== undefined && r.deviation_deg <= 3.0);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: 14,
                            padding: '14px 18px',
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: isPass ? 'var(--leaf)' : 'var(--clay)',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                              {r.description.split(' (')[0]}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              Target: {r.target_min}°–{r.target_max}° · {isPass ? 'Optimal alignment' : `${r.deviation_deg}° deviation`}
                            </div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isPass ? 'var(--leaf)' : 'var(--clay)' }}>
                            {r.angle !== null ? `${r.angle}°` : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
