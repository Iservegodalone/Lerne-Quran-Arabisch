/**
 * fix-generic-derivatives.cjs — v3
 *
 * Uses the Quran morphology DB's POS tags to produce better derivative
 * classifications. Maps each derivative to its actual morphological category
 * (verb, noun, adjective, participle, masdar, etc.) using corpus data.
 */
const fs = require('fs');
const path = require('path');

const rmPath = path.join(__dirname, 'root-meanings.json');
const morphPath = path.join(__dirname, 'quran-morphology-db.json');

const data = JSON.parse(fs.readFileSync(rmPath, 'utf8'));
const morph = JSON.parse(fs.readFileSync(morphPath, 'utf8'));

// ========== BUILD CONSONANT → POS LOOKUP ==========
// Map consonantal form → most common POS tag from corpus

const formPOS = {};
morph.words.forEach(w => {
  const key = w.c;
  if (!formPOS[key]) formPOS[key] = {};
  const pos = w.p;
  formPOS[key][pos] = (formPOS[key][pos] || 0) + 1;
});

// Get dominant POS for a consonantal form
function getPOS(consonantal) {
  const entry = formPOS[consonantal];
  if (!entry) return null;
  let best = null, max = 0;
  for (const [pos, count] of Object.entries(entry)) {
    if (count > max) { max = count; best = pos; }
  }
  return best;
}

// Also build consonantal → morphology features
const formMorph = {};
morph.words.forEach(w => {
  const key = w.c;
  if (!formMorph[key]) formMorph[key] = w.m;
});

// ========== HELPERS ==========
function rd(s) {
  return s.replace(/[\u064B-\u065F\u0670\u0653\u0654\u0655\u0656\u0657\u0658\u06D6-\u06ED\u0610-\u061A\u0640\u06DF\u06E0\u06E5\u06E6]/g, '');
}

function coreMeaning(m) {
  if (!m) return '';
  return m.split(/\s*[—–]\s*/)[0].trim();
}

function firstWord(m) {
  return coreMeaning(m).split(/[,،;]/)[0].trim();
}

function isGenericRoot(root) {
  if (!root.meaning || !root.keyDerivatives || root.keyDerivatives.length < 2) return false;
  const rc = coreMeaning(root.meaning);
  const fw = firstWord(root.meaning);
  return root.keyDerivatives.filter(kd => kd.meaning).every(kd => {
    const c = kd.meaning.replace(/\s*\(.*\)$/, '').replace(/^(und |mit\/in |von |fuer |dann |wie )/, '');
    return c === rc || c === root.meaning || c === fw;
  });
}

// POS label mapping
const POS_LABELS = {
  'N': 'Nomen',
  'PN': 'Eigenname',
  'ADJ': 'Adjektiv',
  'V': 'Verb',
  'VB': 'Verb',
  'IMPV': 'Imperativ',
  'NEG': 'Negationspartikel',
  'PRON': 'Pronomen',
  'REL': 'Relativpronomen',
  'DEM': 'Demonstrativpronomen',
  'COND': 'Konditionalpartikel',
  'P': 'Präposition',
  'CONJ': 'Konjunktion',
  'INL': 'Interjektion',
  'ACC': 'Akkusativpartikel',
  'T': 'Zeitadverb',
  'LOC': 'Ortsadverb',
  'INTG': 'Fragepartikel',
  'RES': 'Restriktionspartikel',
  'CIRC': 'Umstandspartikel',
  'ACT PCPL': 'Partizip aktiv',
  'PASS PCPL': 'Partizip passiv',
  'VN': 'Verbalsubstantiv (Masdar)',
};

// Morphology feature labels
function getMorphLabel(m) {
  if (!m) return '';
  const parts = m.split('|');
  const labels = [];
  for (const p of parts) {
    if (p === 'MS') labels.push('m.sg.');
    else if (p === 'FS') labels.push('f.sg.');
    else if (p === 'MP') labels.push('m.pl.');
    else if (p === 'FP') labels.push('f.pl.');
    else if (p === 'MD') labels.push('m.du.');
    else if (p === 'FD') labels.push('f.du.');
    else if (p === 'M') labels.push('m.');
    else if (p === 'F') labels.push('f.');
    else if (p === 'NOM') labels.push('Nom.');
    else if (p === 'GEN') labels.push('Gen.');
    else if (p === 'ACC') labels.push('Akk.');
    else if (p === 'INDEF') labels.push('indef.');
    else if (p === '1S') labels.push('1.sg.');
    else if (p === '2MS') labels.push('2.m.sg.');
    else if (p === '2FS') labels.push('2.f.sg.');
    else if (p === '3MS') labels.push('3.m.sg.');
    else if (p === '3FS') labels.push('3.f.sg.');
    else if (p === '3MP') labels.push('3.m.pl.');
    else if (p === '3FP') labels.push('3.f.pl.');
    else if (p === '2MP') labels.push('2.m.pl.');
    else if (p === '1P') labels.push('1.pl.');
    else if (p === 'PERF') labels.push('Perfekt');
    else if (p === 'IMPF') labels.push('Imperfekt');
    else if (p === 'IMPV') labels.push('Imperativ');
    else if (p === 'PASS') labels.push('Passiv');
    else if (p === 'ACT') labels.push('Aktiv');
    else if (p === 'PCPL') labels.push('Partizip');
    else if (p === 'VN') labels.push('Masdar');
    else if (/^I+V?X?$|^II+$|^IV$|^VI*$|^VII+$|^IX$|^X$/.test(p)) labels.push('Form ' + p);
  }
  return labels.join(', ');
}

