const User = require("../models/User");
const Subject = require("../models/Subject");
const Mcq = require("../models/Mcq");
const Attempt = require("../models/Attempt");
const DsaProblem = require("../models/DsaProblem");

/**
 * ADMIN: Platform summary analytics
 */
const getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalMcqs = await Mcq.countDocuments();
    const totalDsaProblems = await DsaProblem.countDocuments();
    const totalAttempts = await Attempt.countDocuments();

    // Calculate average score from all attempts
    const scoreData = await Attempt.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
        },
      },
    ]);

    const averageScore = scoreData.length > 0 ? parseFloat(scoreData[0].averageScore.toFixed(2)) : 0;

    res.status(200).json({
      totalUsers,
      totalSubjects,
      totalMcqs,
      totalDsaProblems,
      totalAttempts,
      averageScore,
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch admin analytics",
    });
  }
};

/**
 * Get detailed user analytics
 */
const getUserAnalytics = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Active users (users with at least one attempt)
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "user",
          as: "attempts",
        },
      },
      {
        $match: {
          "attempts.0": { $exists: true },
        },
      },
      {
        $count: "count",
      },
    ]);

    const activeCount = activeUsers.length > 0 ? activeUsers[0].count : 0;

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // New users this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Attempts per user (average)
    const attemptsPerUser = await User.aggregate([
      {
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "user",
          as: "attempts",
        },
      },
      {
        $group: {
          _id: null,
          avgAttempts: { $avg: { $size: "$attempts" } },
        },
      },
    ]);

    const avgAttemptsPerUser = attemptsPerUser.length > 0 ? parseFloat(attemptsPerUser[0].avgAttempts.toFixed(2)) : 0;

    res.status(200).json({
      totalUsers,
      activeUsers: activeCount,
      userEngagementRate: totalUsers > 0 ? parseFloat(((activeCount / totalUsers) * 100).toFixed(2)) : 0,
      usersByRole: usersByRole.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      newUsersThisWeek,
      avgAttemptsPerUser,
    });
  } catch (error) {
    console.error("USER ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user analytics" });
  }
};

/**
 * Get subject and MCQ performance analytics
 */
const getContentAnalytics = async (req, res) => {
  try {
    // Subject-wise MCQ count
    const subjectWiseMcqs = await Subject.aggregate([
      {
        $lookup: {
          from: "mcqs",
          localField: "_id",
          foreignField: "subject",
          as: "mcqs",
        },
      },
      {
        $project: {
          name: 1,
          mcqCount: { $size: "$mcqs" },
        },
      },
      {
        $sort: { mcqCount: -1 },
      },
    ]);

    // Subject-wise average scores
    const subjectWiseScores = await Attempt.aggregate([
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectData",
        },
      },
      {
        $unwind: "$subjectData",
      },
      {
        $group: {
          _id: "$subjectData.name",
          avgScore: { $avg: "$score" },
          attemptCount: { $sum: 1 },
        },
      },
      {
        $sort: { attemptCount: -1 },
      },
    ]);

    // Difficulty-wise performance
    const difficultyPerformance = await Attempt.aggregate([
      {
        $lookup: {
          from: "mcqs",
          localField: "answers.mcq",
          foreignField: "_id",
          as: "mcqData",
        },
      },
      {
        $unwind: "$mcqData",
      },
      {
        $group: {
          _id: "$mcqData.difficulty",
          avgScore: { $avg: "$score" },
          totalAttempts: { $sum: 1 },
        },
      },
    ]);

    // MCQs with lowest success rate
    const mcqSuccessRates = await Mcq.aggregate([
      {
        $lookup: {
          from: "attempts",
          let: { mcqId: "$_id" },
          pipeline: [
            {
              $unwind: "$answers",
            },
            {
              $match: {
                $expr: { $eq: ["$answers.mcq", "$$mcqId"] },
              },
            },
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                correctAnswers: {
                  $sum: { $cond: ["$answers.isCorrect", 1, 0] },
                },
              },
            },
          ],
          as: "performance",
        },
      },
      {
        $unwind: {
          path: "$performance",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          question: { $substr: ["$question", 0, 50] },
          successRate: {
            $cond: [
              { $eq: ["$performance.totalAttempts", null] },
              0,
              {
                $multiply: [
                  { $divide: ["$performance.correctAnswers", "$performance.totalAttempts"] },
                  100,
                ],
              },
            ],
          },
          attempts: { $ifNull: ["$performance.totalAttempts", 0] },
        },
      },
      {
        $sort: { successRate: 1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      subjectWiseMcqs,
      subjectWiseScores,
      difficultyPerformance,
      lowestPerformingMcqs: mcqSuccessRates,
    });
  } catch (error) {
    console.error("CONTENT ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch content analytics" });
  }
};

/**
 * Get attempt and activity analytics
 */
const getActivityAnalytics = async (req, res) => {
  try {
    // Attempts over the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attemptsLast30Days = await Attempt.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Peak activity hour (from attempts)
    const peakActivityHour = await Attempt.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // Daily average score trend
    const dailyScoreTrend = await Attempt.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Top performing users
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "user",
          as: "attempts",
        },
      },
      {
        $unwind: "$attempts",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          avgScore: { $avg: "$attempts.score" },
          attemptCount: { $sum: 1 },
        },
      },
      {
        $match: { attemptCount: { $gte: 2 } },
      },
      {
        $sort: { avgScore: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      attemptsLast30Days,
      peakActivityHour: peakActivityHour.length > 0 ? peakActivityHour[0]._id : null,
      dailyScoreTrend,
      topPerformingUsers: topUsers,
    });
  } catch (error) {
    console.error("ACTIVITY ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch activity analytics" });
  }
};

/**
 * Get DSA-specific analytics
 */
const getDsaAnalytics = async (req, res) => {
  try {
    // Total DSA problems by difficulty
    const dsaByDifficulty = await DsaProblem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    // DSA problems by topic/tags
    const dsaByTopic = await DsaProblem.aggregate([
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Most attempted DSA problems (from DsaProblem submissions if available)
    const mostAttemptedDsa = await DsaProblem.find()
      .select("title difficulty tags")
      .limit(10)
      .lean();

    res.status(200).json({
      totalDsaProblems: await DsaProblem.countDocuments(),
      dsaByDifficulty,
      dsaByTopic,
      recentDsaProblems: mostAttemptedDsa,
    });
  } catch (error) {
    console.error("DSA ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch DSA analytics" });
  }
};

module.exports = {
  getAdminSummary,
  getUserAnalytics,
  getContentAnalytics,
  getActivityAnalytics,
  getDsaAnalytics,
};
