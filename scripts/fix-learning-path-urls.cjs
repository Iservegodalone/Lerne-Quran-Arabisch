/**
 * fix-learning-path-urls.cjs
 *
 * Adds missing laneReference fields to tiers 1-4 in frequency-learning-path.json.
 * Tiers 5+ already have them; this script brings tiers 1-4 to parity.
 *
 * URL format: https://ejtaal.net/aa/#ll={buckwalter_root}
 * Root field uses spaced Arabic letters like "ك و ن" -> "kwn"
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(
  __dirname,
  '..', 'app', 'src', 'data', 'frequency-learning-path.json'
);

// Buckwalter transliteration mapping
const BUCKWALTER = {
  'ا': 'A',
  'ب': 'b',
  'ت': 't',
  'ث': 'v',
  'ج': 'j',
  'ح': 'H',
  'خ': 'x',
  'د': 'd',
  'ذ': '*',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': '$',
  'ص': 'S',
  'ض': 'D',
  'ط': 'T',
  'ظ': 'Z',
  'ع': 'E',
  'غ': 'g',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ء': '}',
  'ة': 'p',
  'ى': 'Y',
};

function toBuckwalter(spacedRoot) {
  return spacedRoot
    .split(' ')
    .map(ch => {
      const bw = BUCKWALTER[ch];
      if (!bw) {
        console.warn(`  WARNING: no Buckwalter mapping for "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
        return ch;
      }
      return bw;
    })
    .join('');
}

// ---- main ----
const raw = fs.readFileSync(FILE, 'utf-8');
const data = JSON.parse(raw);

let added = 0;
let skipped = 0;

for (let i = 0; i < 4; i++) {          // tiers index 0-3 = Tier 1-4
  const tier = data.tiers[i];
  if (!tier) {
    console.error(`Tier index ${i} not found!`);
    process.exit(1);
  }
  console.log(`Processing ${tier.name} (${tier.roots.length} roots)...`);

  for (const root of tier.roots) {
    if (root.laneReference) {
      skipped++;
      continue;
    }
    const bw = toBuckwalter(root.root);
    root.laneReference = `https://ejtaal.net/aa/#ll=${bw}`;
    added++;
  }
}

console.log(`\nDone. Added ${added} laneReference fields, skipped ${skipped} (already present).`);

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Written to ${FILE}`);
