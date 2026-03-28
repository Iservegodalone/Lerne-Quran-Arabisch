/**
 * prepare-quran-text.js
 *
 * Reads the Quran Simple Clean text file (tanzil.net format),
 * parses it into structured JSON, performs integrity checks,
 * computes a SHA-256 checksum, and writes the output files.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const INPUT_FILE = path.join(
  process.env.USERPROFILE || process.env.HOME,
  '.claude/projects/C--Users-limao-OneDrive-Desktop-quran-arabic/06f24636-eb31-4975-a38a-25276480c810/tool-results/webfetch-1773795354934-3czvug.bin'
);

const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'data');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'quran-simple-clean.json');
const OUTPUT_CHECKSUM = path.join(OUTPUT_DIR, 'quran-checksum.json');

// Expected verse counts per surah (1-indexed by array position)
const EXPECTED_VERSE_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,
  21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

const TOTAL_SURAHS = 114;
const TOTAL_VERSES = 6236;
const BASMALA = 'بسم الله الرحمن الرحيم';

// Unicode range for Arabic vowel marks (tashkeel/diacritics)
// U+064B (FATHATAN) through U+0652 (SUKUN)
const VOWEL_MARKS_REGEX = /[\u064B-\u0652]/;

// --- Main ---
function main() {
  console.log('=== Quran Simple Clean Text Preparation ===\n');

  // 1. Read the input file
  console.log(`Reading input file: ${INPUT_FILE}`);
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('ERROR: Input file not found!');
    process.exit(1);
  }

  const rawContent = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = rawContent.split(/\r?\n/);
  console.log(`Total lines in file: ${lines.length}`);

  // 2. Filter out comments and empty lines, then parse
  const dataLines = lines.filter(line => line.trim() !== '' && !line.startsWith('#'));
  console.log(`Data lines (verses): ${dataLines.length}`);

  // Parse into structured format
  const surahMap = new Map(); // surahNumber -> { number, verses: [] }

  for (const line of dataLines) {
    const pipeIdx1 = line.indexOf('|');
    const pipeIdx2 = line.indexOf('|', pipeIdx1 + 1);
    if (pipeIdx1 === -1 || pipeIdx2 === -1) {
      console.error(`ERROR: Malformed line: ${line}`);
      process.exit(1);
    }

    const surahNum = parseInt(line.substring(0, pipeIdx1), 10);
    const verseNum = parseInt(line.substring(pipeIdx1 + 1, pipeIdx2), 10);
    const text = line.substring(pipeIdx2 + 1);

    if (!surahMap.has(surahNum)) {
      surahMap.set(surahNum, { number: surahNum, verses: [] });
    }
    surahMap.get(surahNum).verses.push({ number: verseNum, text });
  }

  // Convert map to sorted array
  const surahs = Array.from(surahMap.values()).sort((a, b) => a.number - b.number);

  const quranData = { surahs };

  console.log(`\nParsed ${surahs.length} surahs.\n`);

  // 3. Integrity checks
  let errors = [];
  let warnings = [];

  // Check 3a: Exactly 114 surahs
  console.log('--- Integrity Checks ---');
  if (surahs.length !== TOTAL_SURAHS) {
    errors.push(`Expected ${TOTAL_SURAHS} surahs, found ${surahs.length}`);
  } else {
    console.log(`[PASS] Surah count: ${surahs.length} (expected ${TOTAL_SURAHS})`);
  }

  // Check 3b: Correct verse count per surah
  let totalVerseCount = 0;
  let verseCountErrors = [];
  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i];
    const expected = EXPECTED_VERSE_COUNTS[i];
    totalVerseCount += surah.verses.length;
    if (surah.verses.length !== expected) {
      verseCountErrors.push(
        `Surah ${surah.number}: found ${surah.verses.length} verses, expected ${expected}`
      );
    }
  }

  if (verseCountErrors.length > 0) {
    errors.push(...verseCountErrors);
    console.log(`[FAIL] Verse counts: ${verseCountErrors.length} surah(s) with wrong counts`);
    verseCountErrors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log(`[PASS] Verse counts per surah: all ${TOTAL_SURAHS} surahs correct`);
  }

  if (totalVerseCount !== TOTAL_VERSES) {
    errors.push(`Total verse count: ${totalVerseCount}, expected ${TOTAL_VERSES}`);
  } else {
    console.log(`[PASS] Total verse count: ${totalVerseCount} (expected ${TOTAL_VERSES})`);
  }

  // Check 3c: No vowel marks (tashkeel) in the text
  let vowelMarkCount = 0;
  let vowelMarkExamples = [];
  for (const surah of surahs) {
    for (const verse of surah.verses) {
      const matches = verse.text.match(/[\u064B-\u0652]/g);
      if (matches) {
        vowelMarkCount += matches.length;
        if (vowelMarkExamples.length < 3) {
          vowelMarkExamples.push(
            `Surah ${surah.number}:${verse.number} has ${matches.length} vowel mark(s)`
          );
        }
      }
    }
  }

  if (vowelMarkCount > 0) {
    errors.push(`Found ${vowelMarkCount} vowel marks in text`);
    console.log(`[FAIL] Vowel marks: found ${vowelMarkCount}`);
    vowelMarkExamples.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log(`[PASS] No vowel marks (U+064B-U+0652) found in text`);
  }

  // Check 3d: Basmala at start of every surah except Surah 9
  let basmalaErrors = [];
  for (const surah of surahs) {
    const firstVerse = surah.verses[0];
    if (!firstVerse) {
      basmalaErrors.push(`Surah ${surah.number}: no verses found`);
      continue;
    }

    if (surah.number === 9) {
      // Surah 9 (At-Tawbah) should NOT start with Basmala
      if (firstVerse.text.startsWith(BASMALA)) {
        basmalaErrors.push(`Surah 9: should NOT start with Basmala but does`);
      }
    } else {
      // All other surahs should start with Basmala
      if (!firstVerse.text.startsWith(BASMALA)) {
        basmalaErrors.push(
          `Surah ${surah.number}: does not start with Basmala. Starts with: "${firstVerse.text.substring(0, 40)}..."`
        );
      }
    }
  }

  if (basmalaErrors.length > 0) {
    errors.push(...basmalaErrors);
    console.log(`[FAIL] Basmala check: ${basmalaErrors.length} issue(s)`);
    basmalaErrors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log(`[PASS] Basmala present at start of all surahs except Surah 9`);
  }

  // Check 3e: No surah names, Juz markers, Sajda markers, Rub-el-Hizb
  // These would be non-text markers or metadata that shouldn't appear in clean text
  const MARKER_PATTERNS = [
    { name: 'Rub-el-Hizb (U+06DE)', regex: /\u06DE/ },
    { name: 'Sajda marker (U+06E9)', regex: /\u06E9/ },
    { name: 'Juz marker pattern', regex: /الجزء/ },
    { name: 'Surah name header pattern (سورة)', regex: /^سورة/ },
    { name: 'Ornate left parenthesis (U+FD3E)', regex: /\uFD3E/ },
    { name: 'Ornate right parenthesis (U+FD3F)', regex: /\uFD3F/ },
    { name: 'Star of David / End of Ayah (U+06D6-U+06DC)', regex: /[\u06D6-\u06DC]/ },
    { name: 'Small High markers (U+06DF-U+06E8)', regex: /[\u06DF-\u06E8]/ },
  ];

  let markerIssues = [];
  for (const surah of surahs) {
    for (const verse of surah.verses) {
      for (const pattern of MARKER_PATTERNS) {
        if (pattern.regex.test(verse.text)) {
          markerIssues.push(
            `Surah ${surah.number}:${verse.number} contains ${pattern.name}`
          );
        }
      }
    }
  }

  if (markerIssues.length > 0) {
    errors.push(...markerIssues);
    console.log(`[FAIL] Marker check: ${markerIssues.length} issue(s)`);
    markerIssues.slice(0, 5).forEach(e => console.log(`  - ${e}`));
    if (markerIssues.length > 5) {
      console.log(`  ... and ${markerIssues.length - 5} more`);
    }
  } else {
    console.log(`[PASS] No surah names, Juz markers, Sajda markers, or Rub-el-Hizb found`);
  }

  // Summary of integrity checks
  console.log('\n--- Summary ---');
  if (errors.length > 0) {
    console.error(`FAILED: ${errors.length} error(s) found.`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('All integrity checks PASSED.\n');
  }

  // 4. Compute SHA-256 checksum of the entire concatenated text
  const allText = surahs
    .flatMap(s => s.verses.map(v => v.text))
    .join('');

  const checksum = crypto.createHash('sha256').update(allText, 'utf-8').digest('hex');
  console.log(`SHA-256 checksum: ${checksum}`);
  console.log(`Concatenated text length: ${allText.length} characters\n`);

  // 5. Write output JSON
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const jsonStr = JSON.stringify(quranData, null, 2);
  fs.writeFileSync(OUTPUT_JSON, jsonStr, 'utf-8');
  console.log(`Written Quran data to: ${OUTPUT_JSON}`);
  console.log(`  File size: ${(Buffer.byteLength(jsonStr, 'utf-8') / 1024).toFixed(1)} KB`);

  // 6. Write checksum JSON
  const checksumData = {
    algorithm: 'sha256',
    hash: checksum,
    description: 'SHA-256 of all verse texts concatenated in order (no separators)',
    totalSurahs: TOTAL_SURAHS,
    totalVerses: TOTAL_VERSES,
    generatedAt: new Date().toISOString()
  };

  const checksumStr = JSON.stringify(checksumData, null, 2);
  fs.writeFileSync(OUTPUT_CHECKSUM, checksumStr, 'utf-8');
  console.log(`Written checksum to: ${OUTPUT_CHECKSUM}`);

  console.log('\nDone! All files generated successfully.');
}

main();
