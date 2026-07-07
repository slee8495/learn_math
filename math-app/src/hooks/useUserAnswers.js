import { useState, useCallback } from "react";

// What the user actually typed for each problem, kept separate from
// done/not-done progress so it can be recalled on the Solution screen
// ("what did I even answer?") without affecting completion tracking.
function storageKeyFor(profile) {
  return `math_answers_${profile}`;
}

function loadAll(profile) {
  try {
    return JSON.parse(localStorage.getItem(storageKeyFor(profile))) || {};
  } catch {
    return {};
  }
}

function saveAll(profile, data) {
  localStorage.setItem(storageKeyFor(profile), JSON.stringify(data));
}

export function useUserAnswers(profile) {
  const [answers, setAnswers] = useState(() => loadAll(profile));

  const setAnswer = useCallback(
    (dayKey, idx, value) => {
      setAnswers((prev) => {
        const day = { ...(prev[dayKey] || {}), [idx]: value };
        const next = { ...prev, [dayKey]: day };
        saveAll(profile, next);
        return next;
      });
    },
    [profile]
  );

  const getAnswer = useCallback((dayKey, idx) => answers[dayKey]?.[idx] || "", [answers]);

  return { getAnswer, setAnswer };
}
