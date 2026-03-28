/**
 * add-verify-urls-drills.cjs
 *
 * Adds missing verifyUrl fields to drill and exercise JSON files that have
 * partial coverage.  Performs a full recursive traversal of each JSON file
 * and adds a verifyUrl to every object that references a Quran verse but
 * does not yet have one.
 *
 * Recognised reference fields (value must match a surah:ayah pattern):
 *   - "location"        e.g. "1:4", "2:37", "3:7"
 *   - "ref"             e.g. "2:255", "2:255-256", "24:35a", "1:4:1"
 *   - "quranRef"        e.g. "4:11"
 *   - "mainLocation"    e.g. "2:143"
 *   - "verse"           only when the value is a string matching surah:ayah
 *   - "exampleLocation" e.g. "5:6"
 *   - "quranicLocation" e.g. "29:45"
 *   - "verses"          e.g. "1:1" or "1:2-4"
 *
 * Recognised compound fields:
 *   - "surah" (number) + "verse" (number)  -> chapter=surah, verse=verse
 *   - "surah" (number) + "ayah" (number)   -> chapter=surah, verse=ayah
 *
 * Array fields:
 *   - "locations" (array of strings)       -> first valid surah:ayah entry
 *
 * Inline scanning (if no explicit ref field matched):
 *   Fields "prompt", "explanation", "answer", "content", "meaning",
 *   "left", "right", "word", "question", "note", "context",
 *   "quranExample", "arabic", "rule", "description", "analysis"
 *   are scanned for inline verse references like (2:255) or (4:11).
 *   The FIRST match is used.
 *
 * URL pattern:
 *   https://corpus.quran.com/wordbyword.jsp?chapter={SURAH}&verse={VERSE}
 *
 * For ranges like "2:255-256", only the first verse is used.
 * For "1:4:1" format (surah:ayah:word), surah and ayah are used.
 * Non-verse values like "---", "allgemeinarabisch", empty strings are skipped.
 *
 * Objects that already have a verifyUrl field are completely skipped.
 */

const fs = require('fs');
const path = require('path');

// ── Files to process ──────────────────────────────────────────────────
const FILES = [
  'verse-synthesis-exercises.json',
  'advanced-stages.json',
  'syntax-exercises-extended-2.json',
  'syntax-exercises-extended-4.json',
  'verb-rection.json',
  'congruence-drill.json',
  'elativ-drill.json',
  'diptote-data.json',
  'weak-verb-tables.json',
  'weak-verbs-derived-forms.json',
  'ring-composition-drill.json',
  'energetikus-paradigm.json',
  'masdar-drill.json',
  'case-trigger-reference.json',
  'synonym-contrast.json',
  'polysemy-drill.json',
  'verb-form-semantics.json',
  'nominal-declension.json',
  'irab-exercises-extension.json',
  'reading-progression.json',
  'alif-wasla-generated.json',
  'rasm-decoding-drill.json',
  'broken-plural-drill.json',
  'context-disambiguation-exercises.json',
  'masdar-clause.json',
  'negation-syntax.json',
  'conditional-syntax.json',
  'interrogative-syntax.json',
  'nida-syntax.json',
  'qasam-syntax.json',
  'istithna-syntax.json',
  'hal-syntax.json',
  'tamyiz-syntax.json',
  'relative-clause-syntax.json',
  'badal-syntax.json',
  'zarf-syntax.json',
  'maf-ul-mutlaq.json',
  'maf-ul-liajlihi.json',
  'maf-ul-maahu.json',
  'taqdim-takhir.json',
  'disambiguation-lesson.json',
  'balagha-lessons.json',
  'number-system.json',
  'surah-macrostructure.json',
  'waw-disambiguation.json',
  'tawkid-lesson.json',
  'jumla-fi-mahall.json',
];

const BASE_DIR = __dirname;

// ── URL builder ───────────────────────────────────────────────────────

function buildUrl(chapter, verse) {
  return `https://corpus.quran.com/wordbyword.jsp?chapter=${chapter}&verse=${verse}`;
}

