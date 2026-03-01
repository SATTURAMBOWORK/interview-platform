import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader,
  Info,
  ChevronDown,
} from "lucide-react";
import api from "../../api/axios";

function BulkUploadDsaModal({ onClose, onSuccess }) {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isValidJson, setIsValidJson] = useState(false);

  const TEMPLATE = `[
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you cannot use the same element twice.",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
    "sampleInput": "4 9\\n2 7 11 15",
    "sampleOutput": "0 1",
    "functionSignature": "vector<int> twoSum(vector<int>& nums, int target)",
    "boilerplateCode": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        // Write your solution here\\n        \\n    }\\n};",
    "driverCode": "int main() {\\n    int n, target;\\n    cin >> n >> target;\\n    vector<int> nums(n);\\n    for (int i = 0; i < n; i++) cin >> nums[i];\\n    Solution sol;\\n    vector<int> res = sol.twoSum(nums, target);\\n    cout << res[0] << \\\' \\\' << res[1] << endl;\\n    return 0;\\n}",
    "acceptanceCriteria": "EXACT_MATCH",
    "visibleTestCases": [
      { "input": "4 9\\n2 7 11 15", "expectedOutput": ["0 1"], "explanation": "nums[0] + nums[1] == 9, return indices 0 and 1" },
      { "input": "3 6\\n3 2 4", "expectedOutput": ["1 2"], "explanation": "nums[1] + nums[2] == 6, return indices 1 and 2" }
    ],
    "hiddenTestCases": [
      { "input": "2 6\\n3 3", "expectedOutput": ["0 1"], "explanation": "" },
      { "input": "2 0\\n-1000000000 1000000000", "expectedOutput": ["0 1"], "explanation": "" }
    ]
  },
  {
    "title": "Reverse Array",
    "description": "Given an array, reverse it in-place without using extra space.",
    "difficulty": "Easy",
    "tags": ["Array"],
    "constraints": "1 <= nums.length <= 10^5",
    "sampleInput": "5\\n1 2 3 4 5",
    "sampleOutput": "5 4 3 2 1",
    "functionSignature": "void reverseArray(vector<int>& nums)",
    "boilerplateCode": "class Solution {\\npublic:\\n    void reverseArray(vector<int>& nums) {\\n        // Write your solution here\\n        \\n    }\\n};",
    "driverCode": "int main() {\\n    int n;\\n    cin >> n;\\n    vector<int> nums(n);\\n    for (int i = 0; i < n; i++) cin >> nums[i];\\n    Solution sol;\\n    sol.reverseArray(nums);\\n    for (int i = 0; i < n; i++) {\\n        if (i) cout << \\\' \\\';\\n        cout << nums[i];\\n    }\\n    cout << endl;\\n    return 0;\\n}",
    "acceptanceCriteria": "EXACT_MATCH",
    "visibleTestCases": [
      { "input": "5\\n1 2 3 4 5", "expectedOutput": ["5 4 3 2 1"], "explanation": "Array is reversed" }
    ],
    "hiddenTestCases": [
      { "input": "1\\n1", "expectedOutput": ["1"], "explanation": "" },
      { "input": "2\\n1 2", "expectedOutput": ["2 1"], "explanation": "" }
    ]
  }
]`;

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);

    try {
      const parsed = JSON.parse(text);
      setIsValidJson(Array.isArray(parsed) && parsed.length > 0);
      setError("");
    } catch {
      setIsValidJson(false);
    }
  };

  const validateDsaProblem = (problem, index) => {
    // Check required fields
    const requiredFields = ["title", "description", "difficulty", "functionSignature", "boilerplateCode"];
    for (const field of requiredFields) {
      if (!problem[field]) {
        throw new Error(
          `Problem ${index + 1} is missing required field: ${field}`
        );
      }
    }

    // Validate difficulty
    if (!["Easy", "Medium", "Hard"].includes(problem.difficulty)) {
      throw new Error(
        `Problem ${index + 1} has invalid difficulty. Must be "Easy", "Medium", or "Hard"`
      );
    }

    // Validate test cases
    if (!problem.visibleTestCases || !Array.isArray(problem.visibleTestCases)) {
      throw new Error(
        `Problem ${index + 1} must have visibleTestCases array`
      );
    }

    if (!problem.hiddenTestCases || !Array.isArray(problem.hiddenTestCases)) {
      throw new Error(
        `Problem ${index + 1} must have hiddenTestCases array`
      );
    }

    // Validate each test case has input and expectedOutput
    const validateTestCases = (testCases, type) => {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (!tc.input || !tc.expectedOutput) {
          throw new Error(
            `Problem ${index + 1}: ${type}[${i}] is missing input or expectedOutput`
          );
        }
        // Ensure expectedOutput is an array
        if (!Array.isArray(tc.expectedOutput)) {
          testCases[i].expectedOutput = [tc.expectedOutput];
        }
      }
    };

    validateTestCases(problem.visibleTestCases, "visibleTestCases");
    validateTestCases(problem.hiddenTestCases, "hiddenTestCases");

    return problem;
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    let parsedProblems;
    try {
      parsedProblems = JSON.parse(jsonText);
      if (!Array.isArray(parsedProblems)) {
        throw new Error("Must be an array of DSA problems");
      }
      if (parsedProblems.length === 0) {
        throw new Error("Array cannot be empty");
      }

      // Validate each problem
      parsedProblems = parsedProblems.map((p, i) => validateDsaProblem(p, i));
    } catch (err) {
      setError(err.message || "Invalid JSON. Please check the format.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/admin/dsa/bulk", {
        problems: parsedProblems,
      });

      setUploadedCount(parsedProblems.length);
      setSuccess(
        `Successfully uploaded ${parsedProblems.length} DSA problems!`
      );
      setJsonText("");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("BULK UPLOAD ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Bulk upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE);
    alert("Template copied to clipboard!");
  };

  const insertTemplate = () => {
    setJsonText(TEMPLATE);
    setIsValidJson(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bulk Upload DSA Problems
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Upload multiple DSA problems at once using JSON format
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6">

          {/* SUCCESS MESSAGE */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-900 font-semibold">{success}</p>
                <p className="text-emerald-700 text-sm mt-1">
                  {uploadedCount} problems have been added to your database
                </p>
              </div>
            </motion.div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-rose-900 font-semibold">Error</p>
                <p className="text-rose-700 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* JSON INPUT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                JSON Data *
              </label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyTemplate}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition"
                >
                  <Copy className="w-4 h-4" />
                  Copy Template
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={insertTemplate}
                  className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition"
                >
                  Use Template
                </motion.button>
              </div>
            </div>

            <textarea
              rows={16}
              placeholder={TEMPLATE}
              value={jsonText}
              onChange={handleJsonChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition resize-none bg-slate-50 hover:bg-white"
            />

            {/* JSON VALIDATION INDICATOR */}
            {jsonText && (
              <div className="mt-2 flex items-center gap-2">
                {isValidJson ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600 font-medium">
                      Valid JSON
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-sm text-rose-600 font-medium">
                      Invalid JSON format
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* FORMAT GUIDE */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition font-semibold text-slate-900">
              <Info className="w-5 h-5" />
              JSON Format Guide
              <ChevronDown className="w-4 h-4 ml-auto group-open:rotate-180 transition" />
            </summary>

            <div className="mt-3 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Required Fields:
                </h4>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>title</strong> - Problem title (must be unique)</li>
                  <li>• <strong>description</strong> - Problem statement</li>
                  <li>• <strong>difficulty</strong> - "Easy", "Medium", or "Hard"</li>
                  <li>• <strong>functionSignature</strong> - Function to implement</li>
                  <li>• <strong>boilerplateCode</strong> - Solution class stub shown in the editor</li>
                  <li>• <strong>visibleTestCases</strong> - Array of test cases shown on run</li>
                  <li>• <strong>hiddenTestCases</strong> - Array of test cases checked on submit</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Optional Fields:
                </h4>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong className="text-amber-700">driverCode</strong> - Hidden <code>main()</code> harness appended server-side before compilation. Reads test input from stdin, calls the Solution class, and prints output. Required when <code>boilerplateCode</code> is just a Solution class with no <code>main()</code>.</li>
                  <li>• <strong>tags</strong> - Array of topic tags (e.g., ["Array", "Sorting"])</li>
                  <li>• <strong>constraints</strong> - Problem constraints</li>
                  <li>• <strong>sampleInput</strong> - Example input</li>
                  <li>• <strong>sampleOutput</strong> - Example output</li>
                  <li>• <strong>acceptanceCriteria</strong> - "EXACT_MATCH" (default), "SET_MATCH", "SORTED_MATCH", or "CUSTOM"</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Test Case Format:
                </h4>
                <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs">
                  {`{
  "input": "test input string",
  "expectedOutput": ["output1", "output2"],
  "explanation": "optional explanation"
}`}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  💡 expectedOutput is an array to support multiple valid answers
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  💡 Click "Use Template" to get a complete example with proper formatting that you can modify.
                </p>
              </div>
            </div>
          </details>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex gap-3 justify-end sticky bottom-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!isValidJson || loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-5 h-5" />
                </motion.div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload DSA Problems
              </>
            )}
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  );
}

export default BulkUploadDsaModal;
