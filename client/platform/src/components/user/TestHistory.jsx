import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchMyAttempts } from "../../services/attemptService";

const TestHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAttempts()
      .then((res) => setAttempts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading test history...</p>;
  if (!attempts.length) return <p className="text-slate-500">No tests attempted yet.</p>;

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Test History</h3>
        <span className="text-xs uppercase tracking-widest text-slate-500">Recent</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Subject</th>
              <th className="py-2">Score</th>
              <th className="py-2">Accuracy</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.map((a) => (
              <tr
                key={a._id}
                onClick={() => a.status === "completed" && navigate(`/attempt/${a._id}`)}
                className={`transition ${
                  a.status === "completed"
                    ? "cursor-pointer hover:bg-slate-50"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                <td className="py-3 font-medium text-slate-900">{a.subject?.name || "—"}</td>
                <td className="py-3">{a.score ?? "—"}</td>
                <td className="py-3">
                  {typeof a.accuracy === "number" ? `${a.accuracy.toFixed(1)}%` : "—"}
                </td>
                <td className="py-3">
                  {a.status === "in-progress" ? "⏳ In Progress" : "✅ Completed"}
                </td>
                <td className="py-3 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestHistory;
