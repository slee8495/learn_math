import { useState } from "react";
import { useDailyProgress, getStoredProfile, setStoredProfile } from "./hooks/useDailyProgress";
import { useUserAnswers } from "./hooks/useUserAnswers";
import { getDayLesson } from "./data/curriculum";
import Home from "./components/Home";
import DailyLesson from "./components/DailyLesson";
import ConceptLibrary from "./components/ConceptLibrary";
import CalendarView from "./components/CalendarView";
import ChatWidget from "./components/ChatWidget";
import Scratchpad from "./components/Scratchpad";

const BOTTOM_TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "library", icon: "📚", label: "Concepts" },
];

const TASK_LABEL = {
  concept: "Concept",
  problem: "Practice Problems",
  solution: "Solution Walkthrough",
};

function ProfileSetup({ onDone }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setStoredProfile(trimmed);
    onDone(trimmed);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <p className="text-6xl mb-4">📐</p>
        <h1 className="text-3xl font-bold text-white">Daily Math</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={12}
          autoFocus
          className="w-full px-4 py-4 rounded-2xl text-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-4 bg-white text-indigo-700 font-bold text-lg rounded-2xl disabled:opacity-40 active:scale-95 transition-transform"
        >
          Start →
        </button>
      </form>

      <p className="text-indigo-300 text-xs mt-8 text-center">
        Same link, different name — each person's progress is tracked separately
      </p>
    </div>
  );
}

function MainApp({ profile, onSwitchProfile }) {
  const [tab, setTab] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null); // { task, dayNum }
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewedDay, setViewedDay] = useState(null); // non-null while browsing a past day on Home

  const { daily, markTask, isTaskDone, getDoneCount, getCurrentDay, getStreak, getRecentStatus } =
    useDailyProgress(profile);
  const { getAnswer, setAnswer } = useUserAnswers(profile);

  const currentDay = getCurrentDay();
  const displayDay = viewedDay ?? currentDay;
  const todayDone = getDoneCount(String(displayDay));
  const streak = getStreak();
  const recentStatus = getRecentStatus();
  const isPastView = viewedDay !== null && viewedDay !== currentDay;

  function handleNavigate(task, dayNum = displayDay) {
    setActiveLesson({ task, dayNum });
  }

  function handleTaskDone() {
    const { task, dayNum } = activeLesson;
    markTask(task, String(dayNum));
    setActiveLesson(null);
  }

  function handleSelectCalendarDay(dayNum) {
    setCalendarOpen(false);
    setViewedDay(dayNum);
  }

  if (activeLesson) {
    const isCurrent = activeLesson.dayNum === currentDay;
    const lesson = getDayLesson(activeLesson.dayNum);
    const chatContext = {
      profile,
      view: activeLesson.task,
      dayNum: activeLesson.dayNum,
      isReview: lesson.isReview,
      concept: lesson.concept,
      problems: lesson.problems,
    };
    return (
      <div className="min-h-screen bg-gray-50">
        <header
          className="bg-white border-b border-gray-200 sticky top-0 z-10"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setActiveLesson(null)} className="text-gray-400 text-2xl leading-none">
              ←
            </button>
            <div>
              <p className="font-semibold text-gray-800">{TASK_LABEL[activeLesson.task]}</p>
              {!isCurrent && <p className="text-xs text-indigo-500">Day {activeLesson.dayNum} review</p>}
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto">
          <DailyLesson
            task={activeLesson.task}
            dayNum={activeLesson.dayNum}
            onDone={handleTaskDone}
            getAnswer={getAnswer}
            setAnswer={setAnswer}
          />
        </main>
        <ChatWidget context={chatContext} />
        {activeLesson.task !== "concept" && <Scratchpad />}
      </div>
    );
  }

  const todayLesson = getDayLesson(displayDay);
  const homeChatContext = {
    profile,
    view: tab,
    dayNum: displayDay,
    isReview: todayLesson.isReview,
    concept: todayLesson.concept,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">
            {tab === "home" && "📐 Daily Math"}
            {tab === "library" && "Concept Library"}
          </h1>
          <button
            onClick={onSwitchProfile}
            className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full px-3 py-1 text-sm font-medium"
          >
            <span>👤</span>
            <span>{profile}</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {tab === "home" && (
          <Home
            onNavigate={handleNavigate}
            onOpenCalendar={() => setCalendarOpen(true)}
            isTaskDone={isTaskDone}
            dayNum={displayDay}
            todayDone={todayDone}
            streak={streak}
            recentStatus={recentStatus}
            isPastView={isPastView}
            onBackToToday={() => setViewedDay(null)}
          />
        )}
        {tab === "library" && <ConceptLibrary />}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
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
        <CalendarView
          daily={daily}
          currentDay={currentDay}
          onSelectDay={handleSelectCalendarDay}
          onClose={() => setCalendarOpen(false)}
        />
      )}
      <ChatWidget context={homeChatContext} />
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(() => getStoredProfile());

  function handleSwitchProfile() {
    if (window.confirm(`Switch profile?\nCurrent: ${profile}`)) {
      setStoredProfile("");
      setProfile(null);
    }
  }

  if (!profile) {
    return <ProfileSetup onDone={setProfile} />;
  }

  return <MainApp profile={profile} onSwitchProfile={handleSwitchProfile} />;
}
