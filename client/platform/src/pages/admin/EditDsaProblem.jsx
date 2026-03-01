import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

function EditDsaProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/admin/dsa/${id}`);
        setFormData({
          ...res.data,
          tags: res.data.tags.join(", "),
        });
      } catch (err) {
        console.log(err);
        setError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/dsa/${id}`, {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      navigate("/admin/dsa");
    } catch (err) {
      console.log(err);
      setError("Failed to update problem");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-10 h-10 border-4 border-white/[0.1] border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );
  if (!formData) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono mb-2">Edit Problem</div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Edit DSA Problem</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          ["title", "Title"],
          ["description", "Description", true],
          ["constraints", "Constraints", true],
          ["sampleInput", "Sample Input", true],
          ["sampleOutput", "Sample Output", true],
        ].map(([key, label, textarea]) => (
          <div key={key}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
              {label}
            </label>
            {textarea ? (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600 resize-none"
              />
            ) : (
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600"
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="bg-[#0d0d1a] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400/50 w-full"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">
            Tags
          </label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400/50 placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition">
            Update
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dsa")}
            className="border border-white/10 text-slate-400 px-6 py-3 rounded-xl hover:bg-white/[0.04] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDsaProblem;
