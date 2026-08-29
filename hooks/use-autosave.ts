/**
 * useAutosave — debounced, coalescing, single-flight saving.
 *
 * The write UI has no Save button, so this is what stands in for one. Three
 * properties matter, and all three exist because the backend is a Google
 * Apps Script talking to a Sheet: a round trip is slow (roughly 1–2s) and
 * Apps Script serialises calls per deployment.
 *
 *   coalescing   — edits to several fields inside one debounce window become
 *                  a single patch, so typing across four fields is one write
 *                  rather than four.
 *   single-flight — never two writes in the air at once. A patch that arrives
 *                  mid-flight waits and goes out immediately after.
 *   flushable    — navigating away or closing the tab forces the pending
 *                  patch out rather than dropping it.
 *
 * The caller's `save` decides what a patch means — creating the row on the
 * first write and updating it thereafter (see app/entry/new.tsx).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface Autosave<P> {
  state: SaveState;
  /** When the last successful save landed. */
  savedAt: Date | null;
  error: string | null;
  /** Merge a patch in and start (or restart) the debounce. */
  queue: (patch: P) => void;
  /** Write any pending patch immediately. Safe to call when there is none. */
  flush: () => Promise<void>;
  /** True when there are unwritten edits. */
  dirty: boolean;
}

export function useAutosave<P extends object>(
  save: (patch: P) => Promise<void>,
  { delay = 1200 }: { delay?: number } = {}
): Autosave<P> {
  const [state, setState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef<P | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  // Kept in a ref so `flush` never goes stale inside effect cleanups.
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    const patch = pending.current;
    if (!patch) return;

    pending.current = null;
    inFlight.current = true;
    if (mounted.current) setState('saving');

    try {
      await saveRef.current(patch);
      if (mounted.current) {
        setSavedAt(new Date());
        setError(null);
        setState(pending.current ? 'pending' : 'saved');
      }
    } catch (e: any) {
      // Put the patch back so the edit is not lost, and let a retry pick it up.
      pending.current = { ...(patch as object), ...(pending.current ?? {}) } as P;
      if (mounted.current) {
        setError(e?.message ?? 'Could not save.');
        setState('error');
      }
    } finally {
      inFlight.current = false;
      // Something arrived while we were writing — go again.
      if (pending.current && mounted.current) void run();
    }
  }, []);

  const queue = useCallback(
    (patch: P) => {
      pending.current = { ...(pending.current ?? {}), ...patch } as P;
      setState('pending');
      setError(null);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void run(), delay);
    },
    [delay, run]
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    await run();
  }, [run]);

  // Leaving the page must not silently discard the last few keystrokes.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!pending.current && !inFlight.current) return;
      void flush();
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [flush]);

  // Unmount (route change) flushes too.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current) void run();
    };
  }, [run]);

  return { state, savedAt, error, queue, flush, dirty: pending.current !== null };
}
