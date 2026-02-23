const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");
const { execSync } = require("child_process");

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

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function runCppWithTestCases(code, testCases) {
  return new Promise((resolve) => {
    const id = crypto.randomUUID();
    const cppFile = path.join(TEMP_DIR, `${id}.cpp`);
    const exeFile = path.join(TEMP_DIR, `${id}.exe`);

    fs.writeFileSync(cppFile, code);

    // 1️⃣ Compile (ABSOLUTE PATH, no shell)
    const compile = spawn(GPP_PATH, [cppFile, "-o", exeFile]);

    let compileError = "";

    compile.stderr.on("data", (d) => {
      compileError += d.toString();
    });

    compile.on("error", (err) => {
      cleanup();
      return resolve({
        success: false,
        type: "compile",
        error: `Compiler not found: ${err.message}. Please install MinGW or g++.`,
      });
    });

    compile.on("close", (code) => {
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

        const run = spawn(exeFile);

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

  


