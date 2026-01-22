#!/bin/bash

# Çiçeğim Flutter App - Quick Start Script

echo "🌸 Çiçeğim Flutter Uygulaması 🌸"
echo "================================"
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null
then
    echo "❌ Flutter yüklü değil!"
    echo "Flutter'ı yüklemek için: https://docs.flutter.dev/get-started/install"
    exit 1
fi

echo "✅ Flutter bulundu: $(flutter --version | head -1)"
echo ""

# Get Gemini API Key
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY ortam değişkeni ayarlanmamış."
    echo "Lütfen API anahtarını girin (veya Enter'a basarak varsayılanı kullanın):"
    read -r api_key
    if [ -n "$api_key" ]; then
        export GEMINI_API_KEY="$api_key"
    fi
fi

echo ""
echo "📦 Bağımlılıklar yükleniyor..."
flutter pub get

echo ""
echo "🔍 Bağlı cihazlar kontrol ediliyor..."
flutter devices

echo ""
echo "🚀 Uygulama başlatılıyor..."
echo ""

if [ -n "$GEMINI_API_KEY" ]; then
    flutter run --dart-define=GEMINI_API_KEY="$GEMINI_API_KEY"
else
    flutter run
fi
