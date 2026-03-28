const fs = require('fs');
const path = require('path');
const dataDir = 'C:/Users/limao/OneDrive/Desktop/Projects/Forschung/quran_arabic/app/src/data';
const rootFreqComplete = require(path.join(dataDir, 'root-frequency-complete.json'));
const rootFreqMeaning = require(path.join(dataDir, 'root-frequency.json'));

// Build meaning lookup from root-frequency.json (which has meanings)
const meaningLookup = {};
for (const r of rootFreqMeaning.roots) {
  meaningLookup[r.root] = r.meaning;
}

const totalWords = rootFreqComplete.meta.totalWords;
const roots = rootFreqComplete.roots;

// Define tiers
const tierDefs = [
  { name: 'Tier 1', label: 'Kernwortschatz', from: 1, to: 50 },
  { name: 'Tier 2', label: 'Erweiterter Grundwortschatz', from: 51, to: 100 },
  { name: 'Tier 3', label: 'Fortgeschrittener Wortschatz', from: 101, to: 200 },
  { name: 'Tier 4', label: 'Spezialisierter Wortschatz', from: 201, to: 500 }
];

let cumulativeCount = 0;
const tiers = tierDefs.map(td => {
  const tierRoots = roots.filter(r => r.rank >= td.from && r.rank <= td.to);
  const tierCount = tierRoots.reduce((sum, r) => sum + r.count, 0);
  cumulativeCount += tierCount;

  return {
    name: td.name,
    label: td.label,
    rankRange: `${td.from}-${td.to}`,
    rootCount: tierRoots.length,
    wordsCovered: tierCount,
    cumulativeCoverage: ((cumulativeCount / totalWords) * 100).toFixed(2) + '%',
    roots: tierRoots.map(r => ({
      rank: r.rank,
      root: r.root,
      rootArabic: r.rootArabic,
      count: r.count,
      meaning: meaningLookup[r.root] || null
    }))
  };
});

const output = {
  meta: {
    description: 'Frequency-based learning path for Quranic Arabic roots',
    totalWords,
    totalRoots: roots.length,
    tierCount: tiers.length
  },
  tiers
};

fs.writeFileSync(path.join(dataDir, 'frequency-learning-path.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('frequency-learning-path.json generated with', tiers.length, 'tiers');
tiers.forEach(t => console.log(`  ${t.name} (${t.label}): ${t.rootCount} roots, cumulative ${t.cumulativeCoverage}`));
