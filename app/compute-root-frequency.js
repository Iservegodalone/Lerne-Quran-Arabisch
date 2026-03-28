const fs = require('fs');
const path = require('path');

// Transliteration mapping
const translitMap = {
  'ء': 'ʾ',
  'ب': 'b',
  'ت': 't',
  'ث': 'ṯ',
  'ج': 'ǧ',
  'ح': 'ḥ',
  'خ': 'ḫ',
  'د': 'd',
  'ذ': 'ḏ',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'š',
  'ص': 'ṣ',
  'ض': 'ḍ',
  'ط': 'ṭ',
  'ظ': 'ẓ',
  'ع': 'ʿ',
  'غ': 'ġ',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ا': 'ā'
};

function transliterate(rootSpaced) {
  // rootSpaced is like "ك ت ب"
  const letters = rootSpaced.split(' ');
  return letters.map(ch => translitMap[ch] || ch).join('-');
}

function rootArabic(rootSpaced) {
  // Remove spaces to get concatenated Arabic root
  return rootSpaced.split(' ').join('');
}

// Read the morphology DB
const inputPath = path.join(__dirname, 'src', 'data', 'quran-morphology-db.json');
const outputPath = path.join(__dirname, 'src', 'data', 'root-frequency.json');

console.log('Reading morphology database...');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const words = data.words;
const totalWords = words.length;

console.log(`Total words: ${totalWords}`);

// Count root frequencies
const rootCounts = {};
let wordsWithRoot = 0;

for (const word of words) {
  if (word.r) {
    wordsWithRoot++;
    rootCounts[word.r] = (rootCounts[word.r] || 0) + 1;
  }
}

console.log(`Words with roots: ${wordsWithRoot}`);
console.log(`Unique roots: ${Object.keys(rootCounts).length}`);

// Sort by frequency descending
const sorted = Object.entries(rootCounts)
  .sort((a, b) => b[1] - a[1]);

const totalRoots = sorted.length;

// Take top 300
const top300 = sorted.slice(0, 300).map(([root, count], index) => ({
  rank: index + 1,
  root: root,
  rootArabic: rootArabic(root),
  transliteration: transliterate(root),
  count: count,
  percentage: ((count / wordsWithRoot) * 100).toFixed(2) + '%'
}));

const output = {
  meta: {
    description: "Frequenzsortierte Wurzelliste aus dem quranischen Korpus",
    totalRoots: totalRoots,
    totalWords: totalWords,
    wordsWithRoot: wordsWithRoot,
    top: 300
  },
  roots: top300
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Output written to ${outputPath}`);
console.log(`Top 10 roots:`);
top300.slice(0, 10).forEach(r => {
  console.log(`  ${r.rank}. ${r.rootArabic} (${r.transliteration}) - ${r.count} (${r.percentage})`);
});
