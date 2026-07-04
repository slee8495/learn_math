// Lightweight, illustrative (not to-scale) SVG diagrams for geometry-flavored
// concepts and problems. Each renders from a small params object so the same
// renderer can be reused across many concepts/problems with different numbers.

const STROKE = "#4f46e5"; // indigo-600
const FILL = "#eef2ff"; // indigo-50
const DASHED = "#9ca3af"; // gray-400
const LABEL = "#374151"; // gray-700

function Wrap({ viewBox = "0 0 240 180", children }) {
  return (
    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-2 mb-3 flex justify-center">
      <svg viewBox={viewBox} className="w-full max-w-[260px]" style={{ overflow: "visible" }}>
        {children}
      </svg>
    </div>
  );
}

function RightTriangle({ legs = [3, 4], hyp = 5, angleLabel }) {
  const A = [30, 150]; // right angle corner
  const B = [210, 150]; // base right
  const C = [30, 30]; // top
  return (
    <Wrap>
      <polygon points={`${A} ${B} ${C}`} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <rect x={A[0]} y={A[1] - 14} width="14" height="14" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x={(A[0] + B[0]) / 2} y={A[1] + 20} textAnchor="middle" fontSize="13" fill={LABEL}>{legs[0]}</text>
      <text x={A[0] - 16} y={(A[1] + C[1]) / 2} textAnchor="middle" fontSize="13" fill={LABEL}>{legs[1]}</text>
      <text x={(B[0] + C[0]) / 2 + 14} y={(B[1] + C[1]) / 2 - 6} textAnchor="middle" fontSize="13" fill={LABEL}>{hyp}</text>
      {angleLabel && (
        <text x={B[0] - 30} y={B[1] - 10} textAnchor="middle" fontSize="12" fill={STROKE}>{angleLabel}</text>
      )}
    </Wrap>
  );
}

function SpecialRightTriangle({ kind = "45-45-90", short = "x" }) {
  const A = [30, 150];
  const B = [210, 150];
  const C = [30, 30];
  const isIso = kind === "45-45-90";
  return (
    <Wrap>
      <polygon points={`${A} ${B} ${C}`} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <rect x={A[0]} y={A[1] - 14} width="14" height="14" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x={(A[0] + B[0]) / 2} y={A[1] + 20} textAnchor="middle" fontSize="13" fill={LABEL}>{isIso ? short : short}</text>
      <text x={A[0] - 20} y={(A[1] + C[1]) / 2} textAnchor="middle" fontSize="13" fill={LABEL}>{isIso ? short : `${short}√3`}</text>
      <text x={(B[0] + C[0]) / 2 + 18} y={(B[1] + C[1]) / 2 - 6} textAnchor="middle" fontSize="13" fill={LABEL}>{isIso ? `${short}√2` : `2${short}`}</text>
      <text x={B[0] - 34} y={B[1] - 10} textAnchor="middle" fontSize="12" fill={STROKE}>{isIso ? "45°" : "30°"}</text>
      <text x={A[0] + 20} y={C[1] + 16} textAnchor="middle" fontSize="12" fill={STROKE}>{isIso ? "45°" : "60°"}</text>
    </Wrap>
  );
}

function TrigRatio({ angleLabel = "30°", opposite = "4", hyp = "h" }) {
  const A = [30, 150];
  const B = [210, 150];
  const C = [30, 30];
  return (
    <Wrap>
      <polygon points={`${A} ${B} ${C}`} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <rect x={A[0]} y={A[1] - 14} width="14" height="14" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x={A[0] - 16} y={(A[1] + C[1]) / 2} textAnchor="middle" fontSize="13" fill={LABEL}>{opposite}</text>
      <text x={(B[0] + C[0]) / 2 + 16} y={(B[1] + C[1]) / 2 - 6} textAnchor="middle" fontSize="13" fill={LABEL}>{hyp}</text>
      <text x={B[0] - 34} y={B[1] - 10} textAnchor="middle" fontSize="12" fill={STROKE}>{angleLabel}</text>
    </Wrap>
  );
}

