/**
 * warriorIIFixtures.js
 * 33-landmark test datasets for Warrior II (Virabhadrasana II).
 * Provides geometric poses:
 *  - perfectWarriorII: All joints within target angles (Knee ~90°, Arms ~180°, Torso ~90°, Rear leg ~175°)
 *  - bentRearLeg: Rear leg bent at 135° (triggers rear_leg_bent deviation)
 *  - straightFrontKnee: Front knee at 140° (triggers front_knee_too_straight)
 *  - overbentFrontKnee: Front knee at 65° (triggers front_knee_too_bent)
 *  - bentLeftArm: Left arm at 130° (triggers left_arm_bent)
 *  - obscuredLowerBody: Low visibility (<0.6) on ankles/knees (triggers visibilityGate)
 */

function createBlank33Landmarks(visibility = 0.95) {
  const landmarks = [];
  for (let i = 0; i < 33; i++) {
    landmarks.push({
      x: 0.5,
      y: 0.5,
      z: 0.0,
      visibility,
      presence: visibility,
    });
  }
  return landmarks;
}

/**
 * 1. Ideal / Perfect Warrior II Form
 */
export function getPerfectWarriorIILandmarks() {
  const lm = createBlank33Landmarks(0.95);

  // Nose / Head
  lm[0] = { x: 0.50, y: 0.20, z: 0.0, visibility: 0.95 };

  // Shoulders (horizontal alignment)
  lm[11] = { x: 0.44, y: 0.32, z: 0.0, visibility: 0.95 }; // LEFT_SHOULDER
  lm[12] = { x: 0.56, y: 0.32, z: 0.0, visibility: 0.95 }; // RIGHT_SHOULDER

  // Left Arm (extended straight horizontally towards left) -> angle 180°
  lm[13] = { x: 0.32, y: 0.32, z: 0.0, visibility: 0.95 }; // LEFT_ELBOW
  lm[15] = { x: 0.20, y: 0.32, z: 0.0, visibility: 0.95 }; // LEFT_WRIST

  // Right Arm (extended straight horizontally towards right) -> angle 180°
  lm[14] = { x: 0.68, y: 0.32, z: 0.0, visibility: 0.95 }; // RIGHT_ELBOW
  lm[16] = { x: 0.80, y: 0.32, z: 0.0, visibility: 0.95 }; // RIGHT_WRIST

  // Hips
  lm[23] = { x: 0.46, y: 0.52, z: 0.0, visibility: 0.95 }; // LEFT_HIP
  lm[24] = { x: 0.54, y: 0.52, z: 0.0, visibility: 0.95 }; // RIGHT_HIP

  // Front Left Leg (Bent at ~90°: Hip -> Knee horizontal-ish thigh, Knee -> Ankle vertical shin)
  // Angle at (0.46, 0.52) - (0.34, 0.52) - (0.34, 0.80) is exactly 90 degrees
  lm[25] = { x: 0.34, y: 0.52, z: 0.0, visibility: 0.95 }; // LEFT_KNEE
  lm[27] = { x: 0.34, y: 0.82, z: 0.0, visibility: 0.95 }; // LEFT_ANKLE

  // Rear Right Leg (Extended straight diagonally back ~175°)
  lm[26] = { x: 0.65, y: 0.66, z: 0.0, visibility: 0.95 }; // RIGHT_KNEE
  lm[28] = { x: 0.76, y: 0.80, z: 0.0, visibility: 0.95 }; // RIGHT_ANKLE

  return lm;
}

/**
 * 2. Warrior II with Bent Rear Leg (Rear knee flexed at ~130°)
 */
export function getBentRearLegLandmarks() {
  const lm = getPerfectWarriorIILandmarks();
  // Bend right knee downwards
  lm[26] = { x: 0.62, y: 0.74, z: 0.0, visibility: 0.95 }; // RIGHT_KNEE dropped
  return lm;
}

/**
 * 3. Warrior II with Front Knee Too Straight (~140°)
 */
export function getStraightFrontKneeLandmarks() {
  const lm = getPerfectWarriorIILandmarks();
  // Move left knee down-forward so knee isn't bent to 90
  lm[25] = { x: 0.40, y: 0.66, z: 0.0, visibility: 0.95 }; // LEFT_KNEE
  return lm;
}

/**
 * 4. Warrior II with Low Visibility on Lower Body
 */
export function getObscuredLowerBodyLandmarks() {
  const lm = getPerfectWarriorIILandmarks();
  // Set ankles and knees to low visibility (camera too close / feet cut off)
  lm[25].visibility = 0.2;
  lm[26].visibility = 0.2;
  lm[27].visibility = 0.1;
  lm[28].visibility = 0.1;
  return lm;
}
