const Groq = require("groq-sdk");

// Tried in order. qwen3 graded most accurately and sounded most like a real
// interviewer in testing; gpt-oss-20b is the fallback when qwen is rate-limited.
const MODELS = [
  { model: "qwen/qwen3.8-27b", reasoning_effort: "none" },
  { model: "openai/gpt-oss-20b", reasoning_effort: "low" },
];

// Whole-call budget, kept under the controller's 60s stale-lock window so a
// slow answer is never processed twice.
const DEFAULT_BUDGET_MS = 45000;
const REQUEST_TIMEOUT_MS = 20000;

let client;
const getClient = () => {
  // No SDK retries: on a 429 Groq asks us to wait up to a minute, and falling
  // through to the next model is faster than leaving the candidate waiting.
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0, timeout: REQUEST_TIMEOUT_MS });
  }
  return client;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * How long Groq asked us to wait before retrying, in ms, or null if unknown.
 */
const retryAfterMs = (error) => {
  const headers = error.headers || {};
  const ms = Number(headers["retry-after-ms"]);
  if (Number.isFinite(ms) && ms > 0) return ms;
  const seconds = Number(headers["retry-after"]);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;

  // Token-per-minute limits only say it in the message: "try again in 1m2.5s"
  const m = /try again in (?:(\d+)m)?([\d.]+)s/.exec(error.message || "");
  return m ? (Number(m[1] || 0) * 60 + Number(m[2])) * 1000 : null;
};

/**
 * Run a chat completion in JSON mode and return the parsed object.
 *
 * Tries each model in turn. If every model is rate-limited, waits as long as
 * Groq asks (when that fits in budgetMs) and tries again. Throws an error with
 * code "RATE_LIMITED" and retryAfterMs when it runs out of budget on a 429.
 * model: use only this model (evals pin one so results aren't mixed across graders).
 */
const completeJSON = async (messages, { temperature = 0.4, budgetMs = DEFAULT_BUDGET_MS, model: only } = {}) => {
  const models = only ? MODELS.filter((m) => m.model === only) : MODELS;
  if (!models.length) throw new Error(`Unknown interview model: ${only}`);
  const deadline = Date.now() + budgetMs;
  let lastError;
  let wait; // shortest retry-after among rate-limited models this round
  let rateLimited;

  for (;;) {
    wait = Infinity;
    rateLimited = false;

    for (const { model, reasoning_effort } of models) {
      try {
        const completion = await getClient().chat.completions.create({
          model,
          reasoning_effort,
          messages,
          temperature,
          response_format: { type: "json_object" },
        });
        return JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.warn(`⚠️  Interview model ${model} failed: ${error.message.slice(0, 200)}`);
        lastError = error;
        if (error.status === 429) {
          rateLimited = true;
          wait = Math.min(wait, retryAfterMs(error) ?? 5000);
        }
      }
    }

    // Only a rate limit is worth waiting out; other failures won't fix themselves
    const resumeAt = Date.now() + wait + 250;
    if (!rateLimited || resumeAt + REQUEST_TIMEOUT_MS / 2 > deadline) break;
    console.warn(`⏳ All interview models rate-limited, retrying in ${Math.ceil(wait / 1000)}s`);
    await sleep(resumeAt - Date.now());
  }

  const error = new Error(`All interview models failed: ${lastError.message}`);
  if (rateLimited) {
    error.code = "RATE_LIMITED";
    error.retryAfterMs = wait;
  }
  throw error;
};

module.exports = { name: "groq", completeJSON, models: MODELS.map((m) => m.model) };
