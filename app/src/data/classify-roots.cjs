/**
 * Classifies all 1642 Quranic roots into 25 thematic fields.
 * Uses: keyword matching on meanings + POS distribution heuristics.
 * Run: node classify-roots.cjs
 */
const fs = require('fs');
const _path = require('path');

const tf = require('./thematic-fields.json');
const rfc = require('./root-frequency-complete.json');
const db = require('./quran-morphology-db.json');
const lanes = require('./lanes-lexicon-urls.json');

// Build classified set
const classified = new Set();
for (const field of tf.fields) {
  for (const r of field.roots) classified.add(r.root);
}
console.log('Already classified: ' + classified.size);

// Build root -> vocalized forms map
const rootForms = {};
for (const w of db.words) {
  if (!w.r) continue;
  if (!rootForms[w.r]) rootForms[w.r] = new Set();
  if (w.v) rootForms[w.r].add(w.v);
}

// Lane's meanings
const lanesMeanings = {};
for (const r of lanes.frequentRootsWithLaneReferences.roots) {
  if (r.meaning) lanesMeanings[r.root.replace(/-/g, ' ')] = r.meaning.toLowerCase();
}

// Field keywords
const fieldKeywords = {
  deity_worship: ['gott', 'dienen', 'zuwend', 'zuwendung', 'lobpreis', 'verehr', 'dien', 'opfer', 'pilger'],
  knowledge_belief: ['wissen', 'glaub', 'lehr', 'versteh', 'denk', 'kennt', 'zeich', 'beweis', 'zeug', 'vernunft'],
  creation_nature: ['schaff', 'schoepf', 'tier', 'pflanz', 'baum', 'stern', 'mond', 'sonn', 'wind', 'wolke'],
  speech_communication: ['sprech', 'sag', 'red', 'ruf', 'kund', 'mitteil', 'bot', 'wort', 'stimm', 'laut', 'schrei', 'fluestern'],
  ethics_action: ['gut', 'boes', 'recht', 'schlecht', 'tugendhaft', 'fromm', 'suend', 'schuld', 'geduld', 'dank', 'lueg', 'betrueg', 'gerecht'],
  afterlife: ['tod', 'sterb', 'grab', 'auferst', 'feuer', 'paradies', 'garten', 'hoelle', 'strafe', 'belohn', 'lohn', 'qual'],
  social_relations: ['mensch', 'volk', 'leut', 'gemeinsch', 'genosse', 'freund', 'feind', 'nachbar', 'gruppe', 'stamm'],
  power_authority: ['herrsch', 'koenig', 'macht', 'stark', 'gewalt', 'befeh', 'zwing', 'unterwerf', 'sultan'],
  time_movement: ['zeit', 'tag', 'nacht', 'stund', 'jahr', 'monat', 'morgen', 'abend', 'frueh', 'spaet'],
  perception_emotion: ['seh', 'hoer', 'fueh', 'lieb', 'hass', 'fuercht', 'angst', 'freud', 'trauer', 'wein', 'zorn', 'wunsch'],
  water_rain: ['wasser', 'regen', 'fluss', 'strom', 'quell', 'meer', 'trink', 'giess', 'fliess'],
  light_darkness: ['licht', 'dunkel', 'leuchte', 'schein', 'strahl', 'blind', 'flamm', 'fackle', 'morgenrot'],
  food_drink: ['ess', 'nahrung', 'frucht', 'korn', 'fleisch', 'milch', 'honig', 'speise', 'saeen', 'ernte', 'dattel', 'traube'],
  body_health: ['koerper', 'hand', 'auge', 'herz', 'kopf', 'fuss', 'gesicht', 'krank', 'heil', 'blut', 'brust', 'finger', 'haut'],
  war_peace: ['krieg', 'kaempf', 'sieg', 'toet', 'schlacht', 'fried', 'heer', 'waffe', 'schwert', 'pfeil', 'angriff'],
  trade_economy: ['handel', 'kauf', 'verkauf', 'geld', 'besitz', 'reich', 'arm', 'schuld', 'zins', 'mass', 'waag', 'gewinn', 'verlust'],
  family_kinship: ['vater', 'mutter', 'sohn', 'tochter', 'bruder', 'schwester', 'frau', 'mann', 'kind', 'ehe', 'heirat', 'verwand', 'waise'],
  guidance_error: ['leit', 'fuehr', 'weg', 'irr', 'pfad', 'abweich', 'verleit', 'gerade', 'rechtleit'],
  scripture_revelation: ['buch', 'schrift', 'les', 'offenbar', 'herabsend', 'vers', 'tafel', 'recit', 'quran'],
  heaven_earth: ['himmel', 'erde', 'oben', 'unten', 'hoch', 'tief', 'raum', 'berg', 'meer', 'land'],
  numbers_quantities: ['zahl', 'viel', 'wenig', 'all', 'teil', 'halb', 'hundert', 'tausend', 'eins', 'zwei', 'drei'],
  movement_travel: ['reis', 'wander', 'flieg', 'fahr', 'lauf', 'wend', 'kehr', 'zurueck', 'geh', 'komm', 'eil', 'send'],
  building_dwelling: ['bau', 'haus', 'wohn', 'stadt', 'tor', 'mauer', 'dorf', 'sitz', 'thron', 'zelt'],
  clothing_adornment: ['kleid', 'schmuck', 'huell', 'deck', 'trag', 'gewand', 'seide', 'gold', 'silber', 'perle'],
  law_contracts: ['vertrag', 'bund', 'schwur', 'eid', 'gesetz', 'gebot', 'verbot', 'erlaubt', 'verboten', 'recht', 'urteil'],
};

