const express = require('express');
const Asana = require('../models/Asana');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/asanas
 * Returns all active asanas (public — no auth required).
 */
router.get('/', async (req, res) => {
  try {
    const asanas = await Asana.find({ isActive: true }).sort({ difficulty: 1 });
    res.json(asanas);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * GET /api/asanas/:id
 * Returns a single asana by slug id (e.g. "virabhadrasanaII").
 */
router.get('/:id', async (req, res) => {
  try {
    const asana = await Asana.findOne({ id: req.params.id, isActive: true });
    if (!asana) return res.status(404).json({ message: 'Asana not found.' });
    res.json(asana);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
