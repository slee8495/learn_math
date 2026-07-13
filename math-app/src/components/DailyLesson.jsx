import { getDayLesson, getReviewLesson } from "../data/curriculum";
import Diagram from "./Diagram";

function ReviewView({ review, onDone, dayKey, getAnswer, setAnswer }) {
  const { concept, problem, prevDayNum } = review;
  return (
    <div className="p-4">
      <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">{concept.unit}</p>
      <h2 className="text-xl font-bold text-gray-800 mt-1 mb-1">Review: {concept.title}</h2>
      <p className="text-sm text-gray-400 mb-4">From Day {prevDayNum} — a quick check that it stuck.</p>

      <ul className="flex flex-col gap-2 mb-5">
        {concept.explain.map((line, i) => (
          <li key={i} className="flex gap-2 text-gray-700 text-sm leading-relaxed">
            <span className="text-indigo-400">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <p className="text-xs font-semibold text-gray-400 mb-1">NEW PROBLEM</p>
        <p className="font-medium text-gray-800">{problem.q}</p>
        {problem.diagram && <div className="mt-3"><Diagram {...problem.diagram} /></div>}
        <input
          type="text"
          value={getAnswer(dayKey, 0)}
          onChange={(e) => setAnswer(dayKey, 0, e.target.value)}
          placeholder="Your answer..."
          className="mt-3 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {getAnswer(dayKey, 0) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Steps</p>
            <ol className="flex flex-col gap-1.5 mb-2">
              {problem.steps.map((s, j) => (
                <li key={j} className="text-sm text-gray-600">
                  <span className="text-indigo-400 font-medium">{j + 1}.</span> {s}
                </li>
              ))}
            </ol>
            <p className="text-sm font-semibold text-green-700">Answer: {problem.a}</p>
          </div>
        )}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
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
      <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">{concept.unit}</p>
      <h2 className="text-xl font-bold text-gray-800 mt-1 mb-4">{concept.title}</h2>

      {lesson.isQuiz && (
        <p className="text-sm text-gray-500 mb-3">
          No new concept today — quick recap of what you've covered, then a mixed quiz below.
        </p>
      )}

      <ul className="flex flex-col gap-2 mb-5">
        {concept.explain.map((line, i) => (
          <li key={i} className="flex gap-2 text-gray-700 text-sm leading-relaxed">
            <span className="text-indigo-400">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {concept.example && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
          <p className="text-xs font-semibold text-indigo-500 mb-2">WORKED EXAMPLE</p>
          <p className="font-medium text-gray-800 mb-3">{concept.example.problem}</p>
          {concept.example.diagram && <Diagram {...concept.example.diagram} />}
          <ol className="flex flex-col gap-1.5 mb-3">
            {concept.example.steps.map((s, i) => (
              <li key={i} className="text-sm text-gray-600">
                <span className="text-indigo-400 font-medium">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
          <p className="text-sm font-semibold text-gray-800">Answer: {concept.example.answer}</p>
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
      >
        Got it — mark done
      </button>
    </div>
  );
}

function ProblemView({ lesson, onDone, dayKey, getAnswer, setAnswer }) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">{lesson.concept.unit}</p>
      <h2 className="text-xl font-bold text-gray-800 mt-1 mb-1">{lesson.concept.title}</h2>
      <p className="text-sm text-gray-400 mb-4">Try these on paper, then check the Solution Walkthrough.</p>

      <div className="flex flex-col gap-3 mb-5">
        {lesson.problems.map((p, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1">
              PROBLEM {i + 1}
              {p.sourceConceptTitle && <span className="text-indigo-400"> · {p.sourceConceptTitle}</span>}
            </p>
            <p className="font-medium text-gray-800">{p.q}</p>
            {p.diagram && <div className="mt-3"><Diagram {...p.diagram} /></div>}
            <input
              type="text"
              value={getAnswer(dayKey, i)}
              onChange={(e) => setAnswer(dayKey, i, e.target.value)}
              placeholder="Your answer..."
              className="mt-3 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
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
      <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">{lesson.concept.unit}</p>
      <h2 className="text-xl font-bold text-gray-800 mt-1 mb-4">{lesson.concept.title}</h2>

      <div className="flex flex-col gap-3 mb-5">
        {lesson.problems.map((p, i) => {
          const yourAnswer = getAnswer(dayKey, i);
          const matches = yourAnswer && normalizeAnswer(yourAnswer) === normalizeAnswer(p.a);
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 mb-1">
                PROBLEM {i + 1}
                {p.sourceConceptTitle && <span className="text-indigo-400"> · {p.sourceConceptTitle}</span>}
              </p>
              <p className="font-medium text-gray-800 mb-3">{p.q}</p>
              {p.diagram && <Diagram {...p.diagram} />}
              <ol className="flex flex-col gap-1.5 mb-2">
                {p.steps.map((s, j) => (
                  <li key={j} className="text-sm text-gray-600">
                    <span className="text-indigo-400 font-medium">{j + 1}.</span> {s}
                  </li>
                ))}
              </ol>
              {yourAnswer && (
                <p className={`text-sm mb-1 ${matches ? "text-green-700" : "text-gray-500"}`}>
                  Your answer: {yourAnswer} {matches && "✓ matches"}
                </p>
              )}
              <p className="text-sm font-semibold text-green-700">Answer: {p.a}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
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
