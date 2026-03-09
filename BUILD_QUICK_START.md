# 🚀 Quick Start: Build Android APK

## Fastest Way (3 Steps)

### 1. Run Build Script
```powershell
cd "g:\Qurbani Mobile"
.\build-apk.ps1
```

### 2. Login to Expo
- If you don't have an account: https://expo.dev/signup (free)
- The script will prompt you to login

### 3. Wait for Build
- ⏱️ Takes 10-20 minutes
- ☁️ Builds in the cloud (no Android Studio needed)
- 📥 Download APK when ready

---

## Manual Build (Alternative)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build -p android --profile preview

# Download APK from link provided
```

---

## Install APK on Phone

1. Download APK file to your computer
2. Transfer to phone (USB, email, cloud storage)
3. Open APK file on phone
4. Allow "Install from Unknown Sources" if prompted
5. Install and launch app

---

## Test Login

**Credentials:**
- Phone: `123456`
- Passport: `123456`

**Expected:**
- ✅ Login successful
- ✅ Dashboard loads
- ✅ Shows user "alkhaleej"
- ✅ Group members visible

---

## Files Created

- ✅ `eas.json` - Build configuration
- ✅ `build-apk.ps1` - Automated build script
- ✅ `BUILD_APK_GUIDE.md` - Complete documentation
- ✅ `app.json` - Updated with versionCode and permissions

---

## Troubleshooting

### Build Fails
- Check `app.json` has valid package name
- Ensure you're logged in: `eas whoami`
- View build logs at: https://expo.dev

### Network Error in APK
- Verify ngrok URL is active
- Check `src/config/api.js` has correct URL
- Test API: Run `node __tests__\auth.test.js`

### Can't Install APK
- Enable "Install from Unknown Sources" in phone settings
- Ensure APK downloaded completely (not corrupted)

---

## Need Help?

📖 Full Guide: See `BUILD_APK_GUIDE.md`
🌐 Expo Docs: https://docs.expo.dev/build/introduction/
💬 Support: https://forums.expo.dev/

---

**Ready to build?** Run: `.\build-apk.ps1`
