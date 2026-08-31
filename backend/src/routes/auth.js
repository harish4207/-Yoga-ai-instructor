const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper: generate a JWT
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/register
 * Body: { email, password, displayName, preferredLanguage? }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, preferredLanguage } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'email, password, and displayName are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      email,
      passwordHash: password, // pre-save hook will hash this
      displayName,
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    // Explicitly select passwordHash (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update lastActiveAt
    user.lastActiveAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      preferredLanguage: req.user.preferredLanguage,
    },
  });
});

/**
 * PATCH /api/auth/language
 * Update preferred language.
 * Body: { preferredLanguage: 'hi' | 'ta' | 'te' | 'en' | ... }
 */
router.patch('/language', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { preferredLanguage } = req.body;
    if (!preferredLanguage) {
      return res.status(400).json({ message: 'preferredLanguage is required.' });
    }
    req.user.preferredLanguage = preferredLanguage;
    await req.user.save();
    res.json({ preferredLanguage: req.user.preferredLanguage });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
