import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import audioFeedbackService, { AUDIO_SOURCES } from '../../src/services/audioFeedbackService';

describe('AudioFeedbackService (Global Audio Manager & Single-Audio-Output Rule)', () => {
  let playMock;
  let pauseMock;
  let speakMock;
  let cancelMock;
  let fetchSpy;

  beforeEach(() => {
    audioFeedbackService.resetCooldowns();
    audioFeedbackService.setCooldowns(3500, 2000);

    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();
    speakMock = vi.fn();
    cancelMock = vi.fn();
    fetchSpy = vi.spyOn(globalThis, 'fetch');

    // Mock HTMLAudioElement
    globalThis.Audio = vi.fn().mockImplementation(function (src) {
      this.src = src;
      this.currentTime = 0;
      this.play = playMock;
      this.pause = pauseMock;
      this.addEventListener = vi.fn();
      this.removeEventListener = vi.fn();
    });

    // Mock window.speechSynthesis
    const synthMock = {
      speak: speakMock,
      cancel: cancelMock,
      getVoices: vi.fn().mockReturnValue([]),
    };
    const utterMock = vi.fn().mockImplementation(function (text) {
      this.text = text;
      this.lang = 'en-IN';
    });

    globalThis.speechSynthesis = synthMock;
    globalThis.SpeechSynthesisUtterance = utterMock;
    if (typeof window !== 'undefined') {
      window.speechSynthesis = synthMock;
      window.SpeechSynthesisUtterance = utterMock;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows playing a valid Telugu correction with local MP3 and zero network calls', async () => {
    const result = await audioFeedbackService.playCorrection('lower_shoulders', 'te');

    expect(result.played).toBe(true);
    expect(result.source).toBe(AUDIO_SOURCES.LOCAL_MP3);
    expect(result.canonicalId).toBe('lower_shoulders');
    expect(result.path).toBe('/audio/te/virabhadrasanaII/lower_shoulders.mp3');
    expect(result.text).toBe('మీ భుజాలను కొద్దిగా వదులుగా ఉంచండి.');
    expect(playMock).toHaveBeenCalledTimes(1);

    // CRITICAL: Ensure NO network / Sarvam fetch requests were made
    expect(fetchSpy).not.toHaveBeenCalled();
    // CRITICAL: Ensure Web Speech was NOT invoked simultaneously
    expect(speakMock).not.toHaveBeenCalled();
  });

  it('resolves alias keys to canonical audio path', async () => {
    const result = await audioFeedbackService.playCorrection('front_knee_too_straight', 'te');

    expect(result.played).toBe(true);
    expect(result.canonicalId).toBe('bend_front_knee');
    expect(result.path).toBe('/audio/te/virabhadrasanaII/bend_front_knee.mp3');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(speakMock).not.toHaveBeenCalled();
  });

  it('falls back to single Web Speech utterance when no local MP3 exists (English)', async () => {
    const result = await audioFeedbackService.playCorrection('lower_shoulders', 'en');

    expect(result.played).toBe(true);
    expect(result.source).toBe(AUDIO_SOURCES.WEB_SPEECH);
    expect(result.text).toBe('Relax your shoulders slightly.');
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(cancelMock).toHaveBeenCalled(); // Always cancels previous speech
    expect(playMock).not.toHaveBeenCalled(); // No local audio attempt
    expect(fetchSpy).not.toHaveBeenCalled(); // Zero Sarvam API calls
  });

  it('suppresses duplicate rapid triggers of the same correction (cooldown)', async () => {
    const first = await audioFeedbackService.playCorrection('bend_front_knee', 'te');
    expect(first.played).toBe(true);

    // Immediate second trigger of the same cue
    const second = await audioFeedbackService.playCorrection('bend_front_knee', 'te');
    expect(second.played).toBe(false);
    expect(second.reason).toBe('same_cue_cooldown');
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('suppresses rapid different corrections within min interval window', async () => {
    const first = await audioFeedbackService.playCorrection('bend_front_knee', 'te');
    expect(first.played).toBe(true);

    // Immediate trigger of a DIFFERENT cue within min interval (2000ms)
    const second = await audioFeedbackService.playCorrection('straighten_back_leg', 'te');
    expect(second.played).toBe(false);
    expect(second.reason).toBe('min_interval_active');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('interrupts older correction immediately when forced new correction arrives', async () => {
    await audioFeedbackService.playCorrection('bend_front_knee', 'te');
    const tokenBefore = audioFeedbackService.getDiagnostics().playbackToken;

    // Trigger second correction with force: true
    const second = await audioFeedbackService.playCorrection('lower_shoulders', 'te', { force: true });
    expect(second.played).toBe(true);
    expect(pauseMock).toHaveBeenCalled(); // Stopped previous audio
    expect(cancelMock).toHaveBeenCalled(); // Canceled any speech
    expect(audioFeedbackService.getDiagnostics().playbackToken).toBeGreaterThan(tokenBefore);
  });

  it('stops currently playing audio and cancels speech on stopCorrectionAudio', async () => {
    await audioFeedbackService.playCorrection('keep_torso_upright', 'te');
    expect(audioFeedbackService.isAudioPlaying()).toBe(true);

    audioFeedbackService.stopCorrectionAudio();
    expect(pauseMock).toHaveBeenCalled();
    expect(cancelMock).toHaveBeenCalled();
    expect(audioFeedbackService.isAudioPlaying()).toBe(false);
    expect(audioFeedbackService.getDiagnostics().audioSource).toBe(AUDIO_SOURCES.NONE);
  });

  it('exposes accurate diagnostics for developer inspection', async () => {
    await audioFeedbackService.playCorrection('good_job', 'te');
    const diag = audioFeedbackService.getDiagnostics();

    expect(diag.audioSource).toBe(AUDIO_SOURCES.LOCAL_MP3);
    expect(diag.activeCorrectionId).toBe('good_job');
    expect(diag.isPlaying).toBe(true);
  });
});
