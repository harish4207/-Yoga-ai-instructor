const mongoose = require('mongoose');

/**
 * Progress is a CACHED summary document per user+asana pair.
 * It is upserted after every session is saved, so queries are O(1).
 */
const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    asanaId: {
      type: String,
      required: true,
    },
    firstSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    firstSessionDate: { type: Date },
    firstSessionScore: { type: Number },
    latestSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    latestSessionDate: { type: Date },
    latestSessionScore: { type: Number },
    peakScore: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    // rule IDs flagged most often as deviations across all sessions
    repeatedProblems: { type: [String], default: [] },
    // rule IDs consistently scored well across all sessions
    strengthAreas: { type: [String], default: [] },
    // ((latestScore - firstScore) / firstScore) * 100
    improvementPercentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one progress doc per user+asana
progressSchema.index({ userId: 1, asanaId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
