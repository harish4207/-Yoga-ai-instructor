/**
 * adhoMukhaSvanasana.js
 * Pose rules for Downward-Facing Dog (Adho Mukha Svanasana).
 *
 * Camera: SIDE-FACING, standing/seated height, full body visible.
 *
 * References:
 *   - AYUSH Guidelines / Iyengar Yoga
 *   - Biomechanics: Inverted "V" geometry, spine elongated from palms to sit bones, knees extended (or micro-bent for hamstring ease).
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "hip_inversion_peak" (65–95°) is a 2D apex angle proxy measuring pelvic elevation.
 *   - "arms_spine_line" (160–180°) is a 2D alignment proxy from wrists through shoulders to hips.
 *   - "legs_extended" (155–180°) is a 2D knee angle proxy accommodating hamstring flexibility.
 */

const adhoMukhaSvanasana = {
  id: 'adhoMukhaSvanasana',
  name: 'Downward-Facing Dog',
  sanskritName: 'Adho Mukha Svanasana',
  category: 'Inversion',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'side',
  cameraHeight: 'standing',
  cameraGuideText:
    'Position the camera to your side so your entire body from hands to feet is in the frame. Press your hips up and back into an inverted V.',
  minVisibilityThreshold: 0.60,

  requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'hip_inversion_peak',
      ruleType: 'angle',
      description: 'Hips form the peak of inverted V (target: 65–95°)',
      isProxy: true,
      proxyNote: '2D apex angle proxy for pelvic elevation above shoulders and feet.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 65,
      targetMax: 95,
      weight: 0.40,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'press_hips_back',
        too_high: 'press_hips_back',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'arms_spine_line',
      ruleType: 'angle',
      description: 'Arms and spine in straight line (target: 160–180°)',
      isProxy: true,
      proxyNote: '2D alignment proxy from palms through shoulders to hips.',
      landmarkA: 15, // LEFT_WRIST
      landmarkB: 11, // LEFT_SHOULDER (vertex)
      landmarkC: 23, // LEFT_HIP
      targetMin: 160,
      targetMax: 180,
      weight: 0.30,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'lengthen_spine',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'legs_extended',
      ruleType: 'angle',
      description: 'Legs extended (target: 155–180°)',
      isProxy: true,
      proxyNote: '2D knee angle proxy allowing gentle micro-bend for hamstring comfort.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 155,
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

export default adhoMukhaSvanasana;
