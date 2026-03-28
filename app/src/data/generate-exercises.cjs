/**
 * generate-exercises.cjs
 *
 * Reads quran-morphology-db.json and quran-uthmani.json, then generates
 * seven expanded exercise data files for the Quran Arabic learning tool.
 *
 * Output files:
 *   A) rasm-vocalization-drill-generated.json   (~200 exercises)
 *   B) case-derivation-generated.json           (~150 exercises)
 *   C) alif-wasla-generated.json                (~60 per category)
 *   D) weak-root-generated.json                 (~60 exercises)
 *   E) broken-plural-generated.json             (~80 exercises)
 *   F) pattern-recognition-generated.json       (~100 exercises)
 *   G) root-extraction-generated.json           (~80 exercises)
 *
 * Run: node generate-exercises.cjs
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Seeded PRNG for reproducibility (simple mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = 20260323;
const rng = mulberry32(SEED);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

function padId(prefix, num, digits = 3) {
  return prefix + String(num).padStart(digits, '0');
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
console.log('[1/9] Loading data files...');

const morphDB = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'quran-morphology-db.json'), 'utf8')
);
const words = morphDB.words;

const uthmani = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'quran-uthmani.json'), 'utf8')
);

// Build verse-text lookup  surah:ayah → text
const verseText = {};
for (const s of uthmani.surahs) {
  for (const v of s.verses) {
    verseText[s.number + ':' + v.number] = v.text;
  }
}

// Build location → word lookup
const wordByLoc = {};
for (const w of words) {
  wordByLoc[w.l] = w;
}

// Build ayah → words index
const ayahWords = {};
for (const w of words) {
  const parts = w.l.split(':');
  const key = parts[0] + ':' + parts[1];
  if (!ayahWords[key]) ayahWords[key] = [];
  ayahWords[key].push(w);
}

console.log('  Loaded ' + words.length + ' words from morphology DB');
console.log('  Loaded ' + Object.keys(verseText).length + ' verses from uthmani text');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSurah(w) {
  return parseInt(w.l.split(':')[0], 10);
}

function getAyah(w) {
  return parseInt(w.l.split(':')[1], 10);
}

function getRef(w) {
  const p = w.l.split(':');
  return p[0] + ':' + p[1];
}

function getVerseText(w) {
  return verseText[getRef(w)] || '';
}

// Reconstruct verse vocalized text from morphDB words
function reconstructVerse(surah, ayah) {
  const key = surah + ':' + ayah;
  const ws = ayahWords[key];
  if (!ws) return '';
  return ws.map(w => w.v || w.c).join(' ');
}

function hasCase(m) {
  return /\b(NOM|ACC|GEN)\b/.test(m);
}

function getCase(m) {
  if (/\bNOM\b/.test(m)) return 'NOM';
  if (/\bACC\b/.test(m)) return 'ACC';
  if (/\bGEN\b/.test(m)) return 'GEN';
  return null;
}

function getCaseGerman(cas) {
  const map = { NOM: 'Nominativ', ACC: 'Akkusativ', GEN: 'Genitiv' };
  return map[cas] || '';
}

function getCaseMarkerName(cas) {
  const map = { NOM: 'Damma', ACC: 'Fatha', GEN: 'Kasra' };
  return map[cas] || '';
}

function _getCaseArabicTerm(cas) {
  const map = { NOM: "marfu'", ACC: "mansub", GEN: "majrur" };
  return map[cas] || '';
}

function getTense(m) {
  if (/\bPERF\b/.test(m)) return 'PERF';
  if (/\bIMPF\b/.test(m)) return 'IMPF';
  if (/\bIMPV\b/.test(m)) return 'IMPV';
  return null;
}

function getTenseGerman(t) {
  const map = { PERF: 'Perfekt', IMPF: 'Imperfekt', IMPV: 'Imperativ' };
  return map[t] || '';
}

function getMood(m) {
  if (/\bIND\b/.test(m)) return 'IND';
  if (/\bSUBJ\b/.test(m)) return 'SUBJ';
  if (/\bJUS\b/.test(m)) return 'JUS';
  return null;
}

function getMoodGerman(mood) {
  const map = { IND: 'Indikativ', SUBJ: 'Subjunktiv', JUS: 'Jussiv' };
  return map[mood] || '';
}

function getMoodEnding(mood) {
  const map = { IND: '-u (Damma)', SUBJ: '-a (Fatha)', JUS: 'Sukun (Apocopatus)' };
  return map[mood] || '';
}

function getVerbForm(m) {
  const match = m.match(/\(([IVX]+)\)/);
  return match ? match[1] : 'I';
}

function _getVerbFormNumber(roman) {
  const map = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
  return map[roman] || 1;
}

function getVoice(m) {
  if (/\bPASS\b/.test(m)) return 'PASS';
  if (/\bACT\b/.test(m)) return 'ACT';
  return null;
}

function getPerson(m) {
  const match = m.match(/\b([123])([MF])([SDP])\b/);
  if (match) return { person: match[1], gender: match[2], number: match[3] };
  // Try just person+number without explicit gender
  const match2 = m.match(/\b([123])([SDP])\b/);
  if (match2) return { person: match2[1], gender: null, number: match2[2] };
  return null;
}

function getNumber(m) {
  if (/\bMP\b/.test(m) || /\bFP\b/.test(m)) return 'P';
  if (/\bMS\b/.test(m) || /\bFS\b/.test(m)) return 'S';
  if (/\bMD\b/.test(m) || /\bFD\b/.test(m)) return 'D';
  const pn = getPerson(m);
  if (pn) return pn.number;
  if (/\bPL\b/.test(m)) return 'P';
  return null;
}

function getGender(m) {
  if (/\bMS\b/.test(m) || /\bMP\b/.test(m) || /\bMD\b/.test(m)) return 'M';
  if (/\bFS\b/.test(m) || /\bFP\b/.test(m) || /\bFD\b/.test(m)) return 'F';
  const pn = getPerson(m);
  if (pn) return pn.gender;
  if (/\bM\b/.test(m)) return 'M';
  if (/\bF\b/.test(m)) return 'F';
  return null;
}

function isParticle(p) {
  return ['P', 'CONJ', 'NEG', 'SUP', 'INL', 'INT', 'COND', 'RES', 'VOC', 'EMPH', 'CERT', 'INC', 'EXP', 'EXL', 'RET', 'PREV', 'ANS', 'COM', 'AVR', 'FUT', 'AMD', 'SUR', 'ACC'].includes(p);
}

function mapWordType(p) {
  if (p === 'N' || p === 'PN') return 'Nomen';
  if (p === 'V') return 'Verb';
  if (p === 'ADJ') return 'Adjektiv';
  if (p === 'PRON') return 'Pronomen';
  if (p === 'REL') return 'Relativpronomen';
  if (p === 'DEM') return 'Demonstrativpronomen';
  if (isParticle(p)) return 'Partikel';
  return 'Partikel';
}

function rootWithDashes(r) {
  if (!r) return '\u2014';
  return r.split(' ').join('-');
}

function describeVerbForm(form) {
  const map = {
    I: 'Grundform (\u0641\u064E\u0639\u064E\u0644\u064E)',
    II: 'Form II (\u0641\u064E\u0639\u064E\u0651\u0644\u064E) \u2014 Intensivierung/Kausativ',
    III: 'Form III (\u0641\u064E\u0627\u0639\u064E\u0644\u064E) \u2014 Reziprok/Versuch',
    IV: 'Form IV (\u0623\u064E\u0641\u0652\u0639\u064E\u0644\u064E) \u2014 Kausativ',
    V: 'Form V (\u062A\u064E\u0641\u064E\u0639\u064E\u0651\u0644\u064E) \u2014 reflexiv zu II',
    VI: 'Form VI (\u062A\u064E\u0641\u064E\u0627\u0639\u064E\u0644\u064E) \u2014 reziprok zu III',
    VII: 'Form VII (\u0627\u0650\u0646\u0652\u0641\u064E\u0639\u064E\u0644\u064E) \u2014 Medio-Passiv',
    VIII: 'Form VIII (\u0627\u0650\u0641\u0652\u062A\u064E\u0639\u064E\u0644\u064E) \u2014 reflexiv/medio',
    IX: 'Form IX (\u0627\u0650\u0641\u0652\u0639\u064E\u0644\u0651\u064E) \u2014 Farben/Eigenschaften',
    X: 'Form X (\u0627\u0650\u0633\u0652\u062A\u064E\u0641\u0652\u0639\u064E\u0644\u064E) \u2014 Verlangen/Erachten'
  };
  return map[form] || 'Form ' + form;
}

function describeNounPattern(m, v) {
  if (/ACT\|PCPL/.test(m)) return 'Aktivpartizip (\u0641\u064E\u0627\u0639\u0650\u0644)';
  if (/PASS\|PCPL/.test(m)) return 'Passivpartizip (\u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644)';
  if (/VN/.test(m)) return 'Verbalsubstantiv (Masdar)';
  // Try to detect common patterns from vocalization
  if (v && /^\u0645\u064E/.test(v) && /\bM\b/.test(m)) return 'Orts-/Zeitnomen (\u0645\u064E\u0641\u0652\u0639\u064E\u0644)';
  return 'Nomen';
}

function describeSyntacticRole(cas, p, _m) {
  if (!cas) return '\u2014';
  if (cas === 'NOM') {
    if (p === 'V') return 'Verbform (Indikativ)';
    return "Fa'il/Mubtada (Nominativ)";
  }
  if (cas === 'ACC') {
    return "Maf'ul bihi (Akkusativ)";
  }
  if (cas === 'GEN') {
    return 'Majrur (Genitiv)';
  }
  return '\u2014';
}

// ---------------------------------------------------------------------------
// Helper: get the last consonant letter of a vocalized Arabic word
// ---------------------------------------------------------------------------
function getLastConsonant(v) {
  if (!v) return '';
  // Strip diacritics to find consonant letters
  const stripped = v.replace(/[\u064B-\u0652\u0670\u06DF]/g, '');
  if (stripped.length === 0) return '';
  return stripped[stripped.length - 1];
}

// ---------------------------------------------------------------------------
// Helper: describe particle function in German
// ---------------------------------------------------------------------------
function describeParticleFunction(p, _v) {
  const map = {
    P: 'Praeposition',
    CONJ: 'Konjunktion',
    NEG: 'Negationspartikel',
    SUP: 'Supplementpartikel',
    INT: 'Interrogativpartikel',
    COND: 'Konditionalpartikel',
    RES: 'Resultativpartikel',
    VOC: 'Vokativpartikel',
    EMPH: 'Emphase-Partikel',
    CERT: 'Bekraeftigungspartikel',
    INC: 'Inzeptivpartikel',
    EXP: 'Explikativpartikel',
    EXL: 'Exklamativpartikel',
    RET: 'Retraktivpartikel',
    PREV: 'Praeventivpartikel',
    ANS: 'Antwortpartikel',
    COM: 'Begleitungspartikel',
    AVR: 'Abwendungspartikel',
    FUT: 'Futurpartikel',
    AMD: 'Amendierungspartikel',
    SUR: 'Ueberraschungspartikel',
    ACC: 'Akkusativpartikel'
  };
  return map[p] || 'Partikel';
}

// ---------------------------------------------------------------------------
// Helper: describe gender/number in German
// ---------------------------------------------------------------------------
function describeGenderNumber(m) {
  const g = getGender(m);
  const n = getNumber(m);
  const genMap = { M: 'maskulin', F: 'feminin' };
  const numMap = { S: 'Singular', D: 'Dual', P: 'Plural' };
  const parts = [];
  if (g) parts.push(genMap[g]);
  if (n) parts.push(numMap[n]);
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Helper: describe person/gender/number for verb in German
// ---------------------------------------------------------------------------
function describePersonFull(pn) {
  if (!pn) return '';
  const personMap = { '1': '1. Person', '2': '2. Person', '3': '3. Person' };
  const genMap = { M: 'maskulin', F: 'feminin' };
  const numMap = { S: 'Singular', D: 'Dual', P: 'Plural' };
  const parts = [personMap[pn.person]];
  if (pn.gender) parts.push(genMap[pn.gender]);
  parts.push(numMap[pn.number]);
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Helper: check if a vocalized form has the definite article
// ---------------------------------------------------------------------------
function hasArticle(v) {
  if (!v) return false;
  return /^\u0671\u0644|^\u0627\u0644/.test(v);
}

// ---------------------------------------------------------------------------
// A) RASM VOCALIZATION — Rich explanation builder
// ---------------------------------------------------------------------------
function buildRasmExplanation(w) {
  const cas = getCase(w.m);
  const tense = getTense(w.m);
  const form = getVerbForm(w.m);
  const voice = getVoice(w.m);
  const root = rootWithDashes(w.r);
  const mood = getMood(w.m);
  const pn = getPerson(w.m);
  const gn = describeGenderNumber(w.m);

  // --- VERBS ---
  if (w.p === 'V') {
    const parts = [];
    // Form description
    if (form === 'I') {
      parts.push('Verb der Grundform (Form I) von ' + root);
    } else {
      parts.push(describeVerbForm(form) + ' von ' + root);
    }

    // Tense + person
    if (tense && pn) {
      parts.push(getTenseGerman(tense) + ', ' + describePersonFull(pn));
    } else if (tense) {
      parts.push(getTenseGerman(tense));
    }

    // Voice
    if (voice === 'PASS') {
      parts.push('Passiv (innerer Vokalwechsel: u-i im Perfekt, u-a im Imperfekt)');
    }

    // Mood for imperfect
    if (tense === 'IMPF' && mood) {
      parts.push(getMoodGerman(mood) + ' ' + getMoodEnding(mood));
    }

    return parts.join('. ') + '.';
  }

  // --- NOUNS / PROPER NOUNS ---
  if (w.p === 'N' || w.p === 'PN') {
    const parts = [];
    const artPrefix = hasArticle(w.v) ? '\u0627\u0644 (Definitartikel) + ' : '';

    // Participle or masdar
    if (/ACT\|PCPL/.test(w.m)) {
      const formNum = getVerbForm(w.m);
      if (formNum === 'I') {
        parts.push(artPrefix + 'Aktivpartizip Form I (Muster \u0641\u064E\u0627\u0639\u0650\u0644) von ' + root);
      } else {
        parts.push(artPrefix + 'Aktivpartizip Form ' + formNum + ' von ' + root);
      }
    } else if (/PASS\|PCPL/.test(w.m)) {
      const formNum = getVerbForm(w.m);
      if (formNum === 'I') {
        parts.push(artPrefix + 'Passivpartizip Form I (Muster \u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644) von ' + root);
      } else {
        parts.push(artPrefix + 'Passivpartizip Form ' + formNum + ' von ' + root);
      }
    } else if (/VN/.test(w.m)) {
      const formNum = getVerbForm(w.m);
      if (formNum === 'I') {
        parts.push(artPrefix + 'Masdar (Verbalsubstantiv) der Grundform von ' + root);
      } else {
        parts.push(artPrefix + 'Masdar Form ' + formNum + ' von ' + root);
      }
    } else if (w.p === 'PN') {
      parts.push(artPrefix + 'Eigenname von ' + root);
    } else {
      if (root !== '\u2014') {
        parts.push(artPrefix + 'Nomen von Wurzel ' + root);
      } else {
        parts.push(artPrefix + 'Nomen');
      }
    }

    // Gender/Number
    if (gn) {
      parts.push(gn);
    }

    // Case
    if (cas) {
      const lastC = getLastConsonant(w.v);
      const caseName = getCaseGerman(cas);
      const marker = getCaseMarkerName(cas);
      if (lastC) {
        parts.push(caseName + ' \u2192 ' + marker + ' auf ' + lastC);
      } else {
        parts.push(caseName + ' (' + marker + ')');
      }
    }

    return parts.join('. ') + '.';
  }

  // --- ADJECTIVES ---
  if (w.p === 'ADJ') {
    const parts = [];
    const artPrefix = hasArticle(w.v) ? '\u0627\u0644 (Definitartikel) + ' : '';

    if (/ACT\|PCPL/.test(w.m)) {
      parts.push(artPrefix + 'Adjektiv (Aktivpartizip) von ' + root);
    } else if (/PASS\|PCPL/.test(w.m)) {
      parts.push(artPrefix + 'Adjektiv (Passivpartizip) von ' + root);
    } else {
      parts.push(artPrefix + 'Adjektiv von Wurzel ' + root);
    }

    if (gn) {
      parts.push(gn);
    }

    if (cas) {
      parts.push('Kongruiert mit Bezugswort im ' + getCaseGerman(cas) + ' (' + getCaseMarkerName(cas) + ')');
    }

    return parts.join('. ') + '.';
  }

  // --- PRONOUNS ---
  if (w.p === 'PRON') {
    const parts = ['Personalpronomen'];
    if (gn) parts.push(gn);
    parts.push('Unveraenderlich, keine Kasusflexion');
    return parts.join('. ') + '.';
  }

  // --- DEMONSTRATIVE PRONOUNS ---
  if (w.p === 'DEM') {
    return 'Demonstrativpronomen. Unveraenderlich (mabni). Kein sichtbares Kasuszeichen.';
  }

  // --- RELATIVE PRONOUNS ---
  if (w.p === 'REL') {
    return 'Relativpronomen. Unveraenderlich (mabni). Leitet einen Relativsatz ein.';
  }

  // --- PARTICLES ---
  if (isParticle(w.p)) {
    const funcName = describeParticleFunction(w.p, w.v);
    if (w.p === 'P') {
      return w.v + ' ist eine Praeposition. Regiert den Genitiv. Unveraenderlich, keine Flexion.';
    }
    if (w.p === 'NEG') {
      return w.v + ' ist eine Negationspartikel. Unveraenderlich, keine Flexion.';
    }
    if (w.p === 'CONJ') {
      return w.v + ' ist eine Konjunktion. Verbindet Satzglieder. Unveraenderlich.';
    }
    return w.v + ' ist eine ' + funcName + '. Unveraenderlich, keine Flexion.';
  }

  // Fallback
  return mapWordType(w.p) + ' von Wurzel ' + root + '.';
}

function describeFormForRasm(w) {
  if (w.p === 'V') {
    const form = getVerbForm(w.m);
    const tense = getTense(w.m);
    const voice = getVoice(w.m);
    let desc = describeVerbForm(form);
    if (tense) desc += ', ' + getTenseGerman(tense);
    if (voice === 'PASS') desc += ', Passiv';
    return desc;
  }
  return describeNounPattern(w.m, w.v);
}

// ---------------------------------------------------------------------------
// A) rasm-vocalization-drill-generated.json  (~200)
// ---------------------------------------------------------------------------
console.log('\n[2/9] Generating rasm-vocalization-drill-generated.json...');

function generateRasmVocalization() {
  const exercises = [];
  let counter = 0;

  // Filter usable words: must have vocalized form and consonantal form
  const usable = words.filter(w =>
    w.v && w.c && w.r && w.p !== 'INL' && w.v.length > 1
  );

  // Group by sura ranges
  const fatihaEarlyBaqara = usable.filter(w => {
    const s = getSurah(w);
    return s === 1 || (s === 2 && getAyah(w) <= 50);
  });
  const midQuran = usable.filter(w => {
    const s = getSurah(w);
    return s >= 10 && s <= 40;
  });
  const lateSuras = usable.filter(w => {
    const s = getSurah(w);
    return s >= 80;
  });
  const verbForms = usable.filter(w => w.p === 'V');
  const diverse = usable.filter(w =>
    w.p === 'ADJ' || w.p === 'PRON' || w.p === 'REL' || isParticle(w.p)
  );

  // Deduplicate by consonantal form to avoid repetition
  function dedup(arr) {
    const seen = new Set();
    return arr.filter(w => {
      if (seen.has(w.c)) return false;
      seen.add(w.c);
      return true;
    });
  }

  // Ensure verb forms I-X are all represented
  function getVerbsByForm() {
    const byForm = {};
    for (const w of verbForms) {
      const f = getVerbForm(w.m);
      if (!byForm[f]) byForm[f] = [];
      byForm[f].push(w);
    }
    const result = [];
    for (const f of ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']) {
      if (byForm[f] && byForm[f].length > 0) {
        const picked = pick(dedup(byForm[f]), 4);
        result.push(...picked);
      }
    }
    return result;
  }

  function makeExercise(w) {
    counter++;
    const cas = getCase(w.m);
    return {
      id: padId('rvg', counter),
      rasm: w.c,
      location: getRef(w),
      steps: {
        wordType: mapWordType(w.p),
        root: rootWithDashes(w.r),
        form: describeFormForRasm(w),
        syntacticRole: describeSyntacticRole(cas, w.p, w.m),
        vocalization: w.v
      },
      explanation: buildRasmExplanation(w)
    };
  }

  // Pick ~40 from Fatiha + early Baqara
  const group1 = pick(dedup(fatihaEarlyBaqara), 40);
  // Pick ~40 from mid Quran
  const group2 = pick(dedup(midQuran), 40);
  // Pick ~40 from late suras
  const group3 = pick(dedup(lateSuras), 40);
  // Pick ~40 verb forms (all 10 forms)
  const group4 = getVerbsByForm();
  // Pick ~40 diverse (particles, pronouns, adjectives)
  const group5 = pick(dedup(diverse), 40);

  const allPicked = [...group1, ...group2, ...group3, ...group4, ...group5];

  // Deduplicate across groups
  const seen = new Set();
  for (const w of allPicked) {
    const key = w.c + '|' + w.l;
    if (seen.has(key)) continue;
    seen.add(key);
    exercises.push(makeExercise(w));
  }

  console.log('  Generated ' + exercises.length + ' rasm-vocalization exercises');
  return {
    meta: {
      title: 'Rasm-zu-Vokalisation Drill (generiert)',
      description: 'Automatisch generierte Uebungen: Vom reinen Konsonantentext zur grammatisch begruendeten Vokalisation. Quelle: Quranic Arabic Corpus Morphologie-DB.',
      generated: new Date().toISOString().slice(0, 10),
      count: exercises.length
    },
    exercises
  };
}

// ---------------------------------------------------------------------------
// B) case-derivation-generated.json  (~150)
// ---------------------------------------------------------------------------
console.log('[3/9] Generating case-derivation-generated.json...');

function generateCaseDerivation() {
  const exercises = [];

  // Find words with clear case markers
  const nomWords = words.filter(w =>
    w.v && hasCase(w.m) && getCase(w.m) === 'NOM' &&
    (w.p === 'N' || w.p === 'ADJ' || w.p === 'PN') && w.r
  );
  const accWords = words.filter(w =>
    w.v && hasCase(w.m) && getCase(w.m) === 'ACC' &&
    (w.p === 'N' || w.p === 'ADJ' || w.p === 'PN') && w.r
  );
  const genWords = words.filter(w =>
    w.v && hasCase(w.m) && getCase(w.m) === 'GEN' &&
    (w.p === 'N' || w.p === 'ADJ' || w.p === 'PN') && w.r
  );

  // Deduplicate by vocalized form
  function dedupV(arr) {
    const seen = new Set();
    return arr.filter(w => {
      if (seen.has(w.v)) return false;
      seen.add(w.v);
      return true;
    });
  }

  // ---------- Detect case marker from vocalized form ----------
  function detectCaseMarker(w, cas) {
    const v = w.v;
    const m = w.m;
    const num = getNumber(m);

    // Sound masculine plural: -ون (NOM) / -ين (ACC/GEN)
    if (num === 'P' && (getGender(m) === 'M') && (/\u0648\u0646\u064E$/.test(v) || /\u064A\u0646\u064E$/.test(v))) {
      if (cas === 'NOM') return '-\u0648\u0646\u064E (Waw-Nun)';
      return '-\u064A\u0646\u064E (Ya-Nun)';
    }

    // Dual: -ان (NOM) / -ين (ACC/GEN)
    if (num === 'D') {
      if (cas === 'NOM') return '-\u0627\u0646\u0650 (Alif-Nun)';
      return '-\u064A\u0652\u0646\u0650 (Ya-Nun)';
    }

    // Sound feminine plural: always Kasra in ACC and GEN
    if (num === 'P' && (getGender(m) === 'F') && /\u0627\u062A/.test(v)) {
      if (cas === 'NOM') return 'Damma';
      return 'Kasra (Sonderregel: fem. Plural hat Kasra im Akkusativ und Genitiv)';
    }

    // Check for tanwin
    if (/\u064B$/.test(v) || /\u064B/.test(v.slice(-3))) {
      if (cas === 'ACC') return 'Fatha + Tanwin';
      if (cas === 'NOM') return 'Damma + Tanwin';
      if (cas === 'GEN') return 'Kasra + Tanwin';
    }
    if (/\u064C/.test(v.slice(-3))) return 'Damma + Tanwin';
    if (/\u064D/.test(v.slice(-3))) return 'Kasra + Tanwin';

    // Diptotic (no tanwin in GEN, Fatha instead of Kasra)
    // Default markers
    return getCaseMarkerName(cas);
  }

  // ---------- Describe syntactic role with context ----------
  function describeRole(w, cas) {
    const _m = w.m;
    const ref = getRef(w);
    const ayahKey = ref;
    const ayahW = ayahWords[ayahKey] || [];
    const idx = ayahW.findIndex(x => x.l === w.l);

    if (cas === 'NOM') {
      // Check if preceded by a verb -> Fa'il
      if (idx > 0 && ayahW[idx - 1].p === 'V') {
        if (/PASS/.test(ayahW[idx - 1].m)) return { role: "Na'ib al-Fa'il (Stellvertreter-Subjekt)", verb: ayahW[idx - 1] };
        return { role: "Fa'il (Subjekt)", verb: ayahW[idx - 1] };
      }
      // Check if preceded by inna/anna -> Khabar inna
      const innaWord = ayahW.find((x, i) => i < idx && /^\u0625\u0650\u0646\u0651|\u0623\u064E\u0646\u0651|^\u0625\u0646|^\u0623\u0646/.test(x.v || x.c));
      if (innaWord) {
        return { role: 'Khabar inna', trigger: innaWord };
      }
      // Check if preceded by kaana -> Ism kana
      const kanaWord = ayahW.find((x, i) => i < idx && /\u0643\u0627\u0646/.test(x.c) && x.p === 'V');
      if (kanaWord) {
        return { role: 'Ism kana', trigger: kanaWord };
      }
      return { role: 'Mubtada/Khabar' };
    }
    if (cas === 'ACC') {
      // Check if preceded by verb -> Maf'ul bihi
      const verbBefore = ayahW.find((x, i) => i < idx && x.p === 'V' && !/PASS/.test(x.m));
      if (verbBefore) {
        return { role: "Maf'ul bihi (Objekt)", verb: verbBefore };
      }
      // Check for inna
      const innaWordAcc = ayahW.find((x, i) => i < idx && /^\u0625\u0650\u0646\u0651|\u0623\u064E\u0646\u0651|^\u0625\u0646|^\u0623\u0646/.test(x.v || x.c) && isParticle(x.p));
      if (innaWordAcc) {
        return { role: 'Ism inna', trigger: innaWordAcc };
      }
      // Check for kana -> Khabar kana
      const kanaWordAcc = ayahW.find((x, i) => i < idx && /\u0643\u0627\u0646/.test(x.c) && x.p === 'V');
      if (kanaWordAcc) {
        return { role: 'Khabar kana', trigger: kanaWordAcc };
      }
      return { role: "Maf'ul bihi (Akkusativ)" };
    }
    if (cas === 'GEN') {
      // Check if preceded by preposition
      if (idx > 0 && ayahW[idx - 1].p === 'P') {
        return { role: 'Majrur (nach Praeposition)', prep: ayahW[idx - 1] };
      }
      // Check if preceded by noun in construct state (idafa)
      if (idx > 0 && (ayahW[idx - 1].p === 'N' || ayahW[idx - 1].p === 'ADJ' || ayahW[idx - 1].p === 'PN')) {
        return { role: 'Mudaf ilayhi (Idafa)', mudaf: ayahW[idx - 1] };
      }
      return { role: 'Majrur (Genitiv)' };
    }
    return { role: '\u2014' };
  }

  // ---------- Build rich case explanation ----------
  function buildCaseExplanation(w, cas, roleInfo, marker) {
    const parts = [];

    if (cas === 'NOM') {
      if (roleInfo.role.includes("Fa'il") && roleInfo.verb) {
        parts.push("Fa'il (Subjekt) des Verbs " + (roleInfo.verb.v || roleInfo.verb.c));
        parts.push('Steht im Nominativ mit ' + marker);
      } else if (roleInfo.role.includes("Na'ib") && roleInfo.verb) {
        parts.push("Na'ib al-Fa'il (Stellvertreter-Subjekt) des passiven Verbs " + (roleInfo.verb.v || roleInfo.verb.c));
        parts.push("Bei passivem Verb wird das urspruengliche Objekt zum Na'ib al-Fa'il und steht im Nominativ");
        parts.push(marker + ' als Kasuszeichen');
      } else if (roleInfo.role.includes('Khabar inna')) {
        parts.push("Khabar von \u0625\u0650\u0646\u0651\u064E steht im Nominativ");
        parts.push(marker + ' als Kasuszeichen');
      } else if (roleInfo.role.includes('Ism kana')) {
        parts.push("Ism von \u0643\u064E\u0627\u0646\u064E bleibt im Nominativ");
        parts.push(marker);
      } else {
        // Mubtada/Khabar
        parts.push('Mubtada oder Khabar im Nominalsatz');
        parts.push('Nominativ mit ' + marker);
      }
    }

    if (cas === 'ACC') {
      if (roleInfo.role.includes("Maf'ul") && roleInfo.verb) {
        parts.push("Maf'ul bihi (direktes Objekt) von " + (roleInfo.verb.v || roleInfo.verb.c));
        parts.push('Steht im Akkusativ. ' + marker + ' als Kasuszeichen');
      } else if (roleInfo.role.includes('Ism inna')) {
        parts.push("Ism von \u0625\u0650\u0646\u0651\u064E steht im Akkusativ");
        parts.push(marker + ' als Kasuszeichen');
      } else if (roleInfo.role.includes('Khabar kana')) {
        parts.push("Khabar von \u0643\u064E\u0627\u0646\u064E steht im Akkusativ");
        parts.push(marker + ' als Kasuszeichen');
      } else {
        parts.push('Akkusativ (mansub)');
        parts.push(marker + ' als Kasuszeichen');
      }
    }

    if (cas === 'GEN') {
      if (roleInfo.prep) {
        parts.push('Nach der Praeposition ' + (roleInfo.prep.v || roleInfo.prep.c) + ' steht das Nomen im Genitiv');
        parts.push(marker + ' als Kasuszeichen');
      } else if (roleInfo.mudaf) {
        parts.push('Zweites Glied der Idafa ' + (roleInfo.mudaf.v || roleInfo.mudaf.c) + ' + ' + w.v);
        parts.push('Mudaf ilayhi steht im Genitiv. ' + marker);
      } else {
        parts.push('Genitiv (majrur)');
        parts.push(marker + ' als Kasuszeichen');
      }
    }

    return parts.join('. ') + '.';
  }

  function caseMarkerDescription(cas) {
    if (cas === 'NOM') return "Nominativ (Marfu' \u2014 Damma)";
    if (cas === 'ACC') return "Akkusativ (Mansub \u2014 Fatha)";
    if (cas === 'GEN') return "Genitiv (Majrur \u2014 Kasra)";
    return '';
  }

  function makeExercise(w) {
    const cas = getCase(w.m);
    const verse = getVerseText(w) || reconstructVerse(getSurah(w), getAyah(w));
    const roleInfo = describeRole(w, cas);
    const marker = detectCaseMarker(w, cas);
    return {
      verse: verse,
      ref: getRef(w),
      word: w.v,
      role: roleInfo.role,
      expectedCase: caseMarkerDescription(cas),
      explanation: buildCaseExplanation(w, cas, roleInfo, marker)
    };
  }

  // Pick ~50 NOM, ~50 ACC, ~50 GEN
  const nomPicked = pick(dedupV(nomWords), 50);
  const accPicked = pick(dedupV(accWords), 50);
  const genPicked = pick(dedupV(genWords), 50);

  for (const w of nomPicked) exercises.push(makeExercise(w));
  for (const w of accPicked) exercises.push(makeExercise(w));
  for (const w of genPicked) exercises.push(makeExercise(w));

  console.log('  Generated ' + exercises.length + ' case-derivation exercises');
  console.log('    NOM: ' + nomPicked.length + ', ACC: ' + accPicked.length + ', GEN: ' + genPicked.length);

  return {
    meta: {
      title: 'Kasusableitung (generiert) — Syntaktische Funktionen und Kasus',
      description: 'Automatisch generierte Uebungen zur Kasusbestimmung quranischer Woerter anhand ihrer syntaktischen Rolle.',
      totalExercises: exercises.length,
      generated: true,
      sources: [
        {title: "Wright's Arabic Grammar, Vol. II (Syntax)", url: 'https://archive.org/details/grammarofthearab02telerich'},
        {title: 'Quranic Arabic Corpus', url: 'https://corpus.quran.com/'}
      ]
    },
    exercises: exercises
  };
}

// ---------------------------------------------------------------------------
// C) alif-wasla-generated.json  (~60 per category)
// ---------------------------------------------------------------------------
console.log('[4/9] Generating alif-wasla-generated.json...');

function generateAlifWasla() {
  const categories = [];

  // Scan uthmani text for U+0671 (alif wasla)
  const waslaChar = '\u0671';

  // Article exercises: words starting with ٱلْ or ٱل
  const articleExercises = [];
  const verbVIIExercises = [];
  const verbVIIIExercises = [];
  const verbXExercises = [];
  const imperativeExercises = [];
  const nounExercises = [];

  // Scan morphDB for patterns
  for (const w of words) {
    if (!w.v) continue;
    const hasWasla = w.v.includes(waslaChar);
    const ref = getRef(w);
    const verse = verseText[ref] || '';

    if (hasWasla && /^\u0671\u0644\u0652|\u0671\u0644/.test(w.v)) {
      // Article
      articleExercises.push({
        word: w.v,
        context: verse,
        ref: ref,
        consonants: w.c,
        note: 'Definitartikel: Alif Wasla in \u0627\u0644'
      });
    }

    if (w.p === 'V') {
      const form = getVerbForm(w.m);
      if (form === 'VII' && hasWasla) {
        verbVIIExercises.push({
          word: w.v,
          root: rootWithDashes(w.r),
          context: verse,
          ref: ref,
          form: 'VII (\u0627\u0650\u0646\u0652\u0641\u064E\u0639\u064E\u0644\u064E)',
          note: 'Form VII beginnt mit Alif Wasla + Kasra'
        });
      }
      if (form === 'VIII' && hasWasla) {
        verbVIIIExercises.push({
          word: w.v,
          root: rootWithDashes(w.r),
          context: verse,
          ref: ref,
          form: 'VIII (\u0627\u0650\u0641\u0652\u062A\u064E\u0639\u064E\u0644\u064E)',
          note: 'Form VIII beginnt mit Alif Wasla + Kasra'
        });
      }
      if (form === 'X' && hasWasla) {
        verbXExercises.push({
          word: w.v,
          root: rootWithDashes(w.r),
          context: verse,
          ref: ref,
          form: 'X (\u0627\u0650\u0633\u0652\u062A\u064E\u0641\u0652\u0639\u064E\u0644\u064E)',
          note: 'Form X beginnt mit Alif Wasla + Kasra'
        });
      }
      // Imperative Form I with wasla
      if (getTense(w.m) === 'IMPV' && form === 'I' && hasWasla) {
        imperativeExercises.push({
          word: w.v,
          root: rootWithDashes(w.r),
          context: verse,
          ref: ref,
          form: 'Imperativ Form I',
          note: 'Imperativ mit Konsonantencluster am Anfang erhaelt Alif Wasla'
        });
      }
    }

    // Nouns with wasla (اسم, ابن, امرأة, اثنان, etc.)
    if ((w.p === 'N' || w.p === 'PN') && hasWasla && !/^\u0671\u0644\u0652|\u0671\u0644/.test(w.v)) {
      nounExercises.push({
        word: w.v,
        root: rootWithDashes(w.r),
        context: verse,
        ref: ref,
        note: 'Nomen mit Alif Wasla'
      });
    }
  }

  // Also scan verse texts directly for ٱ occurrences (for completeness)
  const directWaslaExercises = [];
  for (const [ref, text] of Object.entries(verseText)) {
    if (!text.includes(waslaChar)) continue;
    const wordsInText = text.split(/\s+/);
    for (const word of wordsInText) {
      if (word.includes(waslaChar) && !word.startsWith(waslaChar)) {
        directWaslaExercises.push({
          word: word,
          context: text,
          ref: ref,
          note: 'Alif Wasla in Verbindung (nicht am Wortanfang)'
        });
      }
    }
  }

  // Deduplicate by word form
  function dedupByWord(arr) {
    const seen = new Set();
    return arr.filter(e => {
      if (seen.has(e.word)) return false;
      seen.add(e.word);
      return true;
    });
  }

  categories.push({
    id: 'article',
    title: 'Definitartikel \u0627\u0644',
    explanation: 'Der haeufigste Fall von Alif Wasla. Die Hamza des Artikels wird nur am absoluten Satzanfang gesprochen.',
    exercises: pick(dedupByWord(articleExercises), 60)
  });

  categories.push({
    id: 'form_vii',
    title: 'Form VII (\u0627\u0650\u0646\u0652\u0641\u064E\u0639\u064E\u0644\u064E)',
    explanation: 'Alle Form-VII-Verben beginnen mit Alif Wasla + Kasra.',
    exercises: pick(dedupByWord(verbVIIExercises), 60)
  });

  categories.push({
    id: 'form_viii',
    title: 'Form VIII (\u0627\u0650\u0641\u0652\u062A\u064E\u0639\u064E\u0644\u064E)',
    explanation: 'Alle Form-VIII-Verben beginnen mit Alif Wasla + Kasra.',
    exercises: pick(dedupByWord(verbVIIIExercises), 60)
  });

  categories.push({
    id: 'form_x',
    title: 'Form X (\u0627\u0650\u0633\u0652\u062A\u064E\u0641\u0652\u0639\u064E\u0644\u064E)',
    explanation: 'Alle Form-X-Verben beginnen mit Alif Wasla + Kasra.',
    exercises: pick(dedupByWord(verbXExercises), 60)
  });

  categories.push({
    id: 'imperative',
    title: 'Imperative der Form I',
    explanation: 'Imperative, die mit einem Konsonantencluster beginnen, erhalten Alif Wasla. Der Hilfsvokal ist Damma wenn der Imperfekt-Stammvokal Damma ist, sonst Kasra.',
    exercises: pick(dedupByWord(imperativeExercises), 60)
  });

  categories.push({
    id: 'nouns',
    title: 'Nomen mit Wasla',
    explanation: 'Einige haeufige Nomen beginnen mit Alif Wasla: \u0627\u0633\u0645\u060C \u0627\u0628\u0646\u060C \u0627\u0628\u0646\u0629\u060C \u0627\u0645\u0631\u0623\u0629\u060C \u0627\u062B\u0646\u0627\u0646\u060C \u0627\u062B\u0646\u062A\u0627\u0646.',
    exercises: pick(dedupByWord(nounExercises), 60)
  });

  const totalEx = categories.reduce((sum, c) => sum + c.exercises.length, 0);
  console.log('  Generated ' + totalEx + ' alif-wasla exercises across ' + categories.length + ' categories');
  for (const c of categories) {
    console.log('    ' + c.id + ': ' + c.exercises.length);
  }

  return {
    meta: {
      title: 'Alif Wasla Drill (generiert)',
      description: 'Automatisch generierte Uebungen zu Hamzat al-Wasl. Quelle: Uthmani-Text und Morphologie-DB.',
      generated: new Date().toISOString().slice(0, 10),
      totalExercises: totalEx
    },
    categories
  };
}

// ---------------------------------------------------------------------------
// D) weak-root-generated.json  (~60)
// ---------------------------------------------------------------------------
console.log('[5/9] Generating weak-root-generated.json...');

function generateWeakRoot() {
  const exercises = [];

  // Find verbs with weak roots
  const verbsWithRoot = words.filter(w => w.p === 'V' && w.r && w.v);

  function classifyWeakRoot(root) {
    const radicals = root.split(' ');
    if (radicals.length < 3) return null;

    const first = radicals[0];
    const middle = radicals[1];
    const last = radicals[radicals.length - 1];

    const types = [];
    if (first === '\u0648' || first === '\u064A') types.push('assimilated');
    if (middle === '\u0648' || middle === '\u064A') types.push('hollow');
    if (last === '\u0648' || last === '\u064A') types.push('defective');

    return types.length > 0 ? types : null;
  }

  function getWeakLetter(root, type) {
    const radicals = root.split(' ');
    if (type === 'assimilated') return radicals[0];
    if (type === 'hollow') return radicals[1];
    if (type === 'defective') return radicals[radicals.length - 1];
    return null;
  }

  function describeWeakType(type) {
    const map = {
      assimilated: 'Assimiliert (erster Radikal schwach \u2014 mithal)',
      hollow: 'Hohl (mittlerer Radikal schwach \u2014 ajwaf)',
      defective: 'Defektiv (letzter Radikal schwach \u2014 naqis)'
    };
    return map[type] || type;
  }

  function describeTransformation(w, weakType, weakLetter) {
    const tense = getTense(w.m);
    const form = getVerbForm(w.m);
    const voice = getVoice(w.m);
    const parts = [];

    if (weakType === 'hollow') {
      if (tense === 'PERF') parts.push('Schwacher Radikal ' + weakLetter + ' wird zu langem Alif');
      if (tense === 'IMPF') parts.push('Schwacher Radikal ' + weakLetter + ' erscheint als langer Vokal');
      if (tense === 'IMPV') parts.push('Schwacher Radikal kann wegfallen');
      if (voice === 'PASS' && tense === 'PERF') parts.push(weakLetter + ' wird zu Ya im passiven Perfekt');
    }
    if (weakType === 'defective') {
      if (tense === 'PERF') parts.push('Schwacher Radikal ' + weakLetter + ' wird zu Alif oder faellt weg');
      if (tense === 'IMPF') parts.push('Schwacher Radikal ' + weakLetter + ' bleibt als langer Vokal oder faellt weg');
      if (tense === 'IMPV') parts.push('Schwacher Radikal faellt am Wortende weg');
    }
    if (weakType === 'assimilated') {
      if (tense === 'IMPF' && form === 'I') parts.push('Erster Radikal ' + weakLetter + ' faellt im Imperfekt weg');
      if (form === 'VIII') parts.push('Erster Radikal assimiliert mit dem ta der Form VIII');
    }

    if (form !== 'I') parts.push('Form ' + form);
    if (parts.length === 0) parts.push('Schwacher Radikal ' + weakLetter + ' transformiert in dieser Form');

    return parts.join('. ') + '.';
  }

  // Group verbs by root and weak type
  const rootTypeMap = {};
  for (const w of verbsWithRoot) {
    const types = classifyWeakRoot(w.r);
    if (!types) continue;
    for (const type of types) {
      const key = w.r + '|' + type;
      if (!rootTypeMap[key]) rootTypeMap[key] = { root: w.r, type, words: [] };
      rootTypeMap[key].words.push(w);
    }
  }

  // For each root+type, pick representative words showing different tenses/forms
  let counter = 0;
  const entries = Object.values(rootTypeMap);
  const shuffledEntries = shuffle(entries);

  for (const entry of shuffledEntries) {
    if (counter >= 65) break;
    const { root, type: weakType } = entry;
    const weakLetter = getWeakLetter(root, weakType);

    // Get distinct tense/form combinations
    const seen = new Set();
    const representative = [];
    for (const w of shuffle(entry.words)) {
      const tense = getTense(w.m) || 'other';
      const form = getVerbForm(w.m);
      const voice = getVoice(w.m) || 'ACT';
      const key = tense + '|' + form + '|' + voice;
      if (seen.has(key)) continue;
      seen.add(key);
      representative.push(w);
      if (representative.length >= 3) break;
    }

    if (representative.length === 0) continue;

    // Pick one main word for the exercise
    const mainWord = representative[0];
    counter++;

    const forms = representative.map(w => ({
      tense: getTense(w.m) ? getTenseGerman(getTense(w.m)) : ((/ACT\|PCPL/.test(w.m)) ? 'Aktivpartizip' : (/PASS\|PCPL/.test(w.m)) ? 'Passivpartizip' : 'Sonstiges'),
      form: 'Form ' + getVerbForm(w.m),
      vocalized: w.v,
      location: getRef(w)
    }));

    exercises.push({
      id: padId('wr', counter),
      root: rootWithDashes(root),
      weakType: describeWeakType(weakType),
      weakLetter: weakLetter,
      classification: weakType,
      mainWord: mainWord.v,
      mainLocation: getRef(mainWord),
      forms: forms,
      transformation: describeTransformation(mainWord, weakType, weakLetter),
      context: getVerseText(mainWord) || reconstructVerse(getSurah(mainWord), getAyah(mainWord))
    });
  }

  console.log('  Generated ' + exercises.length + ' weak-root exercises');

  return {
    meta: {
      title: 'Schwache-Wurzel-Transformations-Drill (generiert)',
      description: 'Automatisch generierte Uebungen zu schwachen Wurzeln: Wie \u0648 und \u064A in verschiedenen Formen transformiert werden.',
      generated: new Date().toISOString().slice(0, 10),
      count: exercises.length
    },
    exercises
  };
}

// ---------------------------------------------------------------------------
// E) broken-plural-generated.json  (~80)
// ---------------------------------------------------------------------------
console.log('[6/9] Generating broken-plural-generated.json...');

function generateBrokenPlural() {
  const exercises = [];

  // Find plural nouns from morphDB
  const _pluralNouns = words.filter(w =>
    w.v && w.r && (w.p === 'N' || w.p === 'ADJ') &&
    (/\bMP\b/.test(w.m) || /\bFP\b/.test(w.m) || /\bPL\b/.test(w.m))
  );

  // Group by root to find singular-plural pairs
  const rootPluralMap = {};
  const rootSingularMap = {};

  for (const w of words) {
    if (!w.r || !w.v) continue;
    if (w.p !== 'N' && w.p !== 'ADJ') continue;

    const isPlural = /\bMP\b/.test(w.m) || /\bFP\b/.test(w.m) || /\bPL\b/.test(w.m);
    const isSingular = /\bMS\b/.test(w.m) || /\bFS\b/.test(w.m);

    if (isPlural) {
      if (!rootPluralMap[w.r]) rootPluralMap[w.r] = new Set();
      rootPluralMap[w.r].add(w.v);
    }
    if (isSingular) {
      if (!rootSingularMap[w.r]) rootSingularMap[w.r] = new Set();
      rootSingularMap[w.r].add(w.v);
    }
  }

  // Identify broken plurals (not sound masculine -ون/-ين or sound feminine -ات)
  function isSoundMascPlural(v) {
    return /\u0648\u0646\u064E$|\u064A\u0646\u064E$|\u0648\u0646$|\u064A\u0646$/.test(v);
  }

  function isSoundFemPlural(v) {
    return /\u0627\u062A\u064D|\u0627\u062A\u0650|\u0627\u062A\u064F|\u0627\u062A$/.test(v);
  }

  // Known broken plural patterns
  const brokenPatterns = [
    { pattern: '\u0623\u064E\u0641\u0652\u0639\u064F\u0644', regex: /^\u0623/, id: 'af3ul' },
    { pattern: '\u0641\u064F\u0639\u064F\u0648\u0644', regex: /\u064F\u0648/, id: 'fu3uul' },
    { pattern: '\u0641\u064F\u0639\u064E\u0644', regex: /^.\u064F.\u064E/, id: 'fu3al' },
    { pattern: '\u0641\u0650\u0639\u064E\u0627\u0644', regex: /\u0650.\u064E\u0627/, id: 'fi3aal' },
    { pattern: '\u0623\u064E\u0641\u0652\u0639\u064E\u0627\u0644', regex: /^\u0623/, id: 'af3aal' },
    { pattern: '\u0641\u064E\u0648\u064E\u0627\u0639\u0650\u0644', regex: /\u064E\u0648\u064E\u0627/, id: 'fawaa3il' },
    { pattern: '\u0645\u064E\u0641\u064E\u0627\u0639\u0650\u0644', regex: /^\u0645\u064E.\u064E\u0627/, id: 'mafaa3il' },
    { pattern: '\u0641\u064E\u0639\u064E\u0627\u0626\u0650\u0644', regex: /\u064E\u0627\u0626\u0650/, id: 'fa3aa2il' },
    { pattern: '\u0641\u064F\u0639\u064E\u0644\u064E\u0627\u0621', regex: /\u064F.\u064E\u0644\u064E\u0627\u0621/, id: 'fu3alaa2' },
  ];

  function detectPattern(v) {
    for (const p of brokenPatterns) {
      if (p.regex.test(v)) return p.pattern;
    }
    return 'gebrochener Plural';
  }

  let counter = 0;
  const seenRoots = new Set();

  // Find roots that have both singular and plural forms
  const rootsWithBoth = Object.keys(rootPluralMap).filter(r => rootSingularMap[r]);
  const shuffledRoots = shuffle(rootsWithBoth);

  for (const root of shuffledRoots) {
    if (counter >= 85) break;
    if (seenRoots.has(root)) continue;

    const plurals = [...rootPluralMap[root]];
    const singulars = [...rootSingularMap[root]];

    for (const plural of plurals) {
      if (counter >= 85) break;
      // Skip sound plurals — we want broken plurals
      if (isSoundMascPlural(plural) || isSoundFemPlural(plural)) continue;

      // Skip if it looks like a participle or masdar (not a typical broken plural)
      if (/^\u0645\u064F/.test(plural) && singulars.some(s => /^\u0645\u064F/.test(s))) continue;

      const singular = singulars[0];
      const pattern = detectPattern(plural);

      // Find a Quran location for this plural
      const pluralWord = words.find(w => w.v === plural && w.r === root);
      const singularWord = words.find(w => w.v === singular && w.r === root);
      if (!pluralWord) continue;

      seenRoots.add(root);
      counter++;

      exercises.push({
        id: padId('bp', counter),
        root: rootWithDashes(root),
        singular: singular,
        plural: plural,
        pattern: pattern,
        singularLocation: singularWord ? getRef(singularWord) : null,
        pluralLocation: getRef(pluralWord),
        context: getVerseText(pluralWord) || ''
      });
      break; // one per root
    }
  }

  console.log('  Generated ' + exercises.length + ' broken-plural exercises');

  return {
    meta: {
      title: 'Gebrochene Plurale \u2014 Uebungsdaten (generiert)',
      description: 'Automatisch generierte Uebungen zu gebrochenen Pluralmustern des koranischen Arabisch.',
      generated: new Date().toISOString().slice(0, 10),
      count: exercises.length
    },
    exercises
  };
}

// ---------------------------------------------------------------------------
// F) pattern-recognition-generated.json  (~100)
// ---------------------------------------------------------------------------
console.log('[7/9] Generating pattern-recognition-generated.json...');

function generatePatternRecognition() {
  const exercises = [];
  let counter = 0;

  // Identifiable patterns from morphology tags
  const patternGroups = {
    'ACT_PCPL_I': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'I',
      pattern: '\u0641\u064E\u0627\u0639\u0650\u0644',
      name: 'Aktivpartizip Form I',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0641\u064E\u0627\u0639\u0650\u0644 \u2014 Aktives Partizip der Grundform. Beschreibt den Handelnden oder einen Zustand. Von Wurzel ' + root + '.';
      }
    },
    'PASS_PCPL_I': {
      filter: w => /PASS\|PCPL/.test(w.m) && getVerbForm(w.m) === 'I',
      pattern: '\u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644',
      name: 'Passivpartizip Form I',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644 \u2014 Passives Partizip der Grundform. Beschreibt das von der Handlung Betroffene. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_II': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'II',
      pattern: '\u0645\u064F\u0641\u064E\u0639\u0651\u0650\u0644',
      name: 'Aktivpartizip Form II',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u064E\u0639\u0651\u0650\u0644 \u2014 Aktives Partizip Form II. Praefix \u0645\u064F- und Verdopplung des zweiten Radikals kennzeichnen Form II. Von Wurzel ' + root + '.';
      }
    },
    'PASS_PCPL_II': {
      filter: w => /PASS\|PCPL/.test(w.m) && getVerbForm(w.m) === 'II',
      pattern: '\u0645\u064F\u0641\u064E\u0639\u0651\u064E\u0644',
      name: 'Passivpartizip Form II',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u064E\u0639\u0651\u064E\u0644 \u2014 Passives Partizip Form II. Fatha statt Kasra auf dem vorletzten Radikal unterscheidet es vom Aktivpartizip. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_III': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'III',
      pattern: '\u0645\u064F\u0641\u064E\u0627\u0639\u0650\u0644',
      name: 'Aktivpartizip Form III',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u064E\u0627\u0639\u0650\u0644 \u2014 Aktives Partizip Form III. Alif zwischen erstem und zweitem Radikal ist typisch fuer Form III. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_IV': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'IV',
      pattern: '\u0645\u064F\u0641\u0652\u0639\u0650\u0644',
      name: 'Aktivpartizip Form IV',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u0652\u0639\u0650\u0644 \u2014 Aktives Partizip Form IV. Praefix \u0645\u064F- mit Sukun auf dem ersten Radikal kennzeichnet Form IV. Von Wurzel ' + root + '.';
      }
    },
    'PASS_PCPL_IV': {
      filter: w => /PASS\|PCPL/.test(w.m) && getVerbForm(w.m) === 'IV',
      pattern: '\u0645\u064F\u0641\u0652\u0639\u064E\u0644',
      name: 'Passivpartizip Form IV',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u0652\u0639\u064E\u0644 \u2014 Passives Partizip Form IV. Wie Aktivpartizip, aber Fatha statt Kasra auf dem zweiten Radikal. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_V': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'V',
      pattern: '\u0645\u064F\u062A\u064E\u0641\u064E\u0639\u0651\u0650\u0644',
      name: 'Aktivpartizip Form V',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u062A\u064E\u0641\u064E\u0639\u0651\u0650\u0644 \u2014 Aktives Partizip Form V. Praefix \u0645\u064F\u062A\u064E- und Verdopplung des zweiten Radikals. Reflexiv zu Form II. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_VIII': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'VIII',
      pattern: '\u0645\u064F\u0641\u0652\u062A\u064E\u0639\u0650\u0644',
      name: 'Aktivpartizip Form VIII',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0641\u0652\u062A\u064E\u0639\u0650\u0644 \u2014 Aktives Partizip Form VIII. Einschub von \u062A nach dem ersten Radikal ist typisch fuer Form VIII. Von Wurzel ' + root + '.';
      }
    },
    'ACT_PCPL_X': {
      filter: w => /ACT\|PCPL/.test(w.m) && getVerbForm(w.m) === 'X',
      pattern: '\u0645\u064F\u0633\u0652\u062A\u064E\u0641\u0652\u0639\u0650\u0644',
      name: 'Aktivpartizip Form X',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0645\u064F\u0633\u0652\u062A\u064E\u0641\u0652\u0639\u0650\u0644 \u2014 Aktives Partizip Form X. Praefix \u0645\u064F\u0633\u0652\u062A\u064E- kennzeichnet die Verlangen/Erachten-Form. Von Wurzel ' + root + '.';
      }
    },
    'VN_I': {
      filter: w => /VN/.test(w.m) && getVerbForm(w.m) === 'I' && w.p === 'N',
      pattern: 'Masdar Form I',
      name: 'Verbalsubstantiv Form I',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Masdar (Verbalsubstantiv) der Grundform von Wurzel ' + root + '. Das Muster des Masdar der Form I ist nicht vorhersagbar und muss fuer jedes Verb gelernt werden (\u0641\u064E\u0639\u0652\u0644, \u0641\u0650\u0639\u0652\u0644, \u0641\u064F\u0639\u064F\u0648\u0644 u.a.).';
      }
    },
    'VN_II': {
      filter: w => /VN/.test(w.m) && getVerbForm(w.m) === 'II',
      pattern: '\u062A\u064E\u0641\u0652\u0639\u0650\u064A\u0644',
      name: 'Masdar Form II',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u062A\u064E\u0641\u0652\u0639\u0650\u064A\u0644 \u2014 Masdar der Form II von Wurzel ' + root + '. Regelhaft gebildet durch Praefix \u062A\u064E- und Suffix -\u0650\u064A\u0644.';
      }
    },
    'VN_III': {
      filter: w => /VN/.test(w.m) && getVerbForm(w.m) === 'III',
      pattern: '\u0645\u064F\u0641\u064E\u0627\u0639\u064E\u0644\u064E\u0629 / \u0641\u0650\u0639\u064E\u0627\u0644',
      name: 'Masdar Form III',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Masdar der Form III von Wurzel ' + root + '. Zwei haeufige Muster: \u0645\u064F\u0641\u064E\u0627\u0639\u064E\u0644\u064E\u0629 oder \u0641\u0650\u0639\u064E\u0627\u0644.';
      }
    },
    'VN_IV': {
      filter: w => /VN/.test(w.m) && getVerbForm(w.m) === 'IV',
      pattern: '\u0625\u0650\u0641\u0652\u0639\u064E\u0627\u0644',
      name: 'Masdar Form IV',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Muster \u0625\u0650\u0641\u0652\u0639\u064E\u0627\u0644 \u2014 Masdar der Form IV von Wurzel ' + root + '. Regelhaft mit Hamza-Praefix und langem Alif vor dem letzten Radikal.';
      }
    },
    'PERF_I': {
      filter: w => /PERF/.test(w.m) && getVerbForm(w.m) === 'I' && w.p === 'V',
      pattern: '\u0641\u064E\u0639\u064E\u0644\u064E',
      name: 'Perfekt Form I',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        const voice = getVoice(w.m);
        if (voice === 'PASS') {
          return 'Perfekt der Grundform im Passiv von Wurzel ' + root + '. Muster \u0641\u064F\u0639\u0650\u0644\u064E: Damma auf dem ersten, Kasra auf dem zweiten Radikal kennzeichnet das Passiv.';
        }
        return 'Perfekt der Grundform (Form I) von Wurzel ' + root + '. Muster \u0641\u064E\u0639\u064E\u0644\u064E \u2014 die einfachste Verbform, Basis aller Ableitungen.';
      }
    },
    'IMPF_I': {
      filter: w => /IMPF/.test(w.m) && getVerbForm(w.m) === 'I' && w.p === 'V',
      pattern: '\u064A\u064E\u0641\u0652\u0639\u064E\u0644\u064F / \u064A\u064E\u0641\u0652\u0639\u0650\u0644\u064F / \u064A\u064E\u0641\u0652\u0639\u064F\u0644\u064F',
      name: 'Imperfekt Form I',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        const pn = getPerson(w.m);
        const mood = getMood(w.m);
        let desc = 'Imperfekt der Grundform von Wurzel ' + root + '.';
        if (pn) desc += ' ' + describePersonFull(pn) + '.';
        desc += ' Das Personenpraefix zeigt Person und Numerus an, der Stammvokal variiert je nach Verb.';
        if (mood) desc += ' ' + getMoodGerman(mood) + ': Endung ' + getMoodEnding(mood) + '.';
        return desc;
      }
    },
    'PERF_II': {
      filter: w => /PERF/.test(w.m) && getVerbForm(w.m) === 'II' && w.p === 'V',
      pattern: '\u0641\u064E\u0639\u064E\u0651\u0644\u064E',
      name: 'Perfekt Form II',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Perfekt der Form II von Wurzel ' + root + '. Muster \u0641\u064E\u0639\u064E\u0651\u0644\u064E \u2014 Verdopplung (Schadda) des mittleren Radikals. Bedeutung: Intensivierung, Kausativ oder Denominativ.';
      }
    },
    'PERF_IV': {
      filter: w => /PERF/.test(w.m) && getVerbForm(w.m) === 'IV' && w.p === 'V',
      pattern: '\u0623\u064E\u0641\u0652\u0639\u064E\u0644\u064E',
      name: 'Perfekt Form IV',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        return 'Perfekt der Form IV von Wurzel ' + root + '. Muster \u0623\u064E\u0641\u0652\u0639\u064E\u0644\u064E \u2014 Hamza-Praefix als Kausativzeichen. Sukun auf dem ersten Radikal.';
      }
    },
    'PASS_VERB': {
      filter: w => /PASS/.test(w.m) && !/PCPL/.test(w.m) && w.p === 'V',
      pattern: 'Passiv (\u0641\u064F\u0639\u0650\u0644\u064E / \u064A\u064F\u0641\u0652\u0639\u064E\u0644\u064F)',
      name: 'Passivform',
      buildDescription: (w) => {
        const root = rootWithDashes(w.r);
        const tense = getTense(w.m);
        const form = getVerbForm(w.m);
        let desc = 'Passiv';
        if (form !== 'I') desc += ' der Form ' + form;
        desc += ' von Wurzel ' + root + '.';
        if (tense === 'PERF') {
          desc += ' Im Perfekt: Damma auf dem ersten, Kasra auf dem vorletzten Radikal (innerer Vokalwechsel).';
        } else if (tense === 'IMPF') {
          desc += ' Im Imperfekt: Damma auf dem Praefix, Fatha auf dem vorletzten Radikal.';
        }
        return desc;
      }
    }
  };

  const usable = words.filter(w => w.v && w.r && w.p !== 'INL');

  for (const [groupId, group] of Object.entries(patternGroups)) {
    const matching = usable.filter(group.filter);
    // Deduplicate by vocalized form
    const seen = new Set();
    const deduped = matching.filter(w => {
      if (seen.has(w.v)) return false;
      seen.add(w.v);
      return true;
    });

    const picked = pick(deduped, 5);
    for (const w of picked) {
      counter++;
      exercises.push({
        id: padId('pr', counter),
        word: w.v,
        consonants: w.c,
        root: rootWithDashes(w.r),
        location: getRef(w),
        patternId: groupId,
        pattern: group.pattern,
        patternName: group.name,
        description: group.buildDescription(w),
        morphology: w.m,
        pos: w.p
      });
    }
  }

  // Shuffle final result
  const shuffled = shuffle(exercises);
  // Re-assign IDs after shuffle
  for (let i = 0; i < shuffled.length; i++) {
    shuffled[i].id = padId('pr', i + 1);
  }

  console.log('  Generated ' + shuffled.length + ' pattern-recognition exercises');

  return {
    meta: {
      title: 'Morphologische Mustererkennung (generiert)',
      description: 'Automatisch generierte Uebungen zur Erkennung arabischer Wortmuster (Aktivpartizip, Passivpartizip, Masdar, Verbformen).',
      generated: new Date().toISOString().slice(0, 10),
      count: shuffled.length
    },
    exercises: shuffled
  };
}

// ---------------------------------------------------------------------------
// G) root-extraction-generated.json  (~80)
// ---------------------------------------------------------------------------
console.log('[8/9] Generating root-extraction-generated.json...');

function generateRootExtraction() {
  const exercises = [];
  let counter = 0;

  // Find words with prefixes and suffixes that make root extraction interesting
  const usable = words.filter(w =>
    w.v && w.r && w.c && w.p !== 'INL' && w.r.split(' ').length >= 3
  );

  // Detect prefixes in the consonantal form
  function detectPrefixes(c, v) {
    const prefixes = [];
    if (/^\u0627\u0644/.test(c) || /^\u0671\u0644\u0652|\u0671\u0644/.test(v)) prefixes.push('\u0627\u0644');
    else if (/^\u0628/.test(c) && /^\u0628\u0650/.test(v)) prefixes.push('\u0628\u0650');
    else if (/^\u0644/.test(c) && /^\u0644\u0650/.test(v)) prefixes.push('\u0644\u0650');
    else if (/^\u0648/.test(c) && /^\u0648\u064E/.test(v)) prefixes.push('\u0648\u064E');
    else if (/^\u0641/.test(c) && /^\u0641\u064E/.test(v)) prefixes.push('\u0641\u064E');
    // Verbal prefixes
    if (/^\u064A/.test(c) && /^\u064A\u064E|\u064A\u064F/.test(v) && !prefixes.length) prefixes.push('\u064A\u064E (Imperfekt 3m)');
    if (/^\u062A/.test(c) && /^\u062A\u064E|\u062A\u064F/.test(v) && !prefixes.length) prefixes.push('\u062A\u064E (Imperfekt 2/3f)');
    if (/^\u0646/.test(c) && /^\u0646\u064E|\u0646\u064F/.test(v) && !prefixes.length) prefixes.push('\u0646\u064E (Imperfekt 1p)');
    if (/^\u0623/.test(c) && /^\u0623\u064E|\u0623\u064F/.test(v) && !prefixes.length) prefixes.push('\u0623\u064E (Imperfekt 1s / Form IV)');
    // Compound prefixes
    if (/^\u0628\u0627\u0644/.test(c)) prefixes.push('\u0628\u0650 + \u0627\u0644');
    if (/^\u0648\u0627\u0644/.test(c) && prefixes.length === 0) prefixes.push('\u0648\u064E + \u0627\u0644');
    if (/^\u0641\u0627\u0644/.test(c) && prefixes.length === 0) prefixes.push('\u0641\u064E + \u0627\u0644');
    if (/^\u0644\u0644/.test(c)) prefixes.push('\u0644\u0650 + \u0627\u0644');

    return prefixes.length > 0 ? prefixes : null;
  }

  // Detect suffixes
  function detectSuffixes(c, v) {
    const suffixes = [];
    if (/\u0648\u0646$/.test(c) || /\u0648\u0646\u064E$/.test(v)) suffixes.push('\u0648\u0646 (mask. Pl. NOM)');
    else if (/\u064A\u0646$/.test(c) || /\u064A\u0646\u064E$/.test(v)) suffixes.push('\u064A\u0646 (mask. Pl. ACC/GEN)');
    else if (/\u0627\u062A$/.test(c) || /\u0627\u062A\u064D$|\u0627\u062A\u0650$|\u0627\u062A\u064F$/.test(v)) suffixes.push('\u0627\u062A (fem. Pl.)');
    else if (/\u0647\u0645$/.test(c) || /\u0647\u0650\u0645\u0652$|\u0647\u064F\u0645\u0652$/.test(v)) suffixes.push('\u0647\u0645 (Possessivsuffix 3mp)');
    else if (/\u0643\u0645$/.test(c) || /\u0643\u064F\u0645\u0652$|\u0643\u064F\u0645\u064F$/.test(v)) suffixes.push('\u0643\u0645 (Possessivsuffix 2mp)');
    else if (/\u0646\u0627$/.test(c) || /\u0646\u064E\u0627$/.test(v)) suffixes.push('\u0646\u0627 (Suffix 1p)');
    else if (/\u0647\u0627$/.test(c) || /\u0647\u064E\u0627$/.test(v)) suffixes.push('\u0647\u0627 (Suffix 3fs)');
    else if (/\u0647\u0646$/.test(c) || /\u0647\u064F\u0646\u0651\u064E$/.test(v)) suffixes.push('\u0647\u0646 (Suffix 3fp)');
    else if (/\u062A\u0645$/.test(c) || /\u062A\u064F\u0645\u0652$/.test(v)) suffixes.push('\u062A\u0645 (Perfekt 2mp)');
    else if (/\u0648\u0627$/.test(c) || /\u0648\u0627$/.test(v)) suffixes.push('\u0648\u0627 (Perfekt 3mp)');
    else if (/\u0629$/.test(c) || /\u0629\u064C$|\u0629\u064B$|\u0629\u064D$|\u0629\u0650$|\u0629\u064F$|\u0629\u064E$/.test(v)) suffixes.push('\u0629 (Ta Marbuta)');

    return suffixes.length > 0 ? suffixes : null;
  }

  // Build a rich, step-by-step root extraction explanation
  function buildRootExplanation(w, prefixes, suffixes, radicals) {
    const parts = [];
    const root = rootWithDashes(w.r);

    // Step 1: describe what to remove
    if (prefixes && prefixes.length > 0) {
      for (const pref of prefixes) {
        if (pref === '\u0627\u0644') {
          parts.push('\u0627\u0644 ist der Definitartikel (entfernen)');
        } else if (pref.startsWith('\u0628\u0650')) {
          if (pref.includes('+')) {
            parts.push('\u0628\u0650 ist eine Praeposition und \u0627\u0644 der Definitartikel (beide entfernen)');
          } else {
            parts.push('\u0628\u0650 ist eine Praeposition (entfernen)');
          }
        } else if (pref.startsWith('\u0644\u0650')) {
          if (pref.includes('+')) {
            parts.push('\u0644\u0650 ist eine Praeposition und \u0627\u0644 der Definitartikel (beide entfernen)');
          } else {
            parts.push('\u0644\u0650 ist eine Praeposition (entfernen)');
          }
        } else if (pref.startsWith('\u0648\u064E')) {
          if (pref.includes('+')) {
            parts.push('\u0648\u064E ist die Konjunktion und \u0627\u0644 der Definitartikel (beide entfernen)');
          } else {
            parts.push('\u0648\u064E ist eine Konjunktion (entfernen)');
          }
        } else if (pref.startsWith('\u0641\u064E')) {
          if (pref.includes('+')) {
            parts.push('\u0641\u064E ist eine Konjunktion und \u0627\u0644 der Definitartikel (beide entfernen)');
          } else {
            parts.push('\u0641\u064E ist eine Konjunktion (entfernen)');
          }
        } else if (pref.includes('Imperfekt')) {
          parts.push(pref.charAt(0) + ' ist das Imperfekt-Praefix (zeigt Person an, gehoert nicht zur Wurzel)');
        } else if (pref.includes('Form IV')) {
          parts.push('\u0623\u064E ist das Imperfekt-Praefix oder das Form-IV-Praefix (entfernen)');
        }
      }
    }

    if (suffixes && suffixes.length > 0) {
      for (const suff of suffixes) {
        if (suff.includes('mask. Pl.')) {
          parts.push('Endung ' + suff.split(' ')[0] + ' ist das Pluralsuffix (gesunder mask. Plural, entfernen)');
        } else if (suff.includes('fem. Pl.')) {
          parts.push('Endung \u0627\u062A ist das feminine Pluralsuffix (entfernen)');
        } else if (suff.includes('Possessivsuffix') || suff.includes('Suffix')) {
          parts.push('Endung ' + suff.split(' ')[0] + ' ist ein Pronominalsuffix (entfernen)');
        } else if (suff.includes('Perfekt')) {
          parts.push('Endung ' + suff.split(' ')[0] + ' ist die Personalendung des Perfekts (entfernen)');
        } else if (suff.includes('Ta Marbuta')) {
          parts.push('\u0629 (Ta Marbuta) ist ein Femininzeichen (entfernen)');
        }
      }
    }

    // Step 2: identify root
    if (radicals.length === 3) {
      parts.push('Die drei Wurzelkonsonanten ' + root + ' bleiben');
    } else if (radicals.length === 4) {
      parts.push('Vierradikalige Wurzel: ' + root);
    } else {
      parts.push('Wurzel: ' + root);
    }

    // Step 3: mention pattern if identifiable
    if (/ACT\|PCPL/.test(w.m)) {
      const formNum = getVerbForm(w.m);
      if (formNum === 'I') parts.push('Muster: \u0641\u064E\u0627\u0639\u0650\u0644 (Aktivpartizip Form I)');
      else parts.push('Aktivpartizip Form ' + formNum);
    } else if (/PASS\|PCPL/.test(w.m)) {
      const formNum = getVerbForm(w.m);
      if (formNum === 'I') parts.push('Muster: \u0645\u064E\u0641\u0652\u0639\u064F\u0648\u0644 (Passivpartizip Form I)');
      else parts.push('Passivpartizip Form ' + formNum);
    } else if (/VN/.test(w.m)) {
      parts.push('Verbalsubstantiv (Masdar)');
    } else if (w.p === 'V') {
      const form = getVerbForm(w.m);
      const tense = getTense(w.m);
      if (tense) parts.push(getTenseGerman(tense) + ' Form ' + form);
    }

    return parts.join('. ') + '.';
  }

  // Select words that have either prefix or suffix (or both) for interesting extraction
  const candidates = usable.filter(w => {
    const pref = detectPrefixes(w.c, w.v);
    const suff = detectSuffixes(w.c, w.v);
    return pref || suff;
  });

  // Deduplicate by consonantal form
  const seenC = new Set();
  const deduped = candidates.filter(w => {
    if (seenC.has(w.c)) return false;
    seenC.add(w.c);
    return true;
  });

  const picked = pick(deduped, 85);

  for (const w of picked) {
    counter++;
    const prefixes = detectPrefixes(w.c, w.v) || [];
    const suffixes = detectSuffixes(w.c, w.v) || [];
    const radicals = w.r.split(' ');

    exercises.push({
      id: padId('re', counter),
      word: w.v,
      consonants: w.c,
      location: getRef(w),
      expectedRoot: rootWithDashes(w.r),
      radicals: radicals,
      prefixes: prefixes,
      suffixes: suffixes,
      pos: mapWordType(w.p),
      morphology: w.m,
      hint: buildRootExplanation(w, prefixes, suffixes, radicals)
    });
  }

  console.log('  Generated ' + exercises.length + ' root-extraction exercises');

  return {
    meta: {
      title: 'Wurzelextraktion (generiert)',
      description: 'Automatisch generierte Uebungen zur Extraktion der Wurzel aus flektierten und affigierten Wortformen.',
      generated: new Date().toISOString().slice(0, 10),
      count: exercises.length
    },
    exercises
  };
}

// ---------------------------------------------------------------------------
// Write all files
// ---------------------------------------------------------------------------
console.log('\n[9/9] Writing output files...');

function writeJSON(filename, data) {
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  const size = fs.statSync(filepath).size;
  console.log('  Written: ' + filename + ' (' + (size / 1024).toFixed(1) + ' KB)');
}

// Generate all
const rasmData = generateRasmVocalization();
writeJSON('rasm-vocalization-drill-generated.json', rasmData);

const caseData = generateCaseDerivation();
writeJSON('case-derivation-generated.json', caseData);

const waslaData = generateAlifWasla();
writeJSON('alif-wasla-generated.json', waslaData);

const weakData = generateWeakRoot();
writeJSON('weak-root-generated.json', weakData);

const pluralData = generateBrokenPlural();
writeJSON('broken-plural-generated.json', pluralData);

const patternData = generatePatternRecognition();
writeJSON('pattern-recognition-generated.json', patternData);

const rootExtData = generateRootExtraction();
writeJSON('root-extraction-generated.json', rootExtData);

console.log('\nDone! All exercise files generated successfully.');
