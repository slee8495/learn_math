import { PIN_COOKIE, pinToken, readCookie } from "./api/_lib/pin.js";

// Vercel Routing Middleware: locks the web screens behind a 6-digit PIN (env APP_PIN).
// Only pages are locked — every /api/* route (iOS app, routine, cron) is excluded by
// the matcher and keeps working exactly as before. No APP_PIN → no lock (local dev).
export const config = {
  matcher: ["/((?!api/|icon|apple-touch-icon|manifest\\.json|favicon).*)"],
};

export default async function middleware(request) {
  const pin = process.env.APP_PIN;
  if (!pin) return;
  const cookie = readCookie(request.headers.get("cookie"), PIN_COOKIE);
  if (cookie && cookie === (await pinToken(pin))) return;
  const wrong = new URL(request.url).searchParams.has("wrong");
  return new Response(page(wrong), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function page(wrong) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>duth</title><link rel="icon" href="/icon.svg">
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:-apple-system,system-ui,sans-serif;background:#fff;color:#111}
@media (prefers-color-scheme:dark){body{background:#000;color:#eee}input,button{border-color:#444!important}}
form{display:flex;flex-direction:column;gap:12px;width:220px;padding:16px}
h1{font-size:22px;font-weight:600;margin:0 0 8px;text-align:center}
input{font-size:24px;letter-spacing:8px;text-align:center;padding:12px;border:1px solid #ccc;border-radius:10px;background:transparent;color:inherit}
button{font-size:16px;padding:12px;border:1px solid #111;border-radius:10px;background:#111;color:#fff}
p{margin:0;color:#c00;font-size:14px;text-align:center}
</style></head><body>
<form method="post" action="/api/login">
<h1>duth</h1>
<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="current-password" placeholder="PIN" autofocus required>
${wrong ? "<p>PIN 이 틀렸어요. 다시 입력하세요.</p>" : ""}
<button type="submit">들어가기</button>
</form></body></html>`;
}
