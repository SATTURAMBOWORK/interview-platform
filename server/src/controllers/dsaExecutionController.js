const DsaProblem = require("../models/DsaProblem");
const Submission = require("../models/Submission");
const { runCppWithTestCases } = require("../services/cppRunner");

/**
 * Utility: detect empty or untouched template code
 */
const isCodeInvalid = (code) => {
  if (!code) return true;

  const normalized = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  const template =
    "#include<bits/stdc++.h>usingnamespacestd;intmain(){return0;}";

  return normalized.length < 30 || normalized === template;
};

/**
 * Utility: Check if output matches expected (handles multiple valid outputs)
 */
const isOutputCorrect = (actual, expected, acceptanceCriteria) => {
  const normalizeOutput = (str) => {
    return str.trim().replace(/\s+/g, " ");
  };

  const actualNormalized = normalizeOutput(actual);

  // expected is an array of valid outputs
  for (let expectedOutput of expected) {
    const expectedNormalized = normalizeOutput(expectedOutput);

    if (acceptanceCriteria === "EXACT_MATCH") {
      if (actualNormalized === expectedNormalized) return true;
    }

    if (acceptanceCriteria === "SET_MATCH") {
      try {
        const actualArr = JSON.parse(actualNormalized);
        const expectedArr = JSON.parse(expectedNormalized);

        if (Array.isArray(actualArr) && Array.isArray(expectedArr)) {
          if (actualArr.length !== expectedArr.length) continue;

          const actualSorted = JSON.stringify([...actualArr].sort());
          const expectedSorted = JSON.stringify([...expectedArr].sort());

          if (actualSorted === expectedSorted) return true;
        }
      } catch (err) {
        // Not arrays, try exact match
        if (actualNormalized === expectedNormalized) return true;
      }
    }

    if (acceptanceCriteria === "SORTED_MATCH") {
      try {
        const actualArr = JSON.parse(actualNormalized);
        const expectedArr = JSON.parse(expectedNormalized);

        if (Array.isArray(actualArr) && Array.isArray(expectedArr)) {
          if (JSON.stringify(actualArr.sort()) === JSON.stringify(expectedArr.sort())) {
            return true;
          }
        }
      } catch (err) {
        if (actualNormalized === expectedNormalized) return true;
      }
    }

    if (acceptanceCriteria === "CUSTOM") {
      if (actualNormalized === expectedNormalized) return true;
    }
  }

  return false;
};

/**
 * GET SOLVED PROBLEMS (NEW)
 * Returns all problemIds where user has at least one Accepted submission
 */
exports.getSolvedProblems = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissions = await Submission.find({ userId }).select("problemId status");

    const solvedSet = new Set();
    const submittedSet = new Set();
    // per-problem counts for THIS user
    const perProblem = {};

    const isAcceptedStatus = (status) =>
      String(status || "").trim().toLowerCase() === "accepted";

    submissions.forEach((sub) => {
      const pid = sub.problemId.toString();
      submittedSet.add(pid);
      if (isAcceptedStatus(sub.status)) solvedSet.add(pid);

      if (!perProblem[pid]) perProblem[pid] = { total: 0, accepted: 0 };
      perProblem[pid].total += 1;
      if (isAcceptedStatus(sub.status)) perProblem[pid].accepted += 1;
    });

    const attemptedSet = new Set(
      Array.from(submittedSet).filter((pid) => !solvedSet.has(pid))
    );

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter((sub) => isAcceptedStatus(sub.status)).length;

    res.status(200).json({
      success: true,
      solvedProblemIds: Array.from(solvedSet),
      attemptedProblemIds: Array.from(attemptedSet),
      totalSubmissions,
      acceptedSubmissions,
      // per-problem stats keyed by problemId string
      perProblemStats: perProblem,
    });
  } catch (error) {
    console.error("FETCH SOLVED ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem states",
    });
  }
};

/**
 * RUN CODE (VISIBLE TEST CASES ONLY)
 */
exports.runCode = async (req, res) => {
  try {
    const { problemId, code } = req.body;

    if (isCodeInvalid(code)) {
      return res.json({
        success: false,
        message: "Please write valid code before running.",
      });
    }

    const problem = await DsaProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    // Convert expectedOutput array to string for cppRunner (use first element)
    const testCases = problem.visibleTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: Array.isArray(tc.expectedOutput) 
        ? tc.expectedOutput[0] 
        : tc.expectedOutput, // Store original array for validation
      expectedOutputArray: tc.expectedOutput, // Keep array for multi-output validation
    }));

    const execResult = await runCppWithTestCases(code, testCases);

    if (!execResult.success) {
      return res.json({
        success: false,
        error: execResult.error,
      });
    }

    // Check results with acceptance criteria
    const results = execResult.results.map((result, index) => {
      const testCase = problem.visibleTestCases[index];
      // Use the expectedOutputArray for proper multi-output validation
      const passed = isOutputCorrect(
        result.output,
        testCase.expectedOutput, // This is the array
        problem.acceptanceCriteria
      );

      return {
        ...result,
        passed, // Override with our multi-output logic
        testCaseNumber: index + 1,
      };
    });

    const allPassed = results.every(r => r.passed);

    res.json({
      success: true,
      allPassed,
      passedCount: results.filter(r => r.passed).length,
      totalCount: results.length,
      results,
    });
  } catch (err) {
    console.error("RUN ERROR:", err);
    res.status(500).json({ success: false, message: "Run failed" });
  }
};

