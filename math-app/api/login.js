import { PIN_COOKIE, pinToken } from "./_lib/pin.js";

// POST /api/login (form: pin). Right PIN → 1-year httpOnly cookie, back to "/".
// Wrong PIN → back to the PIN screen with ?wrong=1.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const expected = process.env.APP_PIN;
  let body = req.body;
  if (typeof body === "string") body = Object.fromEntries(new URLSearchParams(body));
  const pin = String(body?.pin ?? "").trim();
  if (expected && pin === expected) {
    const token = await pinToken(expected);
    res.setHeader(
      "Set-Cookie",
      `${PIN_COOKIE}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; Secure; SameSite=Lax`,
    );
    res.writeHead(303, { Location: "/" }).end();
    return;
  }
  res.writeHead(303, { Location: "/?wrong=1" }).end();
}
