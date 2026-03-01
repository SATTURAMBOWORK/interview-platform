import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader, Plus, Trash2, Upload } from "lucide-react";
import api from "../../api/axios";
import BulkUploadDsaModal from "../../components/admin/BulkUploadDsaModal";
import usePageTitle from "../../hooks/usePageTitle";

function AddDsaProblem() {
  usePageTitle("Add DSA Problem | Admin");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    boilerplateCode: "",
    acceptanceCriteria: "EXACT_MATCH",
    visibleTestCases: [{ input: "", expectedOutput: [""] }],
    hiddenTestCases: [{ input: "", expectedOutput: [""] }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTestCaseChange = (type, index, field, value) => {
    const updated = [...formData[type]];
    
    if (field === "input") {
      updated[index].input = value;
    } else if (field === "expectedOutput") {
      // expectedOutput is now an array
      updated[index].expectedOutput = [value];
    }

    setFormData({
      ...formData,
      [type]: updated,
    });
  };

  // NEW: Add alternate output for multiple valid answers
  const addAlternateOutput = (type, index, outputValue) => {
    const updated = [...formData[type]];
    
    if (!updated[index].expectedOutput) {
      updated[index].expectedOutput = [];
    }

    if (outputValue.trim() && !updated[index].expectedOutput.includes(outputValue)) {
      updated[index].expectedOutput.push(outputValue);
    }

    setFormData({
      ...formData,
      [type]: updated,
    });
  };

  // NEW: Remove alternate output
  const removeAlternateOutput = (type, index, outputIndex) => {
    const updated = [...formData[type]];
    updated[index].expectedOutput.splice(outputIndex, 1);

    setFormData({
      ...formData,
      [type]: updated,
    });
  };

  const addTestCase = (type) => {
    setFormData({
      ...formData,
      [type]: [
        ...formData[type],
        { input: "", expectedOutput: [""] },
      ],
    });
  };

  const removeTestCase = (type, index) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    if (!formData.tags.trim()) {
      setError("At least one tag is required");
      return;
    }

    if (formData.visibleTestCases.some(tc => !tc.input || !tc.expectedOutput[0])) {
      setError("All visible test cases must have input and output");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      };

      console.log("Submitting DSA Problem:", payload);

      await api.post("/admin/dsa", payload);

      setSuccess("DSA problem created successfully!");
      
      setTimeout(() => {
        navigate("/admin/dsa");
      }, 1500);
    } catch (err) {
      console.error("ADD DSA ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create DSA problem"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Add DSA Problem</h1>
            <p className="text-slate-500 text-sm">Create a new coding challenge for the platform</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition"
          >
            <Upload className="w-5 h-5" />
            Bulk Upload
          </motion.button>
        </motion.div>

        {/* MESSAGES */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400">{success}</p>
          </motion.div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BASIC INFO */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">Basic Information</h2>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                Problem Title *
              </label>
              <input
                name="title"
                placeholder="e.g., Two Sum, Reverse Array"
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Detailed problem description..."
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 resize-none"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                  Output Comparison *
                </label>
                <select
                  name="acceptanceCriteria"
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50"
                  value={formData.acceptanceCriteria}
                  onChange={handleChange}
                >
                  <option value="EXACT_MATCH">Exact Match</option>
                  <option value="SET_MATCH">Set Match (Order doesn't matter)</option>
                  <option value="SORTED_MATCH">Sorted Match</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                Tags (comma separated) *
              </label>
              <input
                name="tags"
                placeholder="e.g., array, sorting, binary search"
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                Constraints
              </label>
              <textarea
                name="constraints"
                placeholder="e.g., 1 ≤ n ≤ 10^5, -10^6 ≤ arr[i] ≤ 10^6"
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 resize-none"
                rows={3}
                value={formData.constraints}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* SAMPLE & BOILERPLATE */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">Sample & Template</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                  Sample Input
                </label>
                <textarea
                  name="sampleInput"
                  placeholder="[1, 2, 3]"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none"
                  value={formData.sampleInput}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                  Sample Output
                </label>
                <textarea
                  name="sampleOutput"
                  placeholder="6"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none"
                  value={formData.sampleOutput}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
                Boilerplate Code (C++)
              </label>
              <textarea
                name="boilerplateCode"
                placeholder={'#include<bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<int>& arr) {\n    // Write your code here\n    return 0;\n}'}
                rows={6}
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none"
                value={formData.boilerplateCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* VISIBLE TEST CASES */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">Visible Test Cases *</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => addTestCase("visibleTestCases")}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Test Case
              </motion.button>
            </div>

            {formData.visibleTestCases.map((testCase, index) => (
              <div key={index} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">Test Case {index + 1}</h3>
                  {formData.visibleTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase("visibleTestCases", index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Input</label>
                  <textarea
                    placeholder="[1, 2, 3]"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none mt-1"
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(
                        "visibleTestCases",
                        index,
                        "input",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* EXPECTED OUTPUT - PRIMARY */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                    Primary Expected Output
                  </label>
                  <textarea
                    placeholder="6"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none mt-1"
                    value={testCase.expectedOutput[0] || ""}
                    onChange={(e) =>
                      handleTestCaseChange(
                        "visibleTestCases",
                        index,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* ALTERNATE OUTPUTS */}
                {testCase.expectedOutput.length > 1 && (
                  <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl p-3 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                      Alternate Valid Outputs
                    </label>
                    {testCase.expectedOutput.slice(1).map((output, outIdx) => (
                      <div key={outIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={output}
                          readOnly
                          className="flex-1 px-2 py-1 border border-white/10 rounded-lg bg-white/[0.04] text-slate-300 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeAlternateOutput("visibleTestCases", index, outIdx + 1)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ADD ALTERNATE OUTPUT */}
                <div>
                  <label className="text-[10px] font-medium text-slate-500">
                    Add Alternate Valid Output (for problems with multiple answers)
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      id={`alt-output-${index}`}
                      placeholder="e.g., [3, 2, 1] for Two Sum"
                      className="flex-1 px-3 py-1 bg-white/[0.05] border border-white/10 text-white rounded-lg focus:outline-none focus:border-indigo-400/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`alt-output-${index}`);
                        if (input.value.trim()) {
                          addAlternateOutput("visibleTestCases", index, input.value);
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* HIDDEN TEST CASES */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono">Hidden Test Cases</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => addTestCase("hiddenTestCases")}
                className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Test Case
              </motion.button>
            </div>

            {formData.hiddenTestCases.map((testCase, index) => (
              <div key={index} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white">Hidden Test Case {index + 1}</h3>
                  {formData.hiddenTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase("hiddenTestCases", index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Input</label>
                  <textarea
                    placeholder="[1, 2, 3]"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none mt-1"
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(
                        "hiddenTestCases",
                        index,
                        "input",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                    Primary Expected Output
                  </label>
                  <textarea
                    placeholder="6"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 font-mono text-sm resize-none mt-1"
                    value={testCase.expectedOutput[0] || ""}
                    onChange={(e) =>
                      handleTestCaseChange(
                        "hiddenTestCases",
                        index,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* ALTERNATE OUTPUTS */}
                {testCase.expectedOutput.length > 1 && (
                  <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-xl p-3 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                      Alternate Valid Outputs
                    </label>
                    {testCase.expectedOutput.slice(1).map((output, outIdx) => (
                      <div key={outIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={output}
                          readOnly
                          className="flex-1 px-2 py-1 border border-white/10 rounded-lg bg-white/[0.04] text-slate-300 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeAlternateOutput("hiddenTestCases", index, outIdx + 1)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ADD ALTERNATE OUTPUT */}
                <div>
                  <label className="text-[10px] font-medium text-slate-500">
                    Add Alternate Valid Output
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      id={`alt-hidden-output-${index}`}
                      placeholder="e.g., [3, 2, 1]"
                      className="flex-1 px-3 py-1 bg-white/[0.05] border border-white/10 text-white rounded-lg focus:outline-none focus:border-indigo-400/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`alt-hidden-output-${index}`);
                        if (input.value.trim()) {
                          addAlternateOutput("hiddenTestCases", index, input.value);
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Problem...
              </>
            ) : (
              "Create DSA Problem"
            )}
          </motion.button>
        </form>
        
        {/* BULK UPLOAD MODAL */}
        {showBulkUpload && (
          <BulkUploadDsaModal
            onClose={() => setShowBulkUpload(false)}
            onSuccess={() => {
              // Refresh or navigate
              navigate("/admin/dsa");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AddDsaProblem;