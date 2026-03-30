/**
 * fix-machender-and-voice.cjs
 *
 * Fixes all 40 "Machender" derivative entries in root-meanings.json:
 * - Replaces mechanical "[root]-Machender (Partizip aktiv IV)" with correct German
 * - Corrects voice misidentification (passive labeled as active)
 * - Corrects form misidentification (VIII, IX, VII labeled as IV)
 * - Fixes non-participle forms wrongly labeled as participles
 *
 * Based on Lane's Lexicon and Quranic Arabic Corpus analysis.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function stripDiacritics(s) {
  return s.replace(/[\u064B-\u065F\u0670\u0653\u0654\u0655\u0656\u0657\u0658\u06D6-\u06ED\u0610-\u061A\u0640\u06DF\u06E0\u06E5\u06E6]/g, '');
}

// ========== CORRECTIONS ==========
// Each: consonantal form → { meaning, note (corrected grammatical label) }
const FIXES = {
  // ح و ط — مُحِيطٌ is correct Form IV active participle of أَحَاطَ
  'محيط': { meaning: 'umfassend, allumfassend (Partizip aktiv IV)' },

  // ر ج و — مُرْجَوْنَ is PASSIVE participle Form IV (أُرْجِئَ)
  'مرجون': { meaning: 'die Zurückgestellten, Aufgeschobenen (Partizip passiv IV)' },

  // ع ج ز — بِمُعْجِزِينَ is Form IV active participle of أَعْجَزَ
  'بمعجزين': { meaning: 'sich Entziehende, die (Gottes Zugriff) entkommen Koennende (Partizip aktiv IV, m.pl., Gen.)' },

  // ع ج ز — مُعَاجِزِينَ is Form III active participle (مُفَاعِل)
  'معجزين': { meaning: 'die sich zu entziehen Suchenden (Partizip aktiv IV, m.pl.)' },

  // ع ج ز — مُعْجِزِي is Form IV active participle construct
  'معجزى': { meaning: 'sich Entziehende (von) (Partizip aktiv IV, Idafa-Konstrukt)' },

  // ح ض ر — مُحْضَرُونَ is PASSIVE participle Form IV (أُحْضِرَ)
  'محضرون': { meaning: 'die Vorgeführten, Herbeigebrachten (Partizip passiv IV, m.pl.)' },

  // س ر ف — مُسْرِفٌ is correct Form IV active participle
  'مسرف': { meaning: 'der Maßlose, Verschwender (Partizip aktiv IV)' },

  // ح ص ن — مُحْصَنَات is PASSIVE participle Form IV (أُحْصِنَتْ)
  'محصنت': { meaning: 'die Geschützten, die keuschen Frauen (Partizip passiv IV, f.pl.)' },

  // ن ق م — مُنتَقِمُونَ is Form VIII active participle (اِنْتَقَمَ)
  'منتقمون': { meaning: 'Vergeltung Uebende (Partizip aktiv VIII, m.pl.)' },

  // ح ر ر — مُحَرَّرًا is PASSIVE participle Form II (حَرَّرَ)
  'محررا': { meaning: 'ein Freigelassener, Befreiter (Partizip passiv II, Akk.)' },

  // ل و م — مُلِيمٌ is Form IV active participle (أَلَامَ = sich Tadel zuziehen)
  'مليم': { meaning: 'sich Tadel zuziehend, tadelswuerdig (Partizip aktiv IV)' },

  // ر س و — مُرْسَاهَا is Ism Makan/Zaman Form IV (أَرْسَى)
  'مرسىها': { meaning: 'ihr Verankerungsort, ihr festgesetzter Zeitpunkt (Ism Makan/Zaman IV)' },

  // ش ف ق — مُشْفِقِينَ is correct Form IV active participle
  'مشفقين': { meaning: 'die Besorgten, Aengstlichen (Partizip aktiv IV, m.pl., Gen./Akk.)' },

  // ش ف ق — مُشْفِقُونَ is correct Form IV active participle
  'مشفقون': { meaning: 'die Besorgten, Aengstlichen (Partizip aktiv IV, m.pl., Nom.)' },

  // س و د — مُسْوَدًّا is Form IX participle (اِسْوَدَّ = schwarz werden)
  'مسودا': { meaning: 'schwarz geworden, sich schwarz verfaerbend (Partizip IX)' },

  // خ ي ل — مُخْتَال is Form VIII active participle (اِخْتَالَ = stolzieren)
  'مختال': { meaning: 'der Hochmutige, Eingebildete, Stolzierende (Partizip aktiv VIII)' },

  // و ه ن — مُوهِنُ is correct Form IV active participle (أَوْهَنَ)
  'موهن': { meaning: 'der Schwaecher, Entkraefter (Partizip aktiv IV)' },

  // خ ض ر — مُخْضَرَّة is Form IX participle (اِخْضَرَّ = gruen werden)
  'مخضره': { meaning: 'ergruent, gruen geworden (Partizip IX, f.)' },

  // م ك ث — مُكْث is a Masdar (Verbalsubstantiv), NOT a participle
  'مكث': { meaning: 'Verweilen, langsames Lesen/Rezitieren (Masdar)' },

  // ل ح د — مُلْتَحَد is Form VIII Ism Makan (اِلْتَحَدَ)
  'ملتحدا': { meaning: 'Zufluchtsort, Schutzort (Ism Makan VIII, Akk.)' },

  // ز ج ر — مُزْدَجَر is Form VIII Ism/Masdar (اِزْدَجَرَ)
  'مزدجر': { meaning: 'Warnung, Zurechtweisung, Abschreckung (Masdar/Ism VIII)' },

  // ص ف ر — مُصْفَرًّا is Form IX participle (اِصْفَرَّ = gelb werden)
  'مصفرا': { meaning: 'gelb geworden, vergilbt (Partizip IX, Akk.)' },

  // ر ف ق — مُرْتَفَق is Form VIII Ism Makan (اِرْتَفَقَ)
  'مرتفقا': { meaning: 'Ruheplatz, Stuetzplatz, Anlehnung (Ism Makan VIII, Akk.)' },

  // ب ل س — مُبْلِسُونَ is correct Form IV active participle (أَبْلَسَ)
  'مبلسون': { meaning: 'die Verzweifelten, Hoffnungslosen (Partizip aktiv IV, m.pl.)' },

  // م ض ي — مُضِيًّا is Form IV active participle (أَمْضَى)
  'مضيا': { meaning: 'voruebergehend, weitergehend (Partizip aktiv IV, Akk.)' },

  // ص ر خ — بِمُصْرِخِكُمْ is Form IV active participle (أَصْرَخَ)
  'بمصرخكم': { meaning: 'euer Hilferufer, der euch zu Hilfe Eilende (Partizip aktiv IV, m., Gen.)' },

  // ص ر خ — بِمُصْرِخِيَّ is Form IV active participle
  'بمصرخى': { meaning: 'mein Hilferufer, der mir zu Hilfe Eilende (Partizip aktiv IV, m., Gen.)' },

  // غ س ل — مُغْتَسَل is Form VIII Ism Makan (اِغْتَسَلَ)
  'مغتسل': { meaning: 'Waschplatz, Badeort (Ism Makan VIII)' },

  // م ز ق — مُمَزَّق is PASSIVE participle Form II (مَزَّقَ)
  'ممزق': { meaning: 'zerrissen, zerstueckelt (Partizip passiv II)' },

  // ح ل ق — مُحَلِّقِينَ is Form II active participle (حَلَّقَ)
  'محلقين': { meaning: 'die (ihr Haar) Scherenden, Kahlrasierenden (Partizip aktiv II, m.pl.)' },

  // ر د ف — مُرْدِفِينَ is correct Form IV active participle (أَرْدَفَ)
  'مردفين': { meaning: 'einander folgend, in Wellen kommend (Partizip aktiv IV, m.pl.)' },

  // ه ط ع — مُهْطِعِينَ is correct Form IV active participle (أَهْطَعَ)
  'مهطعين': { meaning: 'eilend hinstrebend, mit vorgestrecktem Hals laufend (Partizip aktiv IV, m.pl.)' },

  // م ض غ — مُضْغَة is a NOUN (Ism), NOT a participle
  'مضغه': { meaning: 'Klumpen (Fleisch), Kaustueck (Ism/Nomen, f.)' },

  // ز ح ز ح — بِمُزَحْزِحِهِ is Form I quadrilateral active participle (زَحْزَحَ)
  'بمزحزحه': { meaning: 'sein Entfernender, sein Bewahrer (Partizip aktiv I-q, m., Gen.)' },

  // ق ن ع — مُقْنِعِي is Form IV active participle (أَقْنَعَ = den Kopf erheben)
  'مقنعى': { meaning: 'die ihre Koepfe Emporhebenden, Aufblickenden (Partizip aktiv IV, Idafa-Konstrukt)' },

  // ك ب ب — مُكِبًّا is Form IV active participle (أَكَبَّ = kopfueber fallen)
  'مكبا': { meaning: 'kopfueber/auf dem Gesicht fallend (Partizip aktiv IV, Akk.)' },

  // ب ر م — مُبْرِمُونَ is correct Form IV active participle (أَبْرَمَ)
  'مبرمون': { meaning: 'die fest Beschliessenden, die Plaene Schmiedenden (Partizip aktiv IV, m.pl.)' },

  // ف ك ك — مُنفَكِّينَ is Form VII active participle (اِنْفَكَّ)
  'منفكين': { meaning: 'die Ablassenden, sich Loesenden (Partizip aktiv VII, m.pl.)' },
};

let fixCount = 0;
let notFound = [];

for (const root of data.roots) {
  for (const der of (root.keyDerivatives || [])) {
    if (!der.meaning || !der.meaning.includes('Machender')) continue;

    const stripped = stripDiacritics(der.form || '').replace(/[\.\s]/g, '');

    // Try to match
    let matched = false;
    for (const [key, fix] of Object.entries(FIXES)) {
      if (stripped === key || stripped.includes(key) || key.includes(stripped)) {
        der.meaning = fix.meaning;
        fixCount++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try more aggressive matching - just first few consonants
      const short = stripped.slice(0, 4);
      for (const [key, fix] of Object.entries(FIXES)) {
        if (key.startsWith(short) || short.startsWith(key.slice(0, 4))) {
          der.meaning = fix.meaning;
          fixCount++;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      notFound.push({ root: root.root, form: der.form, stripped, meaning: der.meaning });
    }
  }
}

// Also fix the period in بِمُزَحْزِحِهِ.
for (const root of data.roots) {
  for (const der of (root.keyDerivatives || [])) {
    if (der.form && der.form.endsWith('.')) {
      der.form = der.form.slice(0, -1);
      console.log('Fixed trailing period in form:', der.form);
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Fixed ${fixCount} "Machender" entries`);
if (notFound.length > 0) {
  console.log(`\nNot matched (${notFound.length}):`);
  notFound.forEach(e => console.log(`  ${e.root}: ${e.form} [${e.stripped}] → ${e.meaning}`));
}
