const express = require('express');
const router = express.Router();

// Supported BCP-47 language codes
const SUPPORTED_LANGUAGES = [
  'en-IN',
  'hi-IN',
  'ta-IN',
  'te-IN',
  'kn-IN',
  'ml-IN',
  'mr-IN',
  'bn-IN',
  'gu-IN',
  'od-IN',
  'pa-IN',
];

/**
 * POST /api/tts
 * Synthesizes speech using Sarvam AI Bulbul v3 backend proxy.
 * Keeps API keys securely on the server.
 */
router.post('/', async (req, res) => {
  const { text, languageCode = 'en-IN', speaker = 'kavya' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ message: 'Text string is required for TTS synthesis.' });
  }

  const sarvamApiKey = process.env.SARVAM_API_KEY;
  if (!sarvamApiKey) {
    return res.status(503).json({
      message: 'Sarvam TTS service is not configured on the server.',
      fallbackToClient: true,
    });
  }

  const targetLang = SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en-IN';

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        inputs: [text.trim()],
        target_language_code: targetLang,
        speaker: speaker || 'kavya',
        model: 'bulbul:v3',
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Sarvam TTS API responded with status ${response.status}:`, errBody);
      return res.status(502).json({
        message: 'TTS generation failed upstream.',
        fallbackToClient: true,
      });
    }

    const data = await response.json();
    if (data && data.audios && data.audios[0]) {
      return res.json({
        audio: data.audios[0],
        format: 'audio/wav',
        languageCode: targetLang,
      });
    } else {
      return res.status(502).json({
        message: 'No audio returned from TTS provider.',
        fallbackToClient: true,
      });
    }
  } catch (error) {
    console.error('Error contacting Sarvam TTS API:', error.message);
    return res.status(500).json({
      message: 'Failed to process TTS request.',
      fallbackToClient: true,
    });
  }
});

module.exports = router;
