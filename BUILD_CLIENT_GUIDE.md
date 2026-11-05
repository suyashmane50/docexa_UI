# Complete Guide: Building Separate Clients with Different Package Names + OTA Updates

## Overview

This guide shows you how to build the **same React Native codebase** for **100+ clients**, where each client gets:
- ✅ **Unique package name** (Android) / **Bundle ID** (iOS)
- ✅ **Unique app name** on App Store / Play Store
- ✅ **Unique logos and icons**
- ✅ **Separate App Store listings**
- ✅ **OTA Updates** - Update all clients automatically without rebuilding!

## 🚀 Key Feature: OTA Updates (Over-The-Air)

### **YES! You Can Update All Clients Automatically!**

**The Problem You Asked About:**
> "If I deploy for 10 clients, then add a new feature, do I need to rebuild for all 10 clients?"

**The Answer: NO!** ✅

With **Expo Updates (OTA)**, you can:
1. ✅ Deploy each client **once** to App Store/Play Store
2. ✅ Add new features to your code
3. ✅ Run **one command**: `npm run update:publish`
4. ✅ **All 100+ deployed clients get the update automatically!**

**No rebuild needed! No app store resubmission needed!**

### How It Works

```
Your Code Changes
      ↓
npm run update:publish
      ↓
Expo Updates Server
      ↓
All Deployed Apps (100+ clients)
      ↓
Users Get Update Automatically
```

**Update Timeline:**
- Update published: **5-15 minutes**
- Users receive: **Within hours** (when they open app)
- **No user action required** - completely automatic!

### What Can Be Updated via OTA?

✅ **JavaScript/TypeScript code** (all app logic)  
✅ **React components** (UI, screens, features)  
✅ **Styling** (colors, themes, CSS)  
✅ **Business logic** (API calls, Redux, state)  
✅ **New screens/routes**  
✅ **Bug fixes**  
✅ **Assets** (images, fonts - if not native)  

❌ **Cannot Update (Requires Rebuild):**
- Native code changes
- New native dependencies
- App icon/splash screen changes
- Bundle ID/package name changes
- New permissions

**Bottom Line:** 95% of your updates can be done via OTA without rebuilding!

---

## Quick Start: OTA Updates

### Step 1: Get Your Expo Project ID

```bash
# Login to Expo
eas login

# Get your project ID (shown after login or in expo.dev dashboard)
# Or create project:
eas project:init
```

### Step 2: Set Project ID (One Time)

```bash
# Set environment variable
export EXPO_PROJECT_ID="your-project-id-here"

# Or add to .env file:
echo "EXPO_PROJECT_ID=your-project-id" >> .env
```

### Step 3: Publish Updates

```bash
# After making code changes
npm run update:publish
```

**That's it!** All deployed clients receive the update automatically.

---

## Detailed OTA Update Guide

See the **"OTA Updates (Over-The-Air)"** section below for complete instructions.

---

## Prerequisites (One-Time Setup)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

```bash
eas build:configure
```

This creates `eas.json` (already created for you).

---

## Adding a New Client - Complete Step-by-Step

### Step 1: Add Client Configuration

Open `config/clients.json` and add a new client entry:

```json
{
  "clientId": "client-003",
  "clientName": "New Healthcare",
  "appName": "New Health App",
  "appSlug": "new-health-app",
  "bundleId": "com.newhealth.app",
  "packageName": "com.newhealth.app",
  "scheme": "newhealth",
  "colors": {
    "primary": "#FF5733",
    "secondary": "#33FF57",
    "accent": "#3357FF"
  },
  "assets": {
    "icon": "./assets/clients/client-003/icon.png",
    "splash": "./assets/clients/client-003/splash.png",
    "adaptiveIcon": "./assets/clients/client-003/adaptive-icon.png",
    "favicon": "./assets/clients/client-003/favicon.png"
  },
  "appStore": {
    "ios": {
      "bundleIdentifier": "com.newhealth.app",
      "displayName": "New Health App"
    },
    "android": {
      "package": "com.newhealth.app",
      "applicationLabel": "New Health App"
    }
  }
}
```

