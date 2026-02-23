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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!formData) return null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit DSA Problem</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          ["title", "Title"],
          ["description", "Description", true],
          ["constraints", "Constraints", true],
          ["sampleInput", "Sample Input", true],
          ["sampleOutput", "Sample Output", true],
        ].map(([key, label, textarea]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">
              {label}
            </label>
            {textarea ? (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleChange}
                rows={3}
                className="w-full border px-3 py-2 rounded"
              />
            ) : (
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags
          </label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded">
            Update
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dsa")}
            className="border px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDsaProblem;
