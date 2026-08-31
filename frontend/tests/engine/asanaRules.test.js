import { describe, it, expect } from 'vitest';
import {
  ASANA_REGISTRY,
  ASANA_LIST,
  getAsanaConfig,
} from '../../src/engine/poseRules';
import { runCoachingEngine } from '../../src/engine/coachingEngine';
import { getCorrectionEntry } from '../../src/services/correctionRegistry';

// Helper to generate normalized landmark baseline
function createLandmarks(customPositions = {}) {
  const lms = [];
  for (let i = 0; i < 33; i++) {
    lms.push({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility: 0.95,
      ...(customPositions[i] || {}),
    });
  }
  return lms;
}

describe('8-Asana MVP Rule Configurations & Scoring', () => {
  it('contains exactly the 8 curriculum asanas in registry and list', () => {
    const expectedIds = [
      'tadasana',
      'vrikshasana',
      'trikonasana',
      'virabhadrasanaII',
      'bhujangasana',
      'adhoMukhaSvanasana',
      'setuBandhasana',
      'dandasana',
    ];

    expect(ASANA_LIST.length).toBe(8);
    expectedIds.forEach((id) => {
      const config = getAsanaConfig(id);
      expect(ASANA_REGISTRY[id]).toBeDefined();
      expect(config.id).toBe(id);
      expect(config.rules.length).toBeGreaterThanOrEqual(2);
      expect(config.referencePhoto).toBeDefined();
      expect(config.referencePhoto).toContain('human-reference.jpg');
      expect(config.referenceIllustration).toBeDefined();
      expect(config.focusPoints.length).toBeGreaterThanOrEqual(2);
      expect(config.alignmentPoints.length).toBeGreaterThanOrEqual(2);
      expect(config.howToPerform.length).toBe(4);
      expect(config.howToPerformTe.length).toBe(4);
      expect(config.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(config.breathingGuidance).toBeDefined();
    });
  });

  it('ensures all correction template keys map to valid registry entries', () => {
    ASANA_LIST.forEach((asana) => {
      asana.rules.forEach((rule) => {
        expect(rule.weight).toBeGreaterThan(0);
        expect(rule.targetMax).toBeGreaterThanOrEqual(rule.targetMin);

        // Check too_low and too_high correction keys
        if (rule.correctionTemplates?.too_low) {
          const entry = getCorrectionEntry(rule.correctionTemplates.too_low);
          expect(entry).not.toBeNull();
        }
        if (rule.correctionTemplates?.too_high) {
          const entry = getCorrectionEntry(rule.correctionTemplates.too_high);
          expect(entry).not.toBeNull();
        }
      });
    });
  });

  describe('Tadasana (Mountain Pose)', () => {
    const config = getAsanaConfig('tadasana');

    it('evaluates straight vertical standing posture as STRONG', () => {
      // Straight line: shoulders at y=0.2, hips at y=0.5, knees at y=0.75, ankles at y=0.95
      const lms = createLandmarks({
        11: { x: 0.45, y: 0.2 }, // Left Shoulder
        12: { x: 0.55, y: 0.2 }, // Right Shoulder
        23: { x: 0.45, y: 0.5 }, // Left Hip
        24: { x: 0.55, y: 0.5 }, // Right Hip
        25: { x: 0.45, y: 0.75 }, // Left Knee
        26: { x: 0.55, y: 0.75 }, // Right Knee
        27: { x: 0.45, y: 0.95 }, // Left Ankle
        28: { x: 0.55, y: 0.95 }, // Right Ankle
      });

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.allDeviations.length).toBe(0);
    });

    it('detects bent knees as deviation and suggests straighten_knees', () => {
      // Left knee bent forward: x=0.45, y=0.75 bent inward to x=0.52
      const lms = createLandmarks({
        11: { x: 0.45, y: 0.2 },
        12: { x: 0.55, y: 0.2 },
        23: { x: 0.45, y: 0.5 },
        24: { x: 0.55, y: 0.5 },
        25: { x: 0.55, y: 0.72 }, // Bent knee (~140 deg)
        26: { x: 0.55, y: 0.75 },
        27: { x: 0.45, y: 0.95 },
        28: { x: 0.55, y: 0.95 },
      });

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(true);
      expect(result.topCorrection).not.toBeNull();
      expect(result.topCorrection.correctionKey).toBe('straighten_knees');
    });
  });

  describe('Vrikshasana (Tree Pose)', () => {
    const config = getAsanaConfig('vrikshasana');

    it('evaluates line_orientation shoulders_level rule accurately', () => {
      // Level shoulders (dy = 0) and valid single-leg stance
      const lms = createLandmarks({
        11: { x: 0.42, y: 0.3 }, // Left shoulder
        12: { x: 0.58, y: 0.3 }, // Right shoulder (perfectly horizontal)
        23: { x: 0.46, y: 0.5 }, // Left hip
        24: { x: 0.54, y: 0.5 }, // Right hip
        25: { x: 0.46, y: 0.72 }, // Left knee (straight 175°)
        26: { x: 0.65, y: 0.62 }, // Right knee (bent ~55°)
        27: { x: 0.46, y: 0.94 }, // Left ankle
        28: { x: 0.47, y: 0.63 }, // Right ankle resting on inner thigh
      });

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(true);
      const shoulderRule = result.ruleResults.find((r) => r.ruleId === 'shoulders_level');
      expect(shoulderRule).toBeDefined();
      expect(shoulderRule.ruleType).toBe('line_orientation');
      expect(shoulderRule.angle).toBeCloseTo(0, 1);
      expect(shoulderRule.direction).toBe('on_target');
    });

    it('flags tilted shoulders using line_orientation', () => {
      // Tilted shoulders: Left at y=0.25, Right at y=0.35 (tilt ~32 deg off horizontal)
      const lms = createLandmarks({
        11: { x: 0.42, y: 0.25 },
        12: { x: 0.58, y: 0.35 },
        23: { x: 0.46, y: 0.5 },
        24: { x: 0.54, y: 0.5 },
        25: { x: 0.46, y: 0.72 },
        26: { x: 0.65, y: 0.62 },
        27: { x: 0.46, y: 0.94 },
        28: { x: 0.47, y: 0.63 },
      });

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(true);
      const shoulderRule = result.ruleResults.find((r) => r.ruleId === 'shoulders_level');
      expect(shoulderRule.angle).toBeGreaterThan(5);
      expect(shoulderRule.direction).toBe('too_high');
    });
  });


  describe('Dandasana (Staff Pose)', () => {
    const config = getAsanaConfig('dandasana');

    it('evaluates 90-degree seated posture as on target', () => {
      // Seated: Shoulder (x=0.3, y=0.3), Hip (x=0.3, y=0.7), Knee (x=0.6, y=0.7), Ankle (x=0.85, y=0.7)
      const lms = createLandmarks({
        11: { x: 0.3, y: 0.3 }, // Shoulder
        23: { x: 0.3, y: 0.7 }, // Hip
        25: { x: 0.6, y: 0.7 }, // Knee
        27: { x: 0.85, y: 0.7 }, // Ankle
      });

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(85);
    });
  });

  describe('Low Visibility Gate Handling', () => {
    it('gates session when required landmarks are obscured', () => {
      const config = getAsanaConfig('trikonasana');
      const lms = createLandmarks();
      // Obscure lower body
      lms[25].visibility = 0.1;
      lms[26].visibility = 0.1;
      lms[27].visibility = 0.1;
      lms[28].visibility = 0.1;

      const result = runCoachingEngine(lms, config);
      expect(result.sessionReady).toBe(false);
      expect(result.score).toBeNull();
    });
  });
});
