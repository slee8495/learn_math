import { getDayLesson } from "../data/curriculum";

function getTasks(isQuiz) {
  return [
    { id: "concept", icon: "💡", label: "Concept" },
    { id: "problem", icon: "✏️", label: isQuiz ? "Review Quiz" : "Practice Problems" },
    { id: "solution", icon: "✅", label: "Solution Walkthrough" },
  ];
}

export default function DayTaskPicker({ dayNum, isTaskDone, onPick, onClose }) {
  const lesson = getDayLesson(dayNum);
  const dayKey = String(dayNum);
  const tasks = getTasks(lesson.isQuiz);

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-card w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5">
        <p className="text-sm text-sub mb-1">Day {dayNum}</p>
        <h3 className="text-lg font-display font-bold text-ink mb-4">{lesson.concept.title}</h3>

        <div className="flex flex-col gap-2 mb-4">
          {tasks.map((t) => {
            const done = isTaskDone(t.id, dayKey);
            return (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                className="flex items-center gap-3 bg-pill/30 border border-card-border rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="flex-1 font-medium text-ink">{t.label}</span>
                {done && <span className="text-done">✓</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-pill/50 rounded-2xl text-ink font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
