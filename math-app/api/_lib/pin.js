// Web PIN lock (shared by middleware.js and api/login.js). The cookie never holds
// the PIN itself, only a hash of it, so it can't be read back from a stolen cookie.
export const PIN_COOKIE = "duth_pin";

export async function pinToken(pin) {
  const data = new TextEncoder().encode(`duth-web-pin:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function readCookie(header, name) {
  for (const part of (header || "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}
