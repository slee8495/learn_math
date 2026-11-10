import { useEffect, useImperativeHandle, useRef, useState } from "react";
import Sheet from "./Sheet.jsx";
import { useT } from "../lib/i18n.js";

const PEN_WIDTH = 1.6;
const ERASE_HIT_DISTANCE = 16; // px — how close a touch must be to a stroke to erase it
const CANVAS_HEIGHT = 2400; // tall, scrollable page so work can keep stacking down

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function loadStrokes(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveStrokes(key, strokes) {
  try {
    localStorage.setItem(key, JSON.stringify(strokes));
  } catch {
    // storage full or unavailable: the drawing still lives for this visit
  }
}

function drawStrokes(ctx, strokes, offsetX = 0, offsetY = 0) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = PEN_WIDTH;
  for (const s of strokes) {
    if (s.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(s[0][0] - offsetX, s[0][1] - offsetY);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0] - offsetX, s[i][1] - offsetY);
    ctx.stroke();
  }
}

// Handwriting scratchpad, one page per problem (storageKey), kept on the device.
// One finger (or Apple Pencil) writes, two fingers scroll. The parent can grab
// a cropped image of the work via ref.exportImage() to show the tutor.
// docked: drawn in place (beside the problem on wide screens) instead of in a sheet.
export default function Scratchpad({ open, onClose, storageKey, ref, onAttach, attachLabel, docked = false }) {
  const { t } = useT();
  const [mode, setMode] = useState("pen");
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const strokes = useRef([]); // [[[x, y], ...], ...]
  const current = useRef(null);
  const pointers = useRef(new Map());
  const panY = useRef(null);
  const ratio = useRef(1);
  const rect = useRef(null); // canvas position, read once per stroke instead of on every move

  // desynchronized: draw straight to the screen, skipping a frame of compositor latency where supported
  const context = () => canvasRef.current.getContext("2d", { desynchronized: true });

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = context();
    ctx.setTransform(ratio.current, 0, 0, ratio.current, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStrokes(ctx, strokes.current);
  }

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.getBoundingClientRect().width;
    if (!width) return;
    ratio.current = window.devicePixelRatio || 1;
    canvas.width = width * ratio.current;
    canvas.height = CANVAS_HEIGHT * ratio.current;
    redraw();
  }

  useEffect(() => {
    strokes.current = loadStrokes(storageKey);
    resize();
  }, [storageKey]);

  useEffect(() => {
    if (open || docked) resize();
  }, [open, docked]);

  // Turning an iPad (or Split View) changes the width; refit the canvas so ink doesn't stretch.
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // iPadOS reads Apple Pencil on a web page as Scribble / text selection first and
  // holds the pointer events back, so the pen lags. Claiming the touches stops that.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stop = (e) => e.preventDefault();
    canvas.addEventListener("touchstart", stop, { passive: false });
    canvas.addEventListener("touchmove", stop, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", stop);
      canvas.removeEventListener("touchmove", stop);
    };
  }, [docked]);

  // Crop to the written area on a white background, small enough to send.
  function exportCropped() {
    const all = strokes.current.flat();
    if (!all.length) return null;
    const pad = 16;
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]);
    const minX = Math.max(0, Math.min(...xs) - pad);
    const minY = Math.max(0, Math.min(...ys) - pad);
    const w = Math.max(...xs) + pad - minX;
    const h = Math.max(...ys) + pad - minY;
    const scale = Math.min(2, 1200 / w, 1600 / h);
    const out = document.createElement("canvas");
    out.width = Math.round(w * scale);
    out.height = Math.round(h * scale);
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.scale(scale, scale);
    drawStrokes(ctx, strokes.current, minX, minY);
    return out.toDataURL("image/jpeg", 0.85);
  }

  useImperativeHandle(ref, () => ({
    hasWork: () => strokes.current.length > 0,
    exportImage: exportCropped,
  }));

  function pos(e) {
    const r = rect.current || canvasRef.current.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10];
  }

  function eraseAt(p) {
    const before = strokes.current.length;
    strokes.current = strokes.current.filter((s) => {
      for (let i = 0; i < s.length - 1; i++) {
        const a = { x: s[i][0], y: s[i][1] };
        const b = { x: s[i + 1][0], y: s[i + 1][1] };
        if (distanceToSegment({ x: p[0], y: p[1] }, a, b) < ERASE_HIT_DISTANCE) return false;
      }
      return true;
    });
    if (strokes.current.length !== before) {
      redraw();
      saveStrokes(storageKey, strokes.current);
    }
  }

  function avgY() {
    const ys = [...pointers.current.values()].map((p) => p.y);
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  }

  function down(e) {
    canvasRef.current.setPointerCapture?.(e.pointerId);
    rect.current = canvasRef.current.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2) {
      // second finger: this is a scroll, drop the stroke the first finger began
      current.current = null;
      redraw();
      panY.current = avgY();
      return;
    }
    const p = pos(e);
    if (mode === "eraser") eraseAt(p);
    else current.current = [p];
  }

  function move(e) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2) {
      const y = avgY();
      if (panY.current != null) scrollRef.current.scrollTop -= y - panY.current;
      panY.current = y;
      rect.current = null;
      return;
    }
    if (mode === "eraser") {
      eraseAt(pos(e));
      return;
    }
    const s = current.current;
    if (!s) return;
    // The Pencil reports up to 240 points a second but moves arrive once a frame;
    // the in-between points come as coalesced events.
    const events = e.nativeEvent.getCoalescedEvents?.() || [];
    const from = s.length - 1;
    for (const ev of events.length ? events : [e]) s.push(pos(ev));
    const ctx = context();
    ctx.setTransform(ratio.current, 0, 0, ratio.current, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = PEN_WIDTH;
    ctx.beginPath();
    ctx.moveTo(s[from][0], s[from][1]);
    for (let i = from + 1; i < s.length; i++) ctx.lineTo(s[i][0], s[i][1]);
    ctx.stroke();
  }

  function up(e) {
    pointers.current.delete(e.pointerId);
    rect.current = null;
    if (pointers.current.size === 0) panY.current = null;
    if (current.current && current.current.length > 1) {
      strokes.current.push(current.current);
      saveStrokes(storageKey, strokes.current);
    }
    current.current = null;
  }

  function undo() {
    strokes.current.pop();
    redraw();
    saveStrokes(storageKey, strokes.current);
  }

  function clear() {
    strokes.current = [];
    redraw();
    saveStrokes(storageKey, strokes.current);
  }

  const tool = (active) =>
    `rounded-full px-3 py-1.5 text-sm ${active ? "bg-neutral-900 text-white" : "border border-neutral-300"}`;

  const attach =
    onAttach && (
      <button
        onClick={() => {
          const img = strokes.current.length ? exportCropped() : null;
          if (img) onAttach(img);
        }}
        className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium"
      >
        {attachLabel || t("attach")}
      </button>
    );

  const page = (
    <>
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-2">
        <button className={tool(mode === "pen")} onClick={() => setMode("pen")}>
          {t("pen")}
        </button>
        <button className={tool(mode === "eraser")} onClick={() => setMode("eraser")}>
          {t("eraser")}
        </button>
        <button className={tool(false)} onClick={undo}>
          {t("undo")}
        </button>
        <button className={`${tool(false)} ml-auto`} onClick={clear}>
          {t("clear")}
        </button>
      </div>
      <p className="px-4 py-1 text-[11px] text-neutral-400">{t("scratchTip")}</p>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: CANVAS_HEIGHT,
            touchAction: "none",
            display: "block",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
    </>
  );

  if (docked) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-2">
          <p className="font-semibold">{t("scratch")}</p>
          {attach}
        </div>
        {page}
      </div>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={t("scratch")} actions={attach}>
      {page}
    </Sheet>
  );
}