**Important Fields:**
- `clientId`: Unique identifier (e.g., "client-003")
- `bundleId`: iOS Bundle ID (must be unique, format: `com.companyname.app`)
- `packageName`: Android Package (must be unique, lowercase, no spaces)
- `appName`: Name shown on App Store / Play Store
- `scheme`: URL scheme for deep linking

### Step 2: Create Asset Directories

```bash
npm run setup:client client-003
```

This creates:
```
assets/clients/client-003/
├── icon.png
├── splash.png
├── adaptive-icon.png
└── favicon.png
```

### Step 3: Add Client Assets

Place these files in `assets/clients/client-003/`:

#### Required Assets:

1. **icon.png**
   - Size: **1024x1024 pixels**
   - Format: PNG
   - No transparency
   - Square image
   - Used for: iOS & Android app icon

2. **splash.png**
   - Size: **1242x2436 pixels** (or match your design)
   - Format: PNG
   - Used for: Splash screen on app launch

3. **adaptive-icon.png**
   - Size: **1024x1024 pixels**
   - Format: PNG
   - Important: Keep content in center 66% (safe zone)
   - Used for: Android adaptive icon

4. **favicon.png**
   - Size: **48x48 pixels** (or larger)
   - Format: PNG
   - Used for: Web favicon

**Asset Tips:**
- Use design tools: Figma, Sketch, Photoshop
- Ensure icons are high quality
- Test icons on different backgrounds
- Keep important content in center for adaptive icons

### Step 4: Generate App Configuration

```bash
npm run config:client client-003
```

This:
- Reads `config/clients.json`
- Generates `app.json` with client-specific settings
- Sets bundle ID, package name, app name, assets

**Verify:** Check `app.json` to confirm it has the correct client settings.

### Step 5: Build for Client

#### Build for iOS:
```bash
npm run build:client client-003 ios
```

#### Build for Android:
```bash
npm run build:client client-003 android
```

#### Build for Both Platforms:
```bash
npm run build:client client-003 all
```

**What happens:**
1. Script generates `app.json` for the client
2. Verifies assets exist
3. Runs `eas build` with client configuration
4. Creates build with unique bundle ID/package name
5. Build is uploaded to EAS servers

**Build Time:** 15-30 minutes per platform

### Step 6: Download Build

After build completes:

1. **Check EAS Dashboard:**
   ```bash
   # Open in browser
   https://expo.dev/accounts/[your-account]/builds
   ```

2. **Or use CLI:**
   ```bash
   eas build:list
   ```

3. **Download build:**
   - iOS: `.ipa` file
   - Android: `.apk` or `.aab` file

---

## Deploying to App Stores

### iOS - App Store Connect

#### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform:** iOS
   - **Name:** "New Health App" (from config)
   - **Primary Language:** Your language
   - **Bundle ID:** `com.newhealth.app` (from config)
   - **SKU:** Unique identifier (e.g., "newhealth-001")
   - **User Access:** Full Access

#### Step 2: Upload Build

**Option A: Using EAS Submit (Recommended)**
```bash
eas submit --platform ios
```

**Option B: Manual Upload**
1. Download `.ipa` from EAS
2. Use **Transporter** app (Mac) or **Xcode**
3. Upload to App Store Connect

#### Step 3: Configure App Information

1. **App Information:**
   - App name, subtitle, category
   - Privacy policy URL
   - Support URL

2. **Pricing and Availability:**
   - Price tier
   - Availability countries

3. **App Store Listing:**
   - Description
   - Keywords
   - Screenshots (required)
   - App preview videos (optional)
   - App icon (1024x1024)

4. **Version Information:**
   - What's New (release notes)
   - Marketing URL (optional)
   - Promotional text (optional)

#### Step 4: Submit for Review

1. Go to **"App Store"** tab
2. Click **"+"** next to version
3. Select build from list
4. Complete all required information
5. Click **"Submit for Review"**

**Review Time:** 1-3 days typically

