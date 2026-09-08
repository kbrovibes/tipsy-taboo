#!/usr/bin/env node
/**
 * data/raw/*.json  →  src/data/<deck>.json + src/data/meta.json
 *
 * Validates every card against data/SPEC.md, dedupes within a deck, and makes
 * sure a word lives in exactly one difficulty tier (the easiest wins). Themes
 * are their own decks and may overlap the tiers. Rejects go to data/rejects.log
 * so a bad batch is loud, not silent.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "src", "data");
mkdirSync(OUT, { recursive: true });

const TIERS = ["kids", "medium", "hard", "insane"];
const THEMES = ["bollywood", "malayalam", "celebs", "places", "desi", "cricket", "retro", "movies"];
const ALLOWED = /^[A-Za-z0-9 '\-&.]+$/;
const STOP = new Set(["the", "of", "and", "a", "an", "in", "on", "to", "for", "at", "de", "la", "le"]);

const rejects = [];
function reject(file, card, why) {
  rejects.push(`${file}: ${JSON.stringify(card)} — ${why}`);
}

function norm(s) {
  return s.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function tokens(s) {
  return norm(s).split(" ").filter(Boolean);
}
function clean(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

/** does taboo token `t` give away target token `w` (or vice versa)? */
function leaks(w, t) {
  if (STOP.has(w) || STOP.has(t)) return false;
  if (w === t) return true;
  if (w.length >= 4 && t.length >= 4) {
    const k = Math.min(5, w.length, t.length);
    if (w.slice(0, k) === t.slice(0, k) && k >= 4) return true;
  }
  return false;
}

function validate(file, raw) {
  if (!raw || typeof raw.w !== "string" || !Array.isArray(raw.t)) return reject(file, raw, "shape"), null;
  const w = clean(raw.w);
  const t = raw.t.map(clean);
  if (!w || w.length > 40) return reject(file, raw, "target length"), null;
  if (tokens(w).length > 4) return reject(file, raw, "target > 4 words"), null;
  if (t.length !== 5) return reject(file, raw, `${t.length} taboo words`), null;
  if (![w, ...t].every((s) => ALLOWED.test(s))) return reject(file, raw, "characters"), null;
  if (new Set(t.map(norm)).size !== 5) return reject(file, raw, "duplicate taboo"), null;
  if (t.some((x) => tokens(x).length > 4 || !x)) return reject(file, raw, "taboo length"), null;
  const wt = tokens(w);
  for (const x of t) {
    for (const tt of tokens(x)) {
      for (const ww of wt) {
        if (leaks(ww, tt)) return reject(file, raw, `"${x}" leaks "${w}"`), null;
      }
    }
    if (norm(x) === norm(w)) return reject(file, raw, "taboo equals target"), null;
  }
  return { w, t };
}

function loadGroup(prefix) {
  const files = existsSync(RAW)
    ? readdirSync(RAW).filter((f) => f.startsWith(prefix + "-") && f.endsWith(".json")).sort()
    : [];
  const cards = [];
  for (const f of files) {
    let arr;
    try {
      arr = JSON.parse(readFileSync(join(RAW, f), "utf8"));
    } catch (e) {
      rejects.push(`${f}: unparseable (${e.message})`);
      continue;
    }
    if (!Array.isArray(arr)) {
      rejects.push(`${f}: not an array`);
      continue;
    }
    for (const raw of arr) {
      const c = validate(f, raw);
      if (c) cards.push(c);
    }
  }
  return { files: files.length, cards };
}

function dedupe(cards, seenElsewhere = new Set()) {
  const seen = new Set();
  const out = [];
  for (const c of cards) {
    const k = norm(c.w);
    if (seen.has(k) || seenElsewhere.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return { out, seen };
}

const meta = {};
const summary = [];

// tiers: a word belongs to the easiest tier that has it
const lower = new Set();
for (const tier of TIERS) {
  const { files, cards } = loadGroup(tier);
  const { out, seen } = dedupe(cards, lower);
  for (const k of seen) lower.add(k);
  writeFileSync(join(OUT, `${tier}.json`), JSON.stringify(out));
  meta[tier] = out.length;
  summary.push([tier, files, cards.length, out.length]);
}

for (const th of THEMES) {
  const { files, cards } = loadGroup(`theme-${th}`);
  const { out } = dedupe(cards);
  writeFileSync(join(OUT, `theme-${th}.json`), JSON.stringify(out));
  meta[`theme-${th}`] = out.length;
  summary.push([`theme-${th}`, files, cards.length, out.length]);
}

writeFileSync(join(OUT, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
writeFileSync(join(ROOT, "data", "rejects.log"), rejects.join("\n") + (rejects.length ? "\n" : ""));

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("deck", 18) + pad("files", 7) + pad("valid", 8) + "kept");
for (const [d, f, v, k] of summary) console.log(pad(d, 18) + pad(f, 7) + pad(v, 8) + k);
console.log(`\n${rejects.length} rejected → data/rejects.log`);
console.log(`total kept: ${Object.values(meta).reduce((a, b) => a + b, 0)}`);
