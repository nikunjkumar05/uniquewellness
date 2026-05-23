# Unique Wellness Android App - Build & Deployment Runbook

This guide provides step-by-step instructions to convert the TypeScript web application into a production-ready Android App (.apk / .aab) compliant with Google Play Store publishing guidelines.

---

## 1. Prerequisites

### System Requirements
- **Node.js**: v18+ (LTS recommended)
- **Java Development Kit (JDK)**: v11+ (required for Gradle)
- **Android SDK**: Minimum API 24+ (Android 7.0), Target API 34+ (Android 14)
- **Gradle**: v7.5+ (automatically managed by Capacitor)
- **Git**: for version control

### Install Android Studio (Recommended)
```bash
# macOS
brew install android-studio

# Linux / Windows
# Download from: https://developer.android.com/studio
```

### Set Android Environment Variables
```bash
# macOS / Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# Add to ~/.zshrc or ~/.bashrc for persistence
```

---

## 2. Dependency Installation

### Step 1: Install Capacitor CLI & Dependencies

```bash
# Navigate to app directory
cd app

# Install npm dependencies for app folder
npm install

# Install Capacitor globally (optional but recommended)
npm install -g @capacitor/cli
```

### Step 2: Initialize Capacitor Project Structure

```bash
# Create Android native project
npx cap add android

# This generates:
# - android/ directory with full native project
# - capacitor.config.ts (already provided)
# - src/ with TypeScript bridge files
```

### Step 3: Configure Project IDs

Edit `capacitor.config.ts` if not already configured:
```typescript
appId: 'com.uniquewellness.app',
appName: 'Unique Wellness',
webDir: '../dist',
```

---

## 3. Web Asset Build Pipeline

### Step 1: Build Web Assets
```bash
# From project root
npm run build

# Output: dist/ directory with compiled assets
```

### Step 2: Sync Assets to Android Project
```bash
# From app directory
npm run sync:android

# This copies dist/ → android/app/src/main/assets/public/
```

### Step 3: Verify Asset Sync
```bash
ls -la android/app/src/main/assets/public/
# Should show index.html, assets/, etc.
```

---

## 4. Android Configuration Setup

### Step 1: Update AndroidManifest.xml

The manifest is already provided in `android-manifest.xml`. Integrate it into the Android project:

```bash
# Copy manifest configuration
cp android-manifest.xml android/app/src/main/AndroidManifest.xml
```

Key permissions configured:
- `INTERNET` - Network access
- `ACCESS_NETWORK_STATE` - Network monitoring
- Hardware back button override
- Secure HTTPS enforcement

### Step 2: Apply Network Security Config

Copy the network security configuration:

```bash
# Ensure res directory exists
mkdir -p android/app/src/main/res/xml

# Copy security config
cp network-security-config.xml android/app/src/main/res/xml/
```

### Step 3: Update build.gradle (app level)

The `build.gradle.kts` file is provided. Merge into `android/app/build.gradle.kts`:
- Capacitor dependencies
- Plugin configurations
- Security hardening
- ProGuard optimization

---

## 5. Signing Configuration for Play Store

### Step 1: Generate Keystore (Release Signing)

```bash
# Generate keystore (one-time)
keytool -genkey -v \
  -keystore uniquewellness.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias uniquewellness \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD

# Move to secure location
mv uniquewellness.jks ~/secure/uniquewellness.jks
chmod 600 ~/secure/uniquewellness.jks
```

### Step 2: Configure Gradle Properties

Create `android/gradle.properties`:
```properties
# Signing Configuration
KEYSTORE_FILE=~/secure/uniquewellness.jks
KEYSTORE_PASSWORD=YOUR_STORE_PASSWORD
KEYSTORE_ALIAS=uniquewellness
KEYSTORE_ALIAS_PASSWORD=YOUR_KEY_PASSWORD

# Build Optimization
org.gradle.jvmargs=-Xmx4g
org.gradle.parallel=true
android.enableR8=true
```

### Step 3: Store Credentials Securely

**NEVER commit keystores or passwords to git:**
```bash
# Add to .gitignore
echo "*.jks" >> .gitignore
echo "gradle.properties" >> .gitignore
echo ".env*" >> .gitignore
```

---

## 6. Compilation & Build Pipeline

### Option A: Build APK (for direct testing)

```bash
# Full pipeline: build web → sync → compile APK
cd app && npm run build:android

# Or step-by-step:
npm run build:web       # Build TypeScript → dist/
npm run sync:android    # Copy assets to Android
cd android && ./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Option B: Build App Bundle (for Play Store submission)

```bash
# Full pipeline: build web → sync → compile AAB
cd app && npm run build:aab

# Or step-by-step:
npm run build:web       # Build TypeScript → dist/
npm run sync:android    # Copy assets to Android
cd android && ./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Step: Verify Build Output

```bash
# Check APK
ls -lh android/app/build/outputs/apk/release/app-release.apk
unzip -l android/app/build/outputs/apk/release/app-release.apk | head -20

# Check AAB
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

---

## 7. Testing Before Deployment

### Option A: Test on Emulator

```bash
# Open Android Studio / create emulator
# Or use CLI:
emulator -list-avds  # List available emulators

# Start emulator
emulator -avd Pixel_6_API_34

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Or via Capacitor
npx cap run android --release
```

### Option B: Test on Physical Device

```bash
# Enable USB debugging on device
# Connect via USB

# Install and run
adb install android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.uniquewellness.app/.MainActivity

# View logs
adb logcat | grep -E "MainActivity|Capacitor"
```

### Performance Testing

```bash
# Check app size
du -sh android/app/build/outputs/apk/release/app-release.apk

# Monitor memory
adb shell dumpsys meminfo com.uniquewellness.app

# Check network calls (ProGuard obfuscation should be minimal)
adb shell tcpdump -i any -w /sdcard/capture.pcap
```

---

## 8. Google Play Store Submission

### Step 1: Prepare Store Assets

Create `play-store-assets/`:
```
├── en-US/
│   ├── title.txt                    (max 50 chars)
│   ├── short_description.txt        (max 80 chars)
│   ├── full_description.txt         (max 4000 chars)
│   ├── images/
│   │   ├── icon.png                 (512×512 px)
│   │   ├── feature-graphic.png      (1024×500 px)
│   │   ├── screenshots/             (min 2, max 8 per orientation)
│   │   │   ├── phone-1.png          (1080×1920 px)
│   │   │   └── ...
│   │   └── promo-video.mp4
│   └── release_notes.txt
└── privacy-policy.html              (from hosting)
```

### Step 2: Create Google Play Developer Account

- Visit: https://play.google.com/console
- Register as Developer ($25 USD one-time)
- Create new app entry
- Fill app details, screenshots, description

### Step 3: Upload App Bundle

```bash
# Validate before upload
bundletool validate --bundle=android/app/build/outputs/bundle/release/app-release.aab

# Generate universal APK for testing (optional)
bundletool build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=universal.apks \
  --mode=universal

# Upload via Google Play Console UI or CLI
# Console: Internal Testing → Manage releases → Add release → Upload AAB
```

### Step 4: Release Management

**Internal Testing**: Test with small user group
```bash
# Enable internal testing in Play Console
# Add testers' Google accounts
# Share internal test link
```

**Closed Testing**: Limited rollout to region/audience
**Open Testing (Beta)**: Wider testing before production
**Production**: Full Play Store release

### Step 5: Compliance & Policies

- ✅ Review Google Play policies: https://play.google.com/about/developer-content-policy/
- ✅ Verify app permissions are justified
- ✅ Test on minimum SDK 24 (Android 7.0)
- ✅ Ensure network security config (HTTPS enforced)
- ✅ No hardcoded API keys / secrets
- ✅ Privacy policy URL provided
- ✅ COPPA compliance if targeting children

---

## 9. Post-Launch Monitoring

### Performance Monitoring

```bash
# Real-time log monitoring
adb logcat | grep "AndroidLifecycle\|Capacitor"

# Crash logs (after Play Store release)
# Access via Play Console → Crashes & ANRs
```

### Update Pipeline

```bash
# For new releases:
npm run build:web       # Build updated web assets
npm run sync:android    # Sync to Android
cd android && ./gradlew bundleRelease

# Increment version in:
# - package.json (app/package.json)
# - android/app/build.gradle.kts (versionCode++)
# - capacitor.config.ts (if applicable)

# Upload new AAB to Play Console → Continue release
```

---

## 10. Troubleshooting

### Build Failures

```bash
# Clean and rebuild
cd app
npm run clean:android
npm run build:web
npm run sync:android
cd android && ./gradlew clean bundleRelease

# Check Java version
java -version  # Must be 11+

# Check Gradle version
./gradlew --version
```

### Network Issues

```bash
# Verify SSL certificates
curl -v https://api.supabase.io/

# Test localhost debugging (if needed)
# Edit network-security-config.xml to allow cleartext for 127.0.0.1

# Check WebView console
adb logcat | grep WebView
```

### Asset Not Loading

```bash
# Verify assets copied
adb shell ls /data/data/com.uniquewellness.app/app_webview/

# Check manifest
cat android/app/src/main/AndroidManifest.xml | grep -i asset
```

---

## 11. Environment-Specific Configuration

### Development
```bash
# Use dev web build
npm run build:dev
npm run sync:android
npx cap run android --live-reload
```

### Staging
```bash
# Build with staging API endpoint
npm run build  # Update API endpoint in code
npm run sync:android
cd android && ./gradlew assembleRelease
```

### Production
```bash
# Ensure all secrets are externalized
# Use play-services-ads / analytics
npm run build
npm run sync:android
cd android && ./gradlew bundleRelease
```

---

## 12. CI/CD Integration (Optional)

Create `.github/workflows/android-build.yml`:
```yaml
name: Android Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install && npm run build
      - run: cd app && npm run sync:android
      - run: cd app/android && ./gradlew bundleRelease
      - uses: actions/upload-artifact@v3
        with:
          name: app-release.aab
          path: app/android/app/build/outputs/bundle/release/
```

---

## Summary Checklist

- [ ] Android SDK & JDK installed
- [ ] Capacitor project initialized
- [ ] Web assets building successfully
- [ ] AndroidManifest.xml configured
- [ ] Network security config applied
- [ ] Keystore generated & secured
- [ ] APK/AAB builds successfully
- [ ] App tested on emulator/device
- [ ] Play Store assets prepared
- [ ] Developer account created
- [ ] App submitted to internal testing
- [ ] Version management plan in place

---

For additional support:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer Docs: https://developer.android.com/docs
- Google Play Console: https://play.google.com/console
