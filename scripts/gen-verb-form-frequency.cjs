const fs = require('fs');
const path = require('path');
const dataDir = 'C:/Users/limao/OneDrive/Desktop/Projects/Forschung/quran_arabic/app/src/data';
const morphDb = require(path.join(dataDir, 'quran-morphology-db.json'));

// Filter verbs
const verbs = morphDb.words.filter(w => w.p === 'V');
const totalVerbs = verbs.length;

// Extract form from m field - look for (I), (II), ..., (X)
// If no form marker, it's Form I
const formCounts = {};
const formPerfImpf = {}; // form -> {perfect, imperfect}
const formActivePassive = {}; // form -> {active, passive}

for (const v of verbs) {
  const m = v.m || '';
  const formMatch = m.match(/\((I{1,3}V?|VI{0,3}|IX|X)\)/);
  const form = formMatch ? formMatch[1] : 'I';

  if (!formCounts[form]) formCounts[form] = 0;
  formCounts[form]++;

  if (!formPerfImpf[form]) formPerfImpf[form] = { perfect: 0, imperfect: 0, imperative: 0 };
  if (m.includes('PERF')) formPerfImpf[form].perfect++;
  else if (m.includes('IMPF')) formPerfImpf[form].imperfect++;
  else if (m.includes('IMPV')) formPerfImpf[form].imperative++;

  if (!formActivePassive[form]) formActivePassive[form] = { active: 0, passive: 0 };
  if (m.includes('PASS')) formActivePassive[form].passive++;
  else formActivePassive[form].active++;
}

// Sort forms in order I, II, III, IV, V, VI, VII, VIII, IX, X
const formOrder = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const forms = formOrder
  .filter(f => formCounts[f])
  .map(f => ({
    form: f,
    count: formCounts[f],
    percentage: ((formCounts[f] / totalVerbs) * 100).toFixed(2) + '%',
    aspect: formPerfImpf[f],
    voice: formActivePassive[f]
  }));

// Check for any forms not in standard list
for (const f of Object.keys(formCounts)) {
  if (!formOrder.includes(f)) {
    forms.push({
      form: f,
      count: formCounts[f],
      percentage: ((formCounts[f] / totalVerbs) * 100).toFixed(2) + '%',
      aspect: formPerfImpf[f],
      voice: formActivePassive[f]
    });
  }
}

const output = {
  meta: {
    description: 'Verb form frequency analysis from Quranic morphology database',
    totalVerbs
  },
  forms
};

fs.writeFileSync(path.join(dataDir, 'verb-form-frequency.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('verb-form-frequency.json generated with', forms.length, 'forms, total verbs:', totalVerbs);
