# 🔍 CORS Debugging - Step by Step

Your deployment isn't showing Access-Control headers. Let's fix this.

## Step 1: Verify Script Code is Actually Updated

1. Open Google Sheet → Extensions → Apps Script
2. Press `Cmd/Ctrl + F` to search
3. Search for: `doOptions`

**Do you see this function?**
```javascript
function doOptions(e) {
  return createCorsResponse();
}
```

- ✅ **YES** → Good, continue to Step 2
- ❌ **NO** → The script wasn't updated! Go to "Fix: Update Script" below

### Fix: Update Script

1. In Apps Script, select ALL code (`Cmd/Ctrl + A`)
2. Delete everything
3. Open `google-apps-script-example.js` in your project
4. Select ALL code in that file (`Cmd/Ctrl + A`)
5. Copy it (`Cmd/Ctrl + C`)
6. Go back to Apps Script editor
7. Paste (`Cmd/Ctrl + V`)
8. Click **Save** (💾 icon)
9. Wait for "Last saved at..." message to appear
10. Continue to Step 2

---

## Step 2: Delete Old Deployments

Old deployments can cause issues. Let's start fresh:

1. In Apps Script, click **Deploy** → **Manage deployments**
2. For EACH deployment listed:
   - Click the **🗑️ Archive** button
   - Confirm the archive
3. Make sure the list is empty

---

## Step 3: Create Fresh Deployment

1. Click **Deploy** → **New deployment**
2. Click the ⚙️ **gear icon** next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** `Research Notebook CORS v2`
   - **Execute as:** **Me (your-email@gmail.com)**
   - **Who has access:** **Anyone** ⚠️ CRITICAL!
5. Click **Deploy**

### You might see "Authorization required":
1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced** → **Go to Research Notebook CORS v2 (unsafe)**
4. Click **Allow**

6. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/SOME_NEW_ID/exec
   ```

---

## Step 4: Test the New Deployment

Replace `YOUR_NEW_URL` with the URL you just copied:

```bash
# Test OPTIONS (CORS preflight)
curl -X OPTIONS "YOUR_NEW_URL" -v 2>&1 | grep -i "access-control"
```

**Expected output:**
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: Content-Type, Authorization
< access-control-max-age: 3600
```

### ❌ Still no headers?

Try the full verbose output to see what's happening:

```bash
curl -X OPTIONS "YOUR_NEW_URL" -v
```

Look for any error messages or redirect responses.

---

## Step 5: Check Execution Logs

1. In Apps Script, click **Executions** (left sidebar)
2. Run the curl command again:
   ```bash
   curl -X OPTIONS "YOUR_NEW_URL"
   ```
3. Refresh the Executions page
4. Look at the most recent execution

**What do you see?**

- ✅ **doOptions function executed** → Good! CORS should work
- ❌ **No execution appears** → Deployment issue, see Step 6
- ❌ **Error in execution** → Check the error message

---

## Step 6: Nuclear Option - Complete Reset

If nothing above worked, let's do a complete reset:

### A. Create a Test Script

1. In Apps Script, click **File** → **New** → **Script file**
2. Name it: `Test`
3. Paste this simple test:

```javascript
function doGet(e) {
  const output = ContentService.createTextOutput('{"test": "success"}');
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  return output;
}

function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return output;
}
```

4. Click **Save**
5. Deploy this as a new web app (Deploy → New deployment)
6. Test with curl:

```bash
curl -X OPTIONS "TEST_DEPLOYMENT_URL" -v 2>&1 | grep "access-control"
```

**Does this work?**

- ✅ **YES** → The test works, so Google Apps Script CORS is fine. The issue is with your main script. Copy the FULL code from `google-apps-script-example.js` again.
- ❌ **NO** → There's an issue with your Google account or Apps Script. Try:
  - Using a different Google account
  - Creating a new Google Sheet from scratch
  - Checking Google Apps Script status page

### B. If Test Works, Replace Main Code

1. Delete the `Test.gs` file
2. Go back to `Code.gs` (your main file)
3. Delete ALL code
4. Copy from `google-apps-script-example.js`
5. Paste and Save
6. Create new deployment
7. Test again

---

## Step 7: Update Your .env

Once you have a working deployment with CORS headers:

1. Copy the working deployment URL
2. Update `.env`:
   ```
   GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_WORKING_ID/exec
   ```
3. Rebuild your web app:
   ```bash
   npm run build:web
   npm run serve:web
   ```
4. Test creating a log

---

## Common Issues and Fixes

### Issue: "This app hasn't been verified"
**Fix:** Click "Advanced" → "Go to [app name] (unsafe)" → Allow

### Issue: No execution appears in logs
**Fix:** Deployment isn't active. Archive all deployments and create a fresh one.

### Issue: Execution shows error "Cannot find function doOptions"
**Fix:** Code wasn't saved properly. Copy the entire script again.

### Issue: Headers show up in curl but not in browser
**Fix:** This shouldn't happen if OPTIONS works. Clear browser cache or use incognito mode.

---

## Working Example

Here's the minimal working script that DEFINITELY works:

```javascript
function doGet(e) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ data: [] }))
    .setMimeType(ContentService.MimeType.JSON);
  
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

function doPost(e) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
  
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '3600');
  return output;
}
```

Test this minimal version if all else fails.

---

## Final Verification

When it works, you should see:

```bash
$ curl -X OPTIONS "YOUR_URL" -v 2>&1 | grep -i access
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, OPTIONS
< access-control-allow-headers: Content-Type
< access-control-max-age: 3600
```

Then in your browser console:

```javascript
fetch('YOUR_URL')
  .then(r => r.json())
  .then(d => console.log('✅ Success!', d))
  .catch(e => console.error('❌ Failed:', e))
```

Should show: `✅ Success!` with your data.

---

**Where are you stuck? Run the steps above and let me know what happens at Step 4 (the curl test).**

