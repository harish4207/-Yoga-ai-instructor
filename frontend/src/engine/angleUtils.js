/**
 * angleUtils.js
 * Geometric utility functions for computing angles, line orientations, and spatial relationships
 * from MediaPipe normalized landmarks.
 */

/**
 * Calculate the angle at vertex B formed by points A → B → C.
 * Returns angle in degrees (0–180).
 *
 * @param {{ x: number, y: number }} A - First point
 * @param {{ x: number, y: number }} B - Vertex point (angle is measured here)
 * @param {{ x: number, y: number }} C - Third point
 * @returns {number} Angle in degrees, or -1 if calculation fails
 */
export function calculateAngle(A, B, C) {
  if (!A || !B || !C) return -1;
  const BA = { x: A.x - B.x, y: A.y - B.y };
  const BC = { x: C.x - B.x, y: C.y - B.y };

  const dot = BA.x * BC.x + BA.y * BC.y;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);

  if (magBA < 1e-6 || magBC < 1e-6) return -1;

  const cosTheta = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Calculate the orientation deviation of a 2D line formed by points A and B
 * relative to a cardinal reference axis ('horizontal' or 'vertical').
 *
 * @param {{ x: number, y: number }} A - First point
 * @param {{ x: number, y: number }} B - Second point
 * @param {'horizontal' | 'vertical'} [referenceAxis='horizontal']
 * @returns {number} Deviation angle in degrees (0° = perfectly aligned with reference axis, 90° = perpendicular)
 */
export function calculateLineOrientation(A, B, referenceAxis = 'horizontal') {
  if (!A || !B) return -1;
  const dx = Math.abs(B.x - A.x);
  const dy = Math.abs(B.y - A.y);

  if (dx < 1e-6 && dy < 1e-6) return 0;

  if (referenceAxis === 'horizontal') {
    // 0° = perfectly horizontal (dy = 0), 90° = vertical (dx = 0)
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  } else {
    // 0° = perfectly vertical (dx = 0), 90° = horizontal (dy = 0)
    return (Math.atan2(dx, dy) * 180) / Math.PI;
  }
}

/**
 * Calculate 3D joint angle using world coordinates.
 */
export function calculateAngle3D(A, B, C) {
  if (!A || !B || !C) return -1;
  const BA = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };

  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2 + BA.z ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2 + BC.z ** 2);

  if (magBA < 1e-6 || magBC < 1e-6) return -1;

  const cosTheta = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Get the vertical angle of a line from point A to point B.
 */
export function angleFromVertical(A, B) {
  return calculateLineOrientation(A, B, 'vertical');
}

/**
 * Calculate horizontal distance between two landmarks (0–1).
 */
export function horizontalDistance(A, B) {
  if (!A || !B) return 0;
  return Math.abs(A.x - B.x);
}

/**
 * Calculate vertical distance between two landmarks (0–1).
 */
export function verticalDistance(A, B) {
  if (!A || !B) return 0;
  return Math.abs(A.y - B.y);
}

/**
 * Midpoint between two 2D points.
 */
export function midpoint(A, B) {
  if (!A || !B) return { x: 0, y: 0 };
  return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
}
