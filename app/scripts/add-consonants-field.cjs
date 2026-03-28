/**
 * add-consonants-field.js
 *
 * Adds the `c` (consonants) field to every entry in quran-morphology-db.json.
 * The consonantal form is the unvocalized word taken from quran-simple-clean.json.
 *
 * Usage:  node app/scripts/add-consonants-field.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MORPH_PATH = path.join(DATA_DIR, 'quran-morphology-db.json');
const TEXT_PATH = path.join(DATA_DIR, 'quran-simple-clean.json');

// ---------------------------------------------------------------------------
// 1. Load both files
// ---------------------------------------------------------------------------
console.log('Loading quran-simple-clean.json...');
const quranText = JSON.parse(fs.readFileSync(TEXT_PATH, 'utf8'));

console.log('Loading quran-morphology-db.json...');
const morphDb = JSON.parse(fs.readFileSync(MORPH_PATH, 'utf8'));

// ---------------------------------------------------------------------------
// 2. Build a fast lookup:  "surah:verse" -> [word1, word2, ...]
// ---------------------------------------------------------------------------
console.log('Building word lookup table...');
const verseLookup = {};
for (const surah of quranText.surahs) {
  for (const verse of surah.verses) {
    const key = `${surah.number}:${verse.number}`;
    verseLookup[key] = verse.text.split(' ');
  }
}

// ---------------------------------------------------------------------------
// 3. For each morphology entry, resolve the consonantal word and add `c`
// ---------------------------------------------------------------------------
console.log(`Processing ${morphDb.words.length} morphology entries...`);

let matched = 0;
let missing = 0;

for (const word of morphDb.words) {
  // location format: "surah:verse:wordIndex" (1-based)
  const parts = word.l.split(':');
  const surah = parts[0];
  const verse = parts[1];
  const wordIdx = parseInt(parts[2], 10); // 1-based

  const key = `${surah}:${verse}`;
  const verseWords = verseLookup[key];

  if (!verseWords) {
    console.warn(`  WARNING: verse not found for location ${word.l}`);
    missing++;
    continue;
  }

  // The simple-clean text prepends "بسم الله الرحمن الرحيم" (4 words) to
  // verse 1 of every surah except surah 1 (where it IS verse 1) and surah 9
  // (which has no Bismillah). The morphology DB does NOT include Bismillah
  // words for surahs 2-8 and 10-114, so we need to offset by 4.
  const surahNum = parseInt(surah, 10);
  const verseNum = parseInt(verse, 10);
  const bismillahOffset = (verseNum === 1 && surahNum !== 1 && surahNum !== 9) ? 4 : 0;

  const consonant = verseWords[wordIdx - 1 + bismillahOffset]; // convert to 0-based + offset
  if (consonant === undefined) {
    console.warn(`  WARNING: word index out of range for location ${word.l} (verse has ${verseWords.length} words)`);
    missing++;
    continue;
  }

  // Insert `c` right after `l` for consistent field order: l, c, r, p, m, v
  const newWord = {
    l: word.l,
    c: consonant,
    r: word.r,
    p: word.p,
    m: word.m,
    v: word.v,
  };
  // Replace in-place in the array
  Object.keys(word).forEach(k => delete word[k]);
  Object.assign(word, newWord);

  matched++;
}

console.log(`  Matched: ${matched}`);
console.log(`  Missing: ${missing}`);

// ---------------------------------------------------------------------------
// 4. Update meta to document the new field
// ---------------------------------------------------------------------------
morphDb.meta.description =
  'Word-by-word morphological analysis. l=location, c=consonants, r=root, p=POS, m=morphology, v=vocalized';

// ---------------------------------------------------------------------------
// 5. Write updated DB back
// ---------------------------------------------------------------------------
console.log('Writing updated quran-morphology-db.json...');
fs.writeFileSync(MORPH_PATH, JSON.stringify(morphDb), 'utf8');
console.log('Done.');
