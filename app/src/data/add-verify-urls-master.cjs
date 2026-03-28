/**
 * add-verify-urls-master.cjs
 *
 * Comprehensive script to add verifyUrl fields to ALL JSON files
 * that contain Quran verse references but are missing verifyUrl.
 *
 * Handles patterns A through I as described in the specification.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;
const BASE_URL = 'https://corpus.quran.com/wordbyword.jsp';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse a surah:ayah string into { surah, verse } or null.
 * Handles: "2:282", "103:1-2" (uses first verse), "1:4:1" (surah:ayah:word).
 */
function parseRef(ref) {
  if (!ref || typeof ref !== 'string') return null;
  // Must start with digits followed by colon
  const m = ref.match(/^(\d+):(\d+)/);
  if (!m) return null;
  const surah = parseInt(m[1], 10);
  const verse = parseInt(m[2], 10);
  if (surah < 1 || surah > 114 || verse < 1) return null;
  return { surah, verse };
}

/**
 * Extract the first (surah:ayah) from a mixed string like
 * "2:282 (كَتَبَ); Form III allgemeinarabisch"
 */
function extractRefFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/(\d+:\d+)/);
  if (!m) return null;
  return parseRef(m[1]);
}

/**
 * Extract inline (surah:ayah) from text strings like "أَحْسَنُ تَقْوِيمٍ (95:4)"
 */
function extractInlineRef(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/\((\d+:\d+)\)/);
  if (!m) return null;
  return parseRef(m[1]);
}

function makeUrl(surah, verse) {
  return `${BASE_URL}?chapter=${surah}&verse=${verse}`;
}

function isValidVerseRef(val) {
  if (!val || typeof val !== 'string') return false;
  if (val === 'allgemeinarabisch' || val === '—' || val === '-' || val === '–') return false;
  return /^\d+:\d+/.test(val);
}

// ─── Statistics tracking ────────────────────────────────────────────────────

const stats = {};
function initStats(file) {
  stats[file] = { found: 0, added: 0, skipped: 0 };
}
function recordFound(file) { stats[file].found++; }
function recordAdded(file) { stats[file].added++; }
function recordSkipped(file) { stats[file].skipped++; }

// ─── Pattern processors ────────────────────────────────────────────────────

/**
 * Pattern A: `ref` field as "surah:ayah" string
 * Recursively finds objects with `ref` field, adds verifyUrl as sibling.
 */
function processPatternA(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternA(item, file);
    return;
  }
  if (obj.ref && typeof obj.ref === 'string') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = extractRefFromText(obj.ref);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue; // skip meta objects
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternA(obj[key], file);
    }
  }
}

/**
 * Pattern B: `location` field as "surah:ayah" string (recursive)
 */
function processPatternB(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternB(item, file);
    return;
  }
  if (obj.location && typeof obj.location === 'string') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = parseRef(obj.location);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternB(obj[key], file);
    }
  }
}

/**
 * Pattern C: `exampleLocation` field as "surah:ayah" string
 */
function processPatternC(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternC(item, file);
    return;
  }
  if (obj.exampleLocation && typeof obj.exampleLocation === 'string') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = parseRef(obj.exampleLocation);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternC(obj[key], file);
    }
  }
}

/**
 * Pattern D: `surah` + `verse` (or `ayah`) as separate numeric fields
 */
function processPatternD(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternD(item, file);
    return;
  }
  const surah = obj.surah;
  const verse = obj.verse || obj.ayah;
  if (typeof surah === 'number' && typeof verse === 'number') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      obj.verifyUrl = makeUrl(surah, verse);
      recordAdded(file);
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternD(obj[key], file);
    }
  }
}

/**
 * Pattern E: `quranRef` field as "surah:ayah" or "surah:ayah-ayah" string
 */
function processPatternE(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternE(item, file);
    return;
  }
  if (obj.quranRef && typeof obj.quranRef === 'string') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = parseRef(obj.quranRef);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternE(obj[key], file);
    }
  }
}

/**
 * Pattern F: `ref1` and `ref2` fields — skip non-verse values like "allgemeinarabisch"
 */
function processPatternF(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternF(item, file);
    return;
  }
  // Handle ref1
  if (obj.ref1 && typeof obj.ref1 === 'string') {
    recordFound(file);
    if (obj.verifyUrl1) { recordSkipped(file); }
    else if (isValidVerseRef(obj.ref1)) {
      const parsed = parseRef(obj.ref1);
      if (parsed) {
        obj.verifyUrl1 = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    } else {
      recordSkipped(file);
    }
  }
  // Handle ref2
  if (obj.ref2 && typeof obj.ref2 === 'string') {
    recordFound(file);
    if (obj.verifyUrl2) { recordSkipped(file); }
    else if (isValidVerseRef(obj.ref2)) {
      const parsed = parseRef(obj.ref2);
      if (parsed) {
        obj.verifyUrl2 = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    } else {
      recordSkipped(file);
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternF(obj[key], file);
    }
  }
}

/**
 * Pattern G: `mainLocation` field + nested `location` in forms[] array
 */
function processPatternG(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternG(item, file);
    return;
  }
  // Handle mainLocation
  if (obj.mainLocation && typeof obj.mainLocation === 'string') {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = parseRef(obj.mainLocation);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  // Handle nested location fields (e.g., in forms[])
  if (obj.location && typeof obj.location === 'string' && !obj.mainLocation) {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const parsed = parseRef(obj.location);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternG(obj[key], file);
    }
  }
}