function GenericTriangle({ sideA = "a", sideB = "b", sideC = "c", angleC }) {
  const A = [120, 20];
  const B = [20, 160];
  const C = [220, 160];
  return (
    <Wrap>
      <polygon points={`${A} ${B} ${C}`} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <text x={A[0]} y={A[1] - 8} textAnchor="middle" fontSize="13" fill={LABEL} fontWeight="600">A</text>
      <text x={B[0] - 12} y={B[1] + 16} textAnchor="middle" fontSize="13" fill={LABEL} fontWeight="600">B</text>
      <text x={C[0] + 12} y={C[1] + 16} textAnchor="middle" fontSize="13" fill={LABEL} fontWeight="600">C</text>
      <text x={(B[0] + C[0]) / 2} y={B[1] + 18} textAnchor="middle" fontSize="12" fill={LABEL}>{sideA}</text>
      <text x={(A[0] + C[0]) / 2 + 14} y={(A[1] + C[1]) / 2} textAnchor="middle" fontSize="12" fill={LABEL}>{sideB}</text>
      <text x={(A[0] + B[0]) / 2 - 14} y={(A[1] + B[1]) / 2} textAnchor="middle" fontSize="12" fill={LABEL}>{sideC}</text>
      {angleC && <text x={C[0] - 26} y={C[1] - 10} textAnchor="middle" fontSize="11" fill={STROKE}>{angleC}</text>}
    </Wrap>
  );
}

