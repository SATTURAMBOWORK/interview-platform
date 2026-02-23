const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: [String], // Changed to array to support multiple valid outputs
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    }
  },
  { _id: false }
);

const dsaProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    constraints: {
      type: String,
      default: "",
    },

    sampleInput: {
      type: String,
      default: "",
    },

    sampleOutput: {
      type: String,
      default: "",
    },

    // Boilerplate code template
    boilerplateCode: {
      type: String,
      default: "",
    },

    // Function signature/template
    functionSignature: {
      type: String,
      default: "",
    },

    // 🔥 VISIBLE TEST CASES (shown to user during run)
    visibleTestCases: {
      type: [testCaseSchema],
      default: [],
    },

    // 🔒 HIDDEN TEST CASES (only checked during submission)
    hiddenTestCases: {
      type: [testCaseSchema],
      default: [],
    },

    // Acceptance criteria type
    acceptanceCriteria: {
      type: String,
      enum: ["EXACT_MATCH", "SET_MATCH", "SORTED_MATCH", "CUSTOM"],
      default: "EXACT_MATCH",
      description: "How to compare outputs: EXACT_MATCH (exact), SET_MATCH (any order), SORTED_MATCH (after sorting), CUSTOM (custom logic)"
    },

    // For problems with multiple valid outputs
    allowMultipleOutputs: {
      type: Boolean,
      default: false,
    },

    likes: {
      type: Number,
      default: 0,
    },

    submissions: {
      type: Number,
      default: 0,
    },

    acceptedSubmissions: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DsaProblem", dsaProblemSchema);