const express = require('express');
const Session = require('../models/Session');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All session routes require authentication
router.use(protect);

/**
 * POST /api/sessions
 * Save a completed session.
 * Body: { asanaId, mode, language, startedAt, endedAt, durationSeconds, snapshots, photoUrl? }
 */
router.post('/', async (req, res) => {
  try {
    const { asanaId, mode, language, startedAt, endedAt, durationSeconds, snapshots, photoUrl } =
      req.body;

    if (!asanaId || !mode) {
      return res.status(400).json({ message: 'asanaId and mode are required.' });
    }

    const session = await Session.create({
      userId: req.user._id,
      asanaId,
      mode,
      language: language || 'en',
      startedAt: startedAt || new Date(),
      endedAt: endedAt || new Date(),
      durationSeconds: durationSeconds || 0,
      snapshots: snapshots || [],
      photoUrl: photoUrl || '',
    });

    // Upsert progress cache for this user+asana
    await upsertProgress(req.user._id, asanaId, session);

    res.status(201).json(session);
  } catch (err) {
    console.error('Save session error:', err);
    res.status(500).json({ message: 'Server error saving session.' });
  }
});

/**
 * GET /api/sessions?asanaId=virabhadrasanaII&limit=20
 * Get the authenticated user's sessions (optionally filtered by asana).
 */
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.asanaId) filter.asanaId = req.query.asanaId;

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const sessions = await Session.find(filter).sort({ startedAt: -1 }).limit(limit);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * GET /api/sessions/:id
 * Get a single session by ID (must belong to the authenticated user).
 */
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * Helper: upsert the Progress cache doc after a new session is saved.
 */
async function upsertProgress(userId, asanaId, session) {
  const existing = await Progress.findOne({ userId, asanaId });

  const finalScore = session.finalScore ?? 0;
  const peakScore = session.peakScore ?? 0;

  if (!existing) {
    await Progress.create({
      userId,
      asanaId,
      firstSessionId: session._id,
      firstSessionDate: session.startedAt,
      firstSessionScore: finalScore,
      latestSessionId: session._id,
      latestSessionDate: session.startedAt,
      latestSessionScore: finalScore,
      peakScore,
      totalSessions: 1,
      averageScore: finalScore,
      improvementPercentage: 0,
    });
    return;
  }

  // Update existing progress
  const totalSessions = existing.totalSessions + 1;
  const averageScore =
    (existing.averageScore * existing.totalSessions + finalScore) / totalSessions;
  const newPeak = Math.max(existing.peakScore, peakScore);
  const firstScore = existing.firstSessionScore ?? finalScore;
  const improvementPercentage =
    firstScore > 0 ? ((finalScore - firstScore) / firstScore) * 100 : 0;

  await Progress.findOneAndUpdate(
    { userId, asanaId },
    {
      latestSessionId: session._id,
      latestSessionDate: session.startedAt,
      latestSessionScore: finalScore,
      peakScore: newPeak,
      totalSessions,
      averageScore: Math.round(averageScore * 10) / 10,
      improvementPercentage: Math.round(improvementPercentage * 10) / 10,
    }
  );
}

module.exports = router;
