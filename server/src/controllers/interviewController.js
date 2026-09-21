const mongoose = require("mongoose");
const InterviewSession = require("../models/InterviewSession");
const Subject = require("../models/Subject");
const engine = require("../services/interview/interviewEngine");
const kb = require("../services/interview/knowledgeBase");

const MAX_ANSWER_CHARS = 4000;
const STALE_LOCK_MS = 60 * 1000; // a lock older than this was left by a crashed request
const AI_UNAVAILABLE = "The interviewer is having trouble responding. Please try again in a moment.";

const isAnswered = (t) => typeof t.evaluation?.score === "number";

const conceptFields = (entry) => ({ topic: entry.topic, conceptId: entry.id, concept: entry.concept });

/**
 * The turn to append for the branch the interviewer followed.
 */
const nextTurn = (plan, current, result, difficulty) => {
  const question = result.nextQuestion;
  if (plan?.kind === "kb") {
    return { ...conceptFields(plan.entry), kind: "kb", difficulty: plan.entry.difficulty, question };
  }
  if (plan?.kind === "probe") {
    return {
      topic: current.topic,
      conceptId: current.conceptId,
      concept: current.concept,
      kind: "probe",
      difficulty: current.difficulty,
      question,
    };
  }
  return { topic: result.nextTopic, kind: "free", difficulty, question };
};

/**
 * Shape a session for the client. Evaluations stay hidden until the interview
 * is completed, like a real interview.
 */
const serialize = (session) => {
  const done = session.status === "completed";
  const bank = done ? kb.forSubject(session.subject?.name) : null;
  return {
    id: session._id,
    subject: session.subject?.name
      ? { _id: session.subject._id, name: session.subject.name }
      : { _id: session.subject },
    status: session.status,
    questionLimit: session.questionLimit,
    answeredCount: session.turns.filter(isAnswered).length,
    turns: session.turns.map((t) =>
      done
        ? {
            question: t.question,
            answer: t.answer,
            topic: t.topic,
            concept: t.concept,
            difficulty: t.difficulty,
            evaluation: t.evaluation,
            referenceAnswer: kb.getEntry(bank, t.conceptId)?.referenceAnswer || null,
          }
        : { question: t.question, answer: t.answer }
    ),
    report: done ? session.finalReport : null,
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  };
};

/**
 * Take the per-session lock so one answer is processed at a time.
 * Returns the populated session, or null if it is locked, finished or not the user's.
 */
const acquireSession = (id, userId) =>
  InterviewSession.findOneAndUpdate(
    {
      _id: id,
      user: userId,
      status: "in_progress",
      $or: [{ processing: false }, { processingAt: { $lt: new Date(Date.now() - STALE_LOCK_MS) } }],
    },
    { $set: { processing: true, processingAt: new Date() } },
    { new: true }
  ).populate("subject", "name");

const releaseSession = (id) =>
  InterviewSession.updateOne({ _id: id }, { $set: { processing: false, processingAt: null } });

/**
 * Explain why acquireSession returned null.
 */
const lockFailure = async (id, userId, res) => {
  const existing = await InterviewSession.findOne({ _id: id, user: userId }).select("status");
  if (!existing) return res.status(404).json({ message: "Interview not found" });
  if (existing.status !== "in_progress") {
    return res.status(409).json({ message: "This interview has already ended" });
  }
  return res.status(409).json({ message: "Still processing your previous answer" });
};

/**
 * Score answered turns and write the final report. Mutates, does not save.
 */
const finalize = async (session) => {
  session.turns = session.turns.filter(isAnswered);

  if (!session.turns.length) {
    session.status = "abandoned";
    return;
  }

  const scores = session.turns.map((t) => t.evaluation.score);
  const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10);

  const byTopic = {};
  for (const t of session.turns) {
    const topic = t.topic || "General";
    (byTopic[topic] = byTopic[topic] || []).push(t.evaluation.score);
  }
  const topicBreakdown = Object.entries(byTopic)
    .map(([topic, s]) => ({
      topic,
      avgScore: Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 10) / 10,
      questions: s.length,
    }))
    .sort((a, b) => a.avgScore - b.avgScore);

  let narrative;
  try {
    narrative = await engine.generateReportNarrative(session.subject.name, session.turns, overallScore);
  } catch (error) {
    console.error("INTERVIEW REPORT ERROR:", error.message);
    narrative = {
      summary: "Detailed written feedback couldn't be generated right now, but your scores below are complete.",
      strengths: [],
      improvements: [],
    };
  }

  session.finalReport = { overallScore, topicBreakdown, ...narrative };
  session.status = "completed";
  session.completedAt = new Date();
};

/**
 * POST /api/interview/start  { subjectId }
 */
exports.startInterview = async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "A valid subjectId is required" });
    }

    const subject = await Subject.findById(subjectId).select("name");
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Vary the opener across the user's recent interviews on this subject
    const recent = await InterviewSession.find({ user: req.user._id, subject: subject._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("turns.topic")
      .lean();
    const avoidTopics = recent.map((s) => s.turns?.[0]?.topic).filter(Boolean);

    const concept = engine.pickOpeningConcept(subject.name, avoidTopics);
    let opening;
    try {
      opening = await engine.generateOpeningQuestion(subject.name, avoidTopics, concept);
    } catch (error) {
      console.error("INTERVIEW START AI ERROR:", error.message);
      return res.status(503).json({ message: AI_UNAVAILABLE });
    }

    // One live interview per user
    await InterviewSession.updateMany(
      { user: req.user._id, status: "in_progress" },
      { $set: { status: "abandoned", processing: false } }
    );

    const session = await InterviewSession.create({
      user: req.user._id,
      subject: subject._id,
      turns: [
        concept
          ? {
              ...conceptFields(concept.entry),
              kind: "kb",
              difficulty: concept.entry.difficulty,
              question: opening.question,
            }
          : { topic: opening.topic, difficulty: "medium", question: opening.question },
      ],
    });
    session.subject = subject;

    res.status(201).json(serialize(session));
  } catch (error) {
    console.error("START INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to start interview" });
  }
};

/**
 * POST /api/interview/:id/answer  { answer }
 */
exports.submitAnswer = async (req, res) => {
  const { id } = req.params;
  const answer = typeof req.body.answer === "string" ? req.body.answer.trim() : "";

  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Interview not found" });
  if (!answer) return res.status(400).json({ message: "Answer cannot be empty" });
  if (answer.length > MAX_ANSWER_CHARS) {
    return res.status(400).json({ message: `Answer is too long (max ${MAX_ANSWER_CHARS} characters)` });
  }

  let session;
  try {
    session = await acquireSession(id, req.user._id);
    if (!session) return lockFailure(id, req.user._id, res);

    const current = session.turns[session.turns.length - 1];
    const isFinal = session.turns.length >= session.questionLimit;
    const subjectName = session.subject.name;
    const branches = isFinal ? null : engine.planBranches(subjectName, session.turns, session.difficulty);

    let result;
    try {
      result = await engine.evaluateAndContinue({
        subjectName,
        difficulty: session.difficulty,
        turns: session.turns,
        answer,
        isFinal,
        rubric: kb.getEntry(kb.forSubject(subjectName), current.conceptId),
        branches,
      });
    } catch (error) {
      console.error("INTERVIEW TURN AI ERROR:", error.message);
      return res.status(503).json({ message: AI_UNAVAILABLE });
    }

    current.answer = answer;
    current.answeredAt = new Date();
    current.evaluation = result.evaluation;
    session.difficulty = engine.nextDifficulty(session.difficulty, result.evaluation.score);

    if (isFinal) {
      await finalize(session);
    } else {
      session.turns.push(nextTurn(branches?.[result.branch], current, result, session.difficulty));
    }

    await session.save();
    res.json(serialize(session));
  } catch (error) {
    console.error("SUBMIT ANSWER ERROR:", error);
    res.status(500).json({ message: "Failed to submit answer" });
  } finally {
    if (session) await releaseSession(id).catch(() => {});
  }
};

/**
 * POST /api/interview/:id/end — finish early with the answers given so far
 */
exports.endInterview = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Interview not found" });

  let session;
  try {
    session = await acquireSession(id, req.user._id);
    if (!session) return lockFailure(id, req.user._id, res);

    await finalize(session);
    await session.save();
    res.json(serialize(session));
  } catch (error) {
    console.error("END INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to end interview" });
  } finally {
    if (session) await releaseSession(id).catch(() => {});
  }
};

/**
 * GET /api/interview/:id
 */
exports.getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Interview not found" });

    const session = await InterviewSession.findOne({ _id: id, user: req.user._id }).populate("subject", "name");
    if (!session) return res.status(404).json({ message: "Interview not found" });

    res.json(serialize(session));
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to fetch interview" });
  }
};

/**
 * GET /api/interview/history
 */
exports.getHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id, status: { $ne: "abandoned" } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("subject", "name")
      .select("subject status questionLimit finalReport.overallScore turns.evaluation.score createdAt completedAt")
      .lean();

    res.json(
      sessions.map((s) => ({
        id: s._id,
        subject: s.subject ? { _id: s.subject._id, name: s.subject.name } : null,
        status: s.status,
        overallScore: s.finalReport?.overallScore ?? null,
        answeredCount: s.turns.filter(isAnswered).length,
        questionLimit: s.questionLimit,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
      }))
    );
  } catch (error) {
    console.error("INTERVIEW HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
};
