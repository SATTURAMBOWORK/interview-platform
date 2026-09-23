const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

// Try to detect g++ path automatically
let GPP_PATH = "g++"; // Default to system PATH

// Try common g++ locations on Windows
const commonPaths = [
  "C:\\MinGW\\bin\\g++.exe",
  "C:\\msys64\\mingw64\\bin\\g++.exe",
  "C:\\Program Files\\MinGW\\bin\\g++.exe",
];

for (const gppPath of commonPaths) {
  if (fs.existsSync(gppPath)) {
    GPP_PATH = gppPath;
    break;
  }
}

const TEMP_DIR = path.join(__dirname, "..", "temp");

// Heavy template code can keep g++ busy for minutes; give up after this long.
const COMPILE_TIMEOUT_MS = 20000;
const IS_WINDOWS = process.platform === "win32";

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function runCppWithTestCases(code, testCases) {
  return new Promise((resolve) => {
    const id = crypto.randomUUID();
    const cppFile = path.join(TEMP_DIR, `${id}.cpp`);
    const exeFile = path.join(TEMP_DIR, `${id}.exe`);

    // Ensure every submission has the standard header so that NULL,
    // cout, vector, etc. are always in scope regardless of what the
    // problem boilerplate or user code includes.
    const PREAMBLE = `#include <bits/stdc++.h>\nusing namespace std;\n`;
    const hasInclude = /^\s*#\s*include\s*[<"]bits\/stdc\+\+\.h[>"]/m.test(code);
    const finalCode = hasInclude ? code : PREAMBLE + code;

    // Guard: if there is no main() function the linker will fail with
    // "undefined reference to WinMain@16".  Surface a friendly error
    // before we even try to compile.
    if (!/\bint\s+main\s*\(/.test(finalCode)) {
      return resolve({
        success: false,
        type: "compile",
        error:
          "Compilation Error: No main() function found.\n\n" +
          "This problem is missing a Driver Code (test harness).\n" +
          "Go to Admin → Edit Problem and add a driverCode that\n" +
          "reads test input from stdin, calls your Solution class,\n" +
          "and prints the result to stdout.",
      });
    }

    fs.writeFileSync(cppFile, finalCode);

    // 1️⃣ Compile (ABSOLUTE PATH, no shell)
    // Keep these flags in sync with the precompiled header built in the
    // Dockerfile: g++ silently ignores the .gch if they differ.
    // On Linux, detached makes g++ a process-group leader so the timeout can
    // kill its whole group (g++ hands the real work to cc1plus and ld).
    const compile = spawn(GPP_PATH, [cppFile, "-o", exeFile], { detached: !IS_WINDOWS });

    let compileError = "";
    let compileDone = false;

    const compileTimer = setTimeout(() => {
      if (compileDone) return;
      compileDone = true;
      try {
        if (IS_WINDOWS) compile.kill();
        else process.kill(-compile.pid, "SIGKILL");
      } catch {}
      cleanup();
      resolve({
        success: false,
        type: "compile",
        error: `Compilation Time Limit Exceeded (${COMPILE_TIMEOUT_MS / 1000}s)`,
      });
    }, COMPILE_TIMEOUT_MS);

    compile.stderr.on("data", (d) => {
      compileError += d.toString();
    });

    compile.on("error", (err) => {
      if (compileDone) return;
      compileDone = true;
      clearTimeout(compileTimer);
      cleanup();
      return resolve({
        success: false,
        type: "compile",
        error: `Compiler not found: ${err.message}. Please install MinGW or g++.`,
      });
    });

    compile.on("close", (code) => {
      if (compileDone) return;
      compileDone = true;
      clearTimeout(compileTimer);

      if (code !== 0) {
        cleanup();
        return resolve({
          success: false,
          type: "compile",
          error: compileError || "Compilation Error",
        });
      }

      // 2️⃣ Run test cases
      const results = [];
      let index = 0;

      const runNext = () => {
        if (index >= testCases.length) {
          cleanup();
          return resolve({ success: true, results });
        }

        const tc = testCases[index];

        // SECURITY: run the untrusted binary with an EMPTY environment so it
        // cannot read server secrets (JWT_SECRET, MONGO_URI, GROQ_API_KEY, ...)
        // via getenv(). A standalone compiled C++ program needs no env vars.
        const run = spawn(exeFile, [], { env: {} });

        let stdout = "";
        let stderr = "";
        let finished = false;

        const timer = setTimeout(() => {
          run.kill();
          if (!finished) {
            finished = true;
            results.push({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              output: "",
              passed: false,
              error: "Time Limit Exceeded",
            });
            index++;
            runNext();
          }
        }, 2000);

        run.on("error", (err) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            output: "",
            passed: false,
            error: "Failed to execute program: " + err.message,
          });
          index++;
          runNext();
        });

        // 🔴 newline is mandatory
        run.stdin.write((tc.input || "") + "\n");
        run.stdin.end();

        run.stdout.on("data", (d) => (stdout += d.toString()));
        run.stderr.on("data", (d) => (stderr += d.toString()));

        run.on("close", () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);

          const output = stdout.trim();
          const expected = (tc.expectedOutput || "").trim();

          results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            output,
            passed: output === expected,
            error: stderr || null,
          });

          index++;
          runNext();
        });
      };

      runNext();
    });

    function cleanup() {
      try {
        if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile);
        if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
      } catch {}
    }
  });
}

module.exports = { runCppWithTestCases };

  


