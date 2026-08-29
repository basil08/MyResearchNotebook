/**
 * Full-text search across the corpus — TF-IDF, built and run on the client.
 *
 * ## Why in-memory
 *
 * The corpus is one entry per day. At 70 entries today and 365 a year, a
 * decade of writing is under 4,000 documents and a few megabytes of text.
 * Building the whole inverted index takes a few tens of milliseconds and a
 * query is sub-millisecond, so there is nothing to gain from a precomputed
 * index, a server round trip, or a dependency — and plenty to lose: an index
 * that can fall out of step with the sheet.
 *
 * The index is rebuilt whenever the corpus array changes identity, which is
 * exactly when an entry is created, edited or deleted, so search is never
 * stale.
 *
 * ## Ranking
 *
 * Textbook `lnc.ltc` cosine TF-IDF:
 *
 *   - term frequency is sublinear, `1 + log(tf)` — the fifth mention of a word
 *     says much less than the second
 *   - inverse document frequency is BM25's smoothed form,
 *     `log(1 + (N - df + 0.5) / (df + 0.5))` — a word in every entry carries
 *     almost no signal, while staying strictly positive
 *   - both document and query vectors are L2-normalised, so a long entry does
 *     not outrank a short one merely by containing more words
 *
 * All eight fields are weighted equally. Boosting, say, `learned_today` over
 * `plan_to_read` would be a guess about what matters, and the entry that
 * actually answers the query is not reliably in one field.
 */

import { logFields, type LogField } from '@/constants/design';
import type { ResearchLog } from '@/types/research-log';
import { stem } from '@/utils/stem';

/**
 * Words carrying no retrieval signal. Kept deliberately short: an aggressive
 * list starts eating real query terms, and idf already suppresses common words
 * on its own.
 */
const STOPWORDS = new Set([
  'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any',
  'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between',
  'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'done', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'just', 'me', 'more', 'most', 'my', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'you', 'your',
]);

export interface Token {
  /** Lowercased surface form. */
  raw: string;
  start: number;
  end: number;
}

