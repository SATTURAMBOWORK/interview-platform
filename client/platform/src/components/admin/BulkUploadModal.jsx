import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader,
  FileJson,
  Info,
  ChevronDown,
} from "lucide-react";
import api from "../../api/axios";

function BulkUploadModal({ subjects, onClose, onSuccess }) {
  const [subject, setSubject] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isValidJson, setIsValidJson] = useState(false);

  const TEMPLATE = `[
  {
    "question": "What is DBMS?",
    "options": ["Database Management System", "Data Backup Management Service", "Digital Business Module System", "Data Based Mobile Services"],
    "correctOption": 0,
    "difficulty": "easy"
  },
  {
    "question": "Which of the following is a NoSQL database?",
    "options": ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
    "correctOption": 2,
    "difficulty": "medium"
  },
  {
    "question": "What does ACID stand for?",
    "options": ["Atomicity, Consistency, Isolation, Durability", "Application, Control, Interface, Data", "Access, Cache, Index, Distribution", "Algorithms, Coding, Input, Debugging"],
    "correctOption": 0,
    "difficulty": "hard"
  }
]`;

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);

    // Validate JSON in real-time
    try {
      const parsed = JSON.parse(text);
      setIsValidJson(Array.isArray(parsed) && parsed.length > 0);
      setError("");
    } catch {
      setIsValidJson(false);
    }
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!subject) {
      setError("Please select a subject.");
      return;
    }

    let parsedMcqs;
    try {
      parsedMcqs = JSON.parse(jsonText);
      if (!Array.isArray(parsedMcqs)) {
        throw new Error("Must be an array");
      }
      if (parsedMcqs.length === 0) {
        throw new Error("Array is empty");
      }

      // Validate each MCQ
      for (let i = 0; i < parsedMcqs.length; i++) {
        const mcq = parsedMcqs[i];
        if (!mcq.question || !mcq.options || mcq.correctOption === undefined) {
          throw new Error(
            `MCQ ${i + 1} is missing required fields: question, options, correctOption`
          );
        }
        if (!Array.isArray(mcq.options) || mcq.options.length < 2) {
          throw new Error(
            `MCQ ${i + 1} must have at least 2 options`
          );
        }
        if (mcq.correctOption < 0 || mcq.correctOption >= mcq.options.length) {
          throw new Error(
            `MCQ ${i + 1} has invalid correctOption index`
          );
        }
      }
    } catch (err) {
      setError(
        err.message || "Invalid JSON. Please check the format."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/mcqs/bulk", {
        subject,
        mcqs: parsedMcqs,
      });

      setUploadedCount(parsedMcqs.length);
      setSuccess(
        `Successfully uploaded ${parsedMcqs.length} MCQs!`
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
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bulk Upload MCQs
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Upload multiple MCQs at once using JSON format
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
                  {uploadedCount} MCQs have been added to the selected subject
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

          {/* SUBJECT SELECT */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Subject *
            </label>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition appearance-none bg-white"
              >
                <option value="">Choose a subject...</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

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
                  className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                >
                  Use Template
                </motion.button>
              </div>
            </div>

            <textarea
              rows={12}
              placeholder={TEMPLATE}
              value={jsonText}
              onChange={handleJsonChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none bg-slate-50 hover:bg-white"
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

            <div className="mt-3 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Required Fields:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>question</strong> - The MCQ question text
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>options</strong> - Array of 2-4 answer options
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>correctOption</strong> - Index of correct answer (0, 1, 2, or 3)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Optional Fields:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>difficulty</strong> - "easy", "medium", or "hard"
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  💡 Tip: Use "Use Template" button to get a properly formatted example you can modify.
                </p>
              </div>
            </div>
          </details>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex gap-3 justify-end">
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
            disabled={!subject || !isValidJson || loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                Upload MCQs
              </>
            )}
          </motion.button>
        </div>

      </motion.div>
    </motion.div>
  );
}

export default BulkUploadModal;