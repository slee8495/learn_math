import { useEffect, useRef, useState } from "react";
import Md from "./Md.jsx";
import Scratchpad from "./Scratchpad.jsx";
import { fileToJpeg } from "../lib/image.js";
import { useT } from "../lib/i18n.js";
import { useDictation } from "../lib/voice.js";
import { useSubject } from "../lib/subject.js";

const MAX_PHOTOS = 4;

const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight });

// A photo in the thread: a data URL while it's still local, otherwise the
// stored image id (fetched with the passcode header).
function Photo({ src, onOpen }) {
  const { api } = useSubject();
  const local = src.startsWith("data:");
  const [url, setUrl] = useState(local ? src : null);
  useEffect(() => {
    if (!local) api.talkImage(src).then(setUrl, () => {});
  }, [api, src, local]);
  if (!url) return <div className="h-32 w-24 rounded-lg bg-neutral-100" />;
  return <img src={url} alt="" onClick={() => onOpen(url)} className="max-h-48 rounded-lg border border-neutral-200" />;
}

function dayLabel(at, lang) {
  return new Date(at).toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { month: "long", day: "numeric", weekday: "short" });
}

const dayKey = (at) => new Date(at).toLocaleDateString("en-CA"); // local YYYY-MM-DD

// Office hours: one ongoing conversation with the professor, outside any single
// problem. Photos of handwritten work can be sent for checking. The thread lives
// on the server and is read when the next days are planned. The screen opens on
// today only; earlier days are a tap away (the professor still sees them).
export default function TalkView({ active }) {
  const { t, lang } = useT();
  const { info, api, local } = useSubject();
  const [messages, setMessages] = useState([]);
  const [start, setStart] = useState(0);
  const [today, setToday] = useState(() => dayKey(Date.now()));
  const [shownFrom, setShownFrom] = useState(null); // earliest day shown; null = today
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [input, setInput] = useState("");
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [viewer, setViewer] = useState(null);
  const fileRef = useRef(null);
  const { recording, toggle: toggleRecording } = useDictation((text) =>
    setInput((prev) => (prev ? `${prev} ${text}` : text)),
  );

  async function load() {
    setStatus("loading");
    try {
      const page = await api.talk();
      setMessages(page.messages);
      setStart(page.start);
      setStatus("ready");
      requestAnimationFrame(scrollToBottom);
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (active) requestAnimationFrame(scrollToBottom);
  }, [active]);

  // The app can sit open overnight: roll over to the new day when it's opened
  // again, not in the middle of a conversation.
  useEffect(() => {
    const roll = () => {
      if (document.visibilityState !== "visible") return;
      const now = dayKey(Date.now());
      if (now === today) return;
      setToday(now);
      setShownFrom(null);
      requestAnimationFrame(scrollToBottom);
    };
    if (active) roll();
    document.addEventListener("visibilitychange", roll);
    return () => document.removeEventListener("visibilitychange", roll);
  }, [active, today]);

  const from = shownFrom ?? today;
  const visible = messages.filter((m) => dayKey(m.at) >= from);
  const hidden = messages.length - visible.length;

  // Reveal one more day: from what's already loaded, or the next page back.
  async function showEarlier() {
    let older = messages.slice(0, hidden);
    if (!older.length) {
      const page = await api.talk(start).catch(() => null);
      if (!page) return;
      older = page.messages;
      setMessages((prev) => [...page.messages, ...prev]);
      setStart(page.start);
    }
    if (!older.length) return;
    const before = document.documentElement.scrollHeight;
    setShownFrom(dayKey(older[older.length - 1].at));
    // keep the view where it was instead of jumping to the new top
    requestAnimationFrame(() => window.scrollBy(0, document.documentElement.scrollHeight - before));
  }

  async function addFiles(files) {
    const room = MAX_PHOTOS - photos.length;
    const picked = [...files].slice(0, room);
    const urls = await Promise.all(picked.map((f) => fileToJpeg(f).catch(() => null)));
    setPhotos((prev) => [...prev, ...urls.filter(Boolean)].slice(0, MAX_PHOTOS));
  }

  async function send() {
    const text = input.trim() || (photos.length ? t("photoMsg") : "");
    if (!text || busy) return;
    const now = new Date().toISOString();
    const userMsg = { id: `local-${now}`, role: "user", text, images: photos, at: now };
    const thread = [...messages.filter((m) => !m.error), userMsg];
    const replyMsg = (text, extra) => ({ id: `reply-${now}`, role: "assistant", text, images: [], at: now, ...extra });
    setMessages([...thread, replyMsg("")]);
    setInput("");
    setPhotos([]);
    setBusy(true);
    requestAnimationFrame(scrollToBottom);
    try {
      await api.sendTalk({ lang, text, images: photos }, (partial) => {
        const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 160;
        setMessages([...thread, replyMsg(partial)]);
        if (nearBottom) requestAnimationFrame(scrollToBottom);
      });
    } catch {
      setMessages([...thread, replyMsg(t("loadFailed"), { error: true })]);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return <p className="pt-16 text-neutral-400">{t("loading")}</p>;
  if (status === "error")
    return (
      <div className="pt-16">
        <p className="text-neutral-600">{t("loadFailed")}</p>
        <button onClick={load} className="mt-4 rounded-full border border-neutral-300 px-4 py-2 text-sm">
          {t("retry")}
        </button>
      </div>
    );

  return (
    <div className="pb-44">
      {(hidden > 0 || start > 0) && (
        <button onClick={showEarlier} className="mb-4 w-full text-center text-sm text-neutral-500">
          {t("loadEarlier")}
        </button>
      )}
      {visible.length === 0 && (
        <p className="pt-8 text-[15px] leading-relaxed text-neutral-500">{t(messages.length ? "talkNewDay" : info.code ? "talkEmptyCode" : "talkEmpty")}</p>
      )}

      <div className="space-y-3">
        {visible.map((m, i) => {
          const newDay = i === 0 || dayLabel(m.at, lang) !== dayLabel(visible[i - 1].at, lang);
          return (
            <div key={m.id || i}>
              {newDay && <p className="py-3 text-center text-xs text-neutral-400">{dayLabel(m.at, lang)}</p>}
              {m.role === "user" ? (
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-neutral-100 px-3.5 py-2.5 text-[15px]">
                  {m.images?.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {m.images.map((src, j) => (
                        <Photo key={j} src={src} onOpen={setViewer} />
                      ))}
                    </div>
                  )}
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                </div>
              ) : (
                <div className={`max-w-[92%] text-[15px] leading-relaxed ${m.error ? "text-red-600" : ""}`}>
                  {m.text ? <Md>{m.text}</Md> : <span className="text-neutral-400">…</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        <div className="mx-auto max-w-xl px-4 pt-2">
          {photos.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto">
              {photos.map((src, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={src} alt="" className="h-14 rounded border border-neutral-200" />
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-neutral-900 text-[10px] text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mb-2 flex items-center gap-2 text-sm">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
              className="rounded-full border border-neutral-300 px-3 py-1.5 disabled:opacity-30"
            >
              📷 {t("photo")}
            </button>
            <button
              onClick={() => setScratchOpen(true)}
              disabled={photos.length >= MAX_PHOTOS}
              className="rounded-full border border-neutral-300 px-3 py-1.5 disabled:opacity-30"
            >
              ✎ {t("scratch")}
            </button>
            <button
              onClick={toggleRecording}
              className={`ml-auto rounded-full px-3 py-1.5 ${recording ? "bg-red-600 text-white" : "border border-neutral-300"}`}
            >
              {recording ? "■" : "🎤"}
            </button>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={recording ? t("listening") : t("talkPlaceholder")}
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-neutral-300 px-3.5 py-2 text-[16px] outline-none focus:border-neutral-900"
            />
            <button
              onClick={send}
              disabled={busy || (!input.trim() && !photos.length)}
              className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
            >
              {t("send")}
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <Scratchpad
        open={scratchOpen}
        onClose={() => setScratchOpen(false)}
        storageKey={local("scratch_talk")}
        onAttach={(img) => {
          setPhotos((prev) => [...prev, img].slice(0, MAX_PHOTOS));
          setScratchOpen(false);
        }}
      />

      {viewer && (
        <div onClick={() => setViewer(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2">
          <img src={viewer} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
