# My Research Notebook 📚

A beautiful, intuitive mobile application for tracking your daily research, learning, and personal development. Built with React Native and Expo, this app helps you maintain a structured log of your intellectual journey.

# TODO:

1. Fix env variable errors for Expo Go android version
2. Deploy to prod
3. Rebuild app for android using EAS
4. Add auth
5. Add Advance Search feature across all posts

## Features ✨

### Core Functionality
- **🔐 Firebase Authentication**: Secure login/logout with Firebase (free forever for small teams)
- **Daily Research Logs**: Document your daily activities with 8 comprehensive fields
- **CRUD Operations**: Create, Read, Update, and Delete research logs
- **Google Sheets Integration**: Your data is stored in Google Sheets for easy access and export

### User Experience (NEW!)
- **🎯 Multi-Step Full-Screen Form**: Beautiful step-by-step form with progress indicator, full-screen text fields, and loading states
- **🔗 Smart URL Handling**: Automatically detects and condenses URLs to `[1]`, `[2]` format - clickable and clean
- **♾️ Lazy Loading**: Infinite scroll that loads 10 items at a time for optimal performance
- **🎨 Smart Filtering**: Quick filters (Last 7 Days, This Month, Last Month) + custom date ranges
- **🌙 Dark Mode**: Automatically adapts to your device's theme
- **🔄 Pull to Refresh**: Easily sync your data from Google Sheets
- **📱 Responsive UI**: Beautiful, modern interface optimized for mobile
- **💻 Web Layout**: Centered 800px max-width design for optimal viewing on wide screens (web only)

## Research Log Fields 📝

Each log entry can contain:

1. **What I plan to read today?** - Set your reading intentions
2. **What did I read today?** - Track your reading progress
3. **What did I learn today?** - Capture key learnings
4. **What new things did I think of today?** - Record new ideas and insights
5. **What did I code/implement today?** - Document your development work
6. **What did I write today? Or, what did I teach others?** - Track your knowledge sharing
7. **What are some things I should try tomorrow?** - Plan your next steps

## Platform Support 📱💻

This app works on:
- **iOS** - Native mobile app
- **Android** - Native mobile app  
- **Web** - Progressive Web App (PWA)

### Web Deployment 🌐
Your Research Notebook can be deployed as a web app with a built-in **Express proxy server** to avoid CORS issues!

**Quick Start:**
```bash
npm install           # Install dependencies (including Express)
npm run server        # Run proxy server locally (port 3000)
npm run build:web     # Build web app for production
vercel --prod         # Deploy to Vercel
```

**Deploy to Vercel:**
- 🔷 **Vercel** (recommended) - Full Express server deployment

**About the CORS Proxy:**
Since browsers block direct requests to Google Sheets, we've added an Express proxy server that:
- ✅ Handles CORS for web browsers automatically
- ✅ Only used by web (mobile apps connect directly to Google Sheets)
- ✅ Runs as a proper Node.js server on Vercel
- ✅ Includes health check and debugging endpoints

**Documentation:**
- 📘 **[PROXY_README.md](./PROXY_README.md)** - Start here! Index of all proxy documentation
- 🚀 **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- 📖 **[PROXY_DEPLOYMENT.md](./PROXY_DEPLOYMENT.md)** - Complete deployment guide
- 🔧 **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables guide
- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- 🎨 **[WEB_LAYOUT_GUIDE.md](./WEB_LAYOUT_GUIDE.md)** - Responsive web layout customization

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- A Google Sheet setup with proper API access

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd MyResearchNotebook
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
# Google Sheets
GOOGLE_SHEET_DB_URL=your_google_sheet_api_url_here

# Firebase Authentication
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

See [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) for detailed setup instructions.

4. Start the development server:
```bash
npm start
```

5. Run on your device:
   - **iOS:** `npm run ios`
   - **Android:** `npm run android`
   - **Web:** `npm run web`
   - **Mobile (Expo Go):** Scan the QR code with Expo Go app

## Authentication Setup 🔐

This app uses **Firebase Authentication** for secure login/logout. See [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) for complete setup instructions.

**Quick Setup:**
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Add your Firebase config to `.env` file
4. Manually add 2-3 users in Firebase Console
5. Users can now log in with their email and password

**Free Tier:** Firebase's free tier supports 50,000 monthly active users - perfect for personal or small team use!

## Google Sheets Setup 📊

Your Google Sheet should have the following columns (headers in the first row):

