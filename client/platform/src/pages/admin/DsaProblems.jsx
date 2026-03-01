import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

function DsaProblems() {
  usePageTitle("DSA Problems | Admin");
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get("/admin/dsa");
        setProblems(res.data);
      } catch (err) {
        console.error("FETCH DSA PROBLEMS ERROR:", err);
        setError("Failed to load DSA problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this DSA problem?"
    );
    if (!confirm) return;

    try {
      await api.delete(`/admin/dsa/${id}`);
      setProblems((prev) =>
        prev.filter((p) => p._id !== id)
      );
    } catch (err) {
      console.error("DELETE DSA ERROR:", err);
      alert("Failed to delete DSA problem");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-white/[0.1] border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono mb-2">Code Challenges</div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            DSA Problems
          </h1>
        </div>
        <button
          onClick={() => navigate("/admin/dsa/add")}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition"
        >
          Add DSA Problem
        </button>
      </div>

      {/* TABLE */}
      {problems.length === 0 ? (
        <p className="text-slate-500 font-mono text-sm">
          No DSA problems added yet.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white/[0.03] rounded-2xl border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                  Title
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                  Difficulty
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                  Tags
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {problems.map((problem) => (
                <tr
                  key={problem._id}
                  className="hover:bg-white/[0.03] transition"
                >
                  <td className="px-5 py-3 font-semibold text-white">
                    {problem.title}
                  </td>

                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.length
                        ? problem.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
                              {tag}
                            </span>
                          ))
                        : <span className="text-slate-600">-</span>}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/dsa/edit/${problem._id}`
                          )
                        }
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(problem._id)
                        }
                        className="text-red-400 hover:text-red-300 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DsaProblems;
