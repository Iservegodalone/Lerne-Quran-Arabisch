/**
 * expand-derivatives.cjs
 *
 * Expands keyDerivatives in root-meanings.json for roots that have fewer than 3.
 * Uses quran-morphology-db.json to find ACTUALLY ATTESTED Quranic forms.
 *
 * Strategy:
 * 1. Categorize each morphology-DB entry into a morphological type
 *    (verb form I/II/.., active participle, passive participle, masdar, noun, adjective, etc.)
 * 2. For each root with < 3 keyDerivatives, determine which categories are already covered
 *    by cross-referencing existing derivatives against the morphology DB
 * 3. Add new derivatives from uncovered categories, prioritizing:
 *    a) Different verb forms (I, II, IV, etc.)
 *    b) Active/passive participles
 *    c) Masdar (verbal noun) forms
 *    d) Common nominals / adjectives
 * 4. Pick the best representative vocalized form for each new category
 *    (most frequent, nominative/accusative indefinite preferred for citation form)
 * 5. Generate German meanings based on root meaning + morphological type
 *
 * Only adds derivatives that are ACTUALLY ATTESTED in the Quranic corpus.
 */
const fs = require('fs');
const path = require('path');

// ============================================================
// Paths
// ============================================================
const rootMeaningsPath = path.join(__dirname, '../app/src/data/root-meanings.json');
const morphDbPath = path.join(__dirname, '../app/src/data/quran-morphology-db.json');

console.log('Loading data...');
const rootData = JSON.parse(fs.readFileSync(rootMeaningsPath, 'utf8'));
const morphDb = JSON.parse(fs.readFileSync(morphDbPath, 'utf8'));
const words = morphDb.words;

// ============================================================
// Morphological categorization
// ============================================================
const FORM_RE = /\((I{1,3}V?|IV|V|VI{0,3}|VI?I{1,2}|IX|X)\)/;

function extractVerbForm(m) {
  const match = m.match(FORM_RE);
  return match ? match[1] : null;
}

/**
 * Assign a broad morphological category to a morphology-DB word.
 * Returns a string like "V-I", "V-IV", "V-I-PASS", "ACT_PCPL-I", "PASS_PCPL-II",
 * "VN-I", "VN-IV", "N", "N-PL", "N-F", "ADJ", "ADJ-PL", etc.
 */
function categorize(w) {
  const m = w.m || '';
  const p = w.p;
  const verbForm = extractVerbForm(m);

  // --- Verbs ---
  if (p === 'V') {
    const form = verbForm || 'I';
    const passive = m.includes('PASS') ? '-PASS' : '';
    return 'V-' + form + passive;
  }

  // --- Active participle ---
  if (m.includes('ACT') && m.includes('PCPL')) {
    return 'ACT_PCPL-' + (verbForm || 'I');
  }

  // --- Passive participle ---
  if (m.includes('PASS') && m.includes('PCPL')) {
    return 'PASS_PCPL-' + (verbForm || 'I');
  }

  // --- Verbal noun (Masdar) ---
  if (m.includes('VN')) {
    return 'VN-' + (verbForm || 'I');
  }

  // --- Noun ---
  if (p === 'N') {
    if (m.includes('MP') || m.includes('FP')) return 'N-PL';
    if (/\bFS\b/.test(m) || (/\bF\b/.test(m) && !/\bM\b/.test(m))) return 'N-F';
    return 'N';
  }

  // --- Adjective ---
  if (p === 'ADJ') {
    if (m.includes('MP') || m.includes('FP')) return 'ADJ-PL';
    if (/\bFS\b/.test(m) || (/\bF\b/.test(m) && !/\bM\b/.test(m))) return 'ADJ-F';
    return 'ADJ';
  }

  // Everything else (particles, pronouns, etc.) -- not useful as derivatives
  return '__' + p;
}

// Priority order for selecting which categories to add first.
const CATEGORY_PRIORITY = [
  /^V-I$/,           // Form I verb
  /^V-II$/,          // Form II
  /^V-III$/,         // Form III
  /^V-IV$/,          // Form IV
  /^V-V$/,           // Form V
  /^V-VI$/,          // Form VI
  /^V-VII$/,         // Form VII
  /^V-VIII$/,        // Form VIII
  /^V-IX$/,          // Form IX
  /^V-X$/,           // Form X
  /^V-.*-PASS$/,     // Passive verb forms
  /^ACT_PCPL-/,      // Active participle
  /^PASS_PCPL-/,     // Passive participle
  /^VN-/,            // Masdar
  /^N$/,             // Noun (masc.)
  /^N-F$/,           // Noun (feminine)
  /^N-PL$/,          // Noun (plural)
  /^ADJ$/,           // Adjective
  /^ADJ-F$/,         // Adjective (feminine)
  /^ADJ-PL$/,        // Adjective (plural)
];

function categoryPriority(cat) {
  for (let i = 0; i < CATEGORY_PRIORITY.length; i++) {
    if (CATEGORY_PRIORITY[i].test(cat)) return i;
  }
  return 999;
}

// ============================================================
// Build root -> category index from morphology DB
// ============================================================
console.log('Building morphological index...');

// rootIndex: root -> { category -> [ { word, count } ] }
// We store one "best" representative per category
const rootIndex = {};
// rootAllWords: root -> [ word ] for cross-referencing existing derivatives
const rootAllWords = {};

words.forEach(w => {
  if (!w.r) return;

  // Store all words for cross-referencing
  if (!rootAllWords[w.r]) rootAllWords[w.r] = [];
  rootAllWords[w.r].push(w);

  const cat = categorize(w);
  if (cat.startsWith('__')) return;

  if (!rootIndex[w.r]) rootIndex[w.r] = {};
  if (!rootIndex[w.r][cat]) {
    rootIndex[w.r][cat] = { best: null, bestScore: -1, totalCount: 0 };
  }

  rootIndex[w.r][cat].totalCount++;

  // Score for picking best citation form
  const m = w.m || '';
  let score = 0;

  // For nouns/adj/participles/VN: prefer INDEF NOM (citation form)
  if (cat.startsWith('N') || cat.startsWith('ADJ') || cat.startsWith('ACT_PCPL') ||
      cat.startsWith('PASS_PCPL') || cat.startsWith('VN')) {
    if (m.includes('INDEF') && m.includes('NOM')) score = 100;
    else if (m.includes('INDEF') && m.includes('ACC')) score = 80;
    else if (m.includes('INDEF')) score = 60;
    else if (m.includes('NOM')) score = 40;
    else score = 20;
  }

  // For verbs: prefer PERF 3MS (citation form)
  if (cat.startsWith('V-')) {
    if (m.includes('PERF') && m.includes('3MS') && !m.includes('PASS')) score = 100;
    else if (m.includes('PERF') && m.includes('3MS')) score = 95;
    else if (m.includes('PERF') && m.includes('3FS')) score = 80;
    else if (m.includes('IMPF') && m.includes('3MS') && !m.includes('MOOD')) score = 70;
    else if (m.includes('IMPF') && m.includes('3MS')) score = 65;
    else if (m.includes('IMPV')) score = 50;
    else score = 20;
  }

  if (score > rootIndex[w.r][cat].bestScore) {
    rootIndex[w.r][cat].bestScore = score;
    rootIndex[w.r][cat].best = w;
  }
});

// ============================================================
// Cross-reference existing derivatives against morphology DB
// ============================================================

/**
 * Strip Arabic diacritics and special characters to get a consonantal skeleton
 * for fuzzy matching of existing derivatives against morphDB entries.
 */
function stripDiacritics(s) {
  // Remove tatweel, diacritics (fatha, damma, kasra, sukun, shadda, tanwin, etc.)
  return s.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, '')
    // Also strip hamza variants to normalize
    .replace(/[ٱإأآ]/g, 'ا')
    // Strip alef maqsura/ya variants
    .replace(/[ىٰ]/g, 'ي')
    // Strip corpus-specific markers
    .replace(/[,\.@\[\]ٕ]/g, '');
}

/**
 * Determine the morphological categories that an existing keyDerivative covers,
 * by matching its form against the morphology DB entries for that root.
 *
 * Matching strategy:
 * 1. Exact consonantal match (after stripping diacritics)
 * 2. Match after stripping proclitics from morphDB entry
 * 3. Match allowing for pronominal suffixes (morphDB form starts with deriv consonants
 *    AND the remaining part looks like a suffix, i.e., deriv is at least 3 consonants
 *    and morphDB form is at most 2 consonants longer)
 * 4. Fall back to meaning-based guessing
 */
function findExistingCategories(deriv, root) {
  const rootWords = rootAllWords[root] || [];
  const derivStripped = stripDiacritics(deriv.form);
  const categories = new Set();

  // Only use startsWith-based matching for forms with at least 3 consonants
  const allowPrefixMatch = derivStripped.length >= 3;

  for (const w of rootWords) {
    const wStripped = stripDiacritics(w.v);
    const wStrippedNoPrefix = stripDiacritics(cleanVocalizedForm(w.v));

    let matched = false;

    // Exact match (after stripping)
    if (wStripped === derivStripped || wStrippedNoPrefix === derivStripped) {
      matched = true;
    }

    // Derivative form is a prefix of the morphDB form (pronoun suffix in morphDB)
    // Only if deriv is >= 3 consonants and the "suffix" is at most 3 consonants
    if (!matched && allowPrefixMatch) {
      if (wStrippedNoPrefix.startsWith(derivStripped) &&
          (wStrippedNoPrefix.length - derivStripped.length) <= 3) {
        matched = true;
      }
    }

    // MorphDB form (after prefix stripping) is a prefix of the derivative
    // (derivative may have additional morphological material)
    if (!matched && wStrippedNoPrefix.length >= 3 && derivStripped.startsWith(wStrippedNoPrefix) &&
        (derivStripped.length - wStrippedNoPrefix.length) <= 3) {
      matched = true;
    }

    if (matched) {
      const cat = categorize(w);
      if (!cat.startsWith('__')) {
        categories.add(cat);
      }
    }
  }

  // If no match found via form, fall back to meaning-based guessing
  if (categories.size === 0) {
    const guessed = guessFromMeaning(deriv);
    guessed.forEach(c => categories.add(c));
  }

  return categories;
}

/**
 * Fall-back: guess category from the meaning text of an existing derivative.
 */
function guessFromMeaning(deriv) {
  const meaning = (deriv.meaning || '').toLowerCase();
  const cats = new Set();

  // Extract Roman numeral from meaning (e.g., "(IV)", "Stamm II", "(VIII)")
  const romanMatch = meaning.match(/\b(stamm\s+)?(i{1,3}v?|iv|v|vi{0,3}|vi?i{1,2}|ix|x)\b/i);
  const romanNum = romanMatch ? romanMatch[2].toUpperCase() : null;

  // Verb indicators
  const isVerb = meaning.match(/imperfekt|perfekt|imperativ/) ||
    meaning.match(/^(er|sie|du|ihr|wir|ich) /) ||
    meaning.match(/\b(3\.m\.sg\.|3\.f\.sg\.|3\.m\.pl\.|2\.m\.sg\.|2\.m\.pl\.|1\.sg\.|1\.pl\.)/);

  // Participle indicators
  const isActPcpl = meaning.includes('aktiv') && meaning.includes('partizip') ||
    meaning.includes('aktiv-partizip') || meaning.includes('act|pcpl') ||
    (meaning.includes('partizip') && !meaning.includes('passiv'));
  const isPassPcpl = meaning.includes('passiv') && meaning.includes('partizip') ||
    meaning.includes('passiv-partizip') || meaning.includes('pass|pcpl');

  // Masdar
  const isMasdar = meaning.includes('masdar') || meaning.includes('verbalsubstantiv');

  if (isPassPcpl) {
    cats.add('PASS_PCPL-' + (romanNum || 'I'));
    return cats;
  }
  if (isActPcpl) {
    cats.add('ACT_PCPL-' + (romanNum || 'I'));
    return cats;
  }
  if (isMasdar) {
    cats.add('VN-' + (romanNum || 'I'));
    return cats;
  }

  if (isVerb) {
    const passive = meaning.includes('passiv');
    const form = romanNum || 'I';
    cats.add('V-' + form + (passive ? '-PASS' : ''));
    return cats;
  }

  // Nominal/adjectival indicators
  if (meaning.includes('plural') || meaning.match(/\bpl\.\b/) || meaning.includes('m.pl.') || meaning.includes('f.pl.')) {
    cats.add('N-PL');
    return cats;
  }
  if (meaning.includes('fem.') || meaning.includes('feminin') || meaning.includes('f.,') || meaning.match(/\bf\.\b/)) {
    cats.add('N-F');
    return cats;
  }

  // Default: covers both N and ADJ
  cats.add('N_OR_ADJ');
  return cats;
}

// ============================================================
// Clean vocalized form for display
// ============================================================
function cleanVocalizedForm(v) {
  let f = v;
  // Remove corpus artifacts
  f = f.replace(/[,\.@\[\]]+$/, '');
  f = f.replace(/[,\.@\[\]]+/g, '');
  // Remove initial conjunction
  f = f.replace(/^(وَ|فَ)/, '');
  // Remove initial preposition proclitic
  f = f.replace(/^(بِ|لِ|كَ|لِّ|بِّ)(?=\S)/, '');
  // Remove pronominal suffixes for citation form (only for non-verb entries)
  // Don't strip suffixes from verbs (they're part of the citation)
  return f;
}

