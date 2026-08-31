/**
 * photoAnalysisService.js
 * Client service to communicate with Flask CV Service /analyze endpoint,
 * with graceful browser-side MediaPipe IMAGE mode fallback supporting all 8 asanas.
 */
import { getPoseLandmarker, detectImage } from './poseLandmarker';
import { runCoachingEngine } from '../engine/coachingEngine';
import { getAsanaConfig } from '../engine/poseRules';
import { drawPoseSkeleton } from '../engine/skeletonDrawer';

const CV_SERVICE_URL = import.meta.env?.VITE_CV_SERVICE_URL || 'http://localhost:5001';

/**
 * Validates uploaded photo file
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePhotoFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'File size exceeds 10 MB limit. Please choose a smaller image.',
    };
  }

  return { valid: true };
}

/**
 * Analyzes photo via Flask CV service
 * @param {File | Blob} imageFile
 * @param {string} asanaId
 * @returns {Promise<object>} Analysis report card data
 */
export async function analyzePhotoViaCvService(imageFile, asanaId = 'virabhadrasanaII') {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('asanaId', asanaId);

  const endpoint = `${CV_SERVICE_URL.replace(/\/+$/, '')}/analyze`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `CV Service responded with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Fallback browser-side analysis using @mediapipe/tasks-vision IMAGE mode
 * @param {HTMLImageElement} imgElement
 * @param {string} asanaId
 * @returns {Promise<object>}
 */
export async function analyzePhotoInBrowser(imgElement, asanaId = 'virabhadrasanaII') {
  const poseRules = getAsanaConfig(asanaId) || getAsanaConfig('virabhadrasanaII');
  await getPoseLandmarker('IMAGE');
  const detection = detectImage(imgElement);

  if (!detection || !detection.landmarks || detection.landmarks.length === 0) {
    return {
      success: true,
      pose_detected: false,
      session_ready: false,
      message: 'No person detected in the photo. Please ensure your full body is visible in the frame.',
      score: null,
      landmarks: [],
      rule_results: [],
      strengths: [],
      areas_to_improve: [],
      top_correction: null,
      visibility: { passed: false, visible_fraction: 0.0, message: 'No person detected' },
      annotated_image: null,
    };
  }

  const lms = detection.landmarks[0];
  const coaching = runCoachingEngine(lms, poseRules);

  // Generate annotated canvas data URL
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth || imgElement.width || 640;
  canvas.height = imgElement.naturalHeight || imgElement.height || 480;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  drawPoseSkeleton(ctx, lms, canvas.width, canvas.height, {
    lineWidth: 4,
    jointRadius: 6,
    isMirrored: false,
  });

  const annotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

  return {
    success: true,
    pose_detected: true,
    session_ready: coaching.sessionReady,
    asana_id: asanaId,
    asana_name: `${poseRules.name} (${poseRules.sanskritName})`,
    score: coaching.score,
    landmarks: lms,
    rule_results: (coaching.ruleResults || []).map((r) => ({
      rule_id: r.ruleId,
      description: r.description,
      angle: r.angle,
      rule_score: r.ruleScore,
      direction: r.direction,
      deviation_deg: r.deviationDeg,
      target_min: r.targetMin,
      target_max: r.targetMax,
      severity: r.severity,
      status: r.direction === 'on_target' ? 'pass' : 'deviated',
      correction_key: r.correctionTemplates?.[r.direction] || '',
    })),
    strengths: (coaching.strengths || []).map((s) => s.replace(/_/g, ' ')),
    areas_to_improve: (coaching.allDeviations || []).map((d) => d.description.split(' (')[0]),
    top_correction: coaching.topCorrection
      ? {
          rule_id: coaching.topCorrection.ruleId,
          severity: coaching.topCorrection.severity,
          deviation_deg: coaching.topCorrection.deviationDeg,
          correction_key: coaching.topCorrection.correctionKey,
        }
      : null,
    visibility: {
      passed: coaching.sessionReady,
      visible_fraction: coaching.sessionReady ? 1.0 : 0.4,
      message: coaching.message,
    },
    annotated_image: annotatedDataUrl,
  };
}
