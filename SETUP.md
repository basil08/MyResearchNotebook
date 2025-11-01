# Setup Guide for My Research Notebook

This guide will help you set up the Research Notebook app from scratch.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (will be installed with dependencies)
- A Google account

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Google Sheet

### Create the Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Research Logs" or any name you prefer
4. In the first row, add these headers (exact spelling matters):

   ```
   id | created_by | date | plan_to_read | did_read | learned_today | new_thoughts | coded_today | wrote_or_taught | try_tomorrow | created_at | updated_at
   ```

### Set Up Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy the content from `google-apps-script-example.js` in this repository
4. Update the `SHEET_NAME` constant to match your sheet name (default is "ResearchLogs")
5. Save the project (Ctrl/Cmd + S)

### Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon and select **Web app**
3. Configure the deployment:
   - **Description**: Research Notebook API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Review permissions and authorize the app
6. Copy the **Web app URL** - you'll need this for the next step

## Step 3: Configure Environment Variables

1. Create a file named `.env` in the root directory of the project
2. Add the following line, replacing with your actual URL:

   ```
   GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

3. Save the file

## Step 4: Test the Backend

Before running the app, test that your Google Apps Script is working:

### Test GET (Fetch all logs)
```bash
curl "YOUR_WEB_APP_URL"
```

### Test POST (Create a log)
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "created_by": "basil",
    "date": "2024-01-01",
    "plan_to_read": "Test",
    "did_read": "Test",
    "learned_today": "Test",
    "new_thoughts": "Test",
    "coded_today": "Test",
    "wrote_or_taught": "Test",
    "try_tomorrow": "Test",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }'
```

## Step 5: Run the App

### Start the Development Server
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Run on Web
```bash
npm run web
```

Or scan the QR code with the **Expo Go** app on your mobile device.

## Troubleshooting

### App Can't Connect to Google Sheets

1. **Check the URL**: Make sure your `GOOGLE_SHEET_DB_URL` in `.env` is correct
2. **Restart the app**: After changing `.env`, restart the Expo development server
3. **Check permissions**: Ensure your Apps Script deployment is set to "Anyone" can access
4. **Test the endpoint**: Use curl or Postman to test the URL directly

### CORS Issues

If you see CORS errors:
1. This is usually only an issue on web, not mobile
2. The Apps Script should handle CORS automatically
3. If needed, add this to your Apps Script:
   ```javascript
   function doGet(e) {
     const output = // your response
     return ContentService
       .createTextOutput(JSON.stringify(output))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

### Data Not Showing

1. **Check your sheet**: Ensure the first row has the correct headers
2. **Check data format**: Dates should be in YYYY-MM-DD format
3. **Pull to refresh**: Swipe down on the list to refresh the data

### Build Errors

1. **Clear cache**: `npx expo start -c`
2. **Reinstall dependencies**: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Additional Configuration

### Customizing the Sheet Name

If you want to use a different sheet name:
1. Update the `SHEET_NAME` constant in your Google Apps Script
2. Redeploy the script
3. No changes needed in the React Native app

### Adding More Fields

To add more fields to the logs:
1. Add the column to your Google Sheet header row
2. Update `types/research-log.ts` to include the new field
3. Update `components/research-log-form.tsx` to add the input field
4. Update `components/research-log-list.tsx` to display the field

## Security Notes

- The `.env` file is gitignored by default - never commit it to version control
- The Google Apps Script URL is not a secret, but it's good practice not to share it publicly
- Consider setting up proper authentication if you're storing sensitive information
- The current setup hardcodes `created_by` to "basil" - you may want to add user authentication

## Next Steps

Once everything is working:
1. Create your first research log
2. Try the different filters
3. Edit and delete logs to test full CRUD functionality
4. Explore the dark mode by changing your device theme
5. Export your data from Google Sheets for analysis

## Support

If you encounter any issues:
1. Check the console logs in Expo
2. Check the Apps Script logs (View > Logs in Apps Script editor)
3. Review the README.md for more information
4. Open an issue on GitHub

Happy researching! 📚✨

