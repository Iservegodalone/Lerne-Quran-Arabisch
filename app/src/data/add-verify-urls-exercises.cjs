/**
 * add-verify-urls-exercises.cjs
 *
 * Traverses exercise / advanced-topic JSON files and adds a verifyUrl field
 * to every object that contains a Quran surah:ayah reference but does not
 * yet have a verifyUrl.
 *
 * Recognised reference keys: ref, location, quranicLocation, verse, verses
 * Recognised patterns:
 *   "2:255"        -> chapter=2&verse=255
 *   "2:35-36"      -> chapter=2&verse=35   (first verse of range)
 *   "1:4:1"        -> chapter=1&verse=4    (surah:ayah:word — word ignored)
 *   "24:35a"       -> chapter=24&verse=35  (trailing letter stripped)
 *   "55:1-4"       -> chapter=55&verse=1   (range)
 *
 * Objects that already have a verifyUrl are skipped.
 * The "verse" key is only used when it contains a surah:ayah pattern
 * (not when it holds Arabic text).
 */

const fs = require('fs');
const path = require('path');

// ── Files to process ──────────────────────────────────────────────────
const files = [
  'cloze-exercises.json',
  'context-disambiguation-exercises.json',
  'decomposition-exercises.json',
  'error-correction-exercises.json',
  'pattern-recognition-generated.json',
  'verse-synthesis-exercises.json',
  'ring-composition-drill.json',
  'speech-act-drill.json',
  'balagha-lessons.json',
  'discourse-structure.json',
  'hapax-legomena.json',
  'idafa-subtypes.json',
  'ambiguities.json',
  'disambiguation-lesson.json',
  'advanced-stages.json',
  'layer-buildup-drill.json',
  'surah-macrostructure.json',
  'case-derivation-generated.json',
  'alif-wasla-generated.json',
  'rasm-vocalization-drill-generated.json',
  'rasm-vocalization-drill-ext.json',
  'reverse-rasm-drill.json',
  'masdar-clause.json',
  'maf-ul-mutlaq.json',
  'maf-ul-liajlihi.json',
  'maf-ul-maahu.json',
  'pausal-forms-drill.json',
  'pausal-forms-drill-ext.json',
  'vowel-length-drill.json',
  'minimal-pairs-drill.json',
  'polysemy-drill.json',
  'synonym-contrast.json',
  'verb-form-semantics.json',
  'verb-rection.json',
  'preposition-semantics.json',
  'rasm-orthography.json',
  'rasm-decoding-drill.json',
  'rasm-vocalization-drill.json',
  'alif-wasla-drill.json',
  'hamza-seat-rules.json',
  'weak-root-transformation-drill.json'
];

const dataDir = path.join(__dirname);

// ── Regex: matches surah:ayah with optional word-position or sub-verse letter ──
// Must start with digits, colon, digits.  Optionally followed by
//   :digits  (word position)   OR   a-z (sub-verse letter)   OR   -digits (range end)
const REF_PATTERN = /^(\d{1,3}):(\d{1,3})(?:[a-z])?(?:[-–]\d{1,3}[a-z]?)?(?::\d+)?$/;

// Keys that may hold a surah:ayah reference
const REF_KEYS = ['ref', 'location', 'quranicLocation', 'verse', 'verses'];

function buildUrl(chapter, verse) {
  return `https://corpus.quran.com/wordbyword.jsp?chapter=${chapter}&verse=${verse}`;
}

/**
 * Try to extract chapter + verse from a string value.
 * Returns { chapter, verse } or null.
 */
function parseRef(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(REF_PATTERN);
  if (!m) return null;
  const chapter = parseInt(m[1], 10);
  const verse = parseInt(m[2], 10);
  if (chapter < 1 || chapter > 114 || verse < 1 || verse > 300) return null;
  return { chapter, verse };
}

/**
 * Recursively walk every object/array in the JSON tree.
 * For each plain object that has a recognised ref key with a valid
 * surah:ayah pattern and NO existing verifyUrl, add verifyUrl.
 * Returns the number of URLs added.
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
    // Check this object for ref keys
    if (!('verifyUrl' in node)) {
      for (const key of REF_KEYS) {
        if (key in node) {
          const parsed = parseRef(node[key]);
          if (parsed) {
            node.verifyUrl = buildUrl(parsed.chapter, parsed.verse);
            added++;
            break;  // one verifyUrl per object
          }
        }
      }
    }

    // Recurse into all values
    for (const val of Object.values(node)) {
      added += traverse(val);
    }
  }

  return added;
}

// ── Main ──────────────────────────────────────────────────────────────
let totalAdded = 0;
let filesProcessed = 0;
let filesSkipped = 0;

for (const filename of files) {
  const filepath = path.join(dataDir, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`  SKIP (not found): ${filename}`);
    filesSkipped++;
    continue;
  }

  const raw = fs.readFileSync(filepath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.log(`  SKIP (parse error): ${filename} — ${e.message}`);
    filesSkipped++;
    continue;
  }

  const added = traverse(data);

  if (added > 0) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`  +${String(added).padStart(4)} verifyUrl  ${filename}`);
    totalAdded += added;
  } else {
    console.log(`     0 new          ${filename}`);
  }
  filesProcessed++;
}

console.log('');
console.log(`Done. ${filesProcessed} files processed, ${filesSkipped} skipped.`);
console.log(`Total verifyUrl fields added: ${totalAdded}`);
