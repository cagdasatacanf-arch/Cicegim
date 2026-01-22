# Çiçeğim Flutter - AI Bitki Bakım Asistanı

Gemini AI destekli mobil bitki tanıma ve bakım uygulaması.

## 🚀 Özellikler

- **AI Bitki Tanıma**: Gemini 2.0 Flash Exp ile bitki fotoğraflarını analiz
- **Bakım Takibi**: Sulama zamanlarını takip edin
- **Kamera & Galeri**: Fotoğraf çekin veya galeriden seçin
- **Yerel Depolama**: Bitki verileriniz cihazınızda güvenle saklanır
- **Türkçe Arayüz**: Tamamen Türkçe kullanıcı deneyimi

## 📋 Gereksinimler

- Flutter SDK (3.0.0 veya üzeri)
- Dart SDK (3.0.0 veya üzeri)
- Android Studio / Xcode
- Gemini API anahtarı

## 🛠️ Kurulum

### 1. Flutter SDK Yükleyin

Flutter'ı sisteminize kurun:
```bash
# macOS (Homebrew)
brew install flutter

# Windows
# https://docs.flutter.dev/get-started/install/windows adresinden indirin

# Linux
# https://docs.flutter.dev/get-started/install/linux adresinden indirin
```

Flutter kurulumunu doğrulayın:
```bash
flutter doctor
```

### 2. Projeyi Klonlayın

```bash
cd /home/user/Cicegim/cicegim_flutter
```

### 3. Bağımlılıkları Yükleyin

```bash
flutter pub get
```

### 4. Gemini API Anahtarını Yapılandırın

API anahtarınızı ortam değişkeni olarak ayarlayın veya `lib/services/gemini_service.dart` dosyasındaki `apiKey` değişkenini düzenleyin:

```dart
static const String apiKey = String.fromEnvironment('GEMINI_API_KEY',
    defaultValue: 'YOUR_API_KEY_HERE');
```

**Komut satırından çalıştırırken:**
```bash
flutter run --dart-define=GEMINI_API_KEY=AIzaSyDeVTbNzlYKnYplW8rtVrvB6eYvgfKq5FE
```

## 🏃 Çalıştırma

### Android

1. Android cihazınızı bağlayın veya emülatör başlatın:
```bash
flutter emulators --launch <emulator-id>
```

2. Uygulamayı çalıştırın:
```bash
flutter run
```

### iOS

1. Xcode açın ve simulator başlatın
2. Uygulamayı çalıştırın:
```bash
flutter run
```

### Debug Modu

```bash
flutter run --debug
```

### Release Modu

```bash
flutter run --release
```

## 📦 Build

### Android APK

```bash
flutter build apk --release
```

APK dosyası: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (Google Play)

```bash
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

## 📱 Kullanım

1. **Bitki Ekle**: Ana ekranda + butonuna basın
2. **Fotoğraf Seç**: Kameradan çekin veya galeriden seçin
3. **AI Analizi**: Gemini AI bitkiyi analiz edecek
4. **Bakım Takibi**: Sulama zamanlarını takip edin
5. **Detaylar**: Bitkiye tıklayarak detaylı bilgilere erişin

## 🏗️ Proje Yapısı

```
cicegim_flutter/
├── lib/
│   ├── main.dart                    # Ana uygulama giriş noktası
│   ├── models/
│   │   └── plant.dart              # Bitki veri modeli
│   ├── providers/
│   │   └── plant_provider.dart     # State management
│   ├── services/
│   │   └── gemini_service.dart     # Gemini AI entegrasyonu
│   └── screens/
│       ├── home_screen.dart        # Ana ekran
│       └── plant_detail_screen.dart # Bitki detay ekranı
├── android/                         # Android konfigürasyonu
├── ios/                            # iOS konfigürasyonu
├── assets/                         # Görseller ve kaynaklar
└── pubspec.yaml                    # Bağımlılıklar
```

## 🔧 Yapılandırma

### İzinler

Uygulama aşağıdaki izinleri kullanır:

**Android (AndroidManifest.xml):**
- `CAMERA`: Bitki fotoğrafı çekme
- `READ_EXTERNAL_STORAGE`: Galeriden resim seçme
- `INTERNET`: Gemini API erişimi

**iOS (Info.plist):**
- `NSCameraUsageDescription`: Kamera erişimi
- `NSPhotoLibraryUsageDescription`: Galeri erişimi

### API Anahtarı Güvenliği

**ÖNEMLİ**: API anahtarınızı asla GitHub'a commit etmeyin!

- Ortam değişkeni kullanın
- `.gitignore` dosyasına ekleyin
- Production için Firebase Remote Config veya benzeri kullanın

## 🐛 Sorun Giderme

### Bağımlılık Hataları

```bash
flutter clean
flutter pub get
```

### Android Build Hataları

```bash
cd android
./gradlew clean
cd ..
flutter build apk
```

### iOS Pod Hataları

```bash
cd ios
pod install
cd ..
flutter run
```

### Gemini API 403 Hatası

1. Google Cloud Console'da Generative Language API'yi etkinleştirin
2. API anahtarının doğru projeden olduğundan emin olun
3. API key restrictions kontrol edin

## 📚 Bağımlılıklar

### Ana Bağımlılıklar
- `google_generative_ai`: ^0.2.2 - Gemini AI entegrasyonu
- `image_picker`: ^1.0.7 - Kamera ve galeri erişimi
- `provider`: ^6.1.1 - State management
- `shared_preferences`: ^2.2.2 - Yerel veri saklama
- `google_fonts`: ^6.1.0 - Özel fontlar

### Dev Bağımlılıklar
- `flutter_lints`: ^3.0.0 - Kod kalitesi

Tüm bağımlılıklar için `pubspec.yaml` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel kullanım içindir.

## 📧 İletişim

Sorularınız için: [GitHub Issues](https://github.com/cagdasatacanf-arch/Cicegim/issues)

## 🙏 Teşekkürler

- [Flutter](https://flutter.dev/)
- [Google Generative AI](https://ai.google.dev/)
- [Material Design](https://m3.material.io/)

---

**Not**: Bu uygulama Gemini AI kullanır ve internet bağlantısı gerektirir.
