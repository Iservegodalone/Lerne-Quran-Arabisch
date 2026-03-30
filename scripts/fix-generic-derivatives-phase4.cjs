/**
 * fix-generic-derivatives-phase4.cjs
 *
 * Final pass: Fix all remaining truly generic entries where content = root meaning.
 * Handles: plurals, verbs, nominals, participles with short root words.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function getRootVerb(m) { return m.split(/[,;—]/)[0].trim(); }
function stripParens(s) { return s.replace(/\s*\([^)]*\)\s*/g, '').trim(); }

const PERSON_MAP = {
  '1.pl.': 'wir ', '1.sg.': 'ich ',
  '2.m.sg.': 'du ', '2.f.sg.': 'du ', '2.m.pl.': 'ihr ', '2.f.pl.': 'ihr ',
  '2.du.': 'ihr beide ', '2.m.du.': 'ihr beide ',
  '3.m.sg.': 'er ', '3.f.sg.': 'sie ', '3.f.sg./2.m.sg.': 'sie/du ',
  '3.m.pl.': 'sie ', '3.f.pl.': 'sie ',
  '3.m.du.': 'sie beide ', '3.f.du.': 'sie beide ',
};

// German plural forms for common root nouns
const PLURAL_MAP = {
  'Tag': 'Tage', 'Zeichen': 'Zeichen', 'Gottheit': 'Gottheiten',
  'Selbst': 'Seelen/Selbste', 'Mensch': 'Menschen', 'Weg': 'Wege',
  'Besitz': 'Besitztümer', 'Buch': 'Bücher', 'Volk': 'Völker',
  'Ding': 'Dinge', 'Diener': 'Diener', 'Wort': 'Worte', 'Auge': 'Augen',
  'Herz': 'Herzen', 'Himmel': 'Himmel', 'Erde': 'Erden/Länder',
  'Stadt': 'Städte', 'Seele': 'Seelen', 'Hand': 'Hände',
  'Kind': 'Kinder', 'Sohn': 'Söhne', 'Frau': 'Frauen',
  'Bruder': 'Brüder', 'Schwester': 'Schwestern', 'Vater': 'Väter',
  'Mutter': 'Mütter', 'Tochter': 'Töchter', 'Sache': 'Sachen',
  'Name': 'Namen', 'Tor': 'Tore', 'Garten': 'Gärten',
  'Fluss': 'Flüsse', 'Berg': 'Berge', 'Baum': 'Bäume',
  'Stern': 'Sterne', 'Engel': 'Engel', 'Bote': 'Boten',
  'Prophet': 'Propheten', 'Richter': 'Richter', 'Feind': 'Feinde',
  'Freund': 'Freunde', 'Gefährte': 'Gefährten', 'Zeuge': 'Zeugen',
  'Helfer': 'Helfer', 'Gläubiger': 'Gläubige', 'Wahrheit': 'Wahrheiten',
  'Tat': 'Taten', 'Strafe': 'Strafen', 'Gunst': 'Gunsterweise',
};

let fixed = 0;

for (const root of data.roots) {
  const rootFirst = getRootVerb(root.meaning);
  const rootClean = stripParens(rootFirst);

  for (const der of (root.keyDerivatives || [])) {
    const m = der.meaning || '';
    if (!m.includes('(')) continue;
    if (m.match(/^(er |sie |du |ihr |wir |ich |das )/)) continue;

    const lastParen = m.lastIndexOf('(');
    const contentPart = m.slice(0, lastParen).trim();
    const contentClean = stripParens(contentPart).toLowerCase();
    const rootLower = rootClean.toLowerCase();

    // Is this truly generic?
    const isGeneric = contentClean === rootLower ||
                      contentClean === 'und ' + rootLower ||
                      contentClean === rootFirst.toLowerCase() ||
                      contentClean === 'und ' + rootFirst.toLowerCase();
    if (!isGeneric) continue;

    const gramInfo = m.slice(lastParen + 1, -1);
    const hasUnd = contentClean.startsWith('und ');
    const prefix = hasUnd ? 'und ' : '';

    // ─── VERBS ───
    if (gramInfo.includes('Imperfekt') || gramInfo.includes('Perfekt')) {
      let personPrefix = '';
      for (const [key, pp] of Object.entries(PERSON_MAP)) {
        if (gramInfo.includes(key)) { personPrefix = pp; break; }
      }
      if (personPrefix) {
        der.meaning = `${prefix}${personPrefix}${rootFirst} (${gramInfo})`;
        fixed++;
        continue;
      }
    }

    if (gramInfo.includes('Imperativ')) {
      der.meaning = `${prefix}${rootFirst}! (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── PLURALS ───
    if (gramInfo.includes('Plural') || gramInfo.includes('Pl.')) {
      const cap = rootClean.charAt(0).toUpperCase() + rootClean.slice(1);
      const pluralForm = PLURAL_MAP[cap] || (cap + ' (Pl.)');
      der.meaning = `${prefix}${pluralForm} (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── DUAL ───
    if (gramInfo.includes('Dual')) {
      der.meaning = `${prefix}zwei ${rootFirst} (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── PARTICIPLES ───
    if (gramInfo.includes('Partizip')) {
      if (gramInfo.includes('passiv') || gramInfo.includes('Passiv')) {
        let pass = rootClean;
        if (rootClean.endsWith('en')) pass = rootClean.replace(/en$/, 't');
        else if (rootClean.endsWith('ern')) pass = rootClean.replace(/ern$/, 'ert');
        else if (rootClean.endsWith('eln')) pass = rootClean.replace(/eln$/, 'elt');
        else pass = rootClean + ' (passiv)';
        der.meaning = `${prefix}${pass.charAt(0).toUpperCase() + pass.slice(1)} (${gramInfo})`;
      } else {
        let act = rootClean;
        if (rootClean.endsWith('en')) act = rootClean + 'd';
        else if (rootClean.endsWith('ern') || rootClean.endsWith('eln')) act = rootClean + 'd';
        der.meaning = `${prefix}${act.charAt(0).toUpperCase() + act.slice(1)} (${gramInfo})`;
      }
      fixed++;
      continue;
    }

    // ─── GATTUNGSNOMEN / KOLLEKTIV ───
    if (gramInfo.includes('Gattungsnomen') || gramInfo.includes('Kollektiv')) {
      const cap = rootClean.charAt(0).toUpperCase() + rootClean.slice(1);
      der.meaning = `${prefix}${cap} (${gramInfo})`;
      fixed++;
      continue;
    }

    // ─── REMAINING NOMINALS ───
    // For indef/bestimmt: capitalize and clean up
    const cap = rootClean.charAt(0).toUpperCase() + rootClean.slice(1);
    der.meaning = `${prefix}${cap} (${gramInfo})`;
    fixed++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Phase 4: Fixed ${fixed} entries`);

// Final stats
let trulyGeneric = 0, total = 0;
for (const r of data.roots) {
  const rootFirst = getRootVerb(r.meaning);
  const rootClean = stripParens(rootFirst);
  for (const der of r.keyDerivatives||[]) {
    total++;
    const m = der.meaning || '';
    if (!m.includes('(')) continue;
    if (m.match(/^(er |sie |du |ihr |wir |ich |das |und )/)) continue;
    const lp = m.lastIndexOf('(');
    const cp = stripParens(m.slice(0, lp).trim()).toLowerCase();
    if (cp === rootClean.toLowerCase() || cp === rootFirst.toLowerCase()) {
      trulyGeneric++;
    }
  }
}
console.log(`\nFinal: ${total} total, ${trulyGeneric} truly generic (${(trulyGeneric/total*100).toFixed(1)}%)`);
