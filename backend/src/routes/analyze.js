/**
 * routes/analyze.js
 * Proxy route for Photo Analysis forwarding image uploads to the Python CV service.
 */
const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const { URL } = require('url');

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/analyze
 * Accepts JSON base64 or multipart forwarded payload and proxies to CV Service /analyze.
 */
router.post('/', async (req, res) => {
  try {
    const cvUrl = new URL(`${CV_SERVICE_URL.replace(/\/+$/, '')}/analyze`);
    const isHttps = cvUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const payload = JSON.stringify(req.body);

    const options = {
      hostname: cvUrl.hostname,
      port: cvUrl.port || (isHttps ? 443 : 80),
      path: cvUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 15000,
    };

    const proxyReq = client.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => (data += chunk));
      proxyRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          return res.status(proxyRes.statusCode).json(parsed);
        } catch {
          return res.status(proxyRes.statusCode).send(data);
        }
      });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'The CV analysis service timed out.',
      });
    });

    proxyReq.on('error', (err) => {
      return res.status(502).json({
        error: 'Bad Gateway',
        message: `Could not connect to CV service: ${err.message}`,
      });
    });

    proxyReq.write(payload);
    proxyReq.end();
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
});

module.exports = router;
