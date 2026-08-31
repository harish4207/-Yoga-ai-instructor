import { describe, it, expect } from 'vitest';
import {
  scoreRule,
  deviationDirection,
  computeScore,
  computeImprovement,
  getScoreTier,
  DEVIATION_BANDS,
  CORRECTION_ENTRY_THRESHOLDS,
} from '../../src/engine/scoringEngine';

describe('Gradual & Forgiving Scoring Engine', () => {
  describe('scoreRule deviation bands & forgiveness', () => {
    it('returns 1.0 (100%) when angle is within target range', () => {
      expect(scoreRule(90, 80, 100)).toBe(1.0);
      expect(scoreRule(80, 80, 100)).toBe(1.0);
      expect(scoreRule(100, 80, 100)).toBe(1.0);
    });

    it('returns 1.0 for tiny deviations within normal human variation (<= 3°)', () => {
      // 102° is 2° deviation from 100° max -> should receive full 100%
      expect(scoreRule(102, 80, 100)).toBe(1.0);
      expect(scoreRule(78, 80, 100)).toBe(1.0);
    });

    it('applies gentle quadratic rolloff for small deviations (3° to 8°)', () => {
      const score5DegOff = scoreRule(105, 80, 100); // 5° off target
      expect(score5DegOff).toBeGreaterThanOrEqual(0.90);
      expect(score5DegOff).toBeLessThan(1.0);
    });

    it('applies noticeable but fair penalty for moderate deviations (8° to 18°)', () => {
      const score12DegOff = scoreRule(112, 80, 100); // 12° off target
      expect(score12DegOff).toBeGreaterThanOrEqual(0.65);
      expect(score12DegOff).toBeLessThanOrEqual(0.85);
    });

    it('applies strong penalty for large form deviations (> 18°)', () => {
      const score25DegOff = scoreRule(125, 80, 100); // 25° off target
      expect(score25DegOff).toBeLessThan(0.50);
    });

    it('deterministically computes scores across all benchmark deviation steps', () => {
      const targetMin = 80;
      const targetMax = 100;

      // 0° -> 100%
      expect(scoreRule(90, targetMin, targetMax)).toBe(1.0);
      // 2° -> 100% (Normal variation)
      expect(scoreRule(102, targetMin, targetMax)).toBe(1.0);
      // 3° -> 100% (Normal variation boundary)
      expect(scoreRule(103, targetMin, targetMax)).toBe(1.0);
      // 4° -> ~98.6% (Small deviation)
      expect(scoreRule(104, targetMin, targetMax)).toBeCloseTo(0.986, 2);
      // 5° -> ~96.7% (Small deviation)
      expect(scoreRule(105, targetMin, targetMax)).toBeCloseTo(0.967, 2);
      // 8° -> 90.0% (Small deviation boundary)
      expect(scoreRule(108, targetMin, targetMax)).toBeCloseTo(0.900, 2);
      // 10° -> 83.0% (Moderate deviation)
      expect(scoreRule(110, targetMin, targetMax)).toBeCloseTo(0.830, 2);
      // 12° -> 76.0% (Moderate deviation)
      expect(scoreRule(112, targetMin, targetMax)).toBeCloseTo(0.760, 2);
      // 15° -> 65.5% (Moderate deviation)
      expect(scoreRule(115, targetMin, targetMax)).toBeCloseTo(0.655, 2);
      // 18° -> 55.0% (Moderate deviation boundary)
      expect(scoreRule(118, targetMin, targetMax)).toBeCloseTo(0.550, 2);
      // 20° -> 50.0% (Significant deviation)
      expect(scoreRule(120, targetMin, targetMax)).toBeCloseTo(0.500, 2);
      // 25° -> 37.5% (Significant deviation)
      expect(scoreRule(125, targetMin, targetMax)).toBeCloseTo(0.375, 2);
      // 30° -> 25.0% (Significant deviation)
      expect(scoreRule(130, targetMin, targetMax)).toBeCloseTo(0.250, 2);
    });

    it('returns 0.0 for failed calculations (angle = -1)', () => {
      expect(scoreRule(-1, 80, 100)).toBe(0);
    });
  });

  describe('Multiple small deviations non-collapse guarantee', () => {
    it('maintains a STRONG or GOOD overall score when multiple rules have only tiny natural deviations', () => {
      const makeRule = (ruleId, angle, targetMin, targetMax, weight) => ({
        ruleId,
        angle,
        targetMin,
        targetMax,
        weight,
        severity: 'important',
        visible: true,
        description: `Rule ${ruleId}`,
        positiveFeedback: 'good',
        correctionTemplates: { too_low: 'cue', too_high: 'cue', on_target: 'good' },
      });

      // 4 rules, each having a minor 4° deviation
      const rules = [
        makeRule('r1', 104, 80, 100, 0.25),
        makeRule('r2', 104, 80, 100, 0.25),
        makeRule('r3', 104, 80, 100, 0.25),
        makeRule('r4', 104, 80, 100, 0.25),
      ];

      const result = computeScore(rules);
      expect(result.totalScore).toBeGreaterThanOrEqual(90);
      expect(result.tier.label).toBe('EXCELLENT');
    });
  });

  describe('Stable State & Critical Failure Logic', () => {
    const makeRule = (ruleId, angle, targetMin, targetMax, weight, severity = 'important') => ({
      ruleId,
      angle,
      targetMin,
      targetMax,
      weight,
      severity,
      visible: true,
      description: `Rule ${ruleId}`,
      positiveFeedback: 'good',
      correctionTemplates: { too_low: 'cue_low', too_high: 'cue_high', on_target: 'good' },
    });

    it('denies STABLE state if a critical rule is failing with meaningful deviation despite high average score', () => {
      // 3 rules: 2 perfect (weight 0.4 each), 1 critical rule failing badly (25° off, weight 0.2)
      const rules = [
        makeRule('arm_left', 170, 160, 180, 0.4, 'important'),
        makeRule('arm_right', 170, 160, 180, 0.4, 'important'),
        makeRule('front_knee', 125, 80, 100, 0.2, 'critical'), // 25° deviation on critical joint
      ];

      const result = computeScore(rules);
      // Overall score might still be >= 80 due to weights
      expect(result.hasCriticalFailure).toBe(true);
      expect(result.isStable).toBe(false);
      expect(result.topCorrection.ruleId).toBe('front_knee');
    });

    it('enters STABLE state when overall score is >= 80 and no critical rules are failing', () => {
      const rules = [
        makeRule('front_knee', 90, 80, 100, 0.4, 'critical'),
        makeRule('arm_left', 170, 160, 180, 0.3, 'important'),
        makeRule('arm_right', 170, 160, 180, 0.3, 'important'),
      ];

      const result = computeScore(rules);
      expect(result.totalScore).toBeGreaterThanOrEqual(80);
      expect(result.hasCriticalFailure).toBe(false);
      expect(result.isStable).toBe(true);
    });
  });

  describe('computeImprovement', () => {
    it('calculates positive personal score progression accurately', () => {
      const progress = computeImprovement(68, 82);
      expect(progress.diff).toBe(14);
      expect(progress.formatted).toBe('+14');
      expect(progress.isImprovement).toBe(true);
    });

    it('handles negative or unchanged progression without error', () => {
      const flat = computeImprovement(80, 80);
      expect(flat.diff).toBe(0);
      expect(flat.formatted).toBe('0');
      expect(flat.isImprovement).toBe(false);

      const drop = computeImprovement(85, 75);
      expect(drop.diff).toBe(-10);
      expect(drop.formatted).toBe('-10');
      expect(drop.isImprovement).toBe(false);
    });
  });
});
