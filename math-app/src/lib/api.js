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

// Reads a streamed plain-text reply; onText receives the growing reply.
async function streamText(path, body, onText) {
  const res = await request(path, { method: "POST", body });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "request failed");
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
}

// Stored photos need the passcode header, so they're fetched rather than
// linked, and kept as object URLs for the rest of the visit.
const imageUrls = new Map();

async function talkImage(subject, id) {
  const path = `/api/talk?subject=${subject}&img=${encodeURIComponent(id)}`;
  if (!imageUrls.has(path)) {
    const pending = request(path).then(async (res) => {
      if (!res.ok) throw new Error("image failed");
      return URL.createObjectURL(await res.blob());
    });
    imageUrls.set(path, pending);
    pending.catch(() => imageUrls.delete(path));
  }
  return imageUrls.get(path);
}

// Calls about one subject of the library; every one names the subject.
export function subjectApi(subject) {
  const q = `subject=${subject}`;
  const post = (path) => (body) => json(path, { method: "POST", body: { ...body, subject } });
  return {
    today: (date) => json(`/api/today?${q}${date ? `&date=${date}` : ""}`),
    archive: () => json(`/api/today?${q}&archive=1`),
    notes: () => json(`/api/today?${q}&notes=1`),
    makePlan: post("/api/plan"),
    check: post("/api/check"),
    event: post("/api/session"),
    talk: (before) => json(`/api/talk?${q}${before != null ? `&before=${before}` : ""}`),
    sendTalk: (body, onText) => streamText("/api/talk", { ...body, subject }, onText),
    talkImage: (id) => talkImage(subject, id),
  };
}

export const api = {
  library: () => json("/api/today?library=1"),
  transcribe: (body) => json("/api/transcribe", { method: "POST", body }),
};