function CircleShape({ radius = "r", sectorDeg }) {
  const cx = 120, cy = 100, r = 70;
  const showSector = typeof sectorDeg === "number";
  const rad = ((sectorDeg || 0) * Math.PI) / 180;
  const ex = cx + r * Math.cos(-rad);
  const ey = cy + r * Math.sin(-rad);
  return (
    <Wrap viewBox="0 0 240 200">
      <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth="2" />
      {showSector && (
        <path d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${sectorDeg > 180 ? 1 : 0} 0 ${ex} ${ey} Z`} fill="#c7d2fe" stroke={STROKE} strokeWidth="1.5" />
      )}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={STROKE} strokeWidth="1.5" />
      <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fontSize="13" fill={LABEL}>{radius}</text>
      <circle cx={cx} cy={cy} r="2.5" fill={STROKE} />
      {showSector && (
        <text x={cx + 20} y={cy - 20} textAnchor="middle" fontSize="12" fill={STROKE}>{sectorDeg}°</text>
      )}
    </Wrap>
  );
}

function Box({ l = 4, w = 3, h = 5 }) {
  // simple isometric-ish box
  const ox = 60, oy = 130; // front-bottom-left
  const fw = 110, fh = 80; // front face width/height
  const dx = 40, dy = -30; // depth offset
  const p = {
    flb: [ox, oy], frb: [ox + fw, oy], flt: [ox, oy - fh], frt: [ox + fw, oy - fh],
    blb: [ox + dx, oy + dy], brb: [ox + fw + dx, oy + dy], blt: [ox + dx, oy - fh + dy], brt: [ox + fw + dx, oy - fh + dy],
  };
  return (
    <Wrap>
      <polygon points={`${p.blt} ${p.brt} ${p.frt} ${p.flt}`} fill="#c7d2fe" stroke={STROKE} strokeWidth="1.5" />
      <polygon points={`${p.brt} ${p.brb} ${p.frb} ${p.frt}`} fill="#dbeafe" stroke={STROKE} strokeWidth="1.5" />
      <polygon points={`${p.flt} ${p.frt} ${p.frb} ${p.flb}`} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <text x={(p.flb[0] + p.frb[0]) / 2} y={oy + 18} textAnchor="middle" fontSize="12" fill={LABEL}>{l}</text>
      <text x={ox - 14} y={(oy + oy - fh) / 2} textAnchor="middle" fontSize="12" fill={LABEL}>{h}</text>
      <text x={(p.frb[0] + p.brb[0]) / 2 + 6} y={(oy + oy + dy) / 2 + 14} textAnchor="middle" fontSize="12" fill={LABEL}>{w}</text>
    </Wrap>
  );
}

function Cylinder({ r = 3, h = 5 }) {
  const cx = 120, top = 40, bottom = 140, rx = 55, ry = 16;
  return (
    <Wrap>
      <path d={`M ${cx - rx} ${top} A ${rx} ${ry} 0 0 0 ${cx + rx} ${top}`} fill="none" stroke={STROKE} strokeWidth="2" />
      <line x1={cx - rx} y1={top} x2={cx - rx} y2={bottom} stroke={STROKE} strokeWidth="2" />
      <line x1={cx + rx} y1={top} x2={cx + rx} y2={bottom} stroke={STROKE} strokeWidth="2" />
      <path d={`M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}`} fill="none" stroke={STROKE} strokeWidth="2" />
      <path d={`M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bottom}`} fill={FILL} stroke={STROKE} strokeWidth="2" strokeDasharray="3 2" />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <line x1={cx} y1={top} x2={cx + rx} y2={top} stroke={STROKE} strokeWidth="1.5" />
      <text x={cx + rx / 2} y={top - 8} textAnchor="middle" fontSize="12" fill={LABEL}>{r}</text>
      <line x1={cx + rx + 14} y1={top} x2={cx + rx + 14} y2={bottom} stroke={DASHED} strokeWidth="1" />
      <text x={cx + rx + 26} y={(top + bottom) / 2} textAnchor="middle" fontSize="12" fill={LABEL}>{h}</text>
    </Wrap>
  );
}

function Cone({ r = 3, h = 4 }) {
  const cx = 120, apex = 30, base = 140, rx = 55, ry = 16;
  return (
    <Wrap>
      <line x1={cx} y1={apex} x2={cx - rx} y2={base} stroke={STROKE} strokeWidth="2" />
      <line x1={cx} y1={apex} x2={cx + rx} y2={base} stroke={STROKE} strokeWidth="2" />
      <path d={`M ${cx - rx} ${base} A ${rx} ${ry} 0 0 0 ${cx + rx} ${base}`} fill="none" stroke={STROKE} strokeWidth="2" />
      <path d={`M ${cx - rx} ${base} A ${rx} ${ry} 0 0 1 ${cx + rx} ${base}`} fill={FILL} stroke={STROKE} strokeWidth="2" strokeDasharray="3 2" />
      <line x1={cx} y1={apex} x2={cx} y2={base} stroke={DASHED} strokeWidth="1" strokeDasharray="3 2" />
      <text x={cx - 12} y={(apex + base) / 2} textAnchor="middle" fontSize="12" fill={LABEL}>{h}</text>
      <line x1={cx} y1={base} x2={cx + rx} y2={base} stroke={STROKE} strokeWidth="1.5" />
      <text x={cx + rx / 2} y={base + 16} textAnchor="middle" fontSize="12" fill={LABEL}>{r}</text>
    </Wrap>
  );
}

function Sphere({ r = 5 }) {
  const cx = 120, cy = 100, radius = 65;
  return (
    <Wrap>
      <circle cx={cx} cy={cy} r={radius} fill={FILL} stroke={STROKE} strokeWidth="2" />
      <ellipse cx={cx} cy={cy} rx={radius} ry={radius / 3.2} fill="none" stroke={STROKE} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke={STROKE} strokeWidth="1.5" />
      <text x={cx + radius / 2} y={cy - 8} textAnchor="middle" fontSize="13" fill={LABEL}>{r}</text>
      <circle cx={cx} cy={cy} r="2.5" fill={STROKE} />
    </Wrap>
  );
}

function CoordinatePlane({ points = [], segment, quadrantHighlight }) {
  const cx = 120, cy = 100;
  const allCoords = [
    ...points.map((p) => [p.x, p.y]),
    ...(segment ? segment : []),
  ].flat();
  const maxAbs = Math.max(1, ...allCoords.map((n) => Math.abs(n)));
  const scale = Math.min(16, Math.max(6, 90 / maxAbs));
  const toXY = (x, y) => [cx + x * scale, cy - y * scale];
  const quads = {
    I: [cx, 20, cx + 100, cy], II: [20, 20, cx, cy],
    III: [20, cy, cx, 180], IV: [cx, cy, cx + 100, 180],
  };
  return (
    <Wrap>
      {quadrantHighlight && quads[quadrantHighlight] && (
        <rect
          x={quads[quadrantHighlight][0]} y={quads[quadrantHighlight][1]}
          width={quads[quadrantHighlight][2] - quads[quadrantHighlight][0]}
          height={quads[quadrantHighlight][3] - quads[quadrantHighlight][1]}
          fill="#c7d2fe"
        />
      )}
      <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
      {segment && (() => {
        const [p1, p2] = segment;
        const [x1, y1] = toXY(p1[0], p1[1]);
        const [x2, y2] = toXY(p2[0], p2[1]);
        return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="2" strokeDasharray="4 3" />;
      })()}
      {points.map((p, i) => {
        const [x, y] = toXY(p.x, p.y);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill={STROKE} />
            <text x={x + 8} y={y - 8} fontSize="12" fill={LABEL}>{p.label || `(${p.x}, ${p.y})`}</text>
          </g>
        );
      })}
    </Wrap>
  );
}

function Parabola({ direction = "up", vertexLabel = "vertex" }) {
  const cx = 120, cy = 100;
  const path = direction === "up"
    ? `M 30 170 Q 120 -10 210 170`
    : `M 30 30 Q 120 210 210 30`;
  const vy = direction === "up" ? cy + 40 : cy - 40;
  return (
    <Wrap>
      <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
      <path d={path} fill="none" stroke={STROKE} strokeWidth="2.5" />
      <circle cx={cx} cy={direction === "up" ? cy + 40 : cy - 40} r="3.5" fill={STROKE} />
      <text x={cx + 10} y={vy - (direction === "up" ? -16 : 16)} fontSize="11" fill={LABEL}>{vertexLabel}</text>
    </Wrap>
  );
}

function UnitCircleDiagram({ angleDeg = 90 }) {
  const cx = 120, cy = 100, r = 65;
  const rad = (angleDeg * Math.PI) / 180;
  const ex = cx + r * Math.cos(-rad);
  const ey = cy + r * Math.sin(-rad);
  return (
    <Wrap viewBox="0 0 240 200">
      <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={STROKE} strokeWidth="2" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={STROKE} strokeWidth="2" />
      <path d={`M ${cx + 20} ${cy} A 20 20 0 ${angleDeg > 180 ? 1 : 0} 0 ${cx + 20 * Math.cos(-rad)} ${cy + 20 * Math.sin(-rad)}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx={ex} cy={ey} r="3.5" fill={STROKE} />
      <text x={cx + 30} y={cy - 26} fontSize="12" fill="#b45309">{angleDeg}°</text>
    </Wrap>
  );
}

