# Android APK Build Guide

## Quick Build (Recommended - EAS Build)

### Prerequisites

1. **Expo Account** (Free)
   - Sign up at https://expo.dev/signup

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Login to Expo**
   ```bash
   eas login
   ```

---

## Method 1: EAS Build (Recommended)

### Step 1: Configure Project

```bash
cd "g:\Qurbani Mobile"
eas build:configure
```

This creates `eas.json` configuration file.

---

### Step 2: Update app.json

Make sure your `app.json` has the required Android configuration:

```json
{
  "expo": {
    "name": "Qurbani Mate",
    "slug": "qurbani-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.qurbani",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

### Step 3: Build APK

**For Development/Testing (No Google Play Store):**
```bash
eas build -p android --profile preview
```

**For Production/Google Play:**
```bash
eas build -p android --profile production
```

**Build Process:**
- ⏱️ Takes 10-20 minutes
- ☁️ Builds in cloud (no Android Studio needed)
- 📱 Downloads APK when complete

---

### Step 4: Download APK

After build completes:
1. Click the download link in terminal
2. Or go to https://expo.dev/accounts/[your-account]/projects/qurbani-mobile/builds
3. Download the `.apk` file

---

### Step 5: Install on Android Device

**Option A: Direct Install**
1. Transfer APK to phone via USB/email/cloud
2. Open APK on phone
3. Allow "Install from Unknown Sources"
4. Install app

**Option B: Share Link**
- EAS provides a shareable URL
- Send to testers
- They scan QR code to download

---

## Method 2: Local Build (Requires Android Studio)

### Prerequisites

1. **Install Android Studio**
   - Download from https://developer.android.com/studio

2. **Set Environment Variables**
   ```powershell
   $env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   $env:PATH += ";$env:ANDROID_HOME\tools"
   ```

---

### Build Steps

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Generate Android project
npx expo prebuild

# Build APK
cd android
.\gradlew assembleRelease

# APK Location
# android\app\build\outputs\apk\release\app-release.apk
```

---

## Configuration Files

### Create eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Update app.json (Complete Example)

```json
{
  "expo": {
    "name": "Qurbani Management",
    "slug": "qurbani-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.qurbani"
    },
    "android": {
      "package": "com.yourcompany.qurbani",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "INTERNET"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## Build Commands Reference

### EAS Build Commands

```bash
# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build APK (for testing)
eas build -p android --profile preview

# Build AAB (for Google Play)
eas build -p android --profile production

# Check build status
eas build:list

# Download specific build
eas build:download --id [build-id]
```

---

## Testing the APK

### Before Building

**Test API Connection:**
```bash
cd "g:\Qurbani Mobile"
node __tests__\auth.test.js
```

**Test in Expo Go:**
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

### After Installing APK

**Test Checklist:**
- ✅ App opens without crashing
- ✅ Login screen displays correctly
- ✅ Can login with test credentials (123456 / 123456)
- ✅ Dashboard loads data
- ✅ Group members screen works
- ✅ API calls succeed (check ngrok URL is accessible)

---

## Troubleshooting

### "No Android SDK found"

**Solution:**
```bash
# Install Android Studio first
# Then set environment variables
$env:ANDROID_HOME = "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
```

---

### "Build failed: Invalid package name"

**Solution:**
Update `app.json`:
```json
"android": {
  "package": "com.yourcompany.qurbani"
}
```
Package name must:
- Use reverse domain notation
- Contain only letters, numbers, underscores
- Start with lowercase letter

---

### "expo-notifications build error"

**Solution:**
Remove or configure expo-notifications properly. For now, you can remove it:
```bash
npm uninstall expo-notifications
```

Then update code to remove notification imports.

---

### "Network error in APK"

**Solution:**
1. Verify ngrok URL is active
2. Check API_BASE_URL in `src/config/api.js`
3. Test API manually:
   ```bash
   curl https://ingrained-unserved-irmgard.ngrok-free.dev/api/health
   ```

---

### "App crashes on launch"

**Solution:**
1. Build development version first:
   ```bash
   eas build -p android --profile development
   ```
2. Check logs with React Native Debugger
3. Test in Expo Go first to identify issues

---

## Distribution Options

### Option 1: Direct APK Distribution
- ✅ Quick testing
- ✅ No store approval needed
- ✅ Works immediately
- ❌ Users must enable "Unknown Sources"
- ❌ No automatic updates

**Best for:** Internal testing, beta testers

---

### Option 2: Google Play Store
- ✅ Professional distribution
- ✅ Automatic updates
- ✅ Trusted installation
- ❌ Requires Google Play Developer account ($25 one-time)
- ❌ App review process (1-7 days)

**Best for:** Public release, production apps

---

### Option 3: Internal App Sharing (Google Play)
- ✅ Fast testing (no review)
- ✅ Up to 100 testers
- ✅ Delivered via Play Store
- ❌ Requires Play Developer account

**Best for:** Team testing before public release

---

## Complete Build Workflow

### 1. Prepare
```bash
cd "g:\Qurbani Mobile"

# Install dependencies
npm install

# Test locally
npx expo start

# Run automated tests
node __tests__\auth.test.js
```

---

### 2. Configure
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

---

### 3. Build
```bash
# Build APK for testing
eas build -p android --profile preview

# Wait for build to complete (10-20 minutes)
```

---

### 4. Download & Install
```bash
# Download from link provided
# Or visit: https://expo.dev/accounts/[account]/projects/qurbani-mobile/builds

# Transfer to Android device
# Install APK
```

---

### 5. Test & Iterate
- Test all features
- Fix bugs
- Update version number in app.json
- Rebuild and redistribute

---

## Version Management

### Update Version for New Build

**app.json:**
```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "android": {
      "versionCode": 2   // Increment for each build
    }
  }
}
```

**Version Code Rules:**
- Must increment with each build
- Cannot decrease
- Used by Android to determine newer versions

---

## Build Sizes

| Build Type | Size | Description |
|------------|------|-------------|
| Development | ~50-80 MB | Includes dev tools, debugging |
| Preview APK | ~30-50 MB | Optimized, no dev tools |
| Production AAB | ~20-30 MB | Most optimized, for Play Store |

---

## Quick Reference

### Fastest Path to APK

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure (first time only)
eas build:configure

# 4. Build APK
eas build -p android --profile preview

# 5. Download from link when ready
```

**Time:** ~20 minutes total (mostly waiting for cloud build)

---

## Next Steps

After building APK:

1. **Test thoroughly** on real devices
2. **Gather feedback** from beta testers
3. **Fix bugs** and improve UX
4. **Update version** and rebuild
5. **Submit to Play Store** when ready

---

## Helpful Resources

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Android Publishing:** https://docs.expo.dev/submit/android/
- **App Signing:** https://docs.expo.dev/app-signing/app-credentials/
- **Expo Forums:** https://forums.expo.dev/

---

## Summary

**Recommended approach:**
1. Use **EAS Build** (easiest, no Android Studio needed)
2. Start with **preview profile** (APK for testing)
3. Test on real devices
4. Move to **production profile** (AAB for Play Store) when ready

**Commands to run NOW:**
```bash
npm install -g eas-cli
eas login
cd "g:\Qurbani Mobile"
eas build:configure
eas build -p android --profile preview
```

Then wait ~15 minutes and download your APK! 🚀
