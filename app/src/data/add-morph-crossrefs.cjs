const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'morphology-lessons.json');

const crossRefMap = {
  "2.7":  ["2.26", "3.2"],
  "2.8":  ["2.6"],
  "2.11": ["2.29", "2.30", "2.31", "2.28"],
  "2.12": ["3.10"],
  "2.13": ["2.15", "3.18"],
  "2.15": ["2.13", "3.18", "3.32", "3.33"],
  "2.17": ["3.1"],
  "2.19": ["3.7", "3.40"],
  "2.25": ["3.8", "3.17"],
  "2.27": ["3.3", "3.9", "3.10", "3.18"]
};

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

let modified = 0;

for (const lesson of data.lessons) {
  if (crossRefMap[lesson.id]) {
    lesson.crossReferences = crossRefMap[lesson.id];
    modified++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`Done. Modified ${modified} lessons out of ${data.lessons.length} total.`);
console.log('Cross-references added for:', Object.keys(crossRefMap).join(', '));
