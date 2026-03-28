/**
 * Cross-Validation Script: Teil C.1 and C.2
 *
 * C.1 - Cross-validate morphology DB against Quran text
 * C.2 - Word Segmentation Analysis
 *
 * Usage: node cross-validate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================================================================
// Load data files
// ==================================================================

const dataDir = path.join(__dirname, '..', 'src', 'data');

const morphDB = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'quran-morphology-db.json'), 'utf8')
);
const quranText = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'quran-simple-clean.json'), 'utf8')
);

// ==================================================================
// Helpers
// ==================================================================

// Arabic vowel marks (tashkeel/diacritics) regex - matches the project's arabic.js
const VOWEL_MARKS_REGEX = /[\u064B-\u0652\u0670\u0657\u0656]/g;
const TATWEEL_REGEX = /\u0640/g;

function stripVowelMarks(text) {
  return text.replace(VOWEL_MARKS_REGEX, '');
}

function cleanArabicText(text) {
  return stripVowelMarks(text).replace(TATWEEL_REGEX, '');
}

// Normalize Arabic text for comparison:
// - Strip diacritics/vowels
// - Remove tatweel
// - Normalize alef variants to bare alef
// - Normalize taa marbuta / haa
// - Remove any zero-width characters
function normalizeForComparison(text) {
  let s = cleanArabicText(text);
  // Normalize alef variants
  s = s.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627'); // alef madda, hamza above, hamza below, wasla -> alef
  // Remove superscript/subscript alef
  s = s.replace(/\u0670/g, '');
  // Remove zero-width characters
  s = s.replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g, ''); // eslint-disable-line no-misleading-character-class
  // Normalize final yaa forms
  s = s.replace(/\u0649/g, '\u064A'); // alef maqsura -> yaa
  return s;
}

// ==================================================================
// Build verse lookup: "surah:verse" -> text
// ==================================================================

const verseLookup = new Map();
let totalTextWords = 0;

quranText.surahs.forEach(surah => {
  surah.verses.forEach(verse => {
    const key = `${surah.number}:${verse.number}`;
    verseLookup.set(key, verse.text);
    const words = verse.text.trim().split(/\s+/).filter(w => w.length > 0);
    totalTextWords += words.length;
  });
});

// ==================================================================
// C.1 - Cross-validate morphology DB against Quran text
// ==================================================================

console.log('='.repeat(72));
console.log('  TEIL C.1 - Cross-validate morphology DB against Quran text');
console.log('='.repeat(72));
console.log();

let totalChecked = 0;
let totalMatches = 0;
let totalMismatches = 0;
let totalVerseNotFound = 0;
let totalWordOutOfRange = 0;

// Classification buckets
const mismatchExamples = [];
const classifiedMismatches = {
  yaAyyuha: [],           // "ya ayyuha" vocative shifts
  hamzaAlef: [],          // Hamza/alef normalization differences
  segmentShift: [],       // shifted fields due to word count mismatch
  otherNormalization: [], // other normalization differences
  outOfRange: [],         // word index exceeds text word count
  unknown: [],
};

// Track verse-level word count mismatches
const verseWordCountMismatches = new Map(); // verseKey -> {textCount, dbMaxIdx}

// First pass: find verses where DB word count != text word count
morphDB.words.forEach(w => {
  const parts = w.l.split(':');
  const surahNum = parseInt(parts[0]);
  const verseNum = parseInt(parts[1]);
  const wordIdx = parseInt(parts[2]);
  const verseKey = `${surahNum}:${verseNum}`;

  if (!verseWordCountMismatches.has(verseKey)) {
    verseWordCountMismatches.set(verseKey, { dbMaxIdx: wordIdx });
  } else {
    const entry = verseWordCountMismatches.get(verseKey);
    if (wordIdx > entry.dbMaxIdx) entry.dbMaxIdx = wordIdx;
  }
});

const shiftedVerses = new Set();
for (const [verseKey, info] of verseWordCountMismatches) {
  const text = verseLookup.get(verseKey);
  if (!text) continue;
  const textWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (textWords.length !== info.dbMaxIdx) {
    shiftedVerses.add(verseKey);
  }
}

// Second pass: compare each DB word against text
morphDB.words.forEach(w => {
  const parts = w.l.split(':');
  const surahNum = parseInt(parts[0]);
  const verseNum = parseInt(parts[1]);
  const wordIdx = parseInt(parts[2]); // 1-indexed
  const verseKey = `${surahNum}:${verseNum}`;

  totalChecked++;

  const verseTextRaw = verseLookup.get(verseKey);
  if (!verseTextRaw) {
    totalVerseNotFound++;
    return;
  }

  const textWords = verseTextRaw.trim().split(/\s+/).filter(w => w.length > 0);

  if (wordIdx < 1 || wordIdx > textWords.length) {
    totalWordOutOfRange++;
    classifiedMismatches.outOfRange.push({
      location: w.l,
      dbConsonants: w.c,
      textWordCount: textWords.length,
      dbWordIdx: wordIdx,
    });
    return;
  }

  const textWord = textWords[wordIdx - 1]; // convert to 0-indexed
  const dbConsonants = w.c;

  // Normalize both sides for comparison
  const normText = normalizeForComparison(textWord);
  const normDB = normalizeForComparison(dbConsonants);

  if (normText === normDB) {
    totalMatches++;
  } else {
    totalMismatches++;

    const mismatchInfo = {
      location: w.l,
      dbConsonants: dbConsonants,
      textWord: textWord,
      normDB: normDB,
      normText: normText,
      dbVocalized: w.v,
      dbRoot: w.r,
      dbPOS: w.p,
      verseText: verseTextRaw.substring(0, 120),
    };

    if (mismatchExamples.length < 50) {
      mismatchExamples.push(mismatchInfo);
    }

    // Classify the mismatch
    const isShiftedVerse = shiftedVerses.has(verseKey);

    if (isShiftedVerse) {
      // Check if this is a "ya ayyuha" pattern
      const verseText = verseTextRaw;
      if (verseText.includes('\u064A\u0627 \u0623\u064A\u0647\u0627') || // يا أيها
          verseText.includes('\u064A\u0627 \u0623\u064A\u0647') ||       // يا أيه
          verseText.includes('\u064A\u0627 \u0628\u0646\u064A') ||       // يا بني
          verseText.includes('\u064A\u0627 \u0642\u0648\u0645') ||       // يا قوم
          verseText.includes('\u064A\u0627 \u0622\u062F\u0645') ||       // يا آدم
          verseText.includes('\u064A\u0627 \u0645\u0648\u0633\u0649') || // يا موسى
          verseText.includes('\u064A\u0627 \u0645\u0631\u064A\u0645') || // يا مريم
          verseText.includes('\u064A\u0627 \u0639\u064A\u0633\u0649') || // يا عيسى
          verseText.includes('\u064A\u0627 \u0623\u0647\u0644') ||       // يا أهل
          verseText.includes('\u064A\u0627 \u0646\u0648\u062D') ||       // يا نوح
          verseText.includes('\u064A\u0627 \u0625\u0628\u0631\u0627\u0647\u064A\u0645')) { // يا إبراهيم
        classifiedMismatches.yaAyyuha.push(mismatchInfo);
      } else {
        classifiedMismatches.segmentShift.push(mismatchInfo);
      }
    } else {
      // Check if the difference is just hamza/alef normalization
      const furtherNormDB = normDB.replace(/[\u0621\u0623\u0625\u0622\u0627\u0671]/g, 'A');
      const furtherNormText = normText.replace(/[\u0621\u0623\u0625\u0622\u0627\u0671]/g, 'A');
      if (furtherNormDB === furtherNormText) {
        classifiedMismatches.hamzaAlef.push(mismatchInfo);
      } else {
        classifiedMismatches.otherNormalization.push(mismatchInfo);
      }
    }
  }
});

// Print C.1 results
console.log('--- Summary ---');
console.log(`Total morphology DB entries:     ${morphDB.words.length}`);
console.log(`Total entries checked:           ${totalChecked}`);
console.log(`Verse not found in text:         ${totalVerseNotFound}`);
console.log(`Word index out of range:         ${totalWordOutOfRange}`);
console.log(`Matches (normalized):            ${totalMatches}`);
console.log(`Mismatches (normalized):         ${totalMismatches}`);
console.log(`Match rate:                      ${((totalMatches / (totalMatches + totalMismatches)) * 100).toFixed(2)}%`);
console.log();

console.log('--- Mismatch Classification ---');
console.log(`"ya X" vocative offset:          ${classifiedMismatches.yaAyyuha.length}`);
console.log(`Hamza/alef normalization:         ${classifiedMismatches.hamzaAlef.length}`);
console.log(`Segment shift (non-vocative):     ${classifiedMismatches.segmentShift.length}`);
console.log(`Other normalization diff:         ${classifiedMismatches.otherNormalization.length}`);
console.log(`Word index out of range:          ${classifiedMismatches.outOfRange.length}`);
console.log();

console.log(`Total verses with word-count mismatch: ${shiftedVerses.size}`);
console.log();

// Show examples of each type
function showExamples(label, arr, count = 5) {
  if (arr.length === 0) return;
  console.log(`--- Examples: ${label} (showing ${Math.min(count, arr.length)} of ${arr.length}) ---`);
  arr.slice(0, count).forEach(m => {
    console.log(`  Location: ${m.location}`);
    console.log(`    DB consonants: "${m.dbConsonants}" (norm: "${m.normDB}")`);
    console.log(`    Text word:     "${m.textWord}" (norm: "${m.normText}")`);
    if (m.dbVocalized) console.log(`    DB vocalized:  "${m.dbVocalized}"`);
    if (m.dbPOS) console.log(`    DB POS:        ${m.dbPOS}`);
    console.log();
  });
}

showExamples('"ya X" vocative offset mismatches', classifiedMismatches.yaAyyuha, 8);
showExamples('Hamza/alef normalization differences', classifiedMismatches.hamzaAlef, 8);
showExamples('Segment shift (non-vocative)', classifiedMismatches.segmentShift, 8);
showExamples('Other normalization differences', classifiedMismatches.otherNormalization, 8);
showExamples('Word index out of range', classifiedMismatches.outOfRange, 5);

// Show specific analysis of the "ya ayyuha" pattern
console.log('--- Detailed "ya ayyuha" pattern analysis ---');
// Find a specific example
const example221 = morphDB.words.filter(w => w.l.startsWith('2:21:'));
const text221 = verseLookup.get('2:21');
if (text221) {
  const textWords221 = text221.trim().split(/\s+/);
  console.log(`Verse 2:21 text: "${text221}"`);
  console.log(`Text words (${textWords221.length}): ${textWords221.map((w, i) => `[${i + 1}]${w}`).join(' ')}`);
  console.log(`DB entries (${example221.length}):`);
  example221.forEach(e => {
    console.log(`  ${e.l}: c="${e.c}" v="${e.v}" p=${e.p} r=${e.r || 'null'}`);
  });
  console.log();
  console.log('OBSERVATION: The text has 12 whitespace-separated words ("ya" and "ayyuha" are separate),');
  console.log('but the DB has only 11 entries. Looking at the DB, the c-field matches the text words');
  console.log('sequentially, but since the DB has fewer entries, all fields (v, r, p, m) are shifted');
  console.log('by 1 position after the "ya ayyuha" merge point. This means the vocalized/root/POS data');
  console.log('for these entries is MISALIGNED with the consonantal text.');
}
console.log();

// ==================================================================
// C.2 - Word Segmentation Analysis
// ==================================================================

console.log('='.repeat(72));
console.log('  TEIL C.2 - Word Segmentation Analysis');
console.log('='.repeat(72));
console.log();

console.log('--- Word Count Comparison ---');
console.log(`Total whitespace-separated words in Quran text:  ${totalTextWords}`);
console.log(`Total morphology DB entries:                     ${morphDB.words.length}`);
console.log(`Difference (text - DB):                          ${totalTextWords - morphDB.words.length}`);
console.log();

// Count how many verses have more text words than DB entries, and vice versa
let versesWithMoreText = 0;
let versesWithMoreDB = 0;
let versesEqual = 0;
let totalExtraTextWords = 0;
let totalExtraDBWords = 0;

const verseDifferences = [];

for (const [verseKey, info] of verseWordCountMismatches) {
  const text = verseLookup.get(verseKey);
  if (!text) continue;
  const textWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  const diff = textWords.length - info.dbMaxIdx;

  if (diff > 0) {
    versesWithMoreText++;
    totalExtraTextWords += diff;
    verseDifferences.push({ verseKey, textCount: textWords.length, dbCount: info.dbMaxIdx, diff });
  } else if (diff < 0) {
    versesWithMoreDB++;
    totalExtraDBWords += Math.abs(diff);
    verseDifferences.push({ verseKey, textCount: textWords.length, dbCount: info.dbMaxIdx, diff });
  } else {
    versesEqual++;
  }
}

console.log('--- Verse-level word count comparison ---');
console.log(`Verses where text == DB word count:              ${versesEqual}`);
console.log(`Verses where text > DB word count:               ${versesWithMoreText} (text has ${totalExtraTextWords} extra words total)`);
console.log(`Verses where text < DB word count:               ${versesWithMoreDB} (DB has ${totalExtraDBWords} extra words total)`);
console.log(`Total verses with differences:                   ${versesWithMoreText + versesWithMoreDB}`);
console.log();

// Analyze the pattern: which words cause the text > DB mismatch?
console.log('--- Analysis of text > DB verses ---');
console.log('Most common pattern: vocative "ya" + noun treated as single unit in DB');
console.log();

// Show distribution of differences
const diffDistribution = {};
verseDifferences.forEach(d => {
  const key = d.diff > 0 ? `+${d.diff}` : `${d.diff}`;
  diffDistribution[key] = (diffDistribution[key] || 0) + 1;
});
console.log('Distribution of word count differences (text - DB):');
Object.keys(diffDistribution).sort((a, b) => parseInt(a) - parseInt(b)).forEach(k => {
  console.log(`  diff = ${k}: ${diffDistribution[k]} verses`);
});
console.log();

// Show examples where text > DB
console.log('--- Examples where text has more words than DB ---');
verseDifferences.filter(d => d.diff > 0).slice(0, 10).forEach(d => {
  const text = verseLookup.get(d.verseKey);
  const textWords = text.trim().split(/\s+/);
  console.log(`  ${d.verseKey}: text=${d.textCount} words, DB=${d.dbCount} entries (diff=+${d.diff})`);
  console.log(`    text: "${text.substring(0, 100)}..."`);

  // Find the "ya" pattern
  textWords.forEach((w, i) => {
    if (normalizeForComparison(w) === normalizeForComparison('يا')) {
      console.log(`    -> "ya" found at text position ${i + 1}, next word: "${textWords[i + 1] || '(end)'}"`);
    }
  });
  console.log();
});

// Show examples where DB > text (segmentation: one text word = multiple DB segments)
console.log('--- Examples where DB has more entries than text ---');
const dbMoreExamples = verseDifferences.filter(d => d.diff < 0).slice(0, 10);
dbMoreExamples.forEach(d => {
  const text = verseLookup.get(d.verseKey);
  const textWords = text.trim().split(/\s+/);
  const dbEntries = morphDB.words.filter(w => w.l.startsWith(d.verseKey + ':'));
  console.log(`  ${d.verseKey}: text=${d.textCount} words, DB=${d.dbCount} entries (diff=${d.diff})`);
  console.log(`    text: "${text.substring(0, 100)}..."`);
  console.log(`    DB entries: ${dbEntries.map(e => `[${e.l.split(':')[2]}]${e.c}`).join(' ')}`);
  console.log();
});

// ==================================================================
// Module3 Integration Analysis
// ==================================================================

console.log('='.repeat(72));
console.log('  Module3 Integration Analysis');
console.log('='.repeat(72));
console.log();

console.log('How Module3 maps text words to morphology DB entries:');
console.log();
console.log('1. Module3 uses splitIntoWords(verse.text) which splits on whitespace');
console.log('   -> This produces an array of words with 0-based indices');
console.log();
console.log('2. For each word, it looks up MORPHOLOGY_LOOKUP.get(`${surah}:${verse}:${wordIndex + 1}`)');
console.log('   -> wordIndex is 0-based from the text split, +1 makes it 1-based');
console.log('   -> This directly maps text word position to DB entry location');
console.log();
console.log('3. PROBLEM: In verses where text word count != DB word count:');
console.log(`   -> ${shiftedVerses.size} verses have mismatched word counts`);
console.log('   -> In these verses, the DB fields (v, r, p, m) are shifted relative to c');
console.log('   -> Module3 looks up word N from the text and gets DB entry N');
console.log('   -> The c (consonants) field of DB entry N matches text word N');
console.log('   -> BUT the r (root), p (POS), m (morphology), v (vocalized) fields');
console.log('      may be shifted and belong to a DIFFERENT word');
console.log();

// Demonstrate the impact
console.log('Impact demonstration for verse 2:21 ("ya ayyuha al-nas..."):');
console.log();
const demo221 = morphDB.words.filter(w => w.l.startsWith('2:21:'));
const demoText = verseLookup.get('2:21');
if (demoText) {
  const demoWords = demoText.trim().split(/\s+/);
  console.log('  Word | Text word    | DB c         | DB root    | DB POS | Aligned?');
  console.log('  -----+--------------+--------------+------------+--------+---------');
  for (let i = 0; i < Math.max(demoWords.length, demo221.length); i++) {
    const tw = i < demoWords.length ? demoWords[i] : '(none)';
    const dbe = i < demo221.length ? demo221[i] : null;
    const dbC = dbe ? dbe.c : '(none)';
    const dbR = dbe ? (dbe.r || 'null') : '(none)';
    const dbP = dbe ? dbe.p : '(none)';
    const normTW = i < demoWords.length ? normalizeForComparison(tw) : '';
    const normDBC = dbe ? normalizeForComparison(dbC) : '';
    const aligned = normTW === normDBC ? 'YES' : 'NO *';
    const padTW = tw.padEnd(14);
    const padC = dbC.padEnd(14);
    const padR = dbR.padEnd(12);
    console.log(`  ${(i + 1).toString().padStart(4)} | ${padTW}| ${padC}| ${padR}| ${dbP.padEnd(7)}| ${aligned}`);
  }
  console.log();
  console.log('  * When c does not match the text word, the root/POS data is also wrong');
  console.log('    for that position. This affects Module3\'s root-checking logic.');
}
console.log();

// Final summary
console.log('='.repeat(72));
console.log('  FINAL SUMMARY');
console.log('='.repeat(72));
console.log();
console.log('C.1 Results:');
console.log(`  - ${totalMatches} of ${totalMatches + totalMismatches} word positions match (${((totalMatches / (totalMatches + totalMismatches)) * 100).toFixed(2)}%)`);
console.log(`  - ${totalMismatches} mismatches found:`);
console.log(`    - ${classifiedMismatches.yaAyyuha.length} from "ya X" vocative pattern (text has "ya" + "X" as 2 words, DB merges them)`);
console.log(`    - ${classifiedMismatches.segmentShift.length} from other segment shifts in verses with word-count mismatches`);
console.log(`    - ${classifiedMismatches.hamzaAlef.length} from hamza/alef normalization differences`);
console.log(`    - ${classifiedMismatches.otherNormalization.length} from other normalization differences`);
console.log(`    - ${classifiedMismatches.outOfRange.length} from word index out of range`);
console.log();
console.log('C.2 Results:');
console.log(`  - Quran text has ${totalTextWords} whitespace-separated words`);
console.log(`  - Morphology DB has ${morphDB.words.length} entries`);
console.log(`  - Difference: ${totalTextWords - morphDB.words.length} (text has more words)`);
console.log(`  - ${versesWithMoreText} verses where text has more words than DB entries`);
console.log(`    (mostly "ya" vocative constructions: DB treats "ya X" as fewer entries)`);
console.log(`  - ${versesWithMoreDB} verses where DB has more entries than text words`);
console.log(`    (DB may segment one text word into multiple morphological units)`);
console.log(`  - ${versesEqual} verses where word counts match exactly`);
console.log();
console.log('Module3 Impact:');
console.log(`  - Module3 does a direct 1:1 position lookup: textWordIndex -> DB location`);
console.log(`  - This works correctly for ${versesEqual} of ${versesEqual + shiftedVerses.size} verses (${((versesEqual / (versesEqual + shiftedVerses.size)) * 100).toFixed(1)}%)`);
console.log(`  - For the ${shiftedVerses.size} verses with mismatched word counts,`);
console.log('    the root/POS/morphology data returned may belong to the wrong word.');
console.log('  - Module3 does NOT have any special handling for this offset.');
console.log('  - The consonantal (c) field still matches because it was built from the text,');
console.log('    but the linguistic analysis fields (r, p, m, v) are shifted.');
