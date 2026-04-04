/**
 * fix-frequency-verifyurl.cjs
 *
 * Adds a "verifyUrl" field to every root entry in frequency-learning-path.json
 * that doesn't already have one. The value is copied from the existing "corpusUrl".
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'app', 'src', 'data', 'frequency-learning-path.json');

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

let updated = 0;
let skipped = 0;

for (const tier of data.tiers) {
  for (const root of tier.roots) {
    if (root.verifyUrl) {
      skipped++;
      continue;
    }
    if (!root.corpusUrl) {
      console.warn(`  WARN: root rank ${root.rank} ("${root.root}") has no corpusUrl – skipping`);
      skipped++;
      continue;
    }
    root.verifyUrl = root.corpusUrl;
    updated++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`Done.`);
console.log(`  Entries updated (verifyUrl added): ${updated}`);
console.log(`  Entries skipped (already had verifyUrl or no corpusUrl): ${skipped}`);
console.log(`  Total roots processed: ${updated + skipped}`);
