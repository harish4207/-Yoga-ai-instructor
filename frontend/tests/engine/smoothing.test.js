import { describe, it, expect } from 'vitest';
import { createAngleSmoother, createRollingSmoother } from '../../src/engine/smoothing';

describe('Temporal Angle Smoothing', () => {
  describe('createAngleSmoother (EMA)', () => {
    it('initializes first value without lag', () => {
      const smoother = createAngleSmoother(0.4);
      expect(smoother.smooth('knee', 170)).toBe(170);
    });

    it('dampens high-frequency jitter across consecutive frames', () => {
      const smoother = createAngleSmoother(0.3); // 30% current, 70% history
      const rawSequence = [170, 180, 172, 178, 171];
      const smoothed = rawSequence.map((val) => smoother.smooth('knee', val));

      // Smoothed sequence should have lower variance
      expect(smoothed[0]).toBe(170);
      expect(smoothed[1]).toBe(173); // 0.3 * 180 + 0.7 * 170 = 173
      expect(smoothed[2]).toBe(172.7);
      expect(smoothed[3]).toBe(174.3);
      expect(smoothed[4]).toBe(173.3);
    });

    it('tracks separate rules independently', () => {
      const smoother = createAngleSmoother(0.5);
      expect(smoother.smooth('knee', 90)).toBe(90);
      expect(smoother.smooth('arm', 170)).toBe(170);

      expect(smoother.smooth('knee', 100)).toBe(95);
      expect(smoother.smooth('arm', 180)).toBe(175);
    });

    it('resets history cleanly', () => {
      const smoother = createAngleSmoother(0.5);
      smoother.smooth('knee', 90);
      smoother.reset();
      expect(smoother.get('knee')).toBeNull();
      expect(smoother.smooth('knee', 120)).toBe(120);
    });
  });

  describe('createRollingSmoother', () => {
    it('computes rolling average over window size', () => {
      const rolling = createRollingSmoother(3);
      expect(rolling.smooth('hip', 100)).toBe(100);
      expect(rolling.smooth('hip', 110)).toBe(105);
      expect(rolling.smooth('hip', 120)).toBe(110);
      expect(rolling.smooth('hip', 130)).toBe(120); // (110 + 120 + 130) / 3 = 120
    });
  });
});
