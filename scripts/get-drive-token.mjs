#!/usr/bin/env node
/**
 * One-time Google Drive authorisation for Friday.
 *
 * Run this once on your own machine. It walks you through Google's consent
 * screen, exchanges the result for a long-lived refresh token, creates the
 * attachments folder, and prints the four values Netlify needs.
 *
 *     node scripts/get-drive-token.mjs
 *
 * Nothing is written to disk and nothing is sent anywhere except Google. The
 * refresh token is printed to your terminal — treat it like a password.
 *
 * No dependencies; needs Node 18+ for built-in fetch.
 */

import { createServer } from 'node:http';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, exit } from 'node:process';
import { spawn } from 'node:child_process';

/**
 * `drive.file` grants access only to files and folders this app itself
 * creates. It cannot see the rest of your Drive, which is why Google treats it
 * as non-sensitive and does not require an app review.
 *
 * It also means the folder must be created *by the app* — a folder you make by
 * hand in the Drive UI is invisible under this scope. This script creates it
 * for you at the end.
 */
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

/** Must match the redirect URI registered on the OAuth client, exactly. */
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const FOLDER_NAME = 'Friday Attachments';

const bold = (s) => `[1m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const red = (s) => `[31m${s}[0m`;
const yellow = (s) => `[33m${s}[0m`;

function openBrowser(url) {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref();
    return true;
  } catch {
    return false;
  }
}

/** Serve the redirect once, and hand back the authorisation code. */
function waitForCode() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        `<!doctype html><meta charset="utf-8">
         <title>Friday</title>
         <body style="font:16px/1.6 system-ui;background:#FAF9F7;color:#1A1917;
                      display:grid;place-items:center;height:100vh;margin:0">
           <div style="text-align:center">
             <h1 style="font-family:Georgia,serif;font-weight:600">${
               code ? 'Friday is connected to Drive' : 'Authorisation failed'
             }</h1>
             <p style="color:#605C55">${
               code ? 'You can close this tab and return to the terminal.' : String(error ?? '')
             }</p>
           </div>
         </body>`
      );

      server.close();
      if (code) resolve(code);
      else reject(new Error(error ?? 'No authorisation code returned'));
    });

    server.on('error', (e) =>
      reject(
        e.code === 'EADDRINUSE'
          ? new Error(`Port ${PORT} is busy. Close whatever is using it and run this again.`)
          : e
      )
    );
    server.listen(PORT);
    setTimeout(() => {
      server.close();
      reject(new Error('Timed out after 5 minutes.'));
    }, 5 * 60_000).unref();
  });
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  console.log(`\n${bold('Friday — connect Google Drive')}\n`);
  console.log('You need the OAuth client you created in the Google Cloud console.');
  console.log(dim('Setup steps are in docs/DRIVE_SETUP.md if you have not done that yet.\n'));

  // `rl.question` never settles if stdin closes, so a piped or non-interactive
  // run would otherwise exit silently with no explanation.
  const ask = async (prompt) => {
    const answer = await Promise.race([
      rl.question(prompt),
      new Promise((_, reject) =>
        rl.once('close', () => reject(new Error('Input closed. Run this in a terminal.')))
      ),
    ]);
    return String(answer ?? '').trim();
  };

  const clientId = await ask('Client ID:     ');
  const clientSecret = await ask('Client secret: ');
  rl.close();

  if (!clientId || !clientSecret) {
    console.error(red('\nBoth values are required.'));
    exit(1);
  }
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    console.log(
      yellow('\nThat client ID looks unusual — it normally ends in .apps.googleusercontent.com')
    );
  }

  const consent = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  consent.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    // `offline` is what returns a refresh token at all; `consent` forces a new
    // one even if you have authorised this client before.
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

  console.log(`\n${bold('Opening Google in your browser…')}`);
  console.log(dim('If it does not open, paste this URL yourself:\n'));
  console.log(dim(consent.toString()) + '\n');
  openBrowser(consent.toString());
  console.log('Waiting for you to approve access…');

  const code = await waitForCode();

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error(red(`\nGoogle rejected the exchange: ${tokens.error_description ?? tokens.error}`));
    exit(1);
  }
  if (!tokens.refresh_token) {
    console.error(
      red('\nGoogle returned no refresh token.') +
        '\nRevoke this app at https://myaccount.google.com/permissions and run this again.'
    );
    exit(1);
  }

  // Create the attachments folder. It has to be created by the app, or
  // `drive.file` will not be able to see it later.
  const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  const folder = await folderResponse.json();
  if (!folderResponse.ok) {
    console.error(red(`\nCould not create the folder: ${folder.error?.message ?? 'unknown error'}`));
    exit(1);
  }

  console.log(`\n${green('Done.')} Created the folder “${FOLDER_NAME}” in your Drive.\n`);
  console.log(bold('Add these four to your Netlify site environment variables:\n'));
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log(`GOOGLE_DRIVE_FOLDER_ID=${folder.id}`);
  console.log(
    `\n${yellow('These are credentials.')} Put them straight into Netlify — do not paste them into` +
      '\na chat, a commit, an issue, or a screenshot.\n'
  );
  console.log(
    dim(
      'If uploads stop working after about a week, the OAuth consent screen is still\n' +
        'in Testing. Publish it (docs/DRIVE_SETUP.md, step 3) and run this script again.\n'
    )
  );
}

main().catch((e) => {
  console.error(red(`\n${e.message}`));
  exit(1);
});
