/**
 * Derives complete root frequency, hapax legomena, and collocation data
 * from the morphology database (77,429 words).
 *
 * Run: node derive-data.js
 */
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'quran-morphology-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// ========== 1. COMPLETE ROOT FREQUENCY (all 1642 roots) ==========

const rootCounts = {};
const rootPOS = {};       // POS distribution per root
const rootLocations = {}; // sample locations per root
const rootVocalized = {}; // sample vocalized forms per root
const wordCounts = {};    // count by consonantal form
const wordRoots = {};     // root(s) per consonantal form

for (const w of db.words) {
  // Root frequency
  if (w.r) {
    if (!rootCounts[w.r]) {
      rootCounts[w.r] = 0;
      rootPOS[w.r] = {};
      rootLocations[w.r] = [];
      rootVocalized[w.r] = new Set();
    }
    rootCounts[w.r]++;
    rootPOS[w.r][w.p] = (rootPOS[w.r][w.p] || 0) + 1;
    if (rootLocations[w.r].length < 5) rootLocations[w.r].push(w.l);
    rootVocalized[w.r].add(w.v);
  }

  // Word frequency (by consonantal form)
  if (!wordCounts[w.c]) {
    wordCounts[w.c] = 0;
    wordRoots[w.c] = new Set();
  }
  wordCounts[w.c]++;
  if (w.r) wordRoots[w.c].add(w.r);
}

// Build sorted root list
const sortedRoots = Object.entries(rootCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([root, count], i) => {
    const parts = root.split(' ');
    return {
      rank: i + 1,
      root: root,
      rootArabic: parts.join(''),
      count: count,
      percentage: ((count / 77429) * 100).toFixed(2) + '%',
      posDistribution: rootPOS[root],
      sampleLocations: rootLocations[root],
      derivativeCount: rootVocalized[root].size
    };
  });

const rootFreqComplete = {
  meta: {
    description: "Vollstaendige Wurzelliste des quranischen Korpus (77429 Woerter)",
    totalRoots: sortedRoots.length,
    totalWords: 77429,
    top50coverage: sortedRoots.slice(0, 50).reduce((s, r) => s + r.count, 0),
    top100coverage: sortedRoots.slice(0, 100).reduce((s, r) => s + r.count, 0),
    top300coverage: sortedRoots.slice(0, 300).reduce((s, r) => s + r.count, 0),
    top500coverage: sortedRoots.slice(0, 500).reduce((s, r) => s + r.count, 0),
    allCoverage: sortedRoots.reduce((s, r) => s + r.count, 0),
    note: "Vollstaendige Liste aller Wurzeln. posDistribution zeigt Verteilung nach Wortart (V=Verb, N=Nomen, ADJ=Adjektiv, PN=Eigenname, etc.)"
  },
  roots: sortedRoots
};

fs.writeFileSync(
  path.join(__dirname, 'root-frequency-complete.json'),
  JSON.stringify(rootFreqComplete, null, 2),
  'utf8'
);
console.log(`Root frequency: ${sortedRoots.length} roots written.`);

// ========== 2. HAPAX LEGOMENA ==========

// Words where the VOCALIZED form appears exactly once in the entire Quran
const vocalizedCounts = {};
const vocalizedInfo = {};

for (const w of db.words) {
  if (!vocalizedCounts[w.v]) {
    vocalizedCounts[w.v] = 0;
    vocalizedInfo[w.v] = { c: w.c, r: w.r, p: w.p, m: w.m, locations: [] };
  }
  vocalizedCounts[w.v]++;
  if (vocalizedInfo[w.v].locations.length < 3) {
    vocalizedInfo[w.v].locations.push(w.l);
  }
}

const hapaxByVocalized = Object.entries(vocalizedCounts)
  .filter(([, count]) => count === 1)
  .map(([vocalized]) => {
    const info = vocalizedInfo[vocalized];
    return {
      vocalized: vocalized,
      consonantal: info.c,
      root: info.r,
      pos: info.p,
      morphology: info.m,
      location: info.locations[0]
    };
  })
  .sort((a, b) => {
    const [as, av] = a.location.split(':').map(Number);
    const [bs, bv] = b.location.split(':').map(Number);
    return as - bs || av - bv;
  });

