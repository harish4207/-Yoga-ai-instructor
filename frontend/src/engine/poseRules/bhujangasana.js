/**
 * bhujangasana.js
 * Pose rules for Cobra Pose (Bhujangasana).
 *
 * Camera: SIDE-FACING, mat level or slightly elevated, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanics: Gentle thoracic spinal extension without lumbar jamming, soft elbow bend close to ribs.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "chest_lift_extension" (135–165°) is a 2D sagittal plane proxy for gentle spinal extension (flat on floor is 180°).
 *   - "elbow_soft_flexion" (110–150°) is a 2D elbow angle proxy preventing locked elbows and hyper-compressed lumbar vertebrae.
 */

const bhujangasana = {
  id: 'bhujangasana',
  name: 'Cobra Pose',
  sanskritName: 'Bhujangasana',
  category: 'Prone Backbend',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'side',
  cameraHeight: 'low',
  cameraGuideText:
    'Position the camera to your side at mat level. Lie on your stomach, place hands under shoulders, and gently lift your chest.',
  minVisibilityThreshold: 0.55,

  requiredLandmarks: [11, 12, 13, 14, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'chest_lift_extension',
      ruleType: 'angle',
      description: 'Chest lifted in gentle spinal curve (target: 135–165°)',
      isProxy: true,
      proxyNote: '2D sagittal angle proxy for spinal extension above floor.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 135,
      targetMax: 165,
      weight: 0.40,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'lift_chest',
        too_high: 'lift_chest',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'elbow_soft_flexion',
      ruleType: 'angle',
      description: 'Elbows softly bent and close to ribs (target: 110–150°)',
      isProxy: true,
      proxyNote: '2D angle proxy ensuring elbows remain softly bent rather than locked.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 13, // LEFT_ELBOW (vertex)
      landmarkC: 15, // LEFT_WRIST
      targetMin: 110,
      targetMax: 150,
      weight: 0.30,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'soften_elbows',
        too_high: 'soften_elbows',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'legs_extended_grounded',
      ruleType: 'angle',
      description: 'Legs extended on the mat (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D knee extension proxy for grounded lower limbs.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.30,
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

export default bhujangasana;
