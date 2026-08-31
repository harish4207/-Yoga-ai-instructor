/**
 * audioFeedbackService.js
 * Central Global Audio Manager for AI Yoga Coach.
 *
 * Guarantees:
 * - Single-Audio-Output Rule: Exactly ONE active audio path at any given time.
 * - Local Static Audio First: Pre-generated local MP3s for Telugu without runtime Sarvam API calls.
 * - Single Fallback: Web Speech API ONLY if local audio asset is missing (e.g. English) or fails.
 * - Monotonic Playback Tokens: Old async callbacks/promises CANNOT start stale audio after a new correction begins.
 * - Clean Interruption & Cancellation: Stops active HTMLAudioElement and cancels speechSynthesis instantly.
 * - Developer Diagnostics: Exposes live audio source and playback token state.
 */

import {
  getCorrectionEntry,
  getCorrectionAudioPath,
  getCorrectionText,
} from './correctionRegistry';

// Cooldown and debounce defaults
const DEFAULT_SAME_CUE_COOLDOWN_MS = 3500; // Cooldown for identical correction
const DEFAULT_MIN_INTERVAL_MS = 2000;       // Minimum quiet period between any two corrections

export const AUDIO_SOURCES = {
  NONE: 'NONE',
  LOCAL_MP3: 'LOCAL_MP3',
  WEB_SPEECH: 'WEB_SPEECH',
};

class AudioFeedbackService {
  constructor() {
    this.activeAudio = null;
    this.activeAudioSource = AUDIO_SOURCES.NONE;
    this.activeCorrectionId = null;
    this.currentPlaybackToken = 0;
    this.isPlaying = false;
    this.isAutoplayBlocked = false;

    this.lastCorrectionId = null;
    this.lastPlayTime = 0;
    this.correctionTimestamps = new Map();
    this.sameCueCooldownMs = DEFAULT_SAME_CUE_COOLDOWN_MS;
    this.minIntervalMs = DEFAULT_MIN_INTERVAL_MS;

    this.audioElementCache = new Map();
  }

  /**
   * Configure cooldown durations.
   */
  setCooldowns(sameCueMs, minIntervalMs) {
    if (typeof sameCueMs === 'number') this.sameCueCooldownMs = sameCueMs;
    if (typeof minIntervalMs === 'number') this.minIntervalMs = minIntervalMs;
  }

  /**
   * Resets all internal cooldowns, caches, active audio, and increments token.
   */
  resetCooldowns() {
    this.stopCorrectionAudio();
    this.lastCorrectionId = null;
    this.lastPlayTime = 0;
    this.correctionTimestamps.clear();
    this.audioElementCache.clear();
    this.isAutoplayBlocked = false;
  }

  /**
   * Checks whether a correction is permitted to play based on cooldown policies.
   */
  canPlay(correctionId, now = Date.now()) {
    if (!correctionId) {
      return { allowed: false, reason: 'missing_id' };
    }

    // 1. Check cooldown for identical cue
    const lastTimeForThisCue = this.correctionTimestamps.get(correctionId) || 0;
    const timeSinceSameCue = now - lastTimeForThisCue;
    if (lastTimeForThisCue > 0 && timeSinceSameCue < this.sameCueCooldownMs) {
      return { allowed: false, reason: 'same_cue_cooldown' };
    }

    // 2. Check minimum interval between any speech
    const timeSinceLastAny = now - this.lastPlayTime;
    if (this.lastPlayTime > 0 && timeSinceLastAny < this.minIntervalMs) {
      return { allowed: false, reason: 'min_interval_active' };
    }

    return { allowed: true, reason: null };
  }

