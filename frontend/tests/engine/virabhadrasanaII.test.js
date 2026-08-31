import { describe, it, expect } from 'vitest';
import virabhadrasanaII from '../../src/engine/poseRules/virabhadrasanaII';
import { runCoachingEngine } from '../../src/engine/coachingEngine';
import {
  getPerfectWarriorIILandmarks,
  getBentRearLegLandmarks,
  getStraightFrontKneeLandmarks,
  getObscuredLowerBodyLandmarks,
} from '../../src/fixtures/warriorIIFixtures';

describe('Virabhadrasana II Pose Rules & Coaching Pipeline', () => {
  it('correctly validates perfect Warrior II posture with high alignment score', () => {
    const landmarks = getPerfectWarriorIILandmarks();
    const result = runCoachingEngine(landmarks, virabhadrasanaII);

    expect(result.sessionReady).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.allDeviations.length).toBe(0);
    expect(result.topCorrection).toBeNull();
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('detects bent rear leg and prioritizes straighten_back_leg correction', () => {
    const landmarks = getBentRearLegLandmarks();
    const result = runCoachingEngine(landmarks, virabhadrasanaII);

    expect(result.sessionReady).toBe(true);
    expect(result.score).toBeLessThan(90);
    expect(result.allDeviations.length).toBeGreaterThan(0);

    const rearLegDev = result.allDeviations.find((d) => d.ruleId === 'rear_leg_straight');
    expect(rearLegDev).toBeDefined();
    expect(rearLegDev.correctionKey).toBe('straighten_back_leg');
  });

  it('detects unbent front knee and flags bend_front_knee', () => {
    const landmarks = getStraightFrontKneeLandmarks();
    const result = runCoachingEngine(landmarks, virabhadrasanaII);

    expect(result.sessionReady).toBe(true);
    const frontKneeDev = result.allDeviations.find((d) => d.ruleId === 'front_knee_angle');
    expect(frontKneeDev).toBeDefined();
    expect(frontKneeDev.correctionKey).toBe('bend_front_knee');
    expect(frontKneeDev.severity).toBe('critical');
  });

  it('enforces visibility gate when legs/feet are obscured', () => {
    const landmarks = getObscuredLowerBodyLandmarks();
    const result = runCoachingEngine(landmarks, virabhadrasanaII);

    expect(result.sessionReady).toBe(false);
    expect(result.score).toBeNull();
    expect(result.message).toContain('full body');
  });

  it('gracefully handles empty or null landmark frames', () => {
    const result = runCoachingEngine(null, virabhadrasanaII);
    expect(result.sessionReady).toBe(false);
    expect(result.score).toBeNull();
    expect(result.message).toContain('No person detected');
  });
});
