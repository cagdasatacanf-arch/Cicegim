#!/bin/bash

# Çiçeğim APK Builder - Automated Flutter Setup and Build Script
# This script installs Flutter and builds the APK automatically

set -e  # Exit on error

echo "🌸 Çiçeğim APK Builder 🌸"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo "📋 System Info:"
echo "   OS: $OS"
echo "   Architecture: $ARCH"
echo ""

# Check if Flutter is already installed
if command -v flutter &> /dev/null; then
    echo -e "${GREEN}✅ Flutter already installed!${NC}"
    flutter --version
    echo ""
else
    echo -e "${YELLOW}📥 Installing Flutter...${NC}"

    # Determine download URL based on OS
    case "$OS" in
        Linux*)
            FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.5-stable.tar.xz"
            FLUTTER_FILE="flutter_linux.tar.xz"
            ;;
        Darwin*)
            if [ "$ARCH" = "arm64" ]; then
                FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.24.5-stable.zip"
            else
                FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.24.5-stable.zip"
            fi
            FLUTTER_FILE="flutter_macos.zip"
            ;;
        *)
            echo -e "${RED}❌ Unsupported OS: $OS${NC}"
            echo "Please install Flutter manually: https://docs.flutter.dev/get-started/install"
            exit 1
            ;;
    esac

    # Download Flutter
    echo "Downloading from: $FLUTTER_URL"
    cd ~
    wget -O "$FLUTTER_FILE" "$FLUTTER_URL" || curl -o "$FLUTTER_FILE" "$FLUTTER_URL"

    # Extract Flutter
    echo "Extracting Flutter SDK..."
    if [[ "$FLUTTER_FILE" == *.tar.xz ]]; then
        tar xf "$FLUTTER_FILE"
    else
        unzip -q "$FLUTTER_FILE"
    fi

    rm "$FLUTTER_FILE"

    # Add Flutter to PATH for this session
    export PATH="$HOME/flutter/bin:$PATH"

    echo -e "${GREEN}✅ Flutter installed!${NC}"
    echo ""

    # Add to shell profile
    SHELL_PROFILE=""
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_PROFILE="$HOME/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
        SHELL_PROFILE="$HOME/.bashrc"
    fi

    if [ -n "$SHELL_PROFILE" ]; then
        if ! grep -q "flutter/bin" "$SHELL_PROFILE"; then
            echo "" >> "$SHELL_PROFILE"
            echo "# Flutter PATH" >> "$SHELL_PROFILE"
            echo 'export PATH="$HOME/flutter/bin:$PATH"' >> "$SHELL_PROFILE"
            echo -e "${GREEN}✅ Added Flutter to $SHELL_PROFILE${NC}"
        fi
    fi

    flutter --version
    echo ""
fi

# Run Flutter Doctor
echo -e "${YELLOW}🔍 Running Flutter Doctor...${NC}"
flutter doctor

echo ""
echo -e "${YELLOW}📦 Checking Android SDK...${NC}"

# Check for Android SDK
if flutter doctor | grep -q "Android toolchain.*✗"; then
    echo -e "${RED}⚠️  Android SDK not found or incomplete!${NC}"
    echo ""
    echo "You have two options:"
    echo "1. Install Android Studio (recommended): https://developer.android.com/studio"
    echo "2. Install Android SDK command-line tools manually"
    echo ""
    read -p "Do you want to accept Android licenses now? (requires Android SDK) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        flutter doctor --android-licenses || true
    fi
fi

# Navigate to project directory
echo ""
echo -e "${YELLOW}📂 Navigating to project...${NC}"
cd "$(dirname "$0")/cicegim_flutter"

# Get dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
flutter pub get

# Build APK
echo ""
echo -e "${YELLOW}🔨 Building APK...${NC}"
echo "This may take 5-10 minutes on the first build..."
echo ""

flutter build apk --release --no-tree-shake-icons

# Check if build was successful
APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ APK BUILD SUCCESSFUL! ✅${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "📱 APK Location:"
    echo "   $(pwd)/$APK_PATH"
    echo ""

    # Copy to root directory
    cp "$APK_PATH" ../cicegim.apk
    echo -e "${GREEN}📋 Copied to: $(dirname "$0")/cicegim.apk${NC}"
    echo ""

    # Show file size
    SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 APK Size: $SIZE"
    echo ""
    echo -e "${GREEN}You can now install cicegim.apk on your Android device!${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ APK BUILD FAILED! ❌${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Please check the error messages above."
    echo "Common issues:"
    echo "  - Android SDK not installed or configured"
    echo "  - Android licenses not accepted"
    echo "  - Missing dependencies"
    echo ""
    echo "Run 'flutter doctor' to diagnose issues."
    exit 1
fi
