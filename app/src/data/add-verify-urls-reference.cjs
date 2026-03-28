/**
 * add-verify-urls-reference.cjs
 *
 * Task 2: Adds verifyUrl to reference/glossary/lesson data files.
 *
 * Traverses each JSON file recursively, detects verse references in:
 *   - "ref" field: "surah:ayah" or "surah:ayah-ayah" pattern
 *   - "location" field: "surah:ayah" or "surah:ayah:word" pattern
 *   - "locations" array: first element with "surah:ayah:word" pattern
 *   - "quranicLocations" array: first element with "surah:ayah" pattern
 *   - "quranExample" field: inline "(surah:ayah)" pattern in string
 *   - "verse" object: { surah: N, ayah: N } pattern (e.g. particles.json)
 *
 * URL pattern: https://corpus.quran.com/wordbyword.jsp?chapter=X&verse=Y
 *
 * Skips objects that already have a verifyUrl field.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const URL_TEMPLATE = 'https://corpus.quran.com/wordbyword.jsp?chapter={ch}&verse={v}';

function makeUrl(chapter, verse) {
  return URL_TEMPLATE.replace('{ch}', chapter).replace('{v}', verse);
}

// Match surah:ayah with optional :word suffix or -ayah2 range suffix
const REF_PATTERN = /^(\d{1,3}):(\d{1,3})(?:[:-]\d+)?$/;
// Match inline "(surah:ayah)" in quranExample strings
const INLINE_REF_PATTERN = /\((\d{1,3}):(\d{1,3})\)/;

const FILES = [
  'number-system.json',
  'proper-names.json',
  'case-trigger-reference.json',
  'reading-progression.json',
  'solar-lunar-letters.json',
  'lehnwoerter.json',
  'phonologie-lesson.json',
  'ijam-lesson.json',
  'nisba-lesson.json',
  'quadriliteral-lesson.json',
  'tawkid-lesson.json',
  'shadda-lesson.json',
  'negation-syntax.json',
  'particles.json',
  // Files below are checked but may have no verse refs — included for completeness
  'grammar-glossary.json',
  'frequency-learning-path.json',
  'thematic-fields.json',
  'collocations.json',
  'script-history-lesson.json',
  'mushaf-notation.json',
  'root-starter-cards.json',
];

let grandTotal = 0;

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

    // Case 2: "verse" object with numeric surah/ayah (particles.json quranExample)
    if (!chapter && obj.surah != null && obj.ayah != null &&
        typeof obj.surah === 'number' && typeof obj.ayah === 'number') {
      chapter = obj.surah;
      verse = obj.ayah;
    }

    // Case 3: "location" field with "surah:ayah" or "surah:ayah:word"
    if (!chapter && typeof obj.location === 'string') {
      const m = obj.location.match(REF_PATTERN);
      if (m) {
        chapter = m[1];
        verse = m[2];
      }
    }

    // Case 4: "locations" array — use first element (proper-names.json)
    if (!chapter && Array.isArray(obj.locations) && obj.locations.length > 0) {
      const first = obj.locations[0];
      if (typeof first === 'string') {
        const m = first.match(REF_PATTERN);
        if (m) {
          chapter = m[1];
          verse = m[2];
        }
      }
    }

    // Case 5: "quranicLocations" array — use first element (lehnwoerter.json)
    if (!chapter && Array.isArray(obj.quranicLocations) && obj.quranicLocations.length > 0) {
      const first = obj.quranicLocations[0];
      if (typeof first === 'string') {
        const m = first.match(REF_PATTERN);
        if (m) {
          chapter = m[1];
          verse = m[2];
        }
      }
    }

    // Case 6: "quranExample" field with inline "(surah:ayah)" (case-trigger-reference.json)
    if (!chapter && typeof obj.quranExample === 'string') {
      const m = obj.quranExample.match(INLINE_REF_PATTERN);
      if (m) {
        chapter = m[1];
        verse = m[2];
      }
    }

    // Case 7: "quranExample" as object with surah/ayah fields (particles.json)
    if (!chapter && obj.quranExample && typeof obj.quranExample === 'object' &&
        !Array.isArray(obj.quranExample) &&
        typeof obj.quranExample.surah === 'number' && typeof obj.quranExample.ayah === 'number') {
      chapter = obj.quranExample.surah;
      verse = obj.quranExample.ayah;
    }

    if (chapter && verse) {
      obj.verifyUrl = makeUrl(chapter, verse);
      grandTotal++;
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

for (const file of FILES) {
  const filePath = path.join(BASE_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${file}`);
    filesSkipped++;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const before = grandTotal;
  traverse(data);
  const added = grandTotal - before;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`${file}: ${added} verifyUrl fields added.`);
  filesProcessed++;
}

console.log(`\nDone. ${filesProcessed} files processed, ${filesSkipped} skipped. Total verifyUrl added: ${grandTotal}.`);
