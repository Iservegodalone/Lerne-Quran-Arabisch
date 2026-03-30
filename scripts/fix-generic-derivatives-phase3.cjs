/**
 * fix-generic-derivatives-phase3.cjs
 *
 * Phase 3: Fix remaining generics that weren't caught by simple patterns:
 * - Root meanings with parenthetical qualifiers like "brechen (Vertrag)"
 * - Non-verbal root meanings (adjectives, nouns)
 * - Remaining verb forms
 * - Nominal forms with non-standard root meanings
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function getRootVerb(m) { return m.split(/[,;—]/)[0].trim(); }

function stripParens(s) {
  // "brechen (Vertrag)" → "brechen"
  return s.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

const PERSON_MAP = {
  '1.pl.': 'wir ', '1.sg.': 'ich ',
  '2.m.sg.': 'du ', '2.f.sg.': 'du ', '2.m.pl.': 'ihr ', '2.f.pl.': 'ihr ',
  '2.du.': 'ihr beide ', '2.m.du.': 'ihr beide ',
  '3.m.sg.': 'er ', '3.f.sg.': 'sie ', '3.m.pl.': 'sie ', '3.f.pl.': 'sie ',
  '3.m.du.': 'sie beide ', '3.f.du.': 'sie beide ',
};

let fixed = 0;

for (const root of data.roots) {
  const rootFull = getRootVerb(root.meaning);
  const rootClean = stripParens(rootFull);
  if (!rootClean || rootClean.length < 2) continue;

  for (const der of (root.keyDerivatives || [])) {
    const m = der.meaning || '';
    if (!m.includes('(')) continue;
    // Already fixed?
    if (m.match(/^(er |sie |du |ihr |wir |ich |das )/)) continue;

    const gramMatch = m.match(/\(([^)]+)\)$/);
    if (!gramMatch) continue;
    const gramInfo = gramMatch[1];
    const meaningPart = m.slice(0, m.lastIndexOf('(')).trim();

    // Check if meaning echoes root (with or without parenthetical)
    const meaningClean = stripParens(meaningPart);
    const echoes = meaningClean === rootClean || meaningClean === rootFull ||
                   rootClean.startsWith(meaningClean) || meaningClean.startsWith(rootClean);
    if (!echoes) continue;

    // ─── REMAINING VERB FORMS ───
    if (gramInfo.includes('Imperfekt') || gramInfo.includes('Perfekt')) {
      for (const [key, prefix] of Object.entries(PERSON_MAP)) {
        if (gramInfo.includes(key)) {
          der.meaning = `${prefix}${rootFull} (${gramInfo})`;
          fixed++;
          break;
        }
      }
      continue;
    }

    if (gramInfo.includes('Imperativ')) {
      der.meaning = `${rootFull}! (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── REMAINING NOMINAL FORMS ───
    if (gramInfo.includes('indef.') || gramInfo.includes('bestimmt') ||
        gramInfo.match(/^[mf]\./) || gramInfo.match(/^Plural/)) {

      // Capitalize first letter for nominal use
      const noun = rootFull.charAt(0).toUpperCase() + rootFull.slice(1);
      const isDefinite = gramInfo.includes('bestimmt');

      if (isDefinite) {
        der.meaning = `${noun} (${gramInfo})`;
      } else {
        der.meaning = `${noun} (${gramInfo})`;
      }
      fixed++;
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Phase 3: Fixed ${fixed} entries`);

// Final count
let remaining = 0;
let total = 0, specific = 0;
for (const r of data.roots) {
  for (const der of r.keyDerivatives||[]) {
    total++;
    const m = der.meaning || '';
    const rootFirst = getRootVerb(r.meaning);
    const rootClean = stripParens(rootFirst);
    const rootWords = rootClean.split(' ').filter(w => w.length > 3);
    const meaningClean = stripParens(m.split('(')[0].trim());
    const echoes = rootWords.some(w => meaningClean.includes(w)) ||
                   meaningClean === rootClean;

    if (echoes && m.includes('(') &&
        (m.includes('Imperfekt') || m.includes('Perfekt') || m.includes('Imperativ') ||
         m.includes('indef.') || m.includes('bestimmt')) &&
        !m.match(/^(er |sie |du |ihr |wir |ich |das )/)) {
      remaining++;
    } else {
      specific++;
    }
  }
}
console.log(`\nTotal derivatives: ${total}`);
console.log(`Specific/differentiated: ${specific} (${(specific/total*100).toFixed(1)}%)`);
console.log(`Still generic: ${remaining} (${(remaining/total*100).toFixed(1)}%)`);
