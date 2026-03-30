/**
 * fix-generic-derivatives-phase2.cjs
 *
 * Phase 2: Fix remaining generic derivatives:
 * - Verb forms with 1.pl. person not caught by phase 1
 * - Nominal forms echoing root meaning
 * - Passive participles
 * - Imperative forms
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function getRootVerb(m) { return m.split(/[,;—]/)[0].trim(); }

const PERSON_MAP = {
  '1.pl.': 'wir ',
  '1.sg.': 'ich ',
  '2.m.sg.': 'du ',
  '2.f.sg.': 'du ',
  '2.m.pl.': 'ihr ',
  '2.f.pl.': 'ihr ',
  '3.m.sg.': 'er ',
  '3.f.sg.': 'sie ',
  '3.m.pl.': 'sie ',
  '3.f.pl.': 'sie ',
  '3.m.du.': 'sie beide ',
  '3.f.du.': 'sie beide ',
  '2.du.': 'ihr beide ',
  '2.m.du.': 'ihr beide ',
};

let fixed = 0;

for (const root of data.roots) {
  const rootVerb = getRootVerb(root.meaning);
  if (!rootVerb || rootVerb.length < 3) continue;
  const rootWords = rootVerb.split(' ').filter(w => w.length > 3);

  for (const der of (root.keyDerivatives || [])) {
    const m = der.meaning || '';
    const echoes = rootWords.some(w => m.startsWith(w));
    if (!echoes || !m.includes('(')) continue;

    // Already fixed (has person prefix)?
    if (m.match(/^(er |sie |du |ihr |wir |ich )/)) continue;

    const gramMatch = m.match(/\(([^)]+)\)/);
    if (!gramMatch) continue;
    const gramInfo = gramMatch[1];

    // ─── FIX REMAINING VERBS ───
    if (gramInfo.includes('Imperfekt') || gramInfo.includes('Perfekt')) {
      // Find person
      for (const [key, prefix] of Object.entries(PERSON_MAP)) {
        if (gramInfo.includes(key)) {
          der.meaning = `${prefix}${rootVerb} (${gramInfo})`;
          fixed++;
          break;
        }
      }
      continue;
    }

    // ─── FIX IMPERATIVES ───
    if (gramInfo.includes('Imperativ')) {
      der.meaning = `${rootVerb}! (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── FIX PASSIVE PARTICIPLES ───
    if (gramInfo.includes('Passiv') && gramInfo.includes('Partizip')) {
      // Convert verb to passive participle form in German
      let passivForm = rootVerb;
      if (rootVerb.endsWith('en')) {
        passivForm = rootVerb.replace(/en$/, 't');
      } else if (rootVerb.endsWith('ern')) {
        passivForm = rootVerb.replace(/ern$/, 'ert');
      } else if (rootVerb.endsWith('eln')) {
        passivForm = rootVerb.replace(/eln$/, 'elt');
      } else if (rootVerb.endsWith('n')) {
        passivForm = rootVerb.replace(/n$/, 't');
      }
      // Clean up gram info
      const cleanGram = gramInfo.replace('Adjektiv, ', '').replace('Passiv, ', 'passiv, ');
      der.meaning = `${passivForm} (${cleanGram})`;
      fixed++;
      continue;
    }

    // ─── FIX ACTIVE PARTICIPLES ───
    if (gramInfo.includes('Aktiv') && gramInfo.includes('Partizip') && !gramInfo.includes('Passiv')) {
      let activForm = rootVerb;
      if (rootVerb.endsWith('en')) {
        activForm = rootVerb + 'd';
      } else if (rootVerb.endsWith('ern') || rootVerb.endsWith('eln')) {
        activForm = rootVerb + 'd';
      }
      const cleanGram = gramInfo.replace('Aktiv, ', 'aktiv, ');
      der.meaning = `${activForm} (${cleanGram})`;
      fixed++;
      continue;
    }

    // ─── FIX NOMINAL FORMS ───
    // For nominals, check if root meaning is a verb and convert to nominal sense
    if (gramInfo.includes('indef.') || gramInfo.includes('bestimmt') ||
        gramInfo.match(/^[mf]\.,/) || gramInfo.match(/^Plural/)) {

      // If the root meaning is verbal ("streben", "umkehren"), prefix with article/case
      if (rootVerb.endsWith('en') || rootVerb.endsWith('ern') || rootVerb.endsWith('eln')) {
        // Verbal root — the noun form needs "das [Verb-en]" or substantivized form
        // But we can't know the specific noun meaning, so we add case info clearly
        const isDefinite = gramInfo.includes('bestimmt');
        const caseMatch = gramInfo.match(/(Nom\.|Gen\.|Akk\.)/);
        const caseInfo = caseMatch ? caseMatch[1] : '';
        const genderMatch = gramInfo.match(/^([mf])\./);
        const gender = genderMatch ? genderMatch[1] : '';
        const pluralMatch = gramInfo.match(/Plural ([mf]?\.?)/);

        if (isDefinite) {
          der.meaning = `das ${rootVerb.charAt(0).toUpperCase() + rootVerb.slice(1)} (${gramInfo})`;
        } else {
          // Capitalize for noun usage
          der.meaning = `${rootVerb.charAt(0).toUpperCase() + rootVerb.slice(1)} (${gramInfo})`;
        }
        fixed++;
      } else {
        // Non-verbal root meaning (e.g., "Erde", "Zeichen")
        // Meaning probably already contains the noun — just clean up
        if (m.includes('bestimmt')) {
          der.meaning = `${rootVerb} (${gramInfo})`;
          fixed++;
        } else if (m.includes('indef.')) {
          der.meaning = `${rootVerb} (${gramInfo})`;
          fixed++;
        }
      }
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Phase 2: Fixed ${fixed} entries`);

// Recount
let remaining = 0;
for (const r of data.roots) {
  const rootFirst = getRootVerb(r.meaning);
  const rootWords = rootFirst.split(' ').filter(w => w.length > 3);
  for (const der of r.keyDerivatives||[]) {
    const m = der.meaning || '';
    const echoes = rootWords.some(w => m.startsWith(w));
    if (!echoes || !m.includes('(')) continue;
    if (m.match(/^(er |sie |du |ihr |wir |ich |das )/)) continue;
    if (m.includes('Imperfekt') || m.includes('Perfekt') || m.includes('Imperativ') ||
        m.includes('indef.') || m.includes('bestimmt')) {
      remaining++;
    }
  }
}
console.log(`Remaining generic-looking: ${remaining}`);
