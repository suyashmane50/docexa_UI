# Expo EAS Build Reference Guide (Multi-Client React Native App)

This document contains the complete step-by-step process for generating Android APK/AAB builds for the white-label Expo React Native application.

---

# Project Type

* Expo SDK 54
* React Native 0.81
* Expo Router
* Dynamic Client Configuration
* Multi-Clinic White Label App
* EAS Build

---

# Dynamic Client Build

The app uses:

```js
EXPO_PUBLIC_CLIENT_ID
```

Example:

| Client        | ID |
| ------------- | -- |
| Aashay Clinic | 1  |
| Suraj Clinic  | 2  |
| Shree Clinic  | 3  |

---

# IMPORTANT BEFORE BUILD

Always ensure:

* Correct client config exists
* Assets exist:

  * icon
  * splash
  * adaptive icon
  * favicon
* package-lock.json is synced
* npm ci works locally

---

# FULL BUILD PROCESS

# 1. Delete node_modules

```cmd
rmdir /s /q node_modules
```

---

# 2. Delete package-lock.json

```cmd
del package-lock.json
```

---

# 3. Clear npm cache

```cmd
npm cache clean --force
```

---

# 4. Install Expo SDK

```cmd
npm install expo@~54.0.34 --legacy-peer-deps
```

---

# 5. Install dependencies

```cmd
npm install --legacy-peer-deps
```

---

# 6. Install missing dependency fixes

```cmd
npm install @types/react-native@0.72.8 @react-native/virtualized-lists@0.72.8 --legacy-peer-deps
```

---

# 7. Verify npm ci works

VERY IMPORTANT

```cmd
npm ci --include=dev
```

If this command fails:

* EAS Build will fail
* Fix npm/package-lock sync first

---

# 8. Remove old native folders (Optional but recommended)

```cmd
rmdir /s /q android
rmdir /s /q ios
```

---

# 9. Regenerate native folders

```cmd
npx expo prebuild
```

---

# 10. Run Expo Doctor

```cmd
npx expo-doctor
```

Fix any critical errors.

---

# 11. Commit changes

```cmd
git add .
git commit -m "build fixes"
git push
```

---

# 12. Start EAS Android APK Build

## Aashay Clinic

```cmd
npx cross-env NODE_ENV=production EXPO_PUBLIC_CLIENT_ID=1 eas build -p android --profile preview
```

## Suraj Clinic

```cmd
npx cross-env NODE_ENV=production EXPO_PUBLIC_CLIENT_ID=2 eas build -p android --profile preview
```

## Shree Clinic

```cmd
npx cross-env NODE_ENV=production EXPO_PUBLIC_CLIENT_ID=3 eas build -p android --profile preview
```

---

# Build Types

## APK Build (Testing)

Used for:

* internal testing
* direct installation
* sharing APK

Configured in:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

---

## AAB Build (Play Store)

Used for:

* Play Store upload

Configured in:

```json
"production": {
  "android": {
    "buildType": "app-bundle"
  }
}
```

Build command:

```cmd
npx cross-env NODE_ENV=production EXPO_PUBLIC_CLIENT_ID=1 eas build -p android --profile production
```

---

# IMPORTANT WARNINGS

# 1. android/ Folder Exists

If android/ folder exists:

Expo ignores some values from app.config.js:

* icon
* splash
* package
* plugins

To fully apply dynamic config:

```cmd
npx expo prebuild
```

---

# 2. Dynamic Assets

All referenced assets MUST exist.

Example:

```txt
assets/user_specific_data/adaptive_icons/aashay_clinic.png
```

Linux EAS servers are case-sensitive.

---

# 3. npm ci MUST Pass

Always test locally:

```cmd
npm ci --include=dev
```

If this fails:

* EAS Build will fail

---

# 4. Unique Bundle IDs

Each client should have unique package:

Example:

```json
"bundleId": "com.aashayclinic.app"
```

Do NOT reuse same package for multiple clinics.

---

# Useful Commands

# Expo Login

```cmd
eas login
```

---

# Check Logged User

```cmd
eas whoami
```

---

# Configure EAS Project

```cmd
eas build:configure
```

---

# Start Expo

```cmd
npm start
```

---

# Clear Expo Cache

```cmd
npx expo start --clear
```

---

# Fix Expo Dependencies

```cmd
npx expo install --fix
```

---

# Common Errors & Fixes

# Error: npm ci failed

Cause:

* package-lock.json not synced

Fix:

```cmd
npm install --legacy-peer-deps
npm ci --include=dev
```

---

# Error: BuildConfig unresolved

Cause:

* outdated native Android folder

Fix:

```cmd
rmdir /s /q android
npx expo prebuild
```

---

# Error: Cannot access asset file

Cause:

* missing icon/splash/adaptive icon

Fix:

* verify exact file path
* verify lowercase filename

---

# Error: fetch failed

Cause:

* internet/VPN/firewall issue

Fix:

* switch network
* disable VPN
* retry

---

# Recommended Workflow For Future Builds

Whenever app changes:

```cmd
git pull
npm install --legacy-peer-deps
npm ci --include=dev
git add .
git commit -m "changes"
git push
npx cross-env NODE_ENV=production EXPO_PUBLIC_CLIENT_ID=1 eas build -p android --profile preview
```

---

# Final Notes

* Always test npm ci locally before EAS build
* Keep Expo SDK versions aligned
* Keep assets properly maintained
* Use unique bundle IDs per clinic
* Prefer prebuild-generated native folders
