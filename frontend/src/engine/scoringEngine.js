/**
 * scoringEngine.js
 * Computes a weighted, forgiving alignment score (0–100) and evaluation tiers from pose rules.
 *
 * Scoring Philosophy:
 * - NOT a binary exam evaluator or punitive test.
 * - Forgiving non-linear deviation bands:
 *     1. NORMAL_VARIATION (<= 3°): Natural human variance / breathing -> 100% score (0 penalty).
 *     2. SMALL_DEVIATION (3° - 8°): Gentle quadratic rolloff -> 90%–100% score.
 *     3. MODERATE_DEVIATION (8° - 18°): Noticeable reduction -> 55%–90% score.
 *     4. SIGNIFICANT_DEVIATION (> 18°): Steeper curve for major form deviations.
 *
 * Stable State Requirements:
 * - Total score >= 80
 * - NO unresolved critical deviations (severity === 'critical' with deviation >= 6°)
 * - Mandatory landmark checks passed
 *
 * Spoken Voice Hysteresis:
 * - Entry: Deviation must exceed rule-specific threshold to trigger spoken voice cue.
 * - Exit: Deviation must reduce below exit threshold to be marked resolved.
 */

export const DEVIATION_BANDS = {
  NORMAL_VARIATION: { maxDev: 3.0, name: 'Normal Variation' },
  SMALL_DEVIATION: { maxDev: 8.0, name: 'Small Deviation' },
  MODERATE_DEVIATION: { maxDev: 18.0, name: 'Moderate Deviation' },
  SIGNIFICANT_DEVIATION: { maxDev: 45.0, name: 'Significant Deviation' },
};

// Minimum deviation required before an issue is considered "meaningful" for voice feedback
export const CORRECTION_ENTRY_THRESHOLDS = {
  critical: 6.0,   // >= 6° off target for critical joints
  important: 8.0,  // >= 8° off target for important limbs
  mild: 12.0,      // >= 12° off target for mild cues
};

export const CORRECTION_EXIT_THRESHOLDS = {
  critical: 3.0,
  important: 4.0,
  mild: 6.0,
};

export const SCORE_TIERS = {
  EXCELLENT: { label: 'EXCELLENT', min: 90, color: '#16a34a', bg: '#dcfce7' },
  GOOD: { label: 'GOOD', min: 80, color: '#2563eb', bg: '#dbeafe' },
  CLOSE: { label: 'CLOSE', min: 70, color: '#ca8a04', bg: '#fef9c3' },
  NEEDS_ATTENTION: { label: 'NEEDS ATTENTION', min: 40, color: '#ea580c', bg: '#ffedd5' },
  SIGNIFICANT_DEVIATION: { label: 'SIGNIFICANT DEVIATION', min: 0, color: '#dc2626', bg: '#fee2e2' },
};

/**
 * Classifies a numerical score (0–100) into a qualitative feedback tier.
 *
 * @param {number|null} score
 * @returns {object} { label, color, bg }
 */
export function getScoreTier(score) {
  if (score === null || score === undefined || score < 0) {
    return { label: 'INCOMPLETE', color: '#64748b', bg: '#f1f5f9' };
  }
  if (score >= 90) return SCORE_TIERS.EXCELLENT;
  if (score >= 80) return SCORE_TIERS.GOOD;
  if (score >= 70) return SCORE_TIERS.CLOSE;
  if (score >= 40) return SCORE_TIERS.NEEDS_ATTENTION;
  return SCORE_TIERS.SIGNIFICANT_DEVIATION;
}

/**
 * Compute a forgiving, gradual score (0.0 – 1.0) for a single rule.
 *
 * @param {number} angle - Measured angle in degrees
 * @param {number} targetMin - Lower bound of acceptable range
 * @param {number} targetMax - Upper bound of acceptable range
 * @returns {number} Score from 0.0 to 1.0
 */
export function scoreRule(angle, targetMin, targetMax) {
  if (angle < 0) return 0;
  const deviation = Math.max(0, targetMin - angle, angle - targetMax);

  // Band 1: Normal Variation (0° to 3°) -> Full 100%
  if (deviation <= DEVIATION_BANDS.NORMAL_VARIATION.maxDev) {
    return 1.0;
  }

  // Band 2: Small Deviation (3° to 8°) -> Gentle quadratic rolloff (90% to 100%)
  if (deviation <= DEVIATION_BANDS.SMALL_DEVIATION.maxDev) {
    const t = (deviation - 3.0) / 5.0; // 0 to 1
    return 1.0 - 0.10 * Math.pow(t, 1.2);
  }

  // Band 3: Moderate Deviation (8° to 18°) -> Linear descent (55% to 90%)
  if (deviation <= DEVIATION_BANDS.MODERATE_DEVIATION.maxDev) {
    const t = (deviation - 8.0) / 10.0; // 0 to 1
    return 0.90 - 0.35 * t;
  }

  // Band 4: Significant Deviation (> 18°) -> Steeper descent to 0
  const t = (deviation - 18.0) / 22.0; // 0 to 1
  return Math.max(0.0, 0.55 - 0.55 * t);
}

