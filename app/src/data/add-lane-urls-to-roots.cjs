/**
 * add-lane-urls-to-roots.cjs
 *
 * Task 1: Adds lanesUrl and corpusUrl from lanes-lexicon-urls.json
 * to each root entry in root-meanings.json.
 *
 * Matching: normalizes root notation (removes dashes, spaces) before comparison.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

const rootMeaningsPath = path.join(BASE_DIR, 'root-meanings.json');
const lanesUrlsPath = path.join(BASE_DIR, 'lanes-lexicon-urls.json');

const rootMeanings = JSON.parse(fs.readFileSync(rootMeaningsPath, 'utf8'));
const lanesUrls = JSON.parse(fs.readFileSync(lanesUrlsPath, 'utf8'));

// Build a lookup map from lanes-lexicon-urls.json roots
// Normalize by removing dashes, spaces, and any other separators
function normalizeRoot(r) {
  return r.replace(/[-\s\u200c\u200d]/g, '');
}

const lanesRoots = lanesUrls.frequentRootsWithLaneReferences.roots;
const lookup = new Map();

for (const entry of lanesRoots) {
  const key = normalizeRoot(entry.root);
  lookup.set(key, {
    lanesUrl: entry.lanesUrl,
    corpusUrl: entry.corpusUrl
  });
}

let matched = 0;
let unmatched = 0;

for (const root of rootMeanings.roots) {
  const key = normalizeRoot(root.root);
  const urls = lookup.get(key);
  if (urls) {
    root.lanesUrl = urls.lanesUrl;
    root.corpusUrl = urls.corpusUrl;
    matched++;
  } else {
    unmatched++;
  }
}

fs.writeFileSync(rootMeaningsPath, JSON.stringify(rootMeanings, null, 2), 'utf8');

console.log(`root-meanings.json: ${matched} roots got lanesUrl + corpusUrl, ${unmatched} unmatched.`);
