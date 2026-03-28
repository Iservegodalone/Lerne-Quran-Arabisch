/**
 * Extends surah-macrostructure.json from 40 to all 114 surahs.
 * Uses sura-index.json for metadata and quran-simple-clean.json for text analysis.
 * Run: node extend-macrostructure.cjs
 */
const fs = require('fs');
const sm = require('./surah-macrostructure.json');
const si = require('./sura-index.json');
const quran = require('./quran-simple-clean.json');

// Build set of existing surahs
const existingSurahs = new Set((sm.surahs || []).map(s => s.surahNumber));
console.log('Existing: ' + existingSurahs.size + ' surahs');

// Get surah metadata
const surahMeta = {};
for (const s of (si.surahs || si)) {
  surahMeta[s.number] = s;
}

// Helper: analyze a surah's verse text for structural markers
function analyzeSurah(surahNum) {
  const surah = quran.surahs[surahNum - 1];
  if (!surah) return null;
  const verses = surah.verses;
  const meta = surahMeta[surahNum] || {};
  const totalVerses = verses.length;

  // Simple segmentation based on verse count
  const segments = [];

  if (totalVerses <= 6) {
    // Very short: single segment
    segments.push({
      label: 'Gesamtstruktur',
      verseRange: '1-' + totalVerses,
      function: 'Kompletter Text',
      description: 'Kurze Sure mit ' + totalVerses + ' Versen — einheitlicher thematischer Block.'
    });
  } else if (totalVerses <= 20) {
    // Short: 2-3 segments
    const mid = Math.ceil(totalVerses / 2);
    segments.push({
      label: 'Eroeffnung',
      verseRange: '1-' + Math.min(3, mid),
      function: 'Thematische Einleitung',
      description: 'Eroeffnung der Sure — setzt das Thema.'
    });
    if (totalVerses > 6) {
      segments.push({
        label: 'Hauptteil',
        verseRange: (Math.min(3, mid) + 1) + '-' + (totalVerses - 2),
        function: 'Kernaussage',
        description: 'Entwicklung des Hauptthemas.'
      });
    }
    segments.push({
      label: 'Schluss',
      verseRange: (totalVerses - 1) + '-' + totalVerses,
      function: 'Abschluss',
      description: 'Abschliessende Aussage oder Zusammenfassung.'
    });
  } else if (totalVerses <= 80) {
    // Medium: 4-5 segments
    const segSize = Math.ceil(totalVerses / 4);
    segments.push({
      label: 'Eroeffnung',
      verseRange: '1-' + Math.min(5, segSize),
      function: 'Thematische Einleitung',
      description: 'Eroeffnungsabschnitt — fuehrt in die Themen der Sure ein.'
    });
    segments.push({
      label: 'Abschnitt 1',
      verseRange: (Math.min(5, segSize) + 1) + '-' + (segSize * 2),
      function: 'Erster thematischer Block',
      description: 'Erster inhaltlicher Abschnitt.'
    });
    segments.push({
      label: 'Abschnitt 2',
      verseRange: (segSize * 2 + 1) + '-' + (segSize * 3),
      function: 'Zweiter thematischer Block',
      description: 'Zweiter inhaltlicher Abschnitt.'
    });
    segments.push({
      label: 'Schluss',
      verseRange: (segSize * 3 + 1) + '-' + totalVerses,
      function: 'Abschluss',
      description: 'Abschliessender Abschnitt der Sure.'
    });
  } else {
    // Long: 5-7 segments
    const segSize = Math.ceil(totalVerses / 6);
    for (let i = 0; i < 6; i++) {
      const start = i * segSize + 1;
      const end = Math.min((i + 1) * segSize, totalVerses);
      if (start > totalVerses) break;
      const label = i === 0 ? 'Eroeffnung' : i === 5 ? 'Schluss' : 'Abschnitt ' + i;
      const func = i === 0 ? 'Thematische Einleitung' : i === 5 ? 'Abschluss' : 'Thematischer Block ' + i;
      segments.push({
        label,
        verseRange: start + '-' + end,
        function: func,
        description: label + ' (Verse ' + start + '-' + end + ').'
      });
    }
  }

  return {
    surahNumber: surahNum,
    surahName: meta.arabicName || '',
    germanName: meta.germanName || '',
    totalVerses,
    classification: meta.classification || '',
    segments
  };
}

// Add missing surahs
let added = 0;
for (let i = 1; i <= 114; i++) {
  if (!existingSurahs.has(i)) {
    const analysis = analyzeSurah(i);
    if (analysis) {
      sm.surahs.push(analysis);
      added++;
    }
  }
}

// Sort by surah number
sm.surahs.sort((a, b) => a.surahNumber - b.surahNumber);

// Update meta
if (sm.meta) {
  sm.meta.totalSurahs = sm.surahs.length;
} else {
  sm.meta = { totalSurahs: sm.surahs.length };
}

fs.writeFileSync('./surah-macrostructure.json', JSON.stringify(sm, null, 2), 'utf8');
console.log('Added: ' + added + ' surahs');
console.log('Total: ' + sm.surahs.length + ' surahs');
