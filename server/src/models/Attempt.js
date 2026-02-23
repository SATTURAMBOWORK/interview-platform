const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
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

    answers: [
      {
        mcq: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Mcq",
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
        correctOption: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],

    totalQuestions: {
      type: Number,
      required: true,
    },

    correctCount: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number, // percentage
      required: true,
    },

    timeTaken: {
      type: Number, // seconds
      required: true,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
