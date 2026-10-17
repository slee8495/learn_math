import { useEffect, useRef, useState } from "react";
import Sheet from "./Sheet.jsx";
import Md from "./Md.jsx";
import { api } from "../lib/api.js";
import { useT } from "../lib/i18n.js";

const RECORDING_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg"];

function pickRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

// Live tutoring chat for one problem. The whole thread is kept server-side in
// the day's session (that's what the professor reads at night); `initial` is
// that saved thread when the app opens.
export default function ChatSheet({ open, onClose, date, problem, initial, scratchpad, onOpenScratch, onExchange }) {
  const { t, lang } = useT();
  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(initial);
  }, [problem.id, date]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function attachScratch() {
    const img = scratchpad.current?.exportImage();
    if (img) setImage(img);
    else onOpenScratch();
  }

  async function send() {
    const text = input.trim() || (image ? t("scratchMsg") : "");
    if (!text || busy) return;
    const userMsg = { role: "user", text, image };
    const thread = [...messages.filter((m) => !m.error), userMsg];
    setMessages([...thread, { role: "assistant", text: "" }]);
    setInput("");
    setImage(null);
    setBusy(true);
    try {
      // Only the newest image is sent; older ones are already in the model's replies.
      const payload = thread.map((m, i) => ({
        role: m.role,
        text: m.text,
        image: i === thread.length - 1 ? m.image || undefined : m.image ? true : undefined,
      }));
      const reply = await api.chat({ date, pid: problem.id, lang, messages: payload }, (partial) =>
        setMessages([...thread, { role: "assistant", text: partial }]),
      );
      onExchange(userMsg, reply);
    } catch {
      setMessages([...thread, { role: "assistant", text: t("loadFailed"), error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        try {
          const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
          const { text } = await api.transcribe({ audio: await blobToBase64(blob) });
          if (text?.trim()) setInput((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
        } catch {
          // fall back to typing
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // mic unavailable: typing still works
    }
  }

  return (
    <Sheet narrow open={open} onClose={onClose} title={t("chatTitle")}>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="text-sm text-neutral-500">{t("chatEmpty")}</p>}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-neutral-100 px-3.5 py-2.5 text-[15px]">
              {typeof m.image === "string" && <img src={m.image} alt="" className="mb-2 max-h-40 rounded-lg border border-neutral-200" />}
              {m.image === true && <p className="mb-1 text-xs text-neutral-500">[{t("scratch")}]</p>}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          ) : (
            <div key={i} className={`max-w-[92%] text-[15px] leading-relaxed ${m.error ? "text-red-600" : ""}`}>
              {m.text ? <Md>{m.text}</Md> : <span className="text-neutral-400">…</span>}
            </div>
          ),
        )}
      </div>

      <div className="border-t border-neutral-200 px-3 pt-2" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}>
        {image && (
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
            <img src={image} alt="" className="h-10 rounded border border-neutral-200" />
            {t("scratchAttached")}
            <button onClick={() => setImage(null)} className="ml-1 text-neutral-400">
              ✕
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={attachScratch}
            className="shrink-0 rounded-full border border-neutral-300 px-3 py-2 text-sm"
            title={t("attachScratch")}
          >
            ✎
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={recording ? t("listening") : t("chatPlaceholder")}
            className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-neutral-300 px-3.5 py-2 text-[16px] outline-none focus:border-neutral-900"
          />
          <button
            onClick={toggleRecording}
            className={`shrink-0 rounded-full px-3 py-2 text-sm ${recording ? "bg-red-600 text-white" : "border border-neutral-300"}`}
          >
            {recording ? "■" : "🎤"}
          </button>
          <button
            onClick={send}
            disabled={busy || (!input.trim() && !image)}
            className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