/**
 * SUBMIT CODE (VISIBLE + HIDDEN TEST CASES)
 */
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code } = req.body;
    const userId = req.user._id;

    if (isCodeInvalid(code)) {
      return res.json({
        success: false,
        status: "Invalid Submission",
        message: "Please write valid code before submitting.",
      });
    }

    const problem = await DsaProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const allTestCases = [
      ...problem.visibleTestCases,
      ...problem.hiddenTestCases,
    ].map(tc => ({
      input: tc.input,
      expectedOutput: Array.isArray(tc.expectedOutput) 
        ? tc.expectedOutput[0] 
        : tc.expectedOutput,
      expectedOutputArray: tc.expectedOutput, // Keep for validation
    }));

    const execResult = await runCppWithTestCases(code, allTestCases);

    // Compilation error
    if (!execResult.success) {
      await Submission.create({
        userId,
        problemId,
        code,
        status: "Compilation Error",
        passedTestCases: 0,
        totalTestCases: allTestCases.length,
      });

      return res.json({
        success: false,
        status: "Compilation Error",
        error: execResult.error,
      });
    }

    // Check each test case with multi-output logic
    let passedCount = 0;
    let failedIndex = -1;

    for (let i = 0; i < execResult.results.length; i++) {
      const result = execResult.results[i];
      const testCase = i < problem.visibleTestCases.length 
        ? problem.visibleTestCases[i]
        : problem.hiddenTestCases[i - problem.visibleTestCases.length];

      const passed = isOutputCorrect(
        result.output,
        testCase.expectedOutput, // Use the original array from problem
        problem.acceptanceCriteria
      );

      if (passed) {
        passedCount++;
      } else if (failedIndex === -1) {
        failedIndex = i;
      }
    }

    // Wrong answer
    if (failedIndex !== -1) {
      const failed = execResult.results[failedIndex];
      const testCase = allTestCases[failedIndex];
      const isHidden = failedIndex >= problem.visibleTestCases.length;

      await Submission.create({
        userId,
        problemId,
        code,
        status: "Wrong Answer",
        passedTestCases: passedCount,
        totalTestCases: allTestCases.length,
      });

      // Update problem submission count
      await DsaProblem.findByIdAndUpdate(problemId, {
        $inc: { submissions: 1 }
      });

      // Don't reveal hidden test case details
      const response = {
        success: false,
        status: "Wrong Answer",
        failedTest: failedIndex + 1,
        passedTestCases: passedCount,
        totalTestCases: allTestCases.length,
      };

      if (!isHidden) {
        response.testCase = {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput[0], // Show first valid output
          output: failed.output,
        };
      } else {
        response.message = "Failed on a hidden test case";
      }

      return res.json(response);
    }

    // Accepted
    await Submission.create({
      userId,
      problemId,
      code,
      status: "Accepted",
      passedTestCases: passedCount,
      totalTestCases: allTestCases.length,
    });

    // Update problem stats (both submissions and acceptedSubmissions)
    await DsaProblem.findByIdAndUpdate(problemId, {
      $inc: { submissions: 1, acceptedSubmissions: 1 }
    });

    res.json({
      success: true,
      status: "Accepted",
      passedTestCases: passedCount,
      totalTestCases: allTestCases.length,
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
};

/**
 * Get user submissions
 */
exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.query;

    let filter = { userId };
    if (problemId) filter.problemId = problemId;

    const submissions = await Submission.find(filter)
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("GET SUBMISSIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
};

/**
 * Get user DSA statistics
 */
exports.getUserDSAStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissions = await Submission.find({ userId });

    const acceptedCount = submissions.filter(s => s.status === "Accepted").length;
    const uniqueProblems = new Set(submissions.map(s => s.problemId.toString()));

    const statsByDifficulty = await Submission.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "dsaproblems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem"
        }
      },
      { $unwind: "$problem" },
      {
        $group: {
          _id: "$problem.difficulty",
          solved: {
            $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedCount,
        uniqueProblems: uniqueProblems.size,
        acceptanceRate: ((acceptedCount / submissions.length) * 100).toFixed(2) || 0,
        statsByDifficulty,
      },
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};