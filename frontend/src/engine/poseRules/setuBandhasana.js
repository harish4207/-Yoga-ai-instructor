/**
 * setuBandhasana.js
 * Pose rules for Bridge Pose (Setu Bandhasana).
 *
 * Camera: SIDE-FACING, mat level, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanics: Pelvic lift creating line from shoulders through hips to knees; vertical shins.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "pelvic_lift_extension" (150–180°) is a 2D angle proxy for hip elevation in line with thighs.
 *   - "knee_ankle_stacking" (80–105°) is a 2D angle proxy ensuring knees are stacked over ankles.
 */

const setuBandhasana = {
  id: 'setuBandhasana',
  name: 'Bridge Pose',
  sanskritName: 'Setu Bandhasana',
  category: 'Supine Backbend',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'side',
  cameraHeight: 'low',
  cameraGuideText:
    'Lie on your back with the camera to your side at mat level. Bend your knees, place feet flat, and lift your hips.',
  minVisibilityThreshold: 0.55,

  requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'pelvic_lift_extension',
      ruleType: 'angle',
      description: 'Hips lifted high in line with thighs (target: 150–180°)',
      isProxy: true,
      proxyNote: '2D hip angle proxy for pelvic elevation above the mat.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 150,
      targetMax: 180,
      weight: 0.50,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'lift_hips_higher',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'knee_ankle_stacking',
      ruleType: 'angle',
      description: 'Knees stacked over ankles (target: 80–105°)',
      isProxy: true,
      proxyNote: '2D knee flexion proxy ensuring vertical shin alignment.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 80,
      targetMax: 105,
      weight: 0.50,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'align_front_knee',
        too_high: 'align_front_knee',
        on_target: 'good_job',
      },
    },
  ],
};

export default setuBandhasana;
