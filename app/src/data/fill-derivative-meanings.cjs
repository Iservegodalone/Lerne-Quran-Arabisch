/**
 * fill-derivative-meanings.cjs
 *
 * Fills missing `meaning` fields in keyDerivatives of root-meanings.json.
 * Uses the root's overall meaning + the derivative's morphological form pattern
 * to generate appropriate German glosses.
 *
 * Strategy:
 * 1. Strip prefix particles (و، ب، ل، ف، ال، etc.)
 * 2. Analyze the remaining form for verb prefixes/suffixes or noun patterns
 * 3. Generate a German gloss combining root meaning + grammatical annotation
 *
 * Arabic morphological detection is inherently imperfect without full
 * vowelization context, but the Quranic forms are fully vowelized,
 * so we can use diacritics for fairly reliable pattern detection.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'root-meanings.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ========== HELPERS ==========

/** Remove all Arabic diacritics/tashkeel from a string */
function rd(s) {
  return s.replace(/[\u064B-\u065F\u0670\u0653\u0654\u0655\u0656\u0657\u0658\u06D6-\u06ED\u0610-\u061A\u0640\u06DF\u06E0\u06E5\u06E6]/g, '');
}

/** Get short core meaning from root (before the dash) */
function coreMeaning(meaning) {
  if (!meaning) return '';
  return meaning.split(/\s*[—–-]\s*/)[0].trim();
}

/** Get just the first verb/meaning word */
function firstMeaning(meaning) {
  const core = coreMeaning(meaning);
  const parts = core.split(/[,،;]/);
  return parts[0].trim();
}

/**
 * Classify and gloss a derivative form.
 * Returns a German meaning string.
 */
