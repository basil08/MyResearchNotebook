# Quick Start Guide 🚀

Get your Research Notebook app running in 5 minutes!

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Set Up Google Sheet (2 min)

1. Create a new [Google Sheet](https://sheets.google.com)
2. Add these headers in the first row:
   ```
   id | created_by | date | plan_to_read | did_read | learned_today | new_thoughts | coded_today | wrote_or_taught | try_tomorrow | created_at | updated_at
   ```

## 3. Deploy Apps Script (1 min)

1. In your sheet: **Extensions > Apps Script**
2. Copy code from `google-apps-script-example.js`
3. **Deploy > New deployment > Web app**
4. Set "Who has access" to **Anyone**
5. Copy the deployment URL

## 4. Configure Environment (30 sec)

Create `.env` file:
```
GOOGLE_SHEET_DB_URL=your_copied_url_here
```

## 5. Run the App! (30 sec)

```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web
- Or scan the QR code with Expo Go app

## That's It! 🎉

You're now ready to:
- ✅ Create research logs
- ✅ Edit and delete entries
- ✅ Filter by date
- ✅ Track your learning journey

---

For detailed instructions, see [SETUP.md](./SETUP.md)

