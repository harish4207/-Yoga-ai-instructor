/**
 * coachingEngine.js
 * The core posture evaluation and coaching pipeline supporting modular rule types,
 * forgiving scoring, temporal smoothing, and stable-state logic.
 *
 * Supported Rule Types:
 * - 'angle': Standard 3-point joint angle (A -> B -> C) via cosine rule
 * - 'line_orientation': 2-point line angle relative to a cardinal axis ('horizontal' / 'vertical')
 * - 'horizontal_distance': Horizontal span between two landmarks (% of frame width)
 * - 'vertical_distance': Vertical span between two landmarks (% of frame height)
 * - 'symmetry': Bilateral symmetry ratio between left and right limb measurements
 *
 * Coaching State Model:
 * - POSE_NOT_READY: Landmark visibility gate failed or no person in frame
 * - EVALUATING: Pose recognized, calculating deviations
 * - STABLE: Overall score >= 80, NO critical rule failure, all meaningful rules satisfied
 * - ISSUE_DETECTED: Meaningful form deviations detected (prioritized by severity * deviation)
 * - COACHED: Primary spoken cue dispatched to audio layer
 * - IMPROVING: Real-time deviation reduction detected across consecutive frames
 * - RESOLVED: Prior deviation corrected, returning to STABLE
 */

import { LANDMARK, checkSessionReadiness, checkRuleLandmarks } from './visibilityGate';
import {
  calculateAngle,
  calculateLineOrientation,
  horizontalDistance,
  verticalDistance,
} from './angleUtils';
import { computeScore } from './scoringEngine';

export const COACHING_STATES = {
  POSE_NOT_READY: 'POSE_NOT_READY',
  EVALUATING: 'EVALUATING',
  STABLE: 'STABLE',
  ISSUE_DETECTED: 'ISSUE_DETECTED',
  COACHED: 'COACHED',
  IMPROVING: 'IMPROVING',
  RESOLVED: 'RESOLVED',
};

/**
 * Run the coaching engine for one frame of landmarks against an asana profile.
 *
 * @param {object[]} landmarks - Array of 33 MediaPipe normalized landmarks
 * @param {object} poseRules   - Asana configuration
 * @param {object} [options]   - Optional configuration { smoother }
 * @returns {object} Coaching output
 */
export function runCoachingEngine(landmarks, poseRules, options = {}) {
  // --- Step 1: Session readiness gate ---
  const readiness = checkSessionReadiness(landmarks, poseRules.requiredLandmarks);
  if (!readiness.passed) {
    return {
      sessionReady: false,
      status: COACHING_STATES.POSE_NOT_READY,
      message: readiness.message,
      score: null,
      tier: null,
      strengths: [],
      topCorrection: null,
      allDeviations: [],
      meaningfulDeviations: [],
      invisibleRules: [],
      candidateCue: null,
      shouldSpeak: false,
    };
  }

  // --- Step 2: Evaluate each rule based on its ruleType ---
  const evaluatedRules = poseRules.rules.map((rule) => {
    const ruleType = rule.ruleType || (rule.landmarkC !== undefined ? 'angle' : 'line_orientation');

    const requiredIndices = [rule.landmarkA, rule.landmarkB, rule.landmarkC]
      .filter((i) => i !== undefined && i !== null);

    const { visible } = checkRuleLandmarks(
      landmarks,
      requiredIndices,
      poseRules.minVisibilityThreshold
    );

    let rawAngle = -1;

    if (visible) {
      if (ruleType === 'line_orientation') {
        const A = landmarks[rule.landmarkA];
        const B = landmarks[rule.landmarkB];
        rawAngle = calculateLineOrientation(A, B, rule.referenceAxis || 'horizontal');
      } else if (ruleType === 'angle' && rule.landmarkA !== undefined && rule.landmarkB !== undefined && rule.landmarkC !== undefined) {
        const A = landmarks[rule.landmarkA];
        const B = landmarks[rule.landmarkB];
        const C = landmarks[rule.landmarkC];
        rawAngle = calculateAngle(A, B, C);
      } else if (ruleType === 'horizontal_distance' || rule.measureType === 'horizontal_distance') {
        const A = landmarks[rule.landmarkA ?? rule.landmarkA_dist];
        const B = landmarks[rule.landmarkB ?? rule.landmarkB_dist];
        rawAngle = horizontalDistance(A, B) * 100;
      } else if (ruleType === 'vertical_distance' || rule.measureType === 'vertical_distance') {
        const A = landmarks[rule.landmarkA ?? rule.landmarkA_dist];
        const B = landmarks[rule.landmarkB ?? rule.landmarkB_dist];
        rawAngle = verticalDistance(A, B) * 100;
      }
    }

    // Apply optional temporal smoothing if smoother provided
    let angle = rawAngle;
    if (options.smoother && rawAngle >= 0) {
      angle = options.smoother.smooth(rule.ruleId, rawAngle);
    }

    return {
      ...rule,
      ruleType,
      rawAngle,
      angle,
      visible,
    };
  });

  // --- Step 3: Compute weighted score and deviations ---
  const scoreResult = computeScore(evaluatedRules);

  const status = scoreResult.isStable
    ? COACHING_STATES.STABLE
    : COACHING_STATES.ISSUE_DETECTED;

  // In STABLE state, candidate cue is hold_position / good_job
  const candidateCue = scoreResult.isStable
    ? 'hold_position'
    : (scoreResult.topCorrection?.correctionKey || null);

  // Spoken voice guidance only triggers if there is a meaningful deviation
  const shouldSpeak = !scoreResult.isStable && scoreResult.meaningfulDeviations.length > 0;

  return {
    sessionReady: true,
    status,
    message: null,
    score: scoreResult.totalScore,
    tier: scoreResult.tier,
    strengths: scoreResult.strengths,
    topCorrection: scoreResult.topCorrection,
    allDeviations: scoreResult.deviations,
    meaningfulDeviations: scoreResult.meaningfulDeviations,
    hasCriticalFailure: scoreResult.hasCriticalFailure,
    isStable: scoreResult.isStable,
    ruleResults: scoreResult.ruleResults,
    invisibleRules: scoreResult.invisibleRules,
    candidateCue,
    shouldSpeak,
  };
}
