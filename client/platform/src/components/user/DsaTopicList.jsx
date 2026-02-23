const DsaTopicList = ({ topics = [], activeTopic, onSelect }) => {
  if (!topics.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-400">
        No topics available
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Topics
      </h3>

      <ul className="space-y-2">
        {topics.map((topic) => {
          const isActive = topic === activeTopic;

          return (
            <li
              key={topic}
              onClick={() => onSelect(topic)}
              className={`px-3 py-2 rounded-lg cursor-pointer capitalize transition-all border ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border-cyan-400/40"
                  : "text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {topic}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DsaTopicList;
