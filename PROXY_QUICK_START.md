# 🚀 Proxy Quick Start - CORS Fixed!

## The Problem ❌
Google Apps Script doesn't support CORS headers properly for web browsers.

## The Solution ✅
We've added a **serverless proxy** that handles CORS for you!

- ✅ Web app uses proxy at `/api/proxy`
- ✅ Mobile apps use Google Sheets directly
- ✅ No changes needed to Google Apps Script
- ✅ Deploys automatically with your app

---

## Local Testing (2 Minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Make Sure .env is Set

```bash
# Create/verify .env file
echo "GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_ID/exec" > .env
```

Replace `YOUR_ID` with your actual Google Apps Script deployment ID.

### Step 3: Start Development Server

```bash
vercel dev
```

**Important:** Use `vercel dev` instead of `npm run web` for local testing!

This starts:
- Web app: `http://localhost:3000`
- API proxy: `http://localhost:3000/api/proxy`

### Step 4: Test the Proxy

Open a new terminal and run:

```bash
./test-proxy-local.sh
```

You should see:
```
✅ Health check passed
✅ CORS headers present
✅ Proxy GET passed
```

### Step 5: Test the Web App

The `vercel dev` server is already running your web app.

Open: `http://localhost:3000`

Try creating a research log!

**Check the console** - you should see:
```
[ResearchLogService] Platform: web, API URL: http://localhost:3000/api/proxy
```

---

## Deploy to Production (1 Minute)

### Step 1: Set Environment Variable on Vercel

```bash
# If deploying via CLI
vercel --prod

# During deployment, it will ask for environment variables
# Or set them in Vercel Dashboard → Settings → Environment Variables
```

Add:
- **Key:** `GOOGLE_SHEET_DB_URL`
- **Value:** `https://script.google.com/macros/s/YOUR_ID/exec`

### Step 2: Deploy

```bash
vercel --prod
```

### Step 3: Test Production

```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok","proxy":"running",...}
```

Try creating a log from your deployed app!

---

## Alternative: Netlify

### Local Testing

```bash
npm install -g netlify-cli
netlify dev
# Opens at http://localhost:8888
```

### Deploy

```bash
netlify deploy --prod
```

Set environment variable in Netlify Dashboard → Site settings → Environment variables.

---

## Troubleshooting

### "Cannot GET /api/proxy"

**Problem:** Dev server not running correctly

**Solution:**
```bash
# Stop any running servers
# Start with vercel dev (not npm run web)
vercel dev
```

### "GOOGLE_SHEET_DB_URL not configured"

**Problem:** Environment variable not set

**Solution:**
```bash
# Check .env file exists
cat .env

# Should show:
GOOGLE_SHEET_DB_URL=https://script.google.com/...

# Restart dev server
vercel dev
```

### Still getting CORS errors

**Check:**
1. Are you using `vercel dev`? (Required for proxy to work locally)
2. Is the web app calling `/api/proxy` or Google Sheets directly?
3. Check browser console for the API URL being used

**Solution:**
```bash
# Rebuild
npm run build:web

# Restart dev server
vercel dev
```

---

## Quick Commands Reference

```bash
# Local development
vercel dev                    # Start dev server with proxy
./test-proxy-local.sh        # Test proxy endpoints

# Build and deploy
npm run build:web            # Build for production
vercel --prod                # Deploy to Vercel
netlify deploy --prod        # Deploy to Netlify

# Testing
curl http://localhost:3000/api/health              # Local health check
curl https://your-app.vercel.app/api/health        # Production health check
```

---

## What Changed?

1. **Added proxy functions:**
   - `api/proxy.js` (Vercel)
   - `netlify/functions/proxy.js` (Netlify)

2. **Updated service:**
   - `services/research-log-service.ts` now detects platform
   - Web → Uses `/api/proxy`
   - Mobile → Uses Google Sheets directly

3. **Updated configs:**
   - `vercel.json` routes API calls
   - `netlify.toml` routes API calls

**No changes needed to your Google Apps Script!** 🎉

---

## Next Steps

1. ✅ Run `vercel dev`
2. ✅ Run `./test-proxy-local.sh`  
3. ✅ Open `http://localhost:3000`
4. ✅ Create a test log
5. ✅ Deploy with `vercel --prod`

**That's it! CORS issue is solved.** 🚀

