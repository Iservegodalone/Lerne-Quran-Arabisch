/**
 * fix-root-freq-urls.cjs
 *
 * Adds a verifyUrl field to every root entry in root-frequency-complete.json
 * that has sampleLocations but no verifyUrl yet.
 *
 * The URL is derived from the FIRST sampleLocation.
 * Format: "2:3:1" -> surah=2, ayah=3
 *   => https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=3
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'app',
  'src',
  'data',
  'root-frequency-complete.json'
);

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let updated = 0;
let skippedNoLocations = 0;
let skippedHasUrl = 0;

for (const entry of data.roots) {
  if (entry.verifyUrl) {
    skippedHasUrl++;
    continue;
  }

  if (!entry.sampleLocations || entry.sampleLocations.length === 0) {
    skippedNoLocations++;
    continue;
  }

  const firstLoc = entry.sampleLocations[0];
  const parts = firstLoc.split(':');
  const surah = parts[0];
  const ayah = parts[1];

  entry.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${surah}&verse=${ayah}`;
  updated++;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Done.`);
console.log(`  Updated (verifyUrl added): ${updated}`);
console.log(`  Skipped (already had verifyUrl): ${skippedHasUrl}`);
console.log(`  Skipped (no sampleLocations): ${skippedNoLocations}`);
console.log(`  Total roots processed: ${data.roots.length}`);
