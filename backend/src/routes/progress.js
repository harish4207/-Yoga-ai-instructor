const express = require('express');
const Progress = require('../models/Progress');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

/**
 * GET /api/progress
 * Get all progress records for the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * GET /api/progress/:asanaId
 * Get progress for a specific asana, plus the last 30 session scores for the chart.
 */
router.get('/:asanaId', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      asanaId: req.params.asanaId,
    });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this asana yet.' });
    }

    // Fetch last 30 sessions for the chart data
    const sessions = await Session.find({
      userId: req.user._id,
      asanaId: req.params.asanaId,
    })
      .sort({ startedAt: 1 })
      .limit(30)
      .select('startedAt finalScore peakScore mode');

    const chartData = sessions.map((s) => ({
      date: s.startedAt,
      score: s.finalScore,
      peak: s.peakScore,
      mode: s.mode,
    }));

    res.json({ progress, chartData });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
