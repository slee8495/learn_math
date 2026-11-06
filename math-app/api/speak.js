import { gateway, generateSpeech } from "ai";
import { allowMethods, checkPasscode } from "./_lib/http.js";
import { wavToMp3 } from "./_lib/wavToMp3.js";

// Reads the professor's records aloud. Same voice and route as storyflow's
// /api/speak: Gemini TTS through AI Gateway (OIDC, no key), re-encoded to MP3.
// One request is one chunk of a few sentences; the client splits and joins.
const SPEECH_MODEL_ID = "google/gemini-3.8-flash-tts";
const VOICE = "Aoede";

const INSTRUCTIONS = {
  ko: "Read this in Korean like a warm, calm teacher talking to their student about how they are doing. Natural pace, not theatrical. Math is written in LaTeX: say it the way a teacher would say it aloud in Korean, never the symbols or commands themselves.",
  en: "Read this like a warm, calm teacher talking to their student about how they are doing. Natural pace, not theatrical. Math is written in LaTeX: say it the way a teacher would say it aloud, never the symbols or commands themselves.",
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"]) || !checkPasscode(req, res)) return;
  const text = String(req.query.text || "").trim().slice(0, 1000);
  const lang = req.query.lang === "en" ? "en" : "ko";
  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  try {
    const { audio } = await generateSpeech({
      model: gateway.speech(SPEECH_MODEL_ID),
      text,
      voice: VOICE,
      instructions: INSTRUCTIONS[lang],
    });
    res.setHeader("Content-Type", "audio/mpeg");
    // The same chunk always sounds the same, so the edge and the browser keep it.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(wavToMp3(audio.uint8Array)));
  } catch (err) {
    console.error("speak error:", err);
    res.status(500).json({ error: "tts failed" });
  }
}