/**
 * Split text into word tokens, keeping offsets so snippets can be highlighted
 * against the original string.
 *
 * Letters, digits and apostrophes hold a token together; everything else
 * breaks it. `tf-idf` therefore indexes as `tf` and `idf`, which is what makes
 * a search for either one find it.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const n = text.length;
  let i = 0;

  while (i < n) {
    const c = text[i];
    if (isWordChar(c)) {
      const start = i;
      while (i < n && isWordChar(text[i])) i++;
      tokens.push({ raw: text.slice(start, i).toLowerCase(), start, end: i });
    } else {
      i++;
    }
  }
  return tokens;
}

function isWordChar(c: string): boolean {
  return /[\p{L}\p{N}'’]/u.test(c);
}

/** Index form of a token, or null when it carries no signal. */
export function normalise(raw: string): string | null {
  const word = raw.replace(/['’]/g, '');
  if (word.length < 2) return null;
  if (STOPWORDS.has(word)) return null;
  // Bare numbers are almost never what someone is looking for; years are.
  if (/^\d+$/.test(word) && word.length !== 4) return null;
  const stemmed = stem(word);
  return stemmed.length >= 2 ? stemmed : null;
}

interface Posting {
  doc: number;
  /** Normalised TF-IDF weight of this term in this document. */
  weight: number;
}

export interface SearchIndex {
  logs: ResearchLog[];
  /** term → documents containing it, with weights. */
  postings: Map<string, Posting[]>;
  /** term → inverse document frequency. */
  idf: Map<string, number>;
  /** Sorted vocabulary, for prefix expansion. */
  vocabulary: string[];
  size: number;
}

export const EMPTY_INDEX: SearchIndex = {
  logs: [],
  postings: new Map(),
  idf: new Map(),
  vocabulary: [],
  size: 0,
};

/** The searchable text of one entry, field by field. */
function fieldsOf(log: ResearchLog): [LogField, string][] {
  const out: [LogField, string][] = [];
  for (const field of logFields) {
    const value = String(log[field] ?? '').trim();
    if (value) out.push([field, value]);
  }
  return out;
}

export function buildIndex(logs: ResearchLog[]): SearchIndex {
  const documentFrequency = new Map<string, number>();
  const perDoc: Map<string, number>[] = [];

  // Pass 1 — term frequencies per document, and document frequency overall.
  for (const log of logs) {
    const counts = new Map<string, number>();
    for (const [, text] of fieldsOf(log)) {
      for (const token of tokenize(text)) {
        const term = normalise(token.raw);
        if (!term) continue;
        counts.set(term, (counts.get(term) ?? 0) + 1);
      }
    }
    perDoc.push(counts);
    for (const term of counts.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const total = logs.length;
  const idf = new Map<string, number>();
  for (const [term, df] of documentFrequency) {
    /*
     * BM25's smoothed idf rather than the plain `log(N/df)`.
     *
     * `log(1 + N/df)` was tried first and discriminates far too weakly: a term
     * in *every* entry still scored log(2) ≈ 0.69, so a query mixing a common
     * word with a rare one let the common word drag unrelated entries up the
     * ranking. This form decays much faster — at df = N it is near zero — but
     * never reaches zero or goes negative, so a query for a word that happens
     * to appear everywhere still returns results in a sensible order rather
     * than returning nothing at all.
     */
    idf.set(term, Math.log(1 + (total - df + 0.5) / (df + 0.5)));
  }

  // Pass 2 — weight, normalise per document, and post.
  const postings = new Map<string, Posting[]>();
  for (let doc = 0; doc < perDoc.length; doc++) {
    const counts = perDoc[doc];
    let norm = 0;
    const weights = new Map<string, number>();

    for (const [term, tf] of counts) {
      const weight = (1 + Math.log(tf)) * (idf.get(term) ?? 0);
      weights.set(term, weight);
      norm += weight * weight;
    }
    norm = Math.sqrt(norm) || 1;

    for (const [term, weight] of weights) {
      let list = postings.get(term);
      if (!list) postings.set(term, (list = []));
      list.push({ doc, weight: weight / norm });
    }
  }

  return {
    logs,
    postings,
    idf,
    vocabulary: [...postings.keys()].sort(),
    size: total,
  };
}

/**
 * Index cache, keyed on the corpus array itself.
 *
 * `AppShell` mounts search on every screen, so a plain `useMemo` would rebuild
 * the index on each navigation — the memo dies with the component. Keying a
 * WeakMap on the array means the index is built once per corpus, survives route
 * changes, and is collected as soon as `LogsProvider` replaces the array on a
 * create, edit or delete.
 */
const indexCache = new WeakMap<ResearchLog[], SearchIndex>();

export function getIndex(logs: ResearchLog[]): SearchIndex {
  let index = indexCache.get(logs);
  if (!index) {
    index = buildIndex(logs);
    indexCache.set(logs, index);
  }
  return index;
}

export interface ParsedQuery {
  /** Stemmed terms that must be scored. */
  terms: string[];
  /** Quoted phrases, lowercased and whitespace-collapsed. */
  phrases: string[];
  /** Trailing partial word, matched as a prefix while the user is still typing. */
  prefix: string | null;
  /** Raw lowercased words, for highlighting. */
  surface: string[];
}

/**
 * Parse a query.
 *
 * `"exact phrase"` in double quotes is required verbatim. A trailing word that
 * the user is still typing is treated as a prefix, so results appear before the
 * word is finished — but only if the query does not end in whitespace, which is
 * the signal that the word is complete.
 */
export function parseQuery(input: string): ParsedQuery {
  const phrases: string[] = [];
  const rest = input.replace(/"([^"]+)"/g, (_, phrase: string) => {
    const cleaned = phrase.toLowerCase().replace(/\s+/g, ' ').trim();
    if (cleaned) phrases.push(cleaned);
    return ' ';
  });

  const endsOpen = /[\p{L}\p{N}]$/u.test(input);
  const words = tokenize(rest).map((t) => t.raw);

  const terms: string[] = [];
  const surface: string[] = [];
  for (const word of words) {
    surface.push(word);
    const term = normalise(word);
    if (term) terms.push(term);
  }

  // Phrase words also count as terms, so a phrase query still ranks.
  for (const phrase of phrases) {
    for (const token of tokenize(phrase)) {
      surface.push(token.raw);
      const term = normalise(token.raw);
      if (term) terms.push(term);
    }
  }

  let prefix: string | null = null;
  if (endsOpen && words.length > 0) {
    const last = words[words.length - 1];
    if (last.length >= 2) prefix = last;
  }

  return { terms, phrases, prefix, surface };
}

/** Vocabulary entries starting with `prefix`, capped to keep scoring bounded. */
function expandPrefix(index: SearchIndex, prefix: string, limit = 16): string[] {
  const { vocabulary } = index;
  // Prefixes are matched against stems, so stem the fragment too.
  const needle = stem(prefix);
  let lo = 0;
  let hi = vocabulary.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (vocabulary[mid] < needle) lo = mid + 1;
    else hi = mid;
  }
  const out: string[] = [];
  for (let i = lo; i < vocabulary.length && out.length < limit; i++) {
    if (!vocabulary[i].startsWith(needle)) break;
    out.push(vocabulary[i]);
  }
  return out;
}

export interface Segment {
  text: string;
  hit: boolean;
}

export interface FieldMatch {
  field: LogField;
  segments: Segment[];
}

export interface SearchResult {
  log: ResearchLog;
  score: number;
  /** Where the query matched, ready to render with the hits highlighted. */
  matches: FieldMatch[];
}

const SNIPPET_CHARS = 190;

/**
 * Rank the corpus against a query.
 *
 * Terms are OR-ed and summed, so a document matching more of the query scores
 * higher without any term being mandatory — for a notebook, recall matters more
 * than strict conjunction. Phrases are the exception: they are a filter, since
 * asking for one is an explicit request for exactly that.
 */
