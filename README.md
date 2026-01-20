# Flora: AI Destekli Bitki Bakım ve Tanıma Uygulaması

**Master PRD - Product Requirements Document**

Bu proje, kullanıcıların bitkilerini AI ile tanıdığı, hastalık teşhisi koyduğu ve kişiselleştirilmiş bakım takvimleri ile bitkilerini hayatta tuttuğu premium bir mobil deneyim sunar.

---

## 1. Proje Vizyonu

Kullanıcıların bitkilerini AI ile tanıdığı, hastalık teşhisi koyduğu ve kişiselleştirilmiş bakım takvimleri ile bitkilerini hayatta tuttuğu premium bir mobil deneyim.

---

## 2. Teknik Yığın (Tech Stack)

- **Framework**: React (Vite) + Tailwind CSS
- **İkon Seti**: Lucide React
- **Yapay Zeka**: Kindwise (Plant.id) API V3
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State**: React Context API + LocalStorage Persistence

---

## 3. Kullanıcı Akışı ve Fonksiyonlar

### A. Onboarding & Giriş
- Kullanıcıyı karşılayan 3 aşamalı değer vaadi ekranı
- Firebase Auth ile Anonim veya Email ile giriş

### B. AI Tanıma & Teşhis (Ana Fonksiyon)
- Kamera erişimi ve fotoğraf çekimi
- Plant.id API entegrasyonu (Base64 gönderim)
- Gelen veriden bitki ismi, bilimsel ad ve bakım bilgilerinin ayrıştırılması

### C. Dijital Bahçe & Bakım Takvimi
- Eklenen bitkilerin listelenmesi
- `lastWatered` ve `wateringInterval` verileriyle "Gelecek Sulama" tarihinin hesaplanması
- Sulama zamanı gelenler için görsel uyarı (Kırmızı badge)

---

## 4. Veri Mimarisi (Firestore)

### Koleksiyonlar:
- **users/{userId}** → Profil ve abonelik bilgisi
- **users/{userId}/plants/{plantId}** → Bitki detayları
  - `nickname` - Kullanıcının verdiği özel isim
  - `scientificName` - Bilimsel adı
  - `imageUrl` - Bitki fotoğrafı
  - `lastWatered` - Son sulama zamanı (Timestamp)
  - `interval` - Sulama sıklığı (gün cinsinden, int)

---

## 5. Claude İçin Geliştirme Emirleri (Directives)

1. **Modülerlik**: API servislerini `services/` klasörüne ayır
2. **Güvenlik**: API anahtarlarını `.env` dosyasından oku
3. **UI/UX**: Tailwind ile `rounded-[2.5rem]` gibi yuvarlatılmış köşeler, yumuşak gölgeler ve `#1B4332` (Forest Green) ana rengini kullan
4. **Hata Yönetimi**: API limitleri dolduğunda veya internet kesildiğinde kullanıcıya şık bir "Uyarı Kutusu" (Toast/Modal) göster

---

## Proje Yapısı

```
Cicegim/
├── flora-app/              # Ana uygulama
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── contexts/       # State yönetimi
│   │   ├── services/       # API servisleri
│   │   └── App.jsx        # Ana uygulama
│   ├── .env.example       # Çevre değişkenleri şablonu
│   └── README.md          # Uygulama dokümantasyonu
└── README.md              # Bu dosya
```

---

## Kurulum

1. **Proje klasörüne git**:
   ```bash
   cd flora-app
   ```

2. **Bağımlılıkları yükle**:
   ```bash
   npm install
   ```

3. **Çevre değişkenlerini ayarla**:
   ```bash
   cp .env.example .env
   # .env dosyasını Firebase ve Plant.id API bilgilerinizle düzenleyin
   ```

4. **Geliştirme sunucusunu başlat**:
   ```bash
   npm run dev
   ```

5. **Uygulamayı aç**: http://localhost:5173

---

## API Anahtarları

### Firebase Kurulumu
1. https://console.firebase.google.com adresinde yeni proje oluştur
2. Authentication (Anonim ve Email/Şifre) aktif et
3. Firestore Database oluştur
4. Storage aktif et
5. Firebase yapılandırmasını `.env` dosyasına ekle

### Plant.id API Kurulumu
1. https://web.plant.id/ adresinde kayıt ol
2. Dashboard'dan API anahtarını al
3. `.env` dosyasına `VITE_PLANTID_API_KEY` olarak ekle

---

## Özellikler

✅ **AI Bitki Tanıma** - Fotoğrafla anında bitki tanımlama
✅ **Dijital Bahçe** - Bitki koleksiyonunu yönetme
✅ **Sulama Takvimi** - Otomatik sulama hatırlatıcıları
✅ **Hastalık Teşhisi** - Premium özellik (gelecek)
✅ **Offline Destek** - LocalStorage ile çevrimdışı çalışma
✅ **Modern UI** - Tailwind CSS ile responsive tasarım

---

## Lisans

Copyright © 2026 Flora Team. Tüm hakları saklıdır.
