/**
 * scripts/generateSarvamAudio.js
 *
 * Standalone, manual CLI tool for generating pre-rendered audio assets via Sarvam AI Bulbul v3.
 *
 * Covers all 28 shared correction phrases across the 8-Asana MVP in Telugu (te-IN).
 *
 * IMPORTANT RULES:
 * 1. This script is NEVER run automatically during runtime.
 * 2. It is NEVER imported into frontend or backend runtime bundles.
 * 3. It requires explicit CLI invocation (--confirm).
 * 4. It supports dry-run mode (default without --confirm) to inspect text and character counts.
 * 5. Uses manifest-based text-change detection so only modified/missing files are synthesized.
 *
 * Usage:
 *   node scripts/generateSarvamAudio.js
 *   node scripts/generateSarvamAudio.js --confirm
 *   node scripts/generateSarvamAudio.js --confirm --force
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  });
  return env;
}

const backendEnv = loadEnv(path.resolve(__dirname, '../backend/.env'));
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || backendEnv.SARVAM_API_KEY;
const TARGET_DIR = path.resolve(__dirname, '../frontend/public/audio/te/virabhadrasanaII');
const MANIFEST_PATH = path.join(TARGET_DIR, 'manifest.json');

// 28 Reusable Telugu Cues across the 8-Asana Curriculum (Source of Truth)
const TELUGU_PHRASES = [
  { id: 'lower_shoulders', text: 'మీ భుజాలను కొద్దిగా వదులుగా ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'relax_shoulders', text: 'భుజాలను కిందకు దించి ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'raise_arms', text: 'చేతులను పైకి ఎత్తండి.', category: 'POSE_SPECIFIC' },
  { id: 'extend_arms', text: 'చేతులను పూర్తిగా చాచండి.', category: 'POSE_SPECIFIC' },
  { id: 'extend_left_arm', text: 'ఎడమ చేతిని పూర్తిగా చాచండి.', category: 'POSE_SPECIFIC' },
  { id: 'extend_right_arm', text: 'కుడి చేతిని పూర్తిగా చాచండి.', category: 'POSE_SPECIFIC' },
  { id: 'bend_front_knee', text: 'ముందు మోకాలిని ఇంకొంచెం వంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'align_front_knee', text: 'ముందు మోకాలిని మడమ పైనే ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'straighten_knees', text: 'మోకాళ్లను సూటిగా ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'straighten_back_leg', text: 'వెనుక కాలును సూటిగా ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'lift_bent_knee', text: 'వంచిన మోకాలిని పక్కవైపుకు జరపండి.', category: 'POSE_SPECIFIC' },
  { id: 'keep_torso_upright', text: 'శరీరాన్ని నిటారుగా ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'lengthen_spine', text: 'వెన్నెముకను పైకి నిటారుగా చాచండి.', category: 'POSE_SPECIFIC' },
  { id: 'lift_chest', text: 'ఛాతీని ముందుకు, పైకి తెరవండి.', category: 'POSE_SPECIFIC' },
  { id: 'soften_elbows', text: 'మోచేతులను బిగించకుండా కొద్దిగా వంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'lift_hips_higher', text: 'నడుమును మరింత పైకి ఎత్తండి.', category: 'POSE_SPECIFIC' },
  { id: 'press_hips_back', text: 'నడుమును వెనక్కి, పైకి నెట్టండి.', category: 'POSE_SPECIFIC' },
  { id: 'align_hips_shoulders', text: 'నడుము మరియు భుజాలను ఒకే వరుసలో ఉంచండి.', category: 'POSE_SPECIFIC' },
  { id: 'ground_feet', text: 'పాదాలను నేలపై బలంగా ఆనించండి.', category: 'POSE_SPECIFIC' },
  { id: 'move_back', text: 'పూర్తి శరీరం కనిపించేలా కొంచెం వెనక్కి వెళ్ళండి.', category: 'GLOBAL_CAMERA_GATE' },
  { id: 'move_forward', text: 'కెమెరాకు కొంచెం ముందుకు రండి.', category: 'GLOBAL_CAMERA_GATE' },
  { id: 'move_left', text: 'కొంచెం ఎడమవైపుకు జరగండి.', category: 'GLOBAL_CAMERA_GATE' },
  { id: 'move_right', text: 'కొంచెం కుడివైపుకు జరగండి.', category: 'GLOBAL_CAMERA_GATE' },
  { id: 'hold_position', text: 'ఇలాగే స్థిరంగా ఉండండి.', category: 'REINFORCEMENT' },
  { id: 'good_job', text: 'చాలా బాగుంది! అలాగే ఉండండి.', category: 'REINFORCEMENT' },
  { id: 'excellent', text: 'అద్భుతం! భంగిమ చాలా బాగుంది.', category: 'REINFORCEMENT' },
  { id: 'try_again', text: 'శ్వాస తీసుకుని మళ్లీ ప్రయత్నించండి.', category: 'REINFORCEMENT' },
  { id: 'keep_breathing', text: 'నెమ్మదిగా, ప్రశాంతంగా శ్వాస తీసుకోండి.', category: 'REINFORCEMENT' },
];

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

function printDryRun() {
  console.log('===============================================================');
  console.log('SARVAM AI BULBUL V3 AUDIO ASSET GENERATOR (DRY RUN MODE)');
  console.log('===============================================================');
  console.log(`Target Directory: ${TARGET_DIR}`);
  console.log(`Language: Telugu (te-IN) | Speaker: kavya | Model: bulbul:v3`);
  console.log(`Total Phrases: ${TELUGU_PHRASES.length}`);
  console.log(`API Key Configured: ${SARVAM_API_KEY ? 'YES (Loaded securely from backend/.env)' : 'NO (Missing)'}`);

  const manifest = loadManifest();
  let totalChars = 0;
  let missingOrChangedCount = 0;
  let existingUnchangedCount = 0;

  console.log('\nPhrases Manifest Inspection:');
  TELUGU_PHRASES.forEach((item, index) => {
    const charCount = item.text.length;
    totalChars += charCount;
    const destFile = `${item.id}.mp3`;
    const destPath = path.join(TARGET_DIR, destFile);
    const fileExists = fs.existsSync(destPath);
    const manifestEntry = manifest[item.id];
    const textMatchesManifest = manifestEntry && manifestEntry.text === item.text;

    let status = 'NEEDS GENERATION (New)';
    if (fileExists && textMatchesManifest) {
      status = 'EXISTS (Up-to-date)';
      existingUnchangedCount += 1;
    } else if (fileExists && !textMatchesManifest) {
      status = 'NEEDS REGENERATION (Text revised)';
      missingOrChangedCount += 1;
    } else {
      missingOrChangedCount += 1;
    }

    console.log(`  ${(index + 1).toString().padStart(2, ' ')}. [${item.category}] ${item.id} -> ${destFile} (${charCount} chars) [${status}]`);
    console.log(`      "${item.text}"`);
  });

  console.log('---------------------------------------------------------------');
  console.log(`Total Characters across all 28 phrases: ${totalChars}`);
  console.log(`Total Assets in Curriculum: ${TELUGU_PHRASES.length}`);
  console.log(`Assets requiring synthesis: ${missingOrChangedCount}`);
  console.log(`Assets already up-to-date: ${existingUnchangedCount}`);
  console.log(`Estimated One-Time Cost: ~₹${((totalChars / 1000) * 3.0).toFixed(2)} (at ₹3.00/1K chars)`);
  console.log('---------------------------------------------------------------');
  console.log('To execute real generation, run with explicit confirmation:');
  console.log('  node scripts/generateSarvamAudio.js --confirm');
  console.log('  (Use --force to regenerate all 28 assets regardless of manifest)');
  console.log('===============================================================');
}

async function requestSarvamTts(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      inputs: [text],
      target_language_code: 'te-IN',
      speaker: 'kavya',
      pace: 1.0,
      model: 'bulbul:v3',
    });

    const options = {
      hostname: 'api.sarvam.ai',
      path: '/text-to-speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(responseBody);
            if (data.audios && data.audios[0]) {
              resolve(Buffer.from(data.audios[0], 'base64'));
            } else {
              reject(new Error('Invalid response payload from Sarvam API'));
            }
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`Sarvam API HTTP ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function generateAllAudio(force = false) {
  if (!SARVAM_API_KEY) {
    console.error('ERROR: SARVAM_API_KEY is not set in backend/.env');
    process.exit(1);
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });
  const manifest = loadManifest();

  console.log('===============================================================');
  console.log('GENERATING TELUGU AUDIO ASSETS (EXPLICIT INVOCATION)');
  console.log('===============================================================');

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let charsSynthesized = 0;

  for (let i = 0; i < TELUGU_PHRASES.length; i++) {
    const item = TELUGU_PHRASES[i];
    const filePath = path.join(TARGET_DIR, `${item.id}.mp3`);
    const fileExists = fs.existsSync(filePath);
    const manifestEntry = manifest[item.id];
    const textMatches = manifestEntry && manifestEntry.text === item.text;

    if (!force && fileExists && textMatches) {
      console.log(`[${i + 1}/${TELUGU_PHRASES.length}] "${item.id}" is up-to-date. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${TELUGU_PHRASES.length}] Synthesizing "${item.id}" (${item.text.length} chars)...`);
    console.log(`    Text: "${item.text}"`);

    try {
      const audioBuffer = await requestSarvamTts(item.text);
      fs.writeFileSync(filePath, audioBuffer);
      charsSynthesized += item.text.length;

      manifest[item.id] = {
        id: item.id,
        category: item.category,
        text: item.text,
        file: `${item.id}.mp3`,
        sizeBytes: audioBuffer.length,
        sha256: crypto.createHash('sha256').update(audioBuffer).digest('hex'),
        updatedAt: new Date().toISOString(),
      };
      saveManifest(manifest);

      console.log(`    -> Saved: ${filePath} (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
      successCount++;

      // Polite pacing between API calls
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`    -> FAILED: ${err.message}`);
      failedCount++;
    }
  }

  console.log('===============================================================');
  console.log('AUDIO GENERATION SUMMARY:');
  console.log(`  Synthesized: ${successCount}`);
  console.log(`  Skipped (Already Current): ${skippedCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log(`  Characters Synthesized: ${charsSynthesized}`);
  console.log(`  Actual Cost: ~₹${((charsSynthesized / 1000) * 3.0).toFixed(2)}`);
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log('===============================================================');
}

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  generateAllAudio(args.includes('--force'));
} else {
  printDryRun();
}
