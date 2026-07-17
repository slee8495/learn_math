import { useState, useCallback, useEffect } from "react";

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

// Cloud wins when both sides have an answer for the same slot; local only
// fills in gaps the cloud hasn't seen yet (e.g. the first sync after this
// feature shipped, or a slot typed while offline).
function mergeAnswers(local, cloud) {
  const days = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const merged = {};
  for (const day of days) {
    merged[day] = { ...(local[day] || {}), ...(cloud[day] || {}) };
  }
  return merged;
}

async function fetchCloud(profile) {
  try {
    const res = await fetch(`/api/sync?profile=${encodeURIComponent(profile)}&kind=answers`);
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

function pushCloud(profile, data) {
  fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, kind: "answers", data }),
  }).catch(() => {});
}

export function useUserAnswers(profile) {
  const [answers, setAnswers] = useState(() => loadAll(profile));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cloud = await fetchCloud(profile);
      if (cancelled || !cloud) return;
      setAnswers((current) => {
        const merged = mergeAnswers(current, cloud);
        saveAll(profile, merged);
        pushCloud(profile, merged);
        return merged;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const setAnswer = useCallback(
    (dayKey, idx, value) => {
      setAnswers((prev) => {
        const day = { ...(prev[dayKey] || {}), [idx]: value };
        const next = { ...prev, [dayKey]: day };
        saveAll(profile, next);
        pushCloud(profile, next);
        return next;
      });
    },
    [profile]
  );

  const getAnswer = useCallback((dayKey, idx) => answers[dayKey]?.[idx] || "", [answers]);

  return { getAnswer, setAnswer };
}