// ── Reference patterns ────────────────────────────────────────────────
// Matches surah:ayah with optional trailing letter, range, or word position
// Examples: "2:255", "2:255-256", "24:35a", "1:4:1", "55:1-4"
const REF_PATTERN = /^(\d{1,3}):(\d{1,3})(?:[a-z])?(?:[-\u2013]\d{1,3}[a-z]?)?(?::\d+)?$/;

// Also match refs with leading text like "2:30 قَالَ" (ref field with Arabic after space)
const REF_PATTERN_LOOSE = /^(\d{1,3}):(\d{1,3})(?:[a-z])?(?:[-\u2013]\d{1,3}[a-z]?)?(?::\d+)?(?:\s|$)/;

// Inline refs like (2:255) or (4:11) embedded in text
const INLINE_REF_PATTERN = /\((\d{1,3}):(\d{1,3})(?:[-\u2013]\d{1,3})?\)/;

// Even looser: just find a digit:digit pattern in text (for fields like "question"
// that may contain "89:22" without parens)
const BARE_REF_PATTERN = /(\d{1,3}):(\d{1,3})(?=[^0-9]|$)/;

// Keys that hold explicit verse references as strings
const EXPLICIT_REF_KEYS = [
  'location', 'ref', 'quranRef', 'mainLocation',
  'exampleLocation', 'quranicLocation', 'verses',
];

// Keys whose string value may contain inline (surah:ayah) references
const INLINE_SCAN_KEYS = [
  'prompt', 'explanation', 'answer', 'content', 'meaning',
  'left', 'right', 'word', 'question', 'note', 'context',
  'quranExample', 'arabic', 'rule', 'description', 'analysis',
];

/**
 * Validate a chapter:verse pair.
 */
function isValidRef(chapter, verse) {
  return chapter >= 1 && chapter <= 114 && verse >= 1 && verse <= 300;
}

/**
 * Try to extract chapter + verse from a string value using the REF_PATTERN.
 * Returns { chapter, verse } or null.
 */
function parseRef(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '\u2014' || trimmed === '-' || trimmed === '--') return null;

  // Try strict pattern first
  let m = trimmed.match(REF_PATTERN);
  if (!m) {
    // Try loose pattern (ref with trailing Arabic text)
    m = trimmed.match(REF_PATTERN_LOOSE);
  }
  if (!m) return null;

  const chapter = parseInt(m[1], 10);
  const verse = parseInt(m[2], 10);
  if (!isValidRef(chapter, verse)) return null;
  return { chapter, verse };
}

/**
 * Try to extract an inline (surah:ayah) reference from a text string.
 * Returns { chapter, verse } or null.
 */
function parseInlineRef(value) {
  if (typeof value !== 'string') return null;

  // First try parenthesized refs: (2:255)
  let m = value.match(INLINE_REF_PATTERN);
  if (m) {
    const chapter = parseInt(m[1], 10);
    const verse = parseInt(m[2], 10);
    if (isValidRef(chapter, verse)) return { chapter, verse };
  }

  // Then try bare refs: 89:22
  m = value.match(BARE_REF_PATTERN);
  if (m) {
    const chapter = parseInt(m[1], 10);
    const verse = parseInt(m[2], 10);
    if (isValidRef(chapter, verse)) return { chapter, verse };
  }

  return null;
}

/**
 * Count existing verifyUrl fields in a JSON tree.
 */
function countExisting(node) {
  let count = 0;
  if (Array.isArray(node)) {
    for (const item of node) {
      count += countExisting(item);
    }
  } else if (node !== null && typeof node === 'object') {
    if ('verifyUrl' in node) count++;
    for (const val of Object.values(node)) {
      count += countExisting(val);
    }
  }
  return count;
}

/**
 * Recursively traverse the JSON tree.
 * For each plain object without a verifyUrl, attempt to find a verse ref
 * and add verifyUrl.  Returns the number of URLs added.
 */
