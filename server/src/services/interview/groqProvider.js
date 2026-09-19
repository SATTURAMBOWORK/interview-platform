const Groq = require("groq-sdk");

// Tried in order. qwen3 graded most accurately and sounded most like a real
// interviewer in testing; gpt-oss-20b is the fallback when qwen is rate-limited.
const MODELS = [
  { model: "qwen/qwen3.8-27b", reasoning_effort: "none" },
  { model: "openai/gpt-oss-20b", reasoning_effort: "low" },
];

let client;
const getClient = () => {
  // No SDK retries: on a 429 Groq asks us to wait up to a minute, and falling
  // through to the next model is faster than leaving the candidate waiting.
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0, timeout: 30000 });
  }
  return client;
};

/**
 * Run a chat completion in JSON mode and return the parsed object.
 */
const completeJSON = async (messages, { temperature = 0.4 } = {}) => {
  let lastError;
  for (const { model, reasoning_effort } of MODELS) {
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
      console.warn(`⚠️  Interview model ${model} failed: ${error.message}`);
      lastError = error;
    }
  }
  throw new Error(`All interview models failed: ${lastError.message}`);
};

module.exports = { name: "groq", completeJSON };
