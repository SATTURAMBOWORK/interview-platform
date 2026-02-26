const Attempt = require("../models/Attempt");
const Mcq = require("../models/Mcq");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Submit via sendBeacon (token comes in body — no Authorization header possible)
exports.submitViaBeacon = async (req, res) => {
  try {
    const { attemptId, answers, token } = req.body;
    if (!attemptId || !token) return res.status(400).json({ message: "Missing fields" });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Not found" });

    // Idempotent: already submitted — silently succeed
    if (attempt.status === "completed") return res.status(200).json({ message: "Already submitted" });

    if (attempt.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    const safeAnswers = Array.isArray(answers) ? answers : [];
    const mcqIds = safeAnswers.map((a) => a.mcq);
    const mcqs = await Mcq.find({ _id: { $in: mcqIds } }).select("_id correctOption");
    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

    let correctCount = 0;
    const formattedAnswers = safeAnswers.map((a) => {
      const mcq = mcqMap.get(a.mcq);
      const correctOption = mcq?.correctOption;
      const isCorrect = Number(a.selectedOption) === Number(correctOption);
      if (isCorrect) correctCount++;
      return { mcq: a.mcq, selectedOption: a.selectedOption, correctOption: correctOption ?? 0, isCorrect };
    });

    const totalQuestions = attempt.totalQuestions;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 50 : 0;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const timeTaken = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));

    attempt.answers = formattedAnswers;
    attempt.correctCount = correctCount;
    attempt.score = score;
    attempt.accuracy = accuracy;
    attempt.timeTaken = timeTaken;
    attempt.status = "completed";
    await attempt.save();

    res.status(200).json({ message: "Submitted" });
  } catch (err) {
    console.error("SUBMIT BEACON ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};

// Start a test (user)
exports.startTest = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    // Fetch 50 questions: 20 easy, 20 medium, 10 hard
    const easyMcqs = await Mcq.find({ subject: subjectId, difficulty: "easy" })
      .select("question options correctOption subject difficulty")
      .limit(20);

    const mediumMcqs = await Mcq.find({ subject: subjectId, difficulty: "medium" })
      .select("question options correctOption subject difficulty")
      .limit(20);

    const hardMcqs = await Mcq.find({ subject: subjectId, difficulty: "hard" })
      .select("question options correctOption subject difficulty")
      .limit(10);

    // Combine and shuffle the questions
    const mcqs = [...easyMcqs, ...mediumMcqs, ...hardMcqs].sort(() => Math.random() - 0.5);

    if (mcqs.length === 0) {
      return res.status(404).json({ message: "No MCQs found for this subject" });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 30 * 60 * 1000); // 30 minutes

    const attempt = new Attempt({
      user: req.user.id,
      subject: subjectId,
      answers: [],
      totalQuestions: mcqs.length,
      correctCount: 0,
      score: 0,
      accuracy: 0,
      timeTaken: 0,
      status: "in-progress",
      startedAt,
      expiresAt,
    });

    await attempt.save();

    res.status(201).json({
      message: "Test started",
      attemptId: attempt._id,
      expiresAt,
      mcqs,
    });
  } catch (err) {
    console.error("START TEST ERROR:", err);
    res.status(500).json({ message: "Failed to start test" });
  }
};

// Submit attempt (user)
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Attempt ID and answers are required" });
    }

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const mcqIds = answers.map((a) => a.mcq);
    const mcqs = await Mcq.find({ _id: { $in: mcqIds } })
      .select("_id correctOption");

    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

    let correctCount = 0;
    const formattedAnswers = answers.map((a) => {
      const mcq = mcqMap.get(a.mcq);
      const correctOption = mcq?.correctOption;
      const isCorrect = Number(a.selectedOption) === Number(correctOption);
      if (isCorrect) correctCount++;

      return {
        mcq: a.mcq,
        selectedOption: a.selectedOption,
        correctOption: correctOption ?? 0,
        isCorrect,
      };
    });

    const totalQuestions = attempt.totalQuestions;
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 50 : 0;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const timeTaken = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));

    attempt.answers = formattedAnswers;
    attempt.correctCount = correctCount;
    attempt.totalQuestions = totalQuestions;
    attempt.score = score;
    attempt.accuracy = accuracy;
    attempt.timeTaken = timeTaken;
    attempt.status = "completed";

    await attempt.save();

    res.status(200).json({
      message: "Attempt submitted successfully",
      score,
      attempt,
    });
  } catch (err) {
    console.error("SUBMIT ATTEMPT ERROR:", err);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

// Get user's attempts (existing)
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      $or: [{ user: req.user.id }, { userId: req.user.id }],
    })
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(attempts);
  } catch (err) {
    console.error("GET MY ATTEMPTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

// Get attempt by ID (existing)
exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId)
      .populate("subject", "name")
      .populate("answers.mcq", "question options correctOption difficulty");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const ownerId = attempt.user ? attempt.user.toString() : attempt.userId?.toString();
    if (ownerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(attempt);
  } catch (err) {
    console.error("GET ATTEMPT BY ID ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempt" });
  }
};

// Get user's attempts by subject (existing)
exports.getUserAttemptsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const attempts = await Attempt.find({
      $and: [
        { $or: [{ user: req.user.id }, { userId: req.user.id }] },
        { $or: [{ subject: subjectId }, { subjectId }] },
      ],
    }).sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const averageScore = attempts.length > 0 
      ? (attempts.reduce((sum, att) => sum + att.score, 0) / totalAttempts).toFixed(2)
      : 0;

    res.status(200).json({
      subjectId,
      totalAttempts,
      averageScore,
      attempts
    });
  } catch (err) {
    console.error("GET ATTEMPTS BY SUBJECT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

// ✅ NEW: Get all attempts (Admin)
exports.getAllAttempts = async (req, res) => {
  try {
    const { userId, subjectId, limit = 100 } = req.query;

    let filter = {};
    
    if (userId) filter.user = userId;
    if (subjectId) filter.subject = subjectId;

    const attempts = await Attempt.find(filter)
      .populate("user", "name email")
      .populate("subject", "name")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(attempts);
  } catch (err) {
    console.error("GET ALL ATTEMPTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

// ✅ NEW: Get attempt statistics (Admin Dashboard)
exports.getAttemptStats = async (req, res) => {
  try {
    const totalAttempts = await Attempt.countDocuments();
    
    const completedAttempts = await Attempt.countDocuments({ status: "completed" });
    
    const avgScore = await Attempt.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);

    const attemptsByUser = await Attempt.aggregate([
      {
        $group: {
          _id: "$user",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      }
    ]);

    const attemptsBySubject = await Attempt.aggregate([
      {
        $group: {
          _id: "$subject",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject"
        }
      }
    ]);

    res.status(200).json({
      totalAttempts,
      completedAttempts,
      averageScore: avgScore[0]?.avgScore?.toFixed(2) || 0,
      attemptsByUser,
      attemptsBySubject
    });
  } catch (err) {
    console.error("GET ATTEMPT STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

// ✅ NEW: Get attempts by date range (Admin)
exports.getAttemptsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Please provide startDate and endDate in YYYY-MM-DD format" 
      });
    }

    const attempts = await Attempt.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).getTime() + 86400000)
      }
    })
      .populate("user", "name email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === "completed").length;
    const avgScore = completedAttempts > 0
      ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts).toFixed(2)
      : 0;

    res.status(200).json({
      startDate,
      endDate,
      totalAttempts,
      completedAttempts,
      averageScore: avgScore,
      attempts
    });
  } catch (err) {
    console.error("GET ATTEMPTS BY DATE RANGE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};