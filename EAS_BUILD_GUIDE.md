# Building Android APK with Firebase Authentication

This guide explains how to build your Research Notebook app as an Android APK with Firebase Authentication properly configured.

## Prerequisites

1. ✅ Firebase project set up (see [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md))
2. ✅ EAS CLI installed: `npm install -g eas-cli`
3. ✅ Expo account created
4. ✅ `.env` file configured locally

## Option 1: Build Using EAS Secrets (Recommended)

This method stores your environment variables securely in EAS without exposing them in `eas.json`.

### Step 1: Login to EAS

```bash
eas login
```

### Step 2: Add Environment Variables to EAS

Run these commands to securely store your Firebase credentials:

```bash
# Google Sheets URL
eas secret:create --scope project --name GOOGLE_SHEET_DB_URL --value "YOUR_GOOGLE_SHEET_URL"

# Firebase credentials
eas secret:create --scope project --name FIREBASE_API_KEY --value "YOUR_API_KEY"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "YOUR_PROJECT.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "YOUR_PROJECT_ID"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "YOUR_PROJECT.appspot.com"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID"
eas secret:create --scope project --name FIREBASE_APP_ID --value "YOUR_APP_ID"
```

### Step 3: Update eas.json to Use Secrets

Replace the `env` sections in `eas.json` with:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

EAS automatically injects secrets as environment variables during the build.

### Step 4: Build the APK

```bash
# For preview/testing build
eas build --platform android --profile preview

# For production build
eas build --platform android --profile production
```

### Step 5: Manage Secrets

```bash
# List all secrets
eas secret:list

# Delete a secret
eas secret:delete --name SECRET_NAME

# Update a secret (delete and recreate)
eas secret:delete --name FIREBASE_API_KEY
eas secret:create --scope project --name FIREBASE_API_KEY --value "NEW_VALUE"
```

## Option 2: Build Using eas.json Environment Variables

⚠️ **Warning**: This method stores credentials in `eas.json`. Make sure this file is in `.gitignore`!

### Step 1: Update eas.json

Edit the `env` sections in `eas.json` with your actual values:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "GOOGLE_SHEET_DB_URL": "https://script.google.com/macros/s/YOUR_ID/exec",
        "FIREBASE_API_KEY": "AIzaSyB...",
        "FIREBASE_AUTH_DOMAIN": "my-project.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "my-project",
        "FIREBASE_STORAGE_BUCKET": "my-project.appspot.com",
        "FIREBASE_MESSAGING_SENDER_ID": "123456789",
        "FIREBASE_APP_ID": "1:123456789:android:abc123"
      }
    }
  }
}
```

### Step 2: Build

```bash
eas build --platform android --profile preview
```

## Option 3: Build Locally (Alternative)

If you don't want to use EAS Cloud builds:

### Step 1: Configure for Local Builds

```bash
eas build:configure
```

### Step 2: Build Locally

```bash
# Install Android SDK and configure
eas build --platform android --profile preview --local
```

Your `.env` file will be used automatically for local builds.

## Verification After Build

### 1. Download and Install APK

After the build completes:
1. Download the APK from the EAS build page
2. Transfer to your Android device
3. Install the APK (enable "Install from unknown sources" if needed)

### 2. Test Authentication

1. Open the app on your device
2. You should see the login screen
3. Enter credentials for a user you created in Firebase Console
4. Login should succeed
5. Main screen should load with your research logs

### 3. Test Offline Persistence

1. Log in while connected to internet
2. Close the app completely
3. Turn off internet/WiFi
4. Open the app again
5. You should still be logged in (thanks to AsyncStorage persistence)

## Troubleshooting APK Builds

### Issue: "Firebase: Error (auth/invalid-api-key)"

**Cause**: Firebase credentials not properly injected into the build.

**Solutions**:
1. Verify secrets are created: `eas secret:list`
2. Make sure secret names match exactly (case-sensitive)
3. Try rebuilding: `eas build --platform android --profile preview --clear-cache`
4. Check build logs for environment variable values (they'll be redacted but you can see if they exist)

### Issue: "GOOGLE_SHEET_DB_URL is not configured"

**Cause**: Google Sheets URL not set in build environment.

**Solution**: Add the secret:
```bash
eas secret:create --scope project --name GOOGLE_SHEET_DB_URL --value "YOUR_URL"
```

### Issue: Build Succeeds but App Shows Login Screen Briefly Then Crashes

**Cause**: Firebase configuration is loaded but invalid.

**Solution**:
1. Double-check all Firebase credentials are correct
2. Verify Firebase project has Email/Password authentication enabled
3. Check that you created at least one user in Firebase Console

### Issue: User Can Login but Research Logs Don't Load

**Cause**: This is likely a Google Sheets issue, not authentication.

**Solution**: See [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md)

## Build Configuration Comparison

| Method | Security | Ease of Use | Best For |
|--------|----------|-------------|----------|
| **EAS Secrets** | ✅ High | ⭐⭐⭐ Easy | Production, Team projects |
| **eas.json env** | ⚠️ Medium | ⭐⭐⭐⭐ Very Easy | Solo projects, Testing |
| **Local Build** | ✅ High | ⭐ Complex | Advanced users |

**Recommendation**: Use **EAS Secrets** for production builds.

## Environment Variables Reference

These environment variables are required for Android APK builds:

### Firebase Authentication
- `FIREBASE_API_KEY` - Your Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Format: `your-project.firebaseapp.com`
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Format: `your-project.appspot.com`
- `FIREBASE_MESSAGING_SENDER_ID` - Your sender ID (numbers)
- `FIREBASE_APP_ID` - Your Firebase app ID

### Google Sheets (Backend)
- `GOOGLE_SHEET_DB_URL` - Your Google Apps Script web app URL

## Testing Before Building

Before creating an APK, test locally:

```bash
# Test on Android emulator/device
npm run android

# Check that:
# 1. Login works
# 2. User stays logged in after app restart
# 3. Research logs load correctly
# 4. Create/Edit/Delete operations work
```

## Build Best Practices

1. **Always test locally first** before building APK
2. **Use EAS Secrets** for sensitive data (production)
3. **Version your builds** - update version in `app.json` before each build
4. **Keep build logs** - they help with troubleshooting
5. **Test on real devices** - not just emulators

## Updating Firebase Credentials

If you need to update credentials after building:

```bash
# Update the secret
eas secret:delete --name FIREBASE_API_KEY
eas secret:create --scope project --name FIREBASE_API_KEY --value "NEW_KEY"

# Rebuild
eas build --platform android --profile production
```

## Cost

- **EAS Free Tier**: 30 builds/month (15 iOS + 15 Android)
- **Build Time**: ~5-15 minutes per build
- **Storage**: APKs are stored for 30 days

## Support

**Build fails?**
1. Check build logs in EAS dashboard
2. Verify all secrets exist: `eas secret:list`
3. Try clearing cache: `--clear-cache` flag
4. Check [EAS Build documentation](https://docs.expo.dev/build/introduction/)

**App works locally but not in APK?**
1. Environment variables might not be properly injected
2. Check Firebase project settings (SHA certificates for Android)
3. Verify Google Sheets URL is accessible from the internet

