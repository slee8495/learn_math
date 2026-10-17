const PASS_KEY = "mp_passcode";

export function getPasscode() {
  try {
    return localStorage.getItem(PASS_KEY) || "";
  } catch {
    return "";
  }
}

export function setPasscode(value) {
  try {
    localStorage.setItem(PASS_KEY, value);
  } catch {
    // private mode: passcode just won't be remembered
  }
}

export class PasscodeError extends Error {}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", "x-passcode": getPasscode() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new PasscodeError("passcode required");
  return res;
}

async function json(path, options) {
  const res = await request(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  today: (date) => json(`/api/today${date ? `?date=${date}` : ""}`),
  makePlan: () => json("/api/plan", { method: "POST" }),
  check: (body) => json("/api/check", { method: "POST", body }),
  event: (body) => json("/api/session", { method: "POST", body }),
  lecture: (body) => json("/api/lecture", { method: "POST", body }),
  transcribe: (body) => json("/api/transcribe", { method: "POST", body }),

  // Streams the tutor's reply; onText receives the growing reply.
  async chat(body, onText) {
    const res = await request("/api/chat", { method: "POST", body });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "chat failed");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    return text;
  },
};
