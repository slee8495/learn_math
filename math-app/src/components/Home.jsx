import { getDayLesson, getReviewLesson } from "../data/curriculum";
import { TASKS } from "../hooks/useDailyProgress";

function getTaskCards(isQuiz, review) {
  const cards = [];
  if (review) {
    const days = review.reviews.map((r) => r.sourceDayNum);
    cards.push({
      id: "review",
      icon: "🔁",
      label: days.length > 1 ? `Review: Days ${days[0]}–${days[days.length - 1]}` : `Review: Day ${days[0]}`,
      blurb:
        days.length > 1
          ? "Fresh problems on the last two days' ideas"
          : "One fresh problem on yesterday's idea",
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
  onUndoTask,
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
          className="w-full mb-3 py-2.5 bg-pill border border-pill-border rounded-2xl text-pill-ink font-medium text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
        >
          <span>←</span>
          <span>Viewing Day {dayNum} · Back to Today</span>
        </button>
      )}

      {/* Day header */}
      <div className="bg-board rounded-2xl p-5 text-chalk mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-chalk/60 text-xs uppercase tracking-wide">
              {lesson.isQuiz ? "Quiz Day" : lesson.isReview ? "Review" : lesson.concept.unit}
            </p>
            <h2 className="text-2xl font-display font-bold">Day {dayNum}</h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-chalk/60 text-xs uppercase tracking-wide">Streak</p>
            <p className="text-xl font-bold">🔥 {streak}</p>
          </div>
        </div>
        <p className="mt-3 text-chalk/80 text-sm">
          {lesson.concept.level} · {lesson.concept.title}
        </p>
        <div className="mt-3 h-1.5 bg-chalk/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${(todayDone / TASKS.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 font-mono text-chalk/60 text-xs">{todayDone}/{TASKS.length} done today</p>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-3 mb-4">
        {taskCards.map((card) => {
          const done = isTaskDone(card.id, dayKey);
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id, dayNum)}
              className="flex items-center gap-4 bg-card border border-card-border rounded-2xl p-4 text-left active:scale-[0.98] transition-transform cursor-pointer"
            >
              <span className="text-3xl">{card.icon}</span>
              <span className="flex-1">
                <span className="block font-display font-semibold text-ink">{card.label}</span>
                <span className="block text-sm text-sub">{card.blurb}</span>
              </span>
              {done ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUndoTask(card.id, dayKey);
                  }}
                  title="Tap to undo"
                  className="text-done text-xl w-8 h-8 flex items-center justify-center rounded-full active:bg-done-soft"
                >
                  ✓
                </button>
              ) : (
                <span className="text-sub/50 text-xl">→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent days strip */}
      <div className="bg-card border border-card-border rounded-2xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wide text-sub mb-3">Recent days</p>
        <div className="flex justify-between">
          {recentStatus.map((d) => {
            const isCurrent = d.day === dayNum;
            return (
              <div key={d.day} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-sub">D{d.day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    d.done
                      ? "bg-done text-chalk"
                      : d.count > 0
                      ? "bg-partial text-partial-ink"
                      : "bg-card-border/60 text-sub/60"
                  } ${isCurrent ? "ring-2 ring-accent ring-offset-1" : ""}`}
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
        className="w-full py-3 bg-card border border-card-border rounded-2xl text-accent font-medium text-sm active:scale-[0.98] transition-transform"
      >
        📋 View all days — review anything you've done before
      </button>
    </div>
  );
}
