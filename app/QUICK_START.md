# Quick Start Guide - Android App Development

Fast-track setup for local development and testing.

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd app
npm install

# Install Capacitor CLI
npm install -g @capacitor/cli
```

### 2. Build Web Assets
```bash
# From project root
npm run build

# Returns: dist/ directory
```

### 3. Initialize Android Project
```bash
cd app
npx cap add android

# Auto-generates android/ folder with full native project
```

### 4. Sync & Test
```bash
# Copy assets to Android
npm run sync:android

# Open Android Studio
npm run open:android

# Or run directly on emulator/device
npm run run:android

# Live reload development
npm run dev:android
```

## Common Commands

```bash
# Sync web changes to Android
npm run sync:android

# Build APK for testing
cd app/android && ./gradlew assembleRelease

# Build AAB for Play Store
cd app/android && ./gradlew bundleRelease

# Clean builds
npm run clean:android

# Open in Android Studio
npm run open:android
```

## File Structure

```
app/
├── capacitor.config.ts          # Main Capacitor config
├── package.json                 # Dependencies & scripts
├── network-security-config.xml  # HTTPS/SSL policy
├── android-manifest.xml         # Android manifest template
├── build.gradle.kts             # Gradle build config
├── src/
│   └── native/
│       └── AndroidLifecycle.ts  # OS lifecycle handler
├── android/                     # Generated native project
│   ├── app/
│   ├── build.gradle.kts
│   └── settings.gradle.kts
└── BUILD_DEPLOYMENT.md          # Full runbook
```

## Testing on Device

### Physical Device
```bash
# Enable USB debugging on phone
adb devices

# Install app
adb install android/app/build/outputs/apk/release/app-release.apk

# View logs
adb logcat | grep "MainActivity"
```

### Emulator
```bash
emulator -avd Pixel_6_API_34
npm run run:android
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | `npm run clean:android && npm run build:web && npm run sync:android` |
| Assets not loading | Verify `npm run sync:android` completed successfully |
| Port conflict | Change port in `capacitor.config.ts` |
| Java not found | Install JDK 11+ and set `JAVA_HOME` environment variable |

## Next Steps

1. ✅ Complete setup above
2. 📋 Read `BUILD_DEPLOYMENT.md` for full instructions
3. 🔐 Set up signing keystore for release builds
4. 📤 Submit to Play Store via Google Play Console

---

For details, see `BUILD_DEPLOYMENT.md`
