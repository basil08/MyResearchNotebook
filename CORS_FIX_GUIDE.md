# 🔧 CORS Fix Guide - Web Deployment

## The Problem

When accessing your Google Apps Script from a web browser, you get this error:
```
Access to XMLHttpRequest blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

This happens because **web browsers require CORS headers** that the original script didn't include.

## ✅ The Solution (5 Minutes)

Follow these steps to update your Google Apps Script:

### Step 1: Open Your Apps Script

1. Go to your Google Sheet
2. Click **Extensions** → **Apps Script**
3. You'll see your existing code

### Step 2: Update the Script

**Option A: Replace Everything (Recommended)**

1. Select all code (Cmd/Ctrl + A)
2. Delete it
3. Copy the ENTIRE updated script from `google-apps-script-example.js`
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)

**Option B: Add CORS Functions Manually**

If you have custom modifications, add these at the top after `const SHEET_NAME`:

```javascript
/**
 * Handle OPTIONS requests for CORS preflight
 * This is CRITICAL for web browsers!
 */
function doOptions(e) {
  return createCorsResponse();
}
```

Then replace your `createResponse` function with:

```javascript
/**
 * Create standardized JSON response with CORS headers
 */
function createResponse(data, statusCode = 200) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers - CRITICAL for web deployment!
  return addCorsHeaders(output);
}

/**
 * Create a CORS preflight response
 */
function createCorsResponse() {
  const output = ContentService.createTextOutput('');
  return addCorsHeaders(output);
}

/**
 * Add CORS headers to allow web browser access
 */
function addCorsHeaders(output) {
  // Allow requests from any origin (you can restrict this to your domain)
  output.setHeader('Access-Control-Allow-Origin', '*');
  
  // Allow specific HTTP methods
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow specific headers
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Cache preflight for 1 hour
  output.setHeader('Access-Control-Max-Age', '3600');
  
  return output;
}
```

### Step 3: Deploy New Version

**IMPORTANT:** You must create a NEW deployment version!

1. Click **Deploy** → **Manage deployments**
2. Click the **Edit** button (✏️ pencil icon) next to your existing deployment
3. Under **Version**, select **"New version"** from the dropdown
4. (Optional) Add description: "Added CORS support for web"
5. Click **Deploy**

**Your URL stays the same!** No need to update `.env`

### Step 4: Test Again

1. Go back to your terminal
2. Stop your local server (Ctrl+C)
3. Rebuild and serve:
   ```bash
   npm run build:web
   npm run serve:web
   ```
4. Try creating a log again

**It should work now!** 🎉

---

## 🧪 Testing Your Fix

### Quick Browser Test

Open your browser console and run:

```javascript
fetch('YOUR_SCRIPT_URL', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('✅ CORS working!', data))
.catch(err => console.error('❌ Still broken:', err));
```

Replace `YOUR_SCRIPT_URL` with your actual Google Apps Script URL.

### Test with curl

```bash
curl -I "YOUR_SCRIPT_URL"
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 🔍 What Changed?

### Added `doOptions()` Function
Handles the browser's preflight request (OPTIONS method) that checks if CORS is allowed.

### Updated `createResponse()` Function
Now adds CORS headers to every response.

### Added `addCorsHeaders()` Function
Centralized function that adds all necessary CORS headers:
- `Access-Control-Allow-Origin: *` - Allows any domain (you can restrict this)
- `Access-Control-Allow-Methods` - Allows GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers` - Allows Content-Type and Authorization
- `Access-Control-Max-Age` - Caches preflight for 1 hour

---

## 🔒 Security Notes

### Current Setting: `Allow-Origin: *`
This allows **any website** to call your API. This is fine for:
- Development and testing
- Personal projects
- Non-sensitive data

### For Production (Recommended)

If deploying to production, restrict to your domain:

```javascript
function addCorsHeaders(output) {
  // Only allow your domain
  output.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
  
  // Or allow multiple specific domains
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // for local testing
  ];
  
  // Get the origin from the request
  const origin = e?.parameter?.origin || '*';
  
  if (allowedOrigins.includes(origin)) {
    output.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  output.setHeader('Access-Control-Max-Age', '3600');
  
  return output;
}
```

---

## 🐛 Still Not Working?

### Error: "Script function not found: doOptions"

You didn't save the script or deploy a new version.
- Save the script (💾)
- Deploy > Manage deployments > Edit > New version > Deploy

### Error: Still getting CORS error

**Check deployment settings:**
1. Go to Deploy > Manage deployments
2. Verify "Who has access" is set to **"Anyone"**
3. Make sure you deployed a **new version** (not just saved)

**Clear browser cache:**
```bash
# Chrome/Edge
Cmd/Ctrl + Shift + Delete > Clear cached images and files

# Or use Incognito/Private mode
```

### Error: "Authorization required"

Your deployment settings changed:
1. Deploy > Manage deployments > Edit
2. Make sure "Execute as" is **"Me"**
3. Make sure "Who has access" is **"Anyone"**
4. Click Deploy

### Test the API directly

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS "YOUR_SCRIPT_URL" -v

# Should return 200 with CORS headers
```

```bash
# Test GET
curl "YOUR_SCRIPT_URL"

# Should return your data
```

---

## ✅ Checklist

After updating:

- [ ] Script updated with CORS functions
- [ ] Script saved (💾)
- [ ] New version deployed (Deploy > Manage deployments > Edit > New version)
- [ ] Deployment has "Anyone" access
- [ ] Web app URL is the same
- [ ] Browser test shows CORS headers
- [ ] App can create logs from web

---

## 📚 Additional Resources

- [Google Apps Script CORS Documentation](https://developers.google.com/apps-script/guides/web)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Understanding CORS Preflight](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

---

## 🎉 Success!

Once you see your log created successfully, you're all set!

Your Research Notebook now works on:
- ✅ iOS mobile
- ✅ Android mobile
- ✅ Web browsers (Chrome, Safari, Firefox, etc.)
- ✅ Desktop and mobile web

**Happy logging! 📚**

