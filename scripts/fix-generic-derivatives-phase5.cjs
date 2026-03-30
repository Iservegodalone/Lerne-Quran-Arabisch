/**
 * fix-generic-derivatives-phase5.cjs
 *
 * Final cleanup: Convert German verb infinitives used for nominal forms
 * into proper German noun forms.
 * "Umkehren (m., indef.)" → "Umkehr (m., indef.)"
 * "das Erfolg haben (bestimmt)" → "der Erfolg (bestimmt)"
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/src/data/root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function getRootVerb(m) { return m.split(/[,;—]/)[0].trim(); }

// Map German verb infinitives to their nominal forms
const VERB_TO_NOUN = {
  'abwenden': 'Abwendung', 'weglenken': 'Weglenkung',
  'umkehren': 'Umkehr', 'wenden': 'Wendung',
  'lieben': 'Liebe', 'zuneigen': 'Zuneigung',
  'werden': 'Werden', 'streiten': 'Streit',
  'spalten': 'Spaltung', 'staunen': 'Staunen',
  'erschaffen': 'Erschaffung', 'zurueckkehren': 'Rueckkehr',
  'hoffen': 'Hoffnung', 'fuerchten': 'Furcht',
  'glauben': 'Glaube', 'wissen': 'Wissen',
  'danken': 'Dank', 'loben': 'Lob',
  'beten': 'Gebet', 'fasten': 'Fasten',
  'sterben': 'Tod', 'leben': 'Leben',
  'schreiben': 'Schrift', 'lesen': 'Lesung',
  'sprechen': 'Rede', 'sagen': 'Aussage',
  'sehen': 'Sicht', 'hoeren': 'Gehoer',
  'helfen': 'Hilfe', 'schaffen': 'Schoepfung',
  'vergeben': 'Vergebung', 'bestrafen': 'Bestrafung',
  'bewahren': 'Bewahrung', 'schuetzen': 'Schutz',
  'fuehren': 'Fuehrung', 'leiten': 'Leitung',
  'regieren': 'Herrschaft', 'dienen': 'Dienst',
  'kaempfen': 'Kampf', 'siegen': 'Sieg',
  'verlieren': 'Verlust', 'gewinnen': 'Gewinn',
  'bitten': 'Bitte', 'geben': 'Gabe',
  'nehmen': 'Nahme', 'bringen': 'Bringung',
  'senden': 'Sendung', 'kommen': 'Kommen',
  'gehen': 'Gang', 'laufen': 'Lauf',
  'sitzen': 'Sitzung', 'stehen': 'Stand',
  'essen': 'Essen', 'trinken': 'Trank',
  'schlafen': 'Schlaf', 'wachen': 'Wachsein',
  'bauen': 'Bau', 'zerstoeren': 'Zerstoerung',
  'oeffnen': 'Oeffnung', 'schliessen': 'Schliessung',
  'kaufen': 'Kauf', 'verkaufen': 'Verkauf',
  'arbeiten': 'Arbeit', 'ruhen': 'Ruhe',
  'preisen': 'Preis', 'loben': 'Lob',
  'verbergen': 'Verbergung', 'zeigen': 'Zeigung',
  'folgen': 'Folge', 'vorausgehen': 'Vorausgang',
  'schwellen': 'Schwellung', 'wachsen': 'Wachstum',
  'brennen': 'Brand', 'leuchten': 'Leuchten',
  'fliessen': 'Fluss', 'regnen': 'Regen',
  'versammeln': 'Versammlung', 'trennen': 'Trennung',
  'verleumden': 'Verleumdung', 'luegen': 'Luege',
  'bezeugen': 'Zeugnis', 'schwoeren': 'Schwur',
  'versprechen': 'Versprechen', 'drohen': 'Drohung',
  'auferstehen': 'Auferstehung', 'erscheinen': 'Erscheinung',
  'erben': 'Erbe', 'tragen': 'Last',
  'messen': 'Mass', 'zaehlen': 'Zahl',
  'denken': 'Gedanke', 'erinnern': 'Erinnerung',
  'beruehren': 'Beruehrung', 'schlagen': 'Schlag',
  'zerreissen': 'Zerreissung', 'binden': 'Band',
  'verweilen': 'Verweilen', 'eilen': 'Eile',
  'wuenschen': 'Wunsch', 'hassen': 'Hass',
  'zufriedenstellen': 'Zufriedenstellung', 'aergern': 'Aerger',
  'trauern': 'Trauer', 'freuen': 'Freude',
  'uebertreiben': 'Uebertreibung', 'masshalten': 'Masshaltung',
  'zurueckweisen': 'Zurueckweisung', 'annehmen': 'Annahme',
  'aufsteigen': 'Aufstieg', 'herabsteigen': 'Herabstieg',
  'herabsenden': 'Herabsendung',
  'zusammenbringen': 'Zusammenbringung',
  'auseinandergehen': 'Auseinandergehen',
  'befreien': 'Befreiung', 'versklaven': 'Versklavung',
  'ueberlegen': 'Ueberlegung', 'beschliessen': 'Beschluss',
  'veraendern': 'Veraenderung', 'bewahren': 'Bewahrung',
  'handeln': 'Handlung', 'ausfuehren': 'Ausfuehrung',
  'verbreiten': 'Verbreitung', 'einschraenken': 'Einschraenkung',
  'erhoehen': 'Erhoehung', 'erniedrigen': 'Erniedrigung',
  'vereinen': 'Vereinigung', 'entzweien': 'Entzweiung',
};

let fixed = 0;

for (const root of data.roots) {
  for (const der of (root.keyDerivatives || [])) {
    const m = der.meaning || '';
    if (!m.includes('(')) continue;
    if (m.match(/^(er |sie |du |ihr |wir |ich )/)) continue;

    const lp = m.lastIndexOf('(');
    const contentPart = m.slice(0, lp).trim();
    const gramInfo = m.slice(lp + 1, -1);

    // Check if content is a verb infinitive used as nominal
    const cleanContent = contentPart.replace(/^und /, '').replace(/^mit\/in /, '').replace(/^das /, '').replace(/^der /, '').replace(/^die /, '');
    const isVerbal = cleanContent.endsWith('en') || cleanContent.endsWith('ern') || cleanContent.endsWith('eln');
    const isNominal = gramInfo.includes('indef.') || gramInfo.includes('bestimmt') ||
                      gramInfo.includes('Substantiv') || gramInfo.includes('Masdar') ||
                      gramInfo.includes('Nom.') || gramInfo.includes('Gen.') || gramInfo.includes('Akk.');

    if (!isVerbal || !isNominal) continue;

    // Try to find noun form
    const lcClean = cleanContent.toLowerCase();
    let nounForm = VERB_TO_NOUN[lcClean];

    if (!nounForm) {
      // Auto-generate: -en → remove, capitalize
      if (lcClean.endsWith('ieren')) {
        nounForm = lcClean.replace(/ieren$/, 'ierung');
      } else if (lcClean.endsWith('igen')) {
        nounForm = lcClean.replace(/igen$/, 'igung');
      } else if (lcClean.endsWith('eln')) {
        nounForm = lcClean.replace(/eln$/, 'elung');
      } else if (lcClean.endsWith('ern')) {
        nounForm = lcClean.replace(/ern$/, 'erung');
      } else if (lcClean.endsWith('en')) {
        // For most verbs: try -ung suffix or just nominalize
        const stem = lcClean.replace(/en$/, '');
        // Prefer -ung for action nouns
        nounForm = stem + 'ung';
      } else {
        continue; // Can't auto-nominalize
      }
      nounForm = nounForm.charAt(0).toUpperCase() + nounForm.slice(1);
    }

    // Reconstruct meaning
    let newContent = '';
    if (contentPart.startsWith('und ')) newContent = 'und ' + nounForm;
    else if (contentPart.startsWith('mit/in ')) newContent = 'mit/in ' + nounForm;
    else if (contentPart.startsWith('das ')) {
      const article = gramInfo.includes('f.') ? 'die ' : gramInfo.includes('m.') ? 'der ' : 'das ';
      newContent = article + nounForm;
    }
    else if (contentPart.startsWith('der ') || contentPart.startsWith('die '))
      newContent = contentPart.replace(/^(der |die ).*/, '$1' + nounForm);
    else newContent = nounForm;

    der.meaning = `${newContent} (${gramInfo})`;
    fixed++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Phase 5: Fixed ${fixed} verb-infinitive-as-nominal entries`);

// Final count
let remaining = 0;
for (const r of data.roots) {
  for (const der of r.keyDerivatives||[]) {
    const m = der.meaning || '';
    if (!m.includes('(')) continue;
    if (m.match(/^(er |sie |du |ihr |wir |ich )/)) continue;
    const lp = m.lastIndexOf('(');
    const cp = m.slice(0, lp).trim().replace(/^und /, '').replace(/^mit\/in /, '').replace(/^das |^der |^die /, '');
    const gi = m.slice(lp+1, -1);
    const isV = cp.toLowerCase().endsWith('en') || cp.toLowerCase().endsWith('ern') || cp.toLowerCase().endsWith('eln');
    const isN = gi.includes('indef.') || gi.includes('bestimmt') || gi.includes('Substantiv') || gi.includes('Masdar');
    if (isV && isN) remaining++;
  }
}
console.log(`Remaining verb-as-nominal: ${remaining}`);