  _getSpeechSynthesis() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis;
    }
    if (typeof globalThis !== 'undefined' && globalThis.speechSynthesis) {
      return globalThis.speechSynthesis;
    }
    return null;
  }

  /**
   * Stops any currently playing local audio AND cancels all Web Speech utterances.
   * Invalidates existing playback tokens.
   */
  stopCorrectionAudio() {
    // Invalidate active playback token
    this.currentPlaybackToken++;

    // 1. Stop local HTMLAudioElement
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
      } catch (e) {
        // Ignore audio cleanup errors
      }
      this.activeAudio = null;
    }

    // 2. Cancel browser speechSynthesis
    const synth = this._getSpeechSynthesis();
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {
        // Ignore speechSynthesis cancellation errors
      }
    }

    this.isPlaying = false;
    this.activeAudioSource = AUDIO_SOURCES.NONE;
    this.activeCorrectionId = null;
  }

  /**
   * Plays a correction cue following the Single-Audio-Output Rule:
   * 1. Pre-generated local MP3 (if available for language)
   * 2. Single Web Speech API fallback (if local MP3 is unavailable or fails)
   *
   * @param {string} correctionId - Canonical ID or alias
   * @param {string} [language='te'] - Target language ('te' or 'en')
   * @param {object} [options={}] - Options { force: boolean, interrupt: boolean }
   * @returns {Promise<{ played: boolean, source?: string, reason?: string, canonicalId?: string }>}
   */
  async playCorrection(correctionId, language = 'te', options = {}) {
    const entry = getCorrectionEntry(correctionId);
    if (!entry) {
      return { played: false, reason: 'unknown_correction_id' };
    }

    const canonicalId = entry.id;
    const now = Date.now();

    // Check cooldown unless forced
    if (!options.force) {
      const check = this.canPlay(canonicalId, now);
      if (!check.allowed) {
        return { played: false, reason: check.reason };
      }
    }

    // Always stop and invalidate any previous speech before beginning new audio
    this.stopCorrectionAudio();

    // Generate unique monotonic playback token for this request
    const token = this.currentPlaybackToken;

    // Update cooldown timestamps immediately
    this.lastPlayTime = now;
    this.lastCorrectionId = canonicalId;
    this.correctionTimestamps.set(canonicalId, now);

    const localAudioPath = getCorrectionAudioPath(canonicalId, language);
    const cueText = getCorrectionText(canonicalId, language) || entry.live?.en || canonicalId;

    // PATH 1: LOCAL STATIC MP3 (Preferred for Telugu)
    if (localAudioPath) {
      try {
        let audio = this.audioElementCache.get(localAudioPath);
        if (!audio) {
          audio = new Audio(localAudioPath);
          audio.preload = 'auto';
          this.audioElementCache.set(localAudioPath, audio);
        }

        this.activeAudio = audio;
        this.activeAudioSource = AUDIO_SOURCES.LOCAL_MP3;
        this.activeCorrectionId = canonicalId;
        this.isPlaying = true;

        audio.onended = () => {
          if (this.currentPlaybackToken === token) {
            this.isPlaying = false;
            this.activeAudioSource = AUDIO_SOURCES.NONE;
            this.activeAudio = null;
            this.activeCorrectionId = null;
          }
        };

        audio.onerror = (err) => {
          console.warn(`[audioFeedbackService] Local MP3 failed to load: ${localAudioPath}. Falling back to Web Speech.`);
          if (this.currentPlaybackToken === token) {
            this.activeAudio = null;
            this._speakWebSpeechFallback(cueText, language, token, canonicalId);
          }
        };

        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise.catch((err) => {
            if (this.currentPlaybackToken === token) {
              this.isAutoplayBlocked = true;
              console.warn(`[audioFeedbackService] Audio autoplay blocked: ${err.message}`);
              this.stopCorrectionAudio();
            }
          });
        }

        // Verify token didn't change while waiting for play promise
        if (this.currentPlaybackToken !== token) {
          audio.pause();
          return { played: false, reason: 'superseded_by_newer_audio' };
        }

        this.isAutoplayBlocked = false;
        return {
          played: true,
          source: AUDIO_SOURCES.LOCAL_MP3,
          canonicalId,
          path: localAudioPath,
          text: cueText,
        };
      } catch (err) {
        console.warn(`[audioFeedbackService] Local MP3 exception: ${err.message}`);
        if (this.currentPlaybackToken === token) {
          return this._speakWebSpeechFallback(cueText, language, token, canonicalId);
        }
        return { played: false, reason: 'superseded' };
      }
    }

    // PATH 2: WEB SPEECH API FALLBACK (For English or missing static asset)
    return this._speakWebSpeechFallback(cueText, language, token, canonicalId);
  }

  _speakWebSpeechFallback(text, language, token, canonicalId) {
    if (this.currentPlaybackToken !== token) {
      return { played: false, reason: 'superseded' };
    }

    const synth = this._getSpeechSynthesis();
    if (!synth) {
      this.isPlaying = false;
      this.activeAudioSource = AUDIO_SOURCES.NONE;
      return { played: false, reason: 'speech_synthesis_unavailable' };
    }

    try {
      synth.cancel();

      const UtteranceClass = (typeof window !== 'undefined' && window.SpeechSynthesisUtterance)
        || (typeof globalThis !== 'undefined' && globalThis.SpeechSynthesisUtterance)
        || null;

      if (!UtteranceClass) {
        this.isPlaying = false;
        this.activeAudioSource = AUDIO_SOURCES.NONE;
        return { played: false, reason: 'speech_synthesis_utterance_unavailable' };
      }

      const utterance = new UtteranceClass(text);
      utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      this.activeAudioSource = AUDIO_SOURCES.WEB_SPEECH;
      this.activeCorrectionId = canonicalId;
      this.isPlaying = true;

      utterance.onend = () => {
        if (this.currentPlaybackToken === token) {
          this.isPlaying = false;
          this.activeAudioSource = AUDIO_SOURCES.NONE;
          this.activeCorrectionId = null;
        }
      };

      utterance.onerror = (e) => {
        if (this.currentPlaybackToken === token) {
          this.isPlaying = false;
          this.activeAudioSource = AUDIO_SOURCES.NONE;
          this.activeCorrectionId = null;
        }
      };

      synth.speak(utterance);
      return {
        played: true,
        source: AUDIO_SOURCES.WEB_SPEECH,
        canonicalId,
        text,
      };
    } catch (e) {
      this.isPlaying = false;
      this.activeAudioSource = AUDIO_SOURCES.NONE;
      return { played: false, reason: 'speech_synthesis_error', error: e.message };
    }
  }

  /**
   * Unlocks audio context on user interaction if autoplay was blocked.
   */
  async unlockAutoplay() {
    this.isAutoplayBlocked = false;
    // Play a brief silent buffer to unlock browser audio policy
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      await silentAudio.play();
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Developer diagnostics inspector.
   */
  getDiagnostics() {
    return {
      audioSource: this.activeAudioSource,
      activeCorrectionId: this.activeCorrectionId,
      playbackToken: this.currentPlaybackToken,
      isPlaying: this.isPlaying,
      isAutoplayBlocked: this.isAutoplayBlocked,
      lastPlayTime: this.lastPlayTime,
      sameCueCooldownMs: this.sameCueCooldownMs,
      minIntervalMs: this.minIntervalMs,
    };
  }

  isAudioPlaying() {
    return this.isPlaying;
  }

  getLastCorrection() {
    return this.lastCorrectionId;
  }
}

export const audioFeedbackService = new AudioFeedbackService();
export default audioFeedbackService;
