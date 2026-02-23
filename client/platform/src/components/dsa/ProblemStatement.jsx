const ProblemStatement = ({ problem }) => {
  if (!problem) {
    return (
      <div className="p-6 text-slate-500">
        Problem not found.
      </div>
    );
  }

  // 🔑 Normalize constraints to array
  let constraints = [];
  if (Array.isArray(problem.constraints)) {
    constraints = problem.constraints;
  } else if (typeof problem.constraints === "string") {
    constraints = problem.constraints
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  return (
    <div className="p-6 text-slate-300 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-white">{problem.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${
              problem.difficulty === "Easy"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : problem.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
          {(problem.tags || []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-xs rounded-full bg-white/5 text-slate-400 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Problem Description</h2>
        <p className="leading-relaxed text-slate-300 whitespace-pre-line text-sm">
          {problem.description}
        </p>
      </section>

      {/* Examples */}
      {problem.visibleTestCases?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Examples</h2>
          {problem.visibleTestCases.map((tc, index) => (
            <div
              key={index}
              className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-sm border border-slate-800"
            >
              <div className="text-slate-300 mb-2">Example {index + 1}</div>
              <div>
                <strong className="text-slate-200">Input:</strong> {tc.input}
              </div>
              <div className="mt-1">
                <strong className="text-slate-200">Output:</strong> {Array.isArray(tc.expectedOutput) ? tc.expectedOutput.join(" | ") : tc.expectedOutput}
              </div>
              {tc.explanation && (
                <div className="mt-2 text-slate-300">
                  <strong className="text-slate-200">Explanation:</strong> {tc.explanation}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Sample IO */}
      {(problem.sampleInput || problem.sampleOutput) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl border border-white/[0.06] p-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Sample Input</h3>
            <pre className="mt-2 text-sm text-slate-300 font-mono whitespace-pre-wrap">{problem.sampleInput || "—"}</pre>
          </div>
          <div className="bg-black/30 rounded-xl border border-white/[0.06] p-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Sample Output</h3>
            <pre className="mt-2 text-sm text-slate-300 font-mono whitespace-pre-wrap">{problem.sampleOutput || "—"}</pre>
          </div>
        </section>
      )}

      {/* Constraints */}
      {constraints.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Constraints</h2>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 font-mono">
            {constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ProblemStatement;
