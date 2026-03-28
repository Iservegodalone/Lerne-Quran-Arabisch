/**
 * Adds meaning and etymology fields to all 304 entries in proper-names.json.
 *
 * Linguistic etymology only — no theological interpretations.
 * Arabic names: root + linguistic meaning
 * Non-Arabic names: marked as Lehnwort/Fremdwort with source language
 * Place names: etymological meaning if known
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'proper-names.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Meaning/etymology database keyed by consonantal form.
// Many consonantal forms are just case/prefix variants of the same base name.
// We define meanings for base forms and map variants.

// Helper: strip common Arabic prefixes (wa-, bi-, li-, fa-, ka-, al-, ya-)
function getBaseName(consonantal) {
  let s = consonantal;
  // Strip leading conjunction/preposition prefixes
  s = s.replace(/^وال/, 'ال');
  s = s.replace(/^فال/, 'ال');
  s = s.replace(/^بال/, 'ال');
  s = s.replace(/^[وبفلك]/, '');
  // Strip vocative يا prefix (as يا or يـ)
  s = s.replace(/^يا/, '');
  return s;
}

// Core meaning database by base consonantal form
const meaningDB = {
  // === الله and variants ===
  "الله": {
    meaning: "Gottheit (Eigenname) — der Angebetete/Verehrte",
    etymology: "Wurzel ا-ل-ه (Gottheit, Verehrung). Wahrscheinlich Kontraktion von الإِلٰه (al-ilāh, 'die Gottheit'). Verwandt mit semitischem *ʔilāh-."
  },
  "اللهم": {
    meaning: "Gottheit (Eigenname) — Anrufeform",
    etymology: "Wurzel ا-ل-ه mit enklitischem -م (Anrufeform, funktional wie يا الله)."
  },
  "آلله": {
    meaning: "Gottheit (Eigenname) — Frageform",
    etymology: "Wurzel ا-ل-ه mit interrogativem Hamza-Präfix."
  },
  "أبالله": {
    meaning: "Gottheit (Eigenname) — mit interrogativem Hamza und Präposition",
    etymology: "Wurzel ا-ل-ه. Fragepartikel أ + Präposition ب + الله."
  },

  // === Propheten und Personen ===
  "موسى": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort, wahrscheinlich ägyptischen Ursprungs (ägyptisch ms/msy = 'geboren/gezeugt'). Vgl. koptisch Μωυσῆς. Kein arabischer Wurzelbezug."
  },
  "إبراهيم": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort, wahrscheinlich aus dem Akkadischen/Aramäischen. Möglicherweise verwandt mit abr-hām ('Vater der Menge') oder ab-rām ('erhabener Vater'). Keine arabische Wurzel."
  },
  "مريم": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort, wahrscheinlich aus dem Hebräischen/Aramäischen (מִרְיָם, Miryām). Etymologie umstritten: möglicherweise ägyptisch mry ('geliebt') oder hebr. מָרָה (mārāh, 'widerspenstig') oder מָרוֹם (mārōm, 'Höhe')."
  },
  "عيسى": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort, wahrscheinlich aus dem Syrischen/Aramäischen (ܝܫܘܥ, Yešūʿ), letztlich hebräisch יֵשׁוּעַ (Yēšūaʿ, 'er rettet'). Die arabische Form zeigt syrische Lautvermittlung."
  },
  "محمد": {
    meaning: "der Vielgepriesene / der wiederholt Gelobte",
    etymology: "Wurzel ح-م-د (loben, preisen). Passivpartizip im Intensivstamm (فُعَّل → مُفَعَّل): 'derjenige, der vielfach gepriesen wird'."
  },
  "آدم": {
    meaning: "der Erdige / der Dunkelhäutige",
    etymology: "Möglicherweise Wurzel أ-د-م (Oberfläche, Haut; cf. أَدِيم = Haut/Erdoberfläche, أُدْمَة = dunkle Hautfarbe). Auch Verbindung zu أَدِيم الأَرْض (Erdoberfläche) vorgeschlagen. Parallele zu hebr. אָדָם (ādām) und אֲדָמָה (adāmāh, 'Erde')."
  },
  "نوح": {
    meaning: "Eigenname — möglicherweise 'der Klagende'",
    etymology: "Möglicherweise Wurzel ن-و-ح (klagen, wehklagen; نَوْح = Wehklage). Parallele zu hebr. נֹחַ (Nōaḥ), dort zu נ-ו-ח ('ruhen') gestellt. Lehnwort-Charakter wahrscheinlich."
  },
  "إسرائيل": {
    meaning: "Eigenname — 'der mit Gott Streitende' oder 'Gott herrscht'",
    etymology: "Lehnwort aus dem Hebräischen (יִשְׂרָאֵל, Yiśrāʔēl). Volksetymologisch: śārāh ('streiten/ringen') + ʔēl ('Gott'). Alternativ: yśr ('herrschen') + ʔēl."
  },
  "فرعون": {
    meaning: "Pharao — Herrschertitel",
    etymology: "Lehnwort aus dem Ägyptischen (pr-ʿꜣ = 'Großes Haus', Bezeichnung des Königspalasts, dann des Herrschers). Über griechisch Φαραώ und/oder direkt semitisch vermittelt."
  },
  "يوسف": {
    meaning: "Eigenname — 'er möge hinzufügen'",
    etymology: "Lehnwort aus dem Hebräischen (יוֹסֵף, Yōsēf), zu י-ס-ף (yasaf, 'hinzufügen'): 'Möge [Gott] hinzufügen'. Keine arabische Wurzel."
  },
  "لوط": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort aus dem Hebräischen (לוֹט, Lōṭ). Möglicherweise zu ל-ו-ט ('verhüllen, verbergen'). Im Arabischen ohne Wurzelbezug."
  },
  "داوود": {
    meaning: "Eigenname — möglicherweise 'Geliebter'",
    etymology: "Lehnwort aus dem Hebräischen (דָּוִד, Dāwīd). Möglicherweise zu דּ-ו-ד ('lieben') oder als Lallwort. Arabisch ohne etymologische Transparenz."
  },
  "داود": {
    meaning: "Eigenname — möglicherweise 'Geliebter'",
    etymology: "Lehnwort aus dem Hebräischen (דָּוִד, Dāwīd). Variante Schreibung von داوود."
  },
  "هارون": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort aus dem Hebräischen (אַהֲרֹן, Ahărōn). Etymologie unklar, möglicherweise ägyptischen Ursprungs."
  },
  "إسحاق": {
    meaning: "Eigenname — 'er lacht'",
    etymology: "Lehnwort aus dem Hebräischen (יִצְחָק, Yiṣḥāq), zu צ-ח-ק (ṣāḥaq, 'lachen')."
  },
  "يعقوب": {
    meaning: "Eigenname — 'der Fersenhalter / er folgt nach'",
    etymology: "Lehnwort aus dem Hebräischen (יַעֲקֹב, Yaʿăqōḇ), zu ע-ק-ב (ʿāqaḇ, 'an der Ferse fassen, nachfolgen')."
  },
  "إسماعيل": {
    meaning: "Eigenname — 'Gott hört'",
    etymology: "Lehnwort aus dem Hebräischen (יִשְׁמָעֵאל, Yišmāʿēl), zu שׁ-מ-ע (šāmaʿ, 'hören') + אֵל (ʔēl, 'Gott')."
  },
  "سليمان": {
    meaning: "Eigenname — möglicherweise 'der Friedliche / Mann des Friedens'",
    etymology: "Lehnwort aus dem Hebräischen (שְׁלֹמֹה, Šəlōmōh), zu שׁ-ל-ם (šālōm, 'Frieden'). Die arabische Form mit -ān-Endung zeigt Adaptierung an arabische Namensmorphologie."
  },
  "إبليس": {
    meaning: "Eigenname des Widersachers — möglicherweise 'der Hoffnungslose'",
    etymology: "Umstritten: entweder Lehnwort aus griechisch διάβολος (diábolos, 'Verleumder') über syrische Vermittlung, oder arabisch zu Wurzel ب-ل-س (ablasa, 'verzweifeln, hoffnungslos werden')."
  },
  "هود": {
    meaning: "Eigenname — möglicherweise 'der Sanfte / der zum Judentum sich Bekennende'",
    etymology: "Möglicherweise Wurzel ه-و-د. Die Grundbedeutung der Wurzel ist 'sanft sein, sich bekehren, umkehren'. Zuordnung unsicher."
  },
  "صالح": {
    meaning: "der Rechtschaffene / der Taugliche",
    etymology: "Wurzel ص-ل-ح (tauglich sein, in Ordnung sein, recht sein). Partizip فَاعِل: 'der Taugliche/Rechtschaffene'."
  },
  "شعيب": {
    meaning: "Eigenname — Diminutivform",
    etymology: "Möglicherweise Diminutiv von شَعْب (šaʿb, 'Volk/Stamm'), Wurzel ش-ع-ب ('sich verzweigen'). Alternativ Lehnwort."
  },
  "عمران": {
    meaning: "Eigenname — 'Gedeihen / Bewohntheit'",
    etymology: "Wurzel ع-م-ر (bewohnen, beleben, lang leben). عِمْرَان ist ein Verbalsubstantiv: 'Aufbau, Besiedelung, Gedeihen'."
  },
  "زكريا": {
    meaning: "Eigenname — 'Gott erinnert sich'",
    etymology: "Lehnwort aus dem Hebräischen (זְכַרְיָה, Zəḵaryāh), zu ז-כ-ר (zāḵar, 'erinnern, gedenken') + יָה (Yāh, Kurzform des Gottesnamens)."
  },
  "يحيى": {
    meaning: "Eigenname — 'er lebt'",
    etymology: "Möglicherweise arabisch zu Wurzel ح-ي-ي (leben): 'er lebt / er wird leben'. Alternativ Lehnwort aus hebr. יוֹחָנָן (Yōḥānān, 'Gott ist gnädig')."
  },
  "المسيح": {
    meaning: "der Gesalbte / der Bestrichene",
    etymology: "Wurzel م-س-ح (streichen, wischen, salben). فَعِيل-Form im Sinne des Passivs: 'der Gesalbte'. Parallele zu hebr. מָשִׁיחַ (māšīaḥ) und aram. mšīḥā."
  },
  "هامان": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Fremdwort. Möglicherweise ägyptisch (Titel/Name am Pharaonenhof) oder persisch. Vgl. auch hebr. הָמָן (Hāmān) im Buch Esther (dort persischer Kontext)."
  },
  "قارون": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort, wahrscheinlich aus dem Hebräischen (קֹרַח, Qōraḥ). Die arabische Form mit -ūn-Endung zeigt Adaptierung. Keine sichere arabische Etymologie."
  },
  "يونس": {
    meaning: "Eigenname — 'Taube'",
    etymology: "Lehnwort aus dem Hebräischen (יוֹנָה, Yōnāh, 'Taube'). Die arabische Form zeigt Adaptierung mit -s-Endung."
  },
  "إدريس": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Umstritten: möglicherweise arabisch zu Wurzel د-ر-س (studieren, lernen) mit إفعيل-Muster. Alternativ Lehnwort, identifiziert mit griechisch Ἑρμῆς (Hermes) oder hebr. Henoch."
  },
  "إلياس": {
    meaning: "Eigenname — 'mein Gott ist Gott'",
    etymology: "Lehnwort aus dem Hebräischen (אֵלִיָּהוּ, Ēliyyāhū), zu אֵל (ʔēl, 'Gott') + יָהוּ (Yāhū, Gottesname): 'Mein Gott ist YHWH'."
  },
  "إل ياسين": {
    meaning: "Variante von إلياس",
    etymology: "Lehnwort. Variante Schreibung/Lesung von إلياس mit arabischer Pluralendung -īn."
  },
  "أيوب": {
    meaning: "Eigenname — 'der Angefeindete / der Reuige'",
    etymology: "Lehnwort aus dem Hebräischen (אִיּוֹב, ʔIyyōḇ). Möglicherweise zu א-י-ב (ʔāyaḇ, 'anfeinden') oder 'Wo ist der Vater?'. Keine arabische Wurzel."
  },
  "آزر": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Fremdwort. Möglicherweise Adaptierung des akkadischen/babylonischen Namens (vgl. Eliezer oder Atar/Athar). Keine arabische Etymologie."
  },
  "عزير": {
    meaning: "Eigenname — Diminutivform von 'Hilfe/Stärke'",
    etymology: "Lehnwort aus dem Hebräischen (עֶזְרָא, ʿEzrāʔ, 'Hilfe'). Die arabische Form عُزَيْر zeigt Diminutiv-Muster (فُعَيْل)."
  },
  "زيد": {
    meaning: "der Zunehmende / Mehrung",
    etymology: "Wurzel ز-ي-د (zunehmen, mehr werden). Arabischer Name: 'Zuwachs, Vermehrung'."
  },
  "لقمان": {
    meaning: "Eigenname — 'der Verschlinger / der viel Schluckende'",
    etymology: "Möglicherweise Wurzel ل-ق-م (verschlingen, schlucken). فُعْلَان-Muster als Intensivform: 'der viel Verschlingende'. Alternativ vorarabisch."
  },
  "تبع": {
    meaning: "Herrschertitel — 'der Gefolgte'",
    etymology: "Wurzel ت-ب-ع (folgen). تُبَّع als Titel der himyaritischen Könige Südarabiens: 'der, dem gefolgt wird'."
  },
  "أحمد": {
    meaning: "der Preiswürdigste / Lobenswerteste",
    etymology: "Wurzel ح-م-د (loben, preisen). Elativ أَفْعَل: 'der am meisten Gepriesene' oder 'der am meisten Preisende'."
  },

  // === Engel und übernatürliche Wesen ===
  "جبريل": {
    meaning: "Eigenname — 'Kraft Gottes' oder 'Mann Gottes'",
    etymology: "Lehnwort aus dem Hebräischen (גַּבְרִיאֵל, Gaḇrīʔēl), zu גֶּבֶר (geḇer, 'Mann/Held') + אֵל (ʔēl, 'Gott')."
  },
  "ميكال": {
    meaning: "Eigenname — 'Wer ist wie Gott?'",
    etymology: "Lehnwort aus dem Hebräischen (מִיכָאֵל, Mīḵāʔēl), zu מִי (mī, 'wer?') + כְּ (kə, 'wie') + אֵל (ʔēl, 'Gott')."
  },
  "هاروت": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Fremdwort, möglicherweise aus dem Avestischen/Altpersischen. Verglichen mit Haurvatāt (Vollkommenheit), einer zoroastrischen Wesenheit."
  },
  "ماروت": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Fremdwort, möglicherweise aus dem Avestischen/Altpersischen. Verglichen mit Amərətāt (Unsterblichkeit), einer zoroastrischen Wesenheit."
  },
  "مالك": {
    meaning: "Besitzer / Herrscher",
    etymology: "Wurzel م-ل-ك (besitzen, herrschen). Partizip فَاعِل: 'Besitzer, Herrscher'. Hier als Eigenname des Höllenwächters."
  },

  // === Dschinnen/Schaitane ===
  "الشيطان": {
    meaning: "der Widersacher / der Entfernte",
    etymology: "Wurzel ش-ط-ن (entfernt sein, sich entfernen, widerspenstig sein). فَيْعَال-Muster: 'der sich weit [von der Wahrheit] Entfernende'. Alternativ Lehnwort aus hebr. שָׂטָן (śāṭān, 'Widersacher')."
  },
  "الشياطين": {
    meaning: "die Widersacher / die Entfernten (Plural)",
    etymology: "Plural von شَيْطَان. Wurzel ش-ط-ن. Siehe الشيطان."
  },

  // === Orte ===
  "جهنم": {
    meaning: "Ortsbezeichnung für die Feuerstätte",
    etymology: "Lehnwort aus dem Hebräischen (גֵּי הִנֹּם, Gēy Hinnōm, 'Tal des Hinnom'), ein Tal bei Jerusalem. Über griechisch γέεννα (géenna) semitisch vermittelt."
  },
  "الجنة": {
    meaning: "der Garten / der umzäunte Ort",
    etymology: "Wurzel ج-ن-ن (verbergen, bedecken). جَنَّة = 'umzäunter Garten' (das Verborgene/Bedeckte durch Vegetation)."
  },
  "مدين": {
    meaning: "Ortsname — Siedlungsgebiet",
    etymology: "Lehnwort, wahrscheinlich vorarabisch. Möglicherweise Bezug zu Wurzel م-د-ن (sich niederlassen), aber eher Eigenname ohne transparente Etymologie."
  },
  "مصر": {
    meaning: "Ägypten / befestigte Stadt",
    etymology: "Wurzel م-ص-ر (Grenze, befestigter Ort). مِصْر kann sowohl 'befestigte Stadt' als auch den Eigennamen Ägypten bezeichnen. Vgl. akkadisch miṣru ('Grenze')."
  },
  "بابل": {
    meaning: "Babylon — Stadtname",
    etymology: "Lehnwort aus dem Akkadischen (Bāb-ilim, 'Tor Gottes'). Über aramäische Vermittlung ins Arabische gelangt."
  },
  "المدينة": {
    meaning: "die Stadt / der Ort der Rechtsprechung",
    etymology: "Wurzel م-د-ن (sich niederlassen) oder Lehnwort aus dem Aramäischen (מְדִינְתָּא, medīntā, 'Provinz/Stadt'), zu ד-י-ן (dīn, 'richten')."
  },
  "بكة": {
    meaning: "Ortsname — Variante von مكة",
    etymology: "Etymologisch unsicher. Möglicherweise Wurzel ب-ك-ك (sich drängen, eng sein): 'Ort des Gedränges'. Alternativ dialektale Variante von مكة."
  },
  "مكة": {
    meaning: "Ortsname — etymologisch umstritten",
    etymology: "Etymologisch unsicher. Möglicherweise Wurzel م-ك-ك ('Mark aussaugen/zerstören') oder Lehnwort. Ptolemäus erwähnt Μακοράβα (Makoraba)."
  },
  "بدر": {
    meaning: "Ortsname — 'Vollmond'",
    etymology: "Wurzel ب-د-ر (voll sein, zuvorkommen). بَدْر = 'Vollmond'. Als Ortsname: Brunnenort zwischen Mekka und Medina."
  },
  "عدن": {
    meaning: "Beständigkeit / dauerhafter Aufenthalt",
    etymology: "Wurzel ع-د-ن (verweilen, sich niederlassen). عَدْن = 'dauerhafter Aufenthaltsort'. Verwandt mit hebr. עֵדֶן (ʿēḏen, 'Eden/Wonne')."
  },
  "يثرب": {
    meaning: "Ortsname — etymologisch unsicher",
    etymology: "Vorarabischer Ortsname. Möglicherweise zu Wurzel ث-ر-ب (tadeln, vorwerfen). Etymologie nicht gesichert."
  },
  "الصفا": {
    meaning: "der glatte Fels / der Felshügel",
    etymology: "Wurzel ص-ف-و/ا (rein sein, glatt sein). صَفَا = 'glatter Fels'. Hügel in Mekka."
  },
  "المروة": {
    meaning: "der weiße glänzende Stein",
    etymology: "Wurzel م-ر-و (weißer Feuerstein). مَرْوَة = 'glänzender Stein, Flintstein'. Hügel in Mekka."
  },
  "حنين": {
    meaning: "Ortsname — 'Sehnsucht'",
    etymology: "Wurzel ح-ن-ن (sich sehnen, sich erbarmen). حُنَيْن als Ortsname (Tal bei Mekka). Diminutiv-Form."
  },
  "الأحقاف": {
    meaning: "die Sanddünen / Sandhügel",
    etymology: "Wurzel ح-ق-ف (sich krümmen, Sanddüne). أَحْقَاف = Plural von حِقْف ('Sandhügel/Düne'). Bezirk im südlichen Arabien."
  },
  "سيناء": {
    meaning: "Ortsname — Sinai",
    etymology: "Lehnwort, Herkunft unsicher. Möglicherweise zu semitischem *sīn ('Zahn, Fels') oder ägyptischem Bezug. Auch سِينِين als Variante."
  },
  "سينين": {
    meaning: "Ortsname — Variante von سيناء (Sinai)",
    etymology: "Lehnwort. Variante Form von سيناء. Siehe dort."
  },
  "إرم": {
    meaning: "Ortsname/Stammesname — etymologisch unsicher",
    etymology: "Lehnwort, möglicherweise verwandt mit hebr. אֲרָם (Aram). Bezeichnet einen antiken Stamm oder Ort. Etymologie umstritten."
  },
  "سبإ": {
    meaning: "Ortsname/Stammesname — Saba",
    etymology: "Vorarabischer Name des südarabischen Königreichs. Etymologie unsicher. Möglicherweise zu Wurzel س-ب-ا oder altsüdarabischen Ursprungs."
  },
  "الجودي": {
    meaning: "Bergname — etymologisch unsicher",
    etymology: "Möglicherweise Wurzel ج-و-د (großzügig sein, Regen spenden). Alternativ vorarabischer Bergname (in Nordmesopotamien/Südostanatolien)."
  },
  "سقر": {
    meaning: "Bezeichnung für extreme Hitze",
    etymology: "Möglicherweise Wurzel س-ق-ر (versengen durch Hitze). Alternativ Lehnwort. Bezeichnung einer Feuerstätte."
  },
  "لظى": {
    meaning: "die Flamme / die lodernde Glut",
    etymology: "Wurzel ل-ظ-ي (lodern, flammen). لَظَى = 'Flamme, loderndes Feuer'. Bezeichnung einer Feuerstätte."
  },
  "الفردوس": {
    meaning: "der Paradiesgarten",
    etymology: "Lehnwort aus dem Altpersischen (pairidaēza, 'umzäunte Einfriedung/Park'). Über griechisch παράδεισος (parádeisos) ins Semitische gelangt."
  },
  "سلسبيل": {
    meaning: "Quellenname — 'fließend/angenehm im Schlund'",
    etymology: "Arabisch: möglicherweise Zusammensetzung سَلْس ('glatt, fließend') + بِيل ('Weg') oder Intensivform für 'leicht zu schlucken'. Als Eigenname einer Quelle."
  },
  "الزقوم": {
    meaning: "Pflanzenname — bittere/gierig verschlungene Nahrung",
    etymology: "Wurzel ز-ق-م (gierig schlucken/verschlingen). زَقُّوم = 'etwas Unangenehmes, das man hinunterwürgt'. Intensivform."
  },
  "زقوم": {
    meaning: "Pflanzenname — bittere/gierig verschlungene Nahrung",
    etymology: "Wurzel ز-ق-م (gierig schlucken/verschlingen). Siehe الزقوم."
  },

  // === Schriften ===
  "القرآن": {
    meaning: "das Vorgetragene / die Rezitation",
    etymology: "Wurzel ق-ر-أ (lesen, vortragen, rezitieren). قُرْآن ist ein Verbalsubstantiv (فُعْلَان): 'das Vorgetragene/Gelesene'."
  },
  "قرآن": {
    meaning: "Vortrag / Rezitation",
    etymology: "Wurzel ق-ر-أ (vortragen, rezitieren). Siehe القرآن."
  },
  "قرآنا": {
    meaning: "Vortrag / Rezitation (Akkusativform)",
    etymology: "Wurzel ق-ر-أ. Siehe القرآن."
  },
  "التوراة": {
    meaning: "die Weisung / die Unterweisung",
    etymology: "Lehnwort aus dem Hebräischen (תּוֹרָה, Tōrāh), zu י-ר-ה (yārāh, 'unterweisen, lehren'): 'Unterweisung, Weisung'."
  },
  "الإنجيل": {
    meaning: "die frohe Botschaft",
    etymology: "Lehnwort aus dem Griechischen (εὐαγγέλιον, euangélion, 'gute Botschaft'). Über syrisch-aramäische Vermittlung (ܐܶܘܰܢܓܶܠܝܳܘܢ)."
  },
  "الزبور": {
    meaning: "die Schrift / die Psalmen",
    etymology: "Wurzel ز-ب-ر (schreiben, einritzen). زَبُور = 'Geschriebenes, Psalm'. Verwandt mit der Bedeutung 'in Stein einritzen'. Parallele zu hebr. מִזְמוֹר (mizmōr, 'Psalm')."
  },
  "زبورا": {
    meaning: "Schrift / Psalmen (Akkusativform)",
    etymology: "Wurzel ز-ب-ر. Siehe الزبور."
  },

  // === Gruppen und Gemeinschaften ===
  "اليهود": {
    meaning: "die Juden / die sich Bekehrenden",
    etymology: "Wurzel ه-و-د (umkehren, sich bekehren). يَهُود = 'die sich [zu Gott] Bekehrenden'. Parallele zu hebr. יְהוּדָה (Yəhūḏāh, 'Juda')."
  },
  "يهوديا": {
    meaning: "jüdisch / zum Judentum gehörig",
    etymology: "Nisba-Adjektiv zu يَهُود. Wurzel ه-و-د."
  },
  "النصارى": {
    meaning: "die Nazarener / die Helfer",
    etymology: "Möglicherweise zu Wurzel ن-ص-ر (helfen) als 'Helfer', oder Herkunftsbezeichnung von نَاصِرَة (Nazareth). Vermutlich beides parallel wirksam."
  },
  "نصارى": {
    meaning: "Nazarener / Helfer (ohne Artikel)",
    etymology: "Siehe النصارى."
  },
  "نصرانيا": {
    meaning: "nazarenisch / christlich (Adjektiv)",
    etymology: "Nisba-Adjektiv zu نَصَارَى. Wurzel ن-ص-ر oder Herkunftsbezeichnung."
  },
  "المسلمين": {
    meaning: "die sich Ergebenden / die sich Unterwerfenden (Akkusativ/Genitiv)",
    etymology: "Wurzel س-ل-م (heil sein, sich ergeben). مُسْلِم = Partizip IV: 'der sich Ergebende'. Pluralform."
  },
  "المسلمون": {
    meaning: "die sich Ergebenden / die sich Unterwerfenden (Nominativ)",
    etymology: "Wurzel س-ل-م. Siehe المسلمين."
  },
  "الإسلام": {
    meaning: "die Ergebung / die Unterwerfung",
    etymology: "Wurzel س-ل-م (heil sein, sich ergeben). إِسْلَام = Verbalsubstantiv IV: 'die Hin-/Untergabe, Ergebung'."
  },
  "الروم": {
    meaning: "die Römer / Byzantiner",
    etymology: "Lehnwort aus dem Griechischen (Ῥωμαῖοι, Rhōmaîoi) über aramäische Vermittlung. Bezeichnung für das Oströmische/Byzantinische Reich."
  },
  "المجوس": {
    meaning: "die Magier / Zoroastrier",
    etymology: "Lehnwort aus dem Altpersischen (maguš, 'Priester/Magier'). Über griechisch μάγος (mágos). Wurzel م-ج-س im Arabischen sekundär."
  },
  "الصابئين": {
    meaning: "die Sabier / die [aus einer Religion] Herausgetretenen",
    etymology: "Möglicherweise Wurzel ص-ب-أ (heraustreten, sich abwenden von einer Religion). Alternativ mandäisch/aramäischen Ursprungs (ṣ-b-ʿ, 'taufen')."
  },
  "الصابئون": {
    meaning: "die Sabier / die [aus einer Religion] Herausgetretenen (Nominativ)",
    etymology: "Siehe الصابئين."
  },
  "السامري": {
    meaning: "der Samariter / der aus Samaria Stammende",
    etymology: "Herkunftsbezeichnung (Nisba) von سَامِرَة (Samaria/Šomrōn). Wurzel س-م-ر im Arabischen sekundär."
  },
  "سامري": {
    meaning: "samaritisch / aus Samaria",
    etymology: "Siehe السامري."
  },
  "قريش": {
    meaning: "Stammesname — möglicherweise 'die sich Versammelnden'",
    etymology: "Möglicherweise Wurzel ق-ر-ش (sich versammeln, zusammentragen) oder Diminutiv von قِرْش ('Hai/großer Fisch'). Etymologie des Stammesnamens umstritten."
  },

  // === Konzepte und Titel mit Eigennamencharakter ===
  "الجاهلية": {
    meaning: "die [Zeit der] Unwissenheit",
    etymology: "Wurzel ج-ه-ل (nicht wissen, unwissend sein). جَاهِلِيَّة = abstraktes Nomen: 'Zustand der Unwissenheit'."
  },
  "الكعبة": {
    meaning: "das würfelförmige [Gebäude]",
    etymology: "Wurzel ك-ع-ب (anschwellen, kubisch sein). كَعْبَة = 'Würfel, kubische Form'. Bezeichnung des Kultgebäudes in Mekka."
  },
  "سلم": {
    meaning: "Frieden / Heil / Ergebung",
    etymology: "Wurzel س-ل-م (heil sein, unversehrt sein). سِلْم/سَلْم = 'Frieden, Sicherheit'."
  },

  // === Arabische Götzenbezeichnungen ===
  "اللات": {
    meaning: "vorislamische Gottheit — 'die Göttin'",
    etymology: "Wahrscheinlich feminines Gegenstück zu الله (al-Lāh). Zu Wurzel ا-ل-ه. Möglicherweise auch zu ل-و-ي ('drehen, umkreisen') oder ل-ت-ت ('kneten, mischen')."
  },
  "العزى": {
    meaning: "vorislamische Gottheit — 'die Mächtigste'",
    etymology: "Wurzel ع-ز-ز (mächtig sein, stark sein). الْعُزَّى = feminine Elativform: 'die Mächtigste/Stärkste'."
  },
  "مناة": {
    meaning: "vorislamische Gottheit — 'das Schicksal'",
    etymology: "Möglicherweise Wurzel م-ن-ي (bestimmen, zuteilen) oder م-ن-ا. مَنَاة = 'Schicksal, Los'. Verwandt mit arabisch مَنِيَّة ('Tod, Geschick')."
  },
  "بعلا": {
    meaning: "Herr / Ehemann / Besitzer (hier: Gottheit)",
    etymology: "Wurzel ب-ع-ل (Herr sein, besitzen). بَعْل = 'Herr, Ehemann, Besitzer'. Als Gottesbezeichnung semitisch weit verbreitet (vgl. phönizisch Baʿal)."
  },
  "الشعرى": {
    meaning: "der Sirius-Stern",
    etymology: "Wurzel ش-ع-ر (wahrnehmen, empfinden). الشِّعْرَى = Name des Sirius (hellster Stern). Möglicherweise weil sein Aufgang die Hitzeperiode 'ankündigt'."
  },

  // === Vorislamische Idole (Nuh-Zeitgenossen) ===
  "ودا": {
    meaning: "vorislamische Gottheit — 'Zuneigung/Liebe'",
    etymology: "Wurzel و-د-د (lieben, zugeneigt sein). وَدّ = 'Liebe, Zuneigung'. Als Gottesname."
  },
  "سواعا": {
    meaning: "vorislamische Gottheit — etymologisch unsicher",
    etymology: "Möglicherweise Wurzel س-و-ع (verbreiten, sich ausbreiten). Oder Lehnwort. Etymologie nicht gesichert."
  },
  "يغوث": {
    meaning: "vorislamische Gottheit — 'er hilft/rettet'",
    etymology: "Wurzel غ-و-ث (helfen, beistehen; Hilfe rufen). يَغُوث = 'er rettet/hilft'. Verbform als Eigenname."
  },
  "يعوق": {
    meaning: "vorislamische Gottheit — 'er hindert/schützt'",
    etymology: "Wurzel ع-و-ق (hindern, aufhalten). يَعُوق = 'er hindert/hält zurück'. Alternativ Schutzfunktion. Verbform als Eigenname."
  },
  "نسرا": {
    meaning: "vorislamische Gottheit — 'Adler'",
    etymology: "Wurzel ن-س-ر (Adler; reißen, zerreißen). نَسْر = 'Adler, Geier'. Als Gottesname: Adlergottheit."
  },

  // === Stämme und Völker ===
  "عاد": {
    meaning: "Stammesname — möglicherweise 'die Alten / die Zurückkehrenden'",
    etymology: "Möglicherweise Wurzel ع-و-د (zurückkehren). Vorarabischer Stammesname des südarabischen Raums. Etymologie nicht gesichert."
  },
  "ثمود": {
    meaning: "Stammesname — möglicherweise 'die wenig Wasser Habenden'",
    etymology: "Möglicherweise zu Wurzel ث-م-د (wenig Wasser). ثَمُود als Stammesname der nabatäischen Region. Historisch in assyrischen Quellen als Thamudeni belegt."
  },
  "طالوت": {
    meaning: "Eigenname — 'der Hochgewachsene'",
    etymology: "Möglicherweise arabisch zu Wurzel ط-و-ل (lang/groß sein) mit فَاعُوت-Muster. Identifiziert mit hebr. שָׁאוּל (Šāʔūl, Saul)."
  },
  "جالوت": {
    meaning: "Eigenname — Goliath",
    etymology: "Lehnwort aus dem Hebräischen (גָּלְיָת, Golyāṯ). Die arabische Form mit -ūt-Endung zeigt Anpassung an das طالوت-Muster."
  },

  // === Weitere ===
  "يأجوج": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort. Möglicherweise verwandt mit hebr. גּוֹג (Gōg) und griechisch Γώγ/Μαγώγ. Keine gesicherte semitische Etymologie."
  },
  "مأجوج": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort. Gegenstück zu يأجوج. Vgl. hebr. מָגוֹג (Māgōg). Keine gesicherte Etymologie."
  },
  "رمضان": {
    meaning: "Monatsname — 'die brennende Hitze'",
    etymology: "Wurzel ر-م-ض (heiß/brennend sein). رَمَضَان = 'Monat der brennenden Hitze'. Benennung nach Witterung des vorislamischen Kalenders."
  },
  "عرفات": {
    meaning: "Ortsname — 'die Erkennungen / die Höhen'",
    etymology: "Möglicherweise Wurzel ع-ر-ف (erkennen, wissen). عَرَفَات als Plural: 'Stätten des Erkennens'. Alternativ zu عُرْف ('Erhöhung, Kamm'). Ebene bei Mekka."
  },
  "الجمعة": {
    meaning: "der Versammlungs[tag]",
    etymology: "Wurzel ج-م-ع (versammeln, sammeln). جُمُعَة = 'Versammlung'. Name des Freitags."
  },
  "جمعة": {
    meaning: "Versammlung / Versammlungstag",
    etymology: "Wurzel ج-م-ع. Siehe الجمعة."
  },
  // === Akkusativ/Tanwin forms (ending in ا) ===
  "نوحا": {
    meaning: "Eigenname — möglicherweise 'der Klagende' (Akkusativform)",
    etymology: "Möglicherweise Wurzel ن-و-ح (klagen, wehklagen). Siehe نوح."
  },
  "شعيبا": {
    meaning: "Eigenname — Diminutivform (Akkusativform)",
    etymology: "Möglicherweise Diminutiv von شَعْب. Wurzel ش-ع-ب ('sich verzweigen'). Siehe شعيب."
  },
  "هودا": {
    meaning: "Eigenname — möglicherweise 'der Sanfte' (Akkusativform)",
    etymology: "Möglicherweise Wurzel ه-و-د. Siehe هود."
  },
  "صالحا": {
    meaning: "der Rechtschaffene (Akkusativform)",
    etymology: "Wurzel ص-ل-ح. Siehe صالح."
  },
  "لوطا": {
    meaning: "Eigenname (Akkusativform)",
    etymology: "Lehnwort aus dem Hebräischen. Siehe لوط."
  },
  "عادا": {
    meaning: "Stammesname (Akkusativform)",
    etymology: "Möglicherweise Wurzel ع-و-د. Siehe عاد."
  },
  "سلسبيلا": {
    meaning: "Quellenname — 'fließend/angenehm im Schlund' (Akkusativform)",
    etymology: "Siehe سلسبيل."
  },

  // === Prefix combinations ===
  "تالله": {
    meaning: "Gottheit (Eigenname) — mit Schwurpartikel",
    etymology: "Wurzel ا-ل-ه. Schwurpartikel تَ + الله."
  },
  "فلله": {
    meaning: "Gottheit (Eigenname) — mit Konjunktion",
    etymology: "Wurzel ا-ل-ه. Konjunktion فَ + Präposition لِ + الله."
  },
  "للإسلام": {
    meaning: "die Ergebung / die Unterwerfung (mit Präposition)",
    etymology: "Wurzel س-ل-م. Siehe الإسلام."
  },
  "للمسلمين": {
    meaning: "die sich Ergebenden (mit Präposition)",
    etymology: "Wurzel س-ل-م. Siehe المسلمين."
  },
  "للشياطين": {
    meaning: "die Widersacher (Plural, mit Präposition)",
    etymology: "Wurzel ش-ط-ن. Siehe الشياطين."
  },

  // === اليسع ===
  "اليسع": {
    meaning: "Eigenname — etymologisch unsicher",
    etymology: "Lehnwort aus dem Hebräischen (אֱלִישָׁע, Ělīšāʿ, 'mein Gott ist Rettung'), zu אֵל (ʔēl, 'Gott') + י-ש-ע (yāšaʿ, 'retten')."
  },
};

// Special overrides for entries where consonantal is wrong/contextual.
// These entries have consonantal fields that don't represent the actual name.
// Map by index to the correct meaning.
const indexOverrides = {
  // خطوات is actually الشيطان context
  18: meaningDB["الشيطان"],
  // وزوجك is actually الجنة context
  19: meaningDB["الجنة"],
  // اسمه (index 43) is المسيح
  43: meaningDB["المسيح"],
  // أنزلت (index 97) is التوراة
  97: meaningDB["التوراة"],
  // تتخذوا (index 124) is اليهود
  124: meaningDB["اليهود"],
  // اسمه (index 143) is يحيى
  143: meaningDB["يحيى"],
  // بالغ (index 190) is الكعبة
  190: meaningDB["الكعبة"],
  // واستوت (index 210) is الجودي
  210: meaningDB["الجودي"],
  // فتكون (index 231) is الشيطان
  231: meaningDB["الشيطان"],
  // أوتي (index 253) is قارون
  253: meaningDB["قارون"],
  // اسمه (index 284) is أحمد
  284: meaningDB["أحمد"],
};

// Now map the 304 entries. Many are prefix variants of the same base.
// Strategy: check index overrides first, then exact match, then strip prefixes.
function getMeaningForEntry(entry, index) {
  // Index-based override for entries with wrong consonantal
  if (indexOverrides[index]) {
    return indexOverrides[index];
  }

  const c = entry.consonantal;

  // Direct match
  if (meaningDB[c]) {
    return meaningDB[c];
  }

  // Try stripping common prefixes iteratively
  let base = c;

  // Strip leading و
  if (base.startsWith('و')) {
    base = base.substring(1);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip leading ب
  if (base.startsWith('ب')) {
    base = base.substring(1);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip leading ل
  if (base.startsWith('ل')) {
    base = base.substring(1);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip leading ف
  if (base.startsWith('ف')) {
    base = base.substring(1);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset and try compound prefixes
  base = c;

  // Strip و + ال
  if (base.startsWith('وال')) {
    base = base.substring(3);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip ول (و + ل)
  if (base.startsWith('ول')) {
    base = base.substring(2);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip لل
  if (base.startsWith('لل')) {
    base = base.substring(2);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Reset
  base = c;

  // Strip وت (و + تاء القسم)
  if (base.startsWith('وت')) {
    base = base.substring(2);
    if (meaningDB[base]) return meaningDB[base];
    if (meaningDB['ال' + base]) return meaningDB['ال' + base];
  }

  // Strip ال
  if (base.startsWith('ال')) {
    const stripped = base.substring(2);
    if (meaningDB[stripped]) return meaningDB[stripped];
  }

  // Try stripping trailing ا (tanwin accusative marker)
  if (c.endsWith('ا') && c.length > 2) {
    const withoutA = c.substring(0, c.length - 1);
    if (meaningDB[withoutA]) return meaningDB[withoutA];
  }

  return null;
}

// Process all entries
let matched = 0;
let unmatched = [];

data.names.forEach((entry, i) => {
  const info = getMeaningForEntry(entry, i);
  if (info) {
    entry.meaning = info.meaning;
    entry.etymology = info.etymology;
    matched++;
  } else {
    unmatched.push({ index: i, consonantal: entry.consonantal, name: entry.name, root: entry.root });
  }
});

if (unmatched.length > 0) {
  console.log(`\nUnmatched entries (${unmatched.length}):`);
  unmatched.forEach(u => {
    console.log(`  ${u.index}: ${u.consonantal} (${u.name}) root=${u.root || 'NONE'}`);
  });
}

console.log(`\nMatched: ${matched}/${data.names.length}`);

if (unmatched.length === 0) {
  // Update meta
  data.meta.meaningFields = "meaning and etymology added to all entries";

  // Write the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('File written successfully.');
} else {
  console.log('NOT writing file — there are unmatched entries.');
}
