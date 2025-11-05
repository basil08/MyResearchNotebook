# Web Quick Start Guide 🚀

Get your Research Notebook running on the web in 5 minutes!

## 🎯 Quick Deploy (Fastest Way)

### Option 1: Vercel (Recommended)

1. **Push your code to GitHub**
2. **Go to [vercel.com](https://vercel.com)** and sign in
3. **Click "Import Project"**
4. **Select your repository**
5. **Configure these settings:**
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Add environment variable:**
   - Name: `GOOGLE_SHEET_DB_URL`
   - Value: Your Google Sheets API URL
7. **Click Deploy** 🎉

**Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Push your code to GitHub**
2. **Go to [netlify.com](https://netlify.com)** and sign in
3. **Click "New site from Git"**
4. **Select your repository**
5. **Build settings:**
   - Build command: `npm run build:web`
   - Publish directory: `dist`
6. **Environment variables:**
   - `GOOGLE_SHEET_DB_URL`: Your API URL
7. **Deploy site** 🎉

**Done!** Your app will be live at `https://your-project.netlify.app`

---

## 💻 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file:

```bash
GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3. Run Web Development Server

```bash
npm run web
```

Your app will open at `http://localhost:8081`

### 4. Build for Production

```bash
npm run build:web
```

### 5. Test Production Build Locally

```bash
npm run serve:web
```

Visit `http://localhost:3000` to test

---

## 🔧 Environment Setup

### Required Environment Variable

You need to set `GOOGLE_SHEET_DB_URL` pointing to your Google Apps Script web app.

#### How to Get Your Google Sheets API URL:

1. Create a Google Sheet with the required columns
2. Create a Google Apps Script (see `google-apps-script-example.js`)
3. Deploy as Web App:
   - Click **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
4. Copy the Web App URL
5. Add to your environment variables

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for detailed instructions.

---

## 🌐 Platform-Specific Files

The project includes configuration files for popular platforms:

- **`vercel.json`** - Vercel deployment configuration
- **`netlify.toml`** - Netlify deployment configuration  
- **`.github/workflows/deploy-web.yml`** - CI/CD workflow
- **`metro.config.js`** - Metro bundler configuration

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] ✅ Google Sheets API is set up and working
- [ ] ✅ Environment variable `GOOGLE_SHEET_DB_URL` is configured
- [ ] ✅ App works locally with `npm run web`
- [ ] ✅ Production build succeeds with `npm run build:web`
- [ ] ✅ Production build works with `npm run serve:web`
- [ ] ✅ All CRUD operations work (Create, Read, Update, Delete)
- [ ] ✅ Filtering works correctly
- [ ] ✅ Dark mode switches properly
- [ ] ✅ URLs are clickable in log entries

---

## 🐛 Common Issues

### "Cannot find module" errors during build

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:web
```

### CORS errors when fetching data

**Solution:**
- Ensure Google Apps Script is deployed with "Anyone" access
- Check that the deployment URL is correct
- Verify CORS headers in your Google Apps Script

### Environment variables not working

**Solution:**
- Rebuild after changing environment variables
- For Vercel/Netlify: Set in dashboard, then redeploy
- Variable must be in `app.config.js` under `extra`

### Blank page after deployment

**Solution:**
- Check browser console for errors
- Verify all assets loaded (Network tab)
- Ensure index.html is served from root
- Check hosting platform's routing configuration

---

## 📊 Testing Checklist

After deployment, test these features:

### Core Functionality
- [ ] Create a new research log
- [ ] View list of logs
- [ ] Edit an existing log
- [ ] Delete a log
- [ ] Pull to refresh data

### Filtering
- [ ] Filter by "Last 7 Days"
- [ ] Filter by "This Month"
- [ ] Filter by "Last Month"
- [ ] Filter by custom date range
- [ ] Clear filters

### UI/UX
- [ ] Dark mode toggle works
- [ ] Responsive on mobile screens
- [ ] Responsive on tablet screens
- [ ] Responsive on desktop screens
- [ ] Multi-step form navigation
- [ ] URL links are clickable

---

## 🚀 Performance

Expected performance metrics:

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

These are automatically optimized by Expo's web build process.

---

## 📱 Mobile Web (PWA)

The app works as a Progressive Web App! Users can:

1. Visit your site on mobile
2. Tap "Add to Home Screen"
3. Use it like a native app

PWA features:
- Offline-capable (with proper service worker setup)
- App-like experience
- Home screen icon
- Splash screen

---

## 🎨 Customization

### Change App Name

Edit `app.config.js`:
```javascript
name: "Your App Name",
```

### Change App Icon

Replace `./assets/images/icon.png` and `./assets/images/favicon.png`

### Change Theme Colors

Edit `constants/theme.ts` for app-wide color changes

---

## 📚 Additional Resources

- **Full Deployment Guide:** [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md)
- **Google Sheets Setup:** [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
- **Build Guide:** [BUILD_GUIDE.md](./BUILD_GUIDE.md)
- **Main README:** [README.md](./README.md)

---

## 🆘 Need Help?

1. Check the [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md) troubleshooting section
2. Review [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
3. Check your platform's documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
4. Open an issue on GitHub

---

**Happy deploying! 🎉**

