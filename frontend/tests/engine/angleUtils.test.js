import { describe, it, expect } from 'vitest';
import {
  calculateAngle,
  calculateAngle3D,
  calculateLineOrientation,
  angleFromVertical,
  horizontalDistance,
  verticalDistance,
} from '../../src/engine/angleUtils';

describe('calculateAngle', () => {
  it('returns 90° for a right angle', () => {
    const A = { x: 0, y: 1 };
    const B = { x: 0, y: 0 }; // vertex
    const C = { x: 1, y: 0 };
    expect(calculateAngle(A, B, C)).toBeCloseTo(90, 1);
  });

  it('returns 180° for three collinear points', () => {
    const A = { x: -1, y: 0 };
    const B = { x: 0, y: 0 }; // vertex
    const C = { x: 1, y: 0 };
    expect(calculateAngle(A, B, C)).toBeCloseTo(180, 1);
  });

  it('returns approximately 45° for a 45-degree angle', () => {
    const A = { x: 0, y: 1 };
    const B = { x: 0, y: 0 }; // vertex
    const C = { x: 1, y: 1 };
    expect(calculateAngle(A, B, C)).toBeCloseTo(45, 1);
  });

  it('returns -1 for identical points (degenerate case)', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 0, y: 0 }; // vertex — same as A
    const C = { x: 1, y: 0 };
    expect(calculateAngle(A, B, C)).toBe(-1);
  });

  it('returns a value between 0 and 180 for any valid inputs', () => {
    const A = { x: 0.3, y: 0.7 };
    const B = { x: 0.5, y: 0.5 };
    const C = { x: 0.8, y: 0.2 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThanOrEqual(180);
  });
});

describe('calculateAngle3D', () => {
  it('returns 90° for a right angle in 3D', () => {
    const A = { x: 0, y: 1, z: 0 };
    const B = { x: 0, y: 0, z: 0 }; // vertex
    const C = { x: 1, y: 0, z: 0 };
    expect(calculateAngle3D(A, B, C)).toBeCloseTo(90, 1);
  });

  it('handles 3D depth (z-axis)', () => {
    const A = { x: 0, y: 0, z: 1 };
    const B = { x: 0, y: 0, z: 0 }; // vertex
    const C = { x: 1, y: 0, z: 0 };
    expect(calculateAngle3D(A, B, C)).toBeCloseTo(90, 1);
  });
});

describe('horizontalDistance', () => {
  it('returns correct normalized distance', () => {
    const A = { x: 0.2 };
    const B = { x: 0.5 };
    expect(horizontalDistance(A, B)).toBeCloseTo(0.3, 5);
  });

  it('returns 0 for same x position', () => {
    const A = { x: 0.4 };
    const B = { x: 0.4 };
    expect(horizontalDistance(A, B)).toBe(0);
  });
});

describe('verticalDistance', () => {
  it('returns correct normalized distance', () => {
    const A = { y: 0.1 };
    const B = { y: 0.6 };
    expect(verticalDistance(A, B)).toBeCloseTo(0.5, 5);
  });
});

describe('calculateLineOrientation', () => {
  it('returns 0° for a perfectly horizontal line', () => {
    const A = { x: 0.2, y: 0.3 };
    const B = { x: 0.8, y: 0.3 };
    expect(calculateLineOrientation(A, B, 'horizontal')).toBeCloseTo(0, 1);
  });

  it('returns deviation angle for tilted line relative to horizontal', () => {
    // 45 degree tilt: dx = 0.5, dy = 0.5
    const A = { x: 0.2, y: 0.2 };
    const B = { x: 0.7, y: 0.7 };
    expect(calculateLineOrientation(A, B, 'horizontal')).toBeCloseTo(45, 1);
  });

  it('returns 0° for a perfectly vertical line relative to vertical axis', () => {
    const A = { x: 0.5, y: 0.1 };
    const B = { x: 0.5, y: 0.9 };
    expect(calculateLineOrientation(A, B, 'vertical')).toBeCloseTo(0, 1);
  });
});

