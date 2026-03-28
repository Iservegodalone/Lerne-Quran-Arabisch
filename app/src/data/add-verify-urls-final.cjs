/**
 * add-verify-urls-final.cjs
 *
 * Aggressive final sweep to close ALL remaining verifyUrl gaps (target: 183).
 * Processes EVERY .json file in the data directory with deep recursive traversal.
 *
 * Handles three categories:
 *   A) Direct ref fields: location, ref, quranRef, mainLocation, exampleLocation,
 *      verseRef, source, sourceRef, reference, quranicLocation, verse (string with :)
 *   B) Separate numeric fields: (surah|sura|chapter) + (verse|ayah|aya) as numbers
 *   C) Inline text refs: (N:N) patterns in text fields — first match wins
 *   D) Array fields: locations, quranicLocations, verses — first valid entry
 *
 * URL format: https://corpus.quran.com/wordbyword.jsp?chapter={S}&verse={V}
 * Skips objects that already have verifyUrl.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;
const BASE_URL = 'https://corpus.quran.com/wordbyword.jsp';

// Files to skip (raw Quran text, config, morphology DB, etc.)
const SKIP_FILES = new Set([
  'quran-simple-clean.json',
  'quran-uthmani.json',
  'quran-vocalized.json',
  'quran-rasm.json',
  'quran-morphology-db.json',
  'quran-checksum.json',
  'audio-config.json',
  'uthmani-text-config.json',
  'lanes-lexicon-urls.json',
  'sura-index.json',
  'rasm-glyph-mapping.json'
]);

// ── Ref fields that may hold surah:ayah strings ──────────────────────────
const REF_FIELDS = [
  'location', 'ref', 'quranRef', 'mainLocation', 'exampleLocation',
  'verseRef', 'ayahRef', 'source', 'sourceRef', 'reference',
  'quranReference', 'verseLocation', 'loc', 'quranicLocation', 'verse'
];

// ── Text fields to scan for inline (N:N) patterns ───────────────────────
const TEXT_FIELDS = [
  'prompt', 'explanation', 'answer', 'content', 'meaning',
  'description', 'rule', 'analysis', 'note', 'notes', 'text',
  'example', 'left', 'right', 'word', 'question', 'walkthrough',
  'summary', 'detail', 'hint', 'meaning_de', 'meaning_en',
  'context', 'comment', 'remark', 'details'
];

// ── Array fields that may hold arrays of "N:N" strings ───────────────────
const ARRAY_REF_FIELDS = ['locations', 'quranicLocations', 'verses'];

// ── Helpers ──────────────────────────────────────────────────────────────

function makeUrl(surah, verse) {
  return `${BASE_URL}?chapter=${surah}&verse=${verse}`;
}

/**
 * Extract surah + verse from a string that contains a surah:ayah pattern.
 * Handles: "2:282", "17:111 (text)", "2:2-5 vs. 2:6-7", "allgemeinarabisch (text: 2:219)"
 * Returns { surah, verse } or null.
 */
function extractRef(val) {
  if (!val || typeof val !== 'string') return null;
  const m = val.match(/(\d{1,3}):(\d{1,3})/);
  if (!m) return null;
  const surah = parseInt(m[1], 10);
  const verse = parseInt(m[2], 10);
  if (surah < 1 || surah > 114 || verse < 1 || verse > 300) return null;
  return { surah, verse };
}

/**
 * Extract the first inline (N:N) ref from a text string.
 * Matches both parenthesized (2:255) and bare word-boundary refs \b2:255\b,
 * but NOT refs already inside a URL (chapter=X&verse=Y).
 */
function extractInlineRef(val) {
  if (!val || typeof val !== 'string') return null;

  // First try parenthesized: (2:255)
  const paren = val.match(/\((\d{1,3}):(\d{1,3})\)/);
  if (paren) {
    const surah = parseInt(paren[1], 10);
    const verse = parseInt(paren[2], 10);
    if (surah >= 1 && surah <= 114 && verse >= 1 && verse <= 300) {
      return { surah, verse };
    }
  }

  // Then try bare word-boundary ref, but exclude URLs
  // Skip if the string looks like it's a URL containing chapter= or verse=
  if (/chapter=|verse=|corpus\.quran\.com/.test(val)) return null;

  const bare = val.match(/\b(\d{1,3}):(\d{1,3})\b/);
  if (bare) {
    const surah = parseInt(bare[1], 10);
    const verse = parseInt(bare[2], 10);
    if (surah >= 1 && surah <= 114 && verse >= 1 && verse <= 300) {
      return { surah, verse };
    }
  }

  return null;
}

/**
 * Check if the 'verse' field is actually a verse reference (not Arabic text).
 * It must contain digits:digits pattern.
 */
