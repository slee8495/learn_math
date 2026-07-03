import { useState, useCallback } from "react";
import { dateKey as todayKey } from "../data/curriculum";

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

export function useDailyProgress(profile) {
  const [daily, setDaily] = useState(() => loadAll(profile));

  const markTask = useCallback((task, key) => {
    setDaily((prev) => {
      const day = { ...(prev[key] || {}), [task]: true };
      const next = { ...prev, [key]: day };
      saveAll(profile, next);
      return next;
    });
  }, [profile]);

  const isTaskDone = useCallback(
    (task, key) => Boolean(daily[key]?.[task]),
    [daily]
  );

  const getDoneCount = useCallback(
    (key) => TASKS.filter((t) => daily[key]?.[t]).length,
    [daily]
  );

  const getTodayDone = useCallback(() => getDoneCount(todayKey()), [getDoneCount]);

  // Consecutive days (ending today) where all tasks are complete.
  const getStreak = useCallback(() => {
    let streak = 0;
    let cursor = new Date(`${todayKey()}T00:00:00Z`);
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      const done = TASKS.every((t) => daily[key]?.[t]);
      if (!done) break;
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }, [daily]);

  // Last 7 days (oldest to newest, ending today) with completion status.
  const getWeekStatus = useCallback(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const cursor = new Date(`${todayKey()}T00:00:00Z`);
      cursor.setUTCDate(cursor.getUTCDate() - i);
      const key = cursor.toISOString().slice(0, 10);
      const count = getDoneCount(key);
      days.push({ key, count, done: count === TASKS.length });
    }
    return days;
  }, [getDoneCount]);

  return {
    daily,
    markTask,
    isTaskDone,
    getDoneCount,
    getTodayDone,
    getStreak,
    getWeekStatus,
    dateKey: todayKey,
  };
}
