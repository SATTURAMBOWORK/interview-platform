const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DsaProblem",
      required: true,
    },
    language: {
      type: String,
      enum: ["cpp", "python", "javascript", "java"],
      default: "cpp",
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded"],
      required: true,
    },
    runtime: {
      type: Number,
      default: null,
    },
    memory: {
      type: Number,
      default: null,
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);