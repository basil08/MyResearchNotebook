/**
 * Attachments client.
 *
 * Talks to the authenticated proxy at /api/drive for everything except the
 * upload bytes themselves, which go straight to the resumable session URL the
 * proxy hands back. See netlify/functions/drive.js for why.
 */

import { auth } from '@/config/firebase';
import axios from 'axios';
import { Platform } from 'react-native';

export interface Attachment {
  id: string;
  entryId: string | null;
  name: string;
  mimeType: string;
  /** Bytes, or null when Drive did not report a size. */
  size: number | null;
  createdTime: string;
  /** Opens the file in Drive's own viewer. */
  webViewLink: string;
}

/** Largest file we will accept. Drive allows far more; this is a sanity rail. */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Files at or below this can be previewed inline by the proxy. */
export const MAX_PREVIEW_BYTES = 3.5 * 1024 * 1024;

function apiBase(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/drive';
    }
    return `${protocol}//${hostname}/api/drive`;
  }
  // Attachments are web-only for now (ADR-015 covers why native is not
  // developed against this codebase).
  return '';
}

async function authHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error('You need to be signed in to work with attachments.');
  return { Authorization: `Bearer ${await user.getIdToken()}` };
}

/** Turn an axios failure into something worth showing a person. */
function readableError(error: any, fallback: string): Error {
  const message = error?.response?.data?.error ?? error?.message;
  return new Error(message ? String(message) : fallback);
}

export const driveService = {
  /** Every attachment across the whole notebook, in one call. */
  async list(): Promise<Attachment[]> {
    try {
      const response = await axios.get(`${apiBase()}?action=list`, {
        headers: await authHeader(),
      });
      return (response.data?.files ?? []) as Attachment[];
    } catch (error: any) {
      throw readableError(error, 'Could not load attachments.');
    }
  },

  /**
   * Upload a file and return its record.
   *
   * `onProgress` reports 0–1 as the bytes go up. The proxy authorises the
   * upload; the bytes then go directly to Google, so a large file never has to
   * fit through a serverless function.
   */
  async upload(
    entryId: string,
    file: File,
    onProgress?: (fraction: number) => void
  ): Promise<Attachment> {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `${file.name} is larger than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.`
      );
    }

    let uploadUrl: string;
    try {
      const session = await axios.post(
        `${apiBase()}?action=create-session`,
        {
          entryId,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
        },
        { headers: { ...(await authHeader()), 'Content-Type': 'application/json' } }
      );
      uploadUrl = session.data.uploadUrl;
    } catch (error: any) {
      throw readableError(error, `Could not start uploading ${file.name}.`);
    }

    try {
      const response = await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(e.loaded / e.total);
        },
      });

      const created = response.data ?? {};
      return {
        id: created.id,
        entryId,
        name: created.name ?? file.name,
        mimeType: created.mimeType ?? file.type,
        size: created.size ? Number(created.size) : file.size,
        createdTime: created.createdTime ?? new Date().toISOString(),
        webViewLink: created.webViewLink ?? '',
      };
    } catch (error: any) {
      throw readableError(error, `${file.name} did not finish uploading.`);
    }
  },

  async remove(fileId: string): Promise<void> {
    try {
      await axios.post(
        `${apiBase()}?action=delete`,
        { fileId },
        { headers: { ...(await authHeader()), 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      throw readableError(error, 'Could not remove that attachment.');
    }
  },

  /**
   * A URL that renders the file inline.
   *
   * The proxy needs an auth header, which an `<img src>` cannot send, so the
   * bytes are fetched here and handed back as an object URL. Callers must
   * revoke it when the image unmounts.
   */
  async previewUrl(fileId: string): Promise<string> {
    const response = await axios.get(`${apiBase()}?action=media&fileId=${encodeURIComponent(fileId)}`, {
      headers: await authHeader(),
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};

/** Human-readable file size. */
export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Whether the proxy can render this inline. */
export function isPreviewable(attachment: Attachment): boolean {
  return (
    attachment.mimeType?.startsWith('image/') === true &&
    (attachment.size ?? 0) <= MAX_PREVIEW_BYTES
  );
}

/** A Material icon name suited to the file type. */
export function iconForType(mimeType: string): string {
  if (!mimeType) return 'insert-drive-file';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'movie';
  if (mimeType.startsWith('audio/')) return 'audiotrack';
  if (mimeType === 'application/pdf') return 'picture-as-pdf';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'folder-zip';
  if (mimeType.startsWith('text/') || mimeType.includes('json')) return 'description';
  return 'insert-drive-file';
}