// Also: consonantal forms that appear exactly once
const hapaxByConsonantal = Object.entries(wordCounts)
  .filter(([, count]) => count === 1)
  .map(([consonantal]) => {
    const w = db.words.find(x => x.c === consonantal);
    return {
      consonantal: consonantal,
      vocalized: w.v,
      root: w.r,
      pos: w.p,
      morphology: w.m,
      location: w.l
    };
  })
  .sort((a, b) => {
    const [as, av] = a.location.split(':').map(Number);
    const [bs, bv] = b.location.split(':').map(Number);
    return as - bs || av - bv;
  });

const hapaxData = {
  meta: {
    description: "Hapax Legomena im Quran — Woerter die nur einmal vorkommen",
    hapaxByVocalizedForm: hapaxByVocalized.length,
    hapaxByConsonantalForm: hapaxByConsonantal.length,
    totalWords: 77429,
    note: "Vokalisierte Hapax: exakt diese vokalisierte Form kommt nur einmal vor. Konsonantale Hapax: diese Konsonantenfolge kommt nur einmal vor (strengeres Kriterium)."
  },
  byVocalizedForm: hapaxByVocalized,
  byConsonantalForm: hapaxByConsonantal
};

fs.writeFileSync(
  path.join(__dirname, 'hapax-legomena.json'),
  JSON.stringify(hapaxData, null, 2),
  'utf8'
);
console.log(`Hapax legomena: ${hapaxByVocalized.length} vocalized, ${hapaxByConsonantal.length} consonantal.`);

// ========== 3. COLLOCATIONS ==========

// Find word pairs that frequently co-occur within the same verse
const verseWords = {};

for (const w of db.words) {
  const verseKey = w.l.split(':').slice(0, 2).join(':');
  if (!verseWords[verseKey]) verseWords[verseKey] = [];
  verseWords[verseKey].push({ c: w.c, r: w.r, v: w.v });
}

// Count root co-occurrences per verse
const rootPairCounts = {};
for (const [, words] of Object.entries(verseWords)) {
  const roots = [...new Set(words.filter(w => w.r).map(w => w.r))];
  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      const pair = [roots[i], roots[j]].sort().join(' + ');
      rootPairCounts[pair] = (rootPairCounts[pair] || 0) + 1;
    }
  }
}

// Top 200 collocations (root pairs appearing in 5+ verses)
const topCollocations = Object.entries(rootPairCounts)
  .filter(([, count]) => count >= 5)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 200)
  .map(([pair, count], i) => {
    const [r1, r2] = pair.split(' + ');
    return {
      rank: i + 1,
      root1: r1,
      root2: r2,
      coOccurrences: count
    };
  });

// Count word-level bigrams (consecutive words)
const bigramCounts = {};
for (const [, words] of Object.entries(verseWords)) {
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i].c + ' ' + words[i + 1].c;
    bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
  }
}

const topBigrams = Object.entries(bigramCounts)
  .filter(([, count]) => count >= 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 200)
  .map(([bigram, count], i) => ({
    rank: i + 1,
    phrase: bigram,
    occurrences: count
  }));

const collocationData = {
  meta: {
    description: "Kollokationen im Quran — haeufig gemeinsam auftretende Woerter und Wurzeln",
    totalRootPairs: topCollocations.length,
    totalBigrams: topBigrams.length,
    note: "rootCollocations: Wurzelpaare die in 5+ Versen gemeinsam auftreten. wordBigrams: Aufeinanderfolgende Wortpaare die 3+ Mal vorkommen."
  },
  rootCollocations: topCollocations,
  wordBigrams: topBigrams
};

fs.writeFileSync(
  path.join(__dirname, 'collocations.json'),
  JSON.stringify(collocationData, null, 2),
  'utf8'
);
console.log(`Collocations: ${topCollocations.length} root pairs, ${topBigrams.length} bigrams.`);

console.log('\nDone! Generated:');
console.log('  - root-frequency-complete.json');
console.log('  - hapax-legomena.json');
console.log('  - collocations.json');
