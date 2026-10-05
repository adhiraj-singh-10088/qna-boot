import crypto from "crypto";
import dns from "node:dns";
import pool from "./db.js";

/*
 * On-demand translation of user-generated content (post titles/bodies,
 * bios, comments) with a persistent cache in the `translations` table.
 *
 * Engine: Google's public translate endpoint (no key needed; fine for dev).
 * Batch strategy: several texts are joined with @@n@@ sentinels and sent in
 * one request (the endpoint only honours one q per call); the sentinels
 * survive translation and are used to split the result back apart.
 * Every failure path degrades gracefully to the original text.
 */

dns.setDefaultResultOrder("ipv4first"); // this host has no IPv6 route

const SUPPORTED = new Set(["en", "hi", "es"]);
const BATCH_SIZE = 15; // texts per engine call
const CACHE_MISS_LIMIT = 150; // max new texts translated per request

/** Reads the target language for a request (X-Lang header or ?lang=). null = no-op (en / unsupported). */
export function reqLang(req) {
  const raw = String(req.headers["x-lang"] || req.query?.lang || "").toLowerCase().slice(0, 5);
  if (!SUPPORTED.has(raw) || raw === "en") return null;
  return raw;
}

const sha = (text) => crypto.createHash("sha256").update(text).digest("hex");

async function getCached(texts, lang) {
  const map = new Map();
  const hashes = [...new Set(texts.map(sha))];
  if (!hashes.length) return map;
  const placeholders = hashes.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT hash, text FROM translations WHERE lang = ? AND hash IN (${placeholders})`,
    [lang, ...hashes],
  );
  for (const r of rows) map.set(r.hash, r.text);
  return map;
}

async function putCached(pairs, lang) {
  if (!pairs.length) return;
  const values = pairs.map(() => "(?, ?, ?)").join(",");
  const params = [];
  for (const [text, translated] of pairs) params.push(sha(text), lang, translated);
  await pool.query(`INSERT IGNORE INTO translations (hash, lang, text) VALUES ${values}`, params);
}

async function googleBatch(texts, lang) {
  /* Markers go BETWEEN texts only — a trailing marker would add an empty split part. */
  const joined = texts
    .map((t, i) => `${t}${i < texts.length - 1 ? `\n@@${i + 1}@@\n` : ""}`)
    .join("");
  const body = new URLSearchParams();
  body.append("client", "gtx");
  body.append("sl", "auto");
  body.append("tl", lang);
  body.append("dt", "t");
  body.append("q", joined);

  const res = await fetch("https://translate.googleapis.com/translate_a/single", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (Inkspace dev)" },
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`translate HTTP ${res.status}`);

  const json = await res.json();
  const translated = (json?.[0] || []).map((seg) => seg?.[0] || "").join("");
  if (texts.length === 1) return [translated];
  const parts = translated.split(/\s*@@\s*\d+\s*@@\s*/g);
  if (parts.length !== texts.length) throw new Error("batch split mismatch");
  return parts;
}

/** One text, one call — used as a fallback when a batch split fails. */
async function googleOne(text, lang) {
  try {
    const [out] = await googleBatch([text], lang);
    return out;
  } catch {
    return null;
  }
}

/** Translates an array of strings, preserving order/types; originals pass through on any failure. */
export async function translateTexts(texts, lang) {
  if (!lang) return texts;
  const unique = [];
  const seen = new Set();
  for (const t of texts) {
    if (typeof t === "string" && t.trim() && !seen.has(t)) { seen.add(t); unique.push(t); }
  }
  if (!unique.length) return texts;

  const capped = unique.slice(0, CACHE_MISS_LIMIT);
  const cache = await getCached(capped, lang);
  const missing = capped.filter((t) => !cache.has(sha(t)));

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const chunk = missing.slice(i, i + BATCH_SIZE);
    try {
      const out = await googleBatch(chunk, lang);
      for (let k = 0; k < chunk.length; k++) cache.set(sha(chunk[k]), out[k]);
      await putCached(chunk.map((t, k) => [t, out[k]]), lang);
    } catch {
      /* Batch failed (split mismatch / network) — retry each text alone. */
      for (const t of chunk) {
        const out = await googleOne(t, lang);
        if (out) {
          cache.set(sha(t), out);
          try { await putCached([[t, out]], lang); } catch { /* cache write best-effort */ }
        }
      }
    }
  }

  return texts.map((t) => (typeof t === "string" && cache.has(sha(t)) ? cache.get(sha(t)) : t));
}

/** Translates the given string fields of one object (returns a clone; never throws). */
export async function translateFields(obj, fields, lang) {
  if (!lang || !obj) return obj;
  try {
    const present = fields.filter((f) => typeof obj[f] === "string" && obj[f].trim());
    if (!present.length) return obj;
    const out = await translateTexts(present.map((f) => obj[f]), lang);
    const clone = { ...obj };
    present.forEach((f, i) => { clone[f] = out[i]; });
    return clone;
  } catch {
    return obj;
  }
}

/** Same, for a list of objects. */
export async function translateList(items, fields, lang) {
  if (!lang || !Array.isArray(items) || !items.length) return items;
  try {
    return await Promise.all(items.map((it) => translateFields(it, fields, lang)));
  } catch {
    return items;
  }
}
