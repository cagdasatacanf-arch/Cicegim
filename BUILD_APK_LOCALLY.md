# Build Çiçeğim APK Locally

This guide will help you install Flutter and build the APK on your local machine.

## Prerequisites

- Git installed
- At least 2GB of free disk space
- Internet connection

## Step 1: Install Flutter

### For Linux:

```bash
# Download Flutter SDK
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.5-stable.tar.xz

# Extract Flutter
tar xf flutter_linux_3.24.5-stable.tar.xz

# Add Flutter to PATH (add this to your ~/.bashrc or ~/.zshrc)
export PATH="$HOME/flutter/bin:$PATH"

# Apply the changes
source ~/.bashrc  # or source ~/.zshrc

# Verify installation
flutter --version
```

### For macOS:

```bash
# Download Flutter SDK
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.24.5-stable.zip

# Extract Flutter
unzip flutter_macos_3.24.5-stable.zip

# Add Flutter to PATH (add this to your ~/.zshrc or ~/.bash_profile)
export PATH="$HOME/flutter/bin:$PATH"

# Apply the changes
source ~/.zshrc

# Verify installation
flutter --version
```

### For Windows:

1. Download Flutter SDK from: https://docs.flutter.dev/get-started/install/windows
2. Extract the ZIP to `C:\flutter`
3. Add `C:\flutter\bin` to your PATH environment variable
4. Open new command prompt and verify: `flutter --version`

## Step 2: Install Android SDK

Flutter requires Android SDK to build APKs.

```bash
# Run Flutter doctor to see what's missing
flutter doctor

# Accept Android licenses
flutter doctor --android-licenses
```

**If Android SDK is not installed:**

### Option A: Install Android Studio (Recommended)
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. Run `flutter doctor` and follow the instructions

### Option B: Install Android SDK Command-line Tools Only
```bash
# For Linux/macOS
mkdir -p ~/Android/Sdk/cmdline-tools
cd ~/Android/Sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip
mv cmdline-tools latest

# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install required SDK components
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
flutter doctor --android-licenses
```

## Step 3: Build the APK

Once Flutter and Android SDK are installed:

```bash
# Navigate to the Flutter project
cd /home/user/Cicegim/cicegim_flutter

# Get dependencies
flutter pub get

# Build the APK
flutter build apk --release --no-tree-shake-icons
```

## Step 4: Find Your APK

The APK will be created at:
```
/home/user/Cicegim/cicegim_flutter/build/app/outputs/flutter-apk/app-release.apk
```

You can copy it to your current directory:
```bash
cp build/app/outputs/flutter-apk/app-release.apk ../cicegim.apk
```

## Troubleshooting

### "flutter: command not found"
- Make sure you added Flutter to your PATH
- Restart your terminal
- Run `source ~/.bashrc` or `source ~/.zshrc`

### "Android SDK not found"
- Install Android Studio or Android SDK command-line tools
- Run `flutter doctor` to diagnose
- Set ANDROID_HOME environment variable

### "License not accepted"
- Run `flutter doctor --android-licenses`
- Press 'y' to accept all licenses

### Build fails with Gradle errors
```bash
cd cicegim_flutter/android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk --release
```

## Quick Start Script

For convenience, you can use the provided script:

```bash
cd /home/user/Cicegim/cicegim_flutter
chmod +x run.sh
./run.sh
```

Note: This runs the app in development mode. To build APK, use the `flutter build apk` command above.

## Estimated Time

- Flutter installation: 5-10 minutes
- Android SDK installation: 10-20 minutes
- APK build: 5-10 minutes
- **Total: ~30-40 minutes** (first time)

Subsequent builds take only 2-5 minutes.

## File Sizes

- Flutter SDK: ~1.2 GB
- Android SDK: ~3-5 GB
- Final APK: ~30-50 MB

## Need Help?

Check Flutter documentation: https://docs.flutter.dev/get-started/install
