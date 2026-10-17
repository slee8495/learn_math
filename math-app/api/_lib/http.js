// Optional app passcode. Until APP_PASSCODE is set in Vercel, the app is open
// (same as before). Once set, every app API call must send it in x-passcode.
export function checkPasscode(req, res) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) return true;
  if (req.headers["x-passcode"] === expected) return true;
  res.status(401).json({ error: "passcode required" });
  return false;
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.status(405).json({ error: "Method not allowed" });
  return false;
}

export function fail(res, err, label) {
  console.error(`${label} error:`, err);
  res.status(500).json({ error: err?.message || "Server error" });
}
