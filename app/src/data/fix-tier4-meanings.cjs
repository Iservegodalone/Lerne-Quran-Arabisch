/**
 * fix-tier4-meanings.cjs
 *
 * Fills 200 null meanings in Tier 4 (ranks 301-500) of frequency-learning-path.json
 * using root-meanings.json as the source.
 *
 * Principles:
 * - Linguistic meanings only (no theological terms)
 * - Short German glosses, max ~60 chars, slash-separated
 * - Matches existing style: "Verderben", "gut/rein", "nuetzen/Nutzen"
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;
const FLP_PATH = path.join(DATA_DIR, 'frequency-learning-path.json');
const RM_PATH = path.join(DATA_DIR, 'root-meanings.json');

// Theological → Linguistic replacements
const REPLACEMENTS = [
  [/\bverehren\b/gi, 'dienen'],
  [/\banbeten\b/gi, 'dienen'],
  [/\bGebet\b/gi, 'Zuwendung'],
  [/\bGläubige[rn]?\b/g, 'Vertrauende'],
  [/\boffenbaren\b/gi, 'mitteilen'],
  [/\bOffenbarung\b/gi, 'Mitteilung'],
  [/\bGlauben\b/g, 'Vertrauen'],
  [/\bglauben\b/g, 'vertrauen'],
  [/\bSünde\b/gi, 'Verfehlung'],
  [/\bsündigen\b/gi, 'verfehlen'],
  [/\bGlaubensgemeinschaft\b/gi, 'Gemeinschaft'],
  [/\brechtgeleitet\b/gi, 'auf dem rechten Weg'],
  [/\bRechtleitung\b/gi, 'Wegweisung'],
  [/\bGottheit\b/gi, 'Gottheit'],  // keep as-is (linguistic)
  [/\bProphet\b/gi, 'Gesandter'],
  [/\bdemütig ergeben sein\b/gi, 'still ergeben stehen'],
  [/\bdemuetig ergeben sein\b/gi, 'still ergeben stehen'],
];

/**
 * Convert a full meaning from root-meanings.json into a concise German gloss.
 * Max ~60 chars, style: "verb/Nomen" or "Adjektiv/Verb"
 */
function shortenMeaning(fullMeaning, root) {
  if (!fullMeaning) return null;

  let m = fullMeaning;

  // Apply theological → linguistic replacements
  for (const [pattern, replacement] of REPLACEMENTS) {
    m = m.replace(pattern, replacement);
  }

  // Remove "Grundbedeutung:" prefixes
  m = m.replace(/Grundbedeutung:\s*/gi, '');
  m = m.replace(/Grundbedeutung des?\s*/gi, '');
  m = m.replace(/Grundbedeutung der\s*/gi, '');

  // Split on em-dash " — " and take the first part (the core meaning)
  if (m.includes(' — ')) {
    m = m.split(' — ')[0];
  }

  // Split on semicolons and take meaningful parts
  if (m.includes(';')) {
    const parts = m.split(';').map(p => p.trim()).filter(p => p.length > 0);
    // Take first 2 parts max, join with slash
    m = parts.slice(0, 2).join('; ');
  }

  // If still too long (>60 chars), take up to first comma-separated meaningful chunk
  if (m.length > 60) {
    const commaParts = m.split(',').map(p => p.trim());
    m = commaParts[0];
    // Add second part if still short enough
    if (commaParts.length > 1 && (m + '/' + commaParts[1]).length <= 60) {
      m = m + ', ' + commaParts[1];
    }
  }

  // Clean up: remove trailing periods, extra spaces
  m = m.replace(/\.\s*$/, '').trim();

  // If still too long, truncate at last word boundary before 60
  if (m.length > 60) {
    m = m.substring(0, 60).replace(/\s+\S*$/, '').trim();
  }

  return m || null;
}

// --- Main ---

const flpData = JSON.parse(fs.readFileSync(FLP_PATH, 'utf-8'));
const rmData = JSON.parse(fs.readFileSync(RM_PATH, 'utf-8'));

// Build a lookup map for root-meanings
const rootMeaningMap = new Map();
for (const entry of rmData.roots) {
  rootMeaningMap.set(entry.root, entry);
}

const tier4 = flpData.tiers[3]; // index 3 = Tier 4
let filledCount = 0;
let alreadyFilled = 0;
let notFound = 0;

for (const rootEntry of tier4.roots) {
  if (rootEntry.meaning !== null) {
    alreadyFilled++;
    continue;
  }

  const rmEntry = rootMeaningMap.get(rootEntry.root);
  if (!rmEntry || !rmEntry.meaning) {
    console.warn(`WARNING: No meaning found for root "${rootEntry.root}" (rank ${rootEntry.rank})`);
    notFound++;
    continue;
  }

  const shortMeaning = shortenMeaning(rmEntry.meaning, rootEntry.root);
  if (shortMeaning) {
    rootEntry.meaning = shortMeaning;
    filledCount++;
  } else {
    console.warn(`WARNING: Could not shorten meaning for root "${rootEntry.root}": ${rmEntry.meaning}`);
  }
}

// Write back
fs.writeFileSync(FLP_PATH, JSON.stringify(flpData, null, 2) + '\n', 'utf-8');

console.log(`\n=== Results ===`);
console.log(`Already filled: ${alreadyFilled}`);
console.log(`Newly filled:   ${filledCount}`);
console.log(`Not found:      ${notFound}`);
console.log(`Total in Tier 4: ${tier4.roots.length}`);

// Verify
const remainingNulls = tier4.roots.filter(r => r.meaning === null).length;
console.log(`\nRemaining nulls: ${remainingNulls}`);

if (remainingNulls === 0) {
  console.log('SUCCESS: All Tier 4 meanings are filled!');
} else {
  console.error(`FAIL: ${remainingNulls} entries still have null meanings`);
  tier4.roots.filter(r => r.meaning === null).forEach(r => {
    console.error(`  rank ${r.rank}: ${r.root}`);
  });
}
