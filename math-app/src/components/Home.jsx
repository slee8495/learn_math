import { getDayLesson, getReviewLesson } from "../data/curriculum";
import { TASKS } from "../hooks/useDailyProgress";

function getTaskCards(isQuiz, review) {
  const cards = [];
  if (review) {
    cards.push({
      id: "review",
      icon: "🔁",
      label: `Review: Day ${review.prevDayNum}`,
      blurb: "One fresh problem on yesterday's idea",
    });
  }
  cards.push(
    { id: "concept", icon: "💡", label: "Concept", blurb: isQuiz ? "Recap the last few days" : "Learn today's idea" },
    { id: "problem", icon: "✏️", label: isQuiz ? "Review Quiz" : "Practice Problems", blurb: "Try it yourself" },
    { id: "solution", icon: "✅", label: "Solution Walkthrough", blurb: "Check your work" }
  );
  return cards;
}

export default function Home({
  onNavigate,
  onOpenCalendar,
  isTaskDone,
  dayNum,
  todayDone,
  streak,
  recentStatus,
  isPastView,
  onBackToToday,
}) {
  const lesson = getDayLesson(dayNum);
  const dayKey = String(dayNum);
  const review = getReviewLesson(dayNum);
  const taskCards = getTaskCards(lesson.isQuiz, review);

  return (
    <div className="px-4 pt-4 pb-6">
      {isPastView && (
        <button
          onClick={onBackToToday}
          className="w-full mb-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600 font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
        >
          <span>←</span>
          <span>Viewing Day {dayNum} · Back to Today</span>
        </button>
      )}

      {/* Day header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-5 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">
              {lesson.isQuiz ? "Quiz Day" : lesson.isReview ? "Review" : lesson.concept.unit}
            </p>
            <h2 className="text-2xl font-bold">Day {dayNum}</h2>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs">Streak</p>
            <p className="text-xl font-bold">🔥 {streak}</p>
          </div>
        </div>
        <p className="mt-3 text-indigo-100 text-sm">
          {lesson.concept.level} · {lesson.concept.title}
        </p>
        <div className="mt-3 h-1.5 bg-indigo-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(todayDone / TASKS.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-indigo-200 text-xs">{todayDone}/{TASKS.length} done today</p>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-3 mb-4">
        {taskCards.map((card) => {
          const done = isTaskDone(card.id, dayKey);
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id, dayNum)}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-3xl">{card.icon}</span>
              <span className="flex-1">
                <span className="block font-semibold text-gray-800">{card.label}</span>
                <span className="block text-sm text-gray-400">{card.blurb}</span>
              </span>
              {done ? (
                <span className="text-green-500 text-xl">✓</span>
              ) : (
                <span className="text-gray-300 text-xl">→</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Recent days strip */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <p className="text-sm font-medium text-gray-500 mb-3">Recent days</p>
        <div className="flex justify-between">
          {recentStatus.map((d) => {
            const isCurrent = d.day === dayNum;
            return (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">D{d.day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    d.done
                      ? "bg-green-500 text-white"
                      : d.count > 0
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-100 text-gray-300"
                  } ${isCurrent ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
                >
                  {d.done ? "✓" : d.count > 0 ? d.count : "·"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onOpenCalendar}
        className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-indigo-600 font-medium text-sm active:scale-[0.98] transition-transform"
      >
        📋 View all days — review anything you've done before
      </button>
    </div>
  );
}
