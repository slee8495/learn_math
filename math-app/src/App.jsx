import { useState } from "react";
import { useDailyProgress } from "./hooks/useDailyProgress";
import { getDayNumber, dayNumToDateKey } from "./data/curriculum";
import Home from "./components/Home";
import DailyLesson from "./components/DailyLesson";
import ConceptLibrary from "./components/ConceptLibrary";
import CalendarView from "./components/CalendarView";
import DayTaskPicker from "./components/DayTaskPicker";

const BOTTOM_TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "library", icon: "📚", label: "Concepts" },
];

const TASK_LABEL = {
  concept: "Concept",
  problem: "Practice Problems",
  solution: "Solution Walkthrough",
};

export default function App() {
  const [tab, setTab] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null); // { task, dayNum }
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dayPicker, setDayPicker] = useState(null); // { dayNum, dateKeyStr }

  const { daily, markTask, isTaskDone, getTodayDone, getStreak, getWeekStatus, dateKey } =
    useDailyProgress();

  const todayDone = getTodayDone();
  const streak = getStreak();
  const weekStatus = getWeekStatus();

  function handleNavigate(task, dayNum = getDayNumber()) {
    setActiveLesson({ task, dayNum });
  }

  function handleTaskDone() {
    const { task, dayNum } = activeLesson;
    const key = dayNum === getDayNumber() ? dateKey() : dayNumToDateKey(dayNum);
    markTask(task, key);
    setActiveLesson(null);
  }

  function handleSelectCalendarDay(dayNum, dateKeyStr) {
    setCalendarOpen(false);
    setDayPicker({ dayNum, dateKeyStr });
  }

  function handlePickDayTask(task) {
    setActiveLesson({ task, dayNum: dayPicker.dayNum });
    setDayPicker(null);
  }

  if (activeLesson) {
    const isToday = activeLesson.dayNum === getDayNumber();
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setActiveLesson(null)} className="text-gray-400 text-2xl leading-none">
              ←
            </button>
            <div>
              <p className="font-semibold text-gray-800">{TASK_LABEL[activeLesson.task]}</p>
              {!isToday && <p className="text-xs text-indigo-500">Day {activeLesson.dayNum} review</p>}
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto">
          <DailyLesson task={activeLesson.task} dayNum={activeLesson.dayNum} onDone={handleTaskDone} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800">
            {tab === "home" && "📐 Daily Math"}
            {tab === "library" && "Concept Library"}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {tab === "home" && (
          <Home
            onNavigate={handleNavigate}
            onOpenCalendar={() => setCalendarOpen(true)}
            isTaskDone={isTaskDone}
            todayDone={todayDone}
            streak={streak}
            weekStatus={weekStatus}
          />
        )}
        {tab === "library" && <ConceptLibrary />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-lg mx-auto flex">
          {BOTTOM_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${
                tab === t.id ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {calendarOpen && (
        <CalendarView daily={daily} onSelectDay={handleSelectCalendarDay} onClose={() => setCalendarOpen(false)} />
      )}
      {dayPicker && (
        <DayTaskPicker
          dayNum={dayPicker.dayNum}
          dateKeyStr={dayPicker.dateKeyStr}
          isTaskDone={isTaskDone}
          onPick={handlePickDayTask}
          onClose={() => setDayPicker(null)}
        />
      )}
    </div>
  );
}
