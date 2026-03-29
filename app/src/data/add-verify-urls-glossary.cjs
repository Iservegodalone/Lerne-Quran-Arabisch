/**
 * add-verify-urls-glossary.cjs
 *
 * Adds verifyUrl fields to grammar-glossary.json terms that contain
 * explicit Quran references or well-known Quranic examples in their
 * definitions.
 *
 * POLICY: Only adds a verifyUrl when the definition contains a specific
 * Arabic phrase or reference that can be unambiguously mapped to a Quran
 * verse. Does NOT fabricate references for abstract grammatical concepts.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://corpus.quran.com/wordbyword.jsp';

function buildUrl(chapter, verse) {
  return `${BASE_URL}?chapter=${chapter}&verse=${verse}`;
}

/**
 * Maps from term transliteration (or arabic) to a specific Quran verse
 * that the definition explicitly references or exemplifies.
 *
 * Each mapping includes a short justification referencing what the
 * definition actually says.
 */
const EXPLICIT_MAPPINGS = {
  // Definition says: "am Anfang von 29 Suren stehen (z.B. الم, حم, يس, ق)"
  // الم appears at 2:1
  'ḥurūf muqaṭṭaʿa': { chapter: 2, verse: 1, reason: 'Definition cites الم as example — Quran 2:1' },

  // Definition says: "Erscheint in häufigen Wörtern wie ... رَحْمٰن (rahman)"
  // رَحْمٰن with dagger-alif appears in 1:3 (الرَّحْمٰنِ الرَّحِيمِ)
  'alif khanjariyya': { chapter: 1, verse: 3, reason: 'Definition cites رَحْمٰن as example — Quran 1:3' },

  // Definition says: "Beispiel: زَلْزَلَ (zalzala, erschuettern) von der Wurzel z-l-z-l"
  // This root appears prominently in Quran 99:1 (إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا)
  'fiʿl rubāʿiyy': { chapter: 99, verse: 1, reason: 'Definition cites زَلْزَلَ as example — Quran 99:1' },

  // Definition says: "Beispiel: مَسْجِد (masjid, Ort der Niederwerfung) von der Wurzel s-j-d"
  // مَسْجِد appears in Quran 17:1 (الْمَسْجِدِ الْحَرَامِ ... الْمَسْجِدِ الْأَقْصَى)
  'ism al-makān': { chapter: 17, verse: 1, reason: 'Definition cites مَسْجِد as example — Quran 17:1' },

  // Definition says: "Beispiel: مَدَّ (madda, ausstrecken, Wurzel m-d-d)"
  // This root appears in Quran 13:3 (وَهُوَ الَّذِي مَدَّ الْأَرْضَ)
  'muḍaʿʿaf': { chapter: 13, verse: 3, reason: 'Definition cites مَدَّ as example — Quran 13:3' },

  // Definition says: "Erscheint im Artikel (ال), im Imperativ von Form I..."
  // and mentions "bi-smi" as example. بِسْمِ = Quran 1:1
  'alif waṣl': { chapter: 1, verse: 1, reason: 'Definition cites bi-smi as example — Quran 1:1' },

  // Definition says: "Erscheint in Wörtern wie هُدًى (hudan), مُوسَى (Musa), عَلَى (ala)"
  // هُدًى appears in Quran 2:2 (ذٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ)
  'alif maqṣūra': { chapter: 2, verse: 2, reason: 'Definition cites هُدًى as example — Quran 2:2' },

  // Definition says: "Beispiel: يَدَانِ (zwei Hände, Nominativ), يَدَيْنِ"
  // يَدَاهُ appears in Quran 5:64 (بَلْ يَدَاهُ مَبْسُوطَتَانِ) — dual form
  'muthannā': { chapter: 5, verse: 64, reason: 'Definition cites يَدَانِ as example — dual in Quran 5:64' },

  // Definition mentions "Im Quran extrem häufig" and "akbar"
  // أَكْبَرُ appears in Quran 29:45 (وَلَذِكْرُ اللَّهِ أَكْبَرُ)
  'afʿal at-tafḍīl': { chapter: 29, verse: 45, reason: 'Definition cites akbar as example — Quran 29:45' },
};

// ── Main ──────────────────────────────────────────────────────────────

const filePath = path.join(__dirname, 'grammar-glossary.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let added = 0;
let skipped = 0;
let noMapping = 0;

for (const term of data.terms) {
  if (term.verifyUrl) {
    skipped++;
    continue;
  }

  const mapping = EXPLICIT_MAPPINGS[term.transliteration];
  if (mapping) {
    term.verifyUrl = buildUrl(mapping.chapter, mapping.verse);
    added++;
    console.log(`  + ${term.transliteration.padEnd(25)} → ${mapping.chapter}:${mapping.verse}  (${mapping.reason})`);
  } else {
    noMapping++;
  }
}

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log('');
console.log(`Terms total:      ${data.terms.length}`);
console.log(`verifyUrl added:  ${added}`);
console.log(`Already had one:  ${skipped}`);
console.log(`No mapping:       ${noMapping} (abstract concepts without explicit Quran verse reference)`);
