import { gateway, transcribe } from "ai";

// JSON body with base64 audio (like api/chat.js), not multipart/form-data — Vercel's Node
// function helper only auto-parses json/urlencoded/text bodies into req.body, so multipart
// uploads arrived as undefined here even though the mime type was allowed through.

// whisper-1's language auto-detection handles Korean/English mixed speech more reliably
// than the newer gpt-4o-transcribe family (see sl_sports/src/lib/ai/model.ts for the same
// tradeoff). Routed through Vercel AI Gateway, authenticated via OIDC — no OpenAI key needed.
const TRANSCRIPTION_MODEL_ID = "openai/whisper-1";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { audio: audioBase64 } = req.body || {};
    if (!audioBase64) {
      res.status(400).json({ error: "audio is required" });
      return;
    }

    const audio = new Uint8Array(Buffer.from(audioBase64, "base64"));
    const { text } = await transcribe({
      model: gateway.transcription(TRANSCRIPTION_MODEL_ID),
      audio,
    });

    res.status(200).json({ text });
  } catch (err) {
    console.error("transcribe api error:", err);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
}
