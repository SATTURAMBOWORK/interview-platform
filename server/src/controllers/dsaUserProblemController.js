const Submission = require("../models/Submission");
const DsaProblem = require("../models/DsaProblem");






exports.getDsaTopics = async (req, res) => {
  try {
    const topics = await DsaProblem.distinct("tags");
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch topics" });
  }
};



/**
 * GET /api/dsa/user-problems
 * Returns all problems with solved flag
 */
exports.getUserDsaProblems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Solved problems
    const solvedProblemIds = await Submission.distinct("problemId", {
      userId,
      status: "Accepted",
    });

    // All problems
    const problems = await DsaProblem.find({}, "title difficulty");

    const result = problems.map((p) => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      solved: solvedProblemIds.some(
        (id) => id.toString() === p._id.toString()
      ),
    }));

    res.json(result);
  } catch (err) {
    console.error("DSA USER PROBLEMS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user problems" });
  }
};
