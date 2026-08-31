/**
 * correctionRegistry.js
 * Single source of truth for yoga coaching correction IDs, multilingual transcripts,
 * structured language layers (live vs. report), category metadata, and local audio asset resolution.
 *
 * Supported Languages: English (en) & Telugu (te).
 * Strictly local static assets — NO runtime Sarvam API dependency.
 */

export const CORRECTION_CATEGORIES = {
  POSE_SPECIFIC: 'POSE_SPECIFIC',
  GLOBAL_CAMERA_GATE: 'GLOBAL_CAMERA_GATE',
  REINFORCEMENT: 'REINFORCEMENT',
};

export const CORRECTION_REGISTRY = {
  // --- Category A: Pose-Specific Corrections ---
  lower_shoulders: {
    id: 'lower_shoulders',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Relax your shoulders slightly.',
      te: 'మీ భుజాలను కొద్దిగా వదులుగా ఉంచండి.',
    },
    report: {
      en: 'Your shoulders were slightly elevated. Keep them soft and down away from the ears.',
      te: 'మీ భుజాలు పైకి బిగుసుకుపోయాయి. వాటిని మెడ నుండి కిందకు వదులు చేయండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/lower_shoulders.mp3',
    },
  },
  relax_shoulders: {
    id: 'relax_shoulders',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Keep your shoulders down.',
      te: 'భుజాలను కిందకు దించి ఉంచండి.',
    },
    report: {
      en: 'Maintain soft, level shoulders without tension.',
      te: 'భుజాలను కిందకు ఉంచి మెడను తేలికగా ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/relax_shoulders.mp3',
    },
  },
  raise_arms: {
    id: 'raise_arms',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Raise your arms.',
      te: 'చేతులను పైకి ఎత్తండి.',
    },
    report: {
      en: 'Reach your arms straight up overhead.',
      te: 'చేతులను తల పైకి పూర్తిగా నిటారుగా చాచి ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/raise_arms.mp3',
    },
  },
  extend_arms: {
    id: 'extend_arms',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Extend your arms.',
      te: 'చేతులను పూర్తిగా చాచండి.',
    },
    report: {
      en: 'Extend through your elbows to form a continuous straight arm line.',
      te: 'మోచేతులను వంచకుండా చేతులను సరళ రేఖలో చాచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/extend_arms.mp3',
    },
  },
  extend_left_arm: {
    id: 'extend_left_arm',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Extend your left arm.',
      te: 'ఎడమ చేతిని పూర్తిగా చాచండి.',
    },
    report: {
      en: 'Extend your lead left arm parallel to the floor.',
      te: 'మీ ఎడమ చేతిని నేలకు సమాంతరంగా పూర్తిగా చాచి ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/extend_left_arm.mp3',
    },
  },
  extend_right_arm: {
    id: 'extend_right_arm',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Extend your right arm.',
      te: 'కుడి చేతిని పూర్తిగా చాచండి.',
    },
    report: {
      en: 'Extend your rear right arm parallel to the floor.',
      te: 'మీ కుడి చేతిని వెనుక వైపు నేలకు సమాంతరంగా చాచి ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/extend_right_arm.mp3',
    },
  },
  bend_front_knee: {
    id: 'bend_front_knee',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Bend your front knee a little more.',
      te: 'ముందు మోకాలిని ఇంకొంచెం వంచండి.',
    },
    report: {
      en: 'Aim for a 90-degree front knee bend with the thigh parallel to the floor.',
      te: 'ముందు తొడ నేలకు సమాంతరంగా వచ్చేలా మోకాలిని 90 డిగ్రీల కోణంలో వంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/bend_front_knee.mp3',
    },
  },
  align_front_knee: {
    id: 'align_front_knee',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Align your front knee over your ankle.',
      te: 'ముందు మోకాలిని మడమ పైనే ఉంచండి.',
    },
    report: {
      en: 'Keep your front knee directly stacked over your ankle to protect the joint.',
      te: 'మోకాలు మడమ కంటే ముందుకు వెళ్లకుండా నేరుగా మడమ పైనే ఉండేలా అమర్చండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/align_front_knee.mp3',
    },
  },
  straighten_knees: {
    id: 'straighten_knees',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Straighten your knees.',
      te: 'మోకాళ్లను సూటిగా ఉంచండి.',
    },
    report: {
      en: 'Engage your quadriceps to maintain active, straight knees.',
      te: 'మోకాళ్లను వంచకుండా కాళ్లను సూటిగా ఉంచి తొడ కండరాలను బిగించండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/straighten_knees.mp3',
    },
  },
  straighten_back_leg: {
    id: 'straighten_back_leg',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Keep your back leg straight.',
      te: 'వెనుక కాలును సూటిగా ఉంచండి.',
    },
    report: {
      en: 'Press firmly through your back heel to keep the back leg fully straight.',
      te: 'వెనుక మోకాలిని వంచకుండా వెనుక మడమతో నేలను గట్టిగా నొక్కండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/straighten_back_leg.mp3',
    },
  },
  lift_bent_knee: {
    id: 'lift_bent_knee',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Turn your bent knee outward.',
      te: 'వంచిన మోకాలిని పక్కవైపుకు జరపండి.',
    },
    report: {
      en: 'Open your bent knee laterally to expand the hip joint.',
      te: 'వంచిన కాలి మోకాలిని పక్క వైపుకు తెరిచి తుంటిని విస్తరించండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/lift_bent_knee.mp3',
    },
  },
  keep_torso_upright: {
    id: 'keep_torso_upright',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Keep your spine upright.',
      te: 'శరీరాన్ని నిటారుగా ఉంచండి.',
    },
    report: {
      en: 'Maintain an upright spine without leaning excessively forward or backward.',
      te: 'శరీరం ముందుకు లేదా వెనక్కి వాలకుండా మధ్యలో నిటారుగా ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/keep_torso_upright.mp3',
    },
  },
  lengthen_spine: {
    id: 'lengthen_spine',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Lengthen your spine.',
      te: 'వెన్నెముకను పైకి నిటారుగా చాచండి.',
    },
    report: {
      en: 'Decompress your vertebrae by lengthening from the crown of your head.',
      te: 'వెన్నెముకను వంచకుండా తల పైభాగం నుండి పైకి నిటారుగా సాగదీయండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/lengthen_spine.mp3',
    },
  },
  lift_chest: {
    id: 'lift_chest',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Lift your chest.',
      te: 'ఛాతీని ముందుకు, పైకి తెరవండి.',
    },
    report: {
      en: 'Broaden through your collarbones and lift your sternum upward.',
      te: 'ఛాతీని విశాలంగా తెరిచి ముందుకు పైకి ఎత్తండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/lift_chest.mp3',
    },
  },
  soften_elbows: {
    id: 'soften_elbows',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Keep a soft bend in your elbows.',
      te: 'మోచేతులను బిగించకుండా కొద్దిగా వంచండి.',
    },
    report: {
      en: 'Avoid locking your elbows to prevent excess pressure on the lower back.',
      te: 'మోచేతులను అతిగా లాక్ చేయకుండా కొద్దిగా వంచి ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/soften_elbows.mp3',
    },
  },
  lift_hips_higher: {
    id: 'lift_hips_higher',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Lift your hips higher.',
      te: 'నడుమును మరింత పైకి ఎత్తండి.',
    },
    report: {
      en: 'Engage your glutes and thighs to elevate your pelvis.',
      te: 'పిరుదులను బిగించి తుంటిని నేల నుండి గరిష్టంగా పైకి ఎత్తండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/lift_hips_higher.mp3',
    },
  },
  press_hips_back: {
    id: 'press_hips_back',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Press your hips back and up.',
      te: 'నడుమును వెనక్కి, పైకి నెట్టండి.',
    },
    report: {
      en: 'Press through your hands and send your sit-bones up and back into an inverted V.',
      te: 'తుంటిని వెనుకకు పైకి నొక్కి శరీరాన్ని V ఆకారంలో ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/press_hips_back.mp3',
    },
  },
  align_hips_shoulders: {
    id: 'align_hips_shoulders',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Align your hips with your shoulders.',
      te: 'నడుము మరియు భుజాలను ఒకే వరుసలో ఉంచండి.',
    },
    report: {
      en: 'Keep your hips and shoulders squared along the same alignment plane.',
      te: 'తుంటి మరియు భుజాలు ఒకే సరళ రేఖలో ఉండేలా చూసుకోండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/align_hips_shoulders.mp3',
    },
  },
  ground_feet: {
    id: 'ground_feet',
    category: CORRECTION_CATEGORIES.POSE_SPECIFIC,
    live: {
      en: 'Press your feet into the ground.',
      te: 'పాదాలను నేలపై బలంగా ఆనించండి.',
    },
    report: {
      en: 'Root down through the four corners of your feet to establish steady balance.',
      te: 'పాదాల నాలుగు మూలలను నేలపై గట్టిగా ఆనించి సమతుల్యతను కాపాడండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/ground_feet.mp3',
    },
  },

  // --- Category B: Global Camera & Visibility Cues ---
  move_back: {
    id: 'move_back',
    category: CORRECTION_CATEGORIES.GLOBAL_CAMERA_GATE,
    live: {
      en: 'Step back to fit in frame.',
      te: 'పూర్తి శరీరం కనిపించేలా కొంచెం వెనక్కి వెళ్ళండి.',
    },
    report: {
      en: 'Step 2–3 meters back from the camera for full-body tracking.',
      te: 'కెమెరాలో మీ పూర్తి శరీరం కనిపించడానికి 2-3 మీటర్ల వెనక్కి వెళ్ళండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/move_back.mp3',
    },
  },
  move_forward: {
    id: 'move_forward',
    category: CORRECTION_CATEGORIES.GLOBAL_CAMERA_GATE,
    live: {
      en: 'Step closer to the camera.',
      te: 'కెమెరాకు కొంచెం ముందుకు రండి.',
    },
    report: {
      en: 'Step slightly closer to the camera to fill the frame.',
      te: 'కెమెరాకు కొంచెం దగ్గరగా వచ్చి ఫ్రేమ్‌ను పూరించండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/move_forward.mp3',
    },
  },
  move_left: {
    id: 'move_left',
    category: CORRECTION_CATEGORIES.GLOBAL_CAMERA_GATE,
    live: {
      en: 'Step slightly to your left.',
      te: 'కొంచెం ఎడమవైపుకు జరగండి.',
    },
    report: {
      en: 'Center yourself in the camera frame by stepping to your left.',
      te: 'స్క్రీన్ మధ్యలోకి రావడానికి కొంచెం ఎడమవైపుకు జరగండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/move_left.mp3',
    },
  },
  move_right: {
    id: 'move_right',
    category: CORRECTION_CATEGORIES.GLOBAL_CAMERA_GATE,
    live: {
      en: 'Step slightly to your right.',
      te: 'కొంచెం కుడివైపుకు జరగండి.',
    },
    report: {
      en: 'Center yourself in the camera frame by stepping to your right.',
      te: 'స్క్రీన్ మధ్యలోకి రావడానికి కొంచెం కుడివైపుకు జరగండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/move_right.mp3',
    },
  },

  // --- Category C: Reinforcement & State Cues ---
  hold_position: {
    id: 'hold_position',
    category: CORRECTION_CATEGORIES.REINFORCEMENT,
    live: {
      en: 'Hold this position.',
      te: 'ఇలాగే స్థిరంగా ఉండండి.',
    },
    report: {
      en: 'Maintain steady balance and form.',
      te: 'భంగిమను కదలకుండా స్థిరంగా పట్టి ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/hold_position.mp3',
    },
  },
  good_job: {
    id: 'good_job',
    category: CORRECTION_CATEGORIES.REINFORCEMENT,
    live: {
      en: 'Good job. Keep holding.',
      te: 'చాలా బాగుంది! అలాగే ఉండండి.',
    },
    report: {
      en: 'Good posture alignment achieved.',
      te: 'సరైన సమలేఖనం సాధించారు. అలాగే ఉంచండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/good_job.mp3',
    },
  },
  excellent: {
    id: 'excellent',
    category: CORRECTION_CATEGORIES.REINFORCEMENT,
    live: {
      en: 'Excellent alignment.',
      te: 'అద్భుతం! భంగిమ చాలా బాగుంది.',
    },
    report: {
      en: 'Excellent alignment matching biomechanical targets.',
      te: 'అద్భుతమైన సమలేఖనం! మీ భంగిమ ఆదర్శవంతంగా ఉంది.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/excellent.mp3',
    },
  },
  try_again: {
    id: 'try_again',
    category: CORRECTION_CATEGORIES.REINFORCEMENT,
    live: {
      en: 'Breathe and try again.',
      te: 'శ్వాస తీసుకుని మళ్లీ ప్రయత్నించండి.',
    },
    report: {
      en: 'Take a restorative breath and reset into the posture.',
      te: 'విశ్రాంతి తీసుకుని మళ్లీ సరైన క్రమంలో ప్రయత్నించండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/try_again.mp3',
    },
  },
  keep_breathing: {
    id: 'keep_breathing',
    category: CORRECTION_CATEGORIES.REINFORCEMENT,
    live: {
      en: 'Keep breathing evenly.',
      te: 'నెమ్మదిగా, ప్రశాంతంగా శ్వాస తీసుకోండి.',
    },
    report: {
      en: 'Maintain rhythmic, relaxed diaphragmatic breathing throughout the hold.',
      te: 'భంగిమలో ఉన్నంత సమయం ప్రశాంతంగా శ్వాస తీసుకుంటూ ఉండండి.',
    },
    audio: {
      te: '/audio/te/virabhadrasanaII/keep_breathing.mp3',
    },
  },
};

