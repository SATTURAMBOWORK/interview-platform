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
 * avoidIds:      concepts the user has mastered or seen recently; used only as a last resort
 * focusIds:      the user's weak concepts, tried before other fresh-topic concepts
 */
const pickEntry = (kb, { difficulty, preferIds = [], excludeTopics = [], askedIds = [], avoidIds = [], focusIds = [] }) => {
  if (!kb) return null;

  const asked = new Set(askedIds);
  const avoided = new Set(avoidIds);
  const focus = new Set(focusIds);
  const excluded = new Set(excludeTopics.map((t) => t.toLowerCase()));
  const sameLevel = (e) => e.difficulty === difficulty;

  const unasked = kb.entries.filter((e) => !asked.has(e.id));
  const unaskedNew = unasked.filter((e) => !avoided.has(e.id));
  const preferred = preferIds.map((id) => kb.byId.get(id)).filter((e) => e && !asked.has(e.id) && !avoided.has(e.id));
  const freshTopic = unaskedNew.filter((e) => !excluded.has(e.topic.toLowerCase()));

  const tiers = [
    preferred.filter(sameLevel),
    preferred,
    freshTopic.filter((e) => focus.has(e.id) && difficultyGap(e.difficulty, difficulty) <= 1),
    freshTopic.filter(sameLevel),
    freshTopic.filter((e) => difficultyGap(e.difficulty, difficulty) === 1),
    freshTopic,
    unaskedNew.filter(sameLevel),
    unaskedNew,
    unasked.filter(sameLevel),
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
