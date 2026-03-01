import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Trash2,
  Edit,
  Plus,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Tag,
  Star,
} from "lucide-react";

const CATEGORIES = [
  "Leadership",
  "Teamwork",
  "Problem-Solving",
  "Communication",
  "Conflict Resolution",
  "Adaptability",
  "Customer Focus",
];

const DIFFICULTIES = ["easy", "medium", "hard"];

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const CATEGORY_COLORS = {
  Leadership: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Teamwork: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Problem-Solving": "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  Communication: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  "Conflict Resolution": "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  Adaptability: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  "Customer Focus": "bg-teal-500/10 text-teal-400 border border-teal-500/20",
};

const EMPTY_FORM = {
  question: "",
  category: "Leadership",
  difficulty: "medium",
  description: "",
  tips: [""],
  isActive: true,
};

function StarQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  /* ── Toast helper ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch questions ── */
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const res = await api.get("/behavioral/questions", { params });
      setQuestions(res.data || []);
    } catch (err) {
      showToast("error", "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDifficulty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /* ── Open modal for add ── */
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  /* ── Open modal for edit ── */
  const openEdit = (q) => {
    setEditingId(q._id);
    setForm({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      description: q.description,
      tips: q.tips?.length ? q.tips : [""],
      isActive: q.isActive,
    });
    setShowModal(true);
  };

  /* ── Close modal ── */
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /* ── Tips helpers ── */
  const addTip = () => setForm((f) => ({ ...f, tips: [...f.tips, ""] }));
  const removeTip = (i) =>
    setForm((f) => ({ ...f, tips: f.tips.filter((_, idx) => idx !== i) }));
  const updateTip = (i, val) =>
    setForm((f) => {
      const tips = [...f.tips];
      tips[i] = val;
      return { ...f, tips };
    });

  /* ── Save (create or update) ── */
  const handleSave = async () => {
    if (!form.question.trim() || !form.description.trim()) {
      showToast("error", "Question and description are required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        tips: form.tips.filter((t) => t.trim()),
      };
      if (editingId) {
        await api.put(`/behavioral/question/${editingId}`, payload);
        showToast("success", "Question updated successfully");
      } else {
        await api.post("/behavioral/question/create", payload);
        showToast("success", "Question created successfully");
      }
      closeModal();
      loadQuestions();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this STAR question? This cannot be undone.")) return;
    try {
      await api.delete(`/behavioral/question/${id}`);
      showToast("success", "Question deleted");
      loadQuestions();
    } catch (err) {
      showToast("error", "Failed to delete question");
    }
  };

  /* ── Filtered list ── */
  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono mb-2">Behavioral Prep</div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-400" />
            STAR Questions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm bg-[#0d0d1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 cursor-pointer appearance-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Difficulty filter */}
        <div className="relative">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 text-sm bg-[#0d0d1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 cursor-pointer appearance-none pr-8"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-mono">Loading questions…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
            <p className="text-sm">No questions found. Add your first one!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono w-8">#</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Question</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Category</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Difficulty</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Status</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((q, idx) => (
                <tr key={q._id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-5 py-4 text-slate-600 font-mono">{idx + 1}</td>
                  <td className="px-5 py-4 max-w-[360px]">
                    <p className="font-semibold text-white line-clamp-2">{q.question}</p>
                    {q.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{q.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[q.category] || "bg-white/[0.06] text-slate-400"}`}>
                      {q.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${DIFFICULTY_COLORS[q.difficulty] || "bg-white/[0.06] text-slate-400"}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${q.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${q.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
                      {q.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(q)}
                        className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
              <h2 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                {editingId ? "Edit STAR Question" : "Add STAR Question"}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Question */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. Tell me about a time you led a team through a difficult challenge."
                  className="w-full px-4 py-3 text-sm bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Category + Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-[#0d0d1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 cursor-pointer appearance-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                    Difficulty
                  </label>
                  <div className="relative">
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-[#0d0d1a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 cursor-pointer appearance-none"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Explain what the interviewer is looking for with this question."
                  className="w-full px-4 py-3 text-sm bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Tips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Tips</label>
                  <button
                    type="button"
                    onClick={addTip}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tip
                  </button>
                </div>
                <div className="space-y-2">
                  {form.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateTip(i, e.target.value)}
                        placeholder={`Tip ${i + 1}…`}
                        className="flex-1 px-4 py-2 text-sm bg-white/[0.05] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600"
                      />
                      {form.tips.length > 1 && (
                        <button
                          onClick={() => removeTip(i)}
                          className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-indigo-500" : "bg-white/[0.1]"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-400">
                  {form.isActive ? "Active (visible to users)" : "Inactive (hidden from users)"}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08]">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving…" : editingId ? "Update Question" : "Create Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StarQuestions;