function generateMeaning(form, rootMeaning) {
  const verbShort = firstMeaning(rootMeaning);
  const nomShort = coreMeaning(rootMeaning);

  // Step 1: Strip leading conjunction و / ف
  // IMPORTANT: فَ as conjunction is only before verbs or articles, not at the start of nouns.
  // We check: وَ + following letter must be a known prefix (imperfect, article, etc.)
  let work = form;
  let conjPrefix = '';
  if (work.startsWith('وَ')) {
    // Check what follows — if it's an imperfect verb prefix, article, or preposition, strip it
    const after = work.substring(2);
    if (after.startsWith('ٱل') || after.startsWith('ال') || after.startsWith('يَ') || after.startsWith('يُ') ||
        after.startsWith('تَ') || after.startsWith('تُ') || after.startsWith('نَ') || after.startsWith('نُ') ||
        after.startsWith('أَ') || after.startsWith('أُ') || after.startsWith('لِ') || after.startsWith('بِ') ||
        after.startsWith('كَ') || after.startsWith('سَ')) {
      conjPrefix = 'und ';
      work = work.substring(2);
    }
    // Otherwise, the و might be part of a perfect verb (وَدَّ, وَعَدَ, etc.) — don't strip
  } else if (work.startsWith('فَ')) {
    // Same check for فَ
    const after = work.substring(2);
    if (after.startsWith('ٱل') || after.startsWith('ال') || after.startsWith('يَ') || after.startsWith('يُ') ||
        after.startsWith('تَ') || after.startsWith('تُ') || after.startsWith('نَ') || after.startsWith('نُ') ||
        after.startsWith('أَ') || after.startsWith('أُ') || after.startsWith('لِ') || after.startsWith('بِ') ||
        after.startsWith('كَ') || after.startsWith('سَ')) {
      conjPrefix = 'so/dann ';
      work = work.substring(2);
    }
    // Otherwise, فَ is part of the word (فَعَلَ, فَوْز, etc.)
  }

  // Step 2: Strip preposition
  let prepPrefix = '';
  if (work.startsWith('بِ') || work.startsWith('بِّ')) {
    prepPrefix = 'mit/in ';
    work = work.substring(2);
  } else if (work.startsWith('لِ') || work.startsWith('لِّ')) {
    prepPrefix = 'fuer ';
    work = work.substring(2);
    // Handle لِل (li + al)
    if (work.startsWith('ل')) {
      work = 'ٱل' + work.substring(1);
    }
  } else if (work.startsWith('كَ')) {
    prepPrefix = 'wie ';
    work = work.substring(2);
  }

  // Step 2b: Strip future particle سَ (only if followed by imperfect verb prefix يَ/يُ/تَ/تُ/نَ/نُ)
  if (work.startsWith('سَ')) {
    const afterSa = work.substring(2);
    if (afterSa.startsWith('يَ') || afterSa.startsWith('يُ') || afterSa.startsWith('تَ') ||
        afterSa.startsWith('تُ') || afterSa.startsWith('نَ') || afterSa.startsWith('نُ')) {
      work = afterSa;
    }
  }

  // Step 3: Strip definite article ال / ٱل
  let isDefinite = false;
  if (work.startsWith('ٱل') || work.startsWith('ال')) {
    isDefinite = true;
    work = work.substring(2);
    // Handle assimilated sun letters (the ل merges into next consonant with shadda)
    // e.g. الشَّ → الشّ → after stripping ال → شّ — that's fine
  }

  const plain = rd(work);
  const plainFull = rd(form);

  // ============ VERB DETECTION ============
  // Imperfect verbs: prefix يـ، تـ، نـ، أـ + root body
  // These are the most reliably detectable

  // Check if this is an imperfect verb (prefix conjugation)
  // Guard: nouns starting with أُ (like أُنثَى, أُمَّة), إِ (like إِنَاث), ٱ (like ٱثْنَيْن) are NOT verbs.
  // IMPORTANT: أَ/أُ are excluded here because أَفْعَلَ is much more commonly Form IV perfect
  // than 1sg imperfect. 1sg imperfect is very rare in Quranic derivatives lists.
  const impfPrefixes = ['يَ','يُ','يِ','يٰ','تَ','تُ','تِ','نَ','نُ','نِ'];
  let isImpfVerb = false;
  let impfPerson = '';
  let impfIsPassive = false;

  // Don't check for imperfect if it's a definite noun
  const isNounLike = isDefinite || prepPrefix ||
    form.endsWith('ٌ') || form.endsWith('ٍ') || form.endsWith('ً') || form.endsWith('ًا') ||
    plain.endsWith('ة') || form.endsWith('ةً') || form.endsWith('ةٍ') || form.endsWith('ةٌ') ||
    // Feminine alif maqsura ending (common in nouns like أُنثَى)
    (plain.endsWith('ى') && !plain.endsWith('وى') && plain.length <= 5 && work.startsWith('أ')) ||
    // ات plural ending
    plain.endsWith('ات');

  for (const pfx of impfPrefixes) {
    if (work.startsWith(pfx) && !isNounLike) {
      isImpfVerb = true;
      // Determine person
      const letter = pfx[0];
      impfIsPassive = pfx[1] === 'ُ'; // Damma = passive or Form IV
      // Check if this is Form III/IV/VI active (يُفَاعِلُ / يُفْعِلُ / يُتَفَاعَلُ)
      // These start with يُ but are NOT passive
      // Heuristic: if after يُ there's a fatha'd letter (يُفَعِّلُ), it's Form II causative (active)
      // If يُفَاعِ → Form III active
      // If يُفْعِ → Form IV active
      // For now, mark يُ as "aktiv/passiv" to be safe
      if (impfIsPassive) {
        // Check common Form II/III/IV active patterns
        const afterPrefix = work.substring(2);
        const afterPrefixPlain = rd(afterPrefix);
        // Form IV يُفْعِلُ: after يُ, first root letter has sukun
        // Form II يُفَعِّلُ: after يُ, first root letter has fatha
        // Form III يُفَاعِلُ: after يُ, there's a fatha then alif
        // Since these are all active despite يُ, we should NOT label them passive
        // Actually the key distinction: passive = يُفْعَلُ (fatha on ع), active IV = يُفْعِلُ (kasra on ع)
        // But this is very hard to distinguish reliably. Let's just not say "Passiv" for يُ forms.
        impfIsPassive = false; // Too unreliable to call passive
      }

      if (letter === 'ي') {
        // 3rd person
        if (plain.endsWith('ون') || plain.endsWith('ونه') || plain.endsWith('ونك') ||
            plain.endsWith('ونها') || plain.endsWith('ونكم') || plain.endsWith('ونهم')) {
          impfPerson = '3.m.pl.';
        } else if (plain.endsWith('وا') || plain.endsWith('وه') || plain.endsWith('وها') || plain.endsWith('وهم')) {
          impfPerson = '3.m.pl.';
        } else if (plain.endsWith('ن') && plain.length >= 4 && !plain.endsWith('ون') && !plain.endsWith('ين')) {
          impfPerson = '3.f.pl.';
        } else if (plain.endsWith('ا') && plain.length >= 4) {
          impfPerson = '3.Dual';
        } else {
          impfPerson = '3.m.sg.';
        }
      } else if (letter === 'ت') {
        if (plain.endsWith('ون') || plain.endsWith('ونه') || plain.endsWith('ونها')) {
          impfPerson = '2.m.pl.';
        } else if (plain.endsWith('وا') || plain.endsWith('وه')) {
          impfPerson = '2.m.pl.';
        } else if (plain.endsWith('ن') && !plain.endsWith('ون') && !plain.endsWith('ين') && plain.length >= 4) {
          impfPerson = '3.f.pl./2.f.';
        } else {
          impfPerson = '3.f.sg./2.m.sg.';
        }
      } else if (letter === 'ن') {
        impfPerson = '1.pl.';
      }
      break;
    }
  }

  if (isImpfVerb) {
    return conjPrefix + prepPrefix + verbShort + ' (Imperfekt, ' + impfPerson + ')';
  }

  // ============ PERFECT VERB DETECTION ============
  // Perfect verbs have no prefix (except possible form-IV أ) and characteristic suffixes

  // Skip if it starts with ال (that's a noun)
  if (!isDefinite && !prepPrefix) {
    // Check for perfect verb suffixes
    // Guard: skip if form has tanwin (ً/ٌ/ٍ) — that makes it a noun
    const hasTanwin = form.includes('\u064B') || form.includes('\u064C') || form.includes('\u064D');
    if (plain.endsWith('وا') && plain.length >= 4 && !hasTanwin) {
      return conjPrefix + verbShort + ' (Perfekt, 3.m.pl.)';
    }
    if (plain.endsWith('نا') && plain.length >= 4 && !plain.endsWith('هنا')) {
      return conjPrefix + verbShort + ' (Perfekt, 1.pl.)';
    }
    if (plain.endsWith('ناه') || plain.endsWith('ناها') || plain.endsWith('ناهم') || plain.endsWith('ناكم')) {
      return conjPrefix + verbShort + ' (Perfekt, 1.pl. + Suffix)';
    }
    if (plain.endsWith('تم') || plain.endsWith('تموه') || plain.endsWith('تموها')) {
      return conjPrefix + verbShort + ' (Perfekt, 2.m.pl.)';
    }
    if (plain.endsWith('وه') && plain.length >= 4) {
      return conjPrefix + verbShort + ' (Perfekt, 3.m.pl. + Suffix)';
    }
    if (plain.endsWith('وها') && plain.length >= 5) {
      return conjPrefix + verbShort + ' (Perfekt, 3.m.pl. + Suffix)';
    }
    if (plain.endsWith('وهم') && plain.length >= 5) {
      return conjPrefix + verbShort + ' (Perfekt, 3.m.pl. + Suffix)';
    }

    // 3fs: ends in تْ (ta + sukun)
    // Only detect if it clearly ends in تْ (with sukun), not just ت
    if (work.endsWith('تْ') && plain.length >= 4) {
      return conjPrefix + verbShort + ' (Perfekt, 3.f.sg.)';
    }

    // Check if it looks like a basic perfect 3ms
    // A perfect 3ms has the form فَعَلَ / فَعِلَ / فَعُلَ / أَفْعَلَ / فَعَّلَ / فَاعَلَ etc.
    // Key: ends in fatha (ـَ), 3-5 root consonants, no imperfect prefix
    // Guard against nouns: skip if starts with م (masdar/participle), or has noun-typical length
    if (work.endsWith('َ') && plain.length >= 3 && plain.length <= 6) {
      if (!plain.endsWith('ة') && !work.endsWith('ً') && !work.endsWith('ٌ') && !work.endsWith('ٍ') &&
          !plain.endsWith('ون') && !plain.endsWith('ين') && // Not sound masculine plural
          !plain.endsWith('ات') && // Not sound feminine plural
          !plain.endsWith('ان')) { // Not dual
        // Check that it doesn't start with a typical noun pattern (م prefix)
        // Also skip if it has a long ا in the middle (typical of فِعَال/فَعَال masdar patterns)
        const hasLongA = plain.includes('ا') && plain.indexOf('ا') > 0 && plain.indexOf('ا') < plain.length - 1;
        if (!work.startsWith('مَ') && !work.startsWith('مُ') && !work.startsWith('مِ') &&
            !work.startsWith('جِ') && // Skip جِدَال-like patterns
            !(hasLongA && plain.length >= 4)) { // Skip فِعَال/فَعَال nouns
          return conjPrefix + verbShort + ' (Perfekt, 3.m.sg.)';
        }
      }
    }

    // Perfect with attached pronoun (ending in هم، ه، ها، كم، ك)
    if ((plain.endsWith('هم') || plain.endsWith('ها') || plain.endsWith('ه') || plain.endsWith('كم') || plain.endsWith('ك'))
        && plain.length >= 4 && !plain.endsWith('ات') && !isDefinite) {
      // Could be perfect verb + pronoun or noun + pronoun
      // Check: if it has a fatha before هـ and doesn't start with م, likely a verb
      // Skip — too ambiguous
    }
  }

  // ============ IMPERATIVE DETECTION ============
  // Imperatives start with ٱ (hamzat al-wasl) but so do many nouns (ٱثْنَيْن, ٱسْم, etc.)
  // Only classify as imperative if the form is very short and ends in a verb-like way
  // Skip: ends in ين/ة/ون/ات (noun patterns), or has tanwin
  if (work.startsWith('ٱ') && !isDefinite && plain.length >= 3 && plain.length <= 6 &&
      !plain.endsWith('ين') && !plain.endsWith('ون') && !plain.endsWith('ة') &&
      !plain.endsWith('ات') && !plain.endsWith('ا') && !plain.endsWith('ى') &&
      !form.endsWith('ٌ') && !form.endsWith('ٍ') && !form.endsWith('ً')) {
    return conjPrefix + verbShort + ' (Imperativ)';
  }

  // ============ NOUN CLASSIFICATION ============

  // At this point, it's likely a noun/adjective

  // Tanwin endings → indefinite noun
  if (form.endsWith('ٌ')) {
    if (isDefinite) return conjPrefix + prepPrefix + nomShort + ' (bestimmt, Nominativ)';
    return conjPrefix + prepPrefix + nomShort + ' (indefinit, Nominativ)';
  }
  if (form.endsWith('ٍ') || form.endsWith('ٍۢ')) {
    if (isDefinite) return conjPrefix + prepPrefix + nomShort + ' (bestimmt, Genitiv)';
    return conjPrefix + prepPrefix + nomShort + ' (indefinit, Genitiv)';
  }
  if (form.endsWith('ًا') || form.endsWith('ًۭا') || (form.endsWith('ً') && !form.endsWith('ًا'))) {
    if (isDefinite) return conjPrefix + prepPrefix + nomShort + ' (bestimmt, Akkusativ)';
    return conjPrefix + prepPrefix + nomShort + ' (indefinit, Akkusativ)';
  }

  // Sound masculine plural
  if (plain.endsWith('ون') || plain.endsWith('ين')) {
    const desc = isDefinite ? 'bestimmt' : '';
    return conjPrefix + prepPrefix + nomShort + ' (Plural m.' + (desc ? ', ' + desc : '') + ')';
  }

  // Sound feminine plural ending ات
  if (plain.endsWith('ات') || plain.endsWith('ات')) {
    const desc = isDefinite ? 'bestimmt' : '';
    return conjPrefix + prepPrefix + nomShort + ' (Plural f.' + (desc ? ', ' + desc : '') + ')';
  }

  // Ta marbuta ending → feminine
  if (plain.endsWith('ة') || form.endsWith('ةً') || form.endsWith('ةٍ') || form.endsWith('ةٌ')) {
    const desc = isDefinite ? 'bestimmt' : '';
    return conjPrefix + prepPrefix + nomShort + ' (Substantiv f.' + (desc ? ', ' + desc : '') + ')';
  }

  // Alif maqsura ending → feminine or general
  if (plain.endsWith('ى') || form.endsWith('ىٰ') || form.endsWith('ىٰٕ') || form.endsWith('ىٰ')) {
    const desc = isDefinite ? 'bestimmt' : '';
    return conjPrefix + prepPrefix + nomShort + (desc ? ' (' + desc + ')' : '');
  }

  // Definite noun (catch-all for ال+ forms)
  if (isDefinite) {
    return conjPrefix + prepPrefix + nomShort + ' (bestimmt)';
  }

  // With preposition
  if (prepPrefix) {
    return conjPrefix + prepPrefix + nomShort;
  }

  // With conjunction only
  if (conjPrefix) {
    return conjPrefix + nomShort;
  }

  // Bare form — use nominal meaning
  return nomShort;
}

// ========== MAIN PROCESSING ==========

let filled = 0;
let alreadyHad = 0;
let totalDerivatives = 0;

data.roots.forEach(root => {
  if (!root.keyDerivatives) return;

  root.keyDerivatives.forEach(kd => {
    totalDerivatives++;
    if (kd.meaning) {
      alreadyHad++;
      return;
    }

    kd.meaning = generateMeaning(kd.form, root.meaning);
    filled++;
  });
});

console.log(`Total derivatives: ${totalDerivatives}`);
console.log(`Already had meaning: ${alreadyHad}`);
console.log(`Filled: ${filled}`);
console.log(`Still missing: ${totalDerivatives - alreadyHad - filled}`);

// Verify
let remaining = 0;
data.roots.forEach(root => {
  if (root.keyDerivatives) {
    root.keyDerivatives.forEach(kd => {
      if (!kd.meaning) remaining++;
    });
  }
});
console.log(`Verification - remaining without meaning: ${remaining}`);

// Update meta
data.meta.withDerivativeMeanings = data.meta.totalRoots;
data.meta.derivativeMeaningsFilled = filled;

// Write
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('File written successfully.');
