# Mobile App

## Overview
Cross-platform mobile application built with React Native for iOS and Android platforms.

## Tech Stack
- **Framework**: React Native 0.72+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Styled Components + React Native Paper
- **Push Notifications**: Firebase Cloud Messaging
- **Analytics**: Firebase Analytics

## Development Setup
```bash
# Install dependencies
npm install

# iOS Setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Generate APK
npm run build:android

# Generate IPA
npm run build:ios
```

## Key Features
- Native performance with React Native
- Offline-first architecture
- Push notifications
- Biometric authentication
- Camera and file access
- Real-time messaging
- Voice input capabilities

## Platform-Specific Features
### iOS
- Apple Sign-In integration
- Siri Shortcuts
- Haptic feedback
- Face ID / Touch ID authentication

### Android
- Google Sign-In integration
- Android Auto support
- Fingerprint authentication
- Adaptive icons

## Development Tools
- **Flipper**: Debugging and inspection
- **Reactotron**: State management debugging
- **Fastlane**: Automated deployment
- **CodePush**: Over-the-air updates

## Testing
- **Unit Tests**: Jest + React Native Testing Library
- **E2E Tests**: Detox
- **Device Testing**: BrowserStack / Firebase Test Lab
- **Performance**: Flipper Performance Monitor

## Build & Deployment
- **iOS**: Xcode + App Store Connect
- **Android**: Android Studio + Google Play Console
- **CI/CD**: GitHub Actions with Fastlane
- **Beta Testing**: TestFlight (iOS) + Firebase App Distribution