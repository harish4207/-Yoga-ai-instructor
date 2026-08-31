import { describe, it, expect } from 'vitest';
import { runCoachingEngine } from '../../src/engine/coachingEngine';
import { getAsanaConfig } from '../../src/engine/poseRules';
import { computeImprovement, getScoreTier } from '../../src/engine/scoringEngine';

// Helper to generate normalized landmark baseline
function createLandmarks(visibility = 0.95) {
  const lms = [];
  for (let i = 0; i < 33; i++) {
    lms.push({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility,
    });
  }
  return lms;
}

describe('Live Coaching Flow & Robustness Verification', () => {
  it('gate persistence stability window absorbs single-frame coordinate dips', () => {
    let gateStabilityCounter = 0;
    const config = getAsanaConfig('virabhadrasanaII');

    // Frame 1: Valid
    let lms1 = createLandmarks(0.95);
    let res1 = runCoachingEngine(lms1, config);
    if (res1.sessionReady) gateStabilityCounter = Math.min(5, gateStabilityCounter + 1);
    expect(gateStabilityCounter).toBe(1);

    // Frame 2: Valid -> Reaches threshold of 2
    let lms2 = createLandmarks(0.95);
    let res2 = runCoachingEngine(lms2, config);
    if (res2.sessionReady) gateStabilityCounter = Math.min(5, gateStabilityCounter + 1);
    expect(gateStabilityCounter).toBe(2);
    expect(gateStabilityCounter >= 2).toBe(true);

    // Frame 3: Single momentary noise dip (obscure lower body below 0.80 fraction)
    let lms3 = createLandmarks(0.95);
    [23, 24, 25, 26, 27, 28].forEach((idx) => {
      lms3[idx].visibility = 0.1;
    });
    let res3 = runCoachingEngine(lms3, config);
    expect(res3.sessionReady).toBe(false);

    if (res3.sessionReady) {
      gateStabilityCounter = Math.min(5, gateStabilityCounter + 1);
    } else {
      gateStabilityCounter = Math.max(0, gateStabilityCounter - 1);
    }
    // Counter drops by 1 from 2 to 1, gracefully handling the transition
    expect(gateStabilityCounter).toBe(1);

    // Frame 4: Restored immediately
    let lms4 = createLandmarks(0.95);
    let res4 = runCoachingEngine(lms4, config);
    expect(res4.sessionReady).toBe(true);
    if (res4.sessionReady) gateStabilityCounter = Math.min(5, gateStabilityCounter + 1);
    expect(gateStabilityCounter).toBe(2);
    expect(gateStabilityCounter >= 2).toBe(true);
  });

  it('computes session score aggregation and tiers accurately', () => {
    const scores = [85, 90, 92, 95, 88];
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const peakScore = Math.max(...scores);

    expect(avgScore).toBe(90);
    expect(peakScore).toBe(95);

    const tier = getScoreTier(avgScore);
    expect(tier.label).toBe('EXCELLENT');
  });

  it('computes progression improvement delta from baseline', () => {
    const firstScore = 72;
    const latestScore = 88;
    const improvement = computeImprovement(firstScore, latestScore);

    expect(improvement).not.toBeNull();
    expect(improvement.diff).toBe(16);
    expect(improvement.formatted).toBe('+16');
    expect(improvement.isImprovement).toBe(true);
  });
});
