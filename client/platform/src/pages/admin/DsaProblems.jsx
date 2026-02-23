import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function DsaProblems() {
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
    return <div className="p-6">Loading DSA problems...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          DSA Problems
        </h1>

        <button
          onClick={() => navigate("/admin/dsa/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add DSA Problem
        </button>
      </div>

      {/* TABLE */}
      {problems.length === 0 ? (
        <p className="text-gray-500">
          No DSA problems added yet.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Title
                </th>
                <th className="px-4 py-3 text-left">
                  Difficulty
                </th>
                <th className="px-4 py-3 text-left">
                  Tags
                </th>
                <th className="px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {problems.map((problem) => (
                <tr
                  key={problem._id}
                  className="border-t"
                >
                  <td className="px-4 py-3 font-medium">
                    {problem.title}
                  </td>

                  <td className="px-4 py-3">
                    {problem.difficulty}
                  </td>

                  <td className="px-4 py-3">
                    {problem.tags?.length
                      ? problem.tags.join(", ")
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-4">
                      {/* EDIT */}
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/dsa/edit/${problem._id}`
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          handleDelete(problem._id)
                        }
                        className="text-red-600 hover:underline"
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
