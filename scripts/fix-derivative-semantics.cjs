/**
 * fix-derivative-semantics.cjs
 *
 * Manual semantic fixes for derivative meanings that cannot be
 * determined algorithmically. Based on Lane's Lexicon entries.
 *
 * Each entry maps a vocalized form to its correct specific meaning.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function rd(s) {
  return s.replace(/[\u064B-\u065F\u0670\u0653\u0654\u0655\u0656\u0657\u0658\u06D6-\u06ED\u0610-\u061A\u0640\u06DF\u06E0\u06E5\u06E6]/g, '');
}

// ========== MANUAL SEMANTIC CORRECTIONS ==========
// Key: consonantal form (without diacritics) → specific German meaning
// These are based on Lane's Lexicon and Quranic usage

const SEMANTIC_FIXES = {
  // غ-م-م
  'الغمام': 'Wolken (Pl., bestimmt)',
  'غما': 'Kummer, Sorge (indef., Akk.)',
  'بغم': 'mit/in Kummer (indef., Gen.)',
  'الغم': 'der Kummer (bestimmt)',

  // ق-ص-ص
  'قصاص': 'Vergeltung, gleichwertige Bestrafung (indef.)',
  'القصص': 'die Erzaehlungen, der Bericht (bestimmt)',
  'قصصه': 'seine Geschichte (Akk.)',

  // ا-ن-ث
  'انثى': 'weiblich, Frau (f.sg.)',
  'الانثيين': 'die beiden Weiblichen (Dual, bestimmt)',
  'اناثا': 'weibliche Wesen (Pl., indef., Akk.)',
  'والانثى': 'und die Weibliche (f.sg., bestimmt)',
  'بالانثى': 'mit/in der Weiblichen (f.sg., bestimmt)',

  // ص-ي-ر
  'المصير': 'der Bestimmungsort, das Ziel (bestimmt)',
  'مصيرا': 'Bestimmungsort, Ziel (indef., Akk.)',
  'مصيركم': 'euer Bestimmungsort (Akk.)',

  // م-و-د-د / و-د-د
  'مودة': 'Zuneigung, Liebe (Substantiv f.)',

  // ي-ق-ن
  'اليقين': 'die Gewissheit (Masdar, bestimmt)',

  // ح-د-د
  'حدود': 'Grenzen, Bestimmungen (Pl.)',
  'الحديد': 'das Eisen (bestimmt)',
  'حديد': 'Eisen; scharf (m.)',

  // ث-و-ب
  'ثواب': 'Lohn, Belohnung (m.)',
  'ثوابا': 'Lohn, Belohnung (indef., Akk.)',

  // ف-ج-ر
  'الفجر': 'die Morgendaemmerung (bestimmt)',
  'تفجيرا': 'das Hervorsprudeln-Lassen (Masdar II, indef., Akk.)',

  // ذ-ل-ل
  'ذلة': 'Erniedrigung, Demut (Substantiv f.)',
  'الذل': 'die Niedrigkeit (bestimmt)',
  'الذلة': 'die Erniedrigung (Substantiv f., bestimmt)',

  // ط-ي-ر
  'الطير': 'die Voegel (Kollektiv, bestimmt)',
  'والطير': 'und die Voegel (Kollektiv, bestimmt)',
  'طيرا': 'Voegel (Kollektiv, indef., Akk.)',
  'طائر': 'Vogel; Omen (m.sg.)',

  // ق-م-ر
  'والقمر': 'und der Mond (bestimmt)',
  'القمر': 'der Mond (bestimmt)',

  // ب-و-ب
  'الباب': 'das Tor, die Tuer (bestimmt)',
  'ابواب': 'Tore, Tueren (Pl.)',
  'باب': 'Tor, Tuer (m.sg.)',

  // ب-ط-ن
  'بطون': 'Baeuche, Leiber (Pl.)',
  'بطونهم': 'ihre Baeuche (Pl., Gen.)',

  // ل-س-ن
  'لسان': 'Zunge, Sprache (m.)',
  'بلسانك': 'mit/in deiner Zunge/Sprache',
  'السنتهم': 'ihre Zungen (Pl., Akk.)',

  // ش-ج-ر
  'الشجرة': 'der Baum (Substantiv f., bestimmt)',
  'كشجرة': 'wie ein Baum (f., indef.)',
  'شجرة': 'Baum (Substantiv f., indef.)',

  // م-ر-ض
  'مرض': 'Krankheit (m.)',
  'مرضى': 'Kranke (Pl.)',
  'مريضا': 'krank (Adjektiv, m.sg., indef., Akk.)',

  // غ-ض-ب
  'بغضب': 'mit/in Zorn (indef., Gen.)',
  'غضب': 'Zorn (m.)',

  // ع-ر-ب
  'الاعراب': 'die Beduinen (Pl., bestimmt)',
  'عربيا': 'arabisch (Adjektiv, m.sg., indef., Akk.)',

  // ح-م-م
  'حميم': 'heisses Wasser; naher Vertrauter (m.sg.)',
  'الحميم': 'das heisse Wasser; der nahe Vertraute (bestimmt)',

  // ن-خ-ل
  'نخيل': 'Dattelpalmen (Kollektiv)',
  'النخل': 'die Dattelpalmen (Kollektiv, bestimmt)',
  'والنخل': 'und die Dattelpalmen (Kollektiv, bestimmt)',

  // ث-م-ر
  'الثمرات': 'die Fruechte (Pl. f., bestimmt)',
  'ثمره': 'seine Frucht (m.)',

  // ج-ن-د
  'جند': 'Heer, Truppe (Kollektiv)',
  'وجنوده': 'und seine Heere (Pl.)',

  // ر-ب-و
  'الربوا': 'der Zins, der Wucher (bestimmt)',

  // ح-ز-ب
  'الاحزاب': 'die Parteien, die Gruppen (Pl., bestimmt)',
  'حزب': 'Partei, Gruppe (m.)',

  // ف-ل-ك
  'الفلك': 'das Schiff / die Schiffe (bestimmt)',
  'فلك': 'Umlaufbahn (m.)',

  // ش-ه-ر
  'اشهر': 'Monate (Pl.)',
  'الشهر': 'der Monat (bestimmt)',
  'شهرين': 'zwei Monate (Dual, Gen.)',

  // س-ن-و
  'سنين': 'Jahre (Pl.)',
  'سنة': 'Jahr (f.sg.)',

  // ت-ر-ب
  'تراب': 'Erde, Staub (m.)',
  'ترابا': 'zu Erde/Staub (indef., Akk.)',

  // ن-ش-ر
  'نشورا': 'Auferstehung (Masdar, indef., Akk.)',
  'النشور': 'die Auferstehung (bestimmt)',

  // ع-م-ر
  'العمر': 'das Lebensalter (bestimmt)',

  // ر-ق-ب
  'رقبة': 'Nacken; Sklave/Person (f.sg.)',
  'الرقاب': 'die Nacken; die Sklaven (Pl., bestimmt)',
  'رقيب': 'Waechter, Aufseher (m.sg.)',

  // س-ن-ن
  'سنة': 'Verfahrensweise, Brauch (f.sg.)',
  'مسنون': 'geformt, gemodelt (Passiv-Partizip)',

  // ع-د-ل
  'بالعدل': 'mit/in Gerechtigkeit (bestimmt)',

  // ق-س-ط
  'بالقسط': 'mit/in Gerechtigkeit (bestimmt)',
  'المقسطين': 'die Gerechten (Partizip aktiv IV, Pl., bestimmt)',
  'اقسط': 'gerechter (Elativ)',

  // ف-ح-ش
  'فاحشة': 'Schandtat, Abscheulichkeit (Substantiv f.)',
  'الفاحشة': 'die Schandtat (Substantiv f., bestimmt)',

  // د-ر-ج
  'درجات': 'Stufen, Raenge (Pl. f.)',
  'درجة': 'Stufe, Rang (f.sg.)',

  // ل-ع-ب
  'ولعبا': 'und Spiel, Zeitvertreib (Masdar, indef., Akk.)',
  'لعب': 'Spiel, Zeitvertreib (Masdar)',

  // ف-ط-ر
  'فاطر': 'Schoepfer, Urheber (Partizip aktiv)',
};

// ========== APPLY FIXES ==========

let fixed = 0;

data.roots.forEach(root => {
  if (!root.keyDerivatives) return;

  root.keyDerivatives.forEach(kd => {
    const consonantal = rd(kd.form);
    // Try exact match, then with ٱل→ال normalization, then stripping ٱل
    const normalized = consonantal.replace(/^ٱل/, 'ال').replace(/^وٱل/, 'وال');
    const match = SEMANTIC_FIXES[consonantal] || SEMANTIC_FIXES[normalized];
    if (match) {
      if (kd.meaning !== match) {
        kd.meaning = match;
        fixed++;
      }
    }
  });
});

console.log(`Applied ${fixed} semantic fixes.`);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('File written.');
