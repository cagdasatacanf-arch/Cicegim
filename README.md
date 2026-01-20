# Çiçeğim: Gemini AI Destekli Bitki Bakım Uygulaması

**AI-Powered Plant Care & Identification App**

Bu proje, kullanıcıların bitkilerini Google Gemini AI ile tanıdığı, hastalık teşhisi koyduğu ve kişiselleştirilmiş bakım takvimleri ile bitkilerini hayatta tuttuğu modern bir mobil web uygulamasıdır.

---

## 1. Proje Vizyonu

Kullanıcıların bitkilerini Gemini AI ile tanıdığı, hastalık teşhisi koyduğu ve kişiselleştirilmiş bakım takvimleri ile bitkilerini hayatta tuttuğu sade ve kullanıcı dostu bir deneyim.

---

## 2. Teknik Yığın (Tech Stack)

- **Framework**: React (Vite) + Tailwind CSS
- **İkon Seti**: Lucide React
- **Yapay Zeka**: **Google Gemini 2.0 Flash Exp**
- **State**: React useState + LocalStorage Persistence
- **Dil**: Türkçe arayüz

---

## 3. Kullanıcı Akışı ve Fonksiyonlar

### A. Ana Ekran (Home)
- Durum kartı ile bitki sayısı özeti
- Eklenen bitkilerin listesi
- Sulama durumu göstergeleri (SU ZAMANI / İYİ)
- Tek tıkla sulama işareti

### B. AI Tanıma & Teşhis (Ana Fonksiyon)
- Kamera erişimi ve fotoğraf yükleme
- **Gemini 2.0 Flash API** entegrasyonu
- Base64 görüntü gönderimi
- JSON formatında yapılandırılmış yanıt:
  - Bitki adı (Türkçe)
  - Bilimsel adı
  - Sulama sıklığı (gün)
  - Sağlık durumu
  - Bakım ipuçları

### C. Bitki Detay Sayfası
- Büyük bitki fotoğrafı
- Sulama, ısı, ve sağlık durumu kartları
- Gemini AI'dan gelen bakım önerileri
- Sulama işareti ve silme butonları

---

## 4. Veri Mimarisi (LocalStorage)

### localStorage Key: `cicegim_gemini_db`
Bitki array'i saklanır:
```json
[
  {
    "id": "timestamp_string",
    "commonName": "Barış Çiçeği",
    "scientificName": "Spathiphyllum",
    "wateringInterval": 7,
    "healthStatus": "İyi",
    "careTips": "Haftada bir sulayın...",
    "image": "data:image/jpeg;base64,...",
    "lastWatered": "2026-01-20T10:30:00.000Z"
  }
]
```

---

## 5. Özellikler

### ✅ Tamamlanan Özellikler
- **Gemini AI Entegrasyonu**: Görüntü analizi ve bitki tanıma
- **Üstel Geri Çekilme** (Exponential Backoff): API hata yönetimi
- **LocalStorage**: Offline veri saklama
- **Responsive Tasarım**: Mobil-first yaklaşım
- **Türkçe Arayüz**: Tam Türkçe kullanıcı deneyimi
- **Sulama Takibi**: Otomatik sulama zamanı hesaplama
- **Hata Yönetimi**: Toast bildirimleri
- **Loading States**: Animasyonlu yükleme ekranları

### 🔜 Gelecek Özellikler
- Firebase entegrasyonu (senkronizasyon)
- Push notification (sulama hatırlatıcıları)
- Hastalık teşhisi (premium)
- Bitki takvimi görünümü

---

## Kurulum

### 1. Proje Klasörüne Git
```bash
cd flora-app
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Gemini API Anahtarı Al
1. https://aistudio.google.com/app/apikey adresine git
2. "Create API Key" butonuna tıkla
3. Anahtarını kopyala

### 4. Çevre Değişkenlerini Ayarla
```bash
cp .env.example .env
```

`.env` dosyasını düzenle:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

### 6. Uygulamayı Aç
Tarayıcıda: http://localhost:5173

---

## Proje Yapısı

```
Cicegim/
├── flora-app/              # Ana uygulama
│   ├── src/
│   │   └── App.jsx        # Tüm uygulama (tek dosya)
│   ├── .env.example       # Çevre değişkenleri şablonu
│   ├── .env               # API anahtarlarınız (git'e eklemeyin!)
│   └── README.md          # Uygulama dokümantasyonu
└── README.md              # Bu dosya
```

---

## Gemini API Detayları

### Kullanılan Model
```javascript
const GEMINI_MODEL = "gemini-2.0-flash-exp";
```

### API Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

### Özellikler
- **Vision Capability**: Görüntü analizi
- **Structured Output**: JSON formatında yanıt
- **Retry Logic**: 5 deneme, üstel geri çekilme
- **Error Handling**: Detaylı hata mesajları
- **Prompt Engineering**: Bitki uzmanlığı için özelleştirilmiş prompt

### Maliyet
- **Gemini 2.0 Flash**: Ücretsiz tier ile günde ~1500 istek
- **Input**: Görüntü + metin
- **Output**: JSON (yaklaşık 100-200 token)

---

## Kullanım

### 1. Bitki Ekleme
1. Ana ekranda `+` butonuna bas
2. Fotoğraf çek veya galeriden seç
3. Gemini AI analiz edecek (5-10 saniye)
4. Bitki otomatik eklenecek

### 2. Sulama İşareti
- Liste görünümünde su damlası ikonuna tıkla
- Veya detay sayfasında "SULANDI OLARAK İŞARETLE"

### 3. Bitki Detayları
- Listedeki bir bitkiye tıkla
- Bakım ipuçlarını oku
- Sulama sıklığını kontrol et

### 4. Bitki Silme
- Detay sayfasında "Bitkiyi Sil" butonuna tıkla

---

## Teknik Detaylar

### State Yönetimi
- **useState**: Lokal state
- **useEffect**: LocalStorage sync
- **No Context**: Basit yapı, tek component

### Stil
- **Tailwind CSS v3**: Utility-first
- **Forest Green**: #1B4332 (ana renk)
- **Rounded Corners**: 2rem+ yumuşak köşeler
- **Shadows**: Soft, modern gölgeler

### Optimizasyonlar
- Base64 image storage (ileride cloud storage)
- Lazy loading yok (tek sayfa)
- LocalStorage limiti: ~5MB (yaklaşık 50-100 bitki)

---

## Sorun Giderme

### API Anahtarı Hatası
```
❌ "API hatası" veya "Gemini'den yanıt alınamadı"
✅ .env dosyasında VITE_GEMINI_API_KEY kontrolü
✅ Sunucuyu yeniden başlat (npm run dev)
```

### JSON Parse Hatası
```
❌ JSON parse edilemiyor
✅ Gemini yanıtı markdown içerebilir
✅ Kod otomatik ```json``` bloklarını temizler
```

### Görüntü Yüklenmiyor
```
❌ Base64 image gösterilmiyor
✅ Tarayıcı konsolu kontrol et
✅ Dosya boyutu <5MB olmalı
```

---

## Geliştirme Notları

### Değişiklikler (v2.0)
- ❌ Plant.id API kaldırıldı
- ✅ Gemini 2.0 Flash eklendi
- ❌ Firebase auth/firestore kaldırıldı (şimdilik)
- ❌ Ayrı componentler birleştirildi
- ✅ Türkçe arayüz
- ✅ "Çiçeğim" branding

### Neden Gemini?
1. **Ücretsiz**: Günde 1500 istek
2. **Hızlı**: 2-3 saniye yanıt
3. **Doğru**: Vision + Language model
4. **Kolay**: Tek endpoint, basit API
5. **Güncel**: Gemini 2.0 en yeni model

---

## Lisans

Copyright © 2026 Çiçeğim Team. Tüm hakları saklıdır.

---

## Linkler

- **Gemini AI Studio**: https://aistudio.google.com
- **API Docs**: https://ai.google.dev/docs
- **Lucide Icons**: https://lucide.dev
- **Tailwind CSS**: https://tailwindcss.com
