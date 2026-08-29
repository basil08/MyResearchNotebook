/**
 * Attachments store.
 *
 * Drive is the single source of truth — nothing about attachments is written
 * to the sheet. Each file carries its entry id in Drive's `appProperties`, so
 * there is no second copy of the list to fall out of step, no schema change,
 * and deleting a file in Drive really does remove it from the entry.
 *
 * The whole set loads in one call and is grouped by entry in memory, which at
 * a few files per entry is nothing. It loads lazily: a notebook with no
 * attachments never calls Drive at all.
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
import { driveService, type Attachment } from '@/services/drive-service';

export interface UploadTask {
  /** Local id — the file has no Drive id until it lands. */
  key: string;
  entryId: string;
  name: string;
  size: number;
  /** 0–1. */
  progress: number;
  error?: string;
}

interface AttachmentsContextValue {
  /** entry id → its attachments, newest first. */
  byEntry: Map<string, Attachment[]>;
  uploads: UploadTask[];
  loading: boolean;
  error: string | null;
  /** Whether Drive has been contacted yet this session. */
  ready: boolean;
  refresh: () => Promise<void>;
  forEntry: (entryId: string) => Attachment[];
  uploadsFor: (entryId: string) => UploadTask[];
  upload: (entryId: string, files: File[]) => Promise<void>;
  remove: (attachment: Attachment) => Promise<void>;
}

const AttachmentsContext = createContext<AttachmentsContextValue | undefined>(undefined);

const EMPTY: Attachment[] = [];

export function AttachmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<Attachment[]>([]);
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await driveService.list());
      setError(null);
    } catch (e: any) {
      // Drive being unconfigured must not break the rest of the app, so this
      // is surfaced where attachments are shown and nowhere else.
      setError(e?.message ?? 'Could not load attachments.');
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      setFiles([]);
      setUploads([]);
      setReady(false);
      return;
    }
    if (loadedFor.current === user.uid) return;
    loadedFor.current = user.uid;
    void load();
  }, [user, load]);

  const byEntry = useMemo(() => {
    const map = new Map<string, Attachment[]>();
    for (const file of files) {
      if (!file.entryId) continue;
      const list = map.get(file.entryId);
      if (list) list.push(file);
      else map.set(file.entryId, [file]);
    }
    return map;
  }, [files]);

  const forEntry = useCallback((entryId: string) => byEntry.get(entryId) ?? EMPTY, [byEntry]);

  const uploadsFor = useCallback(
    (entryId: string) => uploads.filter((u) => u.entryId === entryId),
    [uploads]
  );

  const upload = useCallback(async (entryId: string, incoming: File[]) => {
    const tasks: UploadTask[] = incoming.map((file, i) => ({
      key: `${Date.now()}-${i}-${file.name}`,
      entryId,
      name: file.name,
      size: file.size,
      progress: 0,
    }));
    setUploads((prev) => [...prev, ...tasks]);

    const patch = (key: string, changes: Partial<UploadTask>) =>
      setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...changes } : u)));

    // Sequential, not parallel: several large files at once would compete for
    // the same connection and make every progress bar crawl.
    for (let i = 0; i < incoming.length; i++) {
      const task = tasks[i];
      try {
        const created = await driveService.upload(entryId, incoming[i], (fraction) =>
          patch(task.key, { progress: fraction })
        );
        setFiles((prev) => [created, ...prev]);
        setUploads((prev) => prev.filter((u) => u.key !== task.key));
      } catch (e: any) {
        // Failed uploads stay on screen with their reason rather than
        // vanishing; the user dismisses them.
        patch(task.key, { error: e?.message ?? 'Upload failed', progress: 0 });
      }
    }
  }, []);

  const remove = useCallback(async (attachment: Attachment) => {
    // Optimistic: put it back if Drive refuses.
    setFiles((prev) => prev.filter((f) => f.id !== attachment.id));
    try {
      await driveService.remove(attachment.id);
    } catch (e) {
      setFiles((prev) => [attachment, ...prev]);
      throw e;
    }
  }, []);

  const value = useMemo(
    () => ({
      byEntry,
      uploads,
      loading,
      error,
      ready,
      refresh: load,
      forEntry,
      uploadsFor,
      upload,
      remove,
    }),
    [byEntry, uploads, loading, error, ready, load, forEntry, uploadsFor, upload, remove]
  );

  return <AttachmentsContext.Provider value={value}>{children}</AttachmentsContext.Provider>;
}

export function useAttachments(): AttachmentsContextValue {
  const ctx = useContext(AttachmentsContext);
  if (!ctx) throw new Error('useAttachments must be used inside <AttachmentsProvider>');
  return ctx;
}

/** Clear a failed upload from the list. */
export function dismissUpload(uploads: UploadTask[], key: string): UploadTask[] {
  return uploads.filter((u) => u.key !== key);
}
