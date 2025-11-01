# EAS Build Guide for Research Notebook

This guide will help you build your Research Notebook app for Android using EAS (Expo Application Services).

## Prerequisites

1. **Expo Account**: You need an Expo account. Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Google Sheet Setup**: Make sure your Google Sheet backend is configured and working

## Initial Setup (One-Time)

### 1. Login to EAS
```bash
eas login
```
Enter your Expo credentials.

### 2. Configure the Project
The project is already configured with:
- ✅ EAS project ID in `app.config.js`
- ✅ `eas.json` with build profiles
- ✅ Android package name: `com.basil.myresearchnotebook`
- ✅ Build scripts in `package.json`

### 3. Environment Variables (IMPORTANT!)

Your app needs the `GOOGLE_SHEET_DB_URL` to work. Set it up in EAS:

```bash
eas secret:create --scope project --name GOOGLE_SHEET_DB_URL --value "your_google_sheet_url_here"
```

Replace `your_google_sheet_url_here` with your actual Google Apps Script deployment URL.

**To verify it was set:**
```bash
eas secret:list
```

## Building for Android

### Build Profiles

We have three build profiles configured:

#### 1. Preview Build (Recommended for Testing)
Generates an APK you can install directly on your device:

```bash
npm run build:android:preview
```

Or:
```bash
eas build --platform android --profile preview
```

**When to use:**
- Testing the app before production
- Sharing with testers
- Quick iterations

#### 2. Production Build
Generates an APK optimized for release:

```bash
npm run build:android:production
```

Or:
```bash
eas build --platform android --profile production
```

**When to use:**
- Final release build
- Uploading to Google Play Store (you'll need AAB format - see below)

#### 3. Development Build
For development with Expo Dev Client:

```bash
eas build --platform android --profile development
```

## Build Process

### Step-by-Step

1. **Start the build:**
   ```bash
   npm run build:android:preview
   ```

2. **Monitor progress:**
   - The build runs on EAS servers
   - You'll see a URL to track progress
   - Example: `https://expo.dev/accounts/[username]/projects/[project]/builds/[id]`

3. **Wait for completion:**
   - Builds typically take 5-15 minutes
   - You'll get an email notification when done

4. **Download your APK:**
   - Click the link in the email
   - Or visit: `https://expo.dev/accounts/[username]/projects/MyResearchNotebook/builds`
   - Download the APK file

5. **Install on Android:**
   - Transfer APK to your phone
   - Enable "Install from Unknown Sources" in Android settings
   - Tap the APK to install

## Google Play Store Release

For Google Play Store, you need an AAB (Android App Bundle) instead of APK.

### Update `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Build AAB:
```bash
eas build --platform android --profile production
```

### Submit to Play Store:
```bash
eas submit --platform android
```

You'll need:
- Google Play Developer account ($25 one-time fee)
- Service account JSON key (for automated submission)

## Troubleshooting

### Build Fails

**Check environment variables:**
```bash
eas secret:list
```

**View build logs:**
Click the build URL or:
```bash
eas build:list
```

### App Crashes on Start

**Check Google Sheet URL:**
- Make sure `GOOGLE_SHEET_DB_URL` secret is set correctly
- Verify your Google Apps Script is deployed and accessible

**Check permissions:**
- Android requires INTERNET permission (already added in app.json)

### Cannot Install APK

**Enable Unknown Sources:**
1. Go to Android Settings
2. Security → Install Unknown Apps
3. Enable for your file manager/browser

### Update Build Version

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Update this
    "android": {
      "versionCode": 2   // Increment this
    }
  }
}
```

## Build Commands Reference

```bash
# Preview build (APK)
npm run build:android:preview
eas build --platform android --profile preview

# Production build (APK)
npm run build:android:production
eas build --platform android --profile production

# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Check build status
eas build:list --status=in-progress

# Cancel a build
eas build:cancel [build-id]
```

## Environment Variables in Builds

EAS automatically injects secrets into the build process:

**Set a secret:**
```bash
eas secret:create --scope project --name SECRET_NAME --value "secret_value"
```

**List secrets:**
```bash
eas secret:list
```

**Delete a secret:**
```bash
eas secret:delete --name SECRET_NAME
```

**In your app, secrets are accessed via:**
```javascript
import Constants from 'expo-constants';
const value = Constants.expoConfig?.extra?.SECRET_NAME;
```

## Important Files

- **`eas.json`**: Build configuration profiles
- **`app.json`**: App metadata and configuration
- **`app.config.js`**: Dynamic config (loads env vars)
- **`.easignore`**: Files to exclude from builds

## Cost

EAS builds are free for:
- Personal Expo accounts: Limited builds per month
- Pro accounts: More builds

Check current limits at [expo.dev/pricing](https://expo.dev/pricing)

## Best Practices

1. **Use Preview for Testing**
   - Always test with preview builds first
   - Only use production when ready to release

2. **Version Management**
   - Increment `versionCode` for every build
   - Update `version` for user-visible releases

3. **Environment Variables**
   - Never commit secrets to git
   - Use EAS secrets for sensitive data

4. **Build Locally** (Alternative)
   ```bash
   eas build --platform android --local
   ```
   Requires Android SDK installed locally

## Next Steps

1. Set up your Google Sheet URL secret
2. Run a preview build
3. Test on your Android device
4. Fix any issues
5. Build production version when ready

## Support

- EAS Documentation: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
- GitHub Issues: https://github.com/expo/expo

---

Happy Building! 🚀

