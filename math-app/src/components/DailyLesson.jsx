import { getDayLesson, getReviewLesson } from "../data/curriculum";
import Diagram from "./Diagram";

function ReviewView({ review, onDone, dayKey, getAnswer, setAnswer }) {
  const { reviews } = review;
  return (
    <div className="p-4">
      <p className="text-xs font-medium font-mono text-accent uppercase tracking-wide">Daily Review</p>
      <h2 className="text-xl font-display font-bold text-ink mt-1 mb-1">
        {reviews.length > 1
          ? `Days ${reviews[0].sourceDayNum}–${reviews[reviews.length - 1].sourceDayNum} recap`
          : `Day ${reviews[0].sourceDayNum} recap`}
      </h2>
      <p className="text-sm text-sub mb-4">A quick check that recent concepts stuck.</p>

      <div className="flex flex-col gap-5 mb-5">
        {reviews.map(({ sourceDayNum, concept, problem }, i) => (
          <div key={sourceDayNum}>
            <p className="text-xs font-mono font-semibold text-accent mb-1">
              DAY {sourceDayNum} · {concept.title}
            </p>
            <ul className="flex flex-col gap-1.5 mb-3">
              {concept.explain.map((line, j) => (
                <li key={j} className="flex gap-2 text-ink text-sm leading-relaxed">
                  <span className="text-accent">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="bg-card border border-card-border rounded-2xl p-4">
              <p className="text-xs font-mono font-semibold text-sub mb-1">NEW PROBLEM</p>
              <p className="font-medium text-ink">{problem.q}</p>
              {problem.diagram && <div className="mt-3"><Diagram {...problem.diagram} /></div>}
              <input
                type="text"
                value={getAnswer(dayKey, i)}
                onChange={(e) => setAnswer(dayKey, i, e.target.value)}
                placeholder="Your answer..."
                className="mt-3 w-full px-3 py-2 rounded-xl border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
              {getAnswer(dayKey, i) && (
                <div className="mt-3 pt-3 border-t border-card-border">
                  <p className="text-xs text-sub mb-1">Steps</p>
                  <ol className="flex flex-col gap-1.5 mb-2">
                    {problem.steps.map((s, j) => (
                      <li key={j} className="text-sm text-ink/80">
                        <span className="text-accent font-medium">{j + 1}.</span> {s}
                      </li>
                    ))}
                  </ol>
                  <p className="text-sm font-semibold text-done">Answer: {problem.a}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-board text-chalk font-semibold rounded-2xl active:scale-[0.98] transition-transform"
      >
        Reviewed — mark done
      </button>
    </div>
  );
}

function ConceptView({ lesson, onDone }) {
  const { concept } = lesson;
  return (
    <div className="p-4">
      <p className="text-xs font-medium font-mono text-accent uppercase tracking-wide">{concept.unit}</p>
      <h2 className="text-xl font-display font-bold text-ink mt-1 mb-4">{concept.title}</h2>

      {lesson.isQuiz && (
        <p className="text-sm text-sub mb-3">
          No new concept today — quick recap of what you've covered, then a mixed quiz below.
        </p>
      )}

      <ul className="flex flex-col gap-2 mb-5">
        {concept.explain.map((line, i) => (
          <li key={i} className="flex gap-2 text-ink text-sm leading-relaxed">
            <span className="text-accent">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {concept.example && (
        <div className="bg-pill/40 border border-pill-border rounded-2xl p-4 mb-5">
          <p className="text-xs font-mono font-semibold text-accent mb-2">WORKED EXAMPLE</p>
          <p className="font-medium text-ink mb-3">{concept.example.problem}</p>
          {concept.example.diagram && <Diagram {...concept.example.diagram} />}
          <ol className="flex flex-col gap-1.5 mb-3">
            {concept.example.steps.map((s, i) => (
              <li key={i} className="text-sm text-ink/80">
                <span className="text-accent font-medium">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
          <p className="text-sm font-semibold text-ink">Answer: {concept.example.answer}</p>
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-board text-chalk font-semibold rounded-2xl active:scale-[0.98] transition-transform"
      >
        Got it — mark done
      </button>
    </div>
  );
}

function ProblemView({ lesson, onDone, dayKey, getAnswer, setAnswer }) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium font-mono text-accent uppercase tracking-wide">{lesson.concept.unit}</p>
      <h2 className="text-xl font-display font-bold text-ink mt-1 mb-1">{lesson.concept.title}</h2>
      <p className="text-sm text-sub mb-4">Try these on paper, then check the Solution Walkthrough.</p>

      <div className="flex flex-col gap-3 mb-5">
        {lesson.problems.map((p, i) => (
          <div key={i} className="bg-card border border-card-border rounded-2xl p-4">
            <p className="text-xs font-mono font-semibold text-sub mb-1">
              PROBLEM {i + 1}
              {p.sourceConceptTitle && <span className="text-accent"> · {p.sourceConceptTitle}</span>}
            </p>
            <p className="font-medium text-ink">{p.q}</p>
            {p.diagram && <div className="mt-3"><Diagram {...p.diagram} /></div>}
            <input
              type="text"
              value={getAnswer(dayKey, i)}
              onChange={(e) => setAnswer(dayKey, i, e.target.value)}
              placeholder="Your answer..."
              className="mt-3 w-full px-3 py-2 rounded-xl border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-board text-chalk font-semibold rounded-2xl active:scale-[0.98] transition-transform"
      >
        I attempted these — mark done
      </button>
    </div>
  );
}

function normalizeAnswer(s) {
  return (s || "").toLowerCase().replace(/\s+/g, "").replace(/['".]/g, "");
}

function SolutionView({ lesson, onDone, dayKey, getAnswer }) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium font-mono text-accent uppercase tracking-wide">{lesson.concept.unit}</p>
      <h2 className="text-xl font-display font-bold text-ink mt-1 mb-4">{lesson.concept.title}</h2>

      <div className="flex flex-col gap-3 mb-5">
        {lesson.problems.map((p, i) => {
          const yourAnswer = getAnswer(dayKey, i);
          const matches = yourAnswer && normalizeAnswer(yourAnswer) === normalizeAnswer(p.a);
          return (
            <div key={i} className="bg-card border border-card-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-sub mb-1">
                PROBLEM {i + 1}
                {p.sourceConceptTitle && <span className="text-accent"> · {p.sourceConceptTitle}</span>}
              </p>
              <p className="font-medium text-ink mb-3">{p.q}</p>
              {p.diagram && <Diagram {...p.diagram} />}
              <ol className="flex flex-col gap-1.5 mb-2">
                {p.steps.map((s, j) => (
                  <li key={j} className="text-sm text-ink/80">
                    <span className="text-accent font-medium">{j + 1}.</span> {s}
                  </li>
                ))}
              </ol>
              {yourAnswer && (
                <p className={`text-sm mb-1 ${matches ? "text-done" : "text-sub"}`}>
                  Your answer: {yourAnswer} {matches && "✓ matches"}
                </p>
              )}
              <p className="text-sm font-semibold text-done">Answer: {p.a}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-board text-chalk font-semibold rounded-2xl active:scale-[0.98] transition-transform"
      >
        Reviewed — mark done
      </button>
    </div>
  );
}

export default function DailyLesson({ task, dayNum, onDone, getAnswer, setAnswer }) {
  const lesson = getDayLesson(dayNum);
  const dayKey = String(dayNum);

  if (task === "review") {
    const review = getReviewLesson(dayNum);
    if (!review) return null;
    return (
      <ReviewView
        review={review}
        onDone={onDone}
        dayKey={`review-${dayNum}`}
        getAnswer={getAnswer}
        setAnswer={setAnswer}
      />
    );
  }
  if (task === "concept") return <ConceptView lesson={lesson} onDone={onDone} />;
  if (task === "problem")
    return <ProblemView lesson={lesson} onDone={onDone} dayKey={dayKey} getAnswer={getAnswer} setAnswer={setAnswer} />;
  if (task === "solution")
    return <SolutionView lesson={lesson} onDone={onDone} dayKey={dayKey} getAnswer={getAnswer} />;
  return null;
}
