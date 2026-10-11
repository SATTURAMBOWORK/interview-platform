// Standalone judge worker: takes queued C++ runs from Redis and executes them.
// Run with `npm run worker`, and set JUDGE_WORKER=off on the API so it stops
// running submissions itself.
require("dotenv").config();
const { startWorker } = require("./src/services/judgeQueue");

if (!process.env.REDIS_URL) {
  console.error("Missing REDIS_URL. The judge worker needs the Redis queue.");
  process.exit(1);
}

startWorker();
