import { getDayLesson } from "../data/curriculum";

const TASKS = [
  { id: "concept", icon: "💡", label: "Concept" },
  { id: "problem", icon: "✏️", label: "Practice Problems" },
  { id: "solution", icon: "✅", label: "Solution Walkthrough" },
];

export default function DayTaskPicker({ dayNum, isTaskDone, dateKeyStr, onPick, onClose }) {
  const lesson = getDayLesson(dayNum);

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5">
        <p className="text-sm text-gray-400 mb-1">Day {dayNum}</p>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{lesson.concept.title}</h3>

        <div className="flex flex-col gap-2 mb-4">
          {TASKS.map((t) => {
            const done = isTaskDone(t.id, dateKeyStr);
            return (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="flex-1 font-medium text-gray-700">{t.label}</span>
                {done && <span className="text-green-500">✓</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 rounded-2xl text-gray-600 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
