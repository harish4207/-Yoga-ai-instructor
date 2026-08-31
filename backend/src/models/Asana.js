const mongoose = require('mongoose');

const asanaSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      // slug identifier: e.g. "virabhadrasanaII"
    },
    nameEnglish: { type: String, required: true },
    nameSanskrit: { type: String, required: true },
    nameHindi: { type: String, default: '' },
    nameTamil: { type: String, default: '' },
    nameTelugu: { type: String, default: '' },
    description: { type: String, default: '' },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    // "front" | "side" | "45-degree"
    cameraOrientation: { type: String, required: true },
    // "standing" | "floor-level"
    cameraHeight: { type: String, default: 'standing' },
    cameraGuideText: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' },
    referenceVideoUrl: { type: String, default: '' },
    safetyNotes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asana', asanaSchema);
