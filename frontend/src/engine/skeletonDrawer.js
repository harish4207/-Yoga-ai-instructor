/**
 * skeletonDrawer.js
 * Draws MediaPipe pose skeleton and keypoints over a video or image canvas.
 */
import { DEFAULT_VISIBILITY_THRESHOLD } from './visibilityGate';

export const POSE_CONNECTIONS = [
  // Facial feature contours
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Shoulders & Torso
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Left arm
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  // Right arm
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  // Left leg
  [23, 25],
  [25, 27],
  [27, 29],
  [27, 31],
  [29, 31],
  // Right leg
  [24, 26],
  [26, 28],
  [28, 30],
  [28, 32],
  [30, 32],
];

/**
 * Draw skeleton and keypoints on canvas context
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number, z?: number, visibility?: number}>} landmarks
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {object} options
 */
export function drawPoseSkeleton(
  ctx,
  landmarks,
  canvasWidth,
  canvasHeight,
  options = {}
) {
  if (!ctx || !landmarks || landmarks.length === 0) return;

  const {
    lineWidth = 4,
    jointRadius = 5,
    minVis = DEFAULT_VISIBILITY_THRESHOLD,
    highlightRules = [],
    isMirrored = false,
  } = options;

  ctx.save();

  // Helper to convert normalized coordinate to canvas pixel
  const toPixel = (lm) => {
    let px = lm.x * canvasWidth;
    if (isMirrored) {
      px = canvasWidth - px;
    }
    const py = lm.y * canvasHeight;
    return { x: px, y: py, vis: lm.visibility ?? 1 };
  };

  // 1. Draw connection lines
  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const lmA = landmarks[startIdx];
    const lmB = landmarks[endIdx];
    if (!lmA || !lmB) continue;

    const visA = lmA.visibility ?? 1;
    const visB = lmB.visibility ?? 1;

    if (visA < minVis || visB < minVis) {
      // Semi-transparent gray line for low visibility connections
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.35)';
      ctx.lineWidth = Math.max(1, lineWidth - 2);
    } else {
      // Check if this segment corresponds to any evaluated rule
      ctx.strokeStyle = '#00e5ff'; // Default vibrant cyan
      ctx.lineWidth = lineWidth;
    }

    const pA = toPixel(lmA);
    const pB = toPixel(lmB);

    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }

  // 2. Draw landmarks (joints)
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm) continue;

    const p = toPixel(lm);
    const isVisible = p.vis >= minVis;

    ctx.beginPath();
    ctx.arc(p.x, p.y, isVisible ? jointRadius : jointRadius - 1.5, 0, 2 * Math.PI);

    if (isVisible) {
      // Highlight critical joints (shoulders 11/12, hips 23/24, knees 25/26, elbows 13/14, ankles 27/28)
      const isMajorJoint = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(i);
      ctx.fillStyle = isMajorJoint ? '#00e676' : '#ffeb3b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 82, 82, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}
