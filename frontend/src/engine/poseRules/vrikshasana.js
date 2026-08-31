/**
 * vrikshasana.js
 * Pose rules for Tree Pose (Vrikshasana).
 *
 * Camera: FRONT-FACING, standing, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanical criteria: Single-leg balance, standing knee extension, bent knee hip abduction.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "shoulders_level" is a 2D line orientation proxy (0–5° off horizontal) measuring clavicle tilt;
 *     it does not measure 3D scapular depression and can be influenced by camera roll/perspective.
 *   - "bent_knee_flexion" (35–85°) is a 2D proxy accommodating both high-thigh and inner-calf foot placement.
 *
 * Scientific Validation TODOs:
 *   [TODO-BIO-VRI-01]: Calibrate foot placement height detection (calf vs thigh).
 *   [TODO-BIO-VRI-02]: Support automatic left/right standing leg detection in Phase 5.
 */

const vrikshasana = {
  id: 'vrikshasana',
  name: 'Tree Pose',
  sanskritName: 'Vrikshasana',
  category: 'Balance',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'front',
  cameraHeight: 'standing',
  cameraGuideText:
    'Stand 2–3 metres away facing the camera. Balance on your standing leg (left leg by default) and rest the other foot on your inner thigh or calf.',
  minVisibilityThreshold: 0.60,

  requiredLandmarks: [11, 12, 13, 14, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'standing_leg_straight',
      ruleType: 'angle',
      description: 'Standing leg knee straight (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D joint angle proxy for single-leg standing extension.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.35,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_knees',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'bent_knee_flexion',
      ruleType: 'angle',
      description: 'Bent leg knee flexion (target: 35–85°)',
      isProxy: true,
      proxyNote: '2D angle proxy for hip abduction and external rotation.',
      landmarkA: 24, // RIGHT_HIP
      landmarkB: 26, // RIGHT_KNEE (vertex)
      landmarkC: 28, // RIGHT_ANKLE
      targetMin: 35,
      targetMax: 85,
      weight: 0.30,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'lift_bent_knee',
        too_high: 'lift_bent_knee',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'torso_upright',
      ruleType: 'angle',
      description: 'Torso vertical on standing side (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D coronal axis proxy for upright spine in single-leg stance.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 165,
      targetMax: 180,
      weight: 0.20,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'keep_torso_upright',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'shoulders_level',
      ruleType: 'line_orientation',
      referenceAxis: 'horizontal',
      description: 'Shoulder line horizontal (target: 0–5° deviation)',
      isProxy: true,
      proxyNote: '2D line orientation proxy measuring clavicle levelness; subject to camera roll.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 12, // RIGHT_SHOULDER
      targetMin: 0,
      targetMax: 5,
      weight: 0.15,
      severity: 'mild',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'good_job',
        too_high: 'relax_shoulders',
        on_target: 'good_job',
      },
    },
  ],
};

export default vrikshasana;