export function search(index: SearchIndex, input: string, limit = 30): SearchResult[] {
  const query = parseQuery(input);
  if (query.terms.length === 0 && !query.prefix) return [];

  // Query-side weights, mirroring the document side.
  const queryCounts = new Map<string, number>();
  for (const term of query.terms) {
    queryCounts.set(term, (queryCounts.get(term) ?? 0) + 1);
  }
  if (query.prefix) {
    for (const term of expandPrefix(index, query.prefix)) {
      if (!queryCounts.has(term)) queryCounts.set(term, 1);
    }
  }

  const queryWeights = new Map<string, number>();
  let queryNorm = 0;
  for (const [term, count] of queryCounts) {
    const idf = index.idf.get(term);
    if (idf === undefined) continue;
    const weight = (1 + Math.log(count)) * idf;
    queryWeights.set(term, weight);
    queryNorm += weight * weight;
  }
  queryNorm = Math.sqrt(queryNorm) || 1;

  const scores = new Map<number, number>();
  for (const [term, weight] of queryWeights) {
    const postings = index.postings.get(term);
    if (!postings) continue;
    const normalised = weight / queryNorm;
    for (const posting of postings) {
      scores.set(posting.doc, (scores.get(posting.doc) ?? 0) + normalised * posting.weight);
    }
  }
  if (scores.size === 0) return [];

  const hits = [...scores.entries()]
    .map(([doc, score]) => ({ doc, score }))
    .sort((a, b) => b.score - a.score);

  // Highlight against the stems actually searched, plus the raw prefix.
  const hitStems = new Set(queryWeights.keys());

  const results: SearchResult[] = [];
  for (const hit of hits) {
    if (results.length >= limit) break;
    const log = index.logs[hit.doc];

    if (query.phrases.length > 0 && !containsAllPhrases(log, query.phrases)) continue;

    results.push({
      log,
      score: hit.score,
      matches: buildMatches(log, hitStems, query),
    });
  }
  return results;
}

/** Every phrase must appear verbatim in some field. */
function containsAllPhrases(log: ResearchLog, phrases: string[]): boolean {
  const haystack = fieldsOf(log)
    .map(([, text]) => text.toLowerCase().replace(/\s+/g, ' '))
    .join('   ');
  return phrases.every((phrase) => haystack.includes(phrase));
}

function isHit(raw: string, stems: Set<string>, query: ParsedQuery): boolean {
  const term = normalise(raw);
  if (term && stems.has(term)) return true;
  if (query.prefix && raw.startsWith(query.prefix)) return true;
  return false;
}

/**
 * Build one highlighted snippet per matching field, densest match first.
 *
 * Fields are often long paragraphs, so the snippet is a window around the
 * tightest cluster of hits rather than the head of the field — the point is to
 * show *why* the entry matched.
 */
function buildMatches(
  log: ResearchLog,
  stems: Set<string>,
  query: ParsedQuery
): FieldMatch[] {
  const matches: { match: FieldMatch; hits: number }[] = [];

  for (const [field, text] of fieldsOf(log)) {
    const flat = text.replace(/\s+/g, ' ').trim();
    const tokens = tokenize(flat);
    const hitTokens = tokens.filter((t) => isHit(t.raw, stems, query));
    if (hitTokens.length === 0) continue;

    const centre = densestCluster(hitTokens);
    let from = Math.max(0, centre - Math.floor(SNIPPET_CHARS / 2));
    let to = Math.min(flat.length, from + SNIPPET_CHARS);
    from = Math.max(0, Math.min(from, to - SNIPPET_CHARS));

    // Do not cut words in half.
    if (from > 0) {
      const space = flat.indexOf(' ', from);
      if (space !== -1 && space < from + 24) from = space + 1;
    }
    if (to < flat.length) {
      const space = flat.lastIndexOf(' ', to);
      if (space > from) to = space;
    }

    const segments: Segment[] = [];
    let cursor = from;
    for (const token of hitTokens) {
      if (token.start < from || token.end > to) continue;
      if (token.start > cursor) {
        segments.push({ text: flat.slice(cursor, token.start), hit: false });
      }
      segments.push({ text: flat.slice(token.start, token.end), hit: true });
      cursor = token.end;
    }
    if (cursor < to) segments.push({ text: flat.slice(cursor, to), hit: false });

    if (from > 0 && segments.length > 0) segments[0] = prepend('…', segments[0]);
    if (to < flat.length) segments.push({ text: '…', hit: false });

    matches.push({ match: { field, segments }, hits: hitTokens.length });
  }

  return matches.sort((a, b) => b.hits - a.hits).map((m) => m.match);
}

function prepend(prefix: string, segment: Segment): Segment {
  return segment.hit
    ? segment // never glue an ellipsis onto a highlighted word
    : { text: prefix + segment.text, hit: false };
}

/** Character offset of the tightest cluster of hits, for snippet centring. */
function densestCluster(hits: Token[]): number {
  if (hits.length === 1) return hits[0].start;
  let best = hits[0].start;
  let bestCount = 0;
  for (const anchor of hits) {
    let count = 0;
    for (const other of hits) {
      if (Math.abs(other.start - anchor.start) <= SNIPPET_CHARS / 2) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = anchor.start;
    }
  }
  return best;
}
