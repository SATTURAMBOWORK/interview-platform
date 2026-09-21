const mongoose = require("mongoose");

// How well a user knows one knowledge-base concept, across all their interviews
const conceptMasterySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    conceptId: { type: String, required: true },
    concept: { type: String, default: "" },
    topic: { type: String, default: "" },

    attempts: { type: Number, default: 0 },
    lastScore: { type: Number, min: 0, max: 10 },
    // Exponential moving average of scores (0-10), so recent answers count most
    level: { type: Number, min: 0, max: 10 },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

conceptMasterySchema.index({ user: 1, subject: 1, conceptId: 1 }, { unique: true });

module.exports = mongoose.model("ConceptMastery", conceptMasterySchema);