/**
 * Legacy & rule-specific alias mappings to canonical correction IDs.
 */
export const CORRECTION_KEY_ALIASES = {
  front_knee_too_straight: 'bend_front_knee',
  front_knee_too_bent: 'align_front_knee',
  left_arm_bent: 'extend_left_arm',
  right_arm_bent: 'extend_right_arm',
  torso_leaning_forward: 'keep_torso_upright',
  torso_leaning_back: 'keep_torso_upright',
  rear_leg_bent: 'straighten_back_leg',
  reposition_camera: 'move_back',
  front_knee_good: 'good_job',
  arms_good: 'good_job',
  torso_good: 'good_job',
  rear_leg_good: 'good_job',
};

/**
 * Resolves a given key or ID to a canonical correction record.
 *
 * @param {string} keyOrId - Canonical correction ID or alias key
 * @returns {object|null} The correction entry from registry or null if not found
 */
export function getCorrectionEntry(keyOrId) {
  if (!keyOrId) return null;
  const canonicalId = CORRECTION_KEY_ALIASES[keyOrId] || keyOrId;
  return CORRECTION_REGISTRY[canonicalId] || null;
}

/**
 * Resolves the local static audio file path for a correction ID and language.
 *
 * @param {string} keyOrId - Canonical correction ID or alias
 * @param {string} [language='te'] - Language code ('te' for Telugu)
 * @returns {string|null} Local audio file URL
 */
