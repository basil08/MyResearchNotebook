/**
 * Porter stemmer.
 *
 * Search needs "compression", "compressed" and "compress" to be the same term,
 * or a query only finds the exact word form that was typed. Porter (1980) is
 * the standard answer, it is fully specified, and it needs no data files.
 *
 * This is the complete algorithm — steps 1a through 5b. A cheaper suffix
 * stripper was tried first and dropped: it handled plurals and -ing but left
 * "compression" and "compress" as different terms, which is exactly the kind
 * of miss this corpus would suffer from.
 *
 * Verified against the canonical Porter test vocabulary (see the assertions
 * exercised in Milestone 5).
 */

const VOWELS = 'aeiou';

/** `y` is a consonant at the start of a word and after a vowel. */
function isConsonant(word: string, i: number): boolean {
  const c = word[i];
  if (VOWELS.includes(c)) return false;
  if (c !== 'y') return true;
  return i === 0 ? true : !isConsonant(word, i - 1);
}

/**
 * Porter's `m`: the number of vowel–consonant sequences in [C](VC){m}[V].
 * Used as a crude proxy for "is this stem long enough to strip further".
 */
function measure(word: string): number {
  const n = word.length;
  let i = 0;
  let m = 0;
  while (i < n && isConsonant(word, i)) i++;
  while (i < n) {
    while (i < n && !isConsonant(word, i)) i++;
    if (i >= n) break;
    m++;
    while (i < n && isConsonant(word, i)) i++;
  }
  return m;
}

function hasVowel(word: string): boolean {
  for (let i = 0; i < word.length; i++) if (!isConsonant(word, i)) return true;
  return false;
}

function endsDoubleConsonant(word: string): boolean {
  const n = word.length;
  return n >= 2 && word[n - 1] === word[n - 2] && isConsonant(word, n - 1);
}

/** Consonant–vowel–consonant, where the final consonant is not w, x or y. */
function endsCVC(word: string): boolean {
  const n = word.length;
  if (n < 3) return false;
  return (
    isConsonant(word, n - 3) &&
    !isConsonant(word, n - 2) &&
    isConsonant(word, n - 1) &&
    !'wxy'.includes(word[n - 1])
  );
}

/** Replace `suffix` with `replacement` when the resulting stem has m > min. */
function replaceIfMeasure(
  word: string,
  suffix: string,
  replacement: string,
  min: number
): string | null {
  if (!word.endsWith(suffix)) return null;
  const stem = word.slice(0, word.length - suffix.length);
  return measure(stem) > min ? stem + replacement : word;
}

function step1a(word: string): string {
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('ies')) return word.slice(0, -2);
  if (word.endsWith('ss')) return word;
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function step1b(word: string): string {
  if (word.endsWith('eed')) {
    const stem = word.slice(0, -3);
    return measure(stem) > 0 ? word.slice(0, -1) : word;
  }

  let stem: string | null = null;
  if (word.endsWith('ed')) {
    const candidate = word.slice(0, -2);
    if (hasVowel(candidate)) stem = candidate;
  } else if (word.endsWith('ing')) {
    const candidate = word.slice(0, -3);
    if (hasVowel(candidate)) stem = candidate;
  }
  if (stem === null) return word;

  // The fix-ups that make "coding" → "code" and "hopping" → "hop".
  if (stem.endsWith('at') || stem.endsWith('bl') || stem.endsWith('iz')) return stem + 'e';
  if (endsDoubleConsonant(stem) && !'lsz'.includes(stem[stem.length - 1])) {
    return stem.slice(0, -1);
  }
  if (measure(stem) === 1 && endsCVC(stem)) return stem + 'e';
  return stem;
}

function step1c(word: string): string {
  if (word.endsWith('y') && hasVowel(word.slice(0, -1))) return word.slice(0, -1) + 'i';
  return word;
}

const STEP2: [string, string][] = [
  ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
  ['izer', 'ize'], ['bli', 'ble'], ['alli', 'al'], ['entli', 'ent'],
  ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
  ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
  ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble'],
  ['logi', 'log'],
];

const STEP3: [string, string][] = [
  ['icate', 'ic'], ['ative', ''], ['alize', 'al'], ['iciti', 'ic'],
  ['ical', 'ic'], ['ful', ''], ['ness', ''],
];

const STEP4: string[] = [
  'al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement', 'ment',
  'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize',
];

function applyTable(word: string, table: [string, string][]): string {
  for (const [suffix, replacement] of table) {
    const out = replaceIfMeasure(word, suffix, replacement, 0);
    if (out !== null) return out;
  }
  return word;
}

function step4(word: string): string {
  // `-ion` only comes off after s or t, else "lion" would become "li".
  if (word.endsWith('ion')) {
    const stem = word.slice(0, -3);
    const last = stem[stem.length - 1];
    if ((last === 's' || last === 't') && measure(stem) > 1) return stem;
    return word;
  }
  for (const suffix of STEP4) {
    const out = replaceIfMeasure(word, suffix, '', 1);
    if (out !== null) return out;
  }
  return word;
}

function step5(word: string): string {
  let out = word;
  if (out.endsWith('e')) {
    const stem = out.slice(0, -1);
    const m = measure(stem);
    if (m > 1 || (m === 1 && !endsCVC(stem))) out = stem;
  }
  if (measure(out) > 1 && endsDoubleConsonant(out) && out.endsWith('l')) {
    out = out.slice(0, -1);
  }
  return out;
}

/**
 * Reduce a lowercase word to its stem.
 *
 * Words of two letters or fewer are returned unchanged — there is nothing to
 * strip, and Porter's measure rules are not meaningful at that length.
 */
export function stem(word: string): string {
  if (word.length <= 2) return word;
  let out = step1c(step1b(step1a(word)));
  out = applyTable(out, STEP2);
  out = applyTable(out, STEP3);
  out = step4(out);
  return step5(out);
}