function traverse(node) {
  let added = 0;

  if (Array.isArray(node)) {
    for (const item of node) {
      added += traverse(item);
    }
    return added;
  }

  if (node !== null && typeof node === 'object') {
    // Only process objects that do NOT already have a verifyUrl
    if (!('verifyUrl' in node)) {
      let parsed = null;

      // ── Strategy 1: Explicit reference keys ──
      for (const key of EXPLICIT_REF_KEYS) {
        if (key in node) {
          parsed = parseRef(String(node[key]));
          if (parsed) break;
        }
      }

      // ── Strategy 1b: "verse" field when it's a string matching surah:ayah ──
      if (!parsed && 'verse' in node && typeof node.verse === 'string') {
        parsed = parseRef(node.verse);
      }

      // ── Strategy 2: Separate surah + verse/ayah number fields ──
      if (!parsed) {
        if (typeof node.surah === 'number' && typeof node.verse === 'number') {
          const ch = node.surah;
          const v = node.verse;
          if (isValidRef(ch, v)) {
            parsed = { chapter: ch, verse: v };
          }
        }
        if (!parsed && typeof node.surah === 'number' && typeof node.ayah === 'number') {
          const ch = node.surah;
          const v = node.ayah;
          if (isValidRef(ch, v)) {
            parsed = { chapter: ch, verse: v };
          }
        }
      }

      // ── Strategy 3: "locations" array -- use first valid entry ──
      if (!parsed && Array.isArray(node.locations) && node.locations.length > 0) {
        for (const loc of node.locations) {
          if (typeof loc === 'string') {
            parsed = parseRef(loc);
            if (parsed) break;
          }
        }
      }

      // ── Strategy 4: Inline scanning of text fields ──
      if (!parsed) {
        for (const key of INLINE_SCAN_KEYS) {
          if (key in node && typeof node[key] === 'string') {
            parsed = parseInlineRef(node[key]);
            if (parsed) break;
          }
        }
      }

      // ── Add verifyUrl if we found a reference ──
      if (parsed) {
        node.verifyUrl = buildUrl(parsed.chapter, parsed.verse);
        added++;
      }
    }

    // Recurse into all child values
    for (const val of Object.values(node)) {
      added += traverse(val);
    }
  }

  return added;
}

// ── Main ──────────────────────────────────────────────────────────────

console.log('add-verify-urls-drills.cjs');
console.log('='.repeat(75));
console.log('');

let grandTotalAdded = 0;
let grandTotalExisting = 0;
let grandTotalFinal = 0;
let filesProcessed = 0;
let filesSkipped = 0;

const results = [];

for (const filename of FILES) {
  const filepath = path.join(BASE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`  SKIP (not found): ${filename}`);
    filesSkipped++;
    continue;
  }

  let data;
  try {
    const raw = fs.readFileSync(filepath, 'utf-8');
    data = JSON.parse(raw);
  } catch (e) {
    console.log(`  SKIP (parse error): ${filename} -- ${e.message}`);
    filesSkipped++;
    continue;
  }

  const existingBefore = countExisting(data);
  const added = traverse(data);

  if (added > 0) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  const totalFinal = existingBefore + added;
  results.push({ filename, existing: existingBefore, added, total: totalFinal });

  grandTotalExisting += existingBefore;
  grandTotalAdded += added;
  grandTotalFinal += totalFinal;
  filesProcessed++;
}

// ── Print results table ───────────────────────────────────────────────
const colFile = 44;
const colExist = 10;
const colAdded = 10;
const colTotal = 10;

console.log(
  'File'.padEnd(colFile) +
  'Existing'.padStart(colExist) +
  'Added'.padStart(colAdded) +
  'Total'.padStart(colTotal)
);
console.log('-'.repeat(colFile + colExist + colAdded + colTotal));

for (const r of results) {
  console.log(
    r.filename.padEnd(colFile) +
    String(r.existing).padStart(colExist) +
    (r.added > 0 ? ('+' + r.added) : '0').padStart(colAdded) +
    String(r.total).padStart(colTotal)
  );
}

console.log('-'.repeat(colFile + colExist + colAdded + colTotal));
console.log(
  'TOTAL'.padEnd(colFile) +
  String(grandTotalExisting).padStart(colExist) +
  ('+' + grandTotalAdded).padStart(colAdded) +
  String(grandTotalFinal).padStart(colTotal)
);

console.log('');
console.log(`Files processed: ${filesProcessed}`);
console.log(`Files skipped:   ${filesSkipped}`);
console.log(`Total verifyUrls added: ${grandTotalAdded}`);
