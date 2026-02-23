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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-6">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage MCQs</h1>
            <p className="text-slate-600 mt-1">Search, filter, and maintain your question bank</p>
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Layers className="w-4 h-4" />
              <span className="text-sm">Total MCQs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{mcqs.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <List className="w-4 h-4" />
              <span className="text-sm">Filtered Results</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{filteredMcqs.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Subjects</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{subjects.length}</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:w-1/2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-1/2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none w-full text-sm"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          {loading ? (
            <p className="text-slate-500">Loading MCQs...</p>
          ) : paginatedMcqs.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No MCQs found</div>
          ) : (
            <div className="space-y-4">
              {paginatedMcqs.map((mcq, index) => (
                <div
                  key={mcq._id}
                  className="rounded-xl border border-slate-200 p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-600">
                          #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span>•</span>
                        <span>{mcq.subject?.name || "Unassigned"}</span>
                        {mcq.difficulty && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                            {mcq.difficulty}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">{mcq.question}</h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMcq(mcq)}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(mcq._id)}
                        className="text-red-500 hover:text-red-600"
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
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-slate-50"
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
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">
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
              className="w-full border rounded-md px-3 py-2 mb-4"
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
                  className="border rounded-md px-3 py-2"
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
              className="border rounded-md px-3 py-2 mb-4"
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
                className="border px-4 py-2 rounded-md"
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
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
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