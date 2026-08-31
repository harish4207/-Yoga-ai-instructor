import { describe, it, expect } from 'vitest';
import { isLandmarkVisible, checkRuleLandmarks, checkSessionReadiness, LANDMARK } from '../../src/engine/visibilityGate';

// Helper: create a mock landmark
const lm = (visibility, presence = 1.0) => ({ x: 0.5, y: 0.5, z: 0, visibility, presence });

describe('isLandmarkVisible', () => {
  it('returns true when visibility and presence exceed thresholds', () => {
    expect(isLandmarkVisible(lm(0.8))).toBe(true);
  });

  it('returns false when visibility is below threshold (0.60)', () => {
    expect(isLandmarkVisible(lm(0.4))).toBe(false);
  });

  it('returns false when presence is below threshold', () => {
    expect(isLandmarkVisible(lm(0.9, 0.3))).toBe(false);
  });

  it('returns false for null landmark', () => {
    expect(isLandmarkVisible(null)).toBe(false);
  });

  it('returns false for undefined landmark', () => {
    expect(isLandmarkVisible(undefined)).toBe(false);
  });

  it('treats missing presence field as visible (some models omit it)', () => {
    expect(isLandmarkVisible({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 })).toBe(true);
  });
});

describe('checkRuleLandmarks', () => {
  const mockLandmarks = Array.from({ length: 33 }, (_, i) =>
    i % 3 === 0 ? lm(0.3) : lm(0.9) // every 3rd landmark is invisible
  );

  it('returns visible: true when all required landmarks are visible', () => {
    const result = checkRuleLandmarks(mockLandmarks, [1, 2]);
    expect(result.visible).toBe(true);
    expect(result.invisibleIndices).toEqual([]);
  });

  it('returns visible: false when a required landmark is invisible', () => {
    const result = checkRuleLandmarks(mockLandmarks, [0, 1, 2]); // index 0 is invisible
    expect(result.visible).toBe(false);
    expect(result.invisibleIndices).toContain(0);
  });
});

describe('checkSessionReadiness', () => {
  it('returns passed: false with message when no landmarks', () => {
    const result = checkSessionReadiness([], [11, 12, 23, 24]);
    expect(result.passed).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('returns passed: true when enough landmarks are visible', () => {
    const allVisible = Array.from({ length: 33 }, () => lm(0.9));
    const result = checkSessionReadiness(allVisible, [11, 12, 23, 24, 25, 26, 27, 28]);
    expect(result.passed).toBe(true);
    expect(result.message).toBeNull();
  });

  it('returns passed: false with reposition message when too many invisible', () => {
    const mostlyInvisible = Array.from({ length: 33 }, () => lm(0.1));
    const result = checkSessionReadiness(mostlyInvisible, [11, 12, 23, 24, 25, 26, 27, 28]);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('full body');
  });
});

describe('LANDMARK constants', () => {
  it('has correct index for LEFT_SHOULDER', () => {
    expect(LANDMARK.LEFT_SHOULDER).toBe(11);
  });

  it('has correct index for LEFT_KNEE', () => {
    expect(LANDMARK.LEFT_KNEE).toBe(25);
  });

  it('has 33 unique landmark entries', () => {
    const values = Object.values(LANDMARK);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
    expect(values.length).toBe(33);
  });
});
