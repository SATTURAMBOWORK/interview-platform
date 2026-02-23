const SubjectAttempts = ({ attempts }) => {
  if (attempts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6 text-slate-500">
        No attempts yet. Start your first test.
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Recent Attempts
      </h3>

      <div className="space-y-3">
        {attempts.map((attempt) => (
          <div
            key={attempt._id}
            className="flex justify-between items-center border-b border-slate-100 pb-3"
          >
            <span className="text-sm text-slate-600">
              {new Date(attempt.createdAt).toLocaleDateString()}
            </span>
            <span className="font-semibold text-slate-900">
              {attempt.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectAttempts;
