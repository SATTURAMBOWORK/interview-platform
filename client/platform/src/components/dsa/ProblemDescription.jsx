const ProblemDescription = ({ problem }) => {
  const constraints = Array.isArray(problem.constraints)
    ? problem.constraints
    : typeof problem.constraints === "string"
    ? problem.constraints.split("\n")
    : [];

  return (
    <div className="p-6 text-gray-800 leading-relaxed">
      <h1 className="text-2xl font-semibold mb-2">{problem.title}</h1>

      <span
        className={`inline-block mb-6 px-3 py-1 text-xs rounded-full ${
          problem.difficulty === "Easy"
            ? "bg-green-100 text-green-700"
            : problem.difficulty === "Medium"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {problem.difficulty}
      </span>

      <p className="mb-6 whitespace-pre-line">
        {problem.description}
      </p>

      <h2 className="font-semibold mb-2">Examples</h2>
      {problem.visibleTestCases.map((tc, i) => (
        <pre
          key={i}
          className="bg-gray-100 rounded p-4 mb-4 text-sm"
        >
Input: {tc.input}
Output: {tc.output}
        </pre>
      ))}

      {constraints.length > 0 && (
        <>
          <h2 className="font-semibold mt-6 mb-2">Constraints</h2>
          <ul className="list-disc list-inside text-sm">
            {constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProblemDescription;
