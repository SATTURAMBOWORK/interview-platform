import { useState } from "react";

const ResizableSplit = ({ left, right }) => {
  const [leftWidth, setLeftWidth] = useState(50);

  const onDrag = (e) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 30 && newWidth < 70) {
      setLeftWidth(newWidth);
    }
  };

  return (
    <div className="flex h-full">
      <div
        className="h-full bg-white/80 backdrop-blur overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      <div
        onMouseDown={() => {
          window.addEventListener("mousemove", onDrag);
          window.addEventListener(
            "mouseup",
            () => {
              window.removeEventListener("mousemove", onDrag);
            },
            { once: true }
          );
        }}
        className="w-2 cursor-col-resize bg-slate-200 hover:bg-indigo-500 transition-colors"
      />

      <div
        className="h-full bg-[#0b1220]"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};

export default ResizableSplit;
