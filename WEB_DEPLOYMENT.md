# Web Deployment Guide 🌐

This guide covers how to deploy your Research Notebook application to the web using various hosting platforms.

## Table of Contents

1. [Building for Web](#building-for-web)
2. [Testing Locally](#testing-locally)
3. [Deployment Platforms](#deployment-platforms)
   - [Vercel](#vercel-recommended)
   - [Netlify](#netlify)
   - [GitHub Pages](#github-pages)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

## Building for Web

The app is configured to export as a static website that can be hosted anywhere.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- All dependencies installed (`npm install`)

### Build Command

```bash
npm run build:web
```

This will:
1. Export your app to static HTML/CSS/JS files
2. Output to the `dist` directory
3. Generate all necessary assets for deployment

### Output Structure

After building, your `dist` folder will contain:

```
dist/
├── _expo/
│   └── static/        # JavaScript bundles and assets
├── assets/            # Images and other media
├── index.html         # Main entry point
└── ...                # Other static files
```

## Testing Locally

Before deploying, test the production build locally:

```bash
# Build the app
npm run build:web

# Serve the build
npm run serve:web
```

This will start a local server (usually at `http://localhost:3000`). Test all functionality:

- ✅ Log creation and editing
- ✅ Filtering and date ranges
- ✅ URL parsing and link clicking
- ✅ Dark mode toggle
- ✅ Pull to refresh
- ✅ Google Sheets integration

## Deployment Platforms

### Vercel (Recommended) ⚡

**Why Vercel?**
- Free tier available
- Automatic HTTPS
- Global CDN
- Easy environment variable management
- Automatic deployments from Git

#### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
npm run build:web
vercel --prod
```

4. Configure environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `GOOGLE_SHEET_DB_URL` with your API URL

#### Option 2: Vercel Dashboard (Git Integration)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add environment variables:
   - `GOOGLE_SHEET_DB_URL`: Your Google Sheets API URL
7. Click "Deploy"

#### Vercel Configuration File (Optional)

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "env": {
    "GOOGLE_SHEET_DB_URL": "@google-sheet-db-url"
  }
}
```

---

### Netlify

**Why Netlify?**
- Generous free tier
- Excellent developer experience
- Form handling (bonus feature)
- Automatic HTTPS

#### Option 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Build and deploy:
```bash
npm run build:web
netlify deploy --prod --dir=dist
```

4. Set environment variables:
```bash
netlify env:set GOOGLE_SHEET_DB_URL "your_api_url_here"
```

#### Option 2: Netlify Dashboard (Git Integration)

1. Push your code to a Git repository
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Configure build settings:
   - **Build command:** `npm run build:web`
   - **Publish directory:** `dist`
6. Add environment variables:
   - Variable: `GOOGLE_SHEET_DB_URL`
   - Value: Your Google Sheets API URL
7. Click "Deploy site"

#### Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build:web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### GitHub Pages

**Why GitHub Pages?**
- Free for public repositories
- Easy if you're already using GitHub
- No build step required on platform

#### Setup

1. Build your app:
```bash
npm run build:web
```

2. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

3. Add to `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/MyResearchNotebook",
  "scripts": {
    "predeploy": "npm run build:web",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`
   - Save

#### Environment Variables

Since GitHub Pages is static hosting, you need to handle environment variables differently:

**Option 1:** Use the default `.env` approach (not recommended for production)

**Option 2:** Create `app.config.js` with runtime environment detection:

```javascript
const getEnvironmentUrl = () => {
  if (typeof window !== 'undefined') {
    // Check for URL parameter or use default
    const params = new URLSearchParams(window.location.search);
    return params.get('apiUrl') || 'YOUR_DEFAULT_API_URL';
  }
  return process.env.GOOGLE_SHEET_DB_URL;
};
```

---

### AWS S3 + CloudFront

**Why AWS?**
- Maximum control and scalability
- Integrates with other AWS services
- Professional-grade CDN

#### Setup

1. Create an S3 bucket:
```bash
aws s3 mb s3://research-notebook-web
```

2. Build your app:
```bash
npm run build:web
```

3. Upload to S3:
```bash
aws s3 sync dist/ s3://research-notebook-web --delete
```

4. Configure bucket for static website hosting:
```bash
aws s3 website s3://research-notebook-web --index-document index.html --error-document index.html
```

5. Set bucket policy (make public):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::research-notebook-web/*"
    }
  ]
}
```

6. (Optional) Set up CloudFront for CDN and HTTPS
7. Configure environment variables using AWS Systems Manager Parameter Store or CloudFront Functions

---

## Environment Variables

Your app requires the following environment variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEET_DB_URL` | Your Google Sheets API endpoint | `https://script.google.com/macros/s/ABC123.../exec` |

### Platform-Specific Configuration

- **Vercel/Netlify:** Use the dashboard or CLI to set environment variables
- **GitHub Pages:** Consider using runtime configuration or query parameters
- **AWS:** Use Parameter Store, Secrets Manager, or CloudFront Functions

### Security Note ⚠️

Since this is a client-side application, environment variables will be exposed in the built JavaScript. Consider:

1. Using a backend proxy for sensitive API keys
2. Implementing API authentication/authorization
3. Using CORS restrictions on your Google Apps Script
4. Rate limiting your API endpoints

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
- Ensure your Google Apps Script is deployed as a web app with "Anyone" access
- Check that CORS is properly configured in your Google Apps Script
- Verify the `GOOGLE_SHEET_DB_URL` is correct

### Issue: Dark mode not working

**Solution:**
- Web browsers should respect the `prefers-color-scheme` media query
- Check browser compatibility
- Test with browser DevTools in both light/dark modes

### Issue: Blank page after deployment

**Solution:**
- Check browser console for errors
- Verify all assets loaded correctly (check Network tab)
- Ensure `index.html` is in the root of your output directory
- Check that your hosting platform serves the correct MIME types

### Issue: Routing not working (404 on refresh)

**Solution:**
- Configure your hosting platform to redirect all routes to `index.html`
- For Netlify: Add `netlify.toml` with redirects
- For Vercel: Add `vercel.json` with rewrites
- For S3: Set error document to `index.html`

### Issue: Environment variables not working

**Solution:**
- Rebuild after changing environment variables
- Check that variable names match exactly (case-sensitive)
- For Expo, ensure variables are in `app.config.js` under `extra`
- Access via `expo-constants`: `Constants.expoConfig?.extra?.GOOGLE_SHEET_DB_URL`

### Issue: Large bundle size / slow loading

**Solution:**
- Enable gzip compression on your hosting platform
- Consider code splitting (advanced)
- Optimize images in `assets/` folder
- Use a CDN for static assets

---

## Performance Optimization

### Enable Gzip Compression

Most platforms enable this by default, but verify:

- **Vercel:** Automatic
- **Netlify:** Automatic  
- **GitHub Pages:** Automatic for `.html`, `.css`, `.js` files
- **AWS:** Configure in CloudFront

### Asset Optimization

1. **Images:** Already optimized by Expo's image handling
2. **Fonts:** Preloaded in `app.json`
3. **JavaScript:** Automatically minified during build

### Caching Strategy

Configure cache headers for better performance:

- **HTML:** No cache or short cache (1 hour)
- **JS/CSS/Images:** Long cache (1 year) - Expo handles cache busting with hashes

---

## Custom Domain

### Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify

1. Go to Site Settings > Domain Management
2. Add custom domain
3. Configure DNS with your provider

### GitHub Pages

1. Go to Settings > Pages
2. Add custom domain under "Custom domain"
3. Configure CNAME record with your DNS provider

### AWS

1. Use Route 53 or your DNS provider
2. Point to CloudFront distribution or S3 bucket
3. Configure SSL certificate in ACM

---

## Continuous Deployment

### Setup Automatic Deployments

1. **Vercel/Netlify:** Automatically deploy on Git push
2. **GitHub Pages:** Use GitHub Actions workflow
3. **AWS:** Use CodePipeline or GitHub Actions

### Example GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Web

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build for web
      run: npm run build:web
      env:
        GOOGLE_SHEET_DB_URL: ${{ secrets.GOOGLE_SHEET_DB_URL }}
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './dist'
        production-deploy: true
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Monitoring and Analytics

Consider adding:

- **Google Analytics:** Track user behavior
- **Sentry:** Error tracking and monitoring
- **Vercel Analytics:** Built-in web vitals (for Vercel deployments)
- **Netlify Analytics:** Built-in analytics (for Netlify deployments)

---

## Support

If you encounter issues:

1. Check the [Expo documentation](https://docs.expo.dev/distribution/publishing-websites/)
2. Review platform-specific documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

---

Made with ❤️ for researchers, learners, and knowledge enthusiasts.

