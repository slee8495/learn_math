import { useRef, useState } from "react";

const PEN_WIDTH = 1.4;
const ERASE_HIT_DISTANCE = 16; // px — how close a tap/swipe must be to a stroke to erase it
const CANVAS_HEIGHT = 2200; // scrollable canvas — room to keep stacking work as a problem grows

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

export default function Scratchpad() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("pen"); // "pen" | "eraser"
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const strokes = useRef([]); // [{ points: [{x,y}, ...] }]
  const currentStroke = useRef(null);
  const drawing = useRef(false);
  const panY = useRef(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const sized = useRef(false);
  const ratioRef = useRef(1);

  function ensureSized() {
    if (sized.current) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    ratioRef.current = ratio;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    sized.current = true;
  }

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const ratio = ratioRef.current;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = PEN_WIDTH;
    for (const s of strokes.current) {
      if (s.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    }
  }

  function pos(touchOrMouse) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: touchOrMouse.clientX - rect.left, y: touchOrMouse.clientY - rect.top };
  }

  function eraseAt(p) {
    const before = strokes.current.length;
    strokes.current = strokes.current.filter((s) => {
      for (let i = 0; i < s.points.length - 1; i++) {
        if (distanceToSegment(p, s.points[i], s.points[i + 1]) < ERASE_HIT_DISTANCE) return false;
      }
      return true;
    });
    if (strokes.current.length !== before) redraw();
  }

  function isMultiTouch(e) {
    return e.touches && e.touches.length >= 2;
  }

  function start(e) {
    ensureSized();
    if (isMultiTouch(e)) {
      drawing.current = false;
      panY.current = e.touches[0].clientY;
      return;
    }
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const p = pos(point);
    if (modeRef.current === "eraser") {
      drawing.current = true;
      eraseAt(p);
      return;
    }
    drawing.current = true;
    currentStroke.current = { points: [p] };
  }

  function move(e) {
    if (isMultiTouch(e)) {
      e.preventDefault();
      const y = e.touches[0].clientY;
      if (panY.current != null && containerRef.current) {
        containerRef.current.scrollTop -= y - panY.current;
      }
      panY.current = y;
      return;
    }
    if (!drawing.current) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    const p = pos(point);
    if (modeRef.current === "eraser") {
      eraseAt(p);
      return;
    }
    currentStroke.current.points.push(p);
    const ctx = canvasRef.current.getContext("2d");
    const pts = currentStroke.current.points;
    const n = pts.length;
    if (n >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[n - 2].x, pts[n - 2].y);
      ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
      ctx.stroke();
    }
  }

  function end() {
    if (drawing.current && modeRef.current === "pen" && currentStroke.current) {
      strokes.current.push(currentStroke.current);
      currentStroke.current = null;
    }
    drawing.current = false;
    panY.current = null;
  }

  function clear() {
    strokes.current = [];
    redraw();
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
          className="border-b border-gray-200"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        >
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="font-bold text-gray-800 px-1">Scratchpad</p>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("pen")}
                className={`w-9 h-9 rounded-lg text-base flex items-center justify-center ${
                  mode === "pen" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                }`}
                aria-label="Pen"
              >
                ✏️
              </button>
              <button
                onClick={() => setMode("eraser")}
                className={`w-9 h-9 rounded-lg text-base flex items-center justify-center ${
                  mode === "eraser" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                }`}
                aria-label="Eraser"
              >
                🧽
              </button>
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
          <p className="text-[11px] text-gray-400 px-4 pb-1.5">
            {mode === "eraser" ? "Tap or swipe a line to erase it" : "One finger to write • two fingers to scroll"}
          </p>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto overscroll-contain">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: CANVAS_HEIGHT, touchAction: "none", display: "block" }}
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
        </div>
      </div>
    </>
  );
}
