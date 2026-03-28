/**
 * add-corpus-urls-semantic.cjs
 *
 * Adds corpusUrl fields to thematic-fields.json and collocations.json.
 * Each corpusUrl links to the Quran dictionary page for the given root.
 *
 * Format: https://corpus.quran.com/qurandictionary.jsp?q={ROOT}
 * where {ROOT} is the Arabic root consonants (spaces removed, URL-encoded).
 */

const fs = require('fs');
const path = require('path');

const BASE = __dirname;

// ── helpers ────────────────────────────────────────────────────────────
function rootToCorpusUrl(rootStr) {
  // Root fields look like "ا ل ه" — remove spaces, then URL-encode
  const bare = rootStr.replace(/\s+/g, '');
  return `https://corpus.quran.com/qurandictionary.jsp?q=${encodeURIComponent(bare)}`;
}

// ── thematic-fields.json ───────────────────────────────────────────────
const tfPath = path.join(BASE, 'thematic-fields.json');
const tf = JSON.parse(fs.readFileSync(tfPath, 'utf8'));

let tfAdded = 0;
let tfSkipped = 0;
let tfTotal = 0;

for (const field of tf.fields) {
  for (const entry of field.roots) {
    tfTotal++;
    if (entry.corpusUrl) {
      tfSkipped++;
      continue;
    }
    entry.corpusUrl = rootToCorpusUrl(entry.root);
    tfAdded++;
  }
}

fs.writeFileSync(tfPath, JSON.stringify(tf, null, 2) + '\n', 'utf8');
console.log(`\n=== thematic-fields.json ===`);
console.log(`  Total root entries : ${tfTotal}`);
console.log(`  Already had URL    : ${tfSkipped}`);
console.log(`  URLs added         : ${tfAdded}`);

// ── collocations.json ──────────────────────────────────────────────────
const colPath = path.join(BASE, 'collocations.json');
const col = JSON.parse(fs.readFileSync(colPath, 'utf8'));

let rcAdded = 0;
let rcSkipped = 0;
let rcTotal = 0;

// rootCollocations — add corpusUrl for root1 AND root2
for (const pair of col.rootCollocations) {
  rcTotal++;
  if (pair.corpusUrl1) {
    rcSkipped++;
  } else {
    pair.corpusUrl1 = rootToCorpusUrl(pair.root1);
    rcAdded++;
  }
  if (pair.corpusUrl2) {
    // already counted in rcSkipped above is misleading; count separately
  } else {
    pair.corpusUrl2 = rootToCorpusUrl(pair.root2);
    // count together with rcAdded (each pair gets 2 URLs)
  }
}

// wordBigrams — these are phrases, not roots; no root field to link.
// Skip them (no meaningful single-root dictionary link).
const wbTotal = col.wordBigrams ? col.wordBigrams.length : 0;

fs.writeFileSync(colPath, JSON.stringify(col, null, 2) + '\n', 'utf8');
console.log(`\n=== collocations.json ===`);
console.log(`  rootCollocations   : ${rcTotal} pairs`);
console.log(`  Pairs already done : ${rcSkipped}`);
console.log(`  corpusUrl1+2 added : ${rcAdded} pairs (${rcAdded * 2} URLs total)`);
console.log(`  wordBigrams        : ${wbTotal} (no root field — skipped)`);

console.log(`\n=== Summary ===`);
console.log(`  Total URLs written : ${tfAdded + rcAdded * 2}`);
console.log('  Done.\n');
