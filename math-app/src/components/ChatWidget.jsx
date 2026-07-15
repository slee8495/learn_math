import { useState, useRef, useEffect } from "react";

const RECORDING_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg"];

function pickRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function ChatWidget({ context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append("audio", blob, "voice-input.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "transcription failed");
          if (data.text?.trim()) {
            setInput((prev) => (prev ? `${prev} ${data.text.trim()}` : data.text.trim()));
          }
        } catch {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: "Sorry, I couldn't hear that clearly — try typing instead.", error: true },
          ]);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // mic permission denied or unsupported — no-op, user can still type
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't reach Claude just now. Try again in a bit.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Ask Claude"
      >
        💬
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl h-[75vh] sm:h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <p className="font-bold text-gray-800">Ask Claude</p>
                <p className="text-xs text-gray-400">Knows what you're looking at right now</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-2xl leading-none px-2">
                ×
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-8">
                  Ask about the concept, get a hint on a problem, or just say you're stuck.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white self-end"
                      : m.error
                      ? "bg-red-50 text-red-700 self-start"
                      : "bg-gray-100 text-gray-800 self-start"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="bg-gray-100 text-gray-400 self-start rounded-2xl px-3.5 py-2.5 text-sm">…</div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={recording ? "Listening…" : transcribing ? "Transcribing…" : "Ask a question..."}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => (recording ? stopRecording() : startRecording())}
                disabled={loading || transcribing}
                aria-pressed={recording}
                aria-label={recording ? "Stop recording" : "Ask by voice"}
                title={recording ? "Stop recording" : "Ask by voice"}
                className={`rounded-xl px-3 text-sm disabled:opacity-40 ${
                  recording ? "bg-red-600 text-white" : "border border-gray-200 text-gray-500"
                }`}
              >
                {recording ? "⏹" : "🎤"}
              </button>
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
