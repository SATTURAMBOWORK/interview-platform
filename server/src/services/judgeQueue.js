const { Queue, Worker, QueueEvents } = require("bullmq");
const IORedis = require("ioredis");
const { runCppWithTestCases } = require("./cppRunner");

// Compiling and running are CPU-bound, so letting every request start at once
// slows them all down and turns correct solutions into false TLEs. Only a few
// run at a time; the rest wait in arrival order.
//
// With REDIS_URL set the queue lives in Redis (BullMQ), so it survives a restart
// and the worker can run in its own process (npm run worker). Without it, an
// in-memory queue inside this process does the same job for local development.
//
// Read per call: server.js loads app before dotenv, so env isn't set at require time
const maxConcurrent = () => Number(process.env.JUDGE_CONCURRENCY) || 2;
const maxWaiting = () => Number(process.env.JUDGE_MAX_QUEUE) || 20;
const useRedis = () => Boolean(process.env.REDIS_URL);

const judgeError = (code, message) => Object.assign(new Error(message), { code });
const userBusy = () =>
  judgeError("USER_BUSY", "Your previous run is still in progress. Please wait for it to finish.");
const queueFull = () =>
  judgeError("QUEUE_FULL", "The judge is busy right now. Please try again in a few seconds.");

/* ---------- In-memory backend ---------- */

let running = 0;
const waiting = [];
const activeUsers = new Set(); // users with a job waiting or running

const runNext = () => {
  if (running >= maxConcurrent() || !waiting.length) return;

  const job = waiting.shift();
  running++;

  runCppWithTestCases(job.code, job.testCases)
    .then(job.resolve, job.reject)
    .finally(() => {
      running--;
      activeUsers.delete(job.userId);
      runNext();
    });
};

const enqueueMemory = (userId, code, testCases) =>
  new Promise((resolve, reject) => {
    if (activeUsers.has(userId)) return reject(userBusy());
    if (waiting.length >= maxWaiting()) return reject(queueFull());

    activeUsers.add(userId);
    waiting.push({ userId, code, testCases, resolve, reject });
    runNext();
  });

/* ---------- Redis backend ---------- */

const QUEUE_NAME = "judge";
const USER_LOCK_TTL_S = 120; // expires on its own if the server dies mid-run
const REDIS_TIMEOUT_MS = 5000;
const RESULT_TIMEOUT_MS = 120000;

const connect = () => {
  // BullMQ requires maxRetriesPerRequest: null on its connections
  const redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  // ioredis emits an error on every reconnect attempt; log an outage once
  let down = false;
  redis.on("error", (error) => {
    if (!down) console.error("JUDGE REDIS ERROR:", error.message);
    down = true;
  });
  redis.on("ready", () => {
    down = false;
  });
  return redis;
};

/**
 * Commands wait forever while Redis is unreachable; fail the request instead.
 */
const orUnavailable = (promise) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(judgeError("QUEUE_UNAVAILABLE", "The judge is unavailable right now. Please try again shortly.")),
      REDIS_TIMEOUT_MS
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

let producer;
const getProducer = () => {
  if (!producer) {
    const redis = connect();
    producer = {
      redis,
      queue: new Queue(QUEUE_NAME, { connection: redis }),
      events: new QueueEvents(QUEUE_NAME, { connection: connect() }),
    };
    // connect() already logs outages; without a listener BullMQ prints every retry
    producer.queue.on("error", () => {});
    producer.events.on("error", () => {});
  }
  return producer;
};

const enqueueRedis = async (userId, code, testCases) => {
  const { redis, queue, events } = getProducer();
  const lockKey = `judge:user:${userId}`;

  const locked = await orUnavailable(redis.set(lockKey, "1", "EX", USER_LOCK_TTL_S, "NX"));
  if (!locked) throw userBusy();

  let job;
  try {
    if ((await orUnavailable(queue.getWaitingCount())) >= maxWaiting()) throw queueFull();

    job = await orUnavailable(
      queue.add("run", { code, testCases }, { removeOnComplete: { age: 60 }, removeOnFail: { age: 3600 } })
    );
    return await job.waitUntilFinished(events, RESULT_TIMEOUT_MS);
  } catch (error) {
    // Nobody is waiting for the result any more, so don't run it
    if (job) job.remove().catch(() => {});
    throw error;
  } finally {
    redis.del(lockKey).catch(() => {});
  }
};

let worker;

/**
 * Start processing queued runs in this process. No-op without REDIS_URL,
 * where the in-memory queue runs jobs itself.
 */
const startWorker = () => {
  if (!useRedis() || worker) return;

  worker = new Worker(QUEUE_NAME, (job) => runCppWithTestCases(job.data.code, job.data.testCases), {
    connection: connect(),
    concurrency: maxConcurrent(),
  });
  worker.on("error", () => {}); // connect() already logs outages
  console.log(`Judge worker started (concurrency ${maxConcurrent()})`);
};

/**
 * Queue a judge run and resolve with runCppWithTestCases' result.
 * Rejects with code "USER_BUSY" if this user already has a run in the queue,
 * "QUEUE_FULL" if too many runs are already waiting, or "QUEUE_UNAVAILABLE"
 * if Redis can't be reached.
 */
const enqueue = (userId, code, testCases) =>
  (useRedis() ? enqueueRedis : enqueueMemory)(String(userId), code, testCases);

module.exports = { enqueue, startWorker };
