import { useState } from "react";
import { concepts } from "../data/concepts";

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
      <p className="text-sm text-gray-400 mb-4">
        All {concepts.length} concepts in the curriculum, from middle-school geometry through intro college math (Calculus II, linear algebra, probability & statistics) — tap any to review.
      </p>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.unit}>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">
              {g.unit} · {g.level}
            </p>
            <div className="flex flex-col gap-2">
              {g.items.map((c) => {
                const open = openId === c.id;
                return (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenId(open ? null : c.id)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-gray-800">{c.title}</span>
                      <span className="text-gray-300">{open ? "−" : "+"}</span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4">
                        <ul className="flex flex-col gap-1.5 mb-3">
                          {c.explain.map((line, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-600">
                              <span className="text-indigo-400">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-indigo-50 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-800">{c.example.problem}</p>
                          <p className="text-sm text-green-700 font-semibold mt-1">
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