- `id` - Unique identifier (UUID)
- `created_by` - Author's email (automatically set from logged-in user)
- `date` - Date of the log (YYYY-MM-DD format)
- `plan_to_read` - Reading plans
- `did_read` - What was read
- `learned_today` - Learning notes
- `new_thoughts` - New ideas
- `coded_today` - Coding/implementation notes
- `wrote_or_taught` - Writing or teaching notes
- `try_tomorrow` - Tomorrow's plans
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Setting Up Google Sheets API

You'll need to create a Google Apps Script or use Google Sheets API to handle CRUD operations. The expected endpoints are:

- **GET** `GOOGLE_SHEET_DB_URL` - Fetch all logs
- **POST** `GOOGLE_SHEET_DB_URL` - Create a new log
- **PUT** `GOOGLE_SHEET_DB_URL?id={id}` - Update a log
- **DELETE** `GOOGLE_SHEET_DB_URL?id={id}` - Delete a log

Example Google Apps Script can be deployed as a web app to provide these endpoints.

## Project Structure 📁

```
MyResearchNotebook/
├── app/                      # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx        # Main screen with log list
│   │   └── explore.tsx      # About/Help screen
│   └── _layout.tsx
├── components/              # React components
│   ├── research-log-form.tsx      # Form for creating/editing logs
│   ├── research-log-list.tsx      # List view with scroll and delete
│   └── research-log-filter.tsx    # Filter modal
├── services/               # API services
│   └── research-log-service.ts    # Google Sheets integration
├── types/                  # TypeScript type definitions
│   └── research-log.ts
├── assets/                 # Images and static files
└── constants/              # App constants and themes
```

## Technologies Used 🛠️

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **uuid** - Unique ID generation
- **expo-constants** - Environment variables

### Backend (Proxy Server)
- **Express** - Web server framework
- **CORS** - Cross-origin resource sharing middleware
- **Node.js** - JavaScript runtime
- **Vercel** - Deployment platform

## Usage Guide 📱

### Creating a Log

1. Tap the **"+ New Log"** button on the home screen
2. Fill in any fields you want (all fields are optional)
3. Tap **"Create"** to save your log

### Editing a Log

1. Find the log you want to edit in the list
2. Tap the **"Edit"** button on the log card
3. Make your changes
4. Tap **"Update"** to save

### Deleting a Log

1. Find the log you want to delete
2. Tap the **"Delete"** button
3. Confirm the deletion in the popup

### Filtering Logs

1. Tap the **🔍** filter icon in the header
2. Choose a quick filter or enter custom dates
3. Tap **"Apply"** to filter the list
4. Tap **"Clear"** to remove filters

### Refreshing Data

Pull down on the log list to refresh and sync with your Google Sheet database.

## Development 💻

### Running in Development Mode

**Mobile/Web App:**
```bash
npm start       # Start Expo dev server
npm run web     # Start web version
```

**Proxy Server (for web):**
```bash
npm run server      # Run proxy server
npm run server:dev  # Run with auto-reload
```

**Test Proxy:**
```bash
./test-proxy.sh http://localhost:3000
```

### Building for Production

```bash
# For Android
eas build --platform android --profile production

# For iOS
eas build --platform ios --profile production

# For Web
npm run build:web
```

## 🚀 Deploying to Vercel

Deploy both the **Expo web app** and **Express proxy server** to Vercel in a single project:

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Google Sheets Setup**: Complete [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) first
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

### Quick Deployment

#### Option A: Deploy via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to preview
vercel

# 4. Add environment variable
vercel env add GOOGLE_SHEET_DB_URL
# Paste your Google Sheets Web App URL when prompted
# Select: Production, Preview, and Development

# 5. Deploy to production
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

#### Option B: Deploy via Vercel Dashboard

1. **Import Your Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"**
   - Select your repository and click **Import**

2. **Configure Build Settings**
   
   Vercel auto-detects the configuration from `vercel.json`, but verify:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add variable:
     - **Name:** `GOOGLE_SHEET_DB_URL`
     - **Value:** Your Google Sheets Web App URL (from Apps Script)
   - Select **all environments** (Production, Preview, Development)

4. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for the build to complete
   - Your app will be live!

### What Gets Deployed

Your Vercel deployment includes:

```
your-app.vercel.app/
├── /                    → Expo Web App (React)
├── /health             → Express Health Check
└── /api/proxy          → Express Proxy (handles Google Sheets)
```

