# Google Sheets Backend Setup - Step by Step

This guide will help you set up the Google Sheets backend for your Research Notebook app.

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it **"Research Logs"**
4. In cell A1, start adding these headers (one per column):

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| id | created_by | date | plan_to_read | did_read | learned_today | new_thoughts | coded_today | wrote_or_taught | try_tomorrow | created_at | updated_at |

**Important:** The header names must match exactly (including lowercase and underscores)!

5. Rename the sheet tab at the bottom from "Sheet1" to **"ResearchLogs"**

## Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab will open with the Apps Script editor
3. You'll see a default `function myFunction() {}` - **delete all of it**

## Step 3: Add the Backend Code

1. Copy the entire content from `google-apps-script-example.js` in this repository
2. Paste it into the Apps Script editor
3. Make sure the `SHEET_NAME` constant matches your sheet tab name:
   ```javascript
   const SHEET_NAME = 'ResearchLogs'; // Must match your sheet tab name
   ```
4. Click the **💾 Save** icon (or Ctrl/Cmd + S)
5. Name the project: **"Research Notebook API"**

## Step 4: Deploy as Web App (CRITICAL!)

This is the most important step!

1. Click **Deploy** → **New deployment**
2. Click the **⚙️ gear icon** next to "Select type"
3. Select **"Web app"**
4. Fill in the settings:
   - **Description:** `Research Notebook API`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone` ⚠️ This is critical!
5. Click **Deploy**
6. You may see a warning about permissions:
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** → **"Go to Research Notebook API (unsafe)"**
   - Click **"Allow"**
7. **COPY THE WEB APP URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

## Step 5: Configure Your App

1. Open (or create) `.env` file in your project root
2. Add this line with YOUR web app URL:
   ```
   GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Save the file

## Step 6: Restart Your Expo App

1. Stop the Expo server (Ctrl+C)
2. Clear cache and restart:
   ```bash
   npx expo start --clear
   ```
3. Press `a` to reload on Android

## Step 7: Test It!

Try creating a new research log in your app. Check the terminal for console logs that show:
- The URL being used
- The data being sent
- Any error messages

## Troubleshooting

### Still Getting 405 Error?

**Check your deployment:**
1. In Apps Script, click **Deploy** → **Manage deployments**
2. Make sure "Who has access" is set to **"Anyone"**
3. If it says "Only myself", click **Edit** → Change to "Anyone" → **Deploy**

### Getting 403 or 401 Errors?

The Apps Script doesn't have permission to access your sheet:
1. In Apps Script, click the **⚠️** icon
2. Review and authorize all permissions
3. Make sure you authorized with the same Google account that owns the sheet

### "GOOGLE_SHEET_DB_URL is not configured" Error?

1. Make sure your `.env` file exists in the project root
2. Make sure the line starts with `GOOGLE_SHEET_DB_URL=` (no spaces!)
3. Restart Expo after changing `.env`
4. Check the console logs - it will show what URL it's trying to use

### Data Not Appearing?

1. Check your Google Sheet - is the data there?
2. Pull down to refresh in the app
3. Check the sheet tab name matches `SHEET_NAME` in the script
4. Check the header names match exactly

### Need to Update Your Deployment?

If you change the Apps Script code:
1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon) on your deployment
3. Under **Version**, select **"New version"**
4. Click **Deploy**
5. The URL stays the same - no need to update `.env`

## Testing Your Backend Directly

Before testing in the app, verify the backend works:

### Test with curl (Mac/Linux Terminal):

**Get all logs:**
```bash
curl "YOUR_WEB_APP_URL"
```

**Create a log:**
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "created_by": "basil",
    "date": "2024-11-01",
    "plan_to_read": "Test reading",
    "did_read": "Test completed",
    "learned_today": "Testing works!",
    "new_thoughts": "This is great",
    "coded_today": "Backend setup",
    "wrote_or_taught": "Documentation",
    "try_tomorrow": "Use the app!",
    "created_at": "2024-11-01T12:00:00Z",
    "updated_at": "2024-11-01T12:00:00Z"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Log created successfully",
  "data": { ... }
}
```

If you see this, your backend is working! 🎉

### Common Backend Issues:

1. **"Script function not found: doPost"**
   - Make sure you copied the entire script
   - Make sure you saved it

2. **"Cannot read property 'contents' of undefined"**
   - Your deployment might be old
   - Create a new version of the deployment

3. **Empty response**
   - Check if the sheet name in the script matches your actual sheet tab name
   - Make sure headers are in the first row

## Security Notes

⚠️ **Important:** With "Anyone" access, anyone with the URL can add/edit/delete logs. This is fine for:
- Personal use
- Testing
- Non-sensitive data

For production use with sensitive data, you should:
1. Implement authentication in the Apps Script
2. Use Google Sheets API with OAuth instead
3. Or keep the URL private and don't share it

## Next Steps

Once everything is working:
1. Try creating a few logs
2. Edit and delete them
3. Check that data persists in your Google Sheet
4. Export your sheet as CSV/Excel anytime for backup

Need help? Check the console logs in:
- Expo terminal (for app errors)
- Apps Script (Executions tab for backend errors)

Happy logging! 📚✨

