const mongoose = require("mongoose");
const DsaProblem = require("../models/DsaProblem");

/* =========================================================
   ADMIN APIs
   ========================================================= */

/**
 * Create DSA problem
 */
exports.createDsaProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      constraints,
      sampleInput,
      sampleOutput,
      visibleTestCases,
      hiddenTestCases,
      acceptanceCriteria = "EXACT_MATCH", // NEW
      boilerplateCode = "", // NEW
    } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({
        message: "Title, description, and difficulty are required",
      });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map(t => t.toLowerCase())
      : typeof tags === "string" && tags.trim()
      ? [tags.toLowerCase()]
      : [];

    if (normalizedTags.length === 0) {
      return res.status(400).json({
        message: "At least one tag is required",
      });
    }

    // Validate test cases format
    const validateTestCases = (testCases) => {
      if (!testCases) return [];
      return testCases.map(tc => ({
        input: tc.input,
        expectedOutput: Array.isArray(tc.expectedOutput) 
          ? tc.expectedOutput 
          : [tc.expectedOutput], // Convert to array if not already
        explanation: tc.explanation || ""
      }));
    };

    const problem = await DsaProblem.create({
      title,
      description,
      difficulty,
      tags: normalizedTags,
      constraints,
      sampleInput,
      sampleOutput,
      boilerplateCode,
      acceptanceCriteria,
      visibleTestCases: validateTestCases(visibleTestCases),
      hiddenTestCases: validateTestCases(hiddenTestCases),
      createdBy: req.user._id,
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error("CREATE DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to create DSA problem",
    });
  }
};

/**
 * Bulk upload DSA problems
 */
exports.bulkUploadDsaProblems = async (req, res) => {
  try {
    const { problems } = req.body;

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        message: "Problems must be a non-empty array",
      });
    }

    const validateTestCases = (testCases) => {
      if (!testCases) return [];
      return testCases.map(tc => ({
        input: tc.input,
        expectedOutput: Array.isArray(tc.expectedOutput) 
          ? tc.expectedOutput 
          : [tc.expectedOutput],
        explanation: tc.explanation || ""
      }));
    };

    // Validate and prepare all problems
    const problemsToCreate = [];
    const errors = [];

    for (let i = 0; i < problems.length; i++) {
      const p = problems[i];
      
      try {
        // Validate required fields
        if (!p.title || !p.description || !p.difficulty) {
          throw new Error("Missing required fields: title, description, difficulty");
        }

        if (!p.functionSignature) {
          throw new Error("Missing required field: functionSignature");
        }

        if (!p.boilerplateCode) {
          throw new Error("Missing required field: boilerplateCode");
        }

        if (!p.visibleTestCases || !Array.isArray(p.visibleTestCases)) {
          throw new Error("Missing or invalid visibleTestCases");
        }

        if (!p.hiddenTestCases || !Array.isArray(p.hiddenTestCases)) {
          throw new Error("Missing or invalid hiddenTestCases");
        }

        // Normalize tags
        const normalizedTags = Array.isArray(p.tags)
          ? p.tags.map(t => typeof t === 'string' ? t.toLowerCase() : t)
          : typeof p.tags === 'string' && p.tags.trim()
          ? [p.tags.toLowerCase()]
          : [];

        // Create problem object
        const problemObj = {
          title: p.title.trim(),
          description: p.description.trim(),
          difficulty: p.difficulty,
          tags: normalizedTags,
          constraints: p.constraints || "",
          sampleInput: p.sampleInput || "",
          sampleOutput: p.sampleOutput || "",
          functionSignature: p.functionSignature || "",
          boilerplateCode: p.boilerplateCode || "",
          acceptanceCriteria: p.acceptanceCriteria || "EXACT_MATCH",
          visibleTestCases: validateTestCases(p.visibleTestCases),
          hiddenTestCases: validateTestCases(p.hiddenTestCases),
          createdBy: req.user._id,
        };

        problemsToCreate.push(problemObj);
      } catch (error) {
        errors.push({
          index: i,
          title: p.title,
          error: error.message,
        });
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed for some problems",
        errors,
      });
    }

    // Insert all problems
    const createdProblems = await DsaProblem.insertMany(problemsToCreate);

    res.status(201).json({
      message: `Successfully created ${createdProblems.length} DSA problems`,
      count: createdProblems.length,
      problems: createdProblems,
    });
  } catch (error) {
    console.error("BULK UPLOAD DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to bulk upload DSA problems",
      error: error.message,
    });
  }
};

