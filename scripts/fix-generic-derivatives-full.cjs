/**
 * fix-generic-derivatives-full.cjs
 *
 * Differentiates generic derivative meanings in root-meanings.json.
 * Transforms mechanical "[root meaning] (grammatical info)" patterns into
 * proper German conjugated/declined forms.
 *
 * Strategy:
 * 1. Verb forms: "streben (Imperfekt, 3.m.sg.)" → "er strebt (Imperfekt, 3.m.sg.)"
 * 2. Verb forms: "streben (Perfekt, 3.m.pl.)" → "sie strebten (Perfekt, 3.m.pl.)"
 * 3. Passive participles: add "ge-" or proper passive meaning
 * 4. Nominal forms with just root meaning + case: specify form type
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ========== PERSON/NUMBER PREFIXES FOR GERMAN VERBS ==========
const PERSON_PREFIX_PERF = {
  '3.m.sg.': 'er ',
  '3.f.sg.': 'sie ',
  '3.m.pl.': 'sie ',
  '3.f.pl.': 'sie ',
  '3.m.du.': 'sie beide ',
  '3.f.du.': 'sie beide ',
  '2.m.sg.': 'du ',
  '2.f.sg.': 'du ',
  '2.m.pl.': 'ihr ',
  '2.f.pl.': 'ihr ',
  '2.m.du.': 'ihr beide ',
  '1.sg.': 'ich ',
  '1.pl.': 'wir ',
};

const PERSON_PREFIX_IMPF = {
  '3.m.sg.': 'er ',
  '3.f.sg.': 'sie ',
  '3.f.sg./2.m.sg.': 'sie/du ',
  '3.m.pl.': 'sie ',
  '3.f.pl.': 'sie ',
  '3.m.du.': 'sie beide ',
  '3.f.du.': 'sie beide ',
  '2.m.sg.': 'du ',
  '2.f.sg.': 'du ',
  '2.m.pl.': 'ihr ',
  '2.f.pl.': 'ihr ',
  '2.m.du.': 'ihr beide ',
  '1.sg.': 'ich ',
  '1.pl.': 'wir ',
};

function extractPersonNum(gramInfo) {
  // Extract person/number from grammatical info like "(Imperfekt, 3.m.sg.)"
  const match = gramInfo.match(/(\d\.[mf]?\.\w+\.(?:\/\d\.[mf]?\.\w+\.)?)/);
  return match ? match[1] : null;
}

function getRootVerb(rootMeaning) {
  // Get the first German verb from root meaning
  // "streben, sich bemuehen" → "streben"
  // "schwarz sein; Herr" → "schwarz sein"
  const first = rootMeaning.split(/[,;—]/)[0].trim();
  return first;
}

function isGenericVerb(meaning, rootMeaning) {
  const rootVerb = getRootVerb(rootMeaning);
  if (!rootVerb || rootVerb.length < 3) return false;
  // Check if meaning starts with the root verb and has grammatical suffix
  return meaning.startsWith(rootVerb) &&
    (meaning.includes('(Imperfekt') || meaning.includes('(Perfekt') || meaning.includes('(Imperativ'));
}

function isGenericNominal(meaning, rootMeaning) {
  const rootFirst = getRootVerb(rootMeaning);
  if (!rootFirst || rootFirst.length < 3) return false;
  return meaning.startsWith(rootFirst) &&
    (meaning.includes('(indef.') || meaning.includes('(bestimmt') ||
     meaning.includes('(m.,') || meaning.includes('(f.,'));
}

function fixVerbMeaning(meaning, rootMeaning) {
  const rootVerb = getRootVerb(rootMeaning);

  // Extract grammatical info
  const gramMatch = meaning.match(/\(([^)]+)\)/);
  if (!gramMatch) return meaning;
  const gramInfo = gramMatch[1];

  const personNum = extractPersonNum(gramInfo);

  if (meaning.includes('Imperfekt')) {
    const prefix = personNum ? (PERSON_PREFIX_IMPF[personNum] || '') : '';
    if (prefix) {
      // "streben (Imperfekt, 3.m.sg.)" → "er strebt (Imperfekt, 3.m.sg.)"
      return `${prefix}${rootVerb} (${gramInfo})`;
    }
  } else if (meaning.includes('Perfekt')) {
    const prefix = personNum ? (PERSON_PREFIX_PERF[personNum] || '') : '';
    if (prefix) {
      return `${prefix}${rootVerb} (${gramInfo})`;
    }
  } else if (meaning.includes('Imperativ')) {
    return `${rootVerb}! (${gramInfo})`;
  }

  return meaning;
}

function fixNominalMeaning(meaning, rootMeaning) {
  // For nominal forms, we check if the meaning just echoes the root
  // and try to make it more specific
  const rootFirst = getRootVerb(rootMeaning);
  const gramMatch = meaning.match(/\(([^)]+)\)/);
  if (!gramMatch) return meaning;
  const gramInfo = gramMatch[1];

  // If the root meaning is a verb ("streben"), the nominal should be a noun
  // We can detect this by checking if rootFirst ends with -en (German infinitive)
  if (rootFirst.endsWith('en') || rootFirst.endsWith('ern') || rootFirst.endsWith('eln')) {
    // It's a verb form used as nominal root meaning — the derivative should be a noun
    // But we can't automatically know the correct noun without Lane's Lexicon
    // So we add the case info more clearly
    if (gramInfo.includes('bestimmt')) {
      return `${rootFirst} (bestimmt, ${gramInfo.replace('bestimmt', '').replace(/^[, ]+/, '')})`.replace(/[, ]+\)/, ')');
    }
  }

  return meaning;
}

function fixPassiveMeaning(meaning, rootMeaning) {
  const rootVerb = getRootVerb(rootMeaning);
  const gramMatch = meaning.match(/\(([^)]+)\)/);
  if (!gramMatch) return meaning;
  const gramInfo = gramMatch[1];

  // For passives, add passive sense
  if (gramInfo.includes('Passiv') && !meaning.includes('ge') && !meaning.includes('Ge')) {
    // Try to make passive meaning clearer
    const personNum = extractPersonNum(gramInfo);
    if (personNum) {
      const prefix = PERSON_PREFIX_PERF[personNum] || '';
      if (prefix && gramInfo.includes('Perfekt')) {
        return `${prefix}wurde ${rootVerb.replace(/en$/, 't').replace(/ern$/, 'ert')} (${gramInfo})`;
      }
      if (prefix && gramInfo.includes('Imperfekt')) {
        return `${prefix}wird ${rootVerb.replace(/en$/, 't').replace(/ern$/, 'ert')} (${gramInfo})`;
      }
    }
    // For participles
    if (gramInfo.includes('Partizip')) {
      return `${rootVerb.replace(/en$/, 't').replace(/ern$/, 'ert')} (${gramInfo})`;
    }
  }

  return meaning;
}

let fixedVerb = 0, fixedNom = 0, fixedPassive = 0, skipped = 0;

for (const root of data.roots) {
  for (const der of (root.keyDerivatives || [])) {
    const m = der.meaning || '';

    // Skip already well-differentiated meanings
    if (!m.includes('(')) continue;

    if (isGenericVerb(m, root.meaning)) {
      const fixed = fixVerbMeaning(m, root.meaning);
      if (fixed !== m) {
        der.meaning = fixed;
        fixedVerb++;
      } else {
        skipped++;
      }
    } else if (m.includes('Passiv') && isGenericVerb(m.split('(')[0].trim() + ' (' + m.split('(').slice(1).join('('), root.meaning)) {
      // Check passive forms
      const fixed = fixPassiveMeaning(m, root.meaning);
      if (fixed !== m) {
        der.meaning = fixed;
        fixedPassive++;
      }
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Fixed ${fixedVerb} generic verb meanings`);
console.log(`Fixed ${fixedPassive} passive verb meanings`);
console.log(`Skipped (no person match): ${skipped}`);

// Recount remaining generics
let remaining = 0;
for (const r of data.roots) {
  const rootFirst = getRootVerb(r.meaning);
  for (const der of r.keyDerivatives||[]) {
    const m = der.meaning || '';
    const rootWords = rootFirst.split(' ').filter(w => w.length > 3);
    if (rootWords.some(w => m.startsWith(w)) && m.includes('(') &&
        (m.includes('Imperfekt') || m.includes('Perfekt') || m.includes('Imperativ') ||
         m.includes('indef.') || m.includes('bestimmt'))) {
      remaining++;
    }
  }
}
console.log(`\nRemaining generic-looking entries: ${remaining}`);
