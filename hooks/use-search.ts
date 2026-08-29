/**
 * Search state over the corpus.
 *
 * The index is cached against the corpus array itself (see `getIndex`), so it
 * is built once per load and again only when an entry is created, edited or
 * deleted — not on every navigation. The query is passed
 * through `useDeferredValue` so ranking never blocks a keystroke — at this
 * corpus size it would not anyway, but it keeps typing smooth if the corpus
 * grows well past the decade this was sized for.
 */

import { useDeferredValue, useMemo, useState } from 'react';

import { useLogs } from '@/contexts/logs-context';
import { getIndex, search, type SearchIndex, type SearchResult } from '@/utils/search';

export interface Search {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  /** True once the query is worth running. */
  active: boolean;
  /** The query the visible results were produced from. */
  settled: string;
  index: SearchIndex;
}

export function useSearch(limit = 40): Search {
  const { logs } = useLogs();
  const [query, setQuery] = useState('');

  const index = useMemo(() => getIndex(logs), [logs]);
  const deferred = useDeferredValue(query);

  const results = useMemo(
    () => (deferred.trim().length >= 2 ? search(index, deferred, limit) : []),
    [index, deferred, limit]
  );

  return {
    query,
    setQuery,
    results,
    active: query.trim().length >= 2,
    settled: deferred,
    index,
  };
}
