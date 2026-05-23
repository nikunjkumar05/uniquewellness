# Unique Wellness Android App

Production-ready Android application built with Capacitor, TypeScript, and React. Converts the Unique Wellness web application into a native Android App (.apk / .aab) fully compliant with Google Play Store publishing guidelines.

## Overview

- **Framework**: Capacitor 6+
- **Language**: TypeScript
- **UI**: React 19
- **Target SDK**: Android 14+ (API 34)
- **Minimum SDK**: Android 7.0 (API 24)
- **Build System**: Gradle with Maven Central dependencies

## Features

✅ **Performance Optimization**
- Hardware acceleration enabled
- WebGL optimization
- Efficient DOM caching
- ProGuard code obfuscation & minification

✅ **Security Hardening**
- Enforced HTTPS (network security config)
- No cleartext traffic
- Certificate pinning support
- Secure local storage via Preferences plugin

✅ **Android Lifecycle Management**
- Pause/Resume state handling
- Hardware back button override
- Application state preservation
- Network status monitoring

✅ **Native Capabilities**
- Camera access (plugin available)
- Geolocation support
- Push notifications
- Keyboard lifecycle handling
- Status bar customization

✅ **Play Store Compliance**
- Target SDK 34+ enforcement
- Proper permission declarations
- App manifest configuration
- Release signing setup

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for fast-track setup (5 minutes).

## Full Deployment Guide

See [BUILD_DEPLOYMENT.md](./BUILD_DEPLOYMENT.md) for comprehensive step-by-step instructions covering:
1. Environment setup & prerequisites
2. Dependency installation
3. Web asset build pipeline
4. Android configuration
5. Signing & release builds
6. Play Store submission
7. Monitoring & updates

## File Structure

```
app/
├── README.md                        # This file
├── QUICK_START.md                   # 5-minute setup guide
├── BUILD_DEPLOYMENT.md              # Full deployment runbook
├── package.json                     # Dependencies & build scripts
├── capacitor.config.ts              # Capacitor configuration
├── android-manifest.xml             # Android manifest template
├── network-security-config.xml      # HTTPS/SSL security policy
├── build.gradle.kts                 # Gradle build configuration
├── src/
│   └── native/
│       ├── AndroidLifecycle.ts      # OS lifecycle manager
│       └── initializeAndroid.ts     # App initialization hook
└── android/                         # Generated native Android project
    ├── app/
    │   ├── src/
    │   │   ├── main/
    │   │   │   ├── AndroidManifest.xml
    │   │   │   ├── assets/
    │   │   │   │   └── public/       # Web assets synced here
    │   │   │   └── java/
    │   │   │       └── MainActivity.kt
    │   │   └── test/
    │   └── build.gradle.kts
    ├── build.gradle.kts
    └── settings.gradle.kts
```

## Key Configuration Files

### `capacitor.config.ts`
Main Capacitor configuration defining:
- App ID: `com.uniquewellness.app`
- Web assets directory
- Server configuration
- Plugin settings (SplashScreen, CapacitorHttp)

### `network-security-config.xml`
Android network security policy enforcing:
- HTTPS for all domains by default
- Certificate pinning (optional)
- Cleartext disabling
- Domain-specific security rules

### `AndroidManifest.xml`
Android manifest template with:
- Required permissions (INTERNET, ACCESS_NETWORK_STATE)
- Activity configuration
- Hardware back button handling
- WebView settings

## Build Scripts

```bash
# Development
npm run dev:android             # Live reload development build
npm run run:android             # Run on emulator/device

# Build
npm run build:android           # Full pipeline: build web + sync + APK
npm run build:aab               # Full pipeline: build web + sync + AAB

# Utility
npm run sync:android            # Sync web assets to Android
npm run open:android            # Open Android Studio
npm run clean:android           # Clean Gradle cache

# Individual steps (from android/ directory)
./gradlew assembleRelease       # Build APK
./gradlew bundleRelease         # Build App Bundle (AAB)
```

## Android Lifecycle Integration

The app includes a comprehensive lifecycle manager (`AndroidLifecycle.ts`) that handles:

```typescript
// Import in your app entry point
import { initializeAndroidApp } from './app/src/native/initializeAndroid';

// Initialize Android features
initializeAndroidApp();
```

**Lifecycle Events Handled:**
- ✅ Pause/Resume states
- ✅ Hardware back button
- ✅ Network status changes
- ✅ Keyboard visibility
- ✅ Status bar styling
- ✅ Application state persistence

## Security Considerations

### Secrets Management
- ❌ Never commit keystores (`.jks` files)
- ❌ Never hardcode API keys
- ✅ Use environment variables or secure vaults
- ✅ Add `*.jks` and `gradle.properties` to `.gitignore`

### Network Security
- HTTPS enforced by default
- Cleartext disabled for production
- Certificate pinning available (configure in `network-security-config.xml`)
- Supabase API calls use secure connections

### Code Obfuscation
- ProGuard/R8 enabled for release builds
- Removes debug symbols
- Shrinks unused code
- Optimizes performance

## Play Store Submission Checklist

Before uploading to Google Play:

- [ ] Version code incremented in `build.gradle.kts`
- [ ] App signed with release keystore
- [ ] Tested on Android 7.0+ and latest devices
- [ ] Privacy policy URL provided
- [ ] App icon (512×512 px) prepared
- [ ] Feature graphics (1024×500 px) prepared
- [ ] Screenshots (min 2, max 8 per orientation) prepared
- [ ] App description and release notes written
- [ ] Content rating questionnaire completed
- [ ] Permissions justified to users

## Testing

### Local Testing
```bash
# Emulator
emulator -avd Pixel_6_API_34
npm run run:android

# Physical device
adb devices
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Performance Monitoring
```bash
# View logs
adb logcat | grep "AndroidLifecycle"

# Memory monitoring
adb shell dumpsys meminfo com.uniquewellness.app

# Network monitoring
adb shell tcpdump -i any -w /sdcard/capture.pcap
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Build failed: No matching variant...` | Run `npm run clean:android` then rebuild |
| `Assets not loading` | Verify `npm run sync:android` ran successfully |
| `Java not found` | Install JDK 11+ and set `JAVA_HOME` |
| `Gradle daemon timeout` | Increase timeout in `gradle.properties`: `org.gradle.daemon.idletimeout=60000` |
| `APK too large` | Enable ProGuard (enabled by default in release build) |

## Environment-Specific Builds

### Development
```bash
# With hot reload and debug symbols
npm run dev:android
```

### Staging
```bash
# Production-like but with staging API endpoints
npm run build  # Update API endpoint in code
npm run sync:android
```

### Production
```bash
# Optimized, minified, signed release
npm run build:aab
```

## Dependencies

### Core Capacitor Plugins
- `@capacitor/core` - Core runtime
- `@capacitor/app` - App lifecycle
- `@capacitor/keyboard` - Keyboard handling
- `@capacitor/status-bar` - Status bar control
- `@capacitor/network` - Network monitoring
- `@capacitor/preferences` - Local storage

### Optional Plugins
- `@capacitor/camera` - Camera/photo library
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/haptics` - Vibration feedback

## Updating

To update Capacitor and plugins:

```bash
# Check for updates
npm outdated

# Update specific package
npm update @capacitor/core

# Sync changes to Android
npm run sync:android
```

## Debugging

### Enable Debug Logging
Edit `capacitor.config.ts`:
```typescript
android: {
  loggingBehavior: 'debug',  // Changed from 'none'
  webContentsDebuggingEnabled: true,
}
```

### Chrome DevTools
```bash
# Connect via Android Studio or:
adb forward tcp:9222 localabstract:chrome_devtools_remote

# Open Chrome: chrome://inspect/#devices
```

## Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Docs**: https://developer.android.com/docs
- **Google Play Console**: https://play.google.com/console
- **React Documentation**: https://react.dev

## Support

For issues or questions:
1. Check [BUILD_DEPLOYMENT.md](./BUILD_DEPLOYMENT.md) troubleshooting section
2. Review Capacitor docs: https://capacitorjs.com/docs
3. Check Android logcat for errors: `adb logcat | grep -E "MainActivity|Capacitor"`

## License

Same as parent project. See root `LICENSE` file.

---

**Last Updated**: 2026-05-23
**Capacitor Version**: 6.1.2
**Target Android API**: 34+
