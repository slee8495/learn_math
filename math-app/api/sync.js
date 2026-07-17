import { Redis } from "@upstash/redis";

// Per-profile progress storage so a person's history survives reinstalling
// the home-screen app (localStorage alone doesn't — iOS can wipe it when the
// icon is removed and re-added). Profile is just a self-chosen name, no
// auth, matching the trust model already used for localStorage.
const redis = Redis.fromEnv();

const KINDS = new Set(["daily", "answers"]);

function keyFor(kind, profile) {
  return `mathapp:${kind}:${profile}`;
}

export default async function handler(req, res) {
  const { method } = req;
  if (method !== "GET" && method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const profile = method === "GET" ? req.query.profile : req.body?.profile;
  const kind = method === "GET" ? req.query.kind : req.body?.kind;

  if (!profile || typeof profile !== "string" || !KINDS.has(kind)) {
    res.status(400).json({ error: "profile and a valid kind are required" });
    return;
  }

  try {
    if (method === "GET") {
      const data = await redis.get(keyFor(kind, profile));
      res.status(200).json({ data: data || {} });
      return;
    }

    const { data } = req.body || {};
    if (data === undefined) {
      res.status(400).json({ error: "data is required" });
      return;
    }
    await redis.set(keyFor(kind, profile), data);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("sync api error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
}
