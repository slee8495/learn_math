import { useRef, useState } from "react";
import { api } from "./api.js";

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

// Tap to record, tap again to stop; the transcript goes to onText.
// If the mic or transcription is unavailable, nothing happens and typing still works.
export function useDictation(onText) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);

  async function toggle() {
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
          if (text?.trim()) onText(text.trim());
        } catch {
          // fall back to typing
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // mic unavailable
    }
  }

  return { recording, toggle };
}
