/**
 * add-verify-urls-syntax-deep.cjs
 *
 * Deep pass: adds verifyUrl to ALL objects in the syntax lesson files
 * (syntax-3-*.json, syntax-4-*.json) that contain a Quran verse reference
 * in ANY string field but lack a verifyUrl.
 *
 * Detection strategy (ordered by priority):
 *   1. Explicit "location" field  — e.g. "2:255", "74:50-51", "1:6–7"
 *   2. Explicit "ref" field       — e.g. "2:255"
 *   3. Explicit "verse" field (string) — e.g. "2:255"
 *   4. Embedded surah:ayah pattern in ANY string value
 *      (meaning, prompt, content, explanation, answer, note, left, word …)
 *
 * Verse-range handling: for "74:50-51" or "89:1–9", the FIRST verse is used.
 *
 * URL format:
 *   https://corpus.quran.com/wordbyword.jsp?chapter={SURAH}&verse={AYAH}
 *
 * Skips objects that already have a verifyUrl field.
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'syntax-3-01-10.json',
  'syntax-3-11-20.json',
  'syntax-3-21-30.json',
  'syntax-3-31-38.json',
  'syntax-3-39-41.json',
  'syntax-3-42-44.json',
  'syntax-4-01-07.json',
  'syntax-4-08-15.json',
];

const BASE_DIR = __dirname;

function makeUrl(chapter, verse) {
  return `https://corpus.quran.com/wordbyword.jsp?chapter=${chapter}&verse=${verse}`;
}

/**
 * Extract the FIRST (surah, ayah) pair from a string.
 * Handles:
 *   "2:255"          → (2, 255)
 *   "74:50-51"       → (74, 50)
 *   "1:6–7"          → (1, 6)    (en-dash)
 *   "103:1-2"        → (103, 1)
 *   "2:255:3"        → (2, 255)  (word-level ref)
 *   "Text blah (2:255)" → (2, 255)
 *   "Text 2:255 blah"  → (2, 255)
 *
 * Returns { chapter, verse } or null.
 */
function extractRef(str) {
  if (typeof str !== 'string') return null;
  // Match surah:ayah, possibly followed by -/–range or :word
  const m = str.match(/(\d{1,3}):(\d{1,3})/);
  if (m) {
    const ch = parseInt(m[1], 10);
    const v = parseInt(m[2], 10);
    // Basic sanity: surah 1-114, ayah 1-286
    if (ch >= 1 && ch <= 114 && v >= 1 && v <= 300) {
      return { chapter: ch, verse: v };
    }
  }
  return null;
}

/**
 * For a given object, try to find a verse reference.
 * Priority: location > ref > verse > any other string field.
 * Returns { chapter, verse } or null.
 */
function findRef(obj) {
  // Priority 1: location field
  if (typeof obj.location === 'string') {
    const r = extractRef(obj.location);
    if (r) return r;
  }
  // Priority 2: ref field
  if (typeof obj.ref === 'string') {
    const r = extractRef(obj.ref);
    if (r) return r;
  }
  // Priority 3: verse field (string)
  if (typeof obj.verse === 'string') {
    const r = extractRef(obj.verse);
    if (r) return r;
  }
  // Priority 4: verse object with surah/ayah numbers
  if (obj.verse && typeof obj.verse === 'object' &&
      typeof obj.verse.surah === 'number' && typeof obj.verse.ayah === 'number') {
    return { chapter: obj.verse.surah, verse: obj.verse.ayah };
  }
  // Priority 5: scan all other string fields for embedded references
  // Check fields in a sensible order (most likely to contain refs first)
  const priorityFields = ['meaning', 'prompt', 'content', 'analysis', 'explanation', 'note', 'answer', 'word', 'left'];
  for (const field of priorityFields) {
    if (typeof obj[field] === 'string') {
      const r = extractRef(obj[field]);
      if (r) return r;
    }
  }
  // Fallback: any remaining string field
  for (const [key, val] of Object.entries(obj)) {
    if (priorityFields.includes(key)) continue; // already checked
    if (key === 'verifyUrl') continue;
    if (typeof val === 'string') {
      const r = extractRef(val);
      if (r) return r;
    }
  }
  return null;
}

// Per-file statistics
const stats = {};

function traverse(obj, fileKey) {
  if (obj === null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      traverse(item, fileKey);
    }
    return;
  }

  // Skip if already has verifyUrl
  if (!obj.hasOwnProperty('verifyUrl')) {
    const ref = findRef(obj);
    if (ref) {
      obj.verifyUrl = makeUrl(ref.chapter, ref.verse);
      stats[fileKey].added++;
    }
  } else {
    stats[fileKey].existing++;
  }

  // Recurse into all child values
  for (const key of Object.keys(obj)) {
    if (key === 'verifyUrl') continue;
    traverse(obj[key], fileKey);
  }
}

console.log('add-verify-urls-syntax-deep.cjs — Deep verifyUrl pass\n');

let grandTotalExisting = 0;
let grandTotalAdded = 0;

for (const filename of FILES) {
  const filepath = path.join(BASE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${filename}`);
    continue;
  }

  stats[filename] = { existing: 0, added: 0 };

  const raw = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(raw);

  traverse(data, filename);

  const { existing, added } = stats[filename];
  grandTotalExisting += existing;
  grandTotalAdded += added;

  const total = existing + added;
  const pct = total > 0 ? ((total / total) * 100).toFixed(0) : '0';
  console.log(`${filename}:`);
  console.log(`  before: ${existing} verifyUrls | added: ${added} | total: ${total}`);

  // Write back
  const output = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filepath, output, 'utf8');
}

console.log(`\n========================================`);
console.log(`TOTAL: ${grandTotalExisting} existing + ${grandTotalAdded} added = ${grandTotalExisting + grandTotalAdded} verifyUrls`);
console.log(`========================================`);
