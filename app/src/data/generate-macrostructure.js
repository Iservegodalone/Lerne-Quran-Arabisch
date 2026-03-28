/* global require, __dirname */
/**
 * Script to extend surah-macrostructure.json to all 114 surahs.
 * Reads existing entries, adds missing ones based on observable textual markers,
 * and writes the complete file.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname);

const macroFile = path.join(dataDir, 'surah-macrostructure.json');

const macro = JSON.parse(fs.readFileSync(macroFile, 'utf8'));

const existingNums = new Set(macro.surahs.map(s => s.surah));
console.log(`Existing surahs: ${existingNums.size}`);

// All 74 missing surah structures, based on observable textual markers
const newEntries = [];

// --- Surah 4: An-Nisa ---
if (!existingNums.has(4)) {
  newEntries.push({
    surah: 4,
    name: "An-Nisa'",
    verses: 176,
    structure: {
      type: "Gesetzgebungs-Blockkonstruktion",
      segments: [
        {verses: "4:1-6", label: "Eröffnung: Anrede an die Menschen", function: "Universale Anrede, Waisenanweisungen, Verteilungsregeln", marker: "يَا أَيُّهَا النَّاسُ — Vokativ als Suren-Eröffnung"},
        {verses: "4:7-35", label: "Verteilungs- und Partnerschaftsanweisungen", function: "Detaillierte Anweisungen", marker: "لِلرِّجَالِ نَصِيبٌ — Imperativformeln, وَ-Konjunktionsketten"},
        {verses: "4:36-42", label: "Sozialethische Anweisungen", function: "Gottesdienst und Nachbarschaftspflichten", marker: "وَاعْبُدُوا اللَّهَ — Imperativkette"},
        {verses: "4:43-70", label: "Auseinandersetzung mit Schriftbesitzern", function: "Kritik an Verfaelschung und Ablehnung", marker: "أَلَمْ تَرَ إِلَى الَّذِينَ أُوتُوا نَصِيبًا مِنَ الْكِتَابِ — rhetorische Frage"},
        {verses: "4:71-104", label: "Kampfbestimmungen und Heuchler", function: "Auszugsregeln, Umgang mit Heuchlern", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا خُذُوا حِذْرَكُمْ — Vokativ + Imperativ"},
        {verses: "4:105-126", label: "Gerechtigkeit und Götzendienst", function: "Rechtsprechung, Warnung vor Schirk", marker: "إِنَّا أَنزَلْنَا إِلَيْكَ الْكِتَابَ — Offenbarungsformel"},
        {verses: "4:127-152", label: "Anweisungen zu Frauen und Familie", function: "Waisenmaedchen, Ehekonflikte, Schriftbesitzer", marker: "وَيَسْتَفْتُونَكَ فِي النِّسَاءِ — Anfrage-Formel"},
        {verses: "4:153-176", label: "Schluss: Schriftbesitzer und Christologie", function: "Musa-Erzählung, Isa-Passage, Schluss-Verteilungsregeln", marker: "يَسْأَلُكَ أَهْلُ الْكِتَابِ — Frageformel, يَسْتَفْتُونَكَ — Schlussformel"}
      ],
      keyFeature: "Staendiger Wechsel zwischen Anweisungen und Adressaten-Gruppen: universale Anrede (يَا أَيُّهَا النَّاسُ, V.1), Gläubige (يَا أَيُّهَا الَّذِينَ آمَنُوا), Schriftbesitzer (يَا أَهْلَ الْكِتَابِ, V.171). Rahmen: Beginnt mit Verteilungsregeln (V.1-6), endet mit Verteilungsregeln (V.176)."
    }
  });
}

// --- Surah 5: Al-Ma'ida ---
if (!existingNums.has(5)) {
  newEntries.push({
    surah: 5,
    name: "Al-Ma'ida",
    verses: 120,
    structure: {
      type: "Gesetzgebungs- und Disputation-Struktur",
      segments: [
        {verses: "5:1-5", label: "Eröffnung: Vertragspflicht und Speiseregeln", function: "Aufforderung zur Vertragstreue, erlaubte/verbotene Speisen", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — Vokativ + Imperativ"},
        {verses: "5:6-11", label: "Reinigungsanweisungen und Bundeserinnerung", function: "Waschungsanweisung, Bundesverweis", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ — Vokativ + temporaler Konditionalsatz"},
        {verses: "5:12-26", label: "Bani Isra'il und Bundesbruch", function: "Bundesschluss, Bruch, Wüstenstrafe", marker: "وَلَقَدْ أَخَذَ اللَّهُ مِيثَاقَ بَنِي إِسْرَائِيلَ — narrativer Rückblick"},
        {verses: "5:27-40", label: "Erzählung der zwei Söhne Adams (ابْنَيْ آدَمَ)", function: "Narrative Sequenz, Vergeltungskonsequenzen", marker: "وَاتْلُ عَلَيْهِمْ نَبَأَ ابْنَيْ آدَمَ — Erzählimperativ"},
        {verses: "5:41-50", label: "Thora und Urteil", function: "Warnung an Heuchler, Thora-Bezug", marker: "يَا أَيُّهَا الرَّسُولُ — einzige Anrede als الرَّسُولُ"},
        {verses: "5:51-71", label: "Buendnis-Verbot und Disputation", function: "Warnung vor Allianzen, Kritik an Schriftbesitzern", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا — Vokativ + Prohibitiv"},
        {verses: "5:72-86", label: "Christologie-Block", function: "Isa und Trinitas-Kritik", marker: "لَقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّهَ هُوَ الْمَسِيحُ — dreifache Zurückweisung"},
        {verses: "5:87-108", label: "Weitere Bestimmungen", function: "Speiseverbote, Schwüre, Alkoholverbot", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُحَرِّمُوا — Vokativ-Kette"},
        {verses: "5:109-120", label: "Schluss: Gerichtstag-Dialog", function: "Dialog mit Gesandten, Isa-Tisch-Erzählung", marker: "يَوْمَ يَجْمَعُ اللَّهُ الرُّسُلَ — eschatologischer Rahmen"}
      ],
      keyFeature: "Höchste Dichte an يَا أَيُّهَا الَّذِينَ آمَنُوا-Anreden im Quran (16-mal). Die Sure verbindet Rechtsbestimmungen mit Disputationen über Schriftbesitzer. Rahmen: Beginnt mit Verträgen (V.1), endet mit kosmischem Besitzrecht Gottes (V.120)."
    }
  });
}

// --- Surah 6: Al-An'am ---
if (!existingNums.has(6)) {
  newEntries.push({
    surah: 6,
    name: "Al-An'am",
    verses: 165,
    structure: {
      type: "Argumentative Monologstruktur",
      segments: [
        {verses: "6:1-11", label: "Eröffnung: Lobpreis und Leugnung", function: "Schöpfungslob, Ablehnung der Zeichen", marker: "الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ — Lobpreis als Eröffnung"},
        {verses: "6:12-24", label: "Konfrontation mit Götzendienern", function: "Rhetorische Fragen, Gerichtsszene", marker: "قُلْ لِمَن — قُلْ-Imperative als Leitstruktur"},
        {verses: "6:25-73", label: "Argumentationsblock", function: "Gleichnisse, Prophetengeschichten, Zeichenaufzaehlung", marker: "وَعِندَهُ مَفَاتِحُ الْغَيْبِ — Attributkette Gottes"},
        {verses: "6:74-83", label: "Ibrahim-Argumentation", function: "Ibrahims Suche: Stern, Mond, Sonne", marker: "وَإِذْ قَالَ إِبْرَاهِيمُ لِأَبِيهِ — narrativer Rückblick"},
        {verses: "6:84-90", label: "Prophetenkatalog", function: "Aufzählung von 18 Propheten", marker: "وَوَهَبْنَا لَهُ — Gabenkette"},
        {verses: "6:91-117", label: "Schriftverteidigung", function: "Verteidigung der Schrift, Auseinandersetzung", marker: "وَمَا قَدَرُوا اللَّهَ حَقَّ قَدْرِهِ — zentrale Aussage"},
        {verses: "6:118-153", label: "Speisevorschriften und Auseinandersetzung", function: "Erlaubtes/Verbotenes, Widerlegung von Braeuchen", marker: "قُلْ لَا أَجِدُ — قُلْ-Imperativ"},
        {verses: "6:154-165", label: "Schluss: Schriftverweis und Mahnung", function: "Thora-Verweis, Individualverantwortung", marker: "ثُمَّ آتَيْنَا مُوسَى الْكِتَابَ — Schlussrahmen"}
      ],
      keyFeature: "Über 40 قُلْ-Imperative machen diese Sure zum längsten argumentativen Monolog des Quran. Ibrahim-Passage (V.74-83) als narrativer Beweis gegen Götzendienst. Endet mit Betonung individueller Verantwortung (V.164: وَلَا تَزِرُ وَازِرَةٌ وِزْرَ أُخْرَىٰ)."
    }
  });
}

// --- Surah 7: Al-A'raf ---
if (!existingNums.has(7)) {
  newEntries.push({
    surah: 7,
    name: "Al-A'raf",
    verses: 206,
    structure: {
      type: "Narrative Reihung mit Refrain",
      segments: [
        {verses: "7:1-10", label: "Eröffnung: Muqatta'at und Warnung", function: "Schriftbezug, Warnung vor Hochmut", marker: "المص — Muqatta'at, كِتَابٌ أُنزِلَ إِلَيْكَ — Schriftreferenz"},
        {verses: "7:11-25", label: "Adam und Iblis", function: "Urgeschichtliche Erzählung", marker: "وَلَقَدْ خَلَقْنَاكُمْ ثُمَّ صَوَّرْنَاكُمْ — narrative Eröffnung"},
        {verses: "7:26-58", label: "Prophetenkette: Nuh, Hud, Salih, Lut, Shu'ayb", function: "Fünf Prophetenerzählungen mit Refrain", marker: "لَقَدْ أَرْسَلْنَا — wiederholte Sendeformel"},
        {verses: "7:59-102", label: "Fortgesetzte Prophetenkette", function: "Erzählungen mit Bestrafungsmotiv", marker: "يَا قَوْمِ — Vokativ in Prophetenreden"},
        {verses: "7:103-171", label: "Musa-Block", function: "Ausführlichste Musa-Erzählung der Sure", marker: "ثُمَّ بَعَثْنَا مِن بَعْدِهِم مُوسَىٰ — Überleitung"},
        {verses: "7:172-178", label: "Ur-Bund-Passage", function: "Alast-Szene: Zeugnis der Nachkommen", marker: "وَإِذْ أَخَذَ رَبُّكَ مِن بَنِي آدَمَ — narrativer Rückblick"},
        {verses: "7:179-206", label: "Schluss: Ermahnung und Lobpreis", function: "Warnung, Gottes Namen, Schlussimperativ", marker: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — Attributformel, Niederwerfung"}
      ],
      keyFeature: "Die Prophetenerzählungen folgen einem festen Schema: Sendung → يَا قَوْمِ-Anrede → Ablehnung → Bestrafung. Die Alast-Passage (V.172) ist ein textlinguistischer Sonderfall — ein narrativer Rückblick auf ein praehistorisches Ereignis."
    }
  });
}

// --- Surah 8: Al-Anfal ---
if (!existingNums.has(8)) {
  newEntries.push({
    surah: 8,
    name: "Al-Anfal",
    verses: 75,
    structure: {
      type: "Ereignisbezogene Diskursstruktur",
      segments: [
        {verses: "8:1-4", label: "Eröffnung: Beute-Frage", function: "Frage nach Beuteverteilung, Gläubigedefinition", marker: "يَسْأَلُونَكَ عَنِ الْأَنفَالِ — Frageformel"},
        {verses: "8:5-19", label: "Rückblick auf den Auszug", function: "Vorbereitung, Engelshilfe", marker: "كَمَا أَخْرَجَكَ رَبُّكَ — Vergleichspartikel كَمَا"},
        {verses: "8:20-40", label: "Anweisungen an Gläubige", function: "Gehorsamspflicht, Kampfbereitschaft", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا — wiederholter Vokativ"},
        {verses: "8:41-44", label: "Beuteverteilung", function: "Konkrete Verteilungsregel", marker: "وَاعْلَمُوا أَنَّمَا غَنِمْتُم — Imperativ + Rechtsformel"},
        {verses: "8:45-60", label: "Verhaltensanweisungen bei Konfrontation", function: "Standhaftigkeit, Vertragsprinzipien", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا لَقِيتُمْ — Vokativ + temporaler Konditionalsatz"},
        {verses: "8:61-75", label: "Schluss: Verträge und Loyalität", function: "Friedensbereitschaft, Loyalitätspflichten", marker: "وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا — Konditionalsatz"}
      ],
      keyFeature: "Die Sure bewegt sich von einer konkreten Fragestellung (Beuteverteilung, V.1) zu allgemeinen Prinzipien (Verhaltensanweisungen, Vertragsprinzipien). Staendiger Wechsel zwischen narrativem Rückblick und imperativer Passage."
    }
  });
}

// --- Surah 9: At-Tawba ---
if (!existingNums.has(9)) {
  newEntries.push({
    surah: 9,
    name: "At-Tawba",
    verses: 129,
    structure: {
      type: "Polemisch-Legislative Struktur",
      segments: [
        {verses: "9:1-6", label: "Eröffnung: Lossagung", function: "Aufkündigung von Verträgen, Frist", marker: "بَرَاءَةٌ مِنَ اللَّهِ — einzige Sure ohne Basmala"},
        {verses: "9:7-16", label: "Anklage der Vertragsbrecher", function: "Anklage und Kampfaufforderung", marker: "كَيْفَ يَكُونُ لِلْمُشْرِكِينَ عَهْدٌ — rhetorische Frage"},
        {verses: "9:17-29", label: "Moscheen und Dschizya", function: "Moscheenverwaltung, Steuerbestimmung", marker: "مَا كَانَ لِلْمُشْرِكِينَ أَن يَعْمُرُوا — Negationsformel"},
        {verses: "9:30-37", label: "Auseinandersetzung mit Juden und Christen", function: "Zurückweisung von Sohn-Zuschreibungen", marker: "وَقَالَتِ الْيَهُودُ / وَقَالَتِ النَّصَارَىٰ — parallele Redeeinleitungen"},
        {verses: "9:38-52", label: "Kampfbereitschaft und Heuchler", function: "Auszugspflicht, Entlarvung von Zurückbleibenden", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا مَا لَكُمْ — Vokativ + Tadelformel"},
        {verses: "9:53-72", label: "Heuchler-Block", function: "Charakterisierung der Heuchler", marker: "قُلْ أَنفِقُوا طَوْعًا أَوْ كَرْهًا — قُلْ-Imperativ"},
        {verses: "9:73-89", label: "Verschaerfung gegen Heuchler", function: "Schwüre, Spott, Unterlassung", marker: "يَحْلِفُونَ بِاللَّهِ — wiederholte Schwurformel der Heuchler"},
        {verses: "9:90-110", label: "Beduinen und Almosen", function: "Kategorisierung der Beduinen, Verteilungsanweisungen", marker: "وَجَاءَ الْمُعَذِّرُونَ — narrative Szene"},
        {verses: "9:111-129", label: "Schluss: Bund, Reue und Trost", function: "Kaufmetapher, Reue der Drei, Schlussverse", marker: "إِنَّ اللَّهَ اشْتَرَىٰ — Kaufmetapher, لَقَد تَابَ اللَّهُ — Tawba-Motiv"}
      ],
      keyFeature: "Einzige Sure ohne Basmala. Dominiert von Anklage der Heuchler (المنافقون) — das Wort und seine Derivate erscheinen über 10-mal. Die Sure endet mit der Charakterisierung des Gesandten (V.128-129), die sich strukturell vom Anklageton abhebt."
    }
  });
}

// --- Surah 10: Yunus ---
if (!existingNums.has(10)) {
  newEntries.push({
    surah: 10,
    name: "Yunus",
    verses: 109,
    structure: {
      type: "Argumentative Diskursstruktur",
      segments: [
        {verses: "10:1-10", label: "Eröffnung: Offenbarung und Schöpfung", function: "Muqatta'at, Verwunderung über Offenbarung, Zeichen", marker: "الر — Muqatta'at, أَكَانَ لِلنَّاسِ عَجَبًا — rhetorische Frage"},
        {verses: "10:11-30", label: "Argumentation gegen Leugner", function: "Zeichen, Gleichnisse, rhetorische Fragen", marker: "قُلْ مَن يَرْزُقُكُم — قُلْ-Imperative"},
        {verses: "10:31-56", label: "Argumentation für Gottes Einheit", function: "Beweis durch Schöpfungszeichen", marker: "قُلْ مَنْ يَرْزُقُكُمْ — wiederholte قُلْ-Struktur"},
        {verses: "10:57-70", label: "Quran als Heilung", function: "Offenbarung als Ermahnung und Gnade", marker: "يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَوْعِظَةٌ — Vokativ + Perfekt"},
        {verses: "10:71-92", label: "Prophetenerzählungen: Nuh, Musa", function: "Narrative Bloecke", marker: "وَاتْلُ عَلَيْهِمْ نَبَأَ نُوحٍ — Erzählimperativ"},
        {verses: "10:93-109", label: "Schluss: Yunus und Ermahnung", function: "Yunus' Volk als positives Beispiel, Schlussformel", marker: "فَلَوْلَا كَانَتْ قَرْيَةٌ آمَنَتْ ... إِلَّا قَوْمَ يُونُسَ — Ausnahmeformel"}
      ],
      keyFeature: "Yunus' Volk ist die einzige Ausnahme eines Volkes, das nach der Warnung glaubte (V.98). Die Sure enthält über 20 قُلْ-Imperative und bewegt sich von kosmischen Zeichen zu historischen Belegen."
    }
  });
}

// --- Surah 11: Hud ---
if (!existingNums.has(11)) {
  newEntries.push({
    surah: 11,
    name: "Hud",
    verses: 123,
    structure: {
      type: "Narrative Reihung mit Refrain",
      segments: [
        {verses: "11:1-5", label: "Eröffnung", function: "Muqatta'at, Schrift als weise Warnung", marker: "الر كِتَابٌ أُحْكِمَتْ آيَاتُهُ — Schriftreferenz"},
        {verses: "11:6-24", label: "Argumentation und Leugnung", function: "Schöpfungszeichen, Herausforderung", marker: "أَمْ يَقُولُونَ افْتَرَاهُ — Tahaddi-Formel"},
        {verses: "11:25-49", label: "Nuh-Erzählung", function: "Ausführlichste Nuh-Narration", marker: "وَلَقَدْ أَرْسَلْنَا نُوحًا — Sendeformel"},
        {verses: "11:50-60", label: "Hud und 'Ad", function: "Hud-Erzählung", marker: "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا — Sendeformel"},
        {verses: "11:61-68", label: "Salih und Thamud", function: "Salih-Erzählung", marker: "وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا — Sendeformel"},
        {verses: "11:69-83", label: "Ibrahim und Lut", function: "Gaeste Ibrahims, Luts Volk", marker: "وَلَقَدْ جَاءَتْ رُسُلُنَا إِبْرَاهِيمَ — narrative Eröffnung"},
        {verses: "11:84-95", label: "Shu'ayb und Madyan", function: "Shu'ayb-Erzählung", marker: "وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا — Sendeformel"},
        {verses: "11:96-123", label: "Musa und Schluss", function: "Musa-Kurzform, Zusammenfassung, Ermahnung", marker: "وَلَقَدْ أَرْسَلْنَا مُوسَىٰ — Sendeformel, dann Schlussermahnung"}
      ],
      keyFeature: "Sieben Prophetenerzählungen mit gleichem Schema: Sendeformel (وَإِلَىٰ/وَلَقَدْ أَرْسَلْنَا) → يَا قَوْمِ-Anrede → Ablehnung → Vernichtung. Die Nuh-Erzählung (V.25-49) ist mit 25 Versen die längste."
    }
  });
}

// --- Surah 13: Ar-Ra'd ---
if (!existingNums.has(13)) {
  newEntries.push({
    surah: 13,
    name: "Ar-Ra'd",
    verses: 43,
    structure: {
      type: "Zeichen-Argument-Struktur",
      segments: [
        {verses: "13:1-4", label: "Eröffnung: Schöpfungszeichen", function: "Muqatta'at, Himmel und Erde als Zeichen", marker: "المر — Muqatta'at, هُوَ الَّذِي — Relativsatzkette"},
        {verses: "13:5-18", label: "Argumentation: Leugner vs. Zeichen", function: "Auferstehungsargument, Gleichnisse", marker: "وَإِن تَعْجَبْ فَعَجَبٌ قَوْلُهُمْ — rhetorischer Ausruf"},
        {verses: "13:19-29", label: "Kontrastpaar: Wissende vs. Unwissende", function: "Vertragstreue, Achtsamkeit", marker: "أَفَمَن يَعْلَمُ — rhetorische Frage als Kontrastmarker"},
        {verses: "13:30-37", label: "Gesandtentrost und Widerlegung", function: "Quran-Würde, Ablehnung", marker: "كَذَٰلِكَ أَرْسَلْنَاكَ — Sendeformel"},
        {verses: "13:38-43", label: "Schluss: Gottes Urteil", function: "Gottes Wissen und Schlusswort", marker: "وَيَقُولُ الَّذِينَ كَفَرُوا — Leugnerrede + Schlussantwort"}
      ],
      keyFeature: "Der Donner (الرَّعْد, V.13) wird als kosmisches Zeichen eingesetzt, das Gottes Lobpreis artikuliert. Die Sure verbindet Naturzeichen mit argumentativer Rhetorik gegen Leugnung."
    }
  });
}

// --- Surah 14: Ibrahim ---
if (!existingNums.has(14)) {
  newEntries.push({
    surah: 14,
    name: "Ibrahim",
    verses: 52,
    structure: {
      type: "Narrative Gleichnis-Struktur",
      segments: [
        {verses: "14:1-4", label: "Eröffnung: Muqatta'at und Sendung", function: "Offenbarungsbezug, Sendung an Musa", marker: "الر كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ — Muqatta'at + Offenbarung"},
        {verses: "14:5-17", label: "Musa und Prophetenrede", function: "Musa-Sendung, Dialog Volk/Gesandte", marker: "وَلَقَدْ أَرْسَلْنَا مُوسَىٰ — Sendeformel"},
        {verses: "14:18-27", label: "Gleichnisse", function: "Asche-Gleichnis, Baum-Gleichnis (gut/schlecht)", marker: "مَثَلُ الَّذِينَ كَفَرُوا — Gleichnisformel, أَلَمْ تَرَ كَيْفَ — rhetorische Frage"},
        {verses: "14:28-34", label: "Undankbarkeit und Gottes Gaben", function: "Aufzählung der im Text genannten Gaben", marker: "أَلَمْ تَرَ إِلَى الَّذِينَ بَدَّلُوا — rhetorische Frage"},
        {verses: "14:35-41", label: "Ibrahims Gebet", function: "Direkte Rede Ibrahims", marker: "وَإِذْ قَالَ إِبْرَاهِيمُ رَبِّ — Vokativ + Bittgebet"},
        {verses: "14:42-52", label: "Schluss: Gerichtstag", function: "Aufschub und Abrechnung", marker: "وَلَا تَحْسَبَنَّ اللَّهَ غَافِلًا — Prohibitiv + eschatologische Szene"}
      ],
      keyFeature: "Das Doppelgleichnis vom guten und schlechten Baum (V.24-26) ist das strukturelle Zentrum. Ibrahim erscheint nur im Gebet (V.35-41), nicht in einer Erzählung — Ibrahim erscheint ausschließlich als redende Figur in direkter Rede, nicht als Akteur einer Handlung."
    }
  });
}

// --- Surah 15: Al-Hijr ---
if (!existingNums.has(15)) {
  newEntries.push({
    surah: 15,
    name: "Al-Hijr",
    verses: 99,
    structure: {
      type: "Narrative Reihung mit Rahmen",
      segments: [
        {verses: "15:1-15", label: "Eröffnung: Warnung und Leugnung", function: "Muqatta'at, Schutz des Quran, Leugnung", marker: "الر — Muqatta'at, إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ — Schutzzusage"},
        {verses: "15:16-25", label: "Schöpfungszeichen", function: "Himmel, Sterne, Erde", marker: "وَلَقَدْ جَعَلْنَا فِي السَّمَاءِ بُرُوجًا — Schöpfungskatalog"},
        {verses: "15:26-44", label: "Adam und Iblis", function: "Erschaffung aus Lehm, Iblis' Weigerung", marker: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ — narrative Eröffnung"},
        {verses: "15:45-79", label: "Erzählblock", function: "Paradies/Hölle, Ibrahim-Gaeste, Lut, Al-Hijr", marker: "إِنَّ الْمُتَّقِينَ — Kontrastpaar, Prophetenerzählungen"},
        {verses: "15:80-86", label: "Al-Hijr-Volk", function: "Steinland-Bewohner als warnendes Beispiel", marker: "وَلَقَدْ كَذَّبَ أَصْحَابُ الْحِجْرِ — Ortsname als Surenname"},
        {verses: "15:87-99", label: "Schluss: Trost und Lobpreis", function: "Sieben Wiederholte, Lobpreis bis zum Tod", marker: "وَلَقَدْ آتَيْنَاكَ سَبْعًا مِنَ الْمَثَانِي — Gabennennung, وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ — Schlussvers"}
      ],
      keyFeature: "Die Sure endet mit dem markanten Schlussvers V.99: وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ ('Diene deinem Herrn, bis die Gewissheit zu dir kommt'). Das Wort الحِجْر (V.80) gibt der Sure ihren Namen."
    }
  });
}

// --- Surah 16: An-Nahl ---
if (!existingNums.has(16)) {
  newEntries.push({
    surah: 16,
    name: "An-Nahl",
    verses: 128,
    structure: {
      type: "Zeichen-Katalog mit Gesetzgebung",
      segments: [
        {verses: "16:1-9", label: "Eröffnung: Gottes Befehl kommt", function: "Warnung, Schöpfungszeichen", marker: "أَتَىٰ أَمْرُ اللَّهِ — Perfekt als bevorstehend"},
        {verses: "16:10-21", label: "Naturzeichen-Katalog I", function: "Regen, Vieh, Sterne, Meer", marker: "هُوَ الَّذِي أَنزَلَ — anaphorische Relativsätze"},
        {verses: "16:22-50", label: "Leugnung und Argumentation", function: "Götzenkritik, Auferstehungsleugnung", marker: "إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ — zentrale These"},
        {verses: "16:51-69", label: "Naturzeichen-Katalog II", function: "Milch, Früchte, Bienen", marker: "وَأَوْحَىٰ رَبُّكَ إِلَى النَّحْلِ — Bienen als Zeichen (Surenname)"},
        {verses: "16:70-89", label: "Gottes Gaben und Undankbarkeit", function: "Gleichnisse, Auferstehungstag", marker: "وَاللَّهُ فَضَّلَ بَعْضَكُمْ — Gabenaufzaehlung"},
        {verses: "16:90-100", label: "Ethische Anweisungen", function: "Gerechtigkeit, Vertragstreue", marker: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ — zentrale ethische Formel"},
        {verses: "16:101-128", label: "Schluss: Offenbarung und Geduld", function: "Vorwurf der Faelschung, Ibrahim als Vorbild, Geduld", marker: "وَإِذَا بَدَّلْنَا آيَةً مَكَانَ آيَةٍ — Zeichensubstitution (آية مكان آية), ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ — Schlussimperativ"}
      ],
      keyFeature: "Reichste Aufzählung von Naturzeichen im Quran (Regen, Vieh, Sterne, Meer, Milch, Bienen, Früchte). Die Biene (النَّحْل, V.68) gibt der Sure ihren Namen. V.90 (إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ) gilt als eine der prägnantesten ethischen Formeln."
    }
  });
}

// --- Surah 17: Al-Isra ---
if (!existingNums.has(17)) {
  newEntries.push({
    surah: 17,
    name: "Al-Isra'",
    verses: 111,
    structure: {
      type: "Rahmenstruktur mit ethischem Zentrum",
      segments: [
        {verses: "17:1", label: "Eröffnung: Nachtreise", function: "Lobpreis + narrative Aussage", marker: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا — Lobpreis + Relativsatz"},
        {verses: "17:2-8", label: "Bani Isra'il und Schrift", function: "Thora, zweifache Verderbnis", marker: "وَآتَيْنَا مُوسَى الْكِتَابَ — Gabenverweis"},
        {verses: "17:9-22", label: "Quran und Ethik", function: "Quran als Führung, ethische Grundsaetze beginnen", marker: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي — Quranreferenz"},
        {verses: "17:23-39", label: "Ethischer Dekalog", function: "Gebotskette: Eltern, Verwandte, Verschwendung, Toetung, Unzucht", marker: "وَقَضَىٰ رَبُّكَ — wiederholte Gebotsformel, لَا تَقْتُلُوا — Prohibitivkette"},
        {verses: "17:40-60", label: "Auseinandersetzung mit Götzendienst", function: "Engelskritik, Argumentation", marker: "أَفَأَصْفَاكُمْ رَبُّكُم بِالْبَنِينَ — rhetorische Frage"},
        {verses: "17:61-72", label: "Adam und Iblis", function: "Iblis' Weigerung, menschliche Würde", marker: "وَإِذْ قُلْنَا لِلْمَلَائِكَةِ — narrativer Rückblick"},
        {verses: "17:73-100", label: "Prophetentrost und Argumentation", function: "Standfestigkeit, Quranrezitation, Auferstehungsargument", marker: "وَإِن كَادُوا لَيَفْتِنُونَكَ — Beinahe-Konstruktion"},
        {verses: "17:101-111", label: "Schluss: Musa und Lobpreis", function: "Musa-Pharao-Verweis, Schlusslobpreis", marker: "وَقُلِ الْحَمْدُ لِلَّهِ — Lobpreis als Schluss, Rahmen mit V.1"}
      ],
      keyFeature: "V.23-39 bilden einen 'ethischen Dekalog' — die längste zusammenhängende Gebotskette des Quran. Rahmenstruktur: Lobpreis am Anfang (سُبْحَانَ, V.1) und am Ende (الْحَمْدُ لِلَّهِ, V.111)."
    }
  });
}

// --- Surah 20: Ta-Ha ---
if (!existingNums.has(20)) {
  newEntries.push({
    surah: 20,
    name: "Ta-Ha",
    verses: 135,
    structure: {
      type: "Narrative Zentralstruktur",
      segments: [
        {verses: "20:1-8", label: "Eröffnung: Trost und Gottesattribute", function: "Muqatta'at, Quran als Erinnerung", marker: "طه — Muqatta'at, مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَىٰ — Negationsformel"},
        {verses: "20:9-98", label: "Musa-Block", function: "Ausführlichste Musa-Erzählung: Feuer, Sendung, Pharao, Auszug, Goldenes Kalb", marker: "وَهَلْ أَتَاكَ حَدِيثُ مُوسَىٰ — Erzähleroeffnung"},
        {verses: "20:99-114", label: "Überleitung: Quran und Wissen", function: "Quranverweis, Gerichtstag", marker: "كَذَٰلِكَ نَقُصُّ عَلَيْكَ — Meta-Narration"},
        {verses: "20:115-127", label: "Adam-Erzählung", function: "Adam, Iblis, Vertreibung", marker: "وَلَقَدْ عَهِدْنَا إِلَىٰ آدَمَ — narrativer Rückblick"},
        {verses: "20:128-135", label: "Schluss: Geduld und Ermahnung", function: "Historischer Verweis, Gebetszeiten", marker: "فَاصْبِرْ عَلَىٰ مَا يَقُولُونَ — Imperativ als Schluss"}
      ],
      keyFeature: "Die Musa-Erzählung (V.9-98) umfasst 90 von 135 Versen — die größte Einzelerzaehlung einer Sure. Sie enthält die detaillierteste Darstellung des Goldenen-Kalb-Vorfalls (V.83-98)."
    }
  });
}

// --- Surah 21: Al-Anbiya ---
if (!existingNums.has(21)) {
  newEntries.push({
    surah: 21,
    name: "Al-Anbiya'",
    verses: 112,
    structure: {
      type: "Prophetenkatalog-Struktur",
      segments: [
        {verses: "21:1-10", label: "Eröffnung: Warnung und Leugnung", function: "Abrechnung naht, Leugner verspotten", marker: "اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ — Perfekt als Nähezeichen"},
        {verses: "21:11-29", label: "Schöpfungsargument", function: "Himmel und Erde nicht als Spiel geschaffen", marker: "مَا خَلَقْنَا السَّمَاءَ وَالْأَرْضَ — Negationsformel"},
        {verses: "21:30-50", label: "Schöpfungszeichen und Sterblichkeit", function: "Wasser-Ursprung, Sterblichkeit aller", marker: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ — universale Aussage"},
        {verses: "21:51-73", label: "Prophetenkatalog I: Ibrahim, Lut, Nuh", function: "Ibrahim zerstört Götzen, Feuer-Wunder", marker: "وَلَقَدْ آتَيْنَا إِبْرَاهِيمَ رُشْدَهُ — Gabenverweis"},
        {verses: "21:74-91", label: "Prophetenkatalog II: Dawud bis Maryam", function: "Kurzcharakterisierungen vieler Propheten", marker: "وَدَاوُودَ وَسُلَيْمَانَ — asyndetische Aufzählung"},
        {verses: "21:92-112", label: "Schluss: Einheit und Gericht", function: "Eine Gemeinde, Gog/Magog, Schlussgebet", marker: "إِنَّ هَٰذِهِ أُمَّتُكُمْ أُمَّةً وَاحِدَةً — Einheitsformel"}
      ],
      keyFeature: "Die Sure enthält den umfangreichsten Prophetenkatalog des Quran — über 16 Propheten werden in Kurzform erwähnt. Ibrahims Götzen-Disputation (V.51-70) ist die ausführlichste narrative Episode."
    }
  });
}

// --- Surah 22: Al-Hajj ---
if (!existingNums.has(22)) {
  newEntries.push({
    surah: 22,
    name: "Al-Hajj",
    verses: 78,
    structure: {
      type: "Eschatologisch-Zeremonielle Mischstruktur",
      segments: [
        {verses: "22:1-7", label: "Eröffnung: Erdbeben der Stunde", function: "Eschatologische Szene, Warnung", marker: "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ — Vokativ + Imperativ"},
        {verses: "22:8-24", label: "Argumentation und Kontrastpaare", function: "Streiter gegen Gott, Kontrastpaare", marker: "وَمِنَ النَّاسِ مَن يُجَادِلُ — Klassifizierung"},
        {verses: "22:25-37", label: "Haddsch-Block", function: "Ka'ba, Pilgerfahrt, Opfertiere", marker: "وَإِذْ بَوَّأْنَا لِإِبْرَاهِيمَ مَكَانَ الْبَيْتِ — narrativer Bezug auf Ka'ba"},
        {verses: "22:38-57", label: "Kampferlaubnis und Zeichen", function: "Erste Kampferlaubnis, Schöpfungszeichen", marker: "أُذِنَ لِلَّذِينَ يُقَاتَلُونَ — Passiv als Erlaubnis"},
        {verses: "22:58-72", label: "Gottes Zeichen und Leugner", function: "Zeichen, Götzenkritik", marker: "ذَٰلِكَ بِأَنَّ اللَّهَ — Kausalformel"},
        {verses: "22:73-78", label: "Schluss: Erwählungsformel", function: "Fliegen-Gleichnis, Erwählungsformel", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا ارْكَعُوا — Imperativkette als Schluss, هُوَ سَمَّاكُمُ الْمُسْلِمِينَ"}
      ],
      keyFeature: "V.1-7: Eschatologische Eröffnung; V.25-37: Handlungsanweisungen (Haddsch-Kontext). V.40 (أُذِنَ لِلَّذِينَ يُقَاتَلُونَ) ist die erste Kampferlaubnis. V.73 enthält das Fliegen-Gleichnis."
    }
  });
}

// --- Surah 23: Al-Mu'minun ---
if (!existingNums.has(23)) {
  newEntries.push({
    surah: 23,
    name: "Al-Mu'minun",
    verses: 118,
    structure: {
      type: "Rahmenstruktur: Gläubigedefinition",
      segments: [
        {verses: "23:1-11", label: "Eröffnung: Gläubige-Definition", function: "Sieben Eigenschaften der Erfolgreichen", marker: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ — Perfekt + قَدْ, Relativsatzkette"},
        {verses: "23:12-22", label: "Schöpfungszeichen", function: "Menschliche Schöpfung, Naturzeichen", marker: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ — Schöpfungsformel"},
        {verses: "23:23-56", label: "Prophetenerzählungen", function: "Nuh, Hud, Musa, Isa", marker: "وَلَقَدْ أَرْسَلْنَا — wiederholte Sendeformel"},
        {verses: "23:57-77", label: "Kontrastpaar: sich Hütende vs. Leugner", function: "Tugendkatalog, Leugnungsvorwurf", marker: "إِنَّ الَّذِينَ هُم مِن خَشْيَةِ رَبِّهِم — Relativsatzkette (Parallele zu V.1-11)"},
        {verses: "23:78-92", label: "Schöpfungsargumente", function: "Sinne, Schöpfung, Auferstehung", marker: "قُل لِمَنِ الْأَرْضُ — rhetorische Fragen"},
        {verses: "23:93-118", label: "Schluss: Schutzsuche und Schlussgebet", function: "Schutzgebet, Auferstehungsszene", marker: "رَبِّ اغْفِرْ وَارْحَمْ — Bittgebet als Schluss"}
      ],
      keyFeature: "V.1-11 und V.57-61 bilden parallel konstruierte Tugendkataloge (Relativsatzketten mit الَّذِينَ هُم). Die Sure beginnt mit قَدْ أَفْلَحَ ('Erfolg hat') und endet mit إِنَّهُ لَا يُفْلِحُ ('keinen Erfolg hat') — antithetischer Rahmen."
    }
  });
}

// --- Surah 25: Al-Furqan ---
if (!existingNums.has(25)) {
  newEntries.push({
    surah: 25,
    name: "Al-Furqan",
    verses: 77,
    structure: {
      type: "Argumentativ-Hymnische Struktur",
      segments: [
        {verses: "25:1-9", label: "Eröffnung: Lobpreis und Leugnung", function: "Schriftherabsendung, Einwaende der Leugner", marker: "تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ — Lobpreis als Eröffnung"},
        {verses: "25:10-20", label: "Leugner-Einwaende", function: "Paradiesforderung, Engelsforderung", marker: "وَقَالَ الَّذِينَ لَا يَرْجُونَ — wiederholte Leugner-Reden"},
        {verses: "25:21-34", label: "Gerichtsszene und Argumentation", function: "Auferstehungsszene, Prophetengeschichten", marker: "وَقَالَ الرَّسُولُ يَا رَبِّ — Klagerede des Gesandten"},
        {verses: "25:35-44", label: "Historische Verweise", function: "Musa, Nuh, 'Ad, Thamud, Rass, Lut", marker: "وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ — Sendeformel"},
        {verses: "25:45-62", label: "Schöpfungszeichen", function: "Schatten, Nacht, Wind, Wasser, Verwandtschaft", marker: "أَلَمْ تَرَ إِلَىٰ رَبِّكَ كَيْفَ مَدَّ الظِّلَّ — rhetorische Frage"},
        {verses: "25:63-77", label: "Schluss: Ibad ar-Rahman", function: "Beschreibung der Gottesdiener", marker: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ — Tugendkatalog als Schluss"}
      ],
      keyFeature: "Der Abschluss (V.63-77) enthält den 'Ibad-ar-Rahman-Katalog' — neun Eigenschaften der Gottesdiener in Relativsatzkonstruktionen. Rahmen: Beginnt mit تَبَارَكَ (V.1) und endet mit قُلْ مَا يَعْبَأُ بِكُمْ (V.77)."
    }
  });
}

// --- Surah 26: Ash-Shu'ara ---
if (!existingNums.has(26)) {
  newEntries.push({
    surah: 26,
    name: "Ash-Shu'ara'",
    verses: 227,
    structure: {
      type: "Narrative Reihung mit Doppelrefrain",
      segments: [
        {verses: "26:1-9", label: "Eröffnung", function: "Muqatta'at, Trost für den Gesandten", marker: "طسم — Muqatta'at, لَعَلَّكَ بَاخِعٌ نَفْسَكَ — rhetorische Anrede"},
        {verses: "26:10-68", label: "Musa und Pharao", function: "Ausführlichste Musa-Pharao-Szene", marker: "وَإِذْ نَادَىٰ رَبُّكَ مُوسَىٰ — narrative Eröffnung"},
        {verses: "26:69-104", label: "Ibrahim", function: "Ibrahim-Argumentation gegen Vater und Volk", marker: "وَاتْلُ عَلَيْهِمْ نَبَأَ إِبْرَاهِيمَ — Erzählimperativ"},
        {verses: "26:105-122", label: "Nuh", function: "Nuh-Erzählung mit Refrain", marker: "كَذَّبَتْ قَوْمُ نُوحٍ الْمُرْسَلِينَ — Refrainformel"},
        {verses: "26:123-140", label: "Hud", function: "Hud und 'Ad", marker: "كَذَّبَتْ عَادٌ الْمُرْسَلِينَ — gleiche Formel"},
        {verses: "26:141-159", label: "Salih", function: "Salih und Thamud", marker: "كَذَّبَتْ ثَمُودُ الْمُرْسَلِينَ — gleiche Formel"},
        {verses: "26:160-175", label: "Lut", function: "Lut und sein Volk", marker: "كَذَّبَتْ قَوْمُ لُوطٍ الْمُرْسَلِينَ — gleiche Formel"},
        {verses: "26:176-191", label: "Shu'ayb", function: "Shu'ayb und Ayka-Leute", marker: "كَذَّبَ أَصْحَابُ الْأَيْكَةِ الْمُرْسَلِينَ — gleiche Formel"},
        {verses: "26:192-227", label: "Schluss: Quranwuerde und Dichter", function: "Herabsendung, Warnung, Dichter-Passage", marker: "وَالشُّعَرَاءُ يَتَّبِعُهُمُ الْغَاوُونَ — Dichter-Auseinandersetzung (Surenname)"}
      ],
      refrain: {
        arabic: "إِنَّ فِي ذَٰلِكَ لَآيَةً وَمَا كَانَ أَكْثَرُهُم مُؤْمِنِينَ / وَإِنَّ رَبَّكَ لَهُوَ الْعَزِيزُ الرَّحِيمُ",
        occurrences: 8,
        function: "Jede Erzählung endet mit diesem Doppelrefrain — Zeichen + Attributformel."
      },
      keyFeature: "Acht Erzählungen enden mit dem identischen Doppelrefrain (V.8-9, 67-68, 103-104, 121-122, 139-140, 158-159, 174-175, 190-191). Die كَذَّبَتْ + Volksname + الْمُرْسَلِينَ-Formel eröffnet jede Erzählung ab Nuh."
    }
  });
}

// --- Surah 27: An-Naml ---
if (!existingNums.has(27)) {
  newEntries.push({
    surah: 27,
    name: "An-Naml",
    verses: 93,
    structure: {
      type: "Narrative Blockkonstruktion",
      segments: [
        {verses: "27:1-6", label: "Eröffnung: Muqatta'at und Quranwuerde", function: "Schriftverweis", marker: "طس — Muqatta'at, تِلْكَ آيَاتُ الْقُرْآنِ — Selbstreferenz"},
        {verses: "27:7-14", label: "Musa: Feuer-Szene", function: "Berufung am Feuer", marker: "إِذْ قَالَ مُوسَىٰ لِأَهْلِهِ — narrative Eröffnung"},
        {verses: "27:15-44", label: "Sulayman-Block", function: "Sulayman, Ameisen, Wiedehopf, Saba-Königin", marker: "وَلَقَدْ آتَيْنَا دَاوُودَ وَسُلَيْمَانَ — Gabenverweis, النَّمْلُ — Ameise (Surenname)"},
        {verses: "27:45-58", label: "Salih und Lut", function: "Kurznarrative", marker: "وَلَقَدْ أَرْسَلْنَا إِلَىٰ ثَمُودَ — Sendeformel"},
        {verses: "27:59-66", label: "Schöpfungszeichen", function: "Rhetorische Fragen über Schöpfung", marker: "أَمَّنْ خَلَقَ — fünffache أَمَّنْ-Frage"},
        {verses: "27:67-93", label: "Schluss: Argumentation und Eschatologie", function: "Auferstehungszweifel, Gerichtstag", marker: "وَقَالَ الَّذِينَ كَفَرُوا — Leugnerrede + Entgegnung"}
      ],
      keyFeature: "Die Sulayman-Erzählung (V.15-44) ist das Zentrum — sie enthält die Ameisen-Rede (V.18-19, Surenname), den Wiedehopf als Boten und die Saba-Königin. Die fünffache أَمَّنْ-Fragenkette (V.60-64) ist ein markantes rhetorisches Muster."
    }
  });
}

// --- Surah 28: Al-Qasas ---
if (!existingNums.has(28)) {
  newEntries.push({
    surah: 28,
    name: "Al-Qasas",
    verses: 88,
    structure: {
      type: "Ausführliche Musa-Erzählung",
      segments: [
        {verses: "28:1-6", label: "Eröffnung: Muqatta'at und Vorschau", function: "Ankündigung der Erzählung", marker: "طسم — Muqatta'at, نَتْلُوا عَلَيْكَ — 'Wir tragen dir vor'"},
        {verses: "28:7-28", label: "Musa: Geburt bis Flucht", function: "Musa als Kind, Toetung, Flucht nach Madyan", marker: "وَأَوْحَيْنَا إِلَىٰ أُمِّ مُوسَىٰ — narrative Eröffnung"},
        {verses: "28:29-42", label: "Musa: Berufung und Pharao", function: "Feuer, Sendung, Pharao-Konfrontation", marker: "فَلَمَّا قَضَىٰ مُوسَى الْأَجَلَ — temporale Überleitung"},
        {verses: "28:43-50", label: "Quranverweis und Zeugnis", function: "Schriftbezug, Zeugenschaft", marker: "وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ — Gabenverweis"},
        {verses: "28:51-75", label: "Argumentation", function: "Schriftbesitzer, Schöpfungszeichen", marker: "وَلَقَدْ وَصَّلْنَا لَهُمُ الْقَوْلَ — Offenbarungsformel"},
        {verses: "28:76-84", label: "Qarun-Erzählung", function: "Qaruns Hochmut und Untergang", marker: "إِنَّ قَارُونَ كَانَ مِن قَوْمِ مُوسَىٰ — narrative Eröffnung"},
        {verses: "28:85-88", label: "Schluss: Trost und Vergänglichkeit", function: "Rückkehr-Verheissung, alles vergeht", marker: "كُلُّ شَيْءٍ هَالِكٌ إِلَّا وَجْهَهُ — Schlussformel"}
      ],
      keyFeature: "Detaillierteste Darstellung von Musas frueherer Lebensgeschichte (Geburt, Aufwachsen bei Pharao, Flucht). Die Qarun-Erzählung (V.76-84) bildet einen Kontrast zur Musa-Erzählung. V.88 (كُلُّ شَيْءٍ هَالِكٌ إِلَّا وَجْهَهُ) ist einer der prägnantesten Schlussverse."
    }
  });
}

// --- Surah 29: Al-'Ankabut ---
if (!existingNums.has(29)) {
  newEntries.push({
    surah: 29,
    name: "Al-'Ankabut",
    verses: 69,
    structure: {
      type: "Prüfungs-Diskursstruktur",
      segments: [
        {verses: "29:1-13", label: "Eröffnung: Prüfung der Gläubigen", function: "Muqatta'at, Prüfungsmotiv", marker: "الم أَحَسِبَ النَّاسُ أَن يُتْرَكُوا — rhetorische Frage"},
        {verses: "29:14-40", label: "Prophetenerzählungen", function: "Nuh, Ibrahim, Lut, Shu'ayb, 'Ad, Thamud", marker: "وَلَقَدْ أَرْسَلْنَا نُوحًا — Sendeformel"},
        {verses: "29:41-44", label: "Spinnengleichnis", function: "Schwäche der Götzen wie Spinnenhaus", marker: "مَثَلُ الَّذِينَ اتَّخَذُوا مِن دُونِ اللَّهِ أَوْلِيَاءَ كَمَثَلِ الْعَنكَبُوتِ — Gleichnisformel (Surenname)"},
        {verses: "29:45-55", label: "Quran und Argumentation", function: "Schriftrezitation, Zeichenverweis", marker: "اتْلُ مَا أُوحِيَ إِلَيْكَ — Rezitationsimperativ"},
        {verses: "29:56-69", label: "Schluss: Auswanderung und Führung", function: "Weite der Erde, Gottes Führung", marker: "يَا عِبَادِيَ الَّذِينَ آمَنُوا — Vokativ, وَالَّذِينَ جَاهَدُوا — Schluss"}
      ],
      keyFeature: "Das Spinnengleichnis (V.41, كَمَثَلِ الْعَنكَبُوتِ) gibt der Sure ihren Namen. Die Eröffnung (V.2-3: أَحَسِبَ النَّاسُ أَن يُتْرَكُوا) formuliert die Prüfung als Kernthema."
    }
  });
}

// --- Surah 30: Ar-Rum ---
if (!existingNums.has(30)) {
  newEntries.push({
    surah: 30,
    name: "Ar-Rum",
    verses: 60,
    structure: {
      type: "Zeichen-Reihenstruktur",
      segments: [
        {verses: "30:1-7", label: "Eröffnung: Roemer-Prophezeiung", function: "Muqatta'at, Sieg-Prophezeiung", marker: "الم غُلِبَتِ الرُّومُ — Muqatta'at + historischer Bezug"},
        {verses: "30:8-19", label: "Schöpfung und Geschichte", function: "Schöpfungsbetrachtung, Völker als Warnung", marker: "أَوَلَمْ يَتَفَكَّرُوا — rhetorische Frage"},
        {verses: "30:20-27", label: "Zeichen-Reihe", function: "Sechs Zeichen (Schöpfung, Paare, Schlaf, Blitz, Himmel, Auferstehung)", marker: "وَمِنْ آيَاتِهِ — sechsfache Zeichenformel"},
        {verses: "30:28-40", label: "Argumentation für Gottes Einheit", function: "Gleichnisse, Monotheismus", marker: "ضَرَبَ لَكُم مَثَلًا — Gleichnisformel"},
        {verses: "30:41-53", label: "Warnung und Naturzeichen", function: "Verderben auf Erden, Sendung", marker: "ظَهَرَ الْفَسَادُ فِي الْبَرِّ — Zustandsbeschreibung"},
        {verses: "30:54-60", label: "Schluss: Schwäche und Stärke", function: "Lebensalter, Gerichtstag", marker: "اللَّهُ الَّذِي خَلَقَكُم مِن ضَعْفٍ — Schwäche-Stärke-Zyklus"}
      ],
      keyFeature: "Die sechsfache وَمِنْ آيَاتِهِ-Formel (V.20-25) ist das prägnanteste Strukturmerkmal. Die historische Prophezeiung über die Roemer (V.2-4) ist einzigartig im Quran."
    }
  });
}

// --- Surah 31: Luqman ---
if (!existingNums.has(31)) {
  newEntries.push({
    surah: 31,
    name: "Luqman",
    verses: 34,
    structure: {
      type: "Weisheitsrede-Struktur",
      segments: [
        {verses: "31:1-7", label: "Eröffnung: Muqatta'at und Quranwuerde", function: "Quran als Führung, Spott-Kaeufer", marker: "الم تِلْكَ آيَاتُ الْكِتَابِ — Muqatta'at + Schriftreferenz"},
        {verses: "31:8-11", label: "Schöpfungszeichen", function: "Himmel, Berge, Geschöpfe", marker: "خَلَقَ السَّمَاوَاتِ — Schöpfungsformel"},
        {verses: "31:12-19", label: "Luqmans Weisheitsrede", function: "Direkte Rede: Ermahnungen an den Sohn", marker: "يَا بُنَيَّ — Vokativ an Sohn (vierfach: V.13, 16, 17)"},
        {verses: "31:20-30", label: "Argumentation und Zeichen", function: "Gottes Gaben, Lebensbaum-Gleichnis", marker: "أَلَمْ تَرَوْا — rhetorische Frage"},
        {verses: "31:31-34", label: "Schluss: Verborgenes Wissen", function: "Schiff-Zeichen, fünf verborgene Dinge", marker: "إِنَّ اللَّهَ عِندَهُ عِلْمُ السَّاعَةِ — Schlussformel"}
      ],
      keyFeature: "Luqmans Rede an seinen Sohn (V.12-19) ist die einzige längere Weisheitsrede einer nicht-prophetischen Figur im Quran. Der Vokativ يَا بُنَيَّ ('mein Soehnchen', Diminutiv) strukturiert die Rede."
    }
  });
}

// --- Surah 32: As-Sajda ---
if (!existingNums.has(32)) {
  newEntries.push({
    surah: 32,
    name: "As-Sajda",
    verses: 30,
    structure: {
      type: "Schöpfungs-Eschatologie-Struktur",
      segments: [
        {verses: "32:1-3", label: "Eröffnung: Muqatta'at und Offenbarung", function: "Schriftverweis, Bestätigung", marker: "الم تَنزِيلُ الْكِتَابِ — Muqatta'at + Nominalsatz"},
        {verses: "32:4-11", label: "Schöpfung und Menschenwerdung", function: "Sechs Tage, Menschenschoepfung, Seele", marker: "اللَّهُ الَّذِي خَلَقَ — Relativsatzkette"},
        {verses: "32:12-17", label: "Gerichtsszene und Niederwerfung", function: "Reue der Leugner, Belohnung der Gläubigen", marker: "وَلَوْ تَرَىٰ إِذِ الْمُجْرِمُونَ — Irrealis + Niederwerfungsvers"},
        {verses: "32:18-22", label: "Kontrastpaar", function: "Gläubige vs. Sünder", marker: "أَفَمَن كَانَ مُؤْمِنًا — rhetorische Kontrastfrage"},
        {verses: "32:23-30", label: "Schluss: Musa und Warten", function: "Musa-Schriftverweis, Geduld", marker: "وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ — Gabenverweis, فَأَعْرِضْ عَنْهُمْ وَانتَظِرْ — Schlussimperativ"}
      ],
      keyFeature: "V.15-16 enthalten das Wort sajda (سَجْدَة), das der Sure ihren Namen gibt. Die Schöpfungspassage (V.4-9) ist eine der detailliertesten Darstellungen der embryonalen Entwicklung."
    }
  });
}

// --- Surah 33: Al-Ahzab ---
if (!existingNums.has(33)) {
  newEntries.push({
    surah: 33,
    name: "Al-Ahzab",
    verses: 73,
    structure: {
      type: "Ereignisbezogene Mischstruktur",
      segments: [
        {verses: "33:1-8", label: "Eröffnung: Achtsamkeit und Status des Nabi", function: "Imperativ an den Nabi und Heuchler", marker: "يَا أَيُّهَا النَّبِيُّ اتَّقِ اللَّهَ — Vokativ an den Nabi"},
        {verses: "33:9-27", label: "Angriff der Ahzab", function: "Bedrohung, Heuchler, Hilfe des Textsprechers", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا — Erinnerungsformel"},
        {verses: "33:28-34", label: "Ehefrauen des Nabi", function: "Anweisungen an die Ehefrauen des Nabi", marker: "يَا أَيُّهَا النَّبِيُّ قُل لِأَزْوَاجِكَ — Vokativ + قُلْ"},
        {verses: "33:35-44", label: "Verhaltensnormen und Lohn", function: "Tugendkatalog, Zaynab-Passage", marker: "إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ — Doppelaufzaehlung"},
        {verses: "33:45-58", label: "Rolle des Nabi und Sozialregeln", function: "Nabi als Zeuge, Eheregeln", marker: "يَا أَيُّهَا النَّبِيُّ إِنَّا أَرْسَلْنَاكَ — Sendeformel"},
        {verses: "33:59-73", label: "Schluss: Verschleierung und Treuhandschaft", function: "Bekleidung, Heuchlerwarnung, Amana", marker: "يَا أَيُّهَا النَّبِيُّ قُل لِأَزْوَاجِكَ — Vokativ, إِنَّا عَرَضْنَا الْأَمَانَةَ — Schlussaussage"}
      ],
      keyFeature: "Höchste Konzentration von يَا أَيُّهَا النَّبِيُّ-Anreden (fünfmal). Der Schlussvers (V.72-73) über die Amana (Treuhandschaft) steht thematisch isoliert und bildet einen kosmischen Abschluss."
    }
  });
}

// --- Surah 34: Saba ---
if (!existingNums.has(34)) {
  newEntries.push({
    surah: 34,
    name: "Saba'",
    verses: 54,
    structure: {
      type: "Narrative Argumentation",
      segments: [
        {verses: "34:1-9", label: "Eröffnung: Lobpreis und Auferstehung", function: "Lobpreis, Leugner, Zeichenverweis", marker: "الْحَمْدُ لِلَّهِ — Lobpreis als Eröffnung"},
        {verses: "34:10-14", label: "Dawud und Sulayman", function: "Gaben an beide, Sulaymanss Tod", marker: "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا — Gabenverweis"},
        {verses: "34:15-21", label: "Saba-Erzählung", function: "Saba-Volk, Dammbruch, Zerstreuung", marker: "لَقَدْ كَانَ لِسَبَإٍ فِي مَسْكَنِهِمْ آيَةٌ — narrative Eröffnung (Surenname)"},
        {verses: "34:22-33", label: "Argumentation gegen Götzendienst", function: "Götzen haben keine Macht", marker: "قُلِ ادْعُوا الَّذِينَ زَعَمْتُم — قُلْ-Imperativ"},
        {verses: "34:34-42", label: "Reichtum und Hochmut", function: "Wohlstand als Täuschung", marker: "وَمَا أَرْسَلْنَا فِي قَرْيَةٍ — Sendeformel"},
        {verses: "34:43-54", label: "Schluss: Leugnung und Reue", function: "Quranleugnung, Reue kommt zu spät", marker: "وَإِذَا تُتْلَىٰ عَلَيْهِمْ — Rezitationsformel + Schluss"}
      ],
      keyFeature: "Drei narrative Bloecke (Dawud/Sulayman, Saba, Götzendiener) illustrieren den Zusammenhang von Gabe und Undankbarkeit. Der Dammbruch von Saba (V.16: سَيْلَ الْعَرِمِ) ist ein konkretes historisches Zeichen."
    }
  });
}

// --- Surah 35: Fatir ---
if (!existingNums.has(35)) {
  newEntries.push({
    surah: 35,
    name: "Fatir",
    verses: 45,
    structure: {
      type: "Lobpreis-Argument-Struktur",
      segments: [
        {verses: "35:1-7", label: "Eröffnung: Lobpreis und Engel", function: "Schöpferlob, Satanswarnung", marker: "الْحَمْدُ لِلَّهِ فَاطِرِ السَّمَاوَاتِ — Lobpreis + Partizip (Surenname)"},
        {verses: "35:8-14", label: "Täuschung und Schwäche der Götzen", function: "Gleichnis, Blindheit, Götzen hören nicht", marker: "أَفَمَن زُيِّنَ لَهُ — rhetorische Frage"},
        {verses: "35:15-26", label: "Gottes Unabhängigkeit und Gesandte", function: "Menschen brauchen Gott, Gesandtenkette", marker: "يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ — Vokativ + Prädikation"},
        {verses: "35:27-35", label: "Schöpfungszeichen und Schrift", function: "Farbvielfalt, Schriftrezipienten", marker: "أَلَمْ تَرَ أَنَّ اللَّهَ أَنزَلَ — rhetorische Frage"},
        {verses: "35:36-45", label: "Schluss: Kontrast und Aufschub", function: "Leugner-Reue, Gottes Aufschub", marker: "وَالَّذِينَ كَفَرُوا لَهُمْ نَارُ جَهَنَّمَ — Kontrastmarker"}
      ],
      keyFeature: "V.15 (يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ) ist eine der prägnantesten anthropologischen Aussagen: 'Ihr seid die Beduerftigen gegenüber Gott'. Die Sure verbindet Lobpreis (V.1) mit Argument."
    }
  });
}

// --- Surah 37: As-Saffat ---
if (!existingNums.has(37)) {
  newEntries.push({
    surah: 37,
    name: "As-Saffat",
    verses: 182,
    structure: {
      type: "Schwur-Erzählreihung mit Refrain",
      segments: [
        {verses: "37:1-10", label: "Schwurkette und Himmelsbild", function: "Schwur auf Engel, Himmelsbewachung", marker: "وَالصَّافَّاتِ صَفًّا — Schwurformel (Surenname)"},
        {verses: "37:11-39", label: "Leugner und Gerichtsszene", function: "Spott, Kontrastpaar", marker: "فَاسْتَفْتِهِمْ — rhetorische Herausforderung"},
        {verses: "37:40-74", label: "Paradies und Hölle", function: "Beschreibung, Dialog", marker: "إِلَّا عِبَادَ اللَّهِ الْمُخْلَصِينَ — Ausnahmeformel"},
        {verses: "37:75-113", label: "Prophetenkette: Nuh, Ibrahim, Isma'il", function: "Ibrahim-Opferszene, Isaak/Isma'il", marker: "وَلَقَدْ نَادَانَا نُوحٌ — narrative Eröffnung"},
        {verses: "37:114-132", label: "Musa, Harun, Ilyas, Lut", function: "Kurznarrative mit Refrain", marker: "سَلَامٌ عَلَىٰ مُوسَىٰ — Friedensgruss-Refrain"},
        {verses: "37:133-148", label: "Lut und Yunus", function: "Lut-Kurzform, Yunus-Fisch-Szene", marker: "وَإِنَّ لُوطًا لَمِنَ الْمُرْسَلِينَ — Zugehörigkeitsformel"},
        {verses: "37:149-182", label: "Schluss: Widerlegung und Lobpreis", function: "Engelskritik, Schlusslob", marker: "أَفَأَصْفَاكُمْ رَبُّكُم بِالْبَنِينَ — rhetorische Frage, سُبْحَانَ رَبِّكَ — Schlusslob"}
      ],
      refrain: {
        arabic: "سَلَامٌ عَلَىٰ + Prophetenname",
        occurrences: 5,
        function: "Friedensgruss nach jeder Erzählung: Nuh (V.79), Ibrahim (V.109), Musa/Harun (V.120), Ilyas (V.130), Schluss (V.181)."
      },
      keyFeature: "Fünffacher Friedensgruss-Refrain (سَلَامٌ عَلَىٰ) nach jeder Prophetenerzaehlung. Die Ibrahim-Opferszene (V.100-111) ist die ausführlichste Darstellung dieses Motivs im Quran."
    }
  });
}

// --- Surah 38: Sad ---
if (!existingNums.has(38)) {
  newEntries.push({
    surah: 38,
    name: "Sad",
    verses: 88,
    structure: {
      type: "Narrative Sammlung mit Iblis-Szene",
      segments: [
        {verses: "38:1-11", label: "Eröffnung: Schwur und Leugnung", function: "Muqatta'at, Verwunderung der Leugner", marker: "ص وَالْقُرْآنِ ذِي الذِّكْرِ — Muqatta'at + Schwur"},
        {verses: "38:12-16", label: "Historische Verweise", function: "Nuh, 'Ad, Pharao, Thamud, Lut", marker: "كَذَّبَتْ قَبْلَهُمْ — Leugnungsformel"},
        {verses: "38:17-26", label: "Dawud-Erzählung", function: "Parabel der Streiter, Vergebung", marker: "اصْبِرْ عَلَىٰ مَا يَقُولُونَ وَاذْكُرْ عَبْدَنَا دَاوُودَ — Erinnerungsimperativ"},
        {verses: "38:27-29", label: "Schöpfungszweck", function: "Himmel und Erde nicht grundlos geschaffen", marker: "وَمَا خَلَقْنَا السَّمَاءَ وَالْأَرْضَ — Negationsformel"},
        {verses: "38:30-40", label: "Sulayman-Erzählung", function: "Pferde, Thron, Prüfung", marker: "وَوَهَبْنَا لِدَاوُودَ سُلَيْمَانَ — Gabenverweis"},
        {verses: "38:41-44", label: "Ayyub-Erzählung", function: "Leid, Geduld, Heilung", marker: "وَاذْكُرْ عَبْدَنَا أَيُّوبَ — Erinnerungsimperativ"},
        {verses: "38:45-54", label: "Prophetenkatalog", function: "Ibrahim, Ishaq, Ya'qub, Ilyas, Al-Yasa'", marker: "وَاذْكُرْ عِبَادَنَا — Erinnerungsformel"},
        {verses: "38:55-70", label: "Kontrastpaar: Paradies/Hölle", function: "Beschreibung beider Orte", marker: "هَٰذَا — deiktisch, إِنَّ لِلطَّاغِينَ — Kontrastmarker"},
        {verses: "38:71-88", label: "Schluss: Adam und Iblis", function: "Schöpfung, Iblis' Weigerung, Schlussformel", marker: "إِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ — narrative Eröffnung"}
      ],
      keyFeature: "Die Sure verwendet اذْكُرْ عَبْدَنَا ('erwähne unseren Diener') als Strukturformel für Dawud (V.17), Ayyub (V.41) und die Gruppe (V.45). Die Iblis-Szene (V.71-85) schließt die Sure mit einer kosmischen Perspektive."
    }
  });
}

// --- Surah 39: Az-Zumar ---
if (!existingNums.has(39)) {
  newEntries.push({
    surah: 39,
    name: "Az-Zumar",
    verses: 75,
    structure: {
      type: "Monotheismus-Diskurs mit Schlussszene",
      segments: [
        {verses: "39:1-7", label: "Eröffnung: Offenbarung und Aufrichtigkeit", function: "Herabsendung, Warnung vor Beigesellung", marker: "تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ — Offenbarungsformel"},
        {verses: "39:8-21", label: "Menschliches Verhalten in Not", function: "Kontrastpaare, Zeichen, Gleichnisse", marker: "وَإِذَا مَسَّ الْإِنسَانَ ضُرٌّ — Verhaltensmuster"},
        {verses: "39:22-35", label: "Quranwuerde und Achtsamkeit", function: "Quran als bestes Wort, Kontrastpaare", marker: "اللَّهُ نَزَّلَ أَحْسَنَ الْحَدِيثِ — Quranattribut"},
        {verses: "39:36-52", label: "Trost und Argumentation", function: "Gottes Genügesamkeit, Schlüsselmacht", marker: "أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ — rhetorische Frage"},
        {verses: "39:53-63", label: "Reue-Block", function: "Aufruf zur Umkehr, Gottes Vergebung", marker: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا — Vokativ + Vergebungszusage"},
        {verses: "39:64-75", label: "Schluss: Gerichtsszene in Scharen", function: "Ablehnung der Götzen, Scharen zum Paradies/Hölle", marker: "وَسِيقَ الَّذِينَ كَفَرُوا إِلَىٰ جَهَنَّمَ زُمَرًا — Scharenformel (Surenname)"}
      ],
      keyFeature: "V.53 (قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَحْمَةِ اللَّهِ) enthält die umfassendste Vergebungszusage. Die Schlussszene (V.71-75) beschreibt das Eintreffen in Scharen (زُمَرًا), was den Surennamen bildet."
    }
  });
}

// --- Surah 40: Ghafir ---
if (!existingNums.has(40)) {
  newEntries.push({
    surah: 40,
    name: "Ghafir",
    verses: 85,
    structure: {
      type: "Narrative Diskursstruktur mit Rede",
      segments: [
        {verses: "40:1-6", label: "Eröffnung: Muqatta'at und Attribute", function: "Gottes Vergebung und Strenge", marker: "حم — Muqatta'at, غَافِرِ الذَّنبِ — Attribut (Surenname)"},
        {verses: "40:7-9", label: "Engelsgebet", function: "Fuerbittegebet der Throntraeger", marker: "الَّذِينَ يَحْمِلُونَ الْعَرْشَ — Relativsatz"},
        {verses: "40:10-22", label: "Gerichtsszene und Warnung", function: "Dialog der Verdammten, historische Verweise", marker: "إِنَّ الَّذِينَ كَفَرُوا يُنَادَوْنَ — Gerichts-Dialog"},
        {verses: "40:23-46", label: "Musa-Erzählung und Gläubiger", function: "Musa bei Pharao, Rede des Gläubigen aus Pharaos Sippe", marker: "وَقَالَ رَجُلٌ مُؤْمِنٌ مِنْ آلِ فِرْعَوْنَ — narrative Eröffnung"},
        {verses: "40:47-55", label: "Höllendialog und Geduld", function: "Dialog in der Hölle, Geduldsimperativ", marker: "وَإِذْ يَتَحَاجُّونَ فِي النَّارِ — temporaler Rückblick"},
        {verses: "40:56-68", label: "Argumentation gegen Hochmut", function: "Schöpfungszeichen, Hochmut-Kritik", marker: "إِنَّ الَّذِينَ يُجَادِلُونَ فِي آيَاتِ اللَّهِ — Warnung"},
        {verses: "40:69-85", label: "Schluss: Götzen und Strafe", function: "Götzen bereuen, Warnung nutzlos für Leugner", marker: "أَلَمْ يَسِيرُوا فِي الْأَرْضِ — rhetorische Frage, فَلَمْ يَكُ يَنفَعُهُمْ — Schlussformel"}
      ],
      keyFeature: "Die Rede des Gläubigen aus Pharaos Sippe (V.28-46) ist die längste Einzelrede einer unbenannten Figur im Quran. Die Ha-Mim-Muqatta'at (حم) eröffnen eine Siebenergruppe (Suren 40-46)."
    }
  });
}

// --- Surah 41: Fussilat ---
if (!existingNums.has(41)) {
  newEntries.push({
    surah: 41,
    name: "Fussilat",
    verses: 54,
    structure: {
      type: "Offenbarungs-Diskurs",
      segments: [
        {verses: "41:1-8", label: "Eröffnung: Ha-Mim und Quranbeschreibung", function: "Muqatta'at, Quran als arabische Schrift", marker: "حم تَنزِيلٌ مِنَ الرَّحْمَٰنِ — Muqatta'at + Offenbarungsformel"},
        {verses: "41:9-12", label: "Schöpfung in sechs Tagen", function: "Erde, Berge, Himmel, Sterne", marker: "قُلْ أَئِنَّكُمْ لَتَكْفُرُونَ — قُلْ + rhetorische Frage"},
        {verses: "41:13-18", label: "Warnung: 'Ad und Thamud", function: "Historische Verweise", marker: "فَإِنْ أَعْرَضُوا فَقُلْ أَنذَرْتُكُمْ صَاعِقَةً — Blitzwarnung"},
        {verses: "41:19-25", label: "Gerichtsszene: Zeugenschaft der Glieder", function: "Haut, Augen, Ohren bezeugen", marker: "وَقَالُوا لِجُلُودِهِمْ لِمَ شَهِدتُمْ — Dialog mit Körperteilen"},
        {verses: "41:26-36", label: "Quranfeindlichkeit und Standfestigkeit", function: "Leugner stoeren Rezitation, Gegenstrategien", marker: "وَقَالَ الَّذِينَ كَفَرُوا لَا تَسْمَعُوا لِهَٰذَا الْقُرْآنِ — Leugner-Strategie"},
        {verses: "41:37-54", label: "Schluss: Zeichen und Wahrheit", function: "Naturzeichen, Quranbestaetigung", marker: "سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ — Zeichenverheissung"}
      ],
      keyFeature: "V.19-22 enthalten die einzigartige Szene, in der Haut und Körperteile gegen ihre Besitzer aussagen. V.44 stellt die Frage, was wäre, wenn der Quran nicht-arabisch wäre — einzigartiger Kontrafaktisch."
    }
  });
}

// --- Surah 42: Ash-Shura ---
if (!existingNums.has(42)) {
  newEntries.push({
    surah: 42,
    name: "Ash-Shura",
    verses: 53,
    structure: {
      type: "Offenbarungs-Diskurs mit Shura-Motiv",
      segments: [
        {verses: "42:1-9", label: "Eröffnung: Doppelte Muqatta'at und Einheit", function: "Offenbarung, Einheitsgebot", marker: "حم عسق — doppelte Muqatta'at (einzigartig)"},
        {verses: "42:10-19", label: "Einheit der Religion", function: "Keine Spaltung, Gott als Richter", marker: "شَرَعَ لَكُم مِنَ الدِّينِ — Religionsformel"},
        {verses: "42:20-29", label: "Irdisches und Jenseitiges", function: "Wer Jenseits will vs. Diesseits, Vergebung", marker: "مَن كَانَ يُرِيدُ حَرْثَ الْآخِرَةِ — Kontrastpaar"},
        {verses: "42:30-35", label: "Schiff-Zeichen", function: "Schiffe als Zeichen, Naturgewalt", marker: "وَمِنْ آيَاتِهِ الْجَوَارِ — Zeichenformel"},
        {verses: "42:36-43", label: "Shura und Gemeinschaftsethik", function: "Beratung als Gemeinschaftsprinzip, Vergebung", marker: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ — Shura-Formel (Surenname)"},
        {verses: "42:44-53", label: "Schluss: Offenbarungsmodi", function: "Drei Formen der Offenbarung, Weg-Metapher", marker: "وَمَا كَانَ لِبَشَرٍ أَن يُكَلِّمَهُ اللَّهُ — Offenbarungstheorie"}
      ],
      keyFeature: "Einzige Sure mit doppelter Muqatta'at-Kombination (حم عسق). V.38 (وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ, 'ihre Angelegenheiten regeln sie durch Beratung') ist die namengebende Stelle. V.51 beschreibt drei Offenbarungsmodi."
    }
  });
}

// --- Surah 43: Az-Zukhruf ---
if (!existingNums.has(43)) {
  newEntries.push({
    surah: 43,
    name: "Az-Zukhruf",
    verses: 89,
    structure: {
      type: "Polemisch-Argumentative Struktur",
      segments: [
        {verses: "43:1-8", label: "Eröffnung: Quranwuerde", function: "Muqatta'at, Quran als arabische Lesung", marker: "حم وَالْكِتَابِ الْمُبِينِ — Muqatta'at + Schwur"},
        {verses: "43:9-25", label: "Schöpfung und Götzenkritik", function: "Schöpfungszeichen, Engelskritik", marker: "وَلَئِن سَأَلْتَهُم — Wenn-du-fragst-Formel"},
        {verses: "43:26-35", label: "Ibrahim und Goldschmuck", function: "Ibrahim-Verweis, Wohlstand als Täuschung", marker: "وَإِذْ قَالَ إِبْرَاهِيمُ — narrativer Rückblick, زُخْرُفًا — Goldschmuck (Surenname)"},
        {verses: "43:36-45", label: "Qarin und fruehere Gesandte", function: "Teufel-Gefährte, Musa-Verweis", marker: "وَمَن يَعْشُ عَن ذِكْرِ الرَّحْمَٰنِ — Konditionalsatz"},
        {verses: "43:46-65", label: "Musa-Pharao und Isa-Block", function: "Pharao-Spott, Isa als Beispiel", marker: "وَلَقَدْ أَرْسَلْنَا مُوسَىٰ — Sendeformel, وَلَمَّا ضُرِبَ ابْنُ مَرْيَمَ مَثَلًا — Isa als Gleichnis"},
        {verses: "43:66-89", label: "Schluss: Gerichtstag und Wissen der Stunde", function: "Gerichtsszene, Trost, Schlussformel", marker: "هَلْ يَنظُرُونَ إِلَّا السَّاعَةَ — rhetorische Frage"}
      ],
      keyFeature: "V.33 stellt fest, dass wenn alle Menschen Leugner würden, Gott ihnen Häuser mit Goldschmuck (زُخْرُف, Surenname) gaebe — materielle Werte sind nichtig. Die Isa-Passage (V.57-65) betont seine Rolle als Zeichen, nicht als Gott."
    }
  });
}

// --- Surah 44: Ad-Dukhan ---
if (!existingNums.has(44)) {
  newEntries.push({
    surah: 44,
    name: "Ad-Dukhan",
    verses: 59,
    structure: {
      type: "Eschatologisch-Narrative Kurzstruktur",
      segments: [
        {verses: "44:1-8", label: "Eröffnung: Muqatta'at und gesegnete Nacht", function: "Herabsendung, weise Entscheidung", marker: "حم وَالْكِتَابِ الْمُبِينِ — Muqatta'at + Schwur"},
        {verses: "44:9-16", label: "Rauch-Warnung", function: "Himmel bringt Rauch", marker: "فَارْتَقِبْ يَوْمَ تَأْتِي السَّمَاءُ بِدُخَانٍ — Rauch (Surenname)"},
        {verses: "44:17-33", label: "Pharao-Erzählung", function: "Musa-Sendung, Auszug, Bestrafung", marker: "وَلَقَدْ فَتَنَّا قَبْلَهُمْ قَوْمَ فِرْعَوْنَ — Prüfungsformel"},
        {verses: "44:34-42", label: "Leugner und Auferstehung", function: "Erste-Schöpfung-Argument", marker: "إِنَّ هَٰؤُلَاءِ لَيَقُولُونَ — Leugnerrede"},
        {verses: "44:43-57", label: "Hölle und Paradies", function: "Kontrastbeschreibung", marker: "إِنَّ شَجَرَتَ الزَّقُّومِ — Höllenbaum, إِنَّ الْمُتَّقِينَ — Kontrastpaar"},
        {verses: "44:58-59", label: "Schluss: Erleichterung", function: "Quran erleichtert, Warteimperativ", marker: "فَإِنَّمَا يَسَّرْنَاهُ — Erleichterungsformel, فَارْتَقِبْ — Ringschluss mit V.10"}
      ],
      keyFeature: "Die Sure rahmt sich durch den Imperativ فَارْتَقِبْ ('so warte ab') in V.10 und V.59. Der Rauch (الدُّخَان, V.10) als kosmisches Zeichen gibt der Sure ihren Namen."
    }
  });
}

// --- Surah 45: Al-Jathiya ---
if (!existingNums.has(45)) {
  newEntries.push({
    surah: 45,
    name: "Al-Jathiya",
    verses: 37,
    structure: {
      type: "Zeichen-Warnung-Struktur",
      segments: [
        {verses: "45:1-6", label: "Eröffnung: Muqatta'at und Zeichen", function: "Offenbarung, Himmels- und Erdzeichen", marker: "حم تَنزِيلُ الْكِتَابِ — Muqatta'at + Offenbarung"},
        {verses: "45:7-11", label: "Warnung an Spottende", function: "Wehe jedem Lügner", marker: "وَيْلٌ لِكُلِّ أَفَّاكٍ — Wehe-Ruf"},
        {verses: "45:12-20", label: "Zeichen und Schrift", function: "Meer, Himmel, Gesetzgebung für Israel", marker: "اللَّهُ الَّذِي سَخَّرَ لَكُمُ الْبَحْرَ — Dienstbarmachung"},
        {verses: "45:21-26", label: "Gegenüberstellung", function: "Gleiche Behandlung? Nein. Kontrastpaar", marker: "أَمْ حَسِبَ الَّذِينَ اجْتَرَحُوا — rhetorische Frage"},
        {verses: "45:27-37", label: "Schluss: Knieende am Gerichtstag", function: "Jede Gemeinschaft kniend", marker: "وَتَرَىٰ كُلَّ أُمَّةٍ جَاثِيَةً — kniend (Surenname)"}
      ],
      keyFeature: "Das Bild aller Gemeinschaften kniend (جَاثِيَةً, V.28) gibt der Sure ihren Namen. Die Sure enthält die Aussage, dass die Zeit (الدَّهْر) allein die Leugner vernichtet — was als Zitat ihrer Position wiedergegeben wird (V.24)."
    }
  });
}

// --- Surah 46: Al-Ahqaf ---
if (!existingNums.has(46)) {
  newEntries.push({
    surah: 46,
    name: "Al-Ahqaf",
    verses: 35,
    structure: {
      type: "Argumentativ-Narrative Struktur",
      segments: [
        {verses: "46:1-6", label: "Eröffnung: Muqatta'at und Götzenkritik", function: "Offenbarung, Götzen reagieren nicht", marker: "حم تَنزِيلُ الْكِتَابِ — Muqatta'at"},
        {verses: "46:7-14", label: "Vorwuerfe und Elternpflicht", function: "Quran als Erfindung?, Elternehre", marker: "وَإِذَا تُتْلَىٰ عَلَيْهِمْ — Rezitationsformel, وَوَصَّيْنَا الْإِنسَانَ — Elternformel"},
        {verses: "46:15-20", label: "Elternpflicht und Kontrastpaare", function: "Dankbarkeit vs. Undankbarkeit", marker: "وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا — Elterngebot"},
        {verses: "46:21-28", label: "'Ad-Erzählung: Al-Ahqaf", function: "Hud und 'Ad in den Sandduenen", marker: "وَاذْكُرْ أَخَا عَادٍ — Erinnerungsformel, Ahqaf (Surenname)"},
        {verses: "46:29-35", label: "Schluss: Jinn hören Quran, Geduld", function: "Jinn-Szene, Geduldsimperativ", marker: "وَإِذْ صَرَفْنَا إِلَيْكَ نَفَرًا مِنَ الْجِنِّ — Jinn hören zu"}
      ],
      keyFeature: "Letzte Sure der Ha-Mim-Gruppe (Suren 40-46). Die Al-Ahqaf ('Sandduenen', V.21) sind der Ort der 'Ad-Bestrafung. Die Jinn-Hoer-Szene (V.29-32) bereitet thematisch Sure 72 vor."
    }
  });
}

// --- Surah 47: Muhammad ---
if (!existingNums.has(47)) {
  newEntries.push({
    surah: 47,
    name: "Muhammad",
    verses: 38,
    structure: {
      type: "Kampf-Diskurs",
      segments: [
        {verses: "47:1-6", label: "Eröffnung: Kontrastpaar", function: "Leugner vs. Gläubige", marker: "الَّذِينَ كَفَرُوا ... وَالَّذِينَ آمَنُوا — Kontrastpaar als Eröffnung"},
        {verses: "47:7-15", label: "Kampfanweisungen und Paradies", function: "Taktik, Flussparadies", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن تَنصُرُوا اللَّهَ — Vokativ + Konditionalsatz"},
        {verses: "47:16-24", label: "Heuchler-Kritik", function: "Heuchler verweigern Gehorsam", marker: "وَمِنْهُم مَن يَسْتَمِعُ إِلَيْكَ — Klassifizierung"},
        {verses: "47:25-32", label: "Engel und Heuchelei", function: "Todesengel, Entlarvung", marker: "فَكَيْفَ إِذَا تَوَفَّتْهُمُ الْمَلَائِكَةُ — rhetorische Frage"},
        {verses: "47:33-38", label: "Schluss: Standfestigkeit und Sparsamkeit", function: "Gehorsamspflicht, Gottes Unabhängigkeit", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا — Vokativ + Imperativ"}
      ],
      keyFeature: "Einzige Sure, die Muhammad namentlich erwähnt (V.2). Die Paradies-Beschreibung (V.15) mit vier Fluessen (Wasser, Milch, Wein, Honig) ist eine der detailliertesten."
    }
  });
}

// --- Surah 48: Al-Fath ---
if (!existingNums.has(48)) {
  newEntries.push({
    surah: 48,
    name: "Al-Fath",
    verses: 29,
    structure: {
      type: "Sieges-Diskurs",
      segments: [
        {verses: "48:1-7", label: "Eröffnung: Offener Sieg", function: "Siegesverkündung, Gottes Beistand", marker: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا — Siegesformel (Surenname)"},
        {verses: "48:8-14", label: "Gesandtenrolle und Treueid", function: "Zeuge, Künder, Treueid unter dem Baum", marker: "إِنَّا أَرْسَلْنَاكَ شَاهِدًا — Sendeformel"},
        {verses: "48:15-17", label: "Zurückgebliebene", function: "Beduinen wollen Beute", marker: "سَيَقُولُ لَكَ الْمُخَلَّفُونَ — Zukunftsform"},
        {verses: "48:18-24", label: "Gottes Wohlgefallen", function: "Wohlgefallen unter dem Baum, Gottes Schutz", marker: "لَقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ — Wohlgefallen-Formel"},
        {verses: "48:25-29", label: "Schluss: Ka'ba und Gemeinschaftsbild", function: "Zugang zur Moschee, Pflanzengleichnis", marker: "مُحَمَّدٌ رَسُولُ اللَّهِ — Nominalsatz, كَزَرْعٍ — Pflanzengleichnis als Schluss"}
      ],
      keyFeature: "V.29 schließt mit einem Pflanzengleichnis für die Gemeinde (كَزَرْعٍ أَخْرَجَ شَطْأَهُ). Die Sure erwähnt Muhammad erneut namentlich (V.29). Der Treueid unter dem Baum (V.18: إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ) ist ein zentrales Textelement."
    }
  });
}

// --- Surah 49: Al-Hujurat ---
if (!existingNums.has(49)) {
  newEntries.push({
    surah: 49,
    name: "Al-Hujurat",
    verses: 18,
    structure: {
      type: "Sozialethische Anweisungsstruktur",
      segments: [
        {verses: "49:1-5", label: "Eröffnung: Respekt vor dem Gesandten", function: "Stimme senken, nicht voraneilen", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُقَدِّمُوا — Vokativ + Prohibitiv"},
        {verses: "49:6-8", label: "Nachrichtenethik", function: "Geruechte prüfen", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ — Vokativ + Konditionalsatz"},
        {verses: "49:9-10", label: "Schlichtung", function: "Zwischen Streitenden vermitteln", marker: "وَإِن طَائِفَتَانِ مِنَ الْمُؤْمِنِينَ — Konditionalsatz"},
        {verses: "49:11-13", label: "Zwischenmenschliche Ethik", function: "Spottverbot, Verleumdungsverbot, Völkervielfalt", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ — Vokativ + Prohibitiv"},
        {verses: "49:14-18", label: "Schluss: Glaube vs. Islam", function: "Beduinen und wahre Hingabe, Gottes Wissen", marker: "قَالَتِ الْأَعْرَابُ آمَنَّا قُل لَمْ تُؤْمِنُوا — Korrekturformel"}
      ],
      keyFeature: "Fünf يَا أَيُّهَا الَّذِينَ آمَنُوا-Anreden in 18 Versen (höchste Dichte pro Vers). V.13 (إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ) formuliert Würde durch Achtsamkeit, nicht Abstammung. V.14 unterscheidet zwischen آمَنَّا und أَسْلَمْنَا."
    }
  });
}

// --- Surah 50: Qaf ---
if (!existingNums.has(50)) {
  newEntries.push({
    surah: 50,
    name: "Qaf",
    verses: 45,
    structure: {
      type: "Schwur-Argument-Eschatologie",
      segments: [
        {verses: "50:1-5", label: "Eröffnung: Schwur und Verwunderung", function: "Muqatta'at, Schwur auf Quran, Leugnung", marker: "ق وَالْقُرْآنِ الْمَجِيدِ — Muqatta'at + Schwur"},
        {verses: "50:6-11", label: "Schöpfungszeichen", function: "Himmel, Erde, Regen, Palmengaerten", marker: "أَفَلَمْ يَنظُرُوا إِلَى السَّمَاءِ — rhetorische Frage"},
        {verses: "50:12-15", label: "Historische Verweise", function: "Nuh, 'Ad, Pharao, Thamud u.a.", marker: "كَذَّبَتْ قَبْلَهُمْ — Leugnungsformel"},
        {verses: "50:16-29", label: "Nähe Gottes und Engelsaufzeichnung", function: "Gottes Nähe, zwei Aufzeichner, Gerichtsszene", marker: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ — V.16: نَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ"},
        {verses: "50:30-40", label: "Hölle, Paradies, Schöpfungsargument", function: "Hölle voll?, Paradies, sechs Tage ohne Ermuedung", marker: "يَوْمَ نَقُولُ لِجَهَنَّمَ هَلِ امْتَلَأْتِ — Dialog mit Hölle"},
        {verses: "50:41-45", label: "Schluss: Horchen und Ermahnung", function: "Tag des Rufes, Ermahnung", marker: "وَاسْتَمِعْ يَوْمَ يُنَادِ — Imperativ, فَذَكِّرْ بِالْقُرْآنِ — Schlussimperativ"}
      ],
      keyFeature: "V.16 (نَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ, 'Wir sind ihm näher als seine Halsschlagader') ist eine der prägnantesten Nähe-Aussagen. V.30 enthält einen einzigartigen Dialog mit der Hölle."
    }
  });
}

// --- Surah 51: Adh-Dhariyat ---
if (!existingNums.has(51)) {
  newEntries.push({
    surah: 51,
    name: "Adh-Dhariyat",
    verses: 60,
    structure: {
      type: "Schwur-Erzählreihung",
      segments: [
        {verses: "51:1-6", label: "Schwurkette", function: "Vierfacher Schwur auf Wind, Wolken, Schiffe, Engel", marker: "وَالذَّارِيَاتِ ذَرْوًا — Schwur auf Aufwirbelnde (Surenname)"},
        {verses: "51:7-23", label: "Schwurantwort und Warnung", function: "Gericht ist wahr, Wehe den Leugnern", marker: "إِنَّمَا تُوعَدُونَ لَصَادِقٌ — Schwurantwort"},
        {verses: "51:24-37", label: "Ibrahim-Gaeste", function: "Narrative: Engel bei Ibrahim, dann Luts Volk", marker: "هَلْ أَتَاكَ حَدِيثُ ضَيْفِ إِبْرَاهِيمَ — Erzähleroeffnung"},
        {verses: "51:38-46", label: "Historische Kurzverweise", function: "Musa, 'Ad, Thamud, Nuh", marker: "وَفِي مُوسَىٰ إِذْ أَرْسَلْنَاهُ — وَفِي-Formel"},
        {verses: "51:47-55", label: "Schöpfungszeichen", function: "Himmel, Erde, Paare", marker: "وَالسَّمَاءَ بَنَيْنَاهَا — Schöpfungsformel"},
        {verses: "51:56-60", label: "Schluss: Zweck der Schöpfung", function: "Jinn und Menschen zum Dienst geschaffen", marker: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ — zentrale Zweckaussage"}
      ],
      keyFeature: "V.56 (وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ) ist eine der meistzitierten Zweckaussagen. Die وَفِي-Formel (V.38-46) verweist auf historische Beispiele innerhalb der Schöpfung."
    }
  });
}

// --- Surah 52: At-Tur ---
if (!existingNums.has(52)) {
  newEntries.push({
    surah: 52,
    name: "At-Tur",
    verses: 49,
    structure: {
      type: "Schwur-Kontraststruktur",
      segments: [
        {verses: "52:1-8", label: "Schwurkette", function: "Fünffacher Schwur auf Berg, Schrift, Haus, Meer", marker: "وَالطُّورِ — Schwur auf Berg (Surenname)"},
        {verses: "52:9-16", label: "Gerichtsszene", function: "Himmel bewegt sich, Berge wandern", marker: "يَوْمَ تَمُورُ السَّمَاءُ — temporale Szenenbeschreibung"},
        {verses: "52:17-28", label: "Paradiesbeschreibung", function: "Gärten, Früchte, Gemeinschaft", marker: "إِنَّ الْمُتَّقِينَ فِي جَنَّاتٍ — Kontrastbeginn"},
        {verses: "52:29-43", label: "Argumentation gegen Leugner", function: "Rhetorische Fragen, Tahaddi", marker: "فَذَكِّرْ فَمَا أَنتَ — Negationsformel, أَمْ — wiederholte أَمْ-Fragen"},
        {verses: "52:44-49", label: "Schluss: Geduld und Lobpreis", function: "Strafe-Warnung, Lobpreis-Imperativ", marker: "وَسَبِّحْ بِحَمْدِ رَبِّكَ — Lobpreisimperativ"}
      ],
      keyFeature: "Die أَمْ-Fragenkette (V.32-43) bildet die längste zusammenhängende Reihe rhetorischer Fragen mit أَمْ ('oder') im Quran — etwa 12 Fragen. Der Berg (الطُّورِ) verweist auf den Sinai."
    }
  });
}

// --- Surah 53: An-Najm ---
if (!existingNums.has(53)) {
  newEntries.push({
    surah: 53,
    name: "An-Najm",
    verses: 62,
    structure: {
      type: "Schwur-Visions-Struktur",
      segments: [
        {verses: "53:1-18", label: "Schwur und Visionsszene", function: "Schwur auf Stern, Beschreibung der Erscheinung", marker: "وَالنَّجْمِ إِذَا هَوَىٰ — Schwur auf Stern (Surenname)"},
        {verses: "53:19-25", label: "Götzenkritik: Lat, Uzza, Manat", function: "Drei Götzen, nur Namen", marker: "أَفَرَأَيْتُمُ اللَّاتَ وَالْعُزَّىٰ — rhetorische Frage"},
        {verses: "53:26-32", label: "Engelskritik und Wissen", function: "Engel-Benennung, Gottes Wissen", marker: "وَكَم مِن مَلَكٍ — Quantifizierung"},
        {verses: "53:33-41", label: "Verantwortung und Ibrahim/Musa", function: "Individuelle Verantwortung, fruehere Schriften", marker: "أَفَرَأَيْتَ الَّذِي تَوَلَّىٰ — rhetorische Frage, أَمْ لَمْ يُنَبَّأْ بِمَا فِي صُحُفِ مُوسَىٰ"},
        {verses: "53:42-62", label: "Schluss: Gottes Allmacht und Warnung", function: "Lachen/Weinen, Leben/Tod, 'Ad/Thamud", marker: "وَأَنَّ إِلَىٰ رَبِّكَ الْمُنتَهَىٰ — Abschlussformel, فَاسْجُدُوا — Niederwerfungsimperativ"}
      ],
      keyFeature: "Die Visionsszene (V.1-18) ist eine der ausführlichsten Beschreibungen einer uebernatuerlichen Erfahrung. V.39 (وَأَن لَيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ, 'dem Menschen gehört nur, was er erstrebt hat') betont individuelle Verantwortung."
    }
  });
}

// --- Surah 54: Al-Qamar ---
if (!existingNums.has(54)) {
  newEntries.push({
    surah: 54,
    name: "Al-Qamar",
    verses: 55,
    structure: {
      type: "Narrative Reihung mit Vierfachrefrain",
      segments: [
        {verses: "54:1-8", label: "Eröffnung: Mondspaltung und Warnung", function: "Zeichen und Abwendung", marker: "اقْتَرَبَتِ السَّاعَةُ وَانشَقَّ الْقَمَرُ — Mond (Surenname)"},
        {verses: "54:9-17", label: "Nuh", function: "Nuh-Erzählung mit Refrain", marker: "كَذَّبَتْ قَبْلَهُمْ قَوْمُ نُوحٍ — Leugnungsformel"},
        {verses: "54:18-22", label: "'Ad", function: "'Ad-Kurzform mit Refrain", marker: "كَذَّبَتْ عَادٌ — Leugnungsformel"},
        {verses: "54:23-32", label: "Thamud", function: "Thamud und die Kamelstute", marker: "كَذَّبَتْ ثَمُودُ — Leugnungsformel"},
        {verses: "54:33-40", label: "Lut", function: "Lut-Kurzform mit Refrain", marker: "كَذَّبَتْ قَوْمُ لُوطٍ — Leugnungsformel"},
        {verses: "54:41-42", label: "Pharao", function: "Pharao-Kurzform", marker: "وَلَقَدْ جَاءَ آلَ فِرْعَوْنَ — Sendeformel"},
        {verses: "54:43-55", label: "Schluss: Warnung und Macht Gottes", function: "Universale Warnung, Schlussformel", marker: "إِنَّ الْمُجْرِمِينَ فِي ضَلَالٍ — Schlusswarnung"}
      ],
      refrain: {
        arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُدَّكِرٍ",
        occurrences: 4,
        function: "Vierfacher Refrain nach jeder Erzählung (V.17, 22, 32, 40): 'Wir haben den Quran zur Ermahnung leicht gemacht — gibt es einen, der sich ermahnen lässt?'"
      },
      keyFeature: "Der Vierfachrefrain (وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُدَّكِرٍ) ist das dominante Strukturmerkmal. Fünf Völker werden in absteigender Länge behandelt."
    }
  });
}

// --- Surah 57: Al-Hadid ---
if (!existingNums.has(57)) {
  newEntries.push({
    surah: 57,
    name: "Al-Hadid",
    verses: 29,
    structure: {
      type: "Hymnus-Paranese-Struktur",
      segments: [
        {verses: "57:1-6", label: "Eröffnung: Kosmischer Lobpreis", function: "Alles lobpreist Gott, Attribute", marker: "سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ — Lobpreisformel"},
        {verses: "57:7-11", label: "Spendenaufruf", function: "Glauben und Spenden", marker: "آمِنُوا بِاللَّهِ وَرَسُولِهِ وَأَنفِقُوا — Imperativpaar"},
        {verses: "57:12-15", label: "Licht und Heuchler", function: "Licht der Gläubigen, Heuchler bitten um Licht", marker: "يَوْمَ تَرَى الْمُؤْمِنِينَ — Gerichtsszene"},
        {verses: "57:16-19", label: "Herzenserweichung", function: "Aufruf zur Demut, Spende als Darlehen", marker: "أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ — rhetorische Frage"},
        {verses: "57:20-24", label: "Diesseitskritik und Qadr", function: "Wettlauf-Gleichnis, Vorherbestimmung", marker: "اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ — Wissensimperativ"},
        {verses: "57:25-29", label: "Schluss: Gesandte, Eisen, Moenchstum", function: "Waage, Eisen, Isa-Verweis, Moenchstumskritik", marker: "وَأَنزَلْنَا الْحَدِيدَ — Eisen (Surenname), Schluss"}
      ],
      keyFeature: "V.3 beschreibt Gott als الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ — vier Attribute als Gegensatzpaare. Das Eisen (الْحَدِيد, V.25) gibt der Sure ihren Namen. V.25 verbindet Eisen mit Macht und Nutzen."
    }
  });
}

// --- Surah 58: Al-Mujadila ---
if (!existingNums.has(58)) {
  newEntries.push({
    surah: 58,
    name: "Al-Mujadila",
    verses: 22,
    structure: {
      type: "Fallorientierte Gesetzgebung",
      segments: [
        {verses: "58:1-4", label: "Eröffnung: Die Streitende", function: "Konkreter Fall: Zihar-Erklärung", marker: "قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ — Falleroeffnung (Surenname)"},
        {verses: "58:5-6", label: "Warnung", function: "Strafe für Widerstand", marker: "إِنَّ الَّذِينَ يُحَادُّونَ اللَّهَ — Warnformel"},
        {verses: "58:7-10", label: "Gottes Allwissenheit", function: "Geheimgespraeche, Gottes Nähe", marker: "أَلَمْ تَرَ أَنَّ اللَّهَ يَعْلَمُ — rhetorische Frage"},
        {verses: "58:11-13", label: "Versammlungsregeln und Almosen", function: "Platz machen, Almosen vor Privatgespraech", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قِيلَ لَكُمْ تَفَسَّحُوا — Vokativ + Imperativ"},
        {verses: "58:14-22", label: "Schluss: Gottes Partei vs. Satans Partei", function: "Loyalität, Gemeinschaftsidentität", marker: "أُولَٰئِكَ حِزْبُ اللَّهِ — Partei-Terminologie als Schluss"}
      ],
      keyFeature: "Beginnt mit einem konkreten Fall (Zihar-Erklärung einer Frau) und erweitert zu allgemeinen Regeln. V.22 formuliert den Begriff حِزْبُ اللَّهِ ('Partei Gottes'). Die Sure erwähnt Gott (اللَّه) in jedem einzelnen Vers."
    }
  });
}

// --- Surah 59: Al-Hashr ---
if (!existingNums.has(59)) {
  newEntries.push({
    surah: 59,
    name: "Al-Hashr",
    verses: 24,
    structure: {
      type: "Ereignisbezogene Struktur mit Hymnus-Schluss",
      segments: [
        {verses: "59:1-4", label: "Eröffnung: Lobpreis und Vertreibung", function: "Lobpreis, Vertreibung der leugnenden Schriftbesitzer", marker: "سَبَّحَ لِلَّهِ — Lobpreis, هُوَ الَّذِي أَخْرَجَ الَّذِينَ كَفَرُوا — narrativer Bezug"},
        {verses: "59:5-10", label: "Beuteregelung und Muhajirin", function: "Palmen, Fay'-Verteilung, Muhajirun und Ansar", marker: "مَا أَفَاءَ اللَّهُ — Rechtsformel"},
        {verses: "59:11-17", label: "Heuchler und Schriftbesitzer", function: "Falsche Versprechen, Gleichnis", marker: "أَلَمْ تَرَ إِلَى الَّذِينَ نَافَقُوا — rhetorische Frage"},
        {verses: "59:18-21", label: "Ermahnung und Qurangleichnis", function: "Achtsamkeit, Berg-Gleichnis", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ — Vokativ, لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ — Irrealis"},
        {verses: "59:22-24", label: "Schluss: Gottes-Namen-Hymnus", function: "Konzentration von Attributen", marker: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ — dreifache Attributkette"}
      ],
      keyFeature: "V.22-24 enthalten die längste zusammenhängende Attributkette (الرَّحْمَٰنُ الرَّحِيمُ, الْمَلِكُ, الْقُدُّوسُ, السَّلَامُ, الْمُؤْمِنُ, الْمُهَيْمِنُ, الْعَزِيزُ, الْجَبَّارُ, الْمُتَكَبِّرُ, الْخَالِقُ, الْبَارِئُ, الْمُصَوِّرُ)."
    }
  });
}

// --- Surah 60: Al-Mumtahana ---
if (!existingNums.has(60)) {
  newEntries.push({
    surah: 60,
    name: "Al-Mumtahana",
    verses: 13,
    structure: {
      type: "Loyalitäts-Prüfungs-Struktur",
      segments: [
        {verses: "60:1-3", label: "Eröffnung: Loyalitätsverbot", function: "Keine Freundschaft mit Feinden", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا عَدُوِّي — Vokativ + Prohibitiv"},
        {verses: "60:4-6", label: "Ibrahim als Vorbild", function: "Ibrahims Lossagung von seinem Volk", marker: "قَدْ كَانَتْ لَكُمْ أُسْوَةٌ حَسَنَةٌ فِي إِبْرَاهِيمَ — Vorbildformel"},
        {verses: "60:7-9", label: "Differenzierung", function: "Gerechte Behandlung Nicht-Kämpfender", marker: "عَسَى اللَّهُ أَن يَجْعَلَ — Hoffnungsformel, لَا يَنْهَاكُمُ اللَّهُ — Erlaubnis"},
        {verses: "60:10-12", label: "Prüfung der Frauen", function: "Emigrierende Frauen prüfen", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا جَاءَكُمُ الْمُؤْمِنَاتُ — Prüfungsformel (Surenname)"},
        {verses: "60:13", label: "Schluss: Abschliessende Warnung", function: "Keine Loyalität mit denen, über die Gott zürnt", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَوَلَّوْا — Prohibitiv als Schluss"}
      ],
      keyFeature: "V.8-9 differenzieren zwischen Nicht-Muslimen, die nicht kämpfen (gerechte Behandlung erlaubt) und solchen, die kämpfen (Loyalität verboten). Ibrahim als Vorbild (أُسْوَةٌ حَسَنَةٌ) rahmt die Sure."
    }
  });
}

// --- Surah 61: As-Saff ---
if (!existingNums.has(61)) {
  newEntries.push({
    surah: 61,
    name: "As-Saff",
    verses: 14,
    structure: {
      type: "Aufforderungs-Diskurs",
      segments: [
        {verses: "61:1-4", label: "Eröffnung: Lobpreis und Wort-Tat-Kongruenz", function: "Lobpreis, Warnung vor Heuchelei", marker: "سَبَّحَ لِلَّهِ — Lobpreis, لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ — Tadelformel"},
        {verses: "61:5-9", label: "Musa und Isa", function: "Musa wird belaestigt, Isa kündigt Ahmad an", marker: "وَإِذْ قَالَ مُوسَىٰ / وَإِذْ قَالَ عِيسَى — parallele Rückblicke"},
        {verses: "61:10-14", label: "Schluss: Handelsgleichnis und Sieg", function: "Handel mit Gott, Helfer Gottes", marker: "هَلْ أَدُلُّكُمْ عَلَىٰ تِجَارَةٍ — Handelsmetapher, كُونُوا أَنصَارَ اللَّهِ — Imperativ"}
      ],
      keyFeature: "V.6 enthält Isas Ankündigung eines Gesandten namens Ahmad. V.10-12 formulieren Glaube und Kampf als 'Handel' (تِجَارَة) mit Gott. Die Sure ist kompakt und zielorientiert."
    }
  });
}

// --- Surah 62: Al-Jumu'a ---
if (!existingNums.has(62)) {
  newEntries.push({
    surah: 62,
    name: "Al-Jumu'a",
    verses: 11,
    structure: {
      type: "Lobpreis-Ermahnung-Struktur",
      segments: [
        {verses: "62:1-4", label: "Lobpreis und Sendung", function: "Lobpreis, Gesandter unter den Analphabeten", marker: "يُسَبِّحُ لِلَّهِ — Lobpreis, هُوَ الَّذِي بَعَثَ فِي الْأُمِّيِّينَ — Sendeformel"},
        {verses: "62:5-8", label: "Gleichnis und Warnung", function: "Esel-Gleichnis für Schriftkenner", marker: "مَثَلُ الَّذِينَ حُمِّلُوا التَّوْرَاةَ كَمَثَلِ الْحِمَارِ — Gleichnisformel"},
        {verses: "62:9-11", label: "Schluss: Freitagsgebet", function: "Aufruf zum Gebet, Handelswarnung", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ — Freitagsgebet (Surenname)"}
      ],
      keyFeature: "Das Esel-Gleichnis (V.5: كَمَثَلِ الْحِمَارِ يَحْمِلُ أَسْفَارًا) beschreibt Wissen ohne Verständnis. V.9-10 enthalten die einzige explizite Freitagsgebets-Anweisung."
    }
  });
}

// --- Surah 63: Al-Munafiqun ---
if (!existingNums.has(63)) {
  newEntries.push({
    surah: 63,
    name: "Al-Munafiqun",
    verses: 11,
    structure: {
      type: "Heuchler-Entlarvungs-Struktur",
      segments: [
        {verses: "63:1-4", label: "Eröffnung: Heuchler-Kennzeichen", function: "Falsches Zeugnis, äußerer Schein", marker: "إِذَا جَاءَكَ الْمُنَافِقُونَ — temporaler Rückblick"},
        {verses: "63:5-6", label: "Stolz und Verweigerung", function: "Weigern sich, um Vergebung zu bitten", marker: "وَإِذَا قِيلَ لَهُمْ تَعَالَوْا — Wenn-Konstruktion"},
        {verses: "63:7-8", label: "Heuchler-Zitat", function: "Wollen Muslime aushungern", marker: "هُمُ الَّذِينَ يَقُولُونَ لَا تُنفِقُوا — Heuchlerrede"},
        {verses: "63:9-11", label: "Schluss: Spendenaufruf und Tod", function: "Vor dem Tod spenden, Aufschub nutzlos", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُلْهِكُمْ — Vokativ + Prohibitiv"}
      ],
      keyFeature: "Die Sure entlarvt Heuchler durch ihre eigenen Worte (V.1, 7-8) und kontrastiert sie mit der Spendenethik (V.10). Kompakte Struktur mit klarem Feind-Bild."
    }
  });
}

// --- Surah 64: At-Taghabun ---
if (!existingNums.has(64)) {
  newEntries.push({
    surah: 64,
    name: "At-Taghabun",
    verses: 18,
    structure: {
      type: "Lobpreis-Ermahnung-Struktur",
      segments: [
        {verses: "64:1-4", label: "Eröffnung: Lobpreis und Schöpfung", function: "Alles lobpreist Gott, Kontrastpaar", marker: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ — Lobpreisformel"},
        {verses: "64:5-10", label: "Historische Warnung und Auferstehung", function: "Fruehere Völker, Tag der Versammlung", marker: "أَلَمْ يَأْتِكُمْ نَبَأُ الَّذِينَ كَفَرُوا — rhetorische Frage"},
        {verses: "64:11-13", label: "Prüfung und Vertrauen", function: "Unheil als Prüfung", marker: "مَا أَصَابَ مِن مُصِيبَةٍ إِلَّا بِإِذْنِ اللَّهِ — Schicksalsformel"},
        {verses: "64:14-18", label: "Schluss: Familie und Spende", function: "Familie als Prüfung, Spende als Darlehen", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّ مِنْ أَزْوَاجِكُمْ — Familienwarnung, يَوْمَ التَّغَابُنِ — Tag der Übervorteilung (Surenname)"}
      ],
      keyFeature: "V.9 erwähnt den يَوْمَ التَّغَابُنِ ('Tag der Übervorteilung'), der der Sure den Namen gibt. Die Sure verbindet kosmologische Eröffnung (Lobpreis, Schöpfung) mit sozial-ethischen Anweisungen (Familie, Spende)."
    }
  });
}

// --- Surah 65: At-Talaq ---
if (!existingNums.has(65)) {
  newEntries.push({
    surah: 65,
    name: "At-Talaq",
    verses: 12,
    structure: {
      type: "Scheidungs-Gesetzgebung",
      segments: [
        {verses: "65:1-3", label: "Eröffnung: Scheidungsregeln", function: "Wartefrist, Achtsamkeit", marker: "يَا أَيُّهَا النَّبِيُّ إِذَا طَلَّقْتُمُ — Vokativ an Propheten, Scheidung (Surenname)"},
        {verses: "65:4-7", label: "Detailbestimmungen", function: "Wartefrist für verschiedene Fälle, Unterhalt", marker: "وَاللَّائِي يَئِسْنَ — Fallunterscheidung"},
        {verses: "65:8-10", label: "Warnung: Ungehorsame Städte", function: "Historische Warnung", marker: "وَكَأَيِّن مِن قَرْيَةٍ — Quantifizierungsformel"},
        {verses: "65:11-12", label: "Schluss: Licht und sieben Himmel", function: "Gesandter als Licht, kosmischer Verweis", marker: "اللَّهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ — Schöpfungsformel als Schluss"}
      ],
      keyFeature: "Die Sure mischt detaillierte Scheidungsanweisungen (V.1-7) mit kosmischen Aussagen (V.12: sieben Himmel und Erden). Der Übergang von Familienanweisungen zu kosmischer Ordnung ist charakteristisch."
    }
  });
}

// --- Surah 66: At-Tahrim ---
if (!existingNums.has(66)) {
  newEntries.push({
    surah: 66,
    name: "At-Tahrim",
    verses: 12,
    structure: {
      type: "Prophetenfamilien-Diskurs",
      segments: [
        {verses: "66:1-5", label: "Eröffnung: Selbstverbot und Ehefrauen des Nabi", function: "Nabi verbietet sich etwas, Warnung an Ehefrauen", marker: "يَا أَيُّهَا النَّبِيُّ لِمَ تُحَرِّمُ — Vokativ + Tadelformel (Surenname)"},
        {verses: "66:6-8", label: "Feuerschutz und Reue", function: "Familie vor Feuer schützen, Reue-Aufruf", marker: "يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ — Vokativ + Imperativ"},
        {verses: "66:9-10", label: "Prophetentrost und negative Frauen-Beispiele", function: "Nuhs und Luts Frauen als Warnung", marker: "ضَرَبَ اللَّهُ مَثَلًا لِلَّذِينَ كَفَرُوا — Gleichnisformel"},
        {verses: "66:11-12", label: "Schluss: Positive Frauen-Beispiele", function: "Pharaos Frau und Maryam als Vorbild", marker: "وَضَرَبَ اللَّهُ مَثَلًا لِلَّذِينَ آمَنُوا — Kontrastgleichnis"}
      ],
      keyFeature: "Die Sure schließt mit vier Frauen-Gleichnissen: zwei negativ (Nuhs und Luts Frauen, V.10) und zwei positiv (Pharaos Frau und Maryam, V.11-12). V.12 nennt Maryam als einzige Frau im Quran namentlich in einer Vorbildfunktion."
    }
  });
}

// --- Surah 68: Al-Qalam ---
if (!existingNums.has(68)) {
  newEntries.push({
    surah: 68,
    name: "Al-Qalam",
    verses: 52,
    structure: {
      type: "Schwur-Erzählstruktur",
      segments: [
        {verses: "68:1-7", label: "Eröffnung: Schwur auf Schreibfeder", function: "Muqatta'at, Schwur, Trost", marker: "ن وَالْقَلَمِ — Muqatta'at + Schwur auf Schreibfeder (Surenname)"},
        {verses: "68:8-16", label: "Charakterisierung des Feindes", function: "Zehn negative Eigenschaften", marker: "وَلَا تُطِعْ كُلَّ حَلَّافٍ مَهِينٍ — Prohibitiv + Attributkette"},
        {verses: "68:17-33", label: "Gartenbesitzer-Erzählung", function: "Gleichnis: Habgier bestraft", marker: "إِنَّا بَلَوْنَاهُمْ كَمَا بَلَوْنَا أَصْحَابَ الْجَنَّةِ — Vergleichsformel"},
        {verses: "68:34-47", label: "Gerichtstag und Argumentation", function: "Kontrastpaar, Tahaddi, Yunus-Verweis", marker: "إِنَّ لِلْمُتَّقِينَ — Kontrastbeginn"},
        {verses: "68:48-52", label: "Schluss: Trost und Yunus-Verweis", function: "Geduld, Beinahe-Blick-Gefahr", marker: "وَإِن يَكَادُ الَّذِينَ كَفَرُوا — Beinahe-Konstruktion, وَمَا هُوَ إِلَّا ذِكْرٌ — Schlussformel"}
      ],
      keyFeature: "V.4 (وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ, 'du bist von grossartigem Charakter') ist direkt an den Adressaten gerichtet. Die Gartenbesitzer-Erzählung (V.17-33) ist ein Originalgleichnis ohne Parallel im AT."
    }
  });
}

// --- Surah 69: Al-Haqqa ---
if (!existingNums.has(69)) {
  newEntries.push({
    surah: 69,
    name: "Al-Haqqa",
    verses: 52,
    structure: {
      type: "Dreifach-Benennung mit Kontrastszene",
      segments: [
        {verses: "69:1-3", label: "Eröffnung: Dreifache Benennung", function: "Die Wahrhaftige — was ist sie?", marker: "الْحَاقَّةُ مَا الْحَاقَّةُ — dreifache Nennung (Surenname)"},
        {verses: "69:4-12", label: "Historische Vernichtungen", function: "Thamud, 'Ad, Pharao, Nuh-Flut", marker: "كَذَّبَتْ ثَمُودُ وَعَادٌ — Leugnungsformel"},
        {verses: "69:13-18", label: "Gerichtsszene", function: "Trompete, Himmel, Thron", marker: "فَإِذَا نُفِخَ فِي الصُّورِ — Trompetenstoss"},
        {verses: "69:19-37", label: "Kontrastpaar: Buch rechts/links", function: "Wer rechts empfängt vs. links", marker: "فَأَمَّا مَنْ أُوتِيَ كِتَابَهُ بِيَمِينِهِ — فَأَمَّا-Kontrastpaar"},
        {verses: "69:38-52", label: "Schluss: Schwur und Quranwuerde", function: "Schwur auf Sichtbares/Unsichtbares, Quran als Wahrheit", marker: "فَلَا أُقْسِمُ بِمَا تُبْصِرُونَ — Schwurformel, إِنَّهُ لَقَوْلُ رَسُولٍ كَرِيمٍ — Quranattribut"}
      ],
      keyFeature: "Die dreifache Eröffnungsformel (الْحَاقَّةُ × 3 in V.1-3) ist einzigartig. V.19-37 enthalten die ausführlichste Darstellung der Buchuebergabe (rechts/links) mit wechselseitigen Monologen."
    }
  });
}

// --- Surah 70: Al-Ma'arij ---
if (!existingNums.has(70)) {
  newEntries.push({
    surah: 70,
    name: "Al-Ma'arij",
    verses: 44,
    structure: {
      type: "Eschatologisch-Ethische Struktur",
      segments: [
        {verses: "70:1-7", label: "Eröffnung: Frage nach Strafe", function: "Jemand fragt nach der Strafe", marker: "سَأَلَ سَائِلٌ بِعَذَابٍ — Eröffnung durch Frage"},
        {verses: "70:8-18", label: "Gerichtsszene", function: "Kosmischer Zusammenbruch, Distanzierung", marker: "يَوْمَ تَكُونُ السَّمَاءُ كَالْمُهْلِ — Vergleichspartikel"},
        {verses: "70:19-35", label: "Menschliche Natur und Ausnahme", function: "Mensch ist ungeduldig, Ausnahme: Betende", marker: "إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا — Schoeöpfungsattribut, إِلَّا الْمُصَلِّينَ — Ausnahmeformel"},
        {verses: "70:36-44", label: "Schluss: Leugner und Geduld", function: "Leugner laufen, werden ueberholt", marker: "فَمَالِ الَّذِينَ كَفَرُوا قِبَلَكَ مُهْطِعِينَ — rhetorische Frage"}
      ],
      keyFeature: "V.19-21 definieren die menschliche Natur als هَلُوعًا ('ungeduldig'), dann differenziert in V.22-35: Ausnahme sind die Betenden (الْمُصَلِّينَ) — ein Tugendkatalog parallel zu 23:1-11."
    }
  });
}

// --- Surah 72: Al-Jinn ---
if (!existingNums.has(72)) {
  newEntries.push({
    surah: 72,
    name: "Al-Jinn",
    verses: 28,
    structure: {
      type: "Eingebettete Rede-Struktur",
      segments: [
        {verses: "72:1-15", label: "Jinn-Rede", function: "Jinn berichten über Quran-Rezeption", marker: "قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِنَ الْجِنِّ — قُلْ-Imperativ, Jinn-Rede"},
        {verses: "72:16-19", label: "Ermahnung und Moscheen", function: "Gerader Weg, Moscheen gehören Gott", marker: "وَأَنَّ الْمَسَاجِدَ لِلَّهِ — لِ-Konstruktion (Zugehörigkeit)"},
        {verses: "72:20-28", label: "Schluss: Rolle des Nabi und Verborgenes", function: "Einzeldiener, Wissen des Verborgenen", marker: "قُلْ إِنَّمَا أَدْعُو رَبِّي — قُلْ-Imperativ, عَالِمُ الْغَيْبِ — Schlussattribut"}
      ],
      keyFeature: "Die Sure besteht fast vollständig aus einer Jinn-Rede in indirekter Form (أَنَّهُ/وَأَنَّهُ-Kette, V.1-15). Die Jinn reagieren positiv auf den Quran — Gegenstück zur menschlichen Ablehnung."
    }
  });
}

// --- Surah 74: Al-Muddaththir ---
if (!existingNums.has(74)) {
  newEntries.push({
    surah: 74,
    name: "Al-Muddaththir",
    verses: 56,
    structure: {
      type: "Imperativ-Warnung mit Saqar-Passage",
      segments: [
        {verses: "74:1-7", label: "Eröffnung: Imperativkette", function: "Aufstehen, Warnen, Reinigen", marker: "يَا أَيُّهَا الْمُدَّثِّرُ — Vokativ + Partizip, قُمْ فَأَنذِرْ — Imperativkette"},
        {verses: "74:8-10", label: "Tag der Entscheidung", function: "Trompete, schwerer Tag", marker: "فَإِذَا نُقِرَ فِي النَّاقُورِ — Trompetenstoss"},
        {verses: "74:11-26", label: "Portrait des Leugners", function: "Einzelperson, die den Quran als Zauber abtut", marker: "ذَرْنِي وَمَنْ خَلَقْتُ وَحِيدًا — 'Lass mich mit dem, den ich allein erschuf'"},
        {verses: "74:27-48", label: "Saqar-Passage", function: "Beschreibung von Saqar, 19 Wächter, Dialog", marker: "وَمَا أَدْرَاكَ مَا سَقَرُ — Formel, تِسْعَةَ عَشَرَ — Zahl 19"},
        {verses: "74:49-56", label: "Schluss: Flucht und Ermahnung", function: "Fliehen vor Erinnerung, Gottes Wille", marker: "فَمَا لَهُمْ عَنِ التَّذْكِرَةِ مُعْرِضِينَ — rhetorische Frage"}
      ],
      keyFeature: "Die Saqar-Passage (V.27-48) enthält die raetselhafte Zahl 19 (V.30: عَلَيْهَا تِسْعَةَ عَشَرَ) und eine metakommentarische Erklärung (V.31)."
    }
  });
}

// --- Surah 75: Al-Qiyama ---
if (!existingNums.has(75)) {
  newEntries.push({
    surah: 75,
    name: "Al-Qiyama",
    verses: 40,
    structure: {
      type: "Schwur-Auferstehung-Struktur",
      segments: [
        {verses: "75:1-6", label: "Schwur und Leugnung", function: "Schwur auf Auferstehungstag und tadelnde Seele", marker: "لَا أُقْسِمُ بِيَوْمِ الْقِيَامَةِ — Schwurformel (Surenname)"},
        {verses: "75:7-15", label: "Gerichtsszene", function: "Augen blenden, Selbstzeugnis", marker: "فَإِذَا بَرِقَ الْبَصَرُ — temporale Szenenbeschreibung"},
        {verses: "75:16-19", label: "Quran-Rezitationsanweisung", function: "Nicht eilen bei Rezitation", marker: "لَا تُحَرِّكْ بِهِ لِسَانَكَ — Prohibitiv, thematischer Einschub"},
        {verses: "75:20-30", label: "Diesseitsliebe und Tod", function: "Gesichter leuchtend/finster, Todesszene", marker: "كَلَّا بَلْ تُحِبُّونَ الْعَاجِلَةَ — كَلَّا + Anklage"},
        {verses: "75:31-40", label: "Schluss: Leugnung und Schöpfungsbeweis", function: "Verweigerung, Tropfen-Argument", marker: "أَلَمْ يَكُ نُطْفَةً مِن مَنِيٍّ — rhetorische Frage, أَلَيْسَ ذَٰلِكَ بِقَادِرٍ — Schlussformel"}
      ],
      keyFeature: "V.16-19 sind ein thematischer Einschub (Rezitationsanweisung), der die eschatologische Passage unterbricht — einer der deutlichsten Textbrueche im Quran. V.22-23 kontrastieren leuchtende vs. finstere Gesichter."
    }
  });
}

// --- Surah 76: Al-Insan ---
if (!existingNums.has(76)) {
  newEntries.push({
    surah: 76,
    name: "Al-Insan",
    verses: 31,
    structure: {
      type: "Schöpfung-Paradies-Ermahnung",
      segments: [
        {verses: "76:1-3", label: "Eröffnung: Menschenschoepfung", function: "Rhetorische Frage, Prüfung", marker: "هَلْ أَتَىٰ عَلَى الْإِنسَانِ — rhetorische Frage (Surenname)"},
        {verses: "76:4-10", label: "Kontrastpaar: Ketten vs. Becher", function: "Leugner in Ketten, Fromme spenden", marker: "إِنَّا أَعْتَدْنَا لِلْكَافِرِينَ — Kontrastbeginn"},
        {verses: "76:11-22", label: "Paradiesbeschreibung", function: "Ausführliche Gartenszene", marker: "فَوَقَاهُمُ اللَّهُ شَرَّ ذَٰلِكَ الْيَوْمِ — Überleitung, Silbergeschirr, Ingwer"},
        {verses: "76:23-31", label: "Schluss: Offenbarung und Gottes Wille", function: "Quranherabsendung, Geduld, Gottes Wille", marker: "إِنَّا نَحْنُ نَزَّلْنَا عَلَيْكَ الْقُرْآنَ — Offenbarungsformel, فَاصْبِرْ — Geduldsimperativ"}
      ],
      keyFeature: "V.11-22 enthalten eine der detailliertesten Paradiesbeschreibungen (Seide, Silber, Ingwer, Kampfer, Gefäße). Die Sure beginnt mit einer existentiellen Frage (V.1: هَلْ أَتَىٰ) und endet mit Gottes souveraenem Willen."
    }
  });
}

// --- Surah 77: Al-Mursalat ---
if (!existingNums.has(77)) {
  newEntries.push({
    surah: 77,
    name: "Al-Mursalat",
    verses: 50,
    structure: {
      type: "Schwur-Refrain-Struktur",
      segments: [
        {verses: "77:1-7", label: "Schwurkette", function: "Fünffacher Schwur auf Winde/Engel", marker: "وَالْمُرْسَلَاتِ عُرْفًا — Schwur auf Gesandte (Surenname)"},
        {verses: "77:8-15", label: "Gerichtsszene", function: "Sterne verloeschen, Gesandte terminiert", marker: "فَإِذَا النُّجُومُ طُمِسَتْ — temporale Szenenbeschreibung"},
        {verses: "77:16-40", label: "Schöpfungszeichen und Warnung", function: "Fruehere Völker, Schöpfungsargumente", marker: "أَلَمْ نُهْلِكِ الْأَوَّلِينَ — rhetorische Frage"},
        {verses: "77:41-50", label: "Schluss: Paradies vs. Wehe", function: "sich Hütende belohnt, Leugner gewarnt", marker: "إِنَّ الْمُتَّقِينَ فِي ظِلَالٍ — Kontrastbeginn"}
      ],
      refrain: {
        arabic: "وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ",
        occurrences: 10,
        function: "Zehnfacher Wehe-Refrain strukturiert die gesamte Sure in Segmente."
      },
      keyFeature: "Der zehnfache Refrain وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ ('Wehe an jenem Tag den Leugnern') ist das prägnanteste Strukturmerkmal. 10 von 50 Versen sind Refrain (20%)."
    }
  });
}

// --- Surah 79: An-Nazi'at ---
if (!existingNums.has(79)) {
  newEntries.push({
    surah: 79,
    name: "An-Nazi'at",
    verses: 46,
    structure: {
      type: "Schwur-Narrativ-Eschatologie",
      segments: [
        {verses: "79:1-5", label: "Schwurkette", function: "Fünffacher Schwur auf Engel", marker: "وَالنَّازِعَاتِ غَرْقًا — Schwurformel (Surenname)"},
        {verses: "79:6-14", label: "Gerichtsszene", function: "Beben, Angst, Auferstehung", marker: "يَوْمَ تَرْجُفُ الرَّاجِفَةُ — temporale Szenenbeschreibung"},
        {verses: "79:15-26", label: "Musa-Pharao-Erzählung", function: "Kurznarrative: Sendung und Vernichtung", marker: "هَلْ أَتَاكَ حَدِيثُ مُوسَىٰ — Erzähleroeffnung"},
        {verses: "79:27-33", label: "Schöpfungsargument", function: "Himmel, Erde, Berge als Beweis", marker: "أَأَنتُمْ أَشَدُّ خَلْقًا أَمِ السَّمَاءُ — rhetorische Frage"},
        {verses: "79:34-46", label: "Schluss: Grosse Überwueltigung", function: "Tag der Abrechnung, Angst", marker: "فَإِذَا جَاءَتِ الطَّامَّةُ الْكُبْرَىٰ — temporale Eröffnung, Schlussformel"}
      ],
      keyFeature: "Die rhetorische Frage V.27 (أَأَنتُمْ أَشَدُّ خَلْقًا أَمِ السَّمَاءُ, 'Seid ihr schwieriger zu erschaffen oder der Himmel?') verbindet Schöpfung und Auferstehung. Die Sure endet mit der Größen Überwueltigung (الطَّامَّةُ الْكُبْرَىٰ)."
    }
  });
}

// --- Surah 80: 'Abasa ---
if (!existingNums.has(80)) {
  newEntries.push({
    surah: 80,
    name: "'Abasa",
    verses: 42,
    structure: {
      type: "Tadel-Schöpfung-Eschatologie",
      segments: [
        {verses: "80:1-10", label: "Eröffnung: Tadel", function: "Er runzelte die Stirn gegenüber dem Blinden", marker: "عَبَسَ وَتَوَلَّىٰ — 3. Person Perfekt (einzigartige Eröffnung)"},
        {verses: "80:11-16", label: "Quranwuerde", function: "Erinnerung auf geehrten Blättern", marker: "كَلَّا إِنَّهَا تَذْكِرَةٌ — كَلَّا als Wende"},
        {verses: "80:17-32", label: "Schöpfung und Versorgung", function: "Menschliche Schöpfung, Nahrungskatalog", marker: "قُتِلَ الْإِنسَانُ مَا أَكْفَرَهُ — Ausruf, ثُمَّ السَّبِيلَ يَسَّرَهُ — Lebenslauf"},
        {verses: "80:33-42", label: "Schluss: Grosse Taubheit", function: "Eschatologische Szene, Flucht", marker: "فَإِذَا جَاءَتِ الصَّاخَّةُ — temporale Eröffnung, Gesichterkontrastpaar"}
      ],
      keyFeature: "Einzige Sure, die in der 3. Person über den Adressaten beginnt (عَبَسَ وَتَوَلَّىٰ), dann zur 2. Person wechselt (V.3: وَمَا يُدْرِيكَ). Dieser Tadel ist textlinguistisch einzigartig."
    }
  });
}

// --- Surah 81: At-Takwir ---
if (!existingNums.has(81)) {
  newEntries.push({
    surah: 81,
    name: "At-Takwir",
    verses: 29,
    structure: {
      type: "Bedingungs-Schwur-Struktur",
      segments: [
        {verses: "81:1-14", label: "Vierzehnfache إِذَا-Kette", function: "Kosmischer Zusammenbruch", marker: "إِذَا الشَّمْسُ كُوِّرَتْ — anaphorische إِذَا-Kette (14-fach, längste im Quran)"},
        {verses: "81:15-21", label: "Schwur und Botencharakterisierung", function: "Schwur auf Sterne, Bote beschrieben", marker: "فَلَا أُقْسِمُ بِالْخُنَّسِ — Schwurformel"},
        {verses: "81:22-29", label: "Schluss: Verteidigung und Universalität", function: "Nicht verrueckt, Quran als Erinnerung", marker: "وَمَا صَاحِبُكُم بِمَجْنُونٍ — Negation, وَمَا هُوَ بِقَوْلِ شَيْطَانٍ — Schlussverteidigung"}
      ],
      keyFeature: "Die vierzehnfache إِذَا-Kette (V.1-14) ist die längste zusammenhängende Bedingungskette im Quran. Keine Apodosis folgt direkt — die Antwort wird durch den Schwurblock (V.15-21) aufgefangen."
    }
  });
}

// --- Surah 84: Al-Inshiqaq ---
if (!existingNums.has(84)) {
  newEntries.push({
    surah: 84,
    name: "Al-Inshiqaq",
    verses: 25,
    structure: {
      type: "Kosmisches-Ereignis-Kontraststruktur",
      segments: [
        {verses: "84:1-5", label: "Eröffnung: Himmelszerreissung", function: "Himmel zerreisst, Erde wirft aus", marker: "إِذَا السَّمَاءُ انشَقَّتْ — إِذَا + kosmische Szene (Surenname)"},
        {verses: "84:6-15", label: "Kontrastpaar: Buch rechts/hinter", function: "Freudig vs. reuig", marker: "فَأَمَّا مَنْ أُوتِيَ كِتَابَهُ بِيَمِينِهِ — فَأَمَّا-Kontrastpaar"},
        {verses: "84:16-19", label: "Schwur auf Übergaenge", function: "Abendrot, Nacht, Mond", marker: "فَلَا أُقْسِمُ بِالشَّفَقِ — Schwurformel"},
        {verses: "84:20-25", label: "Schluss: Leugner und Quran", function: "Warum keine Niederwerfung?, Lohn", marker: "فَمَا لَهُمْ لَا يُؤْمِنُونَ — rhetorische Frage"}
      ],
      keyFeature: "V.6 (يَا أَيُّهَا الْإِنسَانُ إِنَّكَ كَادِحٌ إِلَىٰ رَبِّكَ كَدْحًا, 'du muehst dich auf deinen Herrn zu') ist eine der prägnantesten Einzelaussagen. Die Sure teilt das kosmische Schema mit 81 und 82."
    }
  });
}

// --- Surah 86: At-Tariq ---
if (!existingNums.has(86)) {
  newEntries.push({
    surah: 86,
    name: "At-Tariq",
    verses: 17,
    structure: {
      type: "Schwur-Schöpfungsbeweis-Struktur",
      segments: [
        {verses: "86:1-4", label: "Schwur auf Nachtstern", function: "Schwur + Formel-Frage", marker: "وَالسَّمَاءِ وَالطَّارِقِ — Schwurformel (Surenname), وَمَا أَدْرَاكَ — Formelfrage"},
        {verses: "86:5-10", label: "Schöpfungsbeweis", function: "Menschliche Schöpfung aus Wasser", marker: "فَلْيَنظُرِ الْإِنسَانُ مِمَّ خُلِقَ — Aufforderung zur Reflexion"},
        {verses: "86:11-14", label: "Schwur auf Himmel und Erde", function: "Quran als entscheidendes Wort", marker: "وَالسَّمَاءِ ذَاتِ الرَّجْعِ — zweiter Schwur, إِنَّهُ لَقَوْلٌ فَصْلٌ — Quranattribut"},
        {verses: "86:15-17", label: "Schluss: List und Geduld", function: "Sie listen, Gott listet, Aufschub", marker: "إِنَّهُمْ يَكِيدُونَ كَيْدًا — Listmotiv, فَمَهِّلِ — Schlussimperativ"}
      ],
      keyFeature: "Doppelte Schwurstruktur: erster Schwur (V.1-4) auf den Nachtstern, zweiter (V.11-12) auf Himmel und Erde. V.13-14 formulieren den Quran als قَوْلٌ فَصْلٌ ('entscheidendes Wort')."
    }
  });
}

// --- Surah 88: Al-Ghashiya ---
if (!existingNums.has(88)) {
  newEntries.push({
    surah: 88,
    name: "Al-Ghashiya",
    verses: 26,
    structure: {
      type: "Frage-Kontrast-Betrachtung-Struktur",
      segments: [
        {verses: "88:1-7", label: "Eröffnung: Bedeckende und Gesichter I", function: "Frage nach dem Ereignis, gedemuetigt-arbeitende Gesichter", marker: "هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ — Erzähleroeffnung (Surenname)"},
        {verses: "88:8-16", label: "Gesichter II: Glückliche", function: "Zufriedene Gesichter, Paradiesbeschreibung", marker: "وُجُوهٌ يَوْمَئِذٍ نَاعِمَةٌ — Kontrastpaar"},
        {verses: "88:17-20", label: "Schöpfungsbetrachtung", function: "Vierfache Aufforderung zum Schauen", marker: "أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ — vierfache أَفَلَا يَنظُرُونَ-Frage (Kamel, Himmel, Berge, Erde)"},
        {verses: "88:21-26", label: "Schluss: Ermahnung und Abrechnung", function: "Ermahner, nicht Zwinger", marker: "فَذَكِّرْ إِنَّمَا أَنتَ مُذَكِّرٌ — Rollendefinition, إِنَّ إِلَيْنَا إِيَابَهُمْ — Schlussformel"}
      ],
      keyFeature: "Vierfache Betrachtungsaufforderung (V.17-20): Kamele, Himmel, Berge, Erde — eine einzigartige Kombination. V.21-22 definieren die Rolle als مُذَكِّرٌ ('Erinnerer'), nicht als مُصَيْطِرٌ ('Zwinger')."
    }
  });
}

// --- Surah 90: Al-Balad ---
if (!existingNums.has(90)) {
  newEntries.push({
    surah: 90,
    name: "Al-Balad",
    verses: 20,
    structure: {
      type: "Schwur-Ethik-Kontraststruktur",
      segments: [
        {verses: "90:1-4", label: "Schwur auf die Stadt", function: "Schwur auf diese Stadt (هذا البلد), menschliche Muehsal", marker: "لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ — Schwurformel (Surenname)"},
        {verses: "90:5-10", label: "Menschliche Selbstueberschaetzung", function: "Mensch glaubt, unangreifbar zu sein", marker: "أَيَحْسَبُ أَن لَمْ يَرَهُ أَحَدٌ — rhetorische Frage"},
        {verses: "90:11-16", label: "Der steile Weg", function: "Sklavenbefreiung, Waisen, Arme speisen", marker: "فَلَا اقْتَحَمَ الْعَقَبَةَ — العَقَبَة als Metapher für ethische Anstrengung"},
        {verses: "90:17-20", label: "Schluss: Kontrastpaar", function: "Rechte vs. Linke Seite", marker: "أُولَٰئِكَ أَصْحَابُ الْمَيْمَنَةِ — Kontrastpaar"}
      ],
      keyFeature: "Die 'steile Anhoehe' (الْعَقَبَة, V.11-16) ist eine Metapher für ethisches Handeln — ihre Definition erfolgt durch وَمَا أَدْرَاكَ-Formel (V.12) und dann konkrete Taten (Sklavenbefreiung, Speisung)."
    }
  });
}

// --- Surah 92: Al-Layl ---
if (!existingNums.has(92)) {
  newEntries.push({
    surah: 92,
    name: "Al-Layl",
    verses: 21,
    structure: {
      type: "Schwur-Kontrastpaar-Struktur",
      segments: [
        {verses: "92:1-4", label: "Schwurkette und These", function: "Schwur auf Nacht, Tag, Schöpfung — Vielfalt", marker: "وَاللَّيْلِ إِذَا يَغْشَىٰ — Schwurformel (Surenname), إِنَّ سَعْيَكُمْ لَشَتَّىٰ — Schwurantwort"},
        {verses: "92:5-11", label: "Kontrastpaar I: Gebender", function: "Wer gibt und achtsam ist", marker: "فَأَمَّا مَنْ أَعْطَىٰ — فَأَمَّا-Konstruktion"},
        {verses: "92:12-13", label: "Überleitung", function: "Gottes Führung", marker: "إِنَّ عَلَيْنَا لَلْهُدَىٰ — Pflichtformel"},
        {verses: "92:14-21", label: "Kontrastpaar II: Warnung und Lohn", function: "Feuer für Leugner, Lohn für sich Hütende", marker: "فَأَنذَرْتُكُمْ نَارًا تَلَظَّىٰ — Warnformel, وَلَسَوْفَ يَرْضَىٰ — Schluss"}
      ],
      keyFeature: "V.4 (إِنَّ سَعْيَكُمْ لَشَتَّىٰ, 'euer Streben ist vielfaeltig') ist die zentrale These. Die فَأَمَّا-Konstruktion (V.5-10) bildet das ethische Kontrastpaar: Geben+Achtsamkeit vs. Geiz+Selbstgenügsam."
    }
  });
}

// --- Surah 98: Al-Bayyina ---
if (!existingNums.has(98)) {
  newEntries.push({
    surah: 98,
    name: "Al-Bayyina",
    verses: 8,
    structure: {
      type: "These-Kontraststruktur",
      segments: [
        {verses: "98:1-3", label: "Eröffnung: Klarer Beweis", function: "Schriftbesitzer und Beigeseller warteten auf Beweis", marker: "لَمْ يَكُنِ الَّذِينَ كَفَرُوا — Negation + Perfekt, الْبَيِّنَةُ — Beweis (Surenname)"},
        {verses: "98:4-5", label: "Spaltung und reine Religion", function: "Spaltung erst nach dem Beweis, reine Hingabe", marker: "وَمَا تَفَرَّقَ الَّذِينَ — Spaltungsformel"},
        {verses: "98:6-8", label: "Schluss: Kontrastpaar", function: "Leugner vs. Gläubige, bestes/schlechtestes Geschöpf", marker: "إِنَّ الَّذِينَ كَفَرُوا / إِنَّ الَّذِينَ آمَنُوا — parallele إِنَّ-Konstruktionen"}
      ],
      keyFeature: "V.7 beschreibt Gläubige als خَيْرُ الْبَرِيَّةِ ('bestes Geschöpf') und V.6 Leugner als شَرُّ الْبَرِيَّةِ ('schlechtestes Geschöpf') — extremstes Kontrastpaar in einer Kurzsure."
    }
  });
}

// --- Surah 106: Quraysh ---
if (!existingNums.has(106)) {
  newEntries.push({
    surah: 106,
    name: "Quraysh",
    verses: 4,
    structure: {
      type: "Konsequenz-Struktur",
      segments: [
        {verses: "106:1-2", label: "Vertrautheit", function: "Vertrautheit der Quraysh mit Winter- und Sommerreise", marker: "لِإِيلَافِ قُرَيْشٍ — لِ-Präposition als Anbindung (möglicherweise an Sure 105)"},
        {verses: "106:3-4", label: "Konsequenz: Anbetung", function: "Daher sollen sie den Herrn dieses Hauses anbeten", marker: "فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ — فَ + Imperativ der 3. Person"}
      ],
      keyFeature: "Die Sure beginnt mit لِإِيلَافِ — einer Präposition ohne vorhergehenden Bezug in der Sure selbst, was eine Verbindung zu Sure 105 nahelegt. V.3-4 formulieren eine Kausallogik: Sicherheit → Anbetung."
    }
  });
}

// Add all new entries to the existing data
for (const entry of newEntries) {
  macro.surahs.push(entry);
}

// Sort by surah number
macro.surahs.sort((a, b) => a.surah - b.surah);

// Update meta
macro.meta.totalSurahs = macro.surahs.length;

// Verify all 114 surahs
const finalNums = macro.surahs.map(s => s.surah);
const missing = [];
for (let i = 1; i <= 114; i++) {
  if (!finalNums.includes(i)) missing.push(i);
}

if (missing.length > 0) {
  console.log(`WARNING: Still missing surahs: ${missing.join(', ')}`);
} else {
  console.log(`SUCCESS: All 114 surahs are present.`);
}

console.log(`Total surahs in file: ${macro.surahs.length}`);

// Write the file
fs.writeFileSync(macroFile, JSON.stringify(macro, null, 2), 'utf8');
console.log('File written successfully.');
