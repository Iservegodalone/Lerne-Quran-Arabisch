/**
 * add-glossary-urls.cjs
 * Adds "externalUrl" field to each term in grammar-glossary.json
 * based on the arabic field of each term.
 */

const fs = require('fs');
const path = require('path');

const glossaryPath = path.join(__dirname, 'grammar-glossary.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf-8'));

const urlMap = {
  "إِعْرَاب": "https://en.wikipedia.org/wiki/%CA%BEI%CA%BFr%C4%81b",
  "فَاعِل": "https://en.wikipedia.org/wiki/Arabic_grammar#Verbal_sentences",
  "مَفْعُول بِهِ": "https://en.wikipedia.org/wiki/Arabic_grammar#Object",
  "مُبْتَدَأ": "https://en.wikipedia.org/wiki/Arabic_grammar#Nominal_sentences",
  "خَبَر": "https://en.wikipedia.org/wiki/Arabic_grammar#Nominal_sentences",
  "حَال": "https://en.wikipedia.org/wiki/%E1%B8%A4%C4%81l",
  "إِضَافَة": "https://en.wikipedia.org/wiki/Id%C4%81fa",
  "صَرْف": "https://en.wikipedia.org/wiki/Arabic_morphology",
  "جَذْر": "https://en.wikipedia.org/wiki/Arabic_root",
  "وَزْن": "https://en.wikipedia.org/wiki/Arabic_morphology#Patterns",
  "فِعْل": "https://en.wikipedia.org/wiki/Arabic_verbs",
  "اِسْم": "https://en.wikipedia.org/wiki/Arabic_nouns_and_adjectives",
  "حَرْف": "https://en.wikipedia.org/wiki/Arabic_grammar#Particles",
  "مَصْدَر": "https://en.wikipedia.org/wiki/Masdar",
  "نِسْبَة": "https://en.wikipedia.org/wiki/Nisba_(Arabic)",
  "جَمْع تَكْسِير": "https://en.wikipedia.org/wiki/Broken_plural",
  "مَمْنُوع مِنَ الصَّرْف": "https://en.wikipedia.org/wiki/Diptote",
  "تَاء مَرْبُوطَة": "https://en.wikipedia.org/wiki/T%C4%81%CA%BE_marb%C5%AB%E1%B9%ADa",
  "شَدَّة": "https://en.wikipedia.org/wiki/Shadda",
  "تَنْوِين": "https://en.wikipedia.org/wiki/Nunation",
  "رَسْم": "https://en.wikipedia.org/wiki/Rasm",
  "إِعْجَام": "https://en.wikipedia.org/wiki/I%CA%BFj%C4%81m",
  "تَشْكِيل": "https://en.wikipedia.org/wiki/Arabic_diacritics",
  "حُرُوف مُقَطَّعَة": "https://en.wikipedia.org/wiki/Muqatta%27at",
  "أَلِف وَصْل": "https://en.wikipedia.org/wiki/Hamzat_al-wasl"
};

const categoryFallback = {
  "syntax": "https://en.wikipedia.org/wiki/Arabic_grammar",
  "morphology": "https://en.wikipedia.org/wiki/Arabic_morphology",
  "phonology": "https://en.wikipedia.org/wiki/Arabic_diacritics",
  "script": "https://en.wikipedia.org/wiki/Arabic_script"
};

let mapped = 0;
let fallback = 0;

for (const term of glossary.terms) {
  if (urlMap[term.arabic]) {
    term.externalUrl = urlMap[term.arabic];
    mapped++;
  } else if (categoryFallback[term.category]) {
    term.externalUrl = categoryFallback[term.category];
    fallback++;
  } else {
    term.externalUrl = "https://en.wikipedia.org/wiki/Arabic_grammar";
    fallback++;
  }
}

fs.writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2) + '\n', 'utf-8');

console.log(`Done. ${glossary.terms.length} terms processed.`);
console.log(`  ${mapped} terms matched exact URL mapping.`);
console.log(`  ${fallback} terms used category fallback URL.`);