// Phase 1: Classify by meaning keywords
let keywordClassified = 0;
const unclassified1 = rfc.roots.filter(r => !classified.has(r.root));

for (const r of unclassified1) {
  const meaning = (lanesMeanings[r.root] || '').toLowerCase();
  if (!meaning) continue;

  let bestField = null;
  let bestScore = 0;

  for (const [fieldId, keywords] of Object.entries(fieldKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (meaning.includes(kw)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestField = fieldId;
    }
  }

  if (bestField && bestScore >= 2) {
    const field = tf.fields.find(f => f.id === bestField);
    if (field) {
      const forms = rootForms[r.root] || new Set();
      const topForms = [...forms].slice(0, 3);
      field.roots.push({
        root: r.root,
        transliteration: r.rootArabic,
        keyWords: topForms.length > 0 ? topForms : [r.rootArabic],
        count: '~' + r.count,
      });
      classified.add(r.root);
      keywordClassified++;
    }
  }
}
console.log('Keyword-classified: ' + keywordClassified);

// Phase 2: Classify remaining by POS distribution
let posClassified = 0;
const unclassified2 = rfc.roots.filter(r => !classified.has(r.root));

for (const r of unclassified2) {
  const pos = r.posDistribution || {};
  const totalPos = Object.values(pos).reduce((a, b) => a + b, 0);
  let fieldId = null;

  if (pos.PN && pos.PN / totalPos > 0.5) {
    fieldId = 'social_relations';
  } else if (pos.V && pos.V / totalPos > 0.8) {
    fieldId = 'ethics_action';
  } else if (pos.N && pos.N / totalPos > 0.8) {
    fieldId = 'creation_nature';
  } else if (pos.ADJ && pos.ADJ / totalPos > 0.3) {
    fieldId = 'perception_emotion';
  } else {
    // Default based on count: high-freq = ethics, low-freq = creation_nature
    fieldId = r.count > 5 ? 'ethics_action' : 'creation_nature';
  }

  const field = tf.fields.find(f => f.id === fieldId);
  if (field) {
    const forms = rootForms[r.root] || new Set();
    const topForms = [...forms].slice(0, 2);
    field.roots.push({
      root: r.root,
      transliteration: r.rootArabic,
      keyWords: topForms.length > 0 ? topForms : [r.rootArabic],
      count: '~' + r.count,
    });
    classified.add(r.root);
    posClassified++;
  }
}
console.log('POS-classified: ' + posClassified);

// Update meta
const totalClassified = tf.fields.reduce((sum, f) => sum + f.roots.length, 0);
tf.meta.totalRoots = totalClassified;
tf.meta.totalFields = tf.fields.length;

fs.writeFileSync('./thematic-fields.json', JSON.stringify(tf, null, 2), 'utf8');
console.log('Total classified: ' + totalClassified);
console.log('Field sizes:');
for (const f of tf.fields) {
  console.log('  ' + f.id + ': ' + f.roots.length);
}
