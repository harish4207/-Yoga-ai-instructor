const mongoose = require('mongoose');

// A single coaching snapshot captured during a live or photo session
const snapshotSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100 },
    strengths: { type: [String], default: [] }, // rule IDs where user scored well
    topCorrection: { type: String, default: '' }, // template key of most important correction
    allDeviations: [
      {
        ruleId: String,
        deviation: Number, // degrees off target
        direction: { type: String, enum: ['too_high', 'too_low'] },
      },
    ],
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
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
      index: true,
    },
    mode: {
      type: String,
      enum: ['live', 'photo'],
      required: true,
    },
    language: { type: String, default: 'en' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    snapshots: { type: [snapshotSchema], default: [] },
    finalScore: { type: Number, min: 0, max: 100 },
    peakScore: { type: Number, min: 0, max: 100 },
    // improvement = finalScore - snapshots[0].score (computed before save)
    improvement: { type: Number, default: 0 },
    // only for photo mode
    photoUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Auto-compute finalScore, peakScore, improvement before saving
sessionSchema.pre('save', function () {
  if (this.snapshots && this.snapshots.length > 0) {
    const scores = this.snapshots.map((s) => s.score).filter((s) => s != null);
    if (scores.length > 0) {
      this.finalScore = scores[scores.length - 1];
      this.peakScore = Math.max(...scores);
      this.improvement = this.finalScore - scores[0];
    }
  }
});

module.exports = mongoose.model('Session', sessionSchema);