---

### Android - Google Play Console

#### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name:** "New Health App" (from config)
   - **Default language:** Your language
   - **App or game:** App
   - **Free or paid:** Your choice
   - **Declarations:** Accept terms

#### Step 2: Upload Build

**Option A: Using EAS Submit (Recommended)**
```bash
eas submit --platform android
```

**Option B: Manual Upload**
1. Download `.aab` (recommended) or `.apk` from EAS
2. Go to Play Console → **"Production"** → **"Create new release"**
3. Upload `.aab` file
4. Add release notes
5. Click **"Save"** → **"Review release"**

#### Step 3: Complete Store Listing

1. **Main store listing:**
   - App name, short description, full description
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (phone, tablet)
   - Promotional video (optional)

2. **Content rating:**
   - Complete questionnaire
   - Get rating certificate

3. **Privacy policy:**
   - Add privacy policy URL (required)

4. **App access:**
   - Configure if app is restricted

#### Step 4: Submit for Review

1. Complete all required sections
2. Go to **"Production"** → **"Review release"**
3. Click **"Start rollout to Production"**

**Review Time:** 1-7 days typically

---

## Building Multiple Clients

### Build All Clients at Once

```bash
# Build all clients for iOS
npm run build:all ios

# Build all clients for Android
npm run build:all android

# Build all clients for both platforms
npm run build:all all
```

**Note:** This will take time (15-30 min × number of clients × platforms)

---

## File Structure

```
project-root/
├── config/
│   └── clients.json              # All client configurations
├── assets/
│   └── clients/
│       ├── client-001/           # Client 1 assets
│       │   ├── icon.png
│       │   ├── splash.png
│       │   ├── adaptive-icon.png
│       │   └── favicon.png
│       ├── client-002/           # Client 2 assets
│       └── client-003/           # Client 3 assets
├── scripts/
│   ├── generate-app-config.js    # Generate app.json
│   ├── build-client.js           # Build single client
│   ├── build-all-clients.js      # Build all clients
│   └── setup-client-assets.js    # Setup asset directories
├── eas.json                      # EAS build configuration
├── app.json                      # Generated (gitignored)
└── package.json                  # NPM scripts
```

---

## Important Rules & Requirements

### Bundle ID / Package Name Rules

1. **Must be unique** across entire App Store / Play Store
2. **Format:** `com.companyname.appname`
   - ✅ Good: `com.abchealth.app`
   - ❌ Bad: `com.abc health.app` (no spaces)
   - ❌ Bad: `com.ABCHealth.App` (use lowercase)
3. **Cannot be changed** after first submission
4. **Must be registered** in App Store Connect / Play Console before upload

### Asset Requirements

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| icon.png | 1024×1024 | PNG | No transparency, square |
| splash.png | 1242×2436 | PNG | Match device dimensions |
| adaptive-icon.png | 1024×1024 | PNG | Safe zone: center 66% |
| favicon.png | 48×48+ | PNG | Web favicon |

### Version Management

- All clients share same **codebase version** (1.0.0)
- Each client can have different **build numbers**
- Update version in `app.json` when releasing updates

---

## Troubleshooting

### Error: "Bundle ID already exists"

**Problem:** Bundle ID is already registered in App Store Connect

**Solution:**
1. Check if you own the bundle ID
2. If not, use a different bundle ID in `config/clients.json`
3. Update `bundleId` and `packageName` fields

### Error: "Assets not found"

**Problem:** Asset files are missing

**Solution:**
1. Run: `npm run setup:client <client-id>`
2. Verify assets are in correct directory
3. Check file names match config exactly
4. Ensure files are PNG format

### Error: "EAS build failed"

**Problem:** Build process failed

**Solution:**
1. Check EAS credentials: `eas whoami`
2. Verify `eas.json` configuration
3. Check build logs in EAS dashboard
4. Ensure `app.json` is valid JSON

### Error: "Package name format invalid"

**Problem:** Android package name has invalid characters

