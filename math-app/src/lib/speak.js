import { useEffect, useState } from "react";
import { api } from "./api.js";

// Reads the professor's records aloud (voice from /api/speak). The text is
// split into chunks of a few sentences, all fetched at once, and the MP3s are
// joined into one file so it plays as a single track: one play() started from
// the tap keeps going with the screen locked.

const MAX_CHUNK = 300;

// Markdown is for the eye; LaTeX stays (the voice is told to say it aloud).
function forSpeech(md) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>]+/g, "")
    .replace(/\$\$?/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function chunks(text) {
  const sentences = text.match(/[^.!?。\n]+[.!?。]*["'”’)]*\s*|\n+/g) || [text];
  const out = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > MAX_CHUNK) {
      out.push(buf.trim());
      buf = "";
    }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}

const audio = typeof Audio !== "undefined" ? new Audio() : null;
const listeners = new Set();
let current = { id: null, status: "idle" }; // idle | loading | playing
let token = 0;
let objectUrl = null;

function set(next) {
  current = next;
  listeners.forEach((fn) => fn(current));
}

audio?.addEventListener("ended", () => current.status === "playing" && set({ id: null, status: "idle" }));

export function stop() {
  token++;
  audio?.pause();
  set({ id: null, status: "idle" });
}

export async function play(id, markdown, lang) {
  stop();
  const mine = token;
  // Start the element (muted) inside the tap so the browser lets it play later.
  audio.muted = true;
  audio.play().catch(() => {});
  set({ id, status: "loading" });
  try {
    const parts = await Promise.all(chunks(forSpeech(markdown)).map((c) => api.speak(c, lang)));
    if (mine !== token) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(new Blob(parts, { type: "audio/mpeg" }));
    audio.src = objectUrl;
    audio.muted = false;
    await audio.play();
    if (mine === token) set({ id, status: "playing" });
  } catch {
    if (mine === token) set({ id: null, status: "idle" });
  }
}

// Which record is being read right now, for the buttons.
export function useSpeaker() {
  const [state, setState] = useState(current);
  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);
  return state;
}
