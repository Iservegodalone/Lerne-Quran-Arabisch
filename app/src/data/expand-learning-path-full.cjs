/**
 * expand-learning-path-full.cjs
 *
 * Expands frequency-learning-path.json from 1000 roots (6 tiers) to all 1642 roots (9 tiers).
 * Adds:
 *   Tier 7: "Fortgeschritten III" (ranks 1001-1250, 250 roots)
 *   Tier 8: "Fortgeschritten IV" (ranks 1251-1500, 250 roots)
 *   Tier 9: "Vollstaendig"       (ranks 1501-1642, 142 roots)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

const learningPath = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'frequency-learning-path.json'), 'utf8'));
const freqComplete = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'root-frequency-complete.json'), 'utf8'));
const rootMeanings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'root-meanings.json'), 'utf8'));

// Build lookup maps
const meaningMap = new Map();
for (const rm of rootMeanings.roots) {
  meaningMap.set(rm.root, rm);
}

// ----- Theological -> Linguistic replacement map -----
const theologicalReplacements = {
  'Gebet': 'Zuwendung',
  'gebet': 'Zuwendung',
  'Glaube': 'Vertrauen',
  'glaube': 'Vertrauen',
  'glauben': 'vertrauen',
  'Glauben': 'Vertrauen',
  'offenbaren': 'mitteilen',
  'Offenbarung': 'Mitteilung',
  'offenbart': 'mitgeteilt',
  'rechtgeleitet': 'geleitet',
  'Rechtleitung': 'Leitung',
  'rechtleiten': 'leiten',
  'fromm': 'aufrichtig',
  'Froemmigkeit': 'Aufrichtigkeit',
  'Sünde': 'Verfehlung',
  'Suende': 'Verfehlung',
  'sündig': 'fehlgehend',
  'suendig': 'fehlgehend',
  'Sünder': 'Fehlgehender',
  'Hölle': 'Feuergrube',
  'Hoelle': 'Feuergrube',
  'Paradies': 'Garten',
  'beten': 'sich zuwenden',
  'Anbetung': 'Zuwendung',
  'anbeten': 'sich zuwenden',
  'Prophet': 'Verkuender',
  'Propheten': 'Verkuender',
  'heilig': 'rein',
  'Segen': 'Vermehrung',
  'segnen': 'vermehren',
  'gesegnet': 'vermehrt',
};

// ----- Semantic field -> meaning generation for placeholder roots -----
// Maps Arabic root consonants to approximate meanings based on semantic field + derivatives
function generateMeaningFromContext(rootEntry, meaningEntry) {
  // Use semantic field + key derivatives to generate a meaning
  const sf = meaningEntry.semanticField || '';
  const derivs = meaningEntry.keyDerivatives || [];

  // Hardcoded mapping for known roots with placeholder meanings (checked FIRST)
  // These are looked up from Lane's Lexicon semantic fields
  const rootToMeaning = {
    'ر ق م': 'schreiben, markieren, beschriebenes Dokument',
    'ش ط ط': 'uebertreiben, masslos sein, Uebermass',
    'ذ ر و': 'zerstreuen, verwehen (Wind)',
    'ص خ ر': 'Fels, Gestein, hartes Gestein',
    'ق ب س': 'Feuerglut nehmen, Funke, Feuerbrand',
    'ع ر ي': 'nackt sein, entbloesst, offene Flaeche',
    'ع ت ل': 'grob, gewalttaetig, roh zupackend',
    'ر ق ب': 'beobachten, ueberwachen, Nacken',
    'ح ط م': 'zerbrechen, zerschmettern, zermahlen',
    'ن ع ج': 'Mutterschaf, weibliches Schaf',
    'ع ص ب': 'binden, zusammenbinden, Schar',
    'ر ع ب': 'Schrecken, Furcht einjagen',
    'ز ح ف': 'kriechen, vorruecken, sich heranschieben',
    'س ل ق': 'mit scharfer Zunge angreifen, verletzen',
    'ص ه ر': 'schmelzen, Schwagerschaft',
    'ع ض د': 'Oberarm, stuetzen, bestaerken',
    'ن ق ب': 'durchbohren, durchbrechen, Bergpass',
    'ض ب ح': 'niedrig liegen, sich zusammenkauern',
    'خ م ط': 'bittere Frucht, Tamariskenbeere',
    'ز ب ر': 'Eisenstuecke, Schriftstueck, schreiben',
    'خ ب ت': 'demuetig sein, bescheiden, sanftmuetig',
    'ن ق ر': 'picken, aushacken, Trompete blasen',
    'ج ب ت': 'falsche Gottheit, Nichtigkeit',
    'ر ت ع': 'weiden, sorglos geniessen',
    'ح م ا': 'schuetzen, verteidigen, heisser Schlamm',
    'ع ث ر': 'stolpern, auf etwas stossen, finden',
    'ل غ و': 'nutzlose Rede, leeres Gerede',
    'غ ل ف': 'umhuellen, Schwertscheide, Vorhaut',
    'ح ب ط': 'zunichtewerden, vergeblich sein',
    'غ و ط': 'tief sinken, versinken',
    'ق م ط': 'zusammenbinden, fesseln',
    'ض ح ي': 'Morgensonne, Vormittag, Morgenfrische',
    'ز ج ر': 'schelten, antreiben, zurueckhalten',
    'ف ج ر': 'hervorbrechen, Morgendaemmerung',
    'ن ه ج': 'klarer Weg, deutliche Methode',
    'ح ص ب': 'Kieselsteine werfen, steinigen',
    'ز ه ق': 'vergehen, zunichtewerden',
    'د م ر': 'zerstoeren, vernichten, zugrunde richten',
    'ف ر ط': 'vernachlaessigen, uebermaessig sein',
    'ص ع د': 'aufsteigen, emporsteigen',
    'خ ب ث': 'schlecht, verdorben, unrein',
    'ف ص ل': 'trennen, absondern, entscheiden',
    'ط م س': 'ausloeschen, verwischen, unkenntlich machen',
    'ع ق م': 'unfruchtbar, kinderlos',
    'س ق ر': 'sengende Hitze, Sonnenbrand',
    'ل ه ب': 'Flamme, lodern, aufflammen',
    'ح د ب': 'Buckel, Hoecker, Erhoehung',
    'ر ك م': 'aufhaeufen, aufschichten',
    'ع ص ر': 'auspressen, Zeit/Epoche',
    'ب ع ث ر': 'aufwuehlen, zerstreuen, herausschleudern',
    'ف ج و': 'Spalte, Oeffnung, Bergpass',
    'ه ج ع': 'schlafen (nachts), ruhen, naechtlich rasten',
    'ج م د': 'erstarren, gefrieren, fest/unbewegt sein',
    'ح ر ث': 'pfluegen, Acker, Saatfeld',
    'ر ت ق': 'zusammenfuegen, verbinden, verschliessen',
    'ف ت ق': 'auftrennen, spalten, oeffnen',
    'ح ي ن': 'Zeit, Zeitabschnitt, Zeitpunkt',
    'ك ن ز': 'aufhaeufen, horten, Schatz',
    'ل ق ف': 'verschlingen, gierig aufnehmen',
    'ح ص ن': 'befestigt, verschanzt, geschuetzt',
    'ع ج ل': 'Kalb (junges Rind)',
    'س ح ر': 'fruehe Morgenstunde, Daemmerung',
    'غ ر ب': 'Westen, Untergangsort, untergehen',
    'ل ب ث': 'verweilen, bleiben, sich aufhalten',
    'ن ض ج': 'gar werden, reif werden, durchgekocht',
    'ص ل ح': 'gut sein, in Ordnung bringen, tauglich',
    'ش ه ب': 'Stern, Sternschnuppe, Flammengeschoss',
    'ل ق ب': 'Beiname, Spottname',
    'ض ي ز': 'abweichen, sich neigen',
    'ح ي ي': 'beschaemen, schuechtern, Scham empfinden',
    'ق ر ط س': 'Blattstueck, Schriftrolle',
    'ف ت ح': 'oeffnen, Oeffnung, Sieg',
    // ---- 106 additional roots with placeholder meanings ----
    'ر ك ض': 'mit dem Fuss stampfen, rennen, galoppieren',
    'ف ج ج': 'weiter Weg, Bergpass, breite Strasse',
    'ن ك س': 'umkehren, auf den Kopf stellen, rueckfaellig',
    'و ث ن': 'Standbild, Goetze, aufgerichtetes Bild',
    'س ل ل': 'herausziehen, sich davonstehlen, Extrakt',
    'ن س ب': 'Abstammung, Verwandtschaft, Herkunft',
    'ج ي ب': 'Brustschlitz, Hemdoeffnung, Gewandfalte',
    'ن ث ر': 'zerstreuen, verstreuen, auseinanderfallen',
    'ف ر ت': 'suesses Wasser, Suesswasserquelle',
    'ا ج ج': 'salziges Wasser, bitter schmeckend',
    'ش ح ن': 'beladen, vollladen, beladenes Schiff',
    'ح د ق': 'Garten, umzaeunter Baumgarten',
    'ج د ث': 'Grab, Grabstaette, Grube',
    'ز ق م': 'bitterer Baum, Zaqqum-Baum',
    'ر و غ': 'sich abwenden, sich heimlich entfernen',
    'و ت د': 'Pflock, Zeltpfahl, befestigen',
    'ا ز ف': 'nahe bevorstehen, heranruecken (zeitlich)',
    'س ج ر': 'anfachen, entflammen, auflodern lassen',
    'ص ر ص ر': 'heftiger kalter Wind, heulender Sturm',
    'م و ر': 'sich hin und her bewegen, wogen, schwanken',
    'د ع ع': 'wegstossen, schroff abweisen, verdraengen',
    'ش ا م': 'linke Seite, links, Nordseite',
    'ث ل ل': 'Schar, Gruppe, Menge von Menschen',
    'ف س ح': 'Platz machen, weit werden, auseinanderruecken',
    'م ز ج': 'mischen, Beimischung, Getraenk-Mischung',
    'ص ب ع': 'Finger, Fingerspitze',
    'خ ر ب': 'zerstoert, verwuestet, Ruine',
    'ج ن ف': 'abweichen, sich neigen, Parteilichkeit',
    'ر ف ث': 'unanstaendige Rede, Geschlechtsverkehr',
    'ل د د': 'hartnaeckig streitend, aeusserst feindselig',
    'ا م و': 'Dienerin, Magd, weibliche Dienende',
    'ك ر س': 'Sitz, Thronsessel, Herrschaftsstuhl',
    'ك م ه': 'blindgeboren, von Geburt an blind',
    'ش ف و': 'Rand, Kante, aeusserster Rand',
    'ح ف ر': 'graben, ausheben, Grube',
    'د و ل': 'abwechseln, im Umlauf sein, Wechsel',
    'ك ي ن': 'demuetig werden, sich unterwerfen',
    'خ د ن': 'heimlicher Gefaehrte, Liebhaber, Vertrauter',
    'ط ع ن': 'stechen, durchbohren, schmaehen',
    'ش ي د': 'bauen, hochbauen, befestigt/hoch gebaut',
    'ك س ل': 'traege, faul, schlaff',
    'خ م ص': 'Hunger, leerer Magen, hungrig sein',
    'و س ل': 'Mittel der Annaeherung, Zugangsweg',
    'ه م ن': 'schuetzen, bewachen, wachsam sein',
    'د م ع': 'Traene, weinen, Traenenfluessigkeit',
    'ر ط ب': 'feucht, frisch, saftige Dattel',
    'ب س ل': 'ausgeliefert werden, preisgegeben, verpfaendet',
    'ب ز غ': 'aufgehen (Gestirn), hervorbrechen',
    'ق د و': 'folgen, nacheifern, sich zum Vorbild nehmen',
    'ظ ف ر': 'Nagel, Kralle, Klaue',
    'ح و ي': 'Eingeweide, Inneres, in sich enthalten',
    'ق ي ل': 'Mittagsruhe, Mittagsschlaf',
    'ث ع ب': 'Schlange, grosse Schlange',
    'خ و ر': 'Bruellen (Rind), Muhgerausch',
    'ل ه ث': 'hecheln, keuchen, schwer atmen',
    'ب ن ن': 'Fingerspitze, Fingerglied',
    'ب ط ر': 'uebermuetig werden, Ueberdruss, Hochmut',
    'ث خ ن': 'ueberwinden, niederstrecken, bezwingen',
    'ا ل ل': 'Schutzbuendnis, Verwandtschaftsband',
    'ع ي ل': 'arm sein, Armut, beduerftig',
    'ه و ر': 'einstuerzen, zusammenbrechen, zusammenfallen',
    'ا و ه': 'seufzen, klagen, tief aufseufzen',
    'ع ز ب': 'entgehen, verborgen sein, abwesend sein',
    'غ ي ض': 'abnehmen (Wasser), sinken, schwinden',
    'ه ر ع': 'eilen, rennen, hastig laufen',
    'ش ه ق': 'einatmen, schreien, Eselruf (Einatmung)',
    'ج ب ب': 'Brunnen, Zisterne, tiefe Grube',
    'ح و ش': 'fernhalten, sich distanzieren, bewahren',
    'ب ع ر': 'Kamel, junges Lasttier',
    'ص ن و': 'Zwilling (Baum), paarweise Staemme',
    'ش خ ص': 'starr blicken, hervorragen, Gestalt',
    'ص ف د': 'fesseln, Ketten, in Ketten gelegt',
    'و س م': 'Zeichen, Merkmal, kennzeichnen',
    'ط ر و': 'frisch, saftig, zart (Nahrung)',
    'م خ ر': 'durchpfluegen (Meer), Schiff bahnt den Weg',
    'و ص ب': 'dauernd, anhaltend, unaufhoerlich',
    'ا ث ث': 'Hausrat, Moebel, Einrichtung',
    'ح ظ ر': 'verbieten, einzaeunen, eingehegt',
    'ك ل و': 'beide (Dual), zwei zusammen',
    'ت و ر': 'Mal, einmal, Wiederholung',
    'ش ك ل': 'Form, Gestalt, Art und Weise',
    'ب خ ع': 'sich fast umbringen (vor Kummer), verzehren',
    'ج ر ز': 'trockenes unfruchtbares Land, duerr',
    'ر ق د': 'schlafen, ruhen, Schlafstaette',
    'ش و ي': 'braten, roesten, sengen',
    'ز ل ق': 'ausgleiten, glatt, glattes Stueck Land',
    'غ د ر': 'zuruecklassen, verlassen, aufgeben',
    'ح ق ب': 'langer Zeitraum, Zeitalter, Epoche',
    'غ ط و': 'bedecken, verhuellen, Bedeckung',
    'ا ز ز': 'antreiben, aufstacheln, anstiften',
    'ا ر ب': 'Beduerfnis, Zweck, Anliegen',
    'ه ض م': 'unrecht tun, schmaelern, reife Dattelfrucht',
    'خ ر د ل': 'Senfkorn, kleinstes Gewichtsmass',
    'ن ف ش': 'zerzupfen, aufpluecken, zerfasern',
    'غ و ص': 'tauchen, untertauchen, Taucher',
    'س ح ق': 'weit entfernt, sehr fern, tiefer Abgrund',
    'ع ط ل': 'ungenutzt, vernachlaessigt, verlassen',
    'ذ ب ب': 'Fliege, kleines Insekt',
    'غ ث و': 'Schaum, Gischt, aufgeschwemmter Abfall',
    'ن ك ب': 'abweichen vom Weg, Seiten, Schulterflaeche',
    'و د ق': 'Regen, Regenwasser, niedergehend',
    'ه ب و': 'feiner Staub, Staubpartikel, aufgewirbelt',
    'ر س س': 'Brunnen, Wasserstelle (Ortsname)',
    'ق ل ي': 'hassen, verabscheuen, ablehnen',
    'ك ب ب': 'kopfueber stuerzen, auf das Gesicht werfen',
    'س ر م د': 'endlos, ununterbrochen, fortwaehrend',
    // ---- 24 additional roots whose derivatives also had placeholder meanings ----
    'ل ذ ذ': 'Genuss, Vergnuegen, angenehm empfinden',
    'ك و ر': 'einwickeln, zusammenrollen, auftuermen',
    'س ل س ل': 'Kette, Ketten, aneinanderreihen',
    'ن ح س': 'Unglueck, unglueckverheissend, Kupfer/Erz',
    'ا ف ق': 'Horizont, Gesichtskreis, Rand',
    'ز ح ز ح': 'entfernen, wegbewegen, abraecken',
    'ز و د': 'Reisevorrat, Wegzehrung, sich versorgen',
    'ج س م': 'Koerper, Leib, koerperliche Gestalt',
    'م ح ق': 'zunichtemachen, ausloeschen, vermindern',
    'ر س خ': 'fest verwurzelt, gruendlich, tief verankert',
    'ب ر ص': 'Aussatz, Hautkrankheit, weissfleckig',
    'ز ل م': 'Losungspfeil, Pfeil ohne Spitze',
    'غ ر و': 'aufhetzen, feindlich machen, anstiften',
    'ص غ و': 'neigen (Ohr), zuhoeren, sich hinwenden',
    'ج ر د': 'Heuschrecke, Heuschreckenschwarm',
    'ن ص ت': 'zuhoeren, schweigen und hoeren, aufmerken',
    'ص د ي': 'klatschen, Echo, sich abwenden',
    'ب د ن': 'Leib, Koerper, grosses Opfertier',
    'س ع د': 'gluecklich sein, gedeihen, Wohlergehen',
    'ل ق ط': 'aufheben, aufsammeln, finden (Findling)',
    'ق س ط س': 'Waage, gerechte Waage, Messgeraet',
    'ج ل ب': 'herantreiben, herbeirufen, Umhang',
    'ق و ع': 'flache Ebene, ebenes offenes Land',
    'ع ر ر': 'bedraengt, in Not, mittellos/beduerftig',
  };

  if (rootToMeaning[rootEntry.root]) {
    return rootToMeaning[rootEntry.root];
  }

  // Try to extract meaning from derivative meanings if they have useful info
  for (const d of derivs) {
    if (d.meaning && !d.meaning.includes('(Quranische Formen:') && !d.meaning.startsWith('und ') && !d.meaning.startsWith('mit/in ')) {
      // Found a derivative with actual meaning
      const shortened = shortenMeaning(d.meaning);
      if (shortened) return shortened;
    }
  }

  // Fallback: use semantic field to generate a generic but accurate meaning
  // This should only be reached if we missed a root
  console.warn(`WARNING: No specific meaning for root ${rootEntry.root} (rank ${rootEntry.rank}, field: ${sf}). Using fallback.`);

  // Try to extract from Arabic forms - form analysis
  const forms = derivs.map(d => d.form).join(', ');
  return `[${sf}] (${forms})`;
}

// ----- Shorten meaning to concise German gloss -----
function shortenMeaning(meaning) {
  if (!meaning) return null;

  // Remove parenthetical Quranische Formen
  if (meaning.startsWith('(Quranische Formen:')) {
    return null; // This needs generateMeaningFromContext
  }

  // Take text before " — " (long explanation separator)
  let short = meaning.split(' — ')[0].trim();

  // Also split on "; " if still too long
  if (short.length > 60) {
    short = short.split('; ')[0].trim();
  }

  // Also split on ", " if still too long
  if (short.length > 60) {
    short = short.split(', ').slice(0, 2).join(', ').trim();
  }

  // Apply theological -> linguistic replacements
  for (const [theo, ling] of Object.entries(theologicalReplacements)) {
    // Word-boundary replacement
    const regex = new RegExp('\\b' + theo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    short = short.replace(regex, ling);
  }

  // Final length cap
  if (short.length > 60) {
    short = short.substring(0, 57) + '...';
  }

  return short;
}

// ============================================================
// MAIN LOGIC
// ============================================================

// Collect all existing roots from tiers 1-6
const existingRoots = new Set();
for (const tier of learningPath.tiers) {
  for (const r of tier.roots) {
    existingRoots.add(r.root);
  }
}
console.log(`Existing roots in tiers 1-6: ${existingRoots.size}`);

// Build frequency lookup
const freqMap = new Map();
for (const r of freqComplete.roots) {
  freqMap.set(r.root, r);
}

// Get all roots ranked 1001-1642 from frequency-complete
const newRoots = freqComplete.roots.filter(r => r.rank >= 1001 && r.rank <= 1642);
console.log(`New roots to add (ranks 1001-1642): ${newRoots.length}`);

// Verify no overlap
let overlapCount = 0;
for (const r of newRoots) {
  if (existingRoots.has(r.root)) {
    console.warn(`OVERLAP: Root ${r.root} (rank ${r.rank}) already exists in tiers 1-6!`);
    overlapCount++;
  }
}
if (overlapCount > 0) {
  console.error(`Found ${overlapCount} overlapping roots!`);
}

// Check for roots in 1-1000 that might be missing
const missingFromExisting = [];
for (const r of freqComplete.roots) {
  if (r.rank <= 1000 && !existingRoots.has(r.root)) {
    missingFromExisting.push(r);
  }
}
if (missingFromExisting.length > 0) {
  console.warn(`WARNING: ${missingFromExisting.length} roots from ranks 1-1000 are missing from existing tiers!`);
  missingFromExisting.forEach(r => console.warn(`  Missing: ${r.root} (rank ${r.rank})`));
}

// Build entries for new roots
function buildEntry(freqRoot) {
  const mEntry = meaningMap.get(freqRoot.root);

  let meaning = null;
  let laneUrl = null;

  if (mEntry) {
    laneUrl = mEntry.lanesUrl || null;

    if (mEntry.meaning && mEntry.meaning.startsWith('(Quranische Formen:')) {
      // Placeholder meaning - generate from context
      meaning = generateMeaningFromContext(freqRoot, mEntry);
    } else if (mEntry.meaning) {
      meaning = shortenMeaning(mEntry.meaning);
    }

    // If still null, try keyDerivatives
    if (!meaning && mEntry.keyDerivatives && mEntry.keyDerivatives.length > 0) {
      for (const d of mEntry.keyDerivatives) {
        if (d.meaning && !d.meaning.startsWith('(Quranische')) {
          meaning = shortenMeaning(d.meaning);
          if (meaning) break;
        }
      }
    }

    // Last resort: semantic field
    if (!meaning) {
      meaning = `[${mEntry.semanticField || 'unbekannt'}]`;
      console.warn(`FALLBACK meaning for ${freqRoot.root} (rank ${freqRoot.rank}): ${meaning}`);
    }
  } else {
    console.warn(`NO MEANING ENTRY for ${freqRoot.root} (rank ${freqRoot.rank})`);
    meaning = '[Bedeutung unbekannt]';
  }

  const entry = {
    rank: freqRoot.rank,
    root: freqRoot.root,
    rootArabic: freqRoot.rootArabic,
    count: freqRoot.count,
    meaning: meaning,
    laneReference: laneUrl
  };

  return entry;
}

// Split into tier groups
const tier7Roots = newRoots.filter(r => r.rank >= 1001 && r.rank <= 1250);
const tier8Roots = newRoots.filter(r => r.rank >= 1251 && r.rank <= 1500);
const tier9Roots = newRoots.filter(r => r.rank >= 1501 && r.rank <= 1642);

console.log(`Tier 7: ${tier7Roots.length} roots (expected 250)`);
console.log(`Tier 8: ${tier8Roots.length} roots (expected 250)`);
console.log(`Tier 9: ${tier9Roots.length} roots (expected 142)`);

const tier7Entries = tier7Roots.map(buildEntry);
const tier8Entries = tier8Roots.map(buildEntry);
const tier9Entries = tier9Roots.map(buildEntry);

// Calculate word counts for each new tier
const tier7Words = tier7Roots.reduce((sum, r) => sum + r.count, 0);
const tier8Words = tier8Roots.reduce((sum, r) => sum + r.count, 0);
const tier9Words = tier9Roots.reduce((sum, r) => sum + r.count, 0);

// Calculate cumulative coverage
const totalWords = freqComplete.meta.totalWords; // 77429
const existingCoveredWords = freqComplete.roots.filter(r => r.rank <= 1000).reduce((sum, r) => sum + r.count, 0);
const cumTier7 = existingCoveredWords + tier7Words;
const cumTier8 = cumTier7 + tier8Words;
const cumTier9 = cumTier8 + tier9Words;

const tier7Pct = ((cumTier7 / totalWords) * 100).toFixed(2) + '%';
const tier8Pct = ((cumTier8 / totalWords) * 100).toFixed(2) + '%';
const tier9Pct = ((cumTier9 / totalWords) * 100).toFixed(2) + '%';

console.log(`\nWord coverage:`);
console.log(`  After Tier 7: ${tier7Pct} (${tier7Words} new words, ${cumTier7} cumulative)`);
console.log(`  After Tier 8: ${tier8Pct} (${tier8Words} new words, ${cumTier8} cumulative)`);
console.log(`  After Tier 9: ${tier9Pct} (${tier9Words} new words, ${cumTier9} cumulative)`);

// Build new tiers
const tier7 = {
  name: "Tier 7",
  label: "Fortgeschritten III",
  rankRange: "1001-1250",
  rootCount: tier7Entries.length,
  wordsCovered: tier7Words,
  cumulativeCoverage: tier7Pct,
  roots: tier7Entries
};

const tier8 = {
  name: "Tier 8",
  label: "Fortgeschritten IV",
  rankRange: "1251-1500",
  rootCount: tier8Entries.length,
  wordsCovered: tier8Words,
  cumulativeCoverage: tier8Pct,
  roots: tier8Entries
};

const tier9 = {
  name: "Tier 9",
  label: "Vollstaendig",
  rankRange: "1501-1642",
  rootCount: tier9Entries.length,
  wordsCovered: tier9Words,
  cumulativeCoverage: tier9Pct,
  roots: tier9Entries
};

// Update the learning path
learningPath.tiers.push(tier7, tier8, tier9);

// Update meta
learningPath.meta.tierCount = 9;
learningPath.meta.totalRootsInPath = 1642;

learningPath.meta.wordCoverage.tier7 = tier7Pct;
learningPath.meta.wordCoverage.tier8 = tier8Pct;
learningPath.meta.wordCoverage.tier9 = tier9Pct;

learningPath.meta.tierSummary.tier7 = {
  label: "Fortgeschritten III",
  rankRange: "1001-1250",
  rootCount: tier7Entries.length,
  wordsCovered: tier7Words,
  cumulativeCoverage: tier7Pct
};

learningPath.meta.tierSummary.tier8 = {
  label: "Fortgeschritten IV",
  rankRange: "1251-1500",
  rootCount: tier8Entries.length,
  wordsCovered: tier8Words,
  cumulativeCoverage: tier8Pct
};

learningPath.meta.tierSummary.tier9 = {
  label: "Vollstaendig",
  rankRange: "1501-1642",
  rootCount: tier9Entries.length,
  wordsCovered: tier9Words,
  cumulativeCoverage: tier9Pct
};

// ============================================================
// VALIDATION
// ============================================================

console.log('\n========== VALIDATION ==========');

// 1. Total root count
let totalRoots = 0;
const allRootsSet = new Set();
const duplicates = [];
for (const tier of learningPath.tiers) {
  for (const r of tier.roots) {
    if (allRootsSet.has(r.root)) {
      duplicates.push(r.root);
    }
    allRootsSet.add(r.root);
    totalRoots++;
  }
}
console.log(`Total roots across all 9 tiers: ${totalRoots}`);
console.log(`Unique roots: ${allRootsSet.size}`);
if (duplicates.length > 0) {
  console.error(`DUPLICATES FOUND: ${duplicates.length}`);
  duplicates.forEach(d => console.error(`  Duplicate: ${d}`));
} else {
  console.log('No duplicate roots found.');
}

// 2. Check all 1642 from frequency-complete are present
let missingFromPath = [];
for (const r of freqComplete.roots) {
  if (!allRootsSet.has(r.root)) {
    missingFromPath.push(r);
  }
}
if (missingFromPath.length > 0) {
  console.error(`MISSING from path: ${missingFromPath.length} roots`);
  missingFromPath.slice(0, 10).forEach(r => console.error(`  Missing: ${r.root} (rank ${r.rank})`));
} else {
  console.log('All 1642 roots from root-frequency-complete.json are present.');
}

// 3. Check for null meanings
let nullMeanings = 0;
let fallbackMeanings = 0;
for (const tier of learningPath.tiers) {
  for (const r of tier.roots) {
    if (r.meaning === null || r.meaning === undefined) {
      nullMeanings++;
      console.error(`NULL meaning: ${r.root} (rank ${r.rank})`);
    }
    if (r.meaning && r.meaning.startsWith('[')) {
      fallbackMeanings++;
    }
  }
}
console.log(`Null meanings: ${nullMeanings}`);
console.log(`Fallback meanings (bracketed): ${fallbackMeanings}`);

// 4. Verify last entry
const lastTier = learningPath.tiers[8];
const lastEntry = lastTier.roots[lastTier.roots.length - 1];
console.log(`\nLast tier: ${lastTier.name} (${lastTier.label})`);
console.log(`Last entry: rank ${lastEntry.rank}, root: ${lastEntry.root}, meaning: ${lastEntry.meaning}`);
console.log(`Expected rank 1642: ${lastEntry.rank === 1642 ? 'PASS' : 'FAIL'}`);

// 5. Tier summary
console.log('\n========== TIER SUMMARY ==========');
for (const tier of learningPath.tiers) {
  console.log(`${tier.name} (${tier.label}): ${tier.roots.length} roots, ${tier.wordsCovered} words, ${tier.cumulativeCoverage} coverage`);
}

// ============================================================
// WRITE OUTPUT
// ============================================================

const outputPath = path.join(DATA_DIR, 'frequency-learning-path.json');
fs.writeFileSync(outputPath, JSON.stringify(learningPath, null, 2), 'utf8');
console.log(`\nWrote ${outputPath}`);
console.log('DONE.');