/**
 * Get all DSA problems (admin)
 */
exports.getAllDsaProblems = async (req, res) => {
  try {
    const problems = await DsaProblem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    console.error("GET ALL DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch DSA problems",
    });
  }
};

/**
 * Get single DSA problem by ID (ADMIN)
 * Shows all test cases and acceptance criteria
 */
exports.getDsaProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid problem id",
      });
    }

    const problem = await DsaProblem.findById(id);

    if (!problem) {
      return res.status(404).json({
        message: "DSA problem not found",
      });
    }

    res.json(problem);
  } catch (error) {
    console.error("GET DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch DSA problem",
    });
  }
};

/**
 * Update DSA problem
 */
exports.updateDsaProblem = async (req, res) => {
  try {
    if (req.body.tags) {
      req.body.tags = Array.isArray(req.body.tags)
        ? req.body.tags.map(t => t.toLowerCase())
        : [req.body.tags.toLowerCase()];
    }

    // Validate test cases if updating
    if (req.body.visibleTestCases) {
      req.body.visibleTestCases = req.body.visibleTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: Array.isArray(tc.expectedOutput) 
          ? tc.expectedOutput 
          : [tc.expectedOutput],
        explanation: tc.explanation || ""
      }));
    }

    if (req.body.hiddenTestCases) {
      req.body.hiddenTestCases = req.body.hiddenTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: Array.isArray(tc.expectedOutput) 
          ? tc.expectedOutput 
          : [tc.expectedOutput],
        explanation: tc.explanation || ""
      }));
    }

    const updated = await DsaProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "DSA problem not found",
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to update DSA problem",
    });
  }
};

/**
 * Delete DSA problem
 */
exports.deleteDsaProblem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid problem id",
      });
    }

    const problem = await DsaProblem.findById(id);

    if (!problem) {
      return res.status(404).json({
        message: "DSA problem not found",
      });
    }

    await problem.deleteOne();
    res.json({
      message: "DSA problem deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DSA ERROR:", error);
    res.status(500).json({
      message: "Failed to delete DSA problem",
    });
  }
};

/* =========================================================
   USER APIs
   ========================================================= */

/**
 * GET /api/dsa/topics
 */
exports.getDsaTopics = async (req, res) => {
  try {
    const problems = await DsaProblem.find({}, { tags: 1 }).lean();

    const topicSet = new Set();
    problems.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => topicSet.add(tag.toLowerCase()));
      }
    });

    res.status(200).json({
      success: true,
      topics: Array.from(topicSet),
    });
  } catch (error) {
    console.error("GET DSA TOPICS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch DSA topics",
    });
  }
};

/**
 * GET /api/dsa/problems/:topic
 */
exports.getProblemsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic.toLowerCase();

    const problems = await DsaProblem.find({
      tags: topic,
    })
      .select("-hiddenTestCases") // Don't send hidden test cases to frontend
      .lean();

    // Add acceptance rate to each problem
    const problemsWithAcceptance = problems.map(problem => {
      const submissions = problem.submissions || 0;
      const acceptedSubmissions = problem.acceptedSubmissions || 0;
      
      const acceptanceRate = submissions > 0 
        ? Math.round((acceptedSubmissions / submissions) * 100)
        : 0;

      return {
        ...problem,
        acceptanceRate,
        submissions,
        acceptedSubmissions
      };
    });

    res.status(200).json({
      success: true,
      problems: problemsWithAcceptance,
    });
  } catch (error) {
    console.error("GET PROBLEMS BY TOPIC ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
    });
  }
};

/**
 * Get single DSA problem (USER)
 * GET /api/dsa/problem/:id
 * Shows boilerplate code and visible test cases only
 */
exports.getDsaProblemForUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid problem id",
      });
    }

    const problem = await DsaProblem.findById(id)
      .select(
        "title description difficulty constraints sampleInput sampleOutput boilerplateCode acceptanceCriteria visibleTestCases"
      )
      .lean();

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error("GET DSA USER PROBLEM ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch problem",
    });
  }
};