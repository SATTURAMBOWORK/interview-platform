const ConceptMastery = require("../../models/ConceptMastery");

const LEVEL_ALPHA = 0.5; // weight of the newest score in the moving average
const MASTERED_LEVEL = 8;
const MASTERED_MIN_ATTEMPTS = 2; // one lucky answer isn't mastery
const WEAK_LEVEL = 5;
const RECENT_MS = 3 * 24 * 60 * 60 * 1000; // concepts seen this recently are skipped
const MAX_FOCUS = 5;

const statusOf = (m) =>
  m.level >= MASTERED_LEVEL && m.attempts >= MASTERED_MIN_ATTEMPTS
    ? "mastered"
    : m.level < WEAK_LEVEL
      ? "weak"
      : "learning";

/**
 * Fold a graded knowledge-base turn into the user's mastery of its concept.
 */
const recordAnswer = async (userId, subjectId, turn) => {
  if (!turn.conceptId || typeof turn.evaluation?.score !== "number") return;
  const score = turn.evaluation.score;

  const existing = await ConceptMastery.findOne({ user: userId, subject: subjectId, conceptId: turn.conceptId });
  const level = existing?.attempts ? LEVEL_ALPHA * score + (1 - LEVEL_ALPHA) * existing.level : score;

  await ConceptMastery.updateOne(
    { user: userId, subject: subjectId, conceptId: turn.conceptId },
    {
      $set: {
        concept: turn.concept,
        topic: turn.topic,
        lastScore: score,
        level: Math.round(level * 10) / 10,
        lastSeenAt: new Date(),
      },
      $inc: { attempts: 1 },
    },
    { upsert: true }
  );
};

/**
 * What the concept picker should skip and favour for this user's next interview:
 * skip mastered and recently seen concepts, favour the weakest ones.
 */
const planningHints = async (userId, subjectId) => {
  const rows = await ConceptMastery.find({ user: userId, subject: subjectId })
    .select("conceptId attempts level lastSeenAt")
    .lean();

  const recentSince = Date.now() - RECENT_MS;
  const avoidIds = rows
    .filter((m) => statusOf(m) === "mastered" || m.lastSeenAt?.getTime() > recentSince)
    .map((m) => m.conceptId);
  const avoid = new Set(avoidIds);

  const focusIds = rows
    .filter((m) => statusOf(m) === "weak" && !avoid.has(m.conceptId))
    .sort((a, b) => a.level - b.level)
    .slice(0, MAX_FOCUS)
    .map((m) => m.conceptId);

  return { avoidIds, focusIds };
};

/**
 * Per-subject progress for the lobby. totals: subjectId -> concepts in its knowledge base.
 */
const summarize = async (userId, totals) => {
  const rows = await ConceptMastery.find({ user: userId })
    .select("subject concept topic attempts level")
    .lean();

  const bySubject = new Map();
  for (const m of rows) {
    const key = String(m.subject);
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key).push(m);
  }

  return Object.entries(totals).map(([subjectId, total]) => {
    const list = bySubject.get(subjectId) || [];
    const count = (status) => list.filter((m) => statusOf(m) === status).length;
    return {
      subjectId,
      total,
      seen: list.length,
      mastered: count("mastered"),
      weak: count("weak"),
      weakest: list
        .filter((m) => statusOf(m) === "weak")
        .sort((a, b) => a.level - b.level)
        .slice(0, 3)
        .map((m) => ({ concept: m.concept, topic: m.topic, level: m.level })),
    };
  });
};

module.exports = { recordAnswer, planningHints, summarize, statusOf };
