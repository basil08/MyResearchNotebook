/**
 * Logs store — one source of truth for the corpus.
 *
 * Previously the home screen owned `logs` in local state and every view was a
 * `viewMode` branch inside it. That is why the entry page had to be a screen
 * inside the list screen. With real routes, the entry page needs the same data
 * without refetching, so the corpus lives here.
 *
 * Mutations update the cache optimistically-ish: the server call happens
 * first, the cache is patched on success. Search (Milestone 5) will index off
 * this same array.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import { researchLogService } from '@/services/research-log-service';
import type { CreateResearchLogInput, ResearchLog } from '@/types/research-log';
import { byDateDesc } from '@/utils/entry';

interface LogsContextValue {
  logs: ResearchLog[];
  /** First load, blocking. */
  loading: boolean;
  /** Pull-to-refresh / manual resync. */
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => ResearchLog | undefined;
  create: (input: CreateResearchLogInput) => Promise<ResearchLog>;
  update: (id: string, patch: Partial<CreateResearchLogInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    mode === 'initial' ? setLoading(true) : setRefreshing(true);
    try {
      const data = await researchLogService.getAll();
      setLogs([...data].sort(byDateDesc));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Could not reach your notebook.');
    } finally {
      mode === 'initial' ? setLoading(false) : setRefreshing(false);
    }
  }, []);

  // Load once per signed-in user; clear on sign-out.
  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      setLogs([]);
      setLoading(false);
      return;
    }
    if (loadedFor.current === user.uid) return;
    loadedFor.current = user.uid;
    void load('initial');
  }, [user, load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const getById = useCallback((id: string) => logs.find((l) => l.id === id), [logs]);

  const create = useCallback(async (input: CreateResearchLogInput) => {
    const created = await researchLogService.create(input);
    setLogs((prev) => [...prev, created].sort(byDateDesc));
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<CreateResearchLogInput>) => {
    await researchLogService.update({ id, ...patch });
    setLogs((prev) =>
      prev
        .map((l) =>
          l.id === id ? { ...l, ...patch, updated_at: new Date().toISOString() } : l
        )
        .sort(byDateDesc)
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    await researchLogService.delete(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const value = useMemo(
    () => ({ logs, loading, refreshing, error, refresh, getById, create, update, remove }),
    [logs, loading, refreshing, error, refresh, getById, create, update, remove]
  );

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs(): LogsContextValue {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('useLogs must be used inside <LogsProvider>');
  return ctx;
}
