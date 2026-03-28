/**
 * add-verify-urls.cjs
 * Adds "verifyUrl" to exercises in syntax-exercises.json and irab-exercises-extension.json.
 * Adds "externalSources" to root-meanings.json meta.
 */

const fs = require('fs');
const path = require('path');

// --- 1) syntax-exercises.json ---
const syntaxPath = path.join(__dirname, 'syntax-exercises.json');
const syntax = JSON.parse(fs.readFileSync(syntaxPath, 'utf-8'));

let syntaxCount = 0;
for (const exercise of syntax.exercises) {
  const surah = exercise.verse?.surah;
  const ayah = exercise.verse?.ayah;
  if (surah && ayah) {
    exercise.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${surah}&verse=${ayah}`;
    syntaxCount++;
  }
}

fs.writeFileSync(syntaxPath, JSON.stringify(syntax, null, 2) + '\n', 'utf-8');
console.log(`syntax-exercises.json: ${syntaxCount} exercises got verifyUrl.`);

// --- 2) irab-exercises-extension.json ---
const irabPath = path.join(__dirname, 'irab-exercises-extension.json');
const irab = JSON.parse(fs.readFileSync(irabPath, 'utf-8'));

let irabCount = 0;
for (const entry of irab) {
  if (entry.ref) {
    const parts = entry.ref.split(':');
    if (parts.length === 2) {
      const surah = parseInt(parts[0], 10);
      const ayah = parseInt(parts[1], 10);
      entry.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${surah}&verse=${ayah}`;
      irabCount++;
    }
  }
}

fs.writeFileSync(irabPath, JSON.stringify(irab, null, 2) + '\n', 'utf-8');
console.log(`irab-exercises-extension.json: ${irabCount} entries got verifyUrl.`);

// --- 3) root-meanings.json ---
const rootPath = path.join(__dirname, 'root-meanings.json');
const roots = JSON.parse(fs.readFileSync(rootPath, 'utf-8'));

roots.meta.externalSources = {
  lanesLexicon: "https://ejtaal.net/aa/",
  lisanAlArab: "https://www.lisaan.net/",
  quranCorpus: "https://corpus.quran.com/qurandictionary.jsp",
  note: "Lane's Lexicon ist die primaere Referenz fuer Wurzelbedeutungen. Lisan al-Arab dient als arabisch-arabische Gegenquelle."
};

fs.writeFileSync(rootPath, JSON.stringify(roots, null, 2) + '\n', 'utf-8');
console.log(`root-meanings.json: externalSources added to meta.`);

console.log('\nAll done.');
