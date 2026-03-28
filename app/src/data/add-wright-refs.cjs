const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'morphology-lessons.json');

const wrightRefs = {
  "2.1":  { ref: "Wright I §178-180", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.2":  { ref: "Wright I §181-225", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.3":  { ref: "Wright I §72-81", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.4":  { ref: "Wright I §82-94", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.5":  { ref: "Wright I §95-97", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.6":  { ref: "Wright I §98-105, II §1-31", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.7":  { ref: "Wright I §106-111", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.8":  { ref: "Wright I §112-114", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.9":  { ref: "Wright II §32-33", url: "https://archive.org/details/grammarofthearab02telerich" },
  "2.10": { ref: "Wright I §115-177", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.11": { ref: "Wright I §231-275", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.12": { ref: "Wright I §289-294", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.13": { ref: "Wright I §295-334", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.14": { ref: "Wright I §335-340", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.15": { ref: "Wright I §280-288, II §147-154", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.16": { ref: "Wright I §276-279", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.17": { ref: "Wright I §341-365", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.18": { ref: "Wright II §227-268", url: "https://archive.org/details/grammarofthearab02telerich" },
  "2.19": { ref: "Wright I §366-388, II §55-80", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.20": { ref: "Wright I §389-393", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.21": { ref: "Wright I §231-275", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.22": { ref: "Wright I §225-230", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.23": { ref: "Wright I §394-399", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.24": { ref: "Wright I §1-20", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.25": { ref: "Wright I §100-105", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.26": { ref: "Wright I §106-111", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.27": { ref: "Wright I §269-275, II §81-90", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.28": { ref: "Wright I §275a-275d", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.29": { ref: "Wright I §231-245", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.30": { ref: "Wright I §246-260", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.31": { ref: "Wright I §261-265", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.32": { ref: "Wright I §266-268", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.33": { ref: "Wright I §269-273", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.34": { ref: "Wright I §72-78", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.35": { ref: "Wright I §170-177", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.36": { ref: "Wright I §142-155", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.37": { ref: "Wright I §156-169", url: "https://archive.org/details/WrightsArabicGrammar1Of2" },
  "2.38": { ref: "Wright I §115-120", url: "https://archive.org/details/WrightsArabicGrammar1Of2" }
};

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

let updated = 0;

for (const lesson of data.lessons) {
  const entry = wrightRefs[lesson.id];
  if (entry) {
    lesson.wrightReference = entry.ref;
    lesson.wrightUrl = entry.url;
    updated++;
  } else {
    console.warn(`WARNING: No Wright reference for lesson ${lesson.id}`);
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`Done. Updated ${updated} of ${data.lessons.length} lessons.`);
