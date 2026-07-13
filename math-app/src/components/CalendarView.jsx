import { TASKS } from "../hooks/useDailyProgress";

// A simple grid of "Day 1, Day 2, ..." rather than a real month
// calendar — Day is tied to each profile's own completion pace, not to
// calendar dates, so a weekday/month grid no longer means anything.
export default function CalendarView({ daily, currentDay, onSelectDay, onClose }) {
  const days = Array.from({ length: currentDay }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
        <p className="font-bold text-gray-800 mb-4">All days so far</p>

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
                    ? "bg-green-500 text-white"
                    : count > 0
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                } ${isCurrent ? "ring-2 ring-indigo-500" : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 bg-gray-100 rounded-2xl text-gray-600 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
