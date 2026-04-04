/**
 * add-verify-urls-root-meanings.cjs
 *
 * Adds verifyUrl to all roots and derivatives in root-meanings.json.
 *
 * - Each ROOT gets verifyUrl = corpusUrl (the Quran corpus dictionary page for that root)
 * - Each DERIVATIVE gets verifyUrl = parent root's corpusUrl
 *   (since derivatives lack individual verse references, the root dictionary
 *    page is the most specific verification target)
 * - Exception: if a derivative's meaning contains an embedded (surah:ayah) reference,
 *   the verifyUrl points to the corpus word-by-word page for that verse.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'app', 'src', 'data', 'root-meanings.json');

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

let rootsAdded = 0;
let derivsAdded = 0;
let derivsWithEmbeddedRef = 0;
let skippedAlreadyPresent = 0;

for (const root of data.roots) {
  // --- Root-level verifyUrl ---
  if (!root.verifyUrl && root.corpusUrl) {
    root.verifyUrl = root.corpusUrl;
    rootsAdded++;
  } else if (root.verifyUrl) {
    skippedAlreadyPresent++;
  }

  // --- Derivative-level verifyUrl ---
  if (root.keyDerivatives) {
    for (const d of root.keyDerivatives) {
      if (d.verifyUrl) {
        skippedAlreadyPresent++;
        continue;
      }

      // Check if meaning contains an embedded (surah:ayah) reference
      const refMatch = d.meaning && d.meaning.match(/\((\d+):(\d+)\)/);
      if (refMatch) {
        const surah = refMatch[1];
        const ayah = refMatch[2];
        d.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${surah}&verse=${ayah}`;
        derivsWithEmbeddedRef++;
        derivsAdded++;
      } else {
        // Fall back to root's corpusUrl
        d.verifyUrl = root.corpusUrl;
        derivsAdded++;
      }
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log('=== root-meanings.json verifyUrl Report ===');
console.log(`Roots:       ${rootsAdded} verifyUrl added`);
console.log(`Derivatives: ${derivsAdded} verifyUrl added`);
console.log(`  (of which ${derivsWithEmbeddedRef} used embedded verse references)`);
console.log(`Skipped (already present): ${skippedAlreadyPresent}`);
console.log(`Total verifyUrl added: ${rootsAdded + derivsAdded}`);
