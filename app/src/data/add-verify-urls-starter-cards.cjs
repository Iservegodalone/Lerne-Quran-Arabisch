/**
 * Add verifyUrl to all entries in root-starter-cards.json
 * Uses root-frequency-complete.json as the source for sample locations.
 */
const fs = require('fs');
const path = require('path');

const starterPath = path.join(__dirname, 'root-starter-cards.json');
const freqPath = path.join(__dirname, 'root-frequency-complete.json');

const starter = JSON.parse(fs.readFileSync(starterPath, 'utf8'));
const freq = JSON.parse(fs.readFileSync(freqPath, 'utf8'));

// Build a lookup: root string -> verifyUrl (or first sampleLocation)
const rootLookup = {};
for (const entry of freq.roots) {
  if (entry.verifyUrl) {
    rootLookup[entry.root] = entry.verifyUrl;
  } else if (entry.sampleLocations && entry.sampleLocations.length > 0) {
    const loc = entry.sampleLocations[0]; // e.g. "1:1:2"
    const [ch, v] = loc.split(':');
    rootLookup[entry.root] = `https://corpus.quran.com/wordbyword.jsp?chapter=${ch}&verse=${v}`;
  }
}

let added = 0;
let missing = [];

for (const card of starter.cards) {
  const url = rootLookup[card.root];
  if (url) {
    card.verifyUrl = url;
    added++;
  } else {
    missing.push(card.root);
  }
}

fs.writeFileSync(starterPath, JSON.stringify(starter, null, 2) + '\n', 'utf8');

console.log(`Done. Added verifyUrl to ${added}/${starter.cards.length} cards.`);
if (missing.length > 0) {
  console.log(`Missing roots (not found in frequency file): ${missing.join(', ')}`);
}
