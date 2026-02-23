const mongoose = require("mongoose");

const starResponseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BehavioralQuestion",
      required: true,
    },
    response: {
      situation: {
        type: String,
        required: true,
      },
      task: {
        type: String,
        required: true,
      },
      action: {
        type: String,
        required: true,
      },
      result: {
        type: String,
        required: true,
      },
    },
    fullResponse: {
      type: String,
      required: true,
    },
    feedback: {
      clarity: {
        score: Number,
        comment: String,
      },
      impact: {
        score: Number,
        comment: String,
      },
      completeness: {
        score: Number,
        comment: String,
      },
      overallScore: Number,
      overallFeedback: String,
      improvements: [
        {
          type: String,
        },
      ],
      strengths: [
        {
          type: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StarResponse", starResponseSchema);
