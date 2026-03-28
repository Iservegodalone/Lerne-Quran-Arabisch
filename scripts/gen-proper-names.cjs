const fs = require('fs');
const path = require('path');
const dataDir = 'C:/Users/limao/OneDrive/Desktop/Projects/Forschung/quran_arabic/app/src/data';
const morphDb = require(path.join(dataDir, 'quran-morphology-db.json'));

// Filter proper nouns
const properNouns = morphDb.words.filter(w => w.p === 'PN');

// Group by vocalized form
const nameData = {};

for (const w of properNouns) {
  const key = w.v || w.c;
  if (!nameData[key]) {
    nameData[key] = {
      name: key,
      consonantal: w.c,
      root: w.r,
      locations: [],
      count: 0,
      morphFeatures: new Set()
    };
  }
  nameData[key].count++;
  nameData[key].locations.push(w.l);
  if (w.m) {
    w.m.split('|').forEach(f => nameData[key].morphFeatures.add(f));
  }
}

// Determine diptote: words that appear in GEN without tanwin and have specific patterns
// In Arabic grammar, diptotes (mamnu min as-sarf) don't take tanwin
// We can check if the morphology indicates GEN case - proper nouns that are diptote
// show ACC ending in GEN position. We approximate by checking morphological features.
const names = Object.values(nameData)
  .sort((a, b) => b.count - a.count)
  .map(n => {
    const features = [...n.morphFeatures];
    // Diptote heuristic: foreign proper nouns, feminine patterns ending in -aa
    // Most Quranic proper nouns of foreign origin are diptote
    const isDiptote = !n.consonantal.startsWith('ال') && n.root !== 'ا ل ه';
    return {
      name: n.name,
      consonantal: n.consonantal,
      root: n.root,
      locations: n.locations,
      count: n.count,
      diptote: isDiptote
    };
  });

const output = {
  meta: {
    description: 'Proper names (PN) from Quranic morphology database',
    totalOccurrences: properNouns.length,
    uniqueNames: names.length
  },
  names
};

fs.writeFileSync(path.join(dataDir, 'proper-names.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('proper-names.json generated with', names.length, 'unique names,', properNouns.length, 'total occurrences');
