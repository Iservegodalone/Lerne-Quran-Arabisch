/**
 * expand-learning-path.cjs
 *
 * Expands frequency-learning-path.json from 500 to 1000 roots
 * by adding Tier 5 (ranks 501-750) and Tier 6 (ranks 751-1000).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

// Load data
const learningPath = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'frequency-learning-path.json'), 'utf8'));
const freqData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'root-frequency-complete.json'), 'utf8'));
const meaningsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'root-meanings.json'), 'utf8'));

// Linguistic meanings for roots whose root-meanings.json entry only has derivative forms
// All meanings are purely linguistic, derived from Lane's Lexicon root semantics
const FALLBACK_MEANINGS = {
  'ط و ي': 'falten, zusammenrollen',
  'ش ت ت': 'zerstreuen, auseinandergehen',
  'ن س ف': 'zerstaeumen, verwehen',
  'ب ر د': 'kalt sein, Kaelte; Hagel',
  'د ه ن': 'Oel, salben; schmeicheln',
  'و ز ع': 'zurueckhalten, ordnen',
  'ف و ج': 'Schar, Trupp, Gruppe',
  'خ س ا': 'zurueckweichen, vertrieben werden',
  'ن س خ': 'aufheben, ersetzen; abschreiben',
  'ه ا ت': 'herbringen, hergeben',
  'ب د ع': 'erschaffen, erstmalig hervorbringen',
  'ط و ق': 'Kraft haben, vermoegen; umringen',
  'د ل و': 'herablassen; Eimer',
  'ن س ل': 'sich fortpflanzen; Nachkommenschaft',
  'ح ي ض': 'Menstruation; fliessen',
  'ش و ر': 'beraten, sich beraten',
  'ق ن ط ر': 'Zentner; grosse Menge',
  'ا م د': 'Zeitraum, Frist',
  'ف ش ل': 'versagen, schwach werden',
  'ف و ر': 'sieden, aufwallen; sofort',
  'س خ ط': 'zuernen, Zorn',
  'ه ن ا': 'angenehm, wohltuend',
  'و ف ق': 'gelingen, Erfolg geben',
  'غ س ل': 'waschen, reinigen',
  'م س ح': 'wischen, streichen ueber',
  'ن ق ر': 'picken; gering, Dattelkernhaut',
  'س ل ح': 'Waffe, bewaffnen',
  'ق ل د': 'Schluessel; Halskette; nachahmen',
  'ج ر ح': 'verwunden; erwerben',
  'ك ع ب': 'Knoechel; Wuerfel',
  'س ح ت': 'unrechtmaessiger Gewinn',
  'د ر ر': 'reichlich fliessen; Perle',
  'و ر ق': 'Blatt; Silber',
  'ي ب س': 'trocken sein, verdorren',
  'ك ر ب': 'Kummer, Betruebnis, Leid',
  'ل م م': 'sammeln; leichte Verfehlung',
  'س م م': 'Gift; heisser Wind',
  'ج س د': 'Koerper, Leib',
  'ن ف ل': 'Zusaetzliches, freiwillige Gabe',
  'ر ح ب': 'weit, geraeuming; willkommen',
  'غ و ر': 'versinken; Tiefe, Hoehle',
  'ج د ر': 'Mauer, Wand; wuerdig sein',
  'ش ا ن': 'Angelegenheit, Zustand',
  'ر ذ ل': 'niedrig, veraechlich',
  'ن ص ي': 'Stirnlocke, Vorderseite des Kopfes',
  'ش ي خ': 'Greis, alter Mann',
  'م ج د': 'ruhmreich, erhaben',
  'ر ك ن': 'sich stuetzen, Stuetze; neigen zu',
  'ت ب ب': 'zugrunde gehen, Verlust',
  'س و ل': 'einfluestern, verlocken',
  'س م ن': 'fett, feist',
  'غ ي ث': 'Regen; regnen lassen',
  'ب و ل': 'Sinn, Gemuetszustand',
  'ج ه ز': 'ausruesten, vorbereiten',
  'ر ح ل': 'reisen, aufbrechen; Reisegepaeck',
  'س ر ب': 'gehen, sich bewegen; Bahn',
  'س ي ل': 'fliessen; Sturzflut',
  'ز و ل': 'vergehen, schwinden',
  'ص ل ص ل': 'toenendes/trockenes Tongefaess',
  'ح م ا': 'dunkler Schlamm',
  'خ ف ض': 'senken, leise machen',
  'د خ ر': 'demuetig, unterwuerfig',
  'غ س ق': 'Dunkelheit, Daemmerung',
  'ر ق ي': 'aufsteigen, emporsteigen',
  'د ح ض': 'widerlegen; ausgleiten',
  'س ف ن': 'Schiff',
  'ل ج ج': 'beharrlich streiten; hartnaeickig',
  'غ ض ض': 'senken (Blick); daempfen',
  'ع و ر': 'Bloesse, Scham; Schande',
  'س ر ج': 'Lampe, Leuchte',
  'م ز ق': 'zerreissen, zerfetzen',
  'س د ر': 'Lotusbaum',
  'ك و ب': 'Becher, Trinkgefaess',
  'ط ب ق': 'Schicht, Stufe; uebereinander',
  'ر غ د': 'reichlich, angenehm (Leben)',
  'س ل و': 'Wachtel',
  'ص ب ا': 'den Glauben wechseln; Sabier',
  'ق ر د': 'Affe',
  'ص ب غ': 'faerben; Farbe, Praegung',
  'ل ف و': 'antreffen, vorfinden',
  'خ ي ط': 'Faden, Streifen',
  'ح ل ق': 'rasieren; Ring, Kreis',
  'ه ز م': 'besiegen, in die Flucht schlagen',
  'س ا م': 'benennen, nennen',
  'ر ه ن': 'Pfand, als Pfand geben',
  'ا ص ر': 'Last, Buerde; Bund',
  'ق ر ح': 'Wunde, Verwundung',
  'ض ج ع': 'Lagerstaette; sich niederlegen',
  'ف ت ل': 'drehen; duenner Faden',
  'ن ك ف': 'sich weigern, verschmaehen',
  'ب ه م': 'Vieh, Tier',
  'ع ز ر': 'staerken, unterstuetzen',
  'ا ن ف': 'Nase',
  'ط ف ا': 'loeschen (Feuer)',
  'ن ا ي': 'fern sein, Ferne',
  'ر م ن': 'Granatapfel',
  'ا ب ل': 'Kamel',
  'ل ق ف': 'verschlingen, hastig greifen',
  'س ل خ': 'abziehen (Haut); ablaufen',
  'م ت ن': 'fest, stark, dauerhaft',
  'ح ف و': 'freundlich empfangen; bedraengen',
  'ر د ف': 'nachfolgen, hinterherreiten',
  'ر ك م': 'aufhaeumen, uebereinanderschichten',
  'س ي ح': 'umherziehen, wandern',
  'ا س س': 'Grundlage, gruenden',
  'ظ م ا': 'Durst, durstig sein',
  'و ج س': 'in sich empfinden; Furcht spueren',
  'ر ه ط': 'Gruppe, Sippe (3-10 Personen)',
  'ذ ا ب': 'Wolf',
  'ص ب و': 'jung sein; Kind',
  'ح و ج': 'Beduerfnis, brauchen',
  'ع ي ر': 'Karawane, Lasttier',
  'ف ق د': 'verlieren, vermissen',
  'ب ر ح': 'aufhoeren; weggehen',
  'ش ك و': 'sich beklagen, Klage',
  'ز ج و': 'treiben, forttreiben',
  'س و غ': 'leicht hinuntergehen (Trank)',
  'ه ط ع': 'eilen mit erhobenem Blick',
  'س ر ب ل': 'Gewand, Hemd; bekleiden',
  'ا ف ف': 'Ausruf des Ueberdrusses (uff)',
  'ب ذ ر': 'verschwenden, vergeuden',
  'س ت ر': 'verbergen, bedecken; Schleier',
  'ف ز ز': 'aufschrecken, aufstacheln',
  'ذ ق ن': 'Kinn',
  'خ ف ت': 'leise sprechen, daempfen',
};

// Build lookup maps
const meaningsByRoot = new Map();
meaningsData.roots.forEach(r => {
  meaningsByRoot.set(r.root, r);
});

const freqByRoot = new Map();
freqData.roots.forEach(r => {
  freqByRoot.set(r.root, r);
});

// Collect all existing roots across all tiers for dedup check
const existingRoots = new Set();
learningPath.tiers.forEach(tier => {
  tier.roots.forEach(r => {
    existingRoots.add(r.root);
  });
});
console.log(`Existing roots in learning path: ${existingRoots.size}`);

// Get frequency-sorted roots for ranks 501-1000
const rootsForExpansion = freqData.roots.filter(r => r.rank >= 501 && r.rank <= 1000);
console.log(`Roots in rank range 501-1000: ${rootsForExpansion.length}`);

// Shorten meaning from root-meanings.json to match existing concise style
function shortenMeaning(fullMeaning) {
  if (!fullMeaning) return '';
  // Take the part before the dash explanation if present
  let short = fullMeaning.split(' — ')[0].trim();
  // If still long (>40 chars), truncate at last comma/semicolon before 40
  if (short.length > 40) {
    const cutoff = Math.max(short.lastIndexOf(',', 40), short.lastIndexOf(';', 40));
    if (cutoff > 10) {
      short = short.substring(0, cutoff).trim();
    }
  }
  return short;
}

// Get meaning for a root, with fallback
function getMeaning(root) {
  const meaningEntry = meaningsByRoot.get(root);
  if (meaningEntry && meaningEntry.meaning) {
    // Check if it's a derivative-only placeholder
    if (meaningEntry.meaning.startsWith('(Quranische Formen') || meaningEntry.meaning.startsWith('(quranische')) {
      // Use fallback
      if (FALLBACK_MEANINGS[root]) {
        return FALLBACK_MEANINGS[root];
      }
      // Last resort: use semantic field
      return meaningEntry.semanticField || '';
    }
    return shortenMeaning(meaningEntry.meaning);
  }
  // Check fallback
  if (FALLBACK_MEANINGS[root]) {
    return FALLBACK_MEANINGS[root];
  }
  return '';
}

// Track fallback usage
let fallbackUsed = 0;
let fallbackMissing = 0;

// Build tier roots
function buildTierRoots(rankStart, rankEnd) {
  const roots = [];
  const tierFreqRoots = rootsForExpansion.filter(r => r.rank >= rankStart && r.rank <= rankEnd);

  for (const freqRoot of tierFreqRoots) {
    if (existingRoots.has(freqRoot.root)) {
      console.warn(`  DUPLICATE SKIPPED: ${freqRoot.root} (rank ${freqRoot.rank}) already in path`);
      continue;
    }

    const meaningEntry = meaningsByRoot.get(freqRoot.root);
    const rawMeaning = meaningEntry ? meaningEntry.meaning : '';
    const isFallback = rawMeaning.startsWith('(Quranische Formen') || rawMeaning.startsWith('(quranische') || !rawMeaning;

    const meaning = getMeaning(freqRoot.root);
    if (isFallback && FALLBACK_MEANINGS[freqRoot.root]) {
      fallbackUsed++;
    } else if (isFallback && !meaning) {
      fallbackMissing++;
      console.warn(`  MISSING MEANING: ${freqRoot.root} (rank ${freqRoot.rank})`);
    }

    const laneReference = meaningEntry ? (meaningEntry.lanesUrl || '') : '';

    const entry = {
      rank: freqRoot.rank,
      root: freqRoot.root,
      rootArabic: freqRoot.rootArabic,
      count: freqRoot.count,
      meaning: meaning,
    };

    if (laneReference) {
      entry.laneReference = laneReference;
    }

    roots.push(entry);
    existingRoots.add(freqRoot.root);
  }

  return roots;
}

// Build Tier 5
console.log('\nBuilding Tier 5 (ranks 501-750)...');
const tier5Roots = buildTierRoots(501, 750);

// Calculate words covered for tier 5
const tier5WordsCovered = tier5Roots.reduce((sum, r) => sum + r.count, 0);
const prevCumulative = learningPath.tiers.reduce((sum, t) => sum + t.wordsCovered, 0);
const tier5Cumulative = prevCumulative + tier5WordsCovered;
const totalWords = freqData.meta.totalWords;

const tier5 = {
  name: 'Tier 5',
  label: 'Fortgeschritten I',
  rankRange: '501-750',
  rootCount: tier5Roots.length,
  wordsCovered: tier5WordsCovered,
  cumulativeCoverage: (tier5Cumulative / totalWords * 100).toFixed(2) + '%',
  roots: tier5Roots,
};

// Build Tier 6
console.log('Building Tier 6 (ranks 751-1000)...');
const tier6Roots = buildTierRoots(751, 1000);

const tier6WordsCovered = tier6Roots.reduce((sum, r) => sum + r.count, 0);
const tier6Cumulative = tier5Cumulative + tier6WordsCovered;

const tier6 = {
  name: 'Tier 6',
  label: 'Fortgeschritten II',
  rankRange: '751-1000',
  rootCount: tier6Roots.length,
  wordsCovered: tier6WordsCovered,
  cumulativeCoverage: (tier6Cumulative / totalWords * 100).toFixed(2) + '%',
  roots: tier6Roots,
};

// Add tiers
learningPath.tiers.push(tier5);
learningPath.tiers.push(tier6);

// Update meta
learningPath.meta.tierCount = 6;
learningPath.meta.totalRootsInPath = existingRoots.size;
learningPath.meta.wordCoverage = {
  tier1: learningPath.tiers[0].cumulativeCoverage,
  tier2: learningPath.tiers[1].cumulativeCoverage,
  tier3: learningPath.tiers[2].cumulativeCoverage,
  tier4: learningPath.tiers[3].cumulativeCoverage,
  tier5: tier5.cumulativeCoverage,
  tier6: tier6.cumulativeCoverage,
};
learningPath.meta.tierSummary = {};
learningPath.tiers.forEach((t, i) => {
  const key = `tier${i + 1}`;
  learningPath.meta.tierSummary[key] = {
    label: t.label,
    rankRange: t.rankRange,
    rootCount: t.rootCount,
    wordsCovered: t.wordsCovered,
    cumulativeCoverage: t.cumulativeCoverage,
  };
});

// Final dedup validation
const allRootsInPath = [];
const duplicates = [];
learningPath.tiers.forEach(tier => {
  tier.roots.forEach(r => {
    if (allRootsInPath.includes(r.root)) {
      duplicates.push(r.root);
    }
    allRootsInPath.push(r.root);
  });
});

if (duplicates.length > 0) {
  console.error(`\nERROR: ${duplicates.length} duplicate roots found:`, duplicates);
  process.exit(1);
} else {
  console.log('\nValidation passed: no duplicate roots across all tiers.');
}

// Check for empty meanings
let emptyMeanings = 0;
let badMeanings = 0;
learningPath.tiers.forEach(tier => {
  tier.roots.forEach(r => {
    if (!r.meaning) emptyMeanings++;
    if (r.meaning && (r.meaning.startsWith('(Quranische') || r.meaning.startsWith('(quranische'))) {
      badMeanings++;
    }
  });
});

if (emptyMeanings > 0) {
  console.warn(`WARNING: ${emptyMeanings} roots have empty meanings`);
}
if (badMeanings > 0) {
  console.warn(`WARNING: ${badMeanings} roots still have derivative-form-only meanings`);
}

// Write output
const outputPath = path.join(DATA_DIR, 'frequency-learning-path.json');
fs.writeFileSync(outputPath, JSON.stringify(learningPath, null, 2), 'utf8');

// Statistics
console.log('\n=== STATISTICS ===');
console.log(`Total roots in path: ${allRootsInPath.length}`);
console.log(`Tier 5 roots added: ${tier5Roots.length}`);
console.log(`Tier 6 roots added: ${tier6Roots.length}`);
console.log(`Total new roots: ${tier5Roots.length + tier6Roots.length}`);
console.log(`Fallback meanings used: ${fallbackUsed}`);
console.log(`Fallback meanings missing: ${fallbackMissing}`);
console.log(`\nCoverage breakdown:`);
learningPath.tiers.forEach(t => {
  console.log(`  ${t.name} (${t.label}): ${t.rootCount} roots, ${t.wordsCovered} words, cumulative ${t.cumulativeCoverage}`);
});
console.log(`\nTotal words in corpus: ${totalWords}`);
console.log(`Final coverage (1000 roots): ${tier6.cumulativeCoverage}`);
console.log(`Empty meanings: ${emptyMeanings}`);
console.log(`Bad meanings (derivative-only): ${badMeanings}`);
console.log(`\nOutput written to: ${outputPath}`);
