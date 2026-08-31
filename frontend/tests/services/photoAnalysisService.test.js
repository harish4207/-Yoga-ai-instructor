import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePhotoFile, analyzePhotoViaCvService } from '../../src/services/photoAnalysisService';
import { ASANA_CURRICULUM } from '../../src/engine/poseRules';
import { getCorrectionAudioPath } from '../../src/services/correctionRegistry';

describe('photoAnalysisService', () => {
  it('validates correct image files (JPEG, PNG, WebP)', () => {
    const validJpg = new File(['dummy'], 'pose.jpg', { type: 'image/jpeg' });
    const validPng = new File(['dummy'], 'pose.png', { type: 'image/png' });
    const validWebp = new File(['dummy'], 'pose.webp', { type: 'image/webp' });

    expect(validatePhotoFile(validJpg).valid).toBe(true);
    expect(validatePhotoFile(validPng).valid).toBe(true);
    expect(validatePhotoFile(validWebp).valid).toBe(true);
  });

  it('rejects unsupported file formats', () => {
    const txtFile = new File(['text'], 'report.txt', { type: 'text/plain' });
    const pdfFile = new File(['pdf'], 'pose.pdf', { type: 'application/pdf' });

    const resTxt = validatePhotoFile(txtFile);
    expect(resTxt.valid).toBe(false);
    expect(resTxt.error).toContain('Unsupported file format');

    const resPdf = validatePhotoFile(pdfFile);
    expect(resPdf.valid).toBe(false);
  });

  it('rejects files larger than 10MB limit', () => {
    const largeFile = new File(['x'.repeat(100)], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const result = validatePhotoFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds 10 MB');
  });

  it('rejects null/empty file selection', () => {
    expect(validatePhotoFile(null).valid).toBe(false);
    expect(validatePhotoFile(undefined).valid).toBe(false);
  });

  it('sends multipart request to CV service and parses report card response', async () => {
    const mockReport = {
      success: true,
      score: 86,
      asana_name: 'Warrior II (Virabhadrasana II)',
      session_ready: true,
      annotated_image: 'data:image/jpeg;base64,dummy',
      top_correction: { correction_key: 'bend_front_knee' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReport,
    });

    const file = new File(['dummy content'], 'warrior.jpg', { type: 'image/jpeg' });
    const result = await analyzePhotoViaCvService(file, 'virabhadrasanaII');

    expect(global.fetch).toHaveBeenCalled();
    expect(result.score).toBe(86);
    expect(result.annotated_image).toBe('data:image/jpeg;base64,dummy');
  });

  it('supports analysis invocation for all 8 curriculum asanas', async () => {
    for (const asana of ASANA_CURRICULUM) {
      const mockResponse = {
        success: true,
        asana_id: asana.id,
        score: 90,
        session_ready: true,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const file = new File(['dummy'], `${asana.id}.jpg`, { type: 'image/jpeg' });
      const result = await analyzePhotoViaCvService(file, asana.id);
      expect(result.asana_id).toBe(asana.id);
      expect(result.score).toBe(90);
    }
  });

  it('resolves local Telugu audio path for report card corrections without network call', () => {
    const audioPath = getCorrectionAudioPath('bend_front_knee', 'te');
    expect(audioPath).toBe('/audio/te/virabhadrasanaII/bend_front_knee.mp3');
  });

  it('throws descriptive error on CV service failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: 'Could not detect pose landmarks' }),
    });

    const file = new File(['dummy'], 'warrior.jpg', { type: 'image/jpeg' });
    await expect(analyzePhotoViaCvService(file, 'virabhadrasanaII')).rejects.toThrow(
      'Could not detect pose landmarks'
    );
  });
});
