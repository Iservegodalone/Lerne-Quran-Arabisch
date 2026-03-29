/**
 * fix-verb-rection.cjs
 * Renames the "prep" field to "preposition" in verb-rection.json entries
 * for schema consistency.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'src', 'data', 'verb-rection.json');

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let renamed = 0;

for (const entry of data.verbs) {
  if (!entry.rections) continue;
  for (const rec of entry.rections) {
    if ('prep' in rec && !('preposition' in rec)) {
      rec.preposition = rec.prep;
      delete rec.prep;
      renamed++;
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Done. Renamed "prep" -> "preposition" in ${renamed} rection entries.`);
