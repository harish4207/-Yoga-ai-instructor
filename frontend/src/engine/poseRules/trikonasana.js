/**
 * trikonasana.js
 * Pose rules for Extended Triangle Pose (Utthita Trikonasana).
 *
 * Camera: FRONT-FACING, standing wide stance, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanics: Lateral hinge without collapsing chest, extended knees with hamstring safety, vertical arm line.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "lateral_torso_extension" (40–75°) is a 2D proxy for lateral pelvic-spinal flexion;
 *     it accommodates hand-on-shin/block variations without forcing chest collapse.
 *   - "arms_vertical_line" is a 2D single-arm extension proxy for bi-lateral arm span.
 */

const trikonasana = {
  id: 'trikonasana',
  name: 'Triangle Pose',
  sanskritName: 'Utthita Trikonasana',
  category: 'Standing Lateral',
  difficulty: 'Intermediate',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'front',
  cameraHeight: 'standing',
  cameraGuideText:
    'Stand 2–3 metres away in a wide stance facing the camera. Extend arms and hinge laterally over your front leg (left leg by default).',
  minVisibilityThreshold: 0.60,

  requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'front_knee_straight',
      ruleType: 'angle',
      description: 'Front knee straight (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D angle proxy allowing safe micro-bend for hamstring attachment protection.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.30,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_knees',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'rear_leg_straight',
      ruleType: 'angle',
      description: 'Rear leg straight and grounded (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D angle proxy for rear leg quadricep engagement.',
      landmarkA: 24, // RIGHT_HIP
      landmarkB: 26, // RIGHT_KNEE (vertex)
      landmarkC: 28, // RIGHT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.25,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_back_leg',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'arms_vertical_line',
      ruleType: 'angle',
      description: 'Top arm reaching straight up (target: 160–180°)',
      isProxy: true,
      proxyNote: '2D elbow extension proxy for vertical arm line.',
      landmarkA: 12, // RIGHT_SHOULDER
      landmarkB: 14, // RIGHT_ELBOW (vertex)
      landmarkC: 16, // RIGHT_WRIST
      targetMin: 160,
      targetMax: 180,
      weight: 0.25,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'extend_arms',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'lateral_torso_extension',
      ruleType: 'angle',
      description: 'Lateral torso extension (target: 40–75°)',
      isProxy: true,
      proxyNote: '2D angle proxy for lateral spinal flexion over front thigh.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 40,
      targetMax: 75,
      weight: 0.20,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'lengthen_spine',
        too_high: 'lengthen_spine',
        on_target: 'good_job',
      },
    },
  ],
};

export default trikonasana;
