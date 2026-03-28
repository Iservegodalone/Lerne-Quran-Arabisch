/**
 * add-verify-urls-ambiguities.cjs
 *
 * Adds verifyUrl to every item in ambiguities.json that has a location field
 * but no verifyUrl, AND to every nested option object that lacks a verifyUrl
 * (inheriting the parent entry's location).
 *
 * URL format: https://corpus.quran.com/wordbyword.jsp?chapter={SURAH}&verse={VERSE}
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ambiguities.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function buildUrl(location) {
  const parts = location.split(':');
  const surah = parts[0];
  const verse = parts[1];
  return `https://corpus.quran.com/wordbyword.jsp?chapter=${surah}&verse=${verse}`;
}

let added = 0;

function processEntries(entries) {
  for (const entry of entries) {
    // Add to entry itself if missing
    if (entry.location && !entry.verifyUrl) {
      entry.verifyUrl = buildUrl(entry.location);
      added++;
    }

    // Add to each option if missing (inherit parent location)
    if (entry.options && Array.isArray(entry.options) && entry.location) {
      for (const option of entry.options) {
        if (!option.verifyUrl) {
          option.verifyUrl = buildUrl(entry.location);
          added++;
        }
      }
    }
  }
}

if (data.entries) processEntries(data.entries);
if (data._referenceEntries) processEntries(data._referenceEntries);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Done. Added ${added} verifyUrls.`);
console.log(`  entries: ${data.entries.length}`);
console.log(`  _referenceEntries: ${data._referenceEntries.length}`);

// Final verification
let totalVerifyUrls = 0;
function countUrls(entries) {
  for (const entry of entries) {
    if (entry.verifyUrl) totalVerifyUrls++;
    if (entry.options) {
      for (const opt of entry.options) {
        if (opt.verifyUrl) totalVerifyUrls++;
      }
    }
  }
}
countUrls(data.entries);
countUrls(data._referenceEntries);
console.log(`Total verifyUrls now: ${totalVerifyUrls}`);
