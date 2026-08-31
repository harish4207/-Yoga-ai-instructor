/**
 * index.js — Central Asana Registry for 8-Asana MVP
 *
 * Supported Asanas:
 * 1. Tadasana (Mountain Pose)
 * 2. Vrikshasana (Tree Pose)
 * 3. Trikonasana (Triangle Pose)
 * 4. Virabhadrasana II (Warrior II)
 * 5. Bhujangasana (Cobra Pose)
 * 6. Adho Mukha Svanasana (Downward-Facing Dog)
 * 7. Setu Bandhasana (Bridge Pose)
 * 8. Dandasana (Staff Pose)
 */

import tadasana from './tadasana';
import vrikshasana from './vrikshasana';
import trikonasana from './trikonasana';
import virabhadrasanaII from './virabhadrasanaII';
import bhujangasana from './bhujangasana';
import adhoMukhaSvanasana from './adhoMukhaSvanasana';
import setuBandhasana from './setuBandhasana';
import dandasana from './dandasana';

export const ASANA_REGISTRY = {
  tadasana: {
    ...tadasana,
    image: '/images/asanas/tadasana/human-reference.jpg',
    referencePhoto: '/images/asanas/tadasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/tadasana/reference.svg',
    category: 'Standing',
    description: 'The foundational standing posture promoting grounded stability, posture awareness, and spinal elongation.',
    benefits: ['Improves standing posture', 'Strengthens thighs and ankles', 'Enhances body awareness'],
    howToPerform: [
      'Stand tall with feet together or hip-width apart.',
      'Distribute your weight evenly across both feet.',
      'Engage your thigh muscles and gently lift your kneecaps.',
      'Lengthen your spine and let your arms rest naturally by your sides.',
    ],
    howToPerformTe: [
      'పాదాలు సమానంగా ఉంచి నిటారుగా నిలబడండి.',
      'రెండు పాదాలపై సమానంగా బరువు వేయండి.',
      'వెన్నెముకను నిటారుగా ఉంచి భుజాలను వదులుగా ఉంచండి.',
      'చేతులను పక్కన సహజంగా ఉంచండి.',
    ],
    focusPoints: ['Ground evenly through both feet', 'Keep spine straight and tall', 'Relax shoulders down from ears'],
    focusPointsTe: ['పాదాలను బలంగా నేలపై ఉంచండి', 'వెన్ను నిటారుగా ఉంచండి', 'భుజాలను వదులుగా ఉంచండి'],
    alignmentPoints: ['Feet together or hip-width apart', 'Kneecaps gently lifted', 'Arms resting naturally by sides with palms facing forward'],
    commonMistakes: ['Arching the lower back excessively', 'Locking knees backward', 'Tensing shoulders toward ears'],
    commonMistakesTe: ['నడుమును వెనక్కి వంచడం', 'మోకాళ్ళను మరీ గట్టిగా బిగించడం', 'భుజాలు పైకి ఎత్తడం'],
    breathingGuidance: 'Inhale to lengthen your spine, exhale to ground your feet firmly.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ వెన్ను నిటారుగా చేయండి, వదులుతూ శరీరాన్ని స్థిరంగా ఉంచండి.',
  },
  vrikshasana: {
    ...vrikshasana,
    image: '/images/asanas/vrikshasana/human-reference.jpg',
    referencePhoto: '/images/asanas/vrikshasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/vrikshasana/reference.svg',
    category: 'Balancing',
    description: 'A classical balancing standing pose that develops concentration, stabilizes the pelvic girdle, and opens the hips.',
    benefits: ['Enhances neuromuscular balance', 'Strengthens calves and ankles', 'Opens inner thighs and hips'],
    howToPerform: [
      'Start in a steady standing posture.',
      'Shift your weight onto your standing leg.',
      'Place the sole of your other foot on your inner thigh or calf (never on knee).',
      'Bring palms together at your chest or raise arms overhead.',
    ],
    howToPerformTe: [
      'స్థిరంగా నిలబడి ఒక కాలిపై బరువు వేయండి.',
      'మరో పాదాన్ని తొడ లోపలి భాగంలో ఉంచండి (మోకాలిపై కాదు).',
      'రెండు చేతులను ఛాతీ వద్ద నమస్కార ముద్రలో ఉంచండి.',
      'దృష్టిని ఒక స్థిరమైన బిందువుపై ఉంచండి.',
    ],
    focusPoints: ['Fix your gaze on a steady point ahead', 'Press standing foot firmly into mat', 'Open bent knee out to side'],
    focusPointsTe: ['ఎదురుగా ఒక బిందువుపై దృష్టి పెట్టండి', 'ఆధార కాలిని బలంగా ఉంచండి', 'మోకాలిని పక్కకు తెరవండి'],
    alignmentPoints: ['Standing leg straight and strong', 'Bent knee opened out to side', 'Hands in prayer (Anjali Mudra) at chest or raised overhead'],
    commonMistakes: ['Placing the foot directly on the knee joint', 'Tilting pelvis to one side', 'Holding breath while balancing'],
    commonMistakesTe: ['పాదాన్ని నేరుగా మోకాలిపై ఉంచడం', 'నడుము ఒకవైపుకు ఒరిగిపోవడం', 'శ్వాస ఆపివేయడం'],
    breathingGuidance: 'Breathe smoothly and rhythmically to maintain balance.',
    breathingGuidanceTe: 'సహజమైన లయతో నెమ్మదిగా శ్వాస తీసుకోండి.',
  },
  trikonasana: {
    ...trikonasana,
    image: '/images/asanas/trikonasana/human-reference.jpg',
    referencePhoto: '/images/asanas/trikonasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/trikonasana/reference.svg',
    category: 'Standing',
    description: 'An expansive lateral standing stretch opening the hamstrings, hips, and chest while strengthening the core.',
    benefits: ['Stretches hips, groins, and hamstrings', 'Expands chest and shoulder girdle', 'Improves spinal lateral flexibility'],
    howToPerform: [
      'Step feet wide apart, front foot pointing forward and back foot at 45 degrees.',
      'Extend arms out parallel to the floor.',
      'Hinge at your front hip and reach your torso over your front leg.',
      'Lower front hand to shin or floor and reach top arm toward ceiling.',
    ],
    howToPerformTe: [
      'కాళ్ళను వెడల్పుగా ఉంచండి, ముందు పాదం ముందుకు ఉంచండి.',
      'రెండు చేతులను భుజాల ఎత్తులో పక్కలకు చాపండి.',
      'ముందు తుంటి వద్ద శరీరాన్ని పక్కకు వంచండి.',
      'పై చేతిని పైకప్పు వైపు నేరుగా చాపండి.',
    ],
    focusPoints: ['Keep both sides of torso long', 'Stack top shoulder above bottom shoulder', 'Keep both legs straight'],
    focusPointsTe: ['శరీరం రెండు వైపులా సాగదీయండి', 'ఛాతీని వెడల్పుగా తెరవండి', 'రెండు కాళ్ళను నిటారుగా ఉంచండి'],
    alignmentPoints: ['Front foot pointing forward, back foot turned 45 degrees', 'Both legs straight without hyper-extending knees', 'Arms stretched in one vertical line'],
    commonMistakes: ['Collapsing torso downward and rounding spine', 'Bending the front knee', 'Dropping the top arm forward'],
    commonMistakesTe: ['వెన్నును ముందుకు వంచివేయడం', 'ముందు మోకాలిని వంచడం', 'పై చేయి ముందుకు పడిపోవడం'],
    breathingGuidance: 'Inhale to expand your chest, exhale to lengthen your torso.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ ఛాతీని విస్తరించండి, వదులుతూ శరీరాన్ని పొడిగించండి.',
  },
  virabhadrasanaII: {
    ...virabhadrasanaII,
    image: '/images/asanas/virabhadrasanaII/human-reference.jpg',
    referencePhoto: '/images/asanas/virabhadrasanaII/human-reference.jpg',
    referenceIllustration: '/images/asanas/virabhadrasanaII/reference.svg',
    category: 'Standing',
    description: 'A dynamic standing lunge that builds fierce leg strength, opens the hips and chest, and develops endurance.',
    benefits: ['Strengthens thighs, calves, and ankles', 'Increases stamina and focus', 'Opens hips and chest'],
    howToPerform: [
      'Step feet wide apart, front foot forward and back foot at 90 degrees.',
      'Bend front knee to 90 degrees directly above your ankle.',
      'Extend arms parallel to the floor in one strong horizontal line.',
      'Keep torso upright and gaze softly over your front middle finger.',
    ],
    howToPerformTe: [
      'కాళ్ళను వెడల్పుగా ఉంచి ముందు మోకాలిని 90 డిగ్రీలు వంచండి.',
      'వెనుక కాలిని నిటారుగా బలంగా ఉంచండి.',
      'రెండు చేతులను భుజాల ఎత్తులో సమాంతరంగా చాపండి.',
      'వెన్ను నిటారుగా ఉంచి ముందు వేళ్ళ వైపు చూడండి.',
    ],
    focusPoints: ['Bend front knee to 90 degrees over ankle', 'Keep back leg completely straight', 'Extend arms parallel to the floor'],
    focusPointsTe: ['ముందు మోకాలిని 90 డిగ్రీలు వంచండి', 'వెనుక కాలిని నిటారుగా ఉంచండి', 'చేతులను సమాంతరంగా చాపండి'],
    alignmentPoints: ['Front knee aligned with second toe', 'Back leg straight with outer foot pressed into mat', 'Gaze softly over front middle fingernail'],
    commonMistakes: ['Front knee collapsing inward', 'Leaning torso forward over front thigh', 'Letting back arm drop down'],
    commonMistakesTe: ['ముందు మోకాలు లోపలికి ఒరిగిపోవడం', 'మొండెం ముందుకు వాలిపోవడం', 'వెనుక చేయి కిందికి జారడం'],
    breathingGuidance: 'Inhale to lift through the chest, exhale to sink your hips steady and grounded.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ ఛాతీని నిటారుగా ఉంచండి, వదులుతూ స్థిరంగా ఉండండి.',
  },
  bhujangasana: {
    ...bhujangasana,
    image: '/images/asanas/bhujangasana/human-reference.jpg',
    referencePhoto: '/images/asanas/bhujangasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/bhujangasana/reference.svg',
    category: 'Prone Backbend',
    description: 'A rejuvenating prone backbend that strengthens the spine, opens the chest, and stimulates abdominal organs.',
    benefits: ['Strengthens spinal extensors and glutes', 'Expands chest and shoulders', 'Relieves fatigue and back stiffness'],
    howToPerform: [
      'Lie prone on your stomach with legs extended and tops of feet on mat.',
      'Place palms flat on the floor directly under your shoulders.',
      'Hugging elbows close to ribcage, gently lift chest off the mat using back muscles.',
      'Keep shoulders relaxed down and away from your ears.',
    ],
    howToPerformTe: [
      'నేలపై బోర్లా పడుకుని కాళ్ళను వెనక్కి చాచండి.',
      'చేతులను భుజాల కింద నేలపై ఉంచండి.',
      'వెన్ను కండరాల బలంతో ఛాతీని నెమ్మదిగా పైకి ఎత్తండి.',
      'భుజాలను వదులుగా ఉంచి మెడను సహజంగా ఉంచండి.',
    ],
    focusPoints: ['Lift using back strength, not just arm pressure', 'Keep shoulders drawn back and down', 'Keep elbows slightly bent and close to ribs'],
    focusPointsTe: ['వెన్ను బలంతో ఛాతీని ఎత్తండి', 'భుజాలను వెనక్కి కిందికి దించండి', 'మోచేతులను పక్కటెముకల దగ్గర ఉంచండి'],
    alignmentPoints: ['Hands placed under shoulders with fingers spread', 'Elbows tucked close to ribcage with gentle bend', 'Neck long with gaze forward or slightly upward'],
    commonMistakes: ['Throwing head too far back compressing neck', 'Locking elbows completely straight', 'Shoulders hunched up by ears'],
    commonMistakesTe: ['మెడను విపరీతంగా వెనక్కి వంచడం', 'మోచేతులను గట్టిగా లాక్ చేయడం', 'భుజాలు చెవుల వైపు లాగడం'],
    breathingGuidance: 'Inhale smoothly as you lift your chest, exhale to release shoulder tension.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ ఛాతీని పైకి ఎత్తండి, వదులుతూ విశ్రాంతిగా ఉండండి.',
  },
  adhoMukhaSvanasana: {
    ...adhoMukhaSvanasana,
    image: '/images/asanas/adhoMukhaSvanasana/human-reference.jpg',
    referencePhoto: '/images/asanas/adhoMukhaSvanasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/adhoMukhaSvanasana/reference.svg',
    category: 'Inversion',
    description: 'An all-body rejuvenating inversion building upper body strength, decompressing the spine, and calming the mind.',
    benefits: ['Decompresses spine', 'Strengthens arms, shoulders, and wrists', 'Stretches hamstrings, calves, and arches'],
    howToPerform: [
      'Start on hands and knees with wrists under shoulders.',
      'Tuck toes and lift hips upward toward the ceiling.',
      'Form an inverted V-shape with your body.',
      'Press firmly through your palms and let heels reach gently toward floor.',
    ],
    howToPerformTe: [
      'నాలుగు కాళ్ళపై మొదలుపెట్టి మోకాళ్ళను పైకి ఎత్తండి.',
      'నడుమును పైకి ఎత్తి తిరగబడిన V ఆకారాన్ని ఏర్పరచండి.',
      'అరచేతులతో నేలను బలంగా నొక్కండి.',
      'మడమలను నేల వైపు దించండి.',
    ],
    focusPoints: ['Form an inverted V with hips at the peak', 'Press evenly through hands to protect wrists', 'Lengthen your spine from hands to hips'],
    focusPointsTe: ['శరీరాన్ని V ఆకారంలో ఉంచండి', 'అరచేతులతో బలంగా నెట్టండి', 'వెన్నెముకను పొడవుగా సాగదీయండి'],
    alignmentPoints: ['Hands shoulder-width apart, feet hip-width apart', 'Head relaxed between upper arms with neck soft', 'Heels reaching gently toward the floor'],
    commonMistakes: ['Rounding the upper back (bend knees if hamstrings are tight)', 'Dumping weight into wrists', 'Flaring elbows outward'],
    commonMistakesTe: ['వీపును గుండ్రంగా వంచడం', 'మణికట్టుపై విపరీతమైన భారం వేయడం', 'మోచేతులను పక్కకు జారవిడవడం'],
    breathingGuidance: 'Inhale to send hips higher, exhale to ground your hands and feet.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ తుంటిని పైకి ఎత్తండి, వదులుతూ స్థిరపడండి.',
  },
  setuBandhasana: {
    ...setuBandhasana,
    image: '/images/asanas/setuBandhasana/human-reference.jpg',
    referencePhoto: '/images/asanas/setuBandhasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/setuBandhasana/reference.svg',
    category: 'Supine Backbend',
    description: 'A soothing supine backbend strengthening the posterior chain while releasing tension in the chest and neck.',
    benefits: ['Strengthens glutes, hamstrings, and lower back', 'Opens anterior chest and hip flexors', 'Calms the nervous system'],
    howToPerform: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Place arms by your sides with palms facing down.',
      'Press through your heels and lift hips upward toward ceiling.',
      'Roll shoulders under to open your chest while keeping neck relaxed.',
    ],
    howToPerformTe: [
      'వెల్లకిలా పడుకుని మోకాళ్ళను వంచి పాదాలను నేలపై ఉంచండి.',
      'చేతులను పక్కన నేలపై ఉంచండి.',
      'మడమలను నొక్కుతూ నడుమును పైకి ఎత్తండి.',
      'ఛాతీని తెరిచి మెడను వదులుగా ఉంచండి.',
    ],
    focusPoints: ['Lift hips upward by driving through heels', 'Keep knees parallel, hip-width apart', 'Keep neck and throat relaxed'],
    focusPointsTe: ['మడమల బలంతో తుంటిని పైకి ఎత్తండి', 'మోకాళ్ళను సమాంతరంగా ఉంచండి', 'మెడను ప్రశాంతంగా ఉంచండి'],
    alignmentPoints: ['Feet flat on mat hip-width apart', 'Arms extended flat on floor or interlaced underneath', 'Neck relaxed with chin slightly elevated off chest'],
    commonMistakes: ['Allowing knees to splay outward', 'Compressing the back of the neck', 'Dropping the pelvis too low'],
    commonMistakesTe: ['మోకాళ్ళు పక్కకు విచ్చుకోవడం', 'మెడపై అధిక ఒత్తిడి పెట్టడం', 'నడుము కిందకు జారడం'],
    breathingGuidance: 'Inhale to expand your chest and lift hips, exhale to maintain steady glute engagement.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ తుంటిని పైకి ఎత్తండి, వదులుతూ స్థిరంగా ఉంచండి.',
  },
  dandasana: {
    ...dandasana,
    image: '/images/asanas/dandasana/human-reference.jpg',
    referencePhoto: '/images/asanas/dandasana/human-reference.jpg',
    referenceIllustration: '/images/asanas/dandasana/reference.svg',
    category: 'Seated',
    description: 'The baseline seated posture that teaches active 90-degree pelvic alignment and builds deep abdominal support.',
    benefits: ['Strengthens core and deep back stabilizers', 'Improves seated posture awareness', 'Stretches hamstrings and calves'],
    howToPerform: [
      'Sit on the floor with both legs extended straight in front of you.',
      'Flex your feet actively, pointing toes upward toward ceiling.',
      'Place palms flat on the floor beside your hips with fingers forward.',
      'Lengthen your spine tall to form a clean 90-degree angle between torso and legs.',
    ],
    howToPerformTe: [
      'రెండు కాళ్ళను ముందుకు చాపి నేలపై కూర్చోండి.',
      'పాదాల వేళ్ళను పైకి చూపిస్తూ నిటారుగా ఉంచండి.',
      'చేతులను తుంటి పక్కన నేలపై ఉంచండి.',
      'వెన్నెముకను 90 డిగ్రీల కోణంలో నిటారుగా నిలబెట్టండి.',
    ],
    focusPoints: ['Sit upright on your sitting bones', 'Maintain a crisp 90-degree angle between spine and legs', 'Flex feet actively'],
    focusPointsTe: ['తుంటి ఎముకలపై నిటారుగా కూర్చోండి', 'వెన్నును 90 డిగ్రీలు నిటారుగా ఉంచండి', 'పాదాలను ముందుకు చాపి ఉంచండి'],
    alignmentPoints: ['Spine straight and crown reaching tall', 'Palms resting flat on mat next to hips with fingers pointing forward', 'Shoulders rolled back and chest lifted'],
    commonMistakes: ['Slumping backward onto tailbone with rounded back', 'Letting feet roll outward', 'Tensing shoulders up'],
    commonMistakesTe: ['వీపును వెనక్కి వంచడం', 'పాదాలు పక్కకు జారడం', 'భుజాలు పైకి లాగడం'],
    breathingGuidance: 'Inhale to lengthen your spine upward, exhale to ground your sitting bones.',
    breathingGuidanceTe: 'శ్వాస తీసుకుంటూ వెన్ను నిటారుగా చేయండి, వదులుతూ శరీరాన్ని స్థిరపరచండి.',
  },
};

export const ASANA_LIST = Object.values(ASANA_REGISTRY);
export const ASANA_CURRICULUM = ASANA_LIST;

/**
 * Helper to retrieve an asana config by ID, defaulting to Virabhadrasana II.
 */
export function getAsanaConfig(asanaId) {
  if (!asanaId) return ASANA_REGISTRY.virabhadrasanaII;
  return ASANA_REGISTRY[asanaId] || null;
}

export {
  tadasana,
  vrikshasana,
  trikonasana,
  virabhadrasanaII,
  bhujangasana,
  adhoMukhaSvanasana,
  setuBandhasana,
  dandasana,
};
