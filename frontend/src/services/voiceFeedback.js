/**
 * voiceFeedback.js
 * Unified facade delegating directly to audioFeedbackService.
 * Guarantees zero duplicate audio paths or conflicting Web Speech calls.
 */

import audioFeedbackService from './audioFeedbackService';

export async function speak(text, langCode = 'en', options = {}) {
  return audioFeedbackService.playCorrection(text, langCode, options);
}

export function stopSpeech() {
  audioFeedbackService.stopCorrectionAudio();
}

export async function getAvailableIndianLanguages() {
  return [
    { lang: 'te-IN', name: 'Telugu', localService: true },
    { lang: 'en-IN', name: 'English (India)', localService: true },
  ];
}
