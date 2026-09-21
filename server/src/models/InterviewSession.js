const mongoose = require("mongoose");

const turnSchema = new mongoose.Schema(
  {
    topic: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    question: { type: String, required: true },
    answer: { type: String, default: null },

    // Knowledge-base concept the question grades against (null when LLM-chosen)
    conceptId: { type: String, default: null },
    concept: { type: String, default: "" },
    // kb: new concept from the knowledge base, probe: follow-up on the same
    // concept, free: chosen by the model
    kind: {
      type: String,
      enum: ["kb", "probe", "free"],
      default: "free",
    },

    // Hidden from the candidate until the interview is completed
    evaluation: {
      score: { type: Number, min: 0, max: 10 },
      covered: [{ type: String }],
      missed: [{ type: String }],
    },

    askedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date, default: null },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questionLimit: {
      type: Number,
      default: 10,
    },
    turns: {
      type: [turnSchema],
      default: [],
    },

    // Concept-mastery snapshot taken at start: concepts to skip (mastered or
    // seen recently) and weak concepts to revisit
    avoidConceptIds: { type: [String], default: [] },
    focusConceptIds: { type: [String], default: [] },

    // Guards against a double-submitted answer being processed twice
    processing: { type: Boolean, default: false },
    processingAt: { type: Date, default: null },

    finalReport: {
      overallScore: Number, // 0-100
      summary: String,
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      topicBreakdown: [
        {
          _id: false,
          topic: String,
          avgScore: Number, // 0-10
          questions: Number,
        },
      ],
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
