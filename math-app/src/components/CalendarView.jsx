import { useState } from "react";
import { getDayNumber, dateKeyToDayNum, startDateKey } from "../data/curriculum";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function CalendarView({ daily, onSelectDay, onClose }) {
  const todayDayNum = getDayNumber();
  const startKey = startDateKey();
  const [startY, startM] = startKey.split("-").map(Number);
  const now = new Date();
  const [viewY, setViewY] = useState(now.getUTCFullYear());
  const [viewM, setViewM] = useState(now.getUTCMonth() + 1); // 1-12

  const canGoPrev = viewY > startY || (viewY === startY && viewM > startM);

  function shiftMonth(delta) {
    let m = viewM + delta;
    let y = viewY;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setViewY(y);
    setViewM(m);
  }

  const firstOfMonth = new Date(Date.UTC(viewY, viewM - 1, 1));
  const daysInMonth = new Date(Date.UTC(viewY, viewM, 0)).getUTCDate();
  const leadingBlanks = firstOfMonth.getUTCDay(); // 0=Sun

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => canGoPrev && shiftMonth(-1)}
            disabled={!canGoPrev}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 disabled:opacity-30"
          >
            ←
          </button>
          <p className="font-bold text-gray-800">
            {new Date(Date.UTC(viewY, viewM - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
          </p>
          <button onClick={() => shiftMonth(1)} className="w-9 h-9 rounded-full bg-gray-100 text-gray-600">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const key = `${viewY}-${pad(viewM)}-${pad(day)}`;
            const dayNum = dateKeyToDayNum(key);
            const reachable = dayNum >= 1 && dayNum <= todayDayNum;
            const count = daily[key]
              ? Object.values(daily[key]).filter(Boolean).length
              : 0;
            const isToday = dayNum === todayDayNum;

            return (
              <button
                key={i}
                disabled={!reachable}
                onClick={() => reachable && onSelectDay(dayNum, key)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                  !reachable
                    ? "text-gray-300"
                    : count === 3
                    ? "bg-green-500 text-white"
                    : count > 0
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
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
