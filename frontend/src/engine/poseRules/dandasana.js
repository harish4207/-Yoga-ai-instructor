/**
 * dandasana.js
 * Pose rules for Staff Pose (Dandasana).
 *
 * Camera: SIDE-FACING, seated level, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanics: Seated L-shape, 90° angle between upright torso and grounded straight legs.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "torso_seated_upright" (85–100°) is a 2D angle proxy measuring 90° perpendicularity between spine and thighs.
 *   - "legs_extended_straight" (165–180°) is a 2D knee angle proxy for extended legs resting along the mat.
 */

const dandasana = {
  id: 'dandasana',
  name: 'Staff Pose',
  sanskritName: 'Dandasana',
  category: 'Seated',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'side',
  cameraHeight: 'low',
  cameraGuideText:
    'Sit on your mat with your legs extended in front and the camera to your side. Sit tall with your spine perpendicular to the floor.',
  minVisibilityThreshold: 0.55,

  requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'torso_seated_upright',
      ruleType: 'angle',
      description: 'Torso perpendicular to legs (target: 85–100°)',
      isProxy: true,
      proxyNote: '2D angle proxy for 90° seated spine perpendicular to thighs.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 85,
      targetMax: 100,
      weight: 0.50,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'keep_torso_upright',
        too_high: 'keep_torso_upright',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'legs_extended_straight',
      ruleType: 'angle',
      description: 'Legs straight along mat (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D knee angle proxy for grounded, straight legs.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.50,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_knees',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
  ],
};

export default dandasana;
