import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  Plus,
  Trash2,
  BookOpen,
  Search,
  Grid3X3,
  List,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Zap,
} from "lucide-react";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectStats, setSubjectStats] = useState({});

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      console.log("Fetching subjects...");
      const res = await api.get("/subjects");
      console.log("Subjects response:", res.data);
      
      const subjectsData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
      setSelectedSubjects(new Set());
      
      // Fetch stats for each subject
      const stats = {};
      for (const subject of subjectsData) {
        try {
          const mcqRes = await api.get(`/mcqs?subject=${subject._id}`);
          const mcqCount = Array.isArray(mcqRes.data) 
            ? mcqRes.data.length 
            : mcqRes.data?.data?.length || 0;
          
          stats[subject._id] = {
            mcqs: mcqCount,
            dsa: 0, // We'll skip DSA stats for now
          };
        } catch (err) {
          stats[subject._id] = { mcqs: 0, dsa: 0 };
        }
      }
      setSubjectStats(stats);
    } catch (err) {
      console.error("FETCH SUBJECTS ERROR:", err);
      showError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchQuery, subjects]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;

    try {
      setLoading(true);
      const res = await api.post("/subjects", { name: newSubject });
      console.log("Add subject response:", res.data);
      setNewSubject("");
      showSuccess("Subject added successfully!");
      fetchSubjects();
    } catch (err) {
      console.error("ADD SUBJECT ERROR:", err);
      showError(err.response?.data?.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject.name.trim()) return;

    try {
      setLoading(true);
      await api.put(`/subjects/${editingSubject._id}`, { 
        name: editingSubject.name 
      });
      setEditingSubject(null);
      showSuccess("Subject updated successfully!");
      fetchSubjects();
    } catch (err) {
      console.error("UPDATE SUBJECT ERROR:", err);
      showError("Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      await api.delete(`/subjects/${id}`);
      showSuccess("Subject deleted successfully!");
      fetchSubjects();
    } catch (err) {
      console.error("DELETE SUBJECT ERROR:", err);
      showError("Failed to delete subject");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubjects.size === 0) return;

    const confirm = window.confirm(
      `Delete ${selectedSubjects.size} subject(s)? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedSubjects).map((id) =>
          api.delete(`/subjects/${id}`)
        )
      );
      showSuccess(
        `${selectedSubjects.size} subject(s) deleted successfully!`
      );
      fetchSubjects();
    } catch (err) {
      console.error("BULK DELETE ERROR:", err);
      showError("Failed to delete some subjects");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectSelection = (id) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubjects(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSubjects.size === filteredSubjects.length) {
      setSelectedSubjects(new Set());
    } else {
      setSelectedSubjects(new Set(filteredSubjects.map((s) => s._id)));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSubject();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      
      {/* ANIMATED BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* TOAST MESSAGES */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex items-center gap-3 shadow-lg backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-emerald-800 font-medium">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-4 flex items-center gap-3 shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-rose-800 font-medium">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Subjects
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your course subjects and content
              </p>
            </div>
          </div>
        </motion.div>

        {/* ADD SUBJECT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative bg-white rounded-2xl border border-blue-100/60 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Subject
            </h3>

            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="text"
                placeholder="e.g., DBMS, Web Development, Algorithms"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-slate-50 hover:bg-white"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSubject}
                disabled={loading || !newSubject.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Subject</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* LOADING STATE */}
        {loading && filteredSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-96"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
            />
          </motion.div>
        ) : (
          <>
            {/* CONTROLS BAR */}
            {subjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-blue-100/60 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex gap-3 items-center flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition bg-slate-50 hover:bg-white"
                    />
                  </div>

                  <div className="flex gap-2 border-l border-slate-200 pl-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      title="Grid view"
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      title="List view"
                    >
                      <List className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {selectedSubjects.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-center bg-red-50 px-4 py-2 rounded-lg border border-red-200"
                  >
                    <span className="text-sm font-semibold text-red-700">
                      {selectedSubjects.size} selected
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* EMPTY STATE */}
            {subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="bg-white rounded-2xl p-12 border border-slate-200 inline-block">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    No subjects yet
                  </h3>
                  <p className="text-slate-600 max-w-sm mx-auto mb-8">
                    Add your first subject to get started organizing your course content
                  </p>
                </div>
              </motion.div>
            ) : filteredSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  No subjects match your search
                </p>
              </motion.div>
            ) : viewMode === "grid" ? (
              // GRID VIEW
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {filteredSubjects.length > 1 && (
                  <motion.label
                    variants={itemVariants}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedSubjects.size === filteredSubjects.length &&
                        filteredSubjects.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-600">
                      Select all on this page
                    </span>
                  </motion.label>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((subject) => {
                    const stats = subjectStats[subject._id] || { mcqs: 0, dsa: 0 };
                    return (
                      <motion.div
                        key={subject._id}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className={`group relative bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden cursor-pointer ${
                          selectedSubjects.has(subject._id)
                            ? "ring-2 ring-blue-500 border-blue-300"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                        onClick={() => toggleSubjectSelection(subject._id)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          checked={selectedSubjects.has(subject._id)}
                          onChange={() => {}}
                          className="absolute top-4 right-4 w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="relative space-y-4">
                          {/* HEADER */}
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-indigo-200 transition">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition">
                                {subject.name}
                              </h3>
                            </div>
                          </div>

                          {/* STATS */}
                          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">MCQs</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.mcqs}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">DSA</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.dsa}</p>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex gap-2 pt-4 border-t border-slate-100">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSubject(subject);
                              }}
                              className="flex-1 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(subject._id, subject.name);
                              }}
                              className="flex-1 text-red-600 hover:bg-red-50 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // LIST VIEW
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* LIST HEADER */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 text-sm">
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedSubjects.size === filteredSubjects.length &&
                        filteredSubjects.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-4">Subject Name</div>
                  <div className="col-span-2 text-center">MCQs</div>
                  <div className="col-span-2 text-center">DSA Problems</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                {/* LIST ITEMS */}
                {filteredSubjects.map((subject, index) => {
                  const stats = subjectStats[subject._id] || { mcqs: 0, dsa: 0 };
                  return (
                    <motion.div
                      key={subject._id}
                      variants={itemVariants}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 hover:bg-slate-50 transition ${
                        selectedSubjects.has(subject._id) ? "bg-blue-50" : ""
                      } ${index === filteredSubjects.length - 1 ? "border-b-0" : ""}`}
                    >
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.has(subject._id)}
                          onChange={() => toggleSubjectSelection(subject._id)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="col-span-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {subject.name}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                          {stats.mcqs}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-semibold">
                          {stats.dsa}
                        </span>
                      </div>

                      <div className="col-span-3 flex gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingSubject(subject)}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(subject._id, subject.name)}
                          className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm">Delete</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}

      </div>

      {/* EDIT MODAL */}
      {editingSubject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Edit Subject
            </h2>

            <input
              type="text"
              value={editingSubject.name}
              onChange={(e) =>
                setEditingSubject({ ...editingSubject, name: e.target.value })
              }
              onKeyPress={(e) => {
                if (e.key === "Enter") handleEditSubject();
              }}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditingSubject(null)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditSubject}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}

export default Subjects;