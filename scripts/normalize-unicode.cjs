/**
 * normalize-unicode.cjs
 *
 * Normalizes all verse text fields in quran-uthmani.json and quran-vocalized.json
 * to Unicode NFC form. This ensures consistent encoding for text comparison,
 * hashing, and cross-platform processing.
 *
 * Only the "text" fields inside verse objects are touched.
 * No other content is modified.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'app', 'src', 'data');

const FILES = [
  'quran-uthmani.json',
  'quran-vocalized.json',
];

let totalChanged = 0;
let totalVerses = 0;

for (const filename of FILES) {
  const filePath = path.join(DATA_DIR, filename);

  console.log(`\n--- Processing ${filename} ---`);

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  let changed = 0;
  let verses = 0;

  for (const surah of data.surahs) {
    for (const verse of surah.verses) {
      verses++;
      const original = verse.text;
      const normalized = original.normalize('NFC');

      if (normalized !== original) {
        verse.text = normalized;
        changed++;
      }
    }
  }

  // Write back with same formatting (2-space indent, trailing newline)
  const output = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, output, 'utf8');

  console.log(`  Total verses: ${verses}`);
  console.log(`  Changed (non-NFC -> NFC): ${changed}`);
  console.log(`  Already NFC: ${verses - changed}`);

  totalChanged += changed;
  totalVerses += verses;
}

console.log(`\n=== Summary ===`);
console.log(`Total verses processed: ${totalVerses}`);
console.log(`Total verses normalized: ${totalChanged}`);
console.log(`Done.`);
