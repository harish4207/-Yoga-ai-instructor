import { describe, it, expect, vi } from 'vitest';
import { drawPoseSkeleton, POSE_CONNECTIONS } from '../../src/engine/skeletonDrawer';
import { getPerfectWarriorIILandmarks } from '../../src/fixtures/warriorIIFixtures';

describe('skeletonDrawer', () => {
  const createMockContext = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
  });

  it('draws connections and joint arcs without crashing', () => {
    const ctx = createMockContext();
    const landmarks = getPerfectWarriorIILandmarks();

    drawPoseSkeleton(ctx, landmarks, 640, 480, {
      lineWidth: 4,
      jointRadius: 6,
      isMirrored: false,
    });

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledTimes(landmarks.length);
  });

  it('handles null/empty landmarks gracefully', () => {
    const ctx = createMockContext();
    expect(() => drawPoseSkeleton(ctx, [], 640, 480)).not.toThrow();
    expect(() => drawPoseSkeleton(null, [], 640, 480)).not.toThrow();
  });

  it('verifies standard pose connections topology', () => {
    expect(POSE_CONNECTIONS.length).toBeGreaterThanOrEqual(25);
    for (const [a, b] of POSE_CONNECTIONS) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(33);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(33);
    }
  });
});
