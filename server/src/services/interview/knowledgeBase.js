const fs = require("fs");
const path = require("path");

// Curated question bank (seeds/kb/*.json), keyed by the Subject name it covers.
// Each entry is one concept: seed questions, a grading rubric (keyPoints,
// referenceAnswer, commonMistakes) and followUps linking to deeper concepts.
const KB_DIR = path.join(__dirname, "../../seeds/kb");

const DIFFICULTIES = ["easy", "medium", "hard"];

const load = () => {
  const bySubject = new Map();
  for (const file of fs.readdirSync(KB_DIR).filter((f) => f.endsWith(".json"))) {
    const { subject, entries } = JSON.parse(fs.readFileSync(path.join(KB_DIR, file), "utf8"));
    bySubject.set(subject.toLowerCase(), {
      subject,
      entries,
      byId: new Map(entries.map((e) => [e.id, e])),
    });
  }
  return bySubject;
};

const bySubject = load();

/**
 * The knowledge base for a subject, or null if it has none (interview runs LLM-only).
 */
const forSubject = (subjectName) => bySubject.get(String(subjectName).toLowerCase()) || null;

const getEntry = (kb, id) => (kb && id ? kb.byId.get(id) || null : null);

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const difficultyGap = (a, b) => Math.abs(DIFFICULTIES.indexOf(a) - DIFFICULTIES.indexOf(b));

/**
 * Choose the next concept to ask about. Tries the strictest match first and
 * relaxes one constraint at a time, so it only returns null once every concept
 * in the subject has been asked.
 *
 * preferIds:     concepts to try first (followUps of the current concept)
 * excludeTopics: topics to stay away from (already covered, or recent openers)
 * askedIds:      concepts already asked in this interview
 */
const pickEntry = (kb, { difficulty, preferIds = [], excludeTopics = [], askedIds = [] }) => {
  if (!kb) return null;

  const asked = new Set(askedIds);
  const excluded = new Set(excludeTopics.map((t) => t.toLowerCase()));
  const unasked = kb.entries.filter((e) => !asked.has(e.id));
  const preferred = preferIds.map((id) => kb.byId.get(id)).filter((e) => e && !asked.has(e.id));
  const freshTopic = unasked.filter((e) => !excluded.has(e.topic.toLowerCase()));

  const tiers = [
    preferred.filter((e) => e.difficulty === difficulty),
    preferred,
    freshTopic.filter((e) => e.difficulty === difficulty),
    freshTopic.filter((e) => difficultyGap(e.difficulty, difficulty) === 1),
    freshTopic,
    unasked.filter((e) => e.difficulty === difficulty),
    unasked,
  ];

  const tier = tiers.find((candidates) => candidates.length);
  return tier ? randomItem(tier) : null;
};

/**
 * One of the concept's seed questions, for the interviewer to rephrase.
 */
const seedQuestion = (entry) => randomItem(entry.questions);

module.exports = { forSubject, getEntry, pickEntry, seedQuestion };