**Architecture:**
- **Frontend:** Static Expo web build served from `dist/`
- **Backend:** Express server running as serverless function
- **Routing:** Configured in `vercel.json`
- **CORS:** Handled by Express middleware

### Verify Deployment

1. **Check Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "environment": "production"
   }
   ```

2. **Test the Web App:**
   - Visit `https://your-app.vercel.app`
   - Try creating a research log
   - Verify data appears in your Google Sheet

### Updating Your Deployment

**Automatic Deployment:**
```bash
git add .
git commit -m "Update app"
git push
```
Vercel automatically redeploys on push!

**Manual Deployment:**
```bash
vercel --prod
```

### Environment Variables Management

**Add a variable:**
```bash
vercel env add VARIABLE_NAME
```

**List variables:**
```bash
vercel env ls
```

**Remove a variable:**
```bash
vercel env rm VARIABLE_NAME
```

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

### Troubleshooting Deployment

#### Build Fails

**Check logs:**
```bash
vercel logs <deployment-url>
```

**Common issues:**
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Fix with `npm run lint`
- Environment variables: Make sure they're set in Vercel

#### App Deployed But Not Working

**Test the proxy:**
```bash
curl https://your-app.vercel.app/health
```

**Check environment variables:**
```bash
vercel env ls
```

**View function logs:**
- Go to Vercel Dashboard → Your Project → Deployments
- Click on latest deployment → Functions tab

#### CORS Errors Still Appearing

1. Verify proxy is working: `curl https://your-app.vercel.app/health`
2. Check browser console for the actual API URL being used
3. Verify `GOOGLE_SHEET_DB_URL` is set correctly
4. Redeploy: `vercel --prod`

### Mobile Apps (iOS/Android)

Mobile apps connect **directly** to Google Sheets (no proxy needed):
- Build and deploy separately using EAS
- No Vercel deployment required for mobile
- See `eas.json` for build configurations

### Deployment Checklist

Before deploying:
- [ ] Google Sheets Web App is set up and deployed
- [ ] `.env` file has `GOOGLE_SHEET_DB_URL` for local testing
- [ ] Tested locally: `npm run server` and `npm run web`
- [ ] Committed all changes to Git
- [ ] Pushed to GitHub/GitLab/Bitbucket

After deploying:
- [ ] Health endpoint works: `/health`
- [ ] Can view logs in the web app
- [ ] Can create a new log
- [ ] Can edit a log
- [ ] Can delete a log
- [ ] Data persists in Google Sheets

### Monitoring & Logs

**View logs:**
```bash
vercel logs
vercel logs --follow  # Real-time
```

**Check deployment status:**
```bash
vercel ls
```

**View specific deployment:**
```bash
vercel inspect <deployment-url>
```

### Performance Tips

1. **Enable Caching:** Already configured in `vercel.json`
2. **Monitor Usage:** Check Vercel Dashboard → Analytics
3. **Optimize Images:** Use Expo's image optimization
4. **Set up Monitoring:** Add services like Sentry (optional)

### Cost

**Vercel Free Tier includes:**
- ✅ 100 GB bandwidth/month
- ✅ Serverless function executions
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains

**Typical usage for personal project:** Well within free tier limits

### Additional Resources

For detailed guides:
- **[PROXY_DEPLOYMENT.md](./PROXY_DEPLOYMENT.md)** - Complete proxy server deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute local setup
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design

### Support

**Issues with deployment?**
1. Check logs: `vercel logs`
2. Review [PROXY_DEPLOYMENT.md](./PROXY_DEPLOYMENT.md#troubleshooting)
3. Test locally first: `npm run server` + `npm run web`
4. Verify environment variables are set

---

**🎉 Once deployed, your Research Notebook is accessible from anywhere at your Vercel URL!**

---

### Linting

```bash
npm run lint
```

## Environment Variables 🔐

Create a `.env` file in the root directory (see `.env.example`):

```bash
# Google Sheets Configuration
GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Firebase Authentication Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Important:** Never commit your `.env` file to version control!

For detailed setup instructions:
- Firebase Auth: [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md)
- Google Sheets: [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open source and available under the MIT License.

## Support 💬

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Acknowledgments 🙏

- Built with [Expo](https://expo.dev/)
- Icons from [SF Symbols](https://developer.apple.com/sf-symbols/)
- Inspired by the need for better research tracking and personal development tools

---

Made with ❤️ for researchers, learners, and knowledge enthusiasts.
