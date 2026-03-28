/**
 * fill-lanes-meanings.cjs
 *
 * Fills empty "meaning" fields in lanes-lexicon-urls.json
 * using root-meanings.json as the primary source.
 *
 * Root format differences:
 *   lanes-lexicon-urls.json: "ح-د-د" (hyphens)
 *   root-meanings.json:      "ح د د" (spaces)
 *
 * Also handles hamza variants (ا/أ/إ/آ/ء/ئ/ؤ) for matching.
 */

const fs = require('fs');
const path = require('path');

const dataDir = __dirname;

// Load files
const lanesPath = path.join(dataDir, 'lanes-lexicon-urls.json');
const meaningsPath = path.join(dataDir, 'root-meanings.json');

const lanesRaw = fs.readFileSync(lanesPath, 'utf8');
const lanes = JSON.parse(lanesRaw);
const meanings = JSON.parse(fs.readFileSync(meaningsPath, 'utf8'));

// Normalize a root string: strip hyphens, spaces, and normalize hamza forms
function normalizeRoot(root) {
  return root
    .replace(/[-\s]/g, '')  // strip hyphens and spaces
    .replace(/[أإآءئؤ]/g, 'ا');  // normalize all hamza variants to bare alif
}

// Build lookup map from root-meanings.json (normalized root -> meaning)
const meaningMap = new Map();
const meaningMapByArabic = new Map();

for (const entry of meanings.roots) {
  const normalized = normalizeRoot(entry.root);
  meaningMap.set(normalized, entry.meaning);

  // Also index by rootArabic if present
  if (entry.rootArabic) {
    meaningMapByArabic.set(normalizeRoot(entry.rootArabic), entry.meaning);
  }
}

console.log(`root-meanings.json: ${meanings.roots.length} roots loaded`);
console.log(`meaningMap entries: ${meaningMap.size}`);

// Process lanes-lexicon-urls.json
const lanesRoots = lanes.frequentRootsWithLaneReferences.roots;
let filled = 0;
let stillEmpty = 0;
let alreadyFilled = 0;
const notFound = [];

for (const entry of lanesRoots) {
  // STRICT check: only fill entries where meaning is exactly an empty string
  if (entry.meaning !== '') {
    alreadyFilled++;
    continue;
  }

  // Try to find meaning
  const normalizedRoot = normalizeRoot(entry.root);
  const normalizedArabic = entry.rootArabic ? normalizeRoot(entry.rootArabic) : null;

  let foundMeaning = null;

  // Strategy 1: Match by normalized root (from the hyphenated root field)
  if (meaningMap.has(normalizedRoot)) {
    foundMeaning = meaningMap.get(normalizedRoot);
  }

  // Strategy 2: Match by rootArabic
  if (!foundMeaning && normalizedArabic) {
    if (meaningMap.has(normalizedArabic)) {
      foundMeaning = meaningMap.get(normalizedArabic);
    } else if (meaningMapByArabic.has(normalizedArabic)) {
      foundMeaning = meaningMapByArabic.get(normalizedArabic);
    }
  }

  if (foundMeaning) {
    // Extract just the core meaning (before the em-dash explanation if present)
    // e.g. "Grenze, Eisen, entgegentreten" stays as-is
    // but "sagen, sprechen — Grundbedeutung der sprachlichen Äußerung" -> "sagen, sprechen"
    const dashIndex = foundMeaning.indexOf(' — ');
    entry.meaning = dashIndex > 0 ? foundMeaning.substring(0, dashIndex) : foundMeaning;
    filled++;
  } else {
    stillEmpty++;
    notFound.push({
      root: entry.root,
      rootArabic: entry.rootArabic,
      normalized: normalizedRoot
    });
  }
}

// Write back, preserving formatting
fs.writeFileSync(lanesPath, JSON.stringify(lanes, null, 2) + '\n', 'utf8');

console.log('\n=== Results ===');
console.log(`Already had meaning: ${alreadyFilled}`);
console.log(`Filled from root-meanings.json: ${filled}`);
console.log(`Still empty (not found): ${stillEmpty}`);
console.log(`Total roots in lanes: ${lanesRoots.length}`);

if (notFound.length > 0) {
  console.log(`\nRoots not found in sources (${notFound.length}):`);
  notFound.forEach(r => console.log(`  ${r.root} (${r.rootArabic}) [normalized: ${r.normalized}]`));
}
