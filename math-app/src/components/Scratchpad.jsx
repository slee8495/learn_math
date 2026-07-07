import { useRef, useState, useEffect } from "react";

export default function Scratchpad() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const sized = useRef(false);

  useEffect(() => {
    if (!open || sized.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    sized.current = true;
  }, [open]);

  function pos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing.current = true;
    last.current = pos(e);
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-amber-500 text-white text-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open scratchpad"
      >
        ✏️
      </button>

      <div
        className={`fixed inset-0 bg-white z-50 flex flex-col transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="flex items-center justify-between p-3 border-b border-gray-200"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        >
          <p className="font-bold text-gray-800 px-1">Scratchpad</p>
          <div className="flex gap-2">
            <button onClick={clear} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="flex-1 w-full"
          style={{ touchAction: "none" }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
    </>
  );
}
