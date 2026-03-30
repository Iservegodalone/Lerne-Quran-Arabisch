/**
 * add-missing-urls.cjs
 *
 * Adds verification URLs to data files that are missing them:
 * 1. frequency-learning-path.json — add corpusUrl for each root
 * 2. sura-index.json — add verifyUrl for each surah
 * 3. surah-macrostructure.json — add verifyUrl
 * 4. verb-form-frequency.json — add verifyUrl
 * 5. script-history-lesson.json — add source URLs to sections
 * 6. rasm-glyph-mapping.json — add verifyUrl
 * 7. lanes-reading-guide.json — add URLs
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../app/src/data');

// ─── 1. frequency-learning-path.json ───
{
  const fp = path.join(dataDir, 'frequency-learning-path.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  // Load root-meanings for URL lookup
  const rootMeanings = JSON.parse(fs.readFileSync(path.join(dataDir, 'root-meanings.json'), 'utf8'));
  const rootUrlMap = {};
  for (const r of rootMeanings.roots) {
    const key = r.root;
    rootUrlMap[key] = { lanesUrl: r.lanesUrl, corpusUrl: r.corpusUrl };
  }

  let added = 0;
  for (const tier of (data.tiers || [])) {
    for (const root of (tier.roots || [])) {
      if (!root.corpusUrl && rootUrlMap[root.root]) {
        root.corpusUrl = rootUrlMap[root.root].corpusUrl;
        root.lanesUrl = rootUrlMap[root.root].lanesUrl;
        added++;
      }
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`frequency-learning-path.json: Added URLs to ${added} roots`);
}

// ─── 2. sura-index.json ───
{
  const fp = path.join(dataDir, 'sura-index.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  let added = 0;
  for (const surah of (data.surahs || [])) {
    if (!surah.verifyUrl) {
      surah.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${surah.number}&verse=1`;
      added++;
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`sura-index.json: Added verifyUrl to ${added} surahs`);
}

// ─── 3. surah-macrostructure.json ───
{
  const fp = path.join(dataDir, 'surah-macrostructure.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (!data.meta) data.meta = {};
  if (!data.meta.sources) {
    data.meta.sources = [
      { name: "Quranic Arabic Corpus", url: "https://corpus.quran.com/" }
    ];
  }

  let added = 0;
  for (const entry of (data.surahs || data.entries || [])) {
    if (!entry.verifyUrl && entry.surah) {
      entry.verifyUrl = `https://corpus.quran.com/wordbyword.jsp?chapter=${entry.surah}&verse=1`;
      added++;
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`surah-macrostructure.json: Added verifyUrl to ${added} entries`);
}

// ─── 4. verb-form-frequency.json ───
{
  const fp = path.join(dataDir, 'verb-form-frequency.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (!data.meta.verifyUrl) {
    data.meta.verifyUrl = "https://corpus.quran.com/wordmorphology.jsp";
  }

  for (const form of (data.forms || [])) {
    if (!form.verifyUrl) {
      form.verifyUrl = "https://corpus.quran.com/wordmorphology.jsp";
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`verb-form-frequency.json: Added verifyUrl to meta and all forms`);
}

// ─── 5. script-history-lesson.json ───
{
  const fp = path.join(dataDir, 'script-history-lesson.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  // Add verifyUrl to sections that mention specific historical claims
  for (const section of (data.sections || [])) {
    if (!section.verifyUrl) {
      if (section.title && section.title.includes('Rasm')) {
        section.verifyUrl = "https://corpus.quran.com/qurantext.jsp";
      } else if (section.title && section.title.includes('I\'jam')) {
        section.verifyUrl = "https://corpus.quran.com/qurantext.jsp";
      } else if (section.title && section.title.includes('Tashkil')) {
        section.verifyUrl = "https://corpus.quran.com/qurantext.jsp";
      } else if (section.title && section.title.includes('Abdschad')) {
        section.verifyUrl = "https://en.wikipedia.org/wiki/Abjad";
      }
    }
  }

  // Also add verifyUrls to test exercises
  if (data.testContent && data.testContent.exercises) {
    for (const ex of data.testContent.exercises) {
      if (!ex.verifyUrl) {
        ex.verifyUrl = "https://corpus.quran.com/qurantext.jsp";
      }
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`script-history-lesson.json: Added verifyUrls`);
}

// ─── 6. rasm-glyph-mapping.json ───
{
  const fp = path.join(dataDir, 'rasm-glyph-mapping.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (!data.meta) data.meta = {};
  if (!data.meta.sources) {
    data.meta.sources = [
      { name: "Quranic Arabic Corpus", url: "https://corpus.quran.com/" }
    ];
  }
  if (!data.meta.verifyUrl) {
    data.meta.verifyUrl = "https://corpus.quran.com/qurantext.jsp";
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`rasm-glyph-mapping.json: Added meta sources and verifyUrl`);
}

// ─── 7. lanes-reading-guide.json ───
{
  const fp = path.join(dataDir, 'lanes-reading-guide.json');
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (!data.meta) data.meta = {};
  if (!data.meta.sources) {
    data.meta.sources = [
      { name: "Lane's Arabic-English Lexicon", url: "https://ejtaal.net/aa/" },
      { name: "Lane's Lexicon (Archive.org)", url: "https://archive.org/details/ArabicEnglishLexicon.LanePart" }
    ];
  }
  if (!data.meta.verifyUrl) {
    data.meta.verifyUrl = "https://ejtaal.net/aa/";
  }

  // Add URLs to sections
  for (const section of (data.sections || data.tips || [])) {
    if (section && !section.verifyUrl) {
      section.verifyUrl = "https://ejtaal.net/aa/";
    }
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`lanes-reading-guide.json: Added sources and verifyUrls`);
}

console.log('\nDone! All 7 files updated with verification URLs.');
