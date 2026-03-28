/**
 * Generates quran-rasm.json from quran-uthmani.json.
 *
 * Process:
 *   1. Load Uthmani text (preserves Uthmani orthographic deviations like الصلوة)
 *   2. Strip all tashkil (vowel marks, shadda, sukun, tanwin, madda marks)
 *   3. Strip i'jam (diacritical dots) — maps dotted letters to skeletal forms
 *   4. Strip hamza marks (did not exist in early manuscripts)
 *   5. Strip Uthmani-specific markers (small high meem, small waw, etc.)
 *   6. Write clean rasm JSON
 *
 * Run: node generate-rasm.cjs
 */
const fs = require('fs');
const path = require('path');

// --- IJAM_MAP: identical to arabic.js IJAM_MAP ---
const IJAM_MAP = {
  // Dot stripping
  '\u0628': '\u066E', // ب → ٮ
  '\u062A': '\u066E', // ت → ٮ
  '\u062B': '\u066E', // ث → ٮ
  '\u0646': '\u066E', // ن → ٮ
  '\u062C': '\u062D', // ج → ح
  '\u062E': '\u062D', // خ → ح
  '\u0630': '\u062F', // ذ → د
  '\u0632': '\u0631', // ز → ر
  '\u0634': '\u0633', // ش → س
  '\u0636': '\u0635', // ض → ص
  '\u0638': '\u0637', // ظ → ط
  '\u063A': '\u0639', // غ → ع
  '\u0641': '\u06A1', // ف → ڡ
  '\u0642': '\u06A1', // ق → ڡ (in early rasm fa and qaf were identical)
  '\u064A': '\u0649', // ي → ى
  // Hamza stripping
  '\u0621': '',        // ء → remove
  '\u0623': '\u0627',  // أ → ا
  '\u0625': '\u0627',  // إ → ا
  '\u0624': '\u0648',  // ؤ → و
  '\u0626': '\u0649',  // ئ → ى
  '\u0622': '\u0627',  // آ → ا
};

/**
 * Strip all tashkil and Uthmani notation marks.
 * Ranges covered:
 *   U+064B-U+0652  Fathatan through Sukun
 *   U+0610-U+061A  Quranic annotation signs
 *   U+0656-U+065F  Additional tashkil
 *   U+0670         Alif Khanjariyya (superscript alif)
 *   U+06D6-U+06ED  Quranic marks (sajda, pause, etc.)
 *   U+0615-U+061B  Additional signs
 *   U+06E5-U+06E6  Small waw/ya
 *   U+0640         Tatweel/kashida
 *   U+08F0-U+08FF  Extended Arabic marks
 *   U+FE70-U+FE7F  Arabic presentation forms (rare)
 *
 * Also strips: small high meem (U+06E2), empty centre low stop (U+06EA),
 * and the Tanzil-specific markers like @ and ۟ (U+06DF).
 */
function stripAllDiacritics(text) {
  return text
    // Standard tashkil: fathatan through sukun + madda/hamza combining marks
    .replace(/[\u064B-\u0655]/g, '')
    // Alif Khanjariyya (superscript alif)
    .replace(/\u0670/g, '')
    // Extended tashkil marks
    .replace(/[\u0656-\u065F]/g, '')
    // Quranic annotation signs (U+0610-U+061A)
    .replace(/[\u0610-\u061A]/g, '')
    // Quranic stop/pause marks (U+06D6-U+06ED)
    .replace(/[\u06D6-\u06ED]/g, '')
    // Small waw/ya (U+06E5-U+06E6)
    .replace(/[\u06E5-\u06E6]/g, '')
    // Tatweel
    .replace(/\u0640/g, '')
    // Tanzil-specific: small high rounded zero (U+06DF)
    .replace(/\u06DF/g, '')
    // Tanzil marker @ (used for small high meem in some encodings)
    .replace(/@/g, '')
    // Hamzat wasl marker (U+0671 Alif Wasla → plain Alif)
    .replace(/\u0671/g, '\u0627')
    // Any remaining combining marks in Arabic Extended-A
    .replace(/[\u08D3-\u08FF]/g, '');
}

/**
 * Apply I'jam map to strip dots and hamza from letters.
 */
function stripIjam(text) {
  let result = '';
  for (const char of text) {
    result += IJAM_MAP[char] !== undefined ? IJAM_MAP[char] : char;
  }
  return result;
}

/**
 * Full rasm conversion: diacritics → dots → clean.
 */
function toRasm(text) {
  const noDiacritics = stripAllDiacritics(text);
  const noIjam = stripIjam(noDiacritics);
  // Remove any leftover zero-width or invisible characters
  return noIjam.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '').trim();
}

// --- Main ---
console.log('Loading quran-uthmani.json...');
const uthmaniPath = path.join(__dirname, 'quran-uthmani.json');
const uthmani = JSON.parse(fs.readFileSync(uthmaniPath, 'utf8'));

console.log(`Processing ${uthmani.surahs.length} surahs...`);

const rasm = {
  surahs: uthmani.surahs.map(surah => ({
    number: surah.number,
    verses: surah.verses.map(verse => ({
      number: verse.number,
      text: toRasm(verse.text),
    })),
  })),
};

// Verify
let totalVerses = 0;
for (const s of rasm.surahs) {
  totalVerses += s.verses.length;
}
console.log(`Total surahs: ${rasm.surahs.length}`);
console.log(`Total verses: ${totalVerses}`);

// Spot-check: Surah 1:1
const fatiha1 = rasm.surahs[0].verses[0].text;
console.log(`Surah 1:1 rasm: ${fatiha1}`);

// Spot-check: Surah 2:3 — should have الصلوة (with waw, not alif)
const baqara3 = rasm.surahs[1].verses[2].text;
console.log(`Surah 2:3 rasm: ${baqara3}`);
const hasSalawat = baqara3.includes('\u0635\u0644\u0648') || baqara3.includes('صلو');
console.log(`Surah 2:3 contains صلو (salawat with waw): ${hasSalawat}`);

// Spot-check: no dotted letters should remain
const allText = rasm.surahs.map(s => s.verses.map(v => v.text).join(' ')).join(' ');
const dottedLetters = ['\u0628','\u062A','\u062B','\u0646','\u062C','\u062E','\u0630','\u0632','\u0634','\u0636','\u0638','\u063A','\u0641','\u0642','\u064A'];
for (const letter of dottedLetters) {
  const count = (allText.match(new RegExp(letter, 'g')) || []).length;
  if (count > 0) {
    console.warn(`WARNING: Dotted letter ${letter} (U+${letter.charCodeAt(0).toString(16).toUpperCase()}) found ${count} times!`);
  }
}
// Check hamza remnants
const hamzaChars = ['\u0621','\u0623','\u0625','\u0624','\u0626','\u0622'];
for (const h of hamzaChars) {
  const count = (allText.match(new RegExp(h, 'g')) || []).length;
  if (count > 0) {
    console.warn(`WARNING: Hamza ${h} (U+${h.charCodeAt(0).toString(16).toUpperCase()}) found ${count} times!`);
  }
}
console.log('Verification complete.');

// Write output
const outPath = path.join(__dirname, 'quran-rasm.json');
fs.writeFileSync(outPath, JSON.stringify(rasm, null, 2), 'utf8');
console.log(`Written to ${outPath}`);
console.log('Done.');
