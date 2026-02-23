const Submission = require("../models/Submission");
const DsaProblem = require("../models/DsaProblem");

exports.getDsaStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get solved problems by difficulty
    const stats = await Submission.aggregate([
      {
        $match: {
          userId,
          status: "Accepted",
        },
      },
      {
        $group: {
          _id: "$problemId", // distinct problems only
        },
      },
      {
        $lookup: {
          from: "dsaproblems",
          localField: "_id",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
      {
        $group: {
          _id: "$problem.difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total problems count by difficulty
    const totalProblems = await DsaProblem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          total: { $sum: 1 },
        },
      },
    ]);

    // Initialize result
    const result = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    };

    // Map solved counts
    stats.forEach((s) => {
      if (s._id === "Easy") result.easy.solved = s.count;
      if (s._id === "Medium") result.medium.solved = s.count;
      if (s._id === "Hard") result.hard.solved = s.count;
    });

    // Map total counts
    totalProblems.forEach((tp) => {
      if (tp._id === "Easy") result.easy.total = tp.total;
      if (tp._id === "Medium") result.medium.total = tp.total;
      if (tp._id === "Hard") result.hard.total = tp.total;
    });

    res.json({
      success: true,
      stats: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};