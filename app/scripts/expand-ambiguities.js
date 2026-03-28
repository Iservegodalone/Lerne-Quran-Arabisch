/**
 * expand-ambiguities.js
 *
 * Reads quran-morphology-db.json and ambiguities.json, then:
 *   A.1  Cleans up single-option entries (remove baselines, upgrade where possible)
 *   A.2  Generates active/passive ambiguity entries from Form I perfect verbs
 *   A.3  Generates root ambiguity entries from consonantal forms with 2+ roots
 *   A.4  Generates form ambiguity entries for Alif-prefix verbs
 *
 * Writes the expanded ambiguities.json back in place.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ──────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MORPH_PATH = path.join(DATA_DIR, 'quran-morphology-db.json');
const AMBIG_PATH = path.join(DATA_DIR, 'ambiguities.json');
const BACKUP_PATH = path.join(DATA_DIR, 'ambiguities.backup.json');

// ── Idempotency: if the file has already been expanded (entries with id >= 10000),
// strip those entries and revert in-place modifications before re-processing.
// Also maintain a backup for safety.
if (!fs.existsSync(BACKUP_PATH)) {
  // Check if ambiguities.json already contains expanded entries
  const tempData = JSON.parse(fs.readFileSync(AMBIG_PATH, 'utf8'));
  const hasExpanded = tempData.entries.some(e => e.id >= 10000);
  if (!hasExpanded) {
    console.log('Creating backup of original ambiguities.json...');
    fs.copyFileSync(AMBIG_PATH, BACKUP_PATH);
  } else {
    console.log('File already expanded but no backup exists. Stripping generated entries for re-run...');
    // Strip generated entries (id >= 10000) and save as backup
    tempData.entries = tempData.entries.filter(e => e.id < 10000);
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(tempData, null, 2), 'utf8');
    fs.writeFileSync(AMBIG_PATH, JSON.stringify(tempData, null, 2), 'utf8');
  }
} else {
  console.log('Restoring from backup for idempotent re-run...');
  fs.copyFileSync(BACKUP_PATH, AMBIG_PATH);
}

// ── Load data ──────────────────────────────────────────────────────────────────
console.log('Loading morphology DB...');
const morphDB = JSON.parse(fs.readFileSync(MORPH_PATH, 'utf8'));
console.log(`  ${morphDB.words.length} words loaded.`);

console.log('Loading ambiguities...');
const ambigData = JSON.parse(fs.readFileSync(AMBIG_PATH, 'utf8'));
const originalCount = ambigData.entries.length;
console.log(`  ${originalCount} entries loaded.`);

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Strip Arabic diacritics / vowels from a vocalized string to get consonantal skeleton.
 */
function stripDiacritics(s) {
  if (!s) return '';
  return s
    .replace(/[\u064B-\u0670\u0610-\u061A\u06D6-\u06ED\u0640\u0671@[\]]/g, '')
    .replace(/ٱ/g, 'ا');
}

/**
 * Check if a morphology entry is a Form I verb (no explicit form marker, or marker is (I)).
 */
function isFormI(m) {
  if (!m) return false;
  const formMatch = m.match(/\(([IVXL]+)\)/);
  if (!formMatch) return true; // no form marker = Form I
  return formMatch[1] === 'I';
}

/**
 * Extract the form number from a morphology string, e.g. "(IV)" -> "IV".
 * Returns null if no form marker (implies Form I).
 */
function extractForm(m) {
  if (!m) return null;
  const match = m.match(/\(([IVXL]+)\)/);
  return match ? match[1] : null;
}

/**
 * Check if c and v fields are aligned (consonantal form matches stripped vocalized).
 */
function isAligned(word) {
  return word.c === stripDiacritics(word.v);
}

/**
 * Parse a person/gender/number tag like "3MS", "2MP", "1P" etc.
 */
function parsePersonTag(m) {
  const tags = m.split('|');
  for (const tag of tags) {
    const pgn = tag.match(/^([123])([MF]?)([SDP])$/);
    if (pgn) return { person: pgn[1], gender: pgn[2] || '', number: pgn[3] };
  }
  return null;
}

/**
 * Get a human-readable person/number description.
 */
function describePGN(pgn) {
  if (!pgn) return '';
  const persons = { '1': '1st', '2': '2nd', '3': '3rd' };
  const genders = { 'M': 'masculine', 'F': 'feminine', '': '' };
  const numbers = { 'S': 'singular', 'D': 'dual', 'P': 'plural' };
  return `${persons[pgn.person]} person ${genders[pgn.gender]} ${numbers[pgn.number]}`.replace(/\s+/g, ' ').trim();
}

/**
 * Reconstruct a PGN tag string like "3MS".
 */
function pgnTag(pgn) {
  if (!pgn) return '';
  return `${pgn.person}${pgn.gender}${pgn.number}`;
}

// ── Known intransitive roots (common ones that rarely take passives) ───────────
const INTRANSITIVE_ROOTS = new Set([
  'ك و ن', 'ذ ه ب', 'م و ت', 'ج ي ا', 'ق و م', 'ج ل س',
  'ق ع د', 'ن و م', 'و ق ع', 'خ ر ج', 'د خ ل', 'ج ع ل',
  'ك ب ر', 'ص غ ر', 'ح س ن', 'ز ي د', 'ح ي ي', 'ب ق ي',
  'م ض ي', 'ف ر ر', 'ع ج ب', 'ع ظ م', 'ك ث ر', 'ق ل ل',
  'ر ج ع', 'ا ت ي', 'ب د و', 'ظ ل م', 'ع ل و'
]);

// Roots where kaAn special particle is used (stative verbs)
const STATIVE_ROOTS = new Set([
  'ك و ن', 'ل ي س', 'ص ي ر', 'ب ق ي', 'ز ي ل', 'ف ت ا'
]);

// ── Step A.1: Clean up single-option entries ───────────────────────────────────
console.log('\n=== A.1: Cleaning up single-option entries ===');

let removedCount = 0;
let upgradedCount = 0;
const entriesToRemove = new Set();
const existingConsonants = new Set(ambigData.entries.map(e => e.consonants + '|' + e.category));
const existingLocations = new Set(ambigData.entries.map(e => e.location));

// Build a lookup of morphDB by consonantal form for quick reference
const morphByC = {};
morphDB.words.forEach(w => {
  if (!w.r) return;
  if (!morphByC[w.c]) morphByC[w.c] = [];
  morphByC[w.c].push(w);
});

// Build a lookup of aligned entries only (c matches stripped v)
const alignedByC = {};
morphDB.words.forEach(w => {
  if (!w.r) return;
  if (!isAligned(w)) return;
  if (!alignedByC[w.c]) alignedByC[w.c] = [];
  alignedByC[w.c].push(w);
});

for (const entry of ambigData.entries) {
  if (entry.options.length !== 1) continue; // skip multi-option entries

  const note = (entry._note || '').toLowerCase();
  const isBaseline = note.includes('baseline') ||
                     note.includes('unambiguous') ||
                     note.includes('only one') ||
                     note.includes('only viable') ||
                     note.includes('forced by context');

  // A.1.a: Remove baseline/reference entries
  if (isBaseline) {
    // But first check if we can upgrade them...
    let upgraded = false;

    if (entry.category === 'active_passive') {
      // Check if a passive option can be added for transitive verbs
      const opt = entry.options[0];
      if (opt.pos === 'V' && opt.root && !INTRANSITIVE_ROOTS.has(opt.root)) {
        const morph = opt.morphology || '';
        if (morph.includes('imperfect') || morph.includes('perfect')) {
          // Could potentially have a passive - but the note says it's unambiguous
          // Trust the note for baseline entries
        }
      }
    }

    if (!upgraded) {
      entriesToRemove.add(entry.id);
      removedCount++;
      continue;
    }
  }

  // A.1.b: Single-option active_passive with transitive verb -> add passive
  if (entry.category === 'active_passive' && !isBaseline) {
    const opt = entry.options[0];
    if (opt.pos === 'V' && opt.root && !INTRANSITIVE_ROOTS.has(opt.root)) {
      const morph = opt.morphology || '';
      const form = opt.form || '';

      // Only add passive for Form I active verbs
      if ((form.includes('Form I') || !form.match(/Form [IVXL]+/)) &&
          !morph.includes('passive') && !morph.includes('imperative')) {

        const pgn = parsePersonTag(
          (morph.match(/([123])(?:st|nd|rd) person (masculine |feminine )?(singular|dual|plural)/i) || []).slice(1).join('') || ''
        );

        // Build passive option
        // Construct clean passive form and morphology descriptions
        let passiveForm;
        if (form.includes('imperfect')) {
          passiveForm = form.replace(/imperfect/, 'imperfect passive');
        } else if (form.includes('perfect')) {
          passiveForm = form.replace(/perfect/, 'perfect passive');
        } else {
          passiveForm = morph.includes('imperfect') ? 'Form I imperfect passive' : 'Form I perfect passive';
        }

        let passiveMorph = morph;
        // Replace "active" with "passive"
        if (passiveMorph.includes('active')) {
          passiveMorph = passiveMorph.replace(/active/g, 'passive');
        } else {
          // Add "passive" after "indicative" or "Form I"
          passiveMorph = passiveMorph.replace(/indicative/, 'indicative passive');
        }

        const passiveOpt = {
          vocalized: opt.vocalized,
          root: opt.root,
          form: passiveForm,
          pos: 'V',
          morphology: passiveMorph,
          meaning_de: `(Passiv) ${opt.meaning_de}`,
          meaning_en: `(passive) ${opt.meaning_en}`
        };

        entry.options.push(passiveOpt);
        delete entry._note;
        upgradedCount++;
        continue;
      }
    }
  }

  // A.1.c: Single-option form_ambiguity -> check if alternate form is plausible
  if (entry.category === 'form_ambiguity' && !isBaseline) {
    const opt = entry.options[0];
    if (opt.pos === 'V') {
      const currentForm = extractForm(opt.morphology || '') || 'I';
      const c = entry.consonants;

      // Check morphDB for the same consonantal form with a different form marker
      const morphEntries = (alignedByC[c] || morphByC[c] || []).filter(w => w.p === 'V');
      const otherForms = morphEntries.filter(w => {
        const f = extractForm(w.m) || 'I';
        return f !== currentForm;
      });

      if (otherForms.length > 0) {
        // Pick the most common alternate form
        const formCounts = {};
        otherForms.forEach(w => {
          const f = extractForm(w.m) || 'I';
          formCounts[f] = (formCounts[f] || 0) + 1;
        });
        const bestAlt = Object.entries(formCounts).sort((a, b) => b[1] - a[1])[0];
        const altForm = bestAlt[0];
        const altSample = otherForms.find(w => (extractForm(w.m) || 'I') === altForm);

        const altOpt = {
          vocalized: opt.vocalized,
          root: altSample.r || opt.root,
          form: `Form ${altForm} ${opt.morphology.includes('imperfect') ? 'imperfect' : 'perfect'}`,
          pos: 'V',
          morphology: opt.morphology.replace(/Form [IVXL]+/g, `Form ${altForm}`),
          meaning_de: `(alternative Formanalyse Form ${altForm})`,
          meaning_en: `(alternate form analysis as Form ${altForm})`
        };

        entry.options.push(altOpt);
        delete entry._note;
        upgradedCount++;
        continue;
      } else {
        // No alternate form found - remove if no note of substance
        if (!entry._note || entry._note === '') {
          // Keep it, but don't count as removed - it may be intentionally single-option
        }
      }
    }
  }

  // A.1.d: Single-option root_ambiguity -> check if consonantal form appears with different root
  if (entry.category === 'root_ambiguity' && !isBaseline) {
    const opt = entry.options[0];
    const c = entry.consonants;
    const currentRoot = opt.root;

    // Check morphDB for same consonantal form with different root (same POS)
    const morphEntries = (alignedByC[c] || morphByC[c] || []).filter(w =>
      w.p === opt.pos && w.r && w.r !== currentRoot
    );

    if (morphEntries.length > 0) {
      // Group by root, pick most common
      const rootCounts = {};
      morphEntries.forEach(w => {
        rootCounts[w.r] = (rootCounts[w.r] || 0) + 1;
      });
      const bestRoot = Object.entries(rootCounts).sort((a, b) => b[1] - a[1])[0];
      const altRoot = bestRoot[0];

      const altOpt = {
        vocalized: opt.vocalized,
        root: altRoot,
        form: opt.form,
        pos: opt.pos,
        morphology: opt.morphology + ` (alternate root ${altRoot})`,
        meaning_de: `(alternative Wurzel ${altRoot})`,
        meaning_en: `(alternate root ${altRoot})`
      };

      entry.options.push(altOpt);
      delete entry._note;
      upgradedCount++;
    } else {
      // No alternate root found
      // If note says it's about polysemy or debated, keep it
      if (note.includes('polysem') || note.includes('debated') || note.includes('loanword') ||
          note.includes('persian') || note.includes('avestan') || note.includes('proper name')) {
        // Keep as-is: these are intentionally single-option semantic notes
      } else if (!entry._note) {
        // No note, no alternate root found -> remove
        entriesToRemove.add(entry.id);
        removedCount++;
      }
    }
  }
}

// Filter out removed entries
ambigData.entries = ambigData.entries.filter(e => !entriesToRemove.has(e.id));

console.log(`  Removed: ${removedCount} baseline/unambiguous entries`);
console.log(`  Upgraded: ${upgradedCount} single-option entries to multi-option`);

// ── Step A.2: Generate active/passive ambiguity entries ─────────────────────────
console.log('\n=== A.2: Generating active/passive ambiguity entries ===');

let nextId = 10000;

// Find Form I perfect active verbs (no PASS tag) that are transitive
const formIPerfActive = morphDB.words.filter(w =>
  w.p === 'V' &&
  w.m &&
  w.m.includes('PERF') &&
  !w.m.includes('PASS') &&
  !w.m.includes('SP:kaAn') &&
  !w.m.includes('SP:kaAd') &&
  isFormI(w.m) &&
  w.r &&
  !INTRANSITIVE_ROOTS.has(w.r) &&
  !STATIVE_ROOTS.has(w.r) &&
  isAligned(w) // only use aligned entries
);

console.log(`  Found ${formIPerfActive.length} Form I perfect active aligned verb tokens.`);

// Group by consonantal form to deduplicate
const apByConsonants = {};
formIPerfActive.forEach(w => {
  if (!apByConsonants[w.c]) {
    apByConsonants[w.c] = { root: w.r, locations: [], pgns: new Set() };
  }
  apByConsonants[w.c].locations.push(w.l);
  // Extract PGN
  const tags = w.m.split('|');
  for (const t of tags) {
    if (t.match(/^[123][MF]?[SDP]$/)) {
      apByConsonants[w.c].pgns.add(t);
    }
  }
});

// Check which consonantal forms already have active_passive entries
const existingAPConsonants = new Set(
  ambigData.entries.filter(e => e.category === 'active_passive').map(e => e.consonants)
);

let apAdded = 0;
for (const [c, data] of Object.entries(apByConsonants)) {
  if (existingAPConsonants.has(c)) continue; // already covered

  // Skip very common auxiliary verbs
  if (['كانوا', 'كان', 'كنتم', 'كنت'].includes(c)) continue;

  // Get representative PGN
  const pgn = [...data.pgns][0] || '3MS';
  const pgnDesc = describePGN(parsePersonTag('PERF|' + pgn) ? null : null);

  // Build person description from the tag
  const persons = { '1': '1st', '2': '2nd', '3': '3rd' };
  const genders = { 'M': 'masculine ', 'F': 'feminine ', '': '' };
  const numbers = { 'S': 'singular', 'D': 'dual', 'P': 'plural' };
  const p = pgn[0], g = pgn.length === 3 ? pgn[1] : '', n = pgn[pgn.length - 1];
  const desc = `${persons[p] || ''} person ${genders[g] || ''}${numbers[n] || ''}`;

  const sampleLoc = data.locations[0];

  const activeOpt = {
    vocalized: c,
    root: data.root,
    form: 'Form I perfect active',
    pos: 'V',
    morphology: `${desc} perfect active Form I`,
    meaning_de: '(aktive Lesart)',
    meaning_en: '(active reading)'
  };

  const passiveOpt = {
    vocalized: c,
    root: data.root,
    form: 'Form I perfect passive',
    pos: 'V',
    morphology: `${desc} perfect passive Form I`,
    meaning_de: '(passive Lesart)',
    meaning_en: '(passive reading)'
  };

  const newEntry = {
    id: nextId++,
    location: sampleLoc,
    consonants: c,
    options: [activeOpt, passiveOpt],
    category: 'active_passive'
  };

  if (data.locations.length > 1) {
    newEntry._sampleLocations = data.locations.slice(0, 5);
  }

  ambigData.entries.push(newEntry);
  apAdded++;
}

console.log(`  Generated ${apAdded} new active/passive entries.`);

// ── Step A.3: Generate root ambiguity entries ──────────────────────────────────
console.log('\n=== A.3: Generating root ambiguity entries ===');

// Only use aligned entries for root ambiguity to avoid false positives
const alignedWords = morphDB.words.filter(w => w.r && isAligned(w));
console.log(`  Using ${alignedWords.length} aligned entries (of ${morphDB.words.length} total).`);

// Group aligned entries by consonantal form
const rootsByC = {};
alignedWords.forEach(w => {
  const key = w.c;
  if (!rootsByC[key]) rootsByC[key] = {};
  if (!rootsByC[key][w.r]) {
    rootsByC[key][w.r] = { pos: new Set(), count: 0, samples: [], morphSample: null };
  }
  rootsByC[key][w.r].pos.add(w.p);
  rootsByC[key][w.r].count++;
  if (rootsByC[key][w.r].samples.length < 3) {
    rootsByC[key][w.r].samples.push(w.l);
  }
  if (!rootsByC[key][w.r].morphSample) {
    rootsByC[key][w.r].morphSample = w;
  }
});

// Existing root_ambiguity consonantal forms
const existingRootConsonants = new Set(
  ambigData.entries.filter(e => e.category === 'root_ambiguity').map(e => e.consonants)
);

let rootAdded = 0;
for (const [c, roots] of Object.entries(rootsByC)) {
  if (existingRootConsonants.has(c)) continue;

  const rootKeys = Object.keys(roots);
  if (rootKeys.length < 2) continue;

  // Filter to roots with at least 2 occurrences to avoid noise
  const substantial = rootKeys.filter(r => roots[r].count >= 2);
  if (substantial.length < 2) continue;

  // Skip very short consonantal forms (1-2 chars) as they are usually particles
  if (c.length <= 2) continue;

  // Check if roots share a POS
  const allPoses = {};
  substantial.forEach(r => {
    roots[r].pos.forEach(p => {
      if (!allPoses[p]) allPoses[p] = [];
      allPoses[p].push(r);
    });
  });

  // Find POS categories with 2+ roots
  let sharedPOS = null;
  let posNote = '';
  for (const [pos, posRoots] of Object.entries(allPoses)) {
    if (posRoots.length >= 2) {
      sharedPOS = pos;
      break;
    }
  }

  if (!sharedPOS) {
    // Different POS categories - note this
    posNote = 'POS also differs across root analyses.';
    sharedPOS = [...roots[substantial[0]].pos][0]; // use first root's POS
  }

  // Build options (top 2-3 roots by frequency)
  const sortedRoots = substantial.sort((a, b) => roots[b].count - roots[a].count).slice(0, 3);
  const options = sortedRoots.map(r => {
    const sample = roots[r].morphSample;
    return {
      vocalized: c,
      root: r,
      form: sample ? (sample.m || '') : '',
      pos: [...roots[r].pos][0],
      morphology: `root ${r} (attested ${roots[r].count}x)`,
      meaning_de: `(Wurzel ${r})`,
      meaning_en: `(root ${r})`
    };
  });

  const sampleLoc = roots[sortedRoots[0]].samples[0];

  const newEntry = {
    id: nextId++,
    location: sampleLoc,
    consonants: c,
    options: options,
    category: 'root_ambiguity'
  };

  if (posNote) {
    newEntry._note = posNote;
  }

  ambigData.entries.push(newEntry);
  rootAdded++;
}

console.log(`  Generated ${rootAdded} new root ambiguity entries.`);

// ── Step A.4: Generate form ambiguity entries for Alif-prefix verbs ────────────
console.log('\n=== A.4: Generating form ambiguity entries for Alif-prefix verbs ===');

// Find Alif-prefix verbs in aligned entries
const alifVerbs = alignedWords.filter(w =>
  w.p === 'V' &&
  (w.c.startsWith('ا') || w.c.startsWith('أ') || w.c.startsWith('إ'))
);

console.log(`  Found ${alifVerbs.length} Alif-prefix verb tokens (aligned).`);

// Group by consonantal form
const alifByC = {};
alifVerbs.forEach(w => {
  if (!alifByC[w.c]) alifByC[w.c] = [];
  alifByC[w.c].push(w);
});

// Existing form_ambiguity consonantal forms
const existingFormConsonants = new Set(
  ambigData.entries.filter(e => e.category === 'form_ambiguity').map(e => e.consonants)
);

// Also skip consonantal forms already covered by any category
const existingAllConsonants = new Set(
  ambigData.entries.map(e => e.consonants)
);

let formAdded = 0;

// Forms that Alif-prefix could represent
// Form I imperative (اُفْعُلْ pattern - hamzat al-wasl)
// Form IV perfect (أَفْعَلَ)
// Form VII perfect (اِنْفَعَلَ)
// Form VIII perfect (اِفْتَعَلَ)
// Form X perfect (اِسْتَفْعَلَ)

for (const [c, entries] of Object.entries(alifByC)) {
  if (existingAllConsonants.has(c)) continue;
  if (c.length <= 2) continue; // too short to be ambiguous

  // Check what forms are attested for this consonantal form
  const formSet = new Set();
  const formSamples = {};
  entries.forEach(w => {
    const form = extractForm(w.m) || 'I';
    const tense = w.m.includes('PERF') ? 'PERF' : w.m.includes('IMPF') ? 'IMPF' : 'IMPV';
    const key = `${tense}|${form}`;
    formSet.add(key);
    if (!formSamples[key]) formSamples[key] = w;
  });

  // If already unambiguous (only one form attested), check if other forms are plausible
  if (formSet.size === 1) {
    const attestedKey = [...formSet][0];
    const [tense, form] = attestedKey.split('|');
    const sample = formSamples[attestedKey];

    // Check if consonantal skeleton could be another form
    const possibleForms = [];

    if (tense === 'PERF' && form === 'IV' && c.length >= 3) {
      // Form IV perfect أَفْعَلَ could look like Form I imperative اُفْعُلْ
      // Only if the root is triliteral and the alif prefix matches
      possibleForms.push({ form: 'I', tense: 'IMPV', desc: 'Form I imperative' });
    }

    if (tense === 'IMPV' && form === 'I' && c.length >= 3) {
      // Form I imperative could look like Form IV perfect
      possibleForms.push({ form: 'IV', tense: 'PERF', desc: 'Form IV perfect' });
    }

    if (tense === 'PERF' && (form === 'VII' || form === 'VIII') && c.length >= 4) {
      // Form VII/VIII could be confused with each other in some cases
      const altForm = form === 'VII' ? 'VIII' : 'VII';
      possibleForms.push({ form: altForm, tense: 'PERF', desc: `Form ${altForm} perfect` });
    }

    if (possibleForms.length > 0) {
      const options = [];

      // Add the attested form
      options.push({
        vocalized: c,
        root: sample.r,
        form: `Form ${form} ${tense === 'PERF' ? 'perfect' : tense === 'IMPF' ? 'imperfect' : 'imperative'}`,
        pos: 'V',
        morphology: `${sample.m} (attested)`,
        meaning_de: `(belegte Analyse: Form ${form})`,
        meaning_en: `(attested analysis: Form ${form})`
      });

      // Add plausible alternative forms
      possibleForms.forEach(pf => {
        options.push({
          vocalized: c,
          root: sample.r,
          form: pf.desc,
          pos: 'V',
          morphology: `${pf.tense}|${pf.form} (consonantally plausible)`,
          meaning_de: `(konsonantisch moeglich: ${pf.desc})`,
          meaning_en: `(consonantally plausible: ${pf.desc})`
        });
      });

      const newEntry = {
        id: nextId++,
        location: sample.l,
        consonants: c,
        options: options,
        category: 'form_ambiguity'
      };

      ambigData.entries.push(newEntry);
      formAdded++;
    }
  } else if (formSet.size >= 2) {
    // Multiple forms already attested for same consonantal skeleton - genuine ambiguity
    const options = [];
    const seenForms = new Set();

    for (const [key, sample] of Object.entries(formSamples)) {
      const [tense, form] = key.split('|');
      const formKey = `${form}|${tense}`;
      if (seenForms.has(formKey)) continue;
      seenForms.add(formKey);

      options.push({
        vocalized: c,
        root: sample.r,
        form: `Form ${form} ${tense === 'PERF' ? 'perfect' : tense === 'IMPF' ? 'imperfect' : 'imperative'}`,
        pos: 'V',
        morphology: sample.m,
        meaning_de: `(Form ${form} ${tense})`,
        meaning_en: `(Form ${form} ${tense})`
      });
    }

    if (options.length >= 2) {
      const sampleLoc = entries[0].l;
      const newEntry = {
        id: nextId++,
        location: sampleLoc,
        consonants: c,
        options: options,
        category: 'form_ambiguity'
      };

      ambigData.entries.push(newEntry);
      formAdded++;
    }
  }
}

console.log(`  Generated ${formAdded} new form ambiguity entries.`);

// ── Final: Sort entries and write ──────────────────────────────────────────────
console.log('\n=== Writing output ===');

// Sort: existing entries first (by original id), then new entries (by new id)
ambigData.entries.sort((a, b) => a.id - b.id);

const finalCount = ambigData.entries.length;
const newEntries = ambigData.entries.filter(e => e.id >= 10000).length;

// Write output
fs.writeFileSync(AMBIG_PATH, JSON.stringify(ambigData, null, 2), 'utf8');

// ── Statistics ─────────────────────────────────────────────────────────────────
console.log('\n========== STATISTICS ==========');
console.log(`Entries before:        ${originalCount}`);
console.log(`Entries removed:       ${removedCount}`);
console.log(`Entries upgraded:      ${upgradedCount} (1 option -> 2+ options)`);
console.log(`New entries added:     ${newEntries}`);
console.log(`  - active/passive:    ${apAdded}`);
console.log(`  - root ambiguity:    ${rootAdded}`);
console.log(`  - form ambiguity:    ${formAdded}`);
console.log(`Entries after:         ${finalCount}`);
console.log('================================');

// Category breakdown
const catCounts = {};
ambigData.entries.forEach(e => {
  catCounts[e.category] = (catCounts[e.category] || 0) + 1;
});
console.log('\nCategory breakdown:');
for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

// Option count breakdown
const optCounts = {};
ambigData.entries.forEach(e => {
  const n = e.options.length;
  optCounts[n] = (optCounts[n] || 0) + 1;
});
console.log('\nOptions per entry:');
for (const [n, count] of Object.entries(optCounts).sort((a, b) => Number(a) - Number(b))) {
  console.log(`  ${n} option(s): ${count} entries`);
}

console.log('\nDone.');
