import { useState, useMemo, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import api from "../../api/axios";
import { Play, Send, Copy, RefreshCcw } from "lucide-react";

const defaultStarterCode = `#include <bits/stdc++.h>
using namespace std;

int main() {
    return 0;
}
`;

const CodeEditorPanel = ({ problemId, problem, fontSize = 14 }) => {
  const initialCode = useMemo(() => {
    return problem?.boilerplateCode?.trim()
      ? problem.boilerplateCode
      : defaultStarterCode;
  }, [problem]);

  const [code, setCode] = useState(initialCode);
  const codeRef = useRef(code);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("run"); // run | submit

  useEffect(() => {
    setCode(initialCode);
    codeRef.current = initialCode;
  }, [initialCode, problemId]);

  // Update ref whenever code changes
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value);
    codeRef.current = value;
  };

  // ▶ RUN (visible test cases)
  const runCode = async () => {
    setMode("run");
    setLoading(true);
    setOutput("");

    try {
      const res = await api.post("/dsa/run", { problemId, code: codeRef.current });

      if (!res.data.success) {
        setOutput(res.data.error || res.data.message || "Execution failed");
      } else {
        const formatted = res.data.results
          .map(
            (r, i) =>
              `Test Case ${i + 1}\n` +
              `Input: ${r.input}\n` +
              `Output: ${r.output}\n` +
              `Expected: ${r.expectedOutput}\n` +
              `Status: ${r.passed ? "Passed" : "Failed"}\n`
          )
          .join("\n");

        setOutput(formatted);
      }
    } catch {
      setOutput("Network / Server Error");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 SUBMIT (visible + hidden test cases)
  const submitCode = async () => {
    setMode("submit");
    setLoading(true);
    setOutput("");

    try {
      const res = await api.post("/dsa/submit", { problemId, code: codeRef.current });

      // Backend always saves a Submission for these statuses
      const savedStatuses = ["Accepted", "Wrong Answer", "Compilation Error", "Time Limit Exceeded", "Runtime Error"];
      if (savedStatuses.includes(res.data.status)) {
        window.dispatchEvent(new CustomEvent("dsaSubmissionMade"));
      }

      if (!res.data.success) {
        let msg = `❌ ${res.data.status || "Submission Failed"}`;
      
        if (res.data.failedTest) {
          msg += `\n\nFailed at Test Case #${res.data.failedTest}`;
        }
      
        if (res.data.testCase) {
          msg +=
            `\n\nInput:\n${res.data.testCase.input}` +
            `\n\nYour Output:\n${res.data.testCase.output}` +
            `\n\nExpected Output:\n${res.data.testCase.expectedOutput}`;
        }
      
        if (res.data.error) {
          msg += `\n\nError:\n${res.data.error}`;
        }
      
        setOutput(msg);
      } else {
        // ✅ Accepted
        setOutput("✅ Accepted\nAll test cases passed.");
        const statsRes = await api.get("/dsa/stats");
        window.dispatchEvent(
          new CustomEvent("dsaStatsUpdated", {
            detail: statsRes.data.stats,
          })
        );
      }
    } catch {
      setOutput("Network / Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col text-gray-200">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#0b1220] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-slate-400">Language</span>
          <span className="text-sm font-semibold text-white">C++17</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(initialCode)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={runCode}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            onClick={submitCode}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          theme="vs-dark"
          language="cpp"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize,
            minimap: { enabled: false },
            automaticLayout: true,
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Console */}
      <div className="h-44 bg-[#0a0f1a] border-t border-slate-800 p-3 text-emerald-300 text-sm font-mono overflow-y-auto whitespace-pre-wrap">
        {loading
          ? mode === "run"
            ? "Running..."
            : "Submitting..."
          : output || "Run output will appear here"}
      </div>
    </div>
  );
};

export default CodeEditorPanel;
