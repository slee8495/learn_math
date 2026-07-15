import { gateway, transcribe } from "ai";

// Edge runtime so we get the standard Fetch API Request/Response (req.formData()) instead
// of Vercel's Node (req, res) shape, which doesn't parse multipart bodies on its own.
export const config = { runtime: "edge" };

// whisper-1's language auto-detection handles Korean/English mixed speech more reliably
// than the newer gpt-4o-transcribe family (see sl_sports/src/lib/ai/model.ts for the same
// tradeoff). Routed through Vercel AI Gateway, authenticated via OIDC — no OpenAI key needed.
const TRANSCRIPTION_MODEL_ID = "openai/whisper-1";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob) || file.size === 0) {
      return new Response(JSON.stringify({ error: "audio file is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audio = new Uint8Array(await file.arrayBuffer());
    const { text } = await transcribe({
      model: gateway.transcription(TRANSCRIPTION_MODEL_ID),
      audio,
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("transcribe api error:", err);
    return new Response(JSON.stringify({ error: "Failed to transcribe audio." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
