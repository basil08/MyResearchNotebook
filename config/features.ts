/**
 * Build-time feature switches.
 *
 * Small and blunt on purpose: a flag lives here only while a feature is being
 * held back, and is deleted along with the branch that removes it.
 */

/**
 * Attachments (Google Drive).
 *
 * Off while the Drive refresh token is expired. With this false the app never
 * calls /api/drive, so no entry shows the authorisation error while you type.
 * Turn it back on after re-running scripts/get-drive-token.mjs.
 */
export const ATTACHMENTS_ENABLED = false;