**Solution:**
- Use only lowercase letters, numbers, dots, underscores
- Format: `com.companyname.appname`
- No spaces, hyphens, or special characters

---

## Quick Reference Commands

```bash
# Setup new client
npm run setup:client <client-id>

# Generate app.json for client
npm run config:client <client-id>

# Build single client
npm run build:client <client-id> ios
npm run build:client <client-id> android
npm run build:client <client-id> all

# Build all clients
npm run build:all ios
npm run build:all android
npm run build:all all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Check builds
eas build:list

# Publish OTA update (updates all clients automatically!)
npm run update:publish
```

---

## Complete Workflow Examples

### Example 1: Adding a New Client (Initial Setup)

Let's add a new client "MediCare" from start to finish:

```bash
# 1. Add config to config/clients.json
# (Edit file manually)

# 2. Setup assets directory
npm run setup:client medicare-001

# 3. Add assets to assets/clients/medicare-001/
# (Add icon.png, splash.png, etc.)

# 4. Generate app.json
npm run config:client medicare-001

# 5. Build for both platforms
npm run build:client medicare-001 all

# 6. Wait for builds (15-30 min)

# 7. Download builds from EAS dashboard

# 8. Create app in App Store Connect / Play Console

# 9. Upload builds
eas submit --platform ios
eas submit --platform android

# 10. Complete store listings and submit for review
```

### Example 2: Updating All Clients After Adding a Feature

**Scenario:** You've deployed 10 clients, now you add a new feature.

**Old Way (Without OTA):**
```bash
# ❌ Would need to rebuild all 10 clients
npm run build:client client-001 all
npm run build:client client-002 all
# ... repeat for all 10 clients
# Then resubmit to app stores
```

**New Way (With OTA):**
```bash
# ✅ One command updates all clients!
npm run update:publish

# That's it! All 10 deployed clients get the update automatically
# No rebuild needed! No app store resubmission needed!
```

**Timeline:**
- Update published: 5-15 minutes
- All clients receive: Within hours (automatic)
- User sees new feature: Next time they open the app

---

## Best Practices

1. **Version Control:**
   - ✅ Commit `config/clients.json`
   - ✅ Commit asset directories
   - ❌ Don't commit `app.json` (it's generated)

2. **Asset Management:**
   - Store all client assets in version control
   - Use consistent naming: `client-XXX`
   - Document asset requirements

3. **Build Automation:**
   - Use CI/CD for automated builds
   - Build on-demand for new clients
   - Schedule regular builds for updates

4. **Testing:**
   - Test each client build before submission
   - Verify bundle IDs are correct
   - Check app names and icons display correctly

5. **Documentation:**
   - Keep `config/clients.json` updated
   - Document any client-specific requirements
   - Track which clients are live vs. in development

---

## OTA Updates (Over-The-Air) - Automatic Updates for All Clients

### ✅ **YES! You Can Update All Clients Automatically Without Rebuilding!**

This is the **key advantage** - when you add a new feature, **all 100+ deployed clients get the update automatically** without rebuilding or resubmitting to app stores!

### How It Works

1. **Initial Build**: Build and deploy each client once to App Store/Play Store
2. **Add New Feature**: Make changes to your code
3. **Publish Update**: Run one command to publish OTA update
4. **Auto-Update**: All deployed apps automatically receive the update (within minutes/hours)

### What Can Be Updated via OTA?

✅ **JavaScript/TypeScript code** (all your app logic)  
✅ **React components** (UI changes)  
✅ **Assets** (images, fonts - if not native)  
✅ **Styling** (CSS, theme changes)  
✅ **Business logic** (API calls, Redux, etc.)  
✅ **New screens/routes**  
✅ **Bug fixes**  

❌ **Cannot Update:**
- Native code changes (requires rebuild)
- New native dependencies (requires rebuild)
- App icon/splash screen changes (requires rebuild)
- Bundle ID/package name changes (requires rebuild)
- Permissions changes (requires rebuild)

### Setup OTA Updates (Already Done!)

The system is already configured with:
- ✅ `expo-updates` installed
- ✅ Update checking in `app/_layout.tsx`
- ✅ Update configuration in build scripts

