/**
 * visibilityGate.js
 * Checks whether MediaPipe landmarks are sufficiently visible to be evaluated.
 *
 * MediaPipe landmark fields:
 *   - visibility: probability that the landmark is visible (0–1)
 *   - presence:   probability that the landmark is present in the frame (0–1)
 *
 * We gate every rule evaluation through this module.
 * If a critical landmark is invisible, we request camera repositioning.
 * If a non-critical landmark is invisible, we skip that rule gracefully.
 */

export const DEFAULT_VISIBILITY_THRESHOLD = 0.60;
export const DEFAULT_PRESENCE_THRESHOLD = 0.50;

/**
 * Check if a single landmark meets visibility requirements.
 *
 * @param {object} landmark - MediaPipe landmark { x, y, z, visibility, presence }
 * @param {number} visThreshold - Minimum visibility score (default 0.60)
 * @returns {boolean}
 */
export function isLandmarkVisible(landmark, visThreshold = DEFAULT_VISIBILITY_THRESHOLD) {
  if (!landmark) return false;
  const vis = landmark.visibility ?? 0;
  const pres = landmark.presence ?? 1; // some models don't provide presence
  return vis >= visThreshold && pres >= DEFAULT_PRESENCE_THRESHOLD;
}

/**
 * Check if all landmarks required for a rule are sufficiently visible.
 *
 * @param {object[]} allLandmarks - Full array of MediaPipe landmarks (33 items)
 * @param {number[]} landmarkIndices - Indices of landmarks needed for this rule
 * @param {number} visThreshold - Minimum visibility score
 * @returns {{ visible: boolean, invisibleIndices: number[] }}
 */
export function checkRuleLandmarks(
  allLandmarks,
  landmarkIndices,
  visThreshold = DEFAULT_VISIBILITY_THRESHOLD
) {
  const invisibleIndices = [];
  for (const idx of landmarkIndices) {
    const lm = allLandmarks[idx];
    if (!isLandmarkVisible(lm, visThreshold)) {
      invisibleIndices.push(idx);
    }
  }
  return {
    visible: invisibleIndices.length === 0,
    invisibleIndices,
  };
}

/**
 * Check whether enough key body landmarks are visible to begin a coaching session.
 * Returns a gate result with a specific message if the user should reposition.
 *
 * @param {object[]} landmarks - MediaPipe landmarks array
 * @param {number[]} requiredIndices - Landmark indices required by the asana rules
 * @param {number} minFraction - Fraction of required landmarks that must be visible (default 0.8)
 * @returns {{ passed: boolean, message: string | null }}
 */
export function checkSessionReadiness(
  landmarks,
  requiredIndices,
  minFraction = 0.80
) {
  if (!landmarks || landmarks.length === 0) {
    return {
      passed: false,
      message: 'No person detected. Please step in front of the camera.',
    };
  }

  const visibleCount = requiredIndices.filter((idx) =>
    isLandmarkVisible(landmarks[idx])
  ).length;

  const fraction = visibleCount / requiredIndices.length;

  if (fraction < minFraction) {
    return {
      passed: false,
      message:
        'Please step back so your full body from head to feet is visible in the camera frame.',
    };
  }

  return { passed: true, message: null };
}

/**
 * MediaPipe Pose Landmarker indices reference (for convenience).
 * Full list: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
 */
export const LANDMARK = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};
