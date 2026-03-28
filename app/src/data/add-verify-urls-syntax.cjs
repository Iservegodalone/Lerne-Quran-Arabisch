/**
 * add-verify-urls-syntax.cjs
 *
 * Adds verifyUrl fields to all exercises/examples that reference Quran verses
 * in syntax-related JSON files.
 *
 * Pattern: https://corpus.quran.com/wordbyword.jsp?chapter=X&verse=Y
 *
 * Detects verse references in three ways:
 * 1. "ref" field with "surah:ayah" string (e.g. "2:255", "3:7")
 * 2. "verse" object with numeric "surah" and "ayah" fields
 * 3. "location" field with "surah:ayah" or "surah:ayah:word" string
 *
 * Skips objects that already have a verifyUrl field.
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'syntax-exercises.json',
  'syntax-exercises-extended.json',
  'syntax-exercises-extended-2.json',
  'syntax-exercises-extended-3.json',
  'syntax-exercises-extended-4.json',
  'syntax-exercises-extended-5.json',
  'syntax-supplementary.json',
  'conditional-syntax.json',
  'negation-syntax.json',
  'interrogative-syntax.json',
  'relative-clause-syntax.json',
  'badal-syntax.json',
  'hal-syntax.json',
  'tamyiz-syntax.json',
  'istithna-syntax.json',
  'jumla-fi-mahall.json',
  'qasam-syntax.json',
  'nida-syntax.json',
  'zarf-syntax.json',
  'taqdim-takhir.json',
  'ellipsis-hints.json',
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
const URL_TEMPLATE = 'https://corpus.quran.com/wordbyword.jsp?chapter={ch}&verse={v}';

function makeUrl(chapter, verse) {
  return URL_TEMPLATE.replace('{ch}', chapter).replace('{v}', verse);
}

// Regex: matches surah:ayah with optional :word suffix
// Captures surah (group 1) and ayah (group 2)
const REF_PATTERN = /^(\d{1,3}):(\d{1,3})(?::\d+)?$/;

let totalAdded = 0;

function traverse(obj) {
  if (obj === null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      traverse(item);
    }
    return;
  }

  // Skip if already has verifyUrl
  if (!obj.hasOwnProperty('verifyUrl')) {
    let chapter = null;
    let verse = null;

    // Case 1: "ref" field with "surah:ayah" string
    if (typeof obj.ref === 'string') {
      const m = obj.ref.match(REF_PATTERN);
      if (m) {
        chapter = m[1];
        verse = m[2];
      }
    }

    // Case 2: "verse" object with numeric surah/ayah
    if (!chapter && obj.verse && typeof obj.verse === 'object' &&
        typeof obj.verse.surah === 'number' && typeof obj.verse.ayah === 'number') {
      chapter = obj.verse.surah;
      verse = obj.verse.ayah;
    }

    // Case 3: "location" field with "surah:ayah" or "surah:ayah:word"
    if (!chapter && typeof obj.location === 'string') {
      const m = obj.location.match(REF_PATTERN);
      if (m) {
        chapter = m[1];
        verse = m[2];
      }
    }

    if (chapter && verse) {
      obj.verifyUrl = makeUrl(chapter, verse);
      totalAdded++;
    }
  }

  // Recurse into all values
  for (const key of Object.keys(obj)) {
    if (key === 'verifyUrl') continue;
    traverse(obj[key]);
  }
}

let filesProcessed = 0;
let filesSkipped = 0;

for (const filename of FILES) {
  const filepath = path.join(BASE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${filename}`);
    filesSkipped++;
    continue;
  }

  const beforeCount = totalAdded;
  const raw = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(raw);

  traverse(data);

  const added = totalAdded - beforeCount;
  const output = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filepath, output, 'utf8');

  console.log(`OK: ${filename} — ${added} verifyUrl(s) added`);
  filesProcessed++;
}

console.log(`\nDone. ${filesProcessed} files processed, ${filesSkipped} skipped, ${totalAdded} verifyUrls added total.`);
