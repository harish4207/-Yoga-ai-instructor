const request = require('supertest');
const express = require('express');
const ttsRouter = require('../../src/routes/tts');

describe('TTS Backend Route (/api/tts)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tts', ttsRouter);
  });

  it('rejects requests with missing or empty text', async () => {
    const res = await request(app).post('/api/tts').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Text string is required');
  });

  it('rejects requests with non-string text', async () => {
    const res = await request(app).post('/api/tts').send({ text: 12345 });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Text string is required');
  });

  it('returns fallback response when SARVAM_API_KEY is unset', async () => {
    const originalKey = process.env.SARVAM_API_KEY;
    delete process.env.SARVAM_API_KEY;

    const res = await request(app).post('/api/tts').send({
      text: 'Stand with your feet apart.',
      languageCode: 'en-IN',
    });

    expect(res.status).toBe(503);
    expect(res.body.fallbackToClient).toBe(true);

    process.env.SARVAM_API_KEY = originalKey;
  });

  it('does not leak the SARVAM_API_KEY in the error response', async () => {
    process.env.SARVAM_API_KEY = 'super_secret_test_key';

    // Mock global fetch to simulate upstream failure
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized key',
    });

    const res = await request(app).post('/api/tts').send({
      text: 'Stand with your feet apart.',
      languageCode: 'en-IN',
    });

    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('super_secret_test_key');
    expect(res.body.fallbackToClient).toBe(true);

    global.fetch = originalFetch;
  });

  it('returns audio payload successfully when Sarvam responds ok', async () => {
    process.env.SARVAM_API_KEY = 'valid_test_key';

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ audios: ['UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='] }),
    });

    const res = await request(app).post('/api/tts').send({
      text: 'Keep your arms straight.',
      languageCode: 'en-IN',
    });

    expect(res.status).toBe(200);
    expect(res.body.audio).toBeDefined();
    expect(res.body.format).toBe('audio/wav');
    expect(JSON.stringify(res.body)).not.toContain('valid_test_key');

    global.fetch = originalFetch;
  });
});
