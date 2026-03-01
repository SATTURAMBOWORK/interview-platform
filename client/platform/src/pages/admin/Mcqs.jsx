import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Trash2,
  Edit,
  CheckCircle,
  Search,
  Filter,
  Upload,
  Layers,
  List,
} from "lucide-react";
import BulkUploadModal from "../../components/admin/BulkUploadModal";

const ITEMS_PER_PAGE = 50;

function Mcqs() {
  const [mcqs, setMcqs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [editingMcq, setEditingMcq] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  /**
   * Load MCQs + Subjects
   */
  const loadData = useCallback(async () => {
    try {
      const [mcqRes, subjectRes] = await Promise.all([
        api.get("/mcqs"),
        api.get("/subjects"),
      ]);

      setMcqs(mcqRes.data || []);
      setSubjects(subjectRes.data || []);
    } catch (err) {
      console.error("FETCH MCQS ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Delete MCQ
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this MCQ?")) return;
    try {
      await api.delete(`/mcqs/${id}`);
      loadData();
    } catch (err) {
      console.error("DELETE MCQ ERROR:", err);
    }
  };

  /**
   * Filter + Search
   */
  const filteredMcqs = mcqs.filter((m) => {
    const subjectMatch = selectedSubject
      ? m.subject?._id === selectedSubject
      : true;

    const searchMatch = m.question
      .toLowerCase()
      .includes(search.toLowerCase());

    return subjectMatch && searchMatch;
  });

  /**
   * Pagination
   */
  const totalPages = Math.ceil(
    filteredMcqs.length / ITEMS_PER_PAGE
  );

  const paginatedMcqs = filteredMcqs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono mb-2">Question Bank</div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Manage MCQs</h1>
            <p className="text-slate-500 mt-1 text-sm">Search, filter, and maintain your question bank</p>
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition font-semibold"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-sm">Total MCQs</span>
            </div>
            <p className="text-2xl font-black text-white mt-2">{mcqs.length}</p>
          </div>
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <List className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Filtered Results</span>
            </div>
            <p className="text-2xl font-black text-white mt-2">{filteredMcqs.length}</p>
          </div>
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Subjects</span>
            </div>
            <p className="text-2xl font-black text-white mt-2">{subjects.length}</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 w-full md:w-1/2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none w-full text-sm text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-1/2">
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 w-full">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0d0d1a] outline-none w-full text-sm text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4">
          {loading ? (
            <p className="text-slate-500 font-mono text-sm">Loading MCQs...</p>
          ) : paginatedMcqs.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No MCQs found</div>
          ) : (
            <div className="space-y-4">
              {paginatedMcqs.map((mcq, index) => (
                <div
                  key={mcq._id}
                  className="rounded-xl border border-white/[0.08] p-5 hover:border-indigo-400/30 hover:bg-white/[0.03] transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-black text-slate-400 font-mono">
                          #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span>•</span>
                        <span>{mcq.subject?.name || "Unassigned"}</span>
                        {mcq.difficulty && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.06] text-slate-400">
                            {mcq.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white">{mcq.question}</h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMcq(mcq)}
                        className="text-indigo-400 hover:text-indigo-300"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(mcq._id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {mcq.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${
                          i === mcq.correctOption
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                        }`}
                      >
                        {i === mcq.correctOption && <CheckCircle size={16} />}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                    : "border border-white/10 text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingMcq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-4">
              Edit MCQ
            </h2>

            <input
              type="text"
              value={editingMcq.question}
              onChange={(e) =>
                setEditingMcq({
                  ...editingMcq,
                  question: e.target.value,
                })
              }
              className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-3 py-2 mb-4 focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {editingMcq.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const updated = [...editingMcq.options];
                    updated[i] = e.target.value;
                    setEditingMcq({
                      ...editingMcq,
                      options: updated,
                    });
                  }}
                  className="bg-white/[0.05] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400/50"
                />
              ))}
            </div>

            <select
              value={editingMcq.correctOption}
              onChange={(e) =>
                setEditingMcq({
                  ...editingMcq,
                  correctOption: Number(e.target.value),
                })
              }
              className="bg-[#0d0d1a] border border-white/10 text-white rounded-xl px-3 py-2 mb-4 focus:outline-none focus:border-indigo-400/50 w-full"
            >
              {editingMcq.options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingMcq(null)}
                className="border border-white/10 text-slate-400 px-4 py-2 rounded-xl hover:bg-white/[0.04] transition"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    setSaving(true);
                    await api.put(`/mcqs/${editingMcq._id}`, {
                      question: editingMcq.question,
                      options: editingMcq.options,
                      correctOption: editingMcq.correctOption,
                    });
                    setEditingMcq(null);
                    loadData();
                  } catch (err) {
                    console.error("UPDATE MCQ ERROR:", err);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 font-semibold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkUpload && (
        <BulkUploadModal
          subjects={subjects}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default Mcqs;