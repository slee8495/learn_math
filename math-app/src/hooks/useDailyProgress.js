import { useState, useCallback } from "react";
import { dateKey as todayKey } from "../data/curriculum";

const STORAGE_KEY = "math_daily";
export const TASKS = ["concept", "problem", "solution"];

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useDailyProgress() {
  const [daily, setDaily] = useState(loadAll);

  const markTask = useCallback((task, key) => {
    setDaily((prev) => {
      const day = { ...(prev[key] || {}), [task]: true };
      const next = { ...prev, [key]: day };
      saveAll(next);
      return next;
    });
  }, []);

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
