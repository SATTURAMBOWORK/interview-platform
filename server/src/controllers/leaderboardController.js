const User = require("../models/User");
const Attempt = require("../models/Attempt");
const Submission = require("../models/Submission");
const StarResponse = require("../models/StarResponse");
const DsaProblem = require("../models/DsaProblem");

/* ── Same XP / Level formula as Dashboard.jsx + UserNavbar.jsx ── */
const computeLevel = (totalXP) =>
  Math.min(Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2), 100) || 1;

const computeStreak = (dates /* array of JS Date */) => {
  const dateKeys = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateKeys.has(d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }
  return streak;
};

/**
 * GET /api/leaderboard
 * Ranks all users by Level (same XP formula used on Dashboard & UserNavbar).
 * XP breakdown:
 *   MCQ XP    = high-accuracy attempts (score ≥ 40) × 100
 *   Streak XP = consecutive-day streak × 25
 *   DSA XP    = Easy × 75 + Medium × 150 + Hard × 300
 *   STAR XP   = per response: score ≥ 80 → 75 XP, score ≥ 60 → 40 XP
 */
exports.getLeaderboard = async (req, res) => {
  try {
    // 1. All non-admin users
    const users = await User.find({ role: "user" }).select("_id name username").lean();
    const userIds = users.map((u) => u._id);

    // 2. MCQ attempts per user (score + date for streak)
    const attempts = await Attempt.find({ user: { $in: userIds } })
      .select("user score createdAt status")
      .lean();

    const mcqByUser = {};
    attempts.forEach((a) => {
      const id = String(a.user);
      if (!mcqByUser[id]) mcqByUser[id] = { highAccuracy: 0, dates: [] };
      if (a.status !== "in-progress" && a.score >= 40) mcqByUser[id].highAccuracy++;
      if (a.createdAt) mcqByUser[id].dates.push(new Date(a.createdAt));
    });

    // 3. DSA solved problems by difficulty per user
    const dsaAgg = await Submission.aggregate([
      { $match: { userId: { $in: userIds }, status: "Accepted" } },
      { $group: { _id: { userId: "$userId", problemId: "$problemId" } } }, // distinct
      {
        $lookup: {
          from: "dsaproblems",
          localField: "_id.problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { userId: "$_id.userId", difficulty: "$problem.difficulty" },
          count: { $sum: 1 },
        },
      },
    ]);

    const dsaByUser = {};
    dsaAgg.forEach(({ _id: { userId, difficulty }, count }) => {
      const id = String(userId);
      if (!dsaByUser[id]) dsaByUser[id] = { Easy: 0, Medium: 0, Hard: 0 };
      if (difficulty) dsaByUser[id][difficulty] = (dsaByUser[id][difficulty] || 0) + count;
    });

    // 4. STAR responses per user
    const starResponses = await StarResponse.find({ user: { $in: userIds } })
      .select("user feedback.overallScore")
      .lean();

    const starByUser = {};
    starResponses.forEach((r) => {
      const id = String(r.user);
      if (!starByUser[id]) starByUser[id] = { xp: 0, count: 0 };
      const score = Number(r.feedback?.overallScore) || 0;
      if (score >= 80) starByUser[id].xp += 75;
      else if (score >= 60) starByUser[id].xp += 40;
      starByUser[id].count++;
    });

    // 5. Compute XP → Level per user
    const ranked = users.map((u) => {
      const id = String(u._id);
      const mcq = mcqByUser[id] || { highAccuracy: 0, dates: [] };
      const dsa = dsaByUser[id] || { Easy: 0, Medium: 0, Hard: 0 };
      const star = starByUser[id] || { xp: 0, count: 0 };

      const streak = computeStreak(mcq.dates);
      const mcqXP = mcq.highAccuracy * 100;
      const streakXP = streak * 25;
      const dsaXP = dsa.Easy * 75 + dsa.Medium * 150 + dsa.Hard * 300;
      const starXP = star.xp;
      const totalXP = mcqXP + streakXP + dsaXP + starXP;
      const level = computeLevel(totalXP);

      return {
        userId: u._id,
        name: u.name,
        username: u.username,
        level,
        totalXP,
        mcqXP,
        dsaXP,
        starXP,
        streakXP,
        streak,
        dsaSolved: dsa.Easy + dsa.Medium + dsa.Hard,
        starResponses: star.count,
      };
    });

    // Sort by level desc, then totalXP desc as tiebreaker
    ranked.sort((a, b) => b.level - a.level || b.totalXP - a.totalXP);
    ranked.forEach((r, i) => { r.rank = i + 1; });

    res.status(200).json(ranked);
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
