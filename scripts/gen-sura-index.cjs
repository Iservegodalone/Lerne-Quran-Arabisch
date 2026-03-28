const fs = require('fs');
const path = require('path');
const dataDir = 'C:/Users/limao/OneDrive/Desktop/Projects/Forschung/quran_arabic/app/src/data';
const simpleClean = require(path.join(dataDir, 'quran-simple-clean.json'));
const morphDb = require(path.join(dataDir, 'quran-morphology-db.json'));
const nameArabic = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
const nameGerman = ["Die Eröffnende","Die Kuh","Die Sippe Imrans","Die Frauen","Der Tisch","Das Vieh","Die Höhen","Die Beute","Die Reue","Yunus","Hud","Yusuf","Der Donner","Ibrahim","Das Steinland","Die Biene","Die Nachtreise","Die Höhle","Maryam","Ta-Ha","Die Propheten","Die Pilgerfahrt","Die Gläubigen","Das Licht","Die Unterscheidung","Die Dichter","Die Ameise","Die Erzählung","Die Spinne","Die Römer","Luqman","Die Niederwerfung","Die Gruppierungen","Saba","Der Schöpfer","Ya-Sin","Die sich Reihenden","Sad","Die Scharen","Der Vergebende","Ausführlich dargelegt","Die Beratung","Der Goldschmuck","Der Rauch","Die Kniende","Die Sanddünen","Muhammad","Der Sieg","Die Gemächer","Qaf","Die Aufwirbelnden","Der Berg","Der Stern","Der Mond","Der Barmherzige","Das Ereignis","Das Eisen","Die Streitende","Die Versammlung","Die Geprüfte","Die Reihe","Der Freitag","Die Heuchler","Die Übervorteilung","Die Scheidung","Das Verbot","Die Herrschaft","Die Schreibfeder","Die Wahrhaftige","Die Aufstiegswege","Nuh","Die Dschinn","Der Verhüllte","Der Bedeckte","Die Auferstehung","Der Mensch","Die Gesandten","Die Kunde","Die Entreissenden","Er runzelte die Stirn","Das Zusammenfalten","Das Auseinanderbrechen","Die Betrüger","Das Zerreissen","Die Türme","Der Nachtstern","Der Höchste","Die Bedeckende","Die Morgendämmerung","Die Stadt","Die Sonne","Die Nacht","Der Vormittag","Das Weiten","Die Feige","Das Anhaftende","Die Bestimmung","Der klare Beweis","Das Beben","Die Rennenden","Das Verhängnis","Das Vermehren","Die Zeit","Der Stichler","Der Elefant","Die Quraisch","Die Hilfeleistung","Die Fülle","Die Ungläubigen","Die Hilfe","Die Palmfasern","Die Aufrichtigkeit","Das Frühlicht","Die Menschen"];
const ms = new Set([2,3,4,5,8,9,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,110]);
const sr = {};
for (const w of morphDb.words) {
  const p = w.l.split(':');
  const sn = parseInt(p[0]);
  if (!sr[sn]) sr[sn] = {};
  if (w.r) sr[sn][w.r] = (sr[sn][w.r]||0)+1;
}
const surahs = [];
for (const s of simpleClean.surahs) {
  const n = s.number;
  let wc = 0;
  for (const v of s.verses) wc += v.text.split(/\s+/).filter(x=>x.length>0).length;
  const rc = sr[n]||{};
  const ur = Object.keys(rc).length;
  const tr = Object.entries(rc).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([r,c])=>({root:r,count:c}));
  surahs.push({
    number: n,
    nameArabic: nameArabic[n-1],
    nameGerman: nameGerman[n-1],
    verseCount: s.verses.length,
    wordCount: wc,
    uniqueRoots: ur,
    topRoots: tr,
    classification: ms.has(n) ? 'medinensisch' : 'mekkanisch'
  });
}
const output = {
  meta: {
    description: 'Surah index with word counts, root statistics, and classification',
    totalSurahs: 114
  },
  surahs
};
fs.writeFileSync(path.join(dataDir, 'sura-index.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('sura-index.json generated with', surahs.length, 'surahs');