/**
 * Additional cleanup specifically for noun/adj citation forms:
 * remove attached pronouns.
 */
function cleanNounCitationForm(v, m) {
  let f = v;
  // For nouns with attached pronouns, try to get the bare form
  // But only if there's a clear pronoun suffix pattern
  // Actually, we should prefer forms that are already INDEF (no pronouns)
  // The scoring system handles this -- just clean corpus artifacts
  f = f.replace(/[,\.@\[\]ٕ]+/g, '');
  return f;
}

// ============================================================
// German meaning generation
// ============================================================

function getRootVerb(rootMeaning) {
  const cleaned = rootMeaning.split('—')[0].trim();
  const first = cleaned.split(/[,;]/)[0].trim();
  return first;
}

function getRootMeaningWords(rootMeaning) {
  const cleaned = rootMeaning.split('—')[0].trim();
  return cleaned;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate a German meaning string for a new derivative.
 */
function generateMeaning(cat, rootMeaning) {
  const verb = getRootVerb(rootMeaning);
  const allMeanings = getRootMeaningWords(rootMeaning);

  if (cat.startsWith('V-')) {
    const formParts = cat.replace('V-', '').split('-');
    const formNum = formParts[0];
    const isPassive = formParts.includes('PASS');

    if (formNum === 'I' && !isPassive) {
      return verb + ' (I)';
    }
    if (formNum === 'I' && isPassive) {
      return verb + ' (I, Passiv)';
    }

    const formHints = {
      'II': 'intensiv/kausativ',
      'III': 'reziprok/strebend',
      'IV': 'kausativ',
      'V': 'reflexiv zu II',
      'VI': 'reziprok/simuliert',
      'VII': 'medio-passiv',
      'VIII': 'reflexiv/beteiligt',
      'IX': 'Farbveraenderung',
      'X': 'Anforderung/Einschaetzung',
    };
    const hint = formHints[formNum] || '';
    const parts = [verb, '(' + formNum];
    if (hint) parts.push(hint);
    if (isPassive) parts.push('Passiv');
    return parts[0] + ' ' + parts.slice(1).join(', ') + ')';
  }

  if (cat.startsWith('ACT_PCPL-')) {
    const formNum = cat.replace('ACT_PCPL-', '');
    if (formNum === 'I') return 'Aktiv-Partizip (I)';
    return 'Aktiv-Partizip (' + formNum + ')';
  }

  if (cat.startsWith('PASS_PCPL-')) {
    const formNum = cat.replace('PASS_PCPL-', '');
    if (formNum === 'I') return 'Passiv-Partizip (I)';
    return 'Passiv-Partizip (' + formNum + ')';
  }

  if (cat.startsWith('VN-')) {
    const formNum = cat.replace('VN-', '');
    if (formNum === 'I') return 'Masdar (I)';
    return 'Masdar (' + formNum + ')';
  }

  if (cat === 'N') return allMeanings + ' (Nomen)';
  if (cat === 'N-F') return allMeanings + ' (Nomen, fem.)';
  if (cat === 'N-PL') return allMeanings + ' (Nomen, Plural)';
  if (cat === 'ADJ') return allMeanings + ' (Adjektiv)';
  if (cat === 'ADJ-F') return allMeanings + ' (Adjektiv, fem.)';
  if (cat === 'ADJ-PL') return allMeanings + ' (Adjektiv, Plural)';

  return allMeanings;
}

// ============================================================
// Main processing
// ============================================================
console.log('Processing roots...');

let expandedRoots = 0;
let totalNewDerivatives = 0;
const expandDetails = [];

// Pre-computation: count before
const beforeCounts = {};
rootData.roots.forEach(r => {
  const n = r.keyDerivatives ? r.keyDerivatives.length : 0;
  beforeCounts[n] = (beforeCounts[n] || 0) + 1;
});

rootData.roots.forEach(r => {
  if (!r.keyDerivatives) r.keyDerivatives = [];
  if (r.keyDerivatives.length >= 3) return;

  const availableCats = rootIndex[r.root];
  if (!availableCats) return;

  // Determine which categories existing derivatives already cover
  // Use form-based cross-referencing against the morphology DB
  const coveredCats = new Set();
  r.keyDerivatives.forEach(d => {
    const cats = findExistingCategories(d, r.root);
    cats.forEach(c => coveredCats.add(c));
  });

  // Expand coverage: N_OR_ADJ covers both N and ADJ
  if (coveredCats.has('N_OR_ADJ')) {
    coveredCats.add('N');
    coveredCats.add('ADJ');
  }
  if (coveredCats.has('N')) {
    coveredCats.add('N_OR_ADJ');
  }
  if (coveredCats.has('ADJ')) {
    coveredCats.add('N_OR_ADJ');
  }

  // If both N and ADJ are available but represent the same vocalized form
  // (corpus POS-tagging ambiguity), treat ADJ as already covered by N
  if (availableCats['N'] && availableCats['ADJ']) {
    const nForm = availableCats['N'].best?.v;
    const adjForm = availableCats['ADJ'].best?.v;
    if (nForm === adjForm) {
      coveredCats.add('ADJ');
    }
  }

  // Find new categories not yet covered
  const newCats = Object.keys(availableCats).filter(cat => !coveredCats.has(cat));

  if (newCats.length === 0) return;

  // Sort by priority
  newCats.sort((a, b) => categoryPriority(a) - categoryPriority(b));

  // How many can we add?
  const needed = 3 - r.keyDerivatives.length;
  const maxTotal = 5;
  const canAdd = Math.min(needed, maxTotal - r.keyDerivatives.length, newCats.length);

  if (canAdd <= 0) return;

  const added = [];
  for (let i = 0; i < canAdd && added.length < canAdd; i++) {
    const cat = newCats[i];
    const catData = availableCats[cat];
    if (!catData || !catData.best) continue;

    let cleanForm = cleanVocalizedForm(catData.best.v);
    // Additional cleanup for noun/adj forms
    if (cat.startsWith('N') || cat.startsWith('ADJ') || cat.startsWith('ACT_PCPL') ||
        cat.startsWith('PASS_PCPL') || cat.startsWith('VN')) {
      cleanForm = cleanNounCitationForm(cleanForm, catData.best.m);
    }

    const count = catData.totalCount;
    const meaning = generateMeaning(cat, r.meaning);

    // Avoid adding a form that matches an existing derivative (consonantal comparison)
    const cleanStripped = stripDiacritics(cleanForm);
    if (r.keyDerivatives.some(d => stripDiacritics(d.form) === cleanStripped)) continue;

    const newDeriv = {
      form: cleanForm,
      count: count,
      meaning: meaning
    };

    r.keyDerivatives.push(newDeriv);
    added.push({ cat, form: cleanForm, meaning, count });

    // Mark this category as covered now
    coveredCats.add(cat);
  }

  if (added.length > 0) {
    expandedRoots++;
    totalNewDerivatives += added.length;
    expandDetails.push({
      root: r.root,
      before: r.keyDerivatives.length - added.length,
      after: r.keyDerivatives.length,
      added
    });
  }
});

// ============================================================
// Update meta
// ============================================================
let totalDerivatives = 0;
rootData.roots.forEach(r => {
  totalDerivatives += (r.keyDerivatives || []).length;
});
rootData.meta.derivativeMeaningsFilled = totalDerivatives;

// ============================================================
// Write result
// ============================================================
console.log('\nWriting updated root-meanings.json...');
fs.writeFileSync(rootMeaningsPath, JSON.stringify(rootData, null, 2), 'utf8');

// ============================================================
// Report
// ============================================================
console.log('\n=== Expansion Report ===');
console.log('Roots expanded:', expandedRoots);
console.log('Total new derivatives added:', totalNewDerivatives);
console.log('Total derivatives now:', totalDerivatives);

console.log('\nDerivative count distribution BEFORE:');
Object.keys(beforeCounts).sort((a, b) => a - b).forEach(k => {
  console.log('  ' + k + ' derivatives:', beforeCounts[k], 'roots');
});

const afterCounts = {};
rootData.roots.forEach(r => {
  const n = r.keyDerivatives ? r.keyDerivatives.length : 0;
  afterCounts[n] = (afterCounts[n] || 0) + 1;
});
console.log('\nDerivative count distribution AFTER:');
Object.keys(afterCounts).sort((a, b) => a - b).forEach(k => {
  console.log('  ' + k + ' derivatives:', afterCounts[k], 'roots');
});

// Show sample expansions
console.log('\nSample expansions (first 25):');
expandDetails.slice(0, 25).forEach(d => {
  console.log('\n  Root:', d.root, '(' + d.before + ' -> ' + d.after + ')');
  d.added.forEach(a => {
    console.log('    +', a.cat, ':', a.form, '|', a.meaning, '(x' + a.count + ')');
  });
});

const stillUnder3 = rootData.roots.filter(r => r.keyDerivatives && r.keyDerivatives.length < 3).length;
console.log('\nRoots still with < 3 derivatives:', stillUnder3,
  '(these roots have limited morphological attestation in the Quran)');
