import { useEffect, useRef, useState } from "react";
import Sheet from "./Sheet.jsx";
import Md from "./Md.jsx";
import { api } from "../lib/api.js";
import { useT } from "../lib/i18n.js";

const LINE_DELAY_MS = 1400;

function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices() || [];
  const prefix = lang === "ko" ? "ko" : "en";
  return voices.find((v) => v.lang?.toLowerCase().startsWith(prefix) && v.localService) || voices.find((v) => v.lang?.toLowerCase().startsWith(prefix));
}

// Plays a lecture: board lines appear one at a time while the device's voice
// reads what the professor says, then moves on to the next scene.
function Player({ lecture }) {
  const { t, bi, lang } = useT();
  const [scene, setScene] = useState(0);
  const [shown, setShown] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const timers = useRef([]);

  const scenes = lecture.scenes;
  const lines = bi(scenes[scene]?.board).split("\n").filter((l) => l.trim());

  function stopAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    window.speechSynthesis?.cancel();
  }

  useEffect(() => stopAll, []);
  useEffect(() => {
    stopAll();
    setScene(0);
    setShown(1);
    setPlaying(false);
  }, [lecture]);

  // Run the current scene while playing: reveal lines, speak, then advance.
  useEffect(() => {
    stopAll();
    if (!playing) {
      setShown(lines.length);
      return;
    }
    setShown(1);
    for (let i = 2; i <= lines.length; i++) timers.current.push(setTimeout(() => setShown(i), (i - 1) * LINE_DELAY_MS));

    const say = bi(scenes[scene].say);
    const minTime = lines.length * LINE_DELAY_MS;
    const started = Date.now();
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      const wait = Math.max(600, minTime - (Date.now() - started));
      timers.current.push(
        setTimeout(() => {
          if (scene < scenes.length - 1) setScene((s) => s + 1);
          else setPlaying(false);
        }, wait),
      );
    };
    if (voiceOn && window.speechSynthesis && say) {
      const u = new SpeechSynthesisUtterance(say);
      u.lang = lang === "ko" ? "ko-KR" : "en-US";
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = lang === "ko" ? 1.05 : 1;
      u.onend = advance;
      u.onerror = advance;
      window.speechSynthesis.speak(u);
      // Some browsers never fire onend (no voice installed, muted tab): move on anyway.
      timers.current.push(setTimeout(advance, Math.max(minTime, say.length * (lang === "ko" ? 200 : 90)) + 3000));
    } else {
      // no voice: give time to read
      timers.current.push(setTimeout(advance, Math.max(minTime, say.length * 70)));
    }
  }, [playing, scene, lang, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(delta) {
    const next = Math.max(0, Math.min(scenes.length - 1, scene + delta));
    setScene(next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <p className="mb-4 text-xs text-neutral-400">
          {t("sceneOf")} {scene + 1} / {scenes.length}
        </p>
        <div className="space-y-4 text-[20px]">
          {lines.map((line, i) => (
            <div key={`${scene}-${i}`} className={`transition-opacity duration-500 ${i < shown ? "opacity-100" : "opacity-0"}`}>
              <Md>{line}</Md>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-neutral-100 pt-4 text-[15px] leading-relaxed text-neutral-600">{bi(scenes[scene]?.say)}</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-4 py-3">
        <button onClick={() => go(-1)} className="rounded-full border border-neutral-300 px-4 py-2 text-sm" disabled={scene === 0}>
          {t("prev")}
        </button>
        <button
          onClick={() => {
            // iOS only allows speech that starts inside a tap; prime it here.
            if (!playing && window.speechSynthesis) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
            setPlaying((p) => !p);
          }}
          className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-medium text-white">
          {playing ? t("pause") : t("play")}
        </button>
        <button onClick={() => go(1)} className="rounded-full border border-neutral-300 px-4 py-2 text-sm" disabled={scene === scenes.length - 1}>
          {t("nextScene")}
        </button>
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className={`rounded-full px-3 py-2 text-sm ${voiceOn ? "border border-neutral-900" : "border border-neutral-300 text-neutral-400 line-through"}`}
        >
          {t("voice")}
        </button>
      </div>
    </div>
  );
}

export default function LectureSheet({ open, onClose, date, problem, plan, requested, onLecture }) {
  const { t, bi } = useT();
  const lectures = [
    { label: t("todaysLecture"), lecture: plan.lecture },
    ...requested.map((r) => ({ label: r.request || t("myLecture"), lecture: r.lecture })),
  ].filter((l) => l.lecture?.scenes?.length);
  const [index, setIndex] = useState(0);
  const [request, setRequest] = useState("");
  const [making, setMaking] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) window.speechSynthesis?.cancel();
  }, [open]);

  async function make() {
    if (making) return;
    setMaking(true);
    setError(false);
    try {
      const { lecture } = await api.lecture({ date, pid: problem.id, request: request.trim() });
      onLecture({ pid: problem.id, request: request.trim(), lecture });
      setRequest("");
      setIndex(lectures.length); // the new one, appended at the end
    } catch {
      setError(true);
    } finally {
      setMaking(false);
    }
  }

  const current = lectures[Math.min(index, lectures.length - 1)];

  return (
    <Sheet narrow open={open} onClose={onClose} title={current ? bi(current.lecture.title) : t("lectureTitle")}>
      {lectures.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-2">
          {lectures.map((l, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`shrink-0 max-w-[60vw] truncate rounded-full px-3 py-1 text-xs ${
                i === index ? "bg-neutral-900 text-white" : "border border-neutral-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {open && current ? <Player lecture={current.lecture} /> : <div className="flex-1" />}

      <div className="border-t border-neutral-200 px-4 pt-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
        {plan.videos?.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs text-neutral-400">{t("videos")}</p>
            {plan.videos.map((v) => (
              <a key={v.url} href={v.url} target="_blank" rel="noreferrer" className="block py-1 text-sm underline underline-offset-2">
                {v.title}
              </a>
            ))}
          </div>
        )}
        {making ? (
          <p className="py-2 text-sm text-neutral-500">{t("makingLecture")}</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={t("askLecture")}
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2 text-[16px] outline-none focus:border-neutral-900"
            />
            <button onClick={make} className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
              {t("makeLecture")}
            </button>
          </div>
        )}
        {error && <p className="pt-1 text-xs text-red-600">{t("loadFailed")}</p>}
      </div>
    </Sheet>
  );
}
