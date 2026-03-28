/**
 * add-syntax-refs.cjs
 *
 * Adds wrightReference, wrightUrl, and crossReferences fields
 * to all syntax lesson chunk files (3.x and 4.x).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

const FILES = [
  'syntax-3-01-10.json',
  'syntax-3-11-20.json',
  'syntax-3-21-30.json',
  'syntax-3-31-38.json',
  'syntax-3-39-41.json',
  'syntax-3-42-44.json',
  'syntax-4-01-07.json',
  'syntax-4-08-13.json',
];

const WRIGHT_REFS = {
  "3.1": "Wright II §1-30", "3.2": "Wright II §81-100", "3.3": "Wright II §91-100",
  "3.4": "Wright II §101-110", "3.5": "Wright II §111-120", "3.6": "Wright II §185-200",
  "3.7": "Wright II §155-170", "3.8": "Wright II §201-210", "3.9": "Wright II §121-130",
  "3.10": "Wright II §131-135", "3.11": "Wright II §46-50", "3.12": "Wright II §51-55",
  "3.13": "Wright II §143-148", "3.14": "Wright II §175-184", "3.15": "Wright II §75-80",
  "3.16": "Wright II §155-175", "3.17": "Wright II §136-142", "3.18": "Wright II §131-135",
  "3.19": "Wright II §44-48", "3.20": "Wright II §105-108", "3.21": "Wright II §105-108",
  "3.22": "Wright II §56-65", "3.23": "Wright II §86-95", "3.24": "Wright II §66-70",
  "3.25": "Wright II §71-74", "3.26": "Wright II §71-74", "3.27": "Wright II §121-130",
  "3.28": "Wright II §185-195", "3.29": "Wright II §1-10", "3.30": "Wright II §1-10",
  "3.31": "Wright II §131-135", "3.32": "Wright II §147-154", "3.33": "Wright II §147-154",
  "3.34": "Wright II §155-160", "3.35": "Wright II §136-142", "3.36": "Wright II §46-50",
  "3.37": "Wright II §1-10", "3.38": "Wright II §143-148", "3.39": "Wright II §81-90",
  "3.40": "Wright II §55-60", "3.41": "Wright II §155-170", "3.42": "Wright I §400-405",
  "3.43": "Wright II §210-215", "3.44": "Wright II §210-215",
  "4.1": "Wright II §136-142", "4.2": "Wright II §31-40", "4.3": "Wright II §155-175",
  "4.4": "Wright II §1-31", "4.5": "Wright II §111-120", "4.6": "Wright II §220-226",
  "4.7": "Wright II §31-40", "4.8": "Wright II §31-40", "4.9": "Wright II §220-226",
  "4.10": "Wright II §185-200", "4.11": "Wright II §111-120", "4.12": "Wright II §155-175",
  "4.13": "Wright II §201-210", "4.14": "Wright II §155-165", "4.15": "Wright II §155-165",
};

const WRIGHT_URL_VOL2 = "https://archive.org/details/grammarofthearab02telerich";
const WRIGHT_URL_VOL1 = "https://archive.org/details/WrightsArabicGrammar1Of2";

const CROSS_REFS = {
  "3.1": ["2.17", "3.3", "3.5", "3.4"],
  "3.2": ["3.23", "3.39"],
  "3.3": ["2.27", "3.1"],
  "3.4": ["3.5", "3.20"],
  "3.5": ["3.4", "4.5"],
  "3.6": ["4.10", "3.8"],
  "3.7": ["2.19", "3.40"],
  "3.8": ["2.25", "4.13"],
  "3.9": ["2.15", "3.27"],
  "3.10": ["2.12", "2.18"],
  "3.11": ["3.36"],
  "3.13": ["3.38", "3.18"],
  "3.14": ["4.3"],
  "3.16": ["4.3", "4.14", "4.15"],
  "3.17": ["2.25", "4.5"],
  "3.18": ["2.15", "2.13", "3.9"],
  "3.27": ["3.9", "3.35"],
  "3.32": ["2.15", "3.33"],
  "3.38": ["3.13"],
  "3.39": ["3.2", "3.44"],
  "3.44": ["3.39", "3.43"],
  "4.3": ["3.16"],
  "4.4": ["2.6"],
  "4.5": ["3.5", "3.17"],
  "4.10": ["3.6"],
  "4.13": ["3.8"],
};

let totalLessons = 0;
let updatedLessons = 0;
let missingWright = [];

for (const filename of FILES) {
  const filepath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filepath, 'utf-8');
  const lessons = JSON.parse(raw);

  for (const lesson of lessons) {
    if (!lesson.id) continue;
    totalLessons++;

    const id = lesson.id;

    // Add Wright reference
    if (WRIGHT_REFS[id]) {
      lesson.wrightReference = WRIGHT_REFS[id];
      lesson.wrightUrl = id === "3.42" ? WRIGHT_URL_VOL1 : WRIGHT_URL_VOL2;
      updatedLessons++;
    } else {
      missingWright.push(id);
    }

    // Add cross-references (only if defined for this lesson)
    if (CROSS_REFS[id]) {
      lesson.crossReferences = CROSS_REFS[id];
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(lessons, null, 2) + '\n', 'utf-8');
  console.log(`Updated: ${filename} (${lessons.length} lessons)`);
}

console.log(`\nTotal lessons found: ${totalLessons}`);
console.log(`Lessons with Wright refs added: ${updatedLessons}`);
if (missingWright.length > 0) {
  console.log(`Lessons WITHOUT Wright ref mapping: ${missingWright.join(', ')}`);
} else {
  console.log('All lessons received Wright references.');
}

// Verify cross-references were added
let crossRefCount = 0;
for (const filename of FILES) {
  const filepath = path.join(DATA_DIR, filename);
  const lessons = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  for (const lesson of lessons) {
    if (lesson.crossReferences) crossRefCount++;
  }
}
console.log(`Lessons with cross-references: ${crossRefCount} (expected ${Object.keys(CROSS_REFS).length})`);
