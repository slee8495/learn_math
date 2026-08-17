import { useState } from "react";
import { concepts } from "../data/concepts";
import Diagram from "./Diagram";

function groupByUnit(list) {
  const groups = [];
  for (const c of list) {
    let g = groups.find((g) => g.unit === c.unit);
    if (!g) {
      g = { unit: c.unit, level: c.level, items: [] };
      groups.push(g);
    }
    g.items.push(c);
  }
  return groups;
}

export default function ConceptLibrary() {
  const [openId, setOpenId] = useState(null);
  const groups = groupByUnit(concepts);

  return (
    <div className="px-4 pt-4 pb-6">
      <p className="text-sm text-sub mb-4">
        All {concepts.length} concepts in the curriculum, from middle-school geometry through intro college math (Calculus II, linear algebra, probability & statistics) — tap any to review.
      </p>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.unit}>
            <p className="text-xs font-mono font-semibold text-accent uppercase tracking-wide mb-2">
              {g.unit} · {g.level}
            </p>
            <div className="flex flex-col gap-2">
              {g.items.map((c) => {
                const open = openId === c.id;
                return (
                  <div key={c.id} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenId(open ? null : c.id)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-display font-medium text-ink">{c.title}</span>
                      <span className="text-sub/60">{open ? "−" : "+"}</span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4">
                        <ul className="flex flex-col gap-1.5 mb-3">
                          {c.explain.map((line, i) => (
                            <li key={i} className="flex gap-2 text-sm text-ink/80">
                              <span className="text-accent">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-pill/40 rounded-xl p-3">
                          {c.example.diagram && <Diagram {...c.example.diagram} />}
                          <p className="text-sm font-medium text-ink">{c.example.problem}</p>
                          <p className="text-sm text-done font-semibold mt-1">
                            Answer: {c.example.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
