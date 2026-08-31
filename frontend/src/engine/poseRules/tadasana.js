/**
 * tadasana.js
 * Pose rules for Mountain Pose (Tadasana).
 *
 * Camera: FRONT-FACING (or SIDE), standing, full body visible.
 *
 * References:
 *   - AYUSH Guidelines for Tadasana / Iyengar Yoga
 *   - Biomechanics: Equal weight distribution, extended knees, neutral pelvis, vertical spine.
 *   - Version: 0.3 (PROVISIONAL)
 *
 * Proxy Measurement Notes:
 *   - "torso_vertical_left/right" are 2D coronal axis proxies for true 3D spinal elongation.
 *   - Knee extension (165–180°) is a 2D planar projection proxy allowing natural micro-bend.
 *
 * Scientific Validation TODOs:
 *   [TODO-BIO-TAD-01]: Validate 165°–180° knee extension tolerance against optical motion capture.
 *   [TODO-BIO-TAD-02]: Calibrate coronal torso plumb line across diverse body types.
 */

const tadasana = {
  id: 'tadasana',
  name: 'Mountain Pose',
  sanskritName: 'Tadasana',
  category: 'Standing',
  difficulty: 'Beginner',
  version: '0.3',
  isProvisional: true,
  source: 'AYUSH guidelines + biomechanics calibration v0.3 — provisional',
  cameraOrientation: 'front',
  cameraHeight: 'standing',
  cameraGuideText:
    'Stand 2–3 metres from the camera facing front. Ensure your full body from head to feet is visible.',
  minVisibilityThreshold: 0.60,

  requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],

  rules: [
    {
      ruleId: 'left_knee_straight',
      ruleType: 'angle',
      description: 'Left knee extended (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D joint angle proxy for sagittal knee extension.',
      landmarkA: 23, // LEFT_HIP
      landmarkB: 25, // LEFT_KNEE (vertex)
      landmarkC: 27, // LEFT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.25,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_knees',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'right_knee_straight',
      ruleType: 'angle',
      description: 'Right knee extended (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D joint angle proxy for sagittal knee extension.',
      landmarkA: 24, // RIGHT_HIP
      landmarkB: 26, // RIGHT_KNEE (vertex)
      landmarkC: 28, // RIGHT_ANKLE
      targetMin: 165,
      targetMax: 180,
      weight: 0.25,
      severity: 'important',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'straighten_knees',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'torso_vertical_left',
      ruleType: 'angle',
      description: 'Left torso vertical alignment (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D coronal plane proxy for vertical spinal alignment.',
      landmarkA: 11, // LEFT_SHOULDER
      landmarkB: 23, // LEFT_HIP (vertex)
      landmarkC: 25, // LEFT_KNEE
      targetMin: 165,
      targetMax: 180,
      weight: 0.25,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'keep_torso_upright',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
    {
      ruleId: 'torso_vertical_right',
      ruleType: 'angle',
      description: 'Right torso vertical alignment (target: 165–180°)',
      isProxy: true,
      proxyNote: '2D coronal plane proxy for vertical spinal alignment.',
      landmarkA: 12, // RIGHT_SHOULDER
      landmarkB: 24, // RIGHT_HIP (vertex)
      landmarkC: 26, // RIGHT_KNEE
      targetMin: 165,
      targetMax: 180,
      weight: 0.25,
      severity: 'critical',
      positiveFeedback: 'good_job',
      correctionTemplates: {
        too_low: 'keep_torso_upright',
        too_high: 'good_job',
        on_target: 'good_job',
      },
    },
  ],
};

export default tadasana;
