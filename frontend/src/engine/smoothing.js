/**
 * smoothing.js
 * Lightweight temporal smoothing utilities for live video landmark angles.
 *
 * Prevents high-frequency jitter in MediaPipe live angle calculations without
 * adding noticeable UI lag.
 *
 * Supported methods:
 * - Exponential Moving Average (EMA)
 * - Rolling Window Average
 */

/**
 * Creates an Exponential Moving Average (EMA) angle smoother.
 *
 * Formula: smoothed = alpha * raw + (1 - alpha) * previous
 *
 * @param {number} [alpha=0.35] - Smoothing factor (0.0 to 1.0). Lower = smoother, Higher = more responsive.
 * @returns {object} Smoother instance with smooth(key, rawValue) and reset() methods.
 */
export function createAngleSmoother(alpha = 0.35) {
  const history = new Map();

  return {
    /**
     * Smooth an angle value for a given rule key.
     *
     * @param {string} key - Unique rule identifier
     * @param {number} rawValue - Raw calculated angle
     * @returns {number} Temporally smoothed angle
     */
    smooth(key, rawValue) {
      if (rawValue === null || rawValue === undefined || rawValue < 0) {
        return rawValue;
      }

      if (!history.has(key)) {
        history.set(key, rawValue);
        return rawValue;
      }

      const prev = history.get(key);
      const smoothed = alpha * rawValue + (1 - alpha) * prev;
      history.set(key, smoothed);
      return Math.round(smoothed * 10) / 10;
    },

    /**
     * Reset the smoother history (e.g. when changing asana).
     */
    reset() {
      history.clear();
    },

    /**
     * Retrieve the current smoothed value for a rule key.
     */
    get(key) {
      return history.get(key) ?? null;
    },
  };
}

/**
 * Creates a Rolling Window Average smoother.
 *
 * @param {number} [windowSize=5] - Number of frames to average
 * @returns {object}
 */
export function createRollingSmoother(windowSize = 5) {
  const buffers = new Map();

  return {
    smooth(key, rawValue) {
      if (rawValue === null || rawValue === undefined || rawValue < 0) {
        return rawValue;
      }

      if (!buffers.has(key)) {
        buffers.set(key, []);
      }

      const buf = buffers.get(key);
      buf.push(rawValue);
      if (buf.length > windowSize) {
        buf.shift();
      }

      const sum = buf.reduce((acc, v) => acc + v, 0);
      const avg = sum / buf.length;
      return Math.round(avg * 10) / 10;
    },

    reset() {
      buffers.clear();
    },
  };
}
