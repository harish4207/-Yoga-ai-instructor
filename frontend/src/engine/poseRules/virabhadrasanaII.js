/**
 * virabhadrasanaII.js
 * Pose rules for Warrior II (Virabhadrasana II).
 *
 * Camera: FRONT-FACING, standing height, full body visible.
 *
 * Reference:
 *   - AYUSH yoga guidelines for Virabhadrasana II
 *   - Biomechanics: Front knee 90° flexion, hip rotation, bilateral horizontal arm extension.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "front_knee_angle" is a 2D planar projection of femoral-tibial angle (target: 80–100°).
 *   - "left/right_arm_alignment" (160–180°) are 2D elbow extension proxies allowing shoulder mobility variance.
 *   - "torso_upright" is a 2D sagittal perpendicularity proxy relative to the lead thigh.
 */

const virabhadrasanaII = {
  id: 'virabhadrasanaII',
  name: 'Warrior II',
  sanskritName: 'Virabhadrasana II',
  category: 'Standing Lunge',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'front',
  cameraHeight: 'standing',
  cameraGuideText:
    'Stand 2–3 metres from the camera. Your full body from head to feet must be visible. Face the camera directly (left leg lead by default).',
  minVisibilityThreshold: 0.60,

  requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'front_knee_angle',
      ruleType: 'angle',
      description: 'Front knee bend (target: 80–100°)',
      isProxy: true,
      proxyNote: '2D angle proxy for 90° front knee flexion stacked over ankle.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 80,
      targetMax: 100,
      weight: 0.30,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'align_front_knee',
        too_high: 'bend_front_knee',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'left_arm_alignment',
      ruleType: 'angle',
      description: 'Left arm extended (target: 160–180°)',
      isProxy: true,
      proxyNote: '2D elbow extension proxy for lead arm horizontal extension.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 13, // LEFT_ELBOW (vertex)
      landmarkC: 15, // LEFT_WRIST
      targetMin: 160,
      targetMax: 180,
      weight: 0.15,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'extend_left_arm',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'right_arm_alignment',
      ruleType: 'angle',
      description: 'Right arm extended (target: 160–180°)',
      isProxy: true,
      proxyNote: '2D elbow extension proxy for rear arm horizontal extension.',
      landmarkA: 12, // RIGHT_SHOULDER
      landmarkB: 14, // RIGHT_ELBOW (vertex)
      landmarkC: 16, // RIGHT_WRIST
      targetMin: 160,
      targetMax: 180,
      weight: 0.15,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'extend_right_arm',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'torso_upright',
      ruleType: 'angle',
      description: 'Torso upright (target: 80–100°)',
      isProxy: true,
      proxyNote: '2D angle proxy measuring torso perpendicularity between shoulders and front thigh.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 80,
      targetMax: 100,
      weight: 0.20,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'keep_torso_upright',
        too_high: 'keep_torso_upright',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'rear_leg_straight',
      ruleType: 'angle',
      description: 'Rear leg straight (target: 160–180°)',
      isProxy: true,
      proxyNote: '2D knee angle proxy for extended rear leg.',
      landmarkA: 24, // RIGHT_HIP
      landmarkB: 26, // RIGHT_KNEE (vertex)
      landmarkC: 28, // RIGHT_ANKLE
      targetMin: 160,
      targetMax: 180,
      weight: 0.20,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_back_leg',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
  ],
};

export default virabhadrasanaII;
