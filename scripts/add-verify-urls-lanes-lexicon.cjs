/**
 * add-verify-urls-lanes-lexicon.cjs
 *
 * Adds verifyUrl to all root entries in lanes-lexicon-urls.json.
 *
 * Each root gets verifyUrl = corpusUrl (the Quran corpus dictionary page).
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'app', 'src', 'data', 'lanes-lexicon-urls.json');

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

let added = 0;
let skipped = 0;

const roots = data.frequentRootsWithLaneReferences.roots;

for (const root of roots) {
  if (root.verifyUrl) {
    skipped++;
    continue;
  }
  if (root.corpusUrl) {
    root.verifyUrl = root.corpusUrl;
    added++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log('=== lanes-lexicon-urls.json verifyUrl Report ===');
console.log(`Roots: ${added} verifyUrl added`);
console.log(`Skipped (already present): ${skipped}`);