/**
 * Pattern H: `locations` array of "surah:ayah" strings — use first entry
 */
function processPatternH(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternH(item, file);
    return;
  }
  if (Array.isArray(obj.locations) && obj.locations.length > 0) {
    recordFound(file);
    if (obj.verifyUrl) { recordSkipped(file); }
    else {
      const first = obj.locations[0];
      const parsed = parseRef(first);
      if (parsed) {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      } else {
        recordSkipped(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternH(obj[key], file);
    }
  }
}

/**
 * Pattern I: Inline "(surah:ayah)" in text strings — object-level verifyUrl
 * Specifically for morphology-tables.json where `quran` field contains inline refs.
 */
function processPatternI(obj, file) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) processPatternI(item, file);
    return;
  }
  // Look for `quran` field with inline (surah:ayah)
  if (obj.quran && typeof obj.quran === 'string') {
    const parsed = extractInlineRef(obj.quran);
    if (parsed) {
      recordFound(file);
      if (obj.verifyUrl) { recordSkipped(file); }
      else {
        obj.verifyUrl = makeUrl(parsed.surah, parsed.verse);
        recordAdded(file);
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'meta') continue;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processPatternI(obj[key], file);
    }
  }
}

// ─── File processing ─────────────────────────────────────────────────────

function processFile(filename, patterns) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  SKIP (not found): ${filename}`);
    return;
  }

  initStats(filename);
  const raw = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(raw);

  for (const pattern of patterns) {
    pattern(data, filename);
  }

  if (stats[filename].added > 0) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

console.log('=== add-verify-urls-master.cjs ===');
console.log(`Data directory: ${DATA_DIR}`);
console.log('');

// Pattern A files: `ref` field
console.log('--- Pattern A: ref field ---');
processFile('nominal-pattern-inventory.json', [processPatternA]);
processFile('phonology-supplementary.json', [processPatternA]);
processFile('alif-inventory.json', [processPatternA]);
processFile('vowel-length-drill.json', [processPatternA]);

// Pattern B files: `location` field
console.log('--- Pattern B: location field ---');
processFile('morphology-lessons.json', [processPatternB]);
processFile('root-extraction-generated.json', [processPatternB]);

// Pattern C files: `exampleLocation` field
console.log('--- Pattern C: exampleLocation field ---');
processFile('alphabet.json', [processPatternC]);

// Pattern D files: `surah` + `verse` separate fields
console.log('--- Pattern D: surah + verse fields ---');
processFile('layer-buildup-drill.json', [processPatternD]);
processFile('reverse-rasm-drill.json', [processPatternD]);

// Pattern E files: `quranRef` field
console.log('--- Pattern E: quranRef field ---');
processFile('speech-act-drill.json', [processPatternE]);
processFile('pausal-forms-drill.json', [processPatternE]);
processFile('pausal-forms-drill-ext.json', [processPatternE]);
processFile('alif-wasla-drill.json', [processPatternE]);
processFile('idafa-subtypes.json', [processPatternE]);

// Pattern F files: `ref1` and `ref2` fields
console.log('--- Pattern F: ref1/ref2 fields ---');
processFile('minimal-pairs-drill.json', [processPatternF]);

// Pattern G files: `mainLocation` + nested `location`
console.log('--- Pattern G: mainLocation + nested location ---');
processFile('weak-root-generated.json', [processPatternG]);

// Pattern H files: `locations` array
console.log('--- Pattern H: locations array ---');
processFile('rasm-orthography.json', [processPatternH]);

// Pattern I files: inline "(surah:ayah)" in text
console.log('--- Pattern I: inline (surah:ayah) ---');
processFile('morphology-tables.json', [processPatternI]);

// ─── Report ─────────────────────────────────────────────────────────────────

console.log('');
console.log('=== STATISTICS ===');
console.log('');
console.log(String('File').padEnd(45) + String('Found').padStart(8) + String('Added').padStart(8) + String('Skipped').padStart(8));
console.log('-'.repeat(69));

let totalFound = 0;
let totalAdded = 0;
let totalSkipped = 0;

for (const [file, s] of Object.entries(stats)) {
  console.log(
    String(file).padEnd(45) +
    String(s.found).padStart(8) +
    String(s.added).padStart(8) +
    String(s.skipped).padStart(8)
  );
  totalFound += s.found;
  totalAdded += s.added;
  totalSkipped += s.skipped;
}

console.log('-'.repeat(69));
console.log(
  String('TOTAL').padEnd(45) +
  String(totalFound).padStart(8) +
  String(totalAdded).padStart(8) +
  String(totalSkipped).padStart(8)
);
console.log('');
console.log('Done.');
