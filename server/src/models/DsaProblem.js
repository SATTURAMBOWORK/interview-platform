const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: [String], // Array to support multiple valid outputs
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
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

    slug: {
      type: String,
      unique: true,
      lowercase: true,
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

    // Boilerplate code template (per language)
    boilerplateCode: {
      type: Map,
      of: String,
      default: {},
      // Example: { "javascript": "function twoSum(nums, target) {...}", "python": "def two_sum(nums, target):..." }
    },

    // Function signature/template (per language)
    functionSignature: {
      type: Map,
      of: String,
      default: {},
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

// ───────────────────────────────────────────────
// Indexes for query performance
// ───────────────────────────────────────────────
dsaProblemSchema.index({ difficulty: 1 });
dsaProblemSchema.index({ tags: 1 });
dsaProblemSchema.index({ createdBy: 1 });
dsaProblemSchema.index({ slug: 1 });
dsaProblemSchema.index({ title: "text", description: "text" }); // Full-text search

// ──────────��────────────────────────────────────
// Auto-generate slug from title
// ───────────────────────────────────────────────
dsaProblemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ───────────────────────────────────────────────
// Virtual: Acceptance Rate
// ───────────────────────────────────────────────
dsaProblemSchema.virtual("acceptanceRate").get(function () {
  if (this.submissions === 0) return 0;
  return parseFloat(((this.acceptedSubmissions / this.submissions) * 100).toFixed(2));
});

// ───────────────────────────────────────────────
// JSON/Object serialization settings
// ───────────────────────────────────────────────
dsaProblemSchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret) {
    delete ret.hiddenTestCases; // Never expose hidden test cases to the client
    delete ret.__v;
    return ret;
  },
});

dsaProblemSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("DsaProblem", dsaProblemSchema);