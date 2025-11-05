# 🔄 CORS Proxy Setup Guide

Since Google Apps Script doesn't properly support CORS headers, we've implemented a **serverless proxy** that:

✅ Handles CORS for web browsers  
✅ Forwards requests to Google Sheets  
✅ Only used by web app (mobile goes direct)  
✅ Deploys automatically with your app  

---

## 🎯 How It Works

```
┌─────────┐         ┌─────────┐         ┌──────────────┐
│   Web   │──CORS──▶│  Proxy  │────────▶│ Google Sheet │
│   App   │◀────────│  /api   │◀────────│              │
└─────────┘         └─────────┘         └──────────────┘
     ✅                  ✅                      ✅

┌─────────┐                             ┌──────────────┐
│  Mobile │─────────Direct─────────────▶│ Google Sheet │
│   App   │◀────────(No CORS)───────────│              │
└─────────┘                             └──────────────┘
     ✅                                        ✅
```

**Mobile apps** (iOS/Android) don't have CORS restrictions, so they connect directly to Google Sheets.

**Web browsers** require CORS headers, so they use the proxy at `/api/proxy`.

---

## 📦 What Was Added

### New Files

1. **`api/proxy.js`** - Vercel serverless function (CORS proxy)
2. **`api/health.js`** - Health check endpoint
3. **`netlify/functions/proxy.js`** - Netlify function version
4. **`netlify/functions/health.js`** - Netlify health check

### Modified Files

1. **`services/research-log-service.ts`** - Auto-detects platform and uses proxy for web
2. **`vercel.json`** - Routes `/api/*` to serverless functions
3. **`netlify.toml`** - Routes `/api/*` to Netlify functions

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Set Environment Variable:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GOOGLE_SHEET_DB_URL` = Your Google Apps Script URL
   - Apply to: Production, Preview, and Development

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Test:**
   ```bash
   curl https://your-app.vercel.app/api/health
   # Should return: {"status":"ok","proxy":"running",...}
   ```

### Option 2: Netlify

1. **Set Environment Variable:**
   - Go to Netlify Dashboard → Your Site → Site settings → Environment variables
   - Add: `GOOGLE_SHEET_DB_URL` = Your Google Apps Script URL

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Test:**
   ```bash
   curl https://your-app.netlify.app/api/health
   # Should return: {"status":"ok","proxy":"running",...}
   ```

---

## 🧪 Local Testing

### Step 1: Install Vercel CLI (if using Vercel)

```bash
npm install -g vercel
```

### Step 2: Set Up Local Environment

Create/update `.env`:
```bash
GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### Step 3: Run Local Dev Server

#### For Vercel:
```bash
vercel dev
```

This starts:
- Web app at: `http://localhost:3000`
- API at: `http://localhost:3000/api/proxy`

#### For Netlify:
```bash
netlify dev
```

This starts:
- Web app at: `http://localhost:8888`
- API at: `http://localhost:8888/api/proxy`

### Step 4: Test the Proxy

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test proxy (GET)
curl http://localhost:3000/api/proxy

# Test proxy (POST)
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-01","plan_to_read":"Test"}'
```

### Step 5: Test the Web App

```bash
npm run web
```

Open `http://localhost:8081` and try creating a log!

---

## 🔍 How the Service Detects Platform

In `services/research-log-service.ts`:

```typescript
function getApiUrl(): string {
  if (Platform.OS === 'web') {
    // Web: Use proxy
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    return `${baseUrl}/api/proxy`;
  }
  
  // Mobile: Use Google Sheets directly
  return GOOGLE_SHEET_URL;
}
```

**Automatic routing:**
- `Platform.OS === 'web'` → Uses `/api/proxy`
- `Platform.OS === 'ios'` or `'android'` → Uses Google Sheets URL directly

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Environment variable `GOOGLE_SHEET_DB_URL` is set on hosting platform
- [ ] Health endpoint works: `/api/health` returns `{"status":"ok"}`
- [ ] Proxy endpoint works: `/api/proxy` returns your data
- [ ] Web app can create logs (test locally first)
- [ ] Mobile apps still work (they bypass the proxy)

---

## 🐛 Troubleshooting

### Issue: "GOOGLE_SHEET_DB_URL not configured"

**Solution:**
1. Set the environment variable on your hosting platform
2. Redeploy the app
3. Check the health endpoint: `/api/health`

### Issue: "Cannot connect to proxy"

**In Development:**
```bash
# Make sure dev server is running
vercel dev
# OR
netlify dev
```

**In Production:**
```bash
# Check if functions deployed
vercel ls
# OR
netlify functions:list
```

### Issue: Still getting CORS errors

**Check:**
1. Browser console - is it calling `/api/proxy` or Google Sheets directly?
2. Network tab - verify the URL being called
3. Console logs - should show `[ResearchLogService] Platform: web, API URL: http://localhost:3000/api/proxy`

**Fix:**
- Clear browser cache
- Rebuild: `npm run build:web`
- Restart dev server

### Issue: Mobile app broken

**The mobile app should NOT use the proxy.**

Check console logs on mobile - should show:
```
[ResearchLogService] Platform: ios, API URL: https://script.google.com/...
```

If it's trying to use `/api/proxy`, there's a bug in the platform detection.

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/proxy` | GET | Fetch all logs |
| `/api/proxy` | POST | Create new log |
| `/api/proxy?id=X&action=update` | POST | Update log |
| `/api/proxy?id=X&action=delete` | POST | Delete log |

---

## 🔐 Security Notes

### Current Setup
- Proxy allows requests from any origin (`Access-Control-Allow-Origin: *`)
- This is fine for public apps or development

### For Production

To restrict to your domain only, edit the proxy files:

**`api/proxy.js` and `netlify/functions/proxy.js`:**

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',  // Your domain only
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

Or allow multiple domains:

```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000', // For development
];

const origin = req.headers.origin || req.headers.referer;
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  // ... rest of headers
};
```

---

## 📈 Performance

The proxy adds minimal overhead:
- **Cold start:** ~200-500ms (first request)
- **Warm requests:** ~50-100ms
- **Caching:** Vercel/Netlify cache responses automatically

**Total request time:**
```
Browser → Proxy → Google Sheets → Proxy → Browser
  ~50ms    ~100ms    ~300ms     ~50ms
= ~500ms total (warm)
```

This is acceptable for most use cases.

---

## 🎯 Next Steps

1. **Test locally:**
   ```bash
   vercel dev
   npm run web
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Verify:**
   - Visit `https://your-app.vercel.app/api/health`
   - Create a test log from web app
   - Test mobile app still works

---

## 📚 Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Your app now works on web without CORS issues!** 🎉