export function getCorrectionAudioPath(keyOrId, language = 'te') {
  const entry = getCorrectionEntry(keyOrId);
  if (!entry || !entry.audio) return null;
  return entry.audio[language] || null;
}

/**
 * Retrieves localized text for a correction ID with mode support.
 *
 * @param {string} keyOrId - Canonical correction ID or alias
 * @param {string} [language='te'] - Language code ('te', 'en')
 * @param {'live' | 'report'} [mode='live'] - Mode of speech/text
 * @returns {string|null} Localized instruction string
 */
export function getCorrectionText(keyOrId, language = 'te', mode = 'live') {
  const entry = getCorrectionEntry(keyOrId);
  if (!entry) return null;

  if (entry[mode] && entry[mode][language]) {
    return entry[mode][language];
  }
  if (entry.live && entry.live[language]) {
    return entry.live[language];
  }
  if (entry.live && entry.live.en) {
    return entry.live.en;
  }
  return entry[language] || entry.en || null;
}

/**
 * Retrieves the detailed report text for a correction ID.
 *
 * @param {string} keyOrId - Canonical correction ID or alias
 * @param {string} [language='te'] - Language code ('te', 'en')
 * @returns {string|null} Detailed explanation string
 */
export function getCorrectionReportText(keyOrId, language = 'te') {
  return getCorrectionText(keyOrId, language, 'report');
}
