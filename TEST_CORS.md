# 🧪 Test CORS Configuration

Run these commands to verify CORS is working:

## Test 1: OPTIONS Request (Preflight)

```bash
curl -X OPTIONS "YOUR_SCRIPT_URL" -v 2>&1 | grep -i "access-control"
```

**Expected output:**
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: Content-Type, Authorization
```

## Test 2: GET Request

```bash
curl -X GET "YOUR_SCRIPT_URL" -v 2>&1 | grep -i "access-control"
```

**Expected output:**
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
```

## Test 3: Full GET with Headers

```bash
curl "YOUR_SCRIPT_URL" -H "Origin: http://localhost:3000" -v 2>&1 | head -20
```

You should see the CORS headers AND your data.

---

## If You Don't See CORS Headers

The script update didn't take effect. Try this:

### Step 1: Verify Script Was Updated

1. Open Google Sheet → Extensions → Apps Script
2. Look for this function (should be near the top):

```javascript
function doOptions(e) {
  return createCorsResponse();
}
```

3. Scroll to bottom - you should see:

```javascript
function addCorsHeaders(output) {
  output.setHeader('Access-Control-Allow-Origin', '*');
  // ... more code
  return output;
}
```

**If you DON'T see these functions**, the script wasn't updated properly!

### Step 2: Force Update

1. In Apps Script, select ALL code (Cmd/Ctrl + A)
2. Delete it
3. Go to the `google-apps-script-example.js` file in your project
4. Copy EVERYTHING (all 237 lines)
5. Paste into Apps Script
6. Click Save (💾)
7. Verify you see "Last saved" timestamp update

### Step 3: Create COMPLETELY New Deployment

Instead of updating the version, let's create a brand new deployment:

1. Click **Deploy** → **New deployment**
2. Click ⚙️ gear icon → Select "Web app"
3. Settings:
   - Description: "Research Notebook API v2 - With CORS"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **IMPORTANT:** You'll get a NEW URL
6. Copy the new URL
7. Update your `.env` file with the new URL:
   ```
   GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/NEW_ID_HERE/exec
   ```

### Step 4: Test New Deployment

```bash
# Test OPTIONS
curl -X OPTIONS "NEW_SCRIPT_URL" -v 2>&1 | grep -i "access-control"

# Test GET
curl -X GET "NEW_SCRIPT_URL" -v 2>&1 | grep -i "access-control"
```

You should now see the CORS headers!

### Step 5: Rebuild and Test Web App

```bash
npm run build:web
npm run serve:web
```

Try creating a log again.

---

## Alternative: Check Execution Logs

1. In Apps Script, click **"Executions"** in the left sidebar
2. Try creating a log from your web app
3. Look at the execution log
4. Check if `doOptions` or `addCorsHeaders` functions appear
5. Look for any errors

If you don't see these functions being called, the deployment isn't using the updated code.

---

## Quick Verification Script

Save this as `test-cors.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CORS Test</title>
</head>
<body>
    <h1>Testing CORS...</h1>
    <div id="result"></div>
    
    <script>
        const API_URL = 'YOUR_SCRIPT_URL_HERE';
        
        fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            document.getElementById('result').innerHTML = 
                '<h2 style="color: green;">✅ CORS Working!</h2>' +
                '<pre>' + JSON.stringify(response.headers, null, 2) + '</pre>';
            return response.json();
        })
        .then(data => {
            document.getElementById('result').innerHTML += 
                '<h3>Data:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        })
        .catch(error => {
            document.getElementById('result').innerHTML = 
                '<h2 style="color: red;">❌ CORS Not Working</h2>' +
                '<p>' + error.message + '</p>';
        });
    </script>
</body>
</html>
```

Replace `YOUR_SCRIPT_URL_HERE` with your URL and open in Chrome.

---

**If still stuck, screenshot your Apps Script showing the `doOptions` function and the deployment settings.**