### Publishing Updates

#### Step 1: Make Your Code Changes

Add your new feature, fix bugs, update UI - whatever you need!

#### Step 2: Publish OTA Update

```bash
# Publish update for all clients
npm run update:publish
```

**That's it!** All deployed apps will check for and download the update automatically.

#### How Apps Receive Updates

1. **On App Launch**: App checks for updates
2. **In Background**: App downloads update silently
3. **On Next Launch**: App uses new version
4. **No User Action Required**: Completely automatic!

### Update Strategy

#### Option 1: Single Update for All Clients (Recommended)

All clients share the same codebase, so one update works for all:

```bash
npm run update:publish
```

**Pros:**
- ✅ One command updates all clients
- ✅ Simplest approach
- ✅ All clients stay in sync

#### Option 2: Per-Client Updates (Advanced)

If you need different updates per client, use EAS Update channels:

```bash
# Update specific client
eas update --branch client-001 --message "Update for client 001"
```

### Update Workflow Example

```bash
# 1. You add a new feature (e.g., new screen)
# Edit your code...

# 2. Test locally
npm start

# 3. Commit changes
git add .
git commit -m "Add new feature"

# 4. Publish OTA update
npm run update:publish

# 5. All 100+ deployed clients receive update automatically!
# No rebuild needed! No app store submission needed!
```

### Update Timing

- **Development**: Updates available immediately
- **Production**: Updates typically available within 5-15 minutes
- **User Receives**: Within hours (when they open the app)

### Monitoring Updates

Check update status:
```bash
# List all updates
eas update:list

# View update details
eas update:view <update-id>
```

### Important Notes

1. **First Build Required**: Initial deployment to app stores still needs native build
2. **Native Changes**: If you add native dependencies, rebuild is required
3. **Version Compatibility**: Updates work within same runtime version
4. **Rollback**: Can rollback updates if needed via EAS dashboard

### Comparison: React Native OTA vs WebView

| Feature | React Native OTA | WebView |
|---------|------------------|---------|
| **Update Speed** | ⭐⭐⭐⭐ Minutes to hours | ⭐⭐⭐⭐⭐ Instant |
| **Native Features** | ⭐⭐⭐⭐⭐ Full access | ⭐⭐ Limited |
| **Performance** | ⭐⭐⭐⭐⭐ Native | ⭐⭐ Web rendering |
| **Offline Support** | ⭐⭐⭐⭐⭐ Full | ⭐⭐ Limited |
| **Update Control** | ⭐⭐⭐⭐ Per client possible | ⭐⭐⭐⭐⭐ Always instant |

**Verdict**: React Native OTA gives you **95% of WebView's update flexibility** while keeping **100% of native performance and features**!

---

## Summary

✅ **Single codebase** for all clients  
✅ **Unique builds** with different package names  
✅ **Separate App Store listings** per client  
✅ **Automated build process** via scripts  
✅ **OTA Updates** - Update all clients without rebuilding!  
✅ **Scalable** to 100+ clients  

**Key Files:**
- `config/clients.json` - Client configurations
- `scripts/` - Build automation scripts
- `eas.json` - EAS build configuration
- `app/_layout.tsx` - OTA update checking

**Key Commands:**
- `npm run setup:client <id>` - Setup new client
- `npm run config:client <id>` - Generate config
- `npm run build:client <id> <platform>` - Build client (first time)
- `npm run update:publish` - Publish OTA update (for all clients)

---

## Complete Workflow

### Initial Setup (One Time Per Client)
1. Add client to `config/clients.json`
2. Setup assets: `npm run setup:client <id>`
3. Add assets (logos, icons)
4. Build: `npm run build:client <id> all`
5. Deploy to App Store / Play Store

### Regular Updates (After Initial Deployment)
1. Make code changes
2. Publish update: `npm run update:publish`
3. ✅ **All clients get update automatically!**

**That's it!** No rebuild needed for code changes. Only rebuild when you need native changes.

