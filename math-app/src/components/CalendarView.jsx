import { TASKS } from "../hooks/useDailyProgress";

// A simple grid of "Day 1, Day 2, ..." rather than a real month
// calendar — Day is tied to each profile's own completion pace, not to
// calendar dates, so a weekday/month grid no longer means anything.
export default function CalendarView({ daily, currentDay, onSelectDay, onClose }) {
  const days = Array.from({ length: currentDay }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-card w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
        <p className="font-display font-bold text-ink mb-4">All days so far</p>

        <div className="grid grid-cols-5 gap-2">
          {days.map((day) => {
            const dayProgress = daily[String(day)];
            const count = dayProgress ? TASKS.filter((t) => dayProgress[t]).length : 0;
            const isCurrent = day === currentDay;

            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                  count === TASKS.length
                    ? "bg-done text-chalk"
                    : count > 0
                    ? "bg-partial text-partial-ink"
                    : "bg-pill/50 text-sub"
                } ${isCurrent ? "ring-2 ring-amber" : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-pill/50 rounded-2xl text-ink font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