/**
 * Determine the direction of deviation for a rule.
 *
 * @param {number} angle
 * @param {number} targetMin
 * @param {number} targetMax
 * @returns {'on_target' | 'too_low' | 'too_high'}
 */
export function deviationDirection(angle, targetMin, targetMax) {
  if (angle < targetMin) return 'too_low';
  if (angle > targetMax) return 'too_high';
  return 'on_target';
}

/**
 * Compute personal improvement score between initial baseline and current score.
 *
 * @param {number|null} firstScore
 * @param {number|null} currentScore
 * @returns {object|null} { diff, formatted, isImprovement }
 */
export function computeImprovement(firstScore, currentScore) {
  if (firstScore === null || currentScore === null || firstScore === undefined || currentScore === undefined) {
    return null;
  }
  const diff = currentScore - firstScore;
  return {
    diff,
    formatted: diff > 0 ? `+${diff}` : `${diff}`,
    isImprovement: diff > 0,
  };
}

/**
 * Compute the overall alignment score and structured deviations for evaluated rules.
 *
 * @param {object[]} evaluatedRules
 * @returns {object} Structured evaluation output
 */
export function computeScore(evaluatedRules) {
  let weightedSum = 0;
  let totalWeight = 0;
  const ruleResults = [];
  const strengths = [];
  const allDeviations = [];
  const meaningfulDeviations = [];
  const invisibleRules = [];
  let hasCriticalFailure = false;

  for (const rule of evaluatedRules) {
    if (!rule.visible || rule.angle < 0) {
      invisibleRules.push(rule.ruleId);
      continue;
    }

    const ruleScore = scoreRule(rule.angle, rule.targetMin, rule.targetMax);
    const direction = deviationDirection(rule.angle, rule.targetMin, rule.targetMax);
    const deviationDeg = Math.max(0, rule.targetMin - rule.angle, rule.angle - rule.targetMax);

    weightedSum += ruleScore * rule.weight;
    totalWeight += rule.weight;

    const entryThreshold = CORRECTION_ENTRY_THRESHOLDS[rule.severity] || 8.0;
    const isMeaningful = deviationDeg >= entryThreshold;

    const result = {
      ruleId: rule.ruleId,
      ruleType: rule.ruleType || 'angle',
      isProxy: rule.isProxy || false,
      angle: Math.round(rule.angle * 10) / 10,
      ruleScore: Math.round(ruleScore * 100),
      direction,
      deviationDeg: Math.round(deviationDeg * 10) / 10,
      severity: rule.severity || 'important',
      weight: rule.weight,
      description: rule.description,
      isMeaningful,
      positiveFeedback: rule.positiveFeedback,
      correctionTemplates: rule.correctionTemplates,
    };
    ruleResults.push(result);

    if (direction === 'on_target' || deviationDeg <= DEVIATION_BANDS.NORMAL_VARIATION.maxDev) {
      strengths.push(rule.ruleId);
    } else {
      const severityWeight = rule.severity === 'critical' ? 3 : rule.severity === 'important' ? 2 : 1;
      const deviationItem = {
        ...result,
        priority: severityWeight * deviationDeg,
        correctionKey: rule.correctionTemplates?.[direction] || '',
      };

      allDeviations.push(deviationItem);

      if (isMeaningful) {
        meaningfulDeviations.push(deviationItem);
        if (rule.severity === 'critical') {
          hasCriticalFailure = true;
        }
      }
    }
  }

  // Sort deviations by priority = (severity multiplier * deviation angle)
  allDeviations.sort((a, b) => b.priority - a.priority);
  meaningfulDeviations.sort((a, b) => b.priority - a.priority);

  const totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  const tier = getScoreTier(totalScore);

  // Top spoken correction must come from meaningful deviations
  const topCorrection = meaningfulDeviations.length > 0 ? meaningfulDeviations[0] : (allDeviations.length > 0 ? allDeviations[0] : null);

  // STABLE requires: totalScore >= 80 AND no meaningful critical failures AND no meaningful deviations
  const isStable = totalScore >= 80 && !hasCriticalFailure && meaningfulDeviations.length === 0;

  return {
    totalScore,
    tier,
    ruleResults,
    strengths,
    deviations: allDeviations,
    meaningfulDeviations,
    hasCriticalFailure,
    isStable,
    invisibleRules,
    topCorrection,
  };
}
