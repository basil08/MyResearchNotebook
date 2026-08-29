/**
 * Netlify Function — attachments, backed by Google Drive.
 *
 * Every request is authenticated with a Firebase ID token before anything
 * touches Drive. The Drive credentials live only here; the browser never sees
 * them.
 *
 * Actions (all under /api/drive):
 *
 *   GET  ?action=list                 every attachment, grouped by entry
 *   POST ?action=create-session       open a resumable upload, return its URL
 *   POST ?action=delete               trash one attachment
 *   GET  ?action=media&fileId=…       stream one file back, for previews
 *
 * ## Why uploads do not go through this function
 *
 * Netlify caps a function request body at 6MB, which after base64 leaves about
 * 4.5MB of actual file — useless for a paper. So `create-session` asks Drive to
 * open a *resumable upload session* and hands the browser that session URL. It
 * is single-use, expires, and can write exactly one file into one folder, so
 * the browser gets no standing credential and every authorisation decision is
 * still made here.
 */

import admin from 'firebase-admin';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

/** Files above this are not inlined for preview — see `media`. */
const MAX_INLINE_BYTES = 3.5 * 1024 * 1024;

/** Marks a file as ours, so we never touch anything else in the Drive. */
const APP_TAG = 'friday';

let firebaseAdminInitialized = false;
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    firebaseAdminInitialized = true;
  } else if (admin.apps.length) {
    firebaseAdminInitialized = true;
  } else {
    console.warn('[DRIVE] FIREBASE_PROJECT_ID not set — token verification disabled');
  }
} catch (error) {
  console.error('[DRIVE] Failed to initialize Firebase Admin:', error.message);
}

async function verifyAuthToken(token) {
  if (!firebaseAdminInitialized) {
    if (!token || token.length < 10) throw new Error('Invalid token format');
    return { email: 'unknown' };
  }
  return admin.auth().verifyIdToken(token);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/*
 * Access tokens last an hour. Netlify reuses a warm container across requests,
 * so caching one here saves a round trip to Google on most calls. A cold start
 * simply fetches a new one.
 */
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    // invalid_grant almost always means the consent screen is still in Testing
    // and Google expired the refresh token after seven days.
    const reason = data.error_description || data.error || 'unknown error';
    throw new Error(
      data.error === 'invalid_grant'
        ? `Drive authorisation has expired (${reason}). Re-run scripts/get-drive-token.mjs, and check the OAuth consent screen is published.`
        : `Could not refresh Drive access: ${reason}`
    );
  }

  cachedToken = data.access_token;
  // Retire it a minute early so a token never expires mid-request.
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function driveFetch(url, options = {}) {
  const token = await getAccessToken();
  return fetch(url, {
    ...options,
    headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

/** Every attachment in the folder, newest first. */
async function listAttachments() {
  const files = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields:
        'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink, appProperties)',
      pageSize: '1000',
      orderBy: 'createdTime desc',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message ?? 'Could not list attachments');
    }

    for (const file of data.files ?? []) {
      // Ignore anything that wandered into the folder by hand.
      if (file.appProperties?.app !== APP_TAG) continue;
      files.push({
        id: file.id,
        entryId: file.appProperties.entryId ?? null,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? Number(file.size) : null,
        createdTime: file.createdTime,
        webViewLink: file.webViewLink,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

/**
 * Ask Drive to open a resumable upload and return the session URL.
 *
 * The parent folder and the ownership tag are fixed here, not supplied by the
 * caller, so an upload cannot be aimed anywhere else.
 */
async function createUploadSession({ entryId, name, mimeType, size }) {
  const metadata = {
    name,
    parents: [FOLDER_ID],
    appProperties: { app: APP_TAG, entryId: String(entryId) },
  };

  const response = await driveFetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,createdTime,webViewLink',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        ...(size ? { 'X-Upload-Content-Length': String(size) } : {}),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Drive refused the upload: ${text.slice(0, 300)}`);
  }

  const uploadUrl = response.headers.get('location');
  if (!uploadUrl) throw new Error('Drive did not return an upload session URL');
  return uploadUrl;
}

/** Confirm a file is one of ours before doing anything destructive to it. */
async function assertOurs(fileId) {
  const params = new URLSearchParams({ fields: 'id, parents, appProperties, mimeType, size, name' });
  const response = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params}`
  );
  const file = await response.json();

  if (!response.ok) {
    throw new Error(file.error?.message ?? 'That attachment could not be found');
  }
  if (file.appProperties?.app !== APP_TAG || !(file.parents ?? []).includes(FOLDER_ID)) {
    throw new Error('That file does not belong to Friday');
  }
  return file;
}

async function deleteAttachment(fileId) {
  await assertOurs(fileId);
  // Trashed, not purged: a mis-click stays recoverable from the Drive bin.
  const response = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    }
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message ?? 'Could not remove the attachment');
  }
}

/**
 * Return a file's bytes, for previewing an image inline.
 *
 * Capped well under Netlify's 6MB response limit — anything larger is opened
 * in Drive instead.
 */
async function readMedia(fileId) {
  const file = await assertOurs(fileId);
  const size = file.size ? Number(file.size) : 0;
  if (size > MAX_INLINE_BYTES) {
    const error = new Error('That file is too large to preview here');
    error.statusCode = 413;
    throw error;
  }

  const response = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`
  );
  if (!response.ok) throw new Error('Could not read that attachment');

  const buffer = Buffer.from(await response.arrayBuffer());
  return { body: buffer.toString('base64'), mimeType: file.mimeType };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (!FOLDER_ID || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return json(500, {
      error: 'Drive is not configured',
      message:
        'Set GOOGLE_DRIVE_FOLDER_ID, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET and ' +
        'GOOGLE_OAUTH_REFRESH_TOKEN in the site environment. See docs/DRIVE_SETUP.md.',
    });
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return json(401, { error: 'Unauthorized — missing authorization token' });
  }
  try {
    await verifyAuthToken(authHeader.slice('Bearer '.length));
  } catch (error) {
    return json(401, { error: `Unauthorized — ${error.message}` });
  }

  const action = event.queryStringParameters?.action;

  try {
    if (event.httpMethod === 'GET' && action === 'list') {
      return json(200, { files: await listAttachments() });
    }

    if (event.httpMethod === 'GET' && action === 'media') {
      const fileId = event.queryStringParameters?.fileId;
      if (!fileId) return json(400, { error: 'fileId is required' });
      const { body, mimeType } = await readMedia(fileId);
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': mimeType,
          'Cache-Control': 'private, max-age=3600',
        },
        body,
        isBase64Encoded: true,
      };
    }

    if (event.httpMethod === 'POST' && action === 'create-session') {
      const { entryId, name, mimeType, size } = JSON.parse(event.body || '{}');
      if (!entryId || !name) {
        return json(400, { error: 'entryId and name are required' });
      }
      const uploadUrl = await createUploadSession({ entryId, name, mimeType, size });
      return json(200, { uploadUrl });
    }

    if (event.httpMethod === 'POST' && action === 'delete') {
      const { fileId } = JSON.parse(event.body || '{}');
      if (!fileId) return json(400, { error: 'fileId is required' });
      await deleteAttachment(fileId);
      return json(200, { success: true });
    }

    return json(400, { error: `Unknown action: ${action ?? '(none)'}` });
  } catch (error) {
    console.error('[DRIVE]', action, error.message);
    return json(error.statusCode ?? 500, { error: error.message });
  }
};
