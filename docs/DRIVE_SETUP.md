# Connecting Friday to Google Drive

One-time setup so entries can carry attachments. About fifteen minutes, mostly
waiting on Google's console.

**What you end up with:** four environment variables in Netlify, and a folder
called *Friday Attachments* in your own Drive. Files belong to you, live in your
Drive, and count against your storage — not against some service account you
have to think about.

> **Do not send me the four values.** Put them straight into Netlify. They are
> credentials: anyone holding them can write to that Drive folder. Just tell me
> when they are set and I will finish the build against them.

---

## Before you start

You need a Google Cloud project. **Use the one Firebase already made for you** —
a Firebase project *is* a Cloud project, so there is nothing new to create. Find
it at [console.cloud.google.com](https://console.cloud.google.com); it will have
the same name as your Firebase project.

Everything below is free.

---

## 1. Turn on the Drive API

In the Cloud console, with your project selected:

**APIs & Services → Library → search "Google Drive API" → Enable**

That is the whole step. If it already says *Manage* instead of *Enable*, it is
on.

---

## 2. Set up the consent screen

**APIs & Services → OAuth consent screen**

| Field | Value |
|---|---|
| User type | **External** |
| App name | `Friday` |
| User support email | your address |
| Developer contact | your address |

Everything else can stay blank.

On the **Scopes** step, click *Add or remove scopes*, and add exactly one:

```
https://www.googleapis.com/auth/drive.file
```

If it is not in the list, paste it into the *manually add scopes* box at the
bottom.

**Why this scope and no other.** `drive.file` gives the app access *only to
files and folders it creates itself*. It cannot read anything else in your
Drive — not your documents, not your photos, nothing it did not make. That is
also why Google classes it as non-sensitive and does not put you through an app
verification review. A broader scope like `drive` would work too and would be a
much worse idea.

On the **Test users** step, add your own Google address.

---

## 3. Publish the app — do not skip this

Back on the OAuth consent screen overview, click **Publish app** and confirm.
Status should read *In production*.

**This matters more than it looks.** While the consent screen sits in *Testing*,
Google expires refresh tokens after **seven days**. Attachments would work
perfectly, you would forget all about this, and uploads would start failing next
week for no visible reason.

Publishing does **not** trigger a verification review here, because `drive.file`
is a non-sensitive scope. You may see an "unverified app" interstitial during
step 5 — that is expected for an app only you use. Click *Advanced → Go to
Friday (unsafe)*. It is your own app; "unsafe" means "Google has not reviewed
it", not that anything is wrong.

---

## 4. Create the OAuth client

**APIs & Services → Credentials → Create credentials → OAuth client ID**

| Field | Value |
|---|---|
| Application type | **Web application** |
| Name | `Friday local setup` |
| Authorised redirect URI | `http://localhost:53682/callback` |

The redirect URI must match **exactly** — same scheme, port and path, no
trailing slash. It is only used by the setup script on your machine in step 5;
nothing in the deployed app uses it.

Copy the **Client ID** and **Client secret** it shows you. You need both in the
next step.

---

## 5. Run the setup script

In the project directory:

```bash
node scripts/get-drive-token.mjs
```

It asks for the client ID and secret, opens Google's consent screen in your
browser, and — once you approve — exchanges the result for a long-lived refresh
token and creates the *Friday Attachments* folder.

It prints four lines:

```
GOOGLE_OAUTH_CLIENT_ID=…
GOOGLE_OAUTH_CLIENT_SECRET=…
GOOGLE_OAUTH_REFRESH_TOKEN=…
GOOGLE_DRIVE_FOLDER_ID=…
```

Nothing is written to disk and nothing is sent anywhere except Google.

---

## 6. Put them in Netlify

**Site configuration → Environment variables → Add a variable**, one per line
above. Scope them to all deploy contexts.

Then **redeploy** — Netlify functions only pick up environment variables on a
new deploy.

For local development, add the same four to your `.env`. That file is
gitignored; keep it that way.

---

## That is it

Tell me the four are set and I will finish the upload path against them.

---

## How this will work once built

Worth knowing, because it explains why the setup looks the way it does.

```
 browser                   Netlify function                 Google
    │                            │                             │
    │  1. POST /api/drive-upload │                             │
    │     + Firebase ID token    │                             │
    │───────────────────────────▶│                             │
    │                            │ verifies the Firebase token │
    │                            │ refresh token → access token│
    │                            │────────────────────────────▶│
    │                            │  opens a resumable session  │
    │                            │◀────────────────────────────│
    │  2. one-shot session URL   │                             │
    │◀───────────────────────────│                             │
    │                                                          │
    │  3. PUT the file bytes, straight to Google               │
    │─────────────────────────────────────────────────────────▶│
```

**The proxy makes every authorisation decision.** It checks your Firebase
identity before it will open an upload session, and it is the only thing that
ever holds the Drive credentials. The browser never sees them.

**The bytes do not go through the proxy.** Netlify functions cap request bodies
at 6MB, which after base64 expansion means roughly a 4.5MB attachment — useless
for a 20MB paper. So the proxy hands back a *resumable upload session URL*: a
one-shot, expiring URL that can write exactly one file and nothing else, which
the browser uploads to directly. That satisfies the rule that writes are only
ever authorised by the proxy, without dragging every megabyte through a
function.

Attachment metadata (file id, name, type, size) is recorded on the entry as JSON
in a text column, consistent with how the schema already works.

---

## If something goes wrong

**"Access blocked: Friday has not completed the Google verification process"**
Expected. *Advanced → Go to Friday (unsafe)*. See step 3.

**"redirect_uri_mismatch"**
The URI in step 4 does not match `http://localhost:53682/callback` character for
character. A trailing slash is the usual culprit.

**Google returned no refresh token**
You have authorised this client before, so Google reused the grant. Remove
Friday at [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
and run the script again.

**Port 53682 is busy**
Something else is on it. Close that, or change `PORT` in the script *and* the
redirect URI in step 4 to match.

**Uploads worked, then stopped about a week later**
The consent screen is still in *Testing*. Publish it (step 3) and re-run the
script for a fresh token.

**Revoking access**
[myaccount.google.com/permissions](https://myaccount.google.com/permissions) →
Friday → Remove. Uploads stop immediately. Existing files stay in your Drive.
