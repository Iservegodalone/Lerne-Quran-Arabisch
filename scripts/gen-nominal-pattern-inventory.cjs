const fs = require('fs');
const path = require('path');
const dataDir = 'C:/Users/limao/OneDrive/Desktop/Projects/Forschung/quran_arabic/app/src/data';
const morphDb = require(path.join(dataDir, 'quran-morphology-db.json'));

// Particle POS tags to exclude
const particlePOS = new Set(['V','P','CONJ','NEG','SUP','INTG','VOC','PREV','RES','CIRC','RSLT',
  'SUB','AMD','ANS','COND','EMPH','EQ','EXH','EXL','EXP','FUT','INC','INT','CERT',
  'PRO','REM','RET','SUR','PRON','REL','DEM','INL','T']);

// Filter nominals (not verbs, not particles)
const nominals = morphDb.words.filter(w => !particlePOS.has(w.p));

// Extract morphological pattern from 'm' field
// The m field contains things like: M|GEN, ACT|PCPL|M|GEN, PASS|PCPL|MP|GEN, etc.
// We use the morphological features (excluding case) as the pattern key
function extractPattern(m) {
  if (!m) return 'UNKNOWN';
  // Remove case markers (NOM, ACC, GEN) and INDEF
  const parts = m.split('|').filter(p => !['NOM','ACC','GEN','INDEF'].includes(p));
  return parts.join('|') || 'BASE';
}

const patternData = {};

for (const w of nominals) {
  const pattern = extractPattern(w.m);
  if (!patternData[pattern]) {
    patternData[pattern] = {
      pattern,
      count: 0,
      vocalizedForms: new Set(),
      sampleLocations: [],
      posTags: {}
    };
  }
  patternData[pattern].count++;
  if (w.v) patternData[pattern].vocalizedForms.add(w.v);
  if (patternData[pattern].sampleLocations.length < 5) {
    patternData[pattern].sampleLocations.push(w.l);
  }
  if (w.p) {
    patternData[pattern].posTags[w.p] = (patternData[pattern].posTags[w.p] || 0) + 1;
  }
}

// Sort by count, take top 50
const patterns = Object.values(patternData)
  .sort((a, b) => b.count - a.count)
  .slice(0, 50)
  .map(p => ({
    pattern: p.pattern,
    count: p.count,
    uniqueVocalizedForms: p.vocalizedForms.size,
    sampleVocalizedForms: [...p.vocalizedForms].slice(0, 10),
    sampleLocations: p.sampleLocations,
    posTags: p.posTags
  }));

const output = {
  meta: {
    description: 'Nominal pattern inventory from Quranic morphology database (top 50 patterns)',
    totalNominals: nominals.length,
    totalPatterns: Object.keys(patternData).length
  },
  patterns
};

fs.writeFileSync(path.join(dataDir, 'nominal-pattern-inventory.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('nominal-pattern-inventory.json generated with', patterns.length, 'patterns from', nominals.length, 'nominals');
