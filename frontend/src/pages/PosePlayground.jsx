import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import virabhadrasanaII from '../engine/poseRules/virabhadrasanaII';
import { runCoachingEngine } from '../engine/coachingEngine';
import { drawPoseSkeleton } from '../engine/skeletonDrawer';
import { getPoseLandmarker, detectVideoFrame, detectImage } from '../services/poseLandmarker';
import audioFeedbackService from '../services/audioFeedbackService';
import { getMessage } from '../i18n';
import {
  getPerfectWarriorIILandmarks,
  getBentRearLegLandmarks,
  getStraightFrontKneeLandmarks,
  getObscuredLowerBodyLandmarks,
} from '../fixtures/warriorIIFixtures';

const FIXTURES = [
  { id: 'perfect', name: '✨ Perfect Form', loader: getPerfectWarriorIILandmarks },
  { id: 'bentRearLeg', name: '⚠️ Bent Rear Leg', loader: getBentRearLegLandmarks },
  { id: 'straightFrontKnee', name: '⚠️ Front Knee Too Straight', loader: getStraightFrontKneeLandmarks },
  { id: 'obscured', name: '🚫 Obscured Body / Low Visibility', loader: getObscuredLowerBodyLandmarks },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

export default function PosePlayground() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'fixture' | 'image'
  const [language, setLanguage] = useState('en');
  const [autoVoice, setAutoVoice] = useState(false);
  const [isMirror, setIsMirror] = useState(true);

  // Video / Canvas refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Model & State
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [fps, setFps] = useState(0);

  // Analysis result
  const [currentLandmarks, setCurrentLandmarks] = useState(null);
  const [coachingResult, setCoachingResult] = useState(null);
  const [selectedFixture, setSelectedFixture] = useState('perfect');
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);

  // Stop camera and audio on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      audioFeedbackService.stopCorrectionAudio();
      audioFeedbackService.resetCooldowns();
    };
  }, []);

  // FPS calculation
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Evaluate landmarks through full coaching engine pipeline
  const processLandmarks = useCallback((landmarks) => {
    setCurrentLandmarks(landmarks);
    if (!landmarks || landmarks.length === 0) {
      setCoachingResult({
        sessionReady: false,
        message: 'No person detected. Please step in front of the camera.',
        score: null,
        ruleResults: [],
        strengths: [],
        topCorrection: null,
        allDeviations: [],
      });
      return;
    }

    const result = runCoachingEngine(landmarks, virabhadrasanaII);
    setCoachingResult(result);

    // Auto-speak top correction if enabled (0 Sarvam runtime calls)
    if (autoVoice && result.sessionReady && result.topCorrection) {
      audioFeedbackService.playCorrection(result.topCorrection.correctionKey, language);
    }
  }, [autoVoice, language]);

  // Handle Fixture Selection
  const loadFixture = useCallback((fixtureId) => {
    setSelectedFixture(fixtureId);
    const fixtureItem = FIXTURES.find((f) => f.id === fixtureId);
    if (fixtureItem) {
      const lm = fixtureItem.loader();
      processLandmarks(lm);

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw neutral backdrop
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPoseSkeleton(ctx, lm, canvas.width, canvas.height, {
          lineWidth: 4,
          jointRadius: 6,
          isMirrored: false,
        });
      }
    }
  }, [processLandmarks]);

  // Load initial fixture on mount if in fixture mode
  useEffect(() => {
    if (activeTab === 'fixture') {
      loadFixture(selectedFixture);
    }
  }, [activeTab, selectedFixture, loadFixture]);

  // Start Camera
  const startCamera = async () => {
    setModelLoading(true);
    setModelError(null);
    try {
      await getPoseLandmarker('VIDEO');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraRunning(true);
          setModelLoading(false);
          startDetectionLoop();
        };
      }
    } catch (err) {
      console.error('Camera or MediaPipe initialization failed:', err);
      setModelError(`Failed to initialize camera or MediaPipe: ${err.message}`);
      setModelLoading(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
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
    audioFeedbackService.resetCooldowns();
  };

  // Real-time video detection loop
  const startDetectionLoop = () => {
    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState >= 2 && canvas) {
        // Match canvas dimensions to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const now = performance.now();
        frameCountRef.current += 1;
        if (now - lastFrameTimeRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current)));
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }

        try {
          const detection = detectVideoFrame(video, now);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection && detection.landmarks && detection.landmarks.length > 0) {
            const lms = detection.landmarks[0];
            drawPoseSkeleton(ctx, lms, canvas.width, canvas.height, {
              lineWidth: 4,
              jointRadius: 6,
              isMirrored: isMirror,
            });
            processLandmarks(lms);
          } else {
            processLandmarks(null);
          }
        } catch (e) {
          console.debug('Frame detection skipped:', e.message);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Image Upload Handling
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedImageSrc(url);
    setModelLoading(true);
    setModelError(null);

    try {
      await getPoseLandmarker('IMAGE');
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const detection = detectImage(img);
          if (detection && detection.landmarks && detection.landmarks.length > 0) {
            const lms = detection.landmarks[0];
            drawPoseSkeleton(ctx, lms, canvas.width, canvas.height, {
              lineWidth: 4,
              jointRadius: 6,
              isMirrored: false,
            });
            processLandmarks(lms);
          } else {
            processLandmarks(null);
          }
        }
        setModelLoading(false);
      };
    } catch (err) {
      console.error('Image analysis error:', err);
      setModelError(`Failed to process image: ${err.message}`);
      setModelLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeech();
    };
  }, []);

  // Voice feedback trigger
  const handleSpeakCorrection = () => {
    if (coachingResult?.topCorrection) {
      const text = getMessage(coachingResult.topCorrection.correctionKey, language);
      if (text) speak(text, language, { force: true });
    } else if (coachingResult?.sessionReady && coachingResult.score >= 80) {
      speak(getMessage('great_improvement', language), language, { force: true });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1200, margin: '0 auto', padding: 24, color: '#1e293b' }}>
      {/* Developer Banner */}
      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '8px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🛠️ DEVELOPER TESTING PLAYGROUND — Internal Diagnostic Tool (Not linked in primary navigation)</span>
        <span style={{ fontSize: 11, background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>DEBUG ONLY</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🧘</span> Pose Playground — Virabhadrasana II (Warrior II)
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            MediaPipe Pose Landmarker → 33 Landmarks → Visibility Gate → Rule Assessment → Scoring Engine → Sarvam TTS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 14 }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/asanas')}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            ← Library
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('camera');
          }}
          style={activeTab === 'camera' ? activeTabBtn : inactiveTabBtn}
        >
          📹 Live Webcam
        </button>
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('fixture');
            loadFixture(selectedFixture);
          }}
          style={activeTab === 'fixture' ? activeTabBtn : inactiveTabBtn}
        >
          🧪 Test Fixtures (No Webcam Required)
        </button>
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('image');
          }}
          style={activeTab === 'image' ? activeTabBtn : inactiveTabBtn}
        >
          🖼️ Image Upload
        </button>
      </div>

      {/* Main Grid: LEFT (Input & Visuals) vs RIGHT (Pose Diagnostics & Rules) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT PANEL */}
        <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          {/* Tab Subcontrols */}
          {activeTab === 'camera' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {!isCameraRunning ? (
                  <button
                    onClick={startCamera}
                    disabled={modelLoading}
                    style={{ ...actionBtn, background: '#16a34a' }}
                  >
                    {modelLoading ? '⏳ Initializing MediaPipe…' : '▶ Start Camera'}
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    style={{ ...actionBtn, background: '#dc2626' }}
                  >
                    ⏹ Stop Camera
                  </button>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isMirror}
                    onChange={(e) => setIsMirror(e.target.checked)}
                  />
                  Mirror View
                </label>
              </div>
              {isCameraRunning && (
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                  ● Live ({fps} FPS)
                </span>
              )}
            </div>
          )}

          {activeTab === 'fixture' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {FIXTURES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => loadFixture(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: selectedFixture === f.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: selectedFixture === f.id ? '#eff6ff' : '#fff',
                    color: selectedFixture === f.id ? '#1d4ed8' : '#334155',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: selectedFixture === f.id ? 600 : 400,
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'image' && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ fontSize: 14 }}
              />
              {modelLoading && <span style={{ marginLeft: 10, fontSize: 13, color: '#2563eb' }}>Processing with MediaPipe…</span>}
            </div>
          )}

          {modelError && (
            <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
              {modelError}
            </div>
          )}

          {/* Viewport Canvas + Video */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              background: '#0f172a',
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Hidden Video element for MediaPipe input */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                display: activeTab === 'camera' && isCameraRunning ? 'block' : 'none',
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isMirror ? 'scaleX(-1)' : 'none',
              }}
            />

            {/* Skeleton Overlay Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />

            {/* Idle placeholder message */}
            {activeTab === 'camera' && !isCameraRunning && (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Camera is stopped</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Click "Start Camera" above to begin real-time pose tracking.</div>
              </div>
            )}

            {activeTab === 'image' && !uploadedImageSrc && (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>No image uploaded</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Select a yoga photo to evaluate alignment landmarks.</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Skeleton: 🟢 Major Joints · 🟡 Keypoints · 🔷 Bones</span>
            <span>Orientation: Front-facing standing</span>
          </div>
        </div>

        {/* RIGHT PANEL: Pose Assessment & Diagnostics */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Top Status & Score Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', fontWeight: 600 }}>
                Pose Detected
              </span>
              <div style={{ fontSize: 18, fontWeight: 700, color: currentLandmarks ? '#16a34a' : '#94a3b8' }}>
                {currentLandmarks ? 'YES' : 'NO'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', fontWeight: 600 }}>
                Overall Score
              </span>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color:
                    coachingResult?.score === null
                      ? '#94a3b8'
                      : coachingResult.score >= 80
                      ? '#16a34a'
                      : coachingResult.score >= 60
                      ? '#d97706'
                      : '#dc2626',
                }}
              >
                {coachingResult?.score !== null && coachingResult?.score !== undefined
                  ? `${coachingResult.score}%`
                  : '—'}
              </div>
            </div>
          </div>

          {/* Visibility / Confidence Gate Warning */}
          {coachingResult && !coachingResult.sessionReady && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: '#991b1b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span> Unable to confidently evaluate this part of the pose.
              </div>
              <p style={{ margin: '6px 0 0', color: '#b91c1c', fontSize: 13 }}>
                {coachingResult.message || 'Please step back so your full body from head to feet is visible in the camera.'}
              </p>
            </div>
          )}

          {/* Rules Breakdown */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, margin: '0 0 10px', color: '#334155', fontWeight: 600 }}>
              Alignment Rules (Virabhadrasana II)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {virabhadrasanaII.rules.map((rule) => {
                const evaluated = coachingResult?.ruleResults?.find((r) => r.ruleId === rule.ruleId);
                const isSkipped = coachingResult?.invisibleRules?.includes(rule.ruleId);

                return (
                  <div
                    key={rule.ruleId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>
                        {rule.description}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Target: {rule.targetMin}° – {rule.targetMax}°
                        {evaluated ? ` · Measured: ${evaluated.angle}°` : ''}
                      </div>
                    </div>

                    <div>
                      {isSkipped || !coachingResult?.sessionReady ? (
                        <span style={{ fontSize: 12, color: '#94a3b8', background: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>
                          {isSkipped ? 'Low Vis ⚠' : '—'}
                        </span>
                      ) : evaluated ? (
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              evaluated.ruleScore >= 80
                                ? '#16a34a'
                                : evaluated.ruleScore >= 60
                                ? '#d97706'
                                : '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {evaluated.ruleScore}% {evaluated.direction === 'on_target' ? '✓' : '⚠'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Top Correction */}
          {coachingResult?.sessionReady && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {/* Strengths */}
              {coachingResult.strengths.length > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>
                    ✓ Strengths
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#166534' }}>
                    {coachingResult.strengths.map((strId) => (
                      <li key={strId}>{strId.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Correction */}
              {coachingResult.topCorrection ? (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
                      Main Correction ({coachingResult.topCorrection.severity})
                    </span>
                    <span style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '1px 6px', borderRadius: 4 }}>
                      Deviation: {coachingResult.topCorrection.deviationDeg}°
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: '#92400e' }}>
                    "{getMessage(coachingResult.topCorrection.correctionKey, language)}"
                  </p>
                </div>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                    🌟 Excellent posture alignment across all rules!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sarvam AI TTS Voice Coaching Controls */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleSpeakCorrection}
              disabled={!coachingResult?.sessionReady}
              style={{
                ...actionBtn,
                background: coachingResult?.sessionReady ? '#4f46e5' : '#94a3b8',
                fontSize: 13,
                padding: '8px 14px',
              }}
            >
              🔊 Speak Correction (Sarvam TTS)
            </button>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoVoice}
                onChange={(e) => setAutoVoice(e.target.checked)}
              />
              Auto Voice Feedback
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const activeTabBtn = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
};

const inactiveTabBtn = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#475569',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 14,
};

const actionBtn = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
};
