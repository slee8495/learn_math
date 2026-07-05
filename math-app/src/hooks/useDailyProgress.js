import { useState, useCallback } from "react";

export const TASKS = ["concept", "problem", "solution"];

// Profile is just a self-chosen display name, no auth. Progress is
// stored per profile name so two people can share the same URL/phone
// setup and get fully independent tracking, with zero backend.
const PROFILE_KEY = "math_profile";

export function getStoredProfile() {
  return localStorage.getItem(PROFILE_KEY) || "";
}

export function setStoredProfile(name) {
  if (name) localStorage.setItem(PROFILE_KEY, name);
  else localStorage.removeItem(PROFILE_KEY);
}

function storageKeyFor(profile) {
  return `math_daily_${profile}`;
}

function isDateKey(k) {
  return /^\d{4}-\d{2}-\d{2}$/.test(k);
}

function saveAll(profile, data) {
  localStorage.setItem(storageKeyFor(profile), JSON.stringify(data));
}

// Progress used to be keyed by real calendar date, which made "Day X"
// calendar-locked and identical for every profile. Progress is now
// keyed by curriculum day number (1, 2, 3...) so each profile advances
// at its own pace. Old date-keyed records are migrated once, in
// completion order, so nobody's history is silently dropped.
function loadAll(profile) {
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(storageKeyFor(profile))) || {};
  } catch {
    raw = {};
  }
  const keys = Object.keys(raw);
  if (keys.length && keys.every(isDateKey)) {
    const migrated = {};
    keys.sort().forEach((k, i) => {
      migrated[String(i + 1)] = raw[k];
    });
    saveAll(profile, migrated);
    return migrated;
  }
  return raw;
}

export function useDailyProgress(profile) {
  const [daily, setDaily] = useState(() => loadAll(profile));

  const markTask = useCallback(
    (task, dayKey) => {
      setDaily((prev) => {
        const day = { ...(prev[dayKey] || {}), [task]: true };
        const next = { ...prev, [dayKey]: day };
        saveAll(profile, next);
        return next;
      });
    },
    [profile]
  );

  const isTaskDone = useCallback((task, dayKey) => Boolean(daily[dayKey]?.[task]), [daily]);

  const getDoneCount = useCallback(
    (dayKey) => TASKS.filter((t) => daily[dayKey]?.[t]).length,
    [daily]
  );

  // The next day in the curriculum this profile hasn't fully finished yet.
  const getCurrentDay = useCallback(() => {
    let day = 1;
    while (getDoneCount(String(day)) === TASKS.length) day++;
    return day;
  }, [getDoneCount]);

  // Consecutive fully-completed days immediately before the current one.
  const getStreak = useCallback(() => {
    let streak = 0;
    let day = getCurrentDay() - 1;
    while (day >= 1 && getDoneCount(String(day)) === TASKS.length) {
      streak += 1;
      day -= 1;
    }
    return streak;
  }, [getCurrentDay, getDoneCount]);

  // The most recent N days up to and including the current day.
  const getRecentStatus = useCallback(
    (n = 7) => {
      const current = getCurrentDay();
      const start = Math.max(1, current - n + 1);
      const days = [];
      for (let d = start; d <= current; d++) {
        const count = getDoneCount(String(d));
        days.push({ day: d, count, done: count === TASKS.length });
      }
      return days;
    },
    [getCurrentDay, getDoneCount]
  );

  return {
    daily,
    markTask,
    isTaskDone,
    getDoneCount,
    getCurrentDay,
    getStreak,
    getRecentStatus,
  };
}
