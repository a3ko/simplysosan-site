// Serves public/ and one API route. Everything except /api/* goes straight to the
// static assets without running this code (see run_worker_first in wrangler.jsonc).
//
// GET /api/episodes reads the podcast's RSS feed and returns the latest episodes as JSON,
// so the Podcast page lists new episodes without anyone editing the site. The feed host
// sends no CORS header, which is why the browser cannot read it directly.

const FEED = "https://media.rss.com/sosan-podcast/feed.xml";
const LIMIT = 12;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/episodes") return episodes();
    if (url.pathname.startsWith("/api/")) return json({ error: "not found" }, 404);
    return env.ASSETS.fetch(request);
  },
};

async function episodes() {
  let xml;
  try {
    // Cloudflare caches the feed for an hour, so a busy page does not hit the host each time.
    const res = await fetch(FEED, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) throw new Error(`feed answered ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.log("podcast feed failed:", String(err));
    return json({ error: "feed unavailable" }, 502);
  }

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const list = items.slice(0, LIMIT).map((it) => ({
    title: text(tag(it, "itunes:title") || tag(it, "title")),
    number: num(tag(it, "itunes:episode")),
    date: iso(tag(it, "pubDate")),
    minutes: minutes(tag(it, "itunes:duration")),
    audio: attr(it, "enclosure", "url"),
    link: text(tag(it, "link")),
    summary: summary(tag(it, "description")),
  }));

  return json({ total: items.length, episodes: list }, 200, "public, max-age=3600");
}

function tag(s, name) {
  // The optional attribute group keeps <itunes:episode> from also matching <itunes:episodeType>.
  const m = s.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : "";
}

function attr(s, name, key) {
  const m = s.match(new RegExp(`<${name}[^>]*\\s${key}="([^"]*)"`));
  return m ? m[1] : null;
}

// Unwraps CDATA, drops tags and decodes the handful of entities a feed uses.
function text(s) {
  return s
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// The first paragraph of the show notes, cut at a sentence end near 180 characters.
function summary(desc) {
  const raw = desc.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
  const first = raw.split(/<\/p>/)[0] || raw;
  const t = text(first);
  if (t.length <= 180) return t;
  const cut = t.slice(0, 180);
  const end = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf(". "), cut.lastIndexOf("！"), cut.lastIndexOf("？"));
  return end > 60 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

function num(s) {
  const n = parseInt(text(s), 10);
  return Number.isFinite(n) ? n : null;
}

function iso(s) {
  const d = new Date(text(s));
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

// iTunes durations are seconds ("1141") or clock time ("19:01", "1:02:10").
function minutes(s) {
  const t = text(s);
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.some((p) => !Number.isFinite(p))) return null;
  const secs = parts.reduce((acc, p) => acc * 60 + p, 0);
  return Math.max(1, Math.round(secs / 60));
}

function json(body, status, cache = "no-store") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache },
  });
}