function isVerseRef(val) {
  return typeof val === 'string' && /\d{1,3}:\d{1,3}/.test(val);
}

// ── Main traversal ───────────────────────────────────────────────────────

/**
 * Recursively traverse the JSON structure. For every plain object without
 * verifyUrl, try patterns A-D to add one. Returns count of additions.
 *
 * parentHasVerifyUrl: propagated so the audit's inline check matches
 * (audit skips inline check if parent has verifyUrl — but we add anyway
 *  because audit checks thisHasVerifyUrl which includes parent)
 */
function traverse(node, parentHasVerifyUrl) {
  let added = 0;

  if (Array.isArray(node)) {
    for (const item of node) {
      added += traverse(item, parentHasVerifyUrl);
    }
    return added;
  }

  if (node === null || typeof node !== 'object') return 0;

  // Skip if already has verifyUrl
  if (node.verifyUrl) {
    // Still recurse children, passing thisHasVerifyUrl = true
    for (const key of Object.keys(node)) {
      if (key === '_meta' || key === 'meta') continue;
      const child = node[key];
      if (child !== null && typeof child === 'object') {
        added += traverse(child, true);
      }
    }
    return added;
  }

  let ref = null;

  // ── Pattern A: Direct ref fields ──────────────────────────────────
  for (const field of REF_FIELDS) {
    if (field in node && typeof node[field] === 'string') {
      // Special handling for 'verse' field — only use if it looks like a ref
      if (field === 'verse' && !isVerseRef(node[field])) continue;

      const parsed = extractRef(node[field]);
      if (parsed) {
        ref = parsed;
        break;
      }
    }
  }

  // ── Pattern B: Separate numeric surah + verse fields ──────────────
  if (!ref) {
    const surah = (typeof node.surah === 'number') ? node.surah
                : (typeof node.sura === 'number') ? node.sura
                : (typeof node.chapter === 'number') ? node.chapter
                : null;
    const verse = (typeof node.ayah === 'number') ? node.ayah
                : (typeof node.verse === 'number') ? node.verse
                : (typeof node.aya === 'number') ? node.aya
                : null;
    if (surah !== null && verse !== null && surah >= 1 && surah <= 114 && verse >= 1) {
      ref = { surah, verse };
    }
  }

  // ── Pattern D: Array ref fields (locations, verses, etc.) ─────────
  if (!ref) {
    for (const field of ARRAY_REF_FIELDS) {
      if (Array.isArray(node[field]) && node[field].length > 0) {
        for (const entry of node[field]) {
          const parsed = extractRef(entry);
          if (parsed) {
            ref = parsed;
            break;
          }
        }
        if (ref) break;
      }
    }
  }

  // ── Pattern C: Inline text refs ───────────────────────────────────
  // Only apply if no ref found from structured fields AND parent doesn't
  // already have a verifyUrl (to match audit logic)
  if (!ref && !parentHasVerifyUrl) {
    for (const field of TEXT_FIELDS) {
      if (typeof node[field] === 'string') {
        const parsed = extractInlineRef(node[field]);
        if (parsed) {
          ref = parsed;
          break;
        }
      }
    }
  }

  // ── Apply URL if found ────────────────────────────────────────────
  if (ref) {
    node.verifyUrl = makeUrl(ref.surah, ref.verse);
    added++;
  }

  // Recurse into children
  const thisHasVerifyUrl = !!node.verifyUrl || parentHasVerifyUrl;
  for (const key of Object.keys(node)) {
    if (key === '_meta' || key === 'meta') continue;
    const child = node[key];
    if (child !== null && typeof child === 'object') {
      added += traverse(child, thisHasVerifyUrl);
    }
  }

  return added;
}

// ── Main ─────────────────────────────────────────────────────────────────

console.log('=== add-verify-urls-final.cjs ===');
console.log(`Data directory: ${DATA_DIR}`);
console.log('');

const allFiles = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json') && !SKIP_FILES.has(f))
  .sort();

let grandTotal = 0;
let filesChanged = 0;
const report = [];

for (const filename of allFiles) {
  const filepath = path.join(DATA_DIR, filename);
  let raw;
  try {
    raw = fs.readFileSync(filepath, 'utf-8');
  } catch (e) {
    continue;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    continue;
  }

  const added = traverse(data, false);

  if (added > 0) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    report.push({ filename, added });
    grandTotal += added;
    filesChanged++;
  }
}

// ── Report ───────────────────────────────────────────────────────────────

console.log('Files with additions:');
console.log('-'.repeat(60));
for (const r of report) {
  console.log(`  +${String(r.added).padStart(4)}  ${r.filename}`);
}
console.log('-'.repeat(60));
console.log(`  Files changed:     ${filesChanged}`);
console.log(`  Grand total added: ${grandTotal}`);
console.log('');
console.log('Done.');
