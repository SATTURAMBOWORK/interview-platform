const mongoose = require("mongoose");

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Leadership", "Teamwork", "Problem-Solving", "Communication", "Conflict Resolution", "Adaptability", "Customer Focus"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    description: {
      type: String,
      required: true,
    },
    tips: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BehavioralQuestion", behavioralQuestionSchema);