function SineCosineGraph({ which = "sin" }) {
  const cx = 30, cy = 100, w = 180, amp = 60;
  let d = `M ${cx} ${cy - (which === "cos" ? amp : 0)}`;
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * 4 * Math.PI;
    const x = cx + (i / 100) * w;
    const y = cy - amp * (which === "cos" ? Math.cos(t) : Math.sin(t));
    d += ` L ${x} ${y}`;
  }
  return (
    <Wrap>
      <line x1={cx} y1={cy} x2={cx + w} y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1={cy - amp - 10} x2={cx} y2={cy + amp + 10} stroke="#9ca3af" strokeWidth="1.5" />
      <path d={d} fill="none" stroke={STROKE} strokeWidth="2.5" />
      <text x={cx - 18} y={cy - amp} fontSize="11" fill={LABEL}>1</text>
      <text x={cx - 18} y={cy + amp + 4} fontSize="11" fill={LABEL}>−1</text>
    </Wrap>
  );
}

function Conic({ kind = "ellipse" }) {
  const cx = 120, cy = 100;
  if (kind === "hyperbola") {
    return (
      <Wrap>
        <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
        <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
        <path d={`M ${cx + 25} 30 Q ${cx + 55} 100 ${cx + 25} 170`} fill="none" stroke={STROKE} strokeWidth="2.5" />
        <path d={`M ${cx - 25} 30 Q ${cx - 55} 100 ${cx - 25} 170`} fill="none" stroke={STROKE} strokeWidth="2.5" />
        <line x1={cx - 70} y1={30} x2={cx + 70} y2={170} stroke={DASHED} strokeWidth="1" strokeDasharray="3 2" />
        <line x1={cx - 70} y1={170} x2={cx + 70} y2={30} stroke={DASHED} strokeWidth="1" strokeDasharray="3 2" />
      </Wrap>
    );
  }
  return (
    <Wrap>
      <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy} rx={kind === "circle" ? 60 : 85} ry={60} fill={FILL} stroke={STROKE} strokeWidth="2.5" />
    </Wrap>
  );
}

function Vector({ x = 3, y = 4 }) {
  const cx = 40, cy = 160, scale = 22;
  const ex = cx + x * scale, ey = cy - y * scale;
  return (
    <Wrap>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={STROKE} />
        </marker>
      </defs>
      <line x1="20" y1={cy} x2="220" y2={cy} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="180" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={STROKE} strokeWidth="2.5" markerEnd="url(#arrowhead)" />
      <text x={ex + 8} y={ey - 4} fontSize="12" fill={LABEL}>⟨{x}, {y}⟩</text>
    </Wrap>
  );
}

export default function Diagram({ type, ...params }) {
  switch (type) {
    case "rightTriangle": return <RightTriangle {...params} />;
    case "specialRightTriangle": return <SpecialRightTriangle {...params} />;
    case "trigRatio": return <TrigRatio {...params} />;
    case "triangle": return <GenericTriangle {...params} />;
    case "circle": return <CircleShape {...params} />;
    case "box": return <Box {...params} />;
    case "cylinder": return <Cylinder {...params} />;
    case "cone": return <Cone {...params} />;
    case "sphere": return <Sphere {...params} />;
    case "coordinatePlane": return <CoordinatePlane {...params} />;
    case "parabola": return <Parabola {...params} />;
    case "unitCircle": return <UnitCircleDiagram {...params} />;
    case "sineCosine": return <SineCosineGraph {...params} />;
    case "conic": return <Conic {...params} />;
    case "vector": return <Vector {...params} />;
    default: return null;
  }
}