/**
 * Generate improved meaning using corpus POS data
 */
function improvedMeaning(kd, rootMeaning) {
  const vs = firstWord(rootMeaning);
  const ns = coreMeaning(rootMeaning);

  // Get consonantal form (strip diacritics from the vocalized form)
  const consonantal = rd(kd.form);
  // Try exact match in corpus
  let pos = getPOS(consonantal);
  let morphFeatures = formMorph[consonantal];

  // If not found, try stripping leading و/ف
  if (!pos && (consonantal.startsWith('و') || consonantal.startsWith('ف'))) {
    const stripped = consonantal.substring(1);
    pos = getPOS(stripped);
    morphFeatures = formMorph[stripped];
  }

  // If not found, try with article
  if (!pos && !consonantal.startsWith('ال')) {
    pos = getPOS('ال' + consonantal);
    morphFeatures = formMorph['ال' + consonantal];
  }

  // Build prefix
  let px = '';
  const form = kd.form;
  if (form.startsWith('وَ') && /^[ٱالبلكيتنأ]/.test(form.substring(2))) px = 'und ';
  else if (form.startsWith('فَ') && /^[ٱالبلكيتنأ]/.test(form.substring(2))) px = 'dann ';

  if (form.includes('بِ') && form.indexOf('بِ') < 3) px += 'mit/in ';
  else if (form.includes('لِ') && form.indexOf('لِ') < 3 && !form.startsWith('لِ')) px += 'fuer ';

  const isDef = form.includes('ٱل') || form.includes('ال');

  // Use POS to categorize
  if (pos === 'V' || pos === 'VB') {
    const ml = getMorphLabel(morphFeatures);
    if (ml) return px + vs + ' (' + ml + ')';
    return px + vs + ' (Verb)';
  }

  if (pos === 'IMPV') {
    return px + vs + '! (Imperativ)';
  }

  if (pos === 'N') {
    const ml = getMorphLabel(morphFeatures);
    const defTag = isDef ? ', bestimmt' : '';
    if (ml) return px + ns + ' (' + ml + defTag + ')';
    return px + ns + (isDef ? ' (bestimmt)' : '');
  }

  if (pos === 'ADJ') {
    const defTag = isDef ? ', bestimmt' : '';
    const ml = getMorphLabel(morphFeatures);
    if (ml) return px + ns + ' (Adjektiv, ' + ml + defTag + ')';
    return px + ns + ' (Adjektiv' + defTag + ')';
  }

  if (pos === 'PN') {
    return px + ns + ' (Eigenname)';
  }

  if (pos === 'ACT PCPL') {
    const defTag = isDef ? ', bestimmt' : '';
    return px + vs + '-d (Partizip aktiv' + defTag + ')';
  }

  if (pos === 'PASS PCPL') {
    const defTag = isDef ? ', bestimmt' : '';
    return px + vs + ' (Partizip passiv' + defTag + ')';
  }

  if (pos === 'VN') {
    const defTag = isDef ? ', bestimmt' : '';
    return px + 'das ' + ns + ' (Masdar' + defTag + ')';
  }

  // Fallback: use existing annotation logic
  const hasTnw = form.includes('\u064B') || form.includes('\u064C') || form.includes('\u064D');
  const p = rd(kd.form.replace(/^[وَفَبِلِكَ]*/, '').replace(/^[ٱال]ل/, ''));

  if (p.endsWith('ون') || p.endsWith('ين')) return px + ns + ' (Plural m.' + (isDef ? ', bestimmt' : '') + ')';
  if (p.endsWith('ات') && p.length > 3) return px + ns + ' (Plural f.' + (isDef ? ', bestimmt' : '') + ')';
  if (p.endsWith('ة')) return px + ns + ' (Substantiv f.' + (isDef ? ', bestimmt' : '') + ')';
  if (form.endsWith('ٌ')) return px + ns + ' (indef., Nom.)';
  if (form.endsWith('ٍ')) return px + ns + ' (indef., Gen.)';
  if (form.endsWith('ً') || form.endsWith('ًا')) return px + ns + ' (indef., Akk.)';
  if (isDef) return px + ns + ' (bestimmt)';
  if (px) return px + ns;
  return ns;
}

// ========== MAIN ==========

let fixedD = 0, processedR = 0;

data.roots.forEach(root => {
  if (!isGenericRoot(root)) return;
  processedR++;

  root.keyDerivatives.forEach(kd => {
    if (!kd.form || !kd.meaning) return;
    const oldMeaning = kd.meaning;
    const newMeaning = improvedMeaning(kd, root.meaning);
    if (newMeaning !== oldMeaning) {
      kd.meaning = newMeaning;
      fixedD++;
    }
  });
});

// Verify
let still = 0;
data.roots.forEach(r => { if (isGenericRoot(r)) still++; });

console.log(`Processed ${processedR} generic roots, fixed ${fixedD} derivatives`);
console.log(`Still generic: ${still}`);

data.meta.derivativeMeaningsFilled = fixedD;
fs.writeFileSync(rmPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done.');
