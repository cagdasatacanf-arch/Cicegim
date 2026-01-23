import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf, Droplets, Camera, Plus, Search, Settings,
  CheckCircle2, AlertCircle, ChevronRight,
  ArrowLeft, Trash2, ShieldCheck, Thermometer, Sun,
  Loader2, RefreshCcw, Calendar, Info, X, Image
} from 'lucide-react';

// --- GEMINI API AYARLARI ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash-exp";

/**
 * GEMINI API SERVİSİ
 * Görüntüyü analiz eder ve yapılandırılmış JSON döner.
 */
const identifyWithGemini = async (base64Image) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const systemPrompt = `Bir bitki uzmanısın. Gönderilen fotoğraftaki bitkiyi tanı ve detaylı bilgi ver.
  Yanıtı sadece şu JSON formatında ver:
  {
    "commonName": "Bitki Türkçe Adı",
    "scientificName": "Scientific Name",
    "family": "Bitki Ailesi (örn: Cactaceae, Araceae)",
    "origin": "Orijin bölgeler (örn: Güney Amerika tropikal ormanları, Akdeniz havzası)",
    "description": "Bitkinin genel özellikleri ve görünümü hakkında 2-3 cümlelik açıklama",
    "wateringInterval": 7,
    "lightRequirement": "Işık ihtiyacı (örn: Parlak dolaylı ışık, Gölge, Doğrudan güneş)",
    "temperature": "İdeal sıcaklık aralığı (örn: 18-24°C)",
    "humidity": "Nem ihtiyacı (örn: Yüksek, Orta, Düşük)",
    "toxicity": "Toksiklik durumu (örn: Evcil hayvanlar için zehirli, İnsan dostu, Zararsız)",
    "growthRate": "Büyüme hızı (örn: Hızlı, Orta, Yavaş)",
    "healthStatus": "İyi/Sorunlu",
    "careTips": "Önemli bakım önerileri",
    "commonIssues": "Sık karşılaşılan sorunlar ve çözümleri"
  }`;

  const payload = {
    contents: [{
      parts: [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048,
    }
  };

  // Üstel geri çekilme ile hata yönetimi (Exponential Backoff)
  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API hatası");
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini'den yanıt alınamadı");
      }

      // JSON'u çıkar (markdown code block içinde olabilir)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(text);
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  return fetchWithRetry();
};

export default function App() {
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('cicegim_gemini_db');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [error, setError] = useState(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('cicegim_gemini_db', JSON.stringify(plants));
  }, [plants]);

  // Yeni Bitki Analizi
  const handleIdentify = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          const result = await identifyWithGemini(base64);
          const newPlant = {
            id: Date.now().toString(),
            ...result,
            image: base64,
            lastWatered: new Date().toISOString()
          };
          setPlants([newPlant, ...plants]);
          setLoading(false);
          setView('home');
        } catch (err) {
          console.error('Gemini API Error:', err);
          setError(err.message || "Bitki tanınamadı. Lütfen daha net bir fotoğraf deneyin.");
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Dosya işlenirken hata oluştu.");
      setLoading(false);
    }
  };

  const getWateringStatus = (plant) => {
    const diff = new Date() - new Date(plant.lastWatered);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= plant.wateringInterval ? 'urgent' : 'ok';
  };

  const waterPlant = (id) => {
    setPlants(plants.map(p =>
      p.id === id ? { ...p, lastWatered: new Date().toISOString() } : p
    ));
  };

  const deletePlant = (id) => {
    setPlants(plants.filter(p => p.id !== id));
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden font-sans text-slate-900">

      {/* HEADER */}
      {view === 'home' && (
        <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Çiçeğim Logo" className="w-12 h-12 rounded-2xl" />
            <div>
              <h1 className="text-2xl font-black text-[#1B4332]">Çiçeğim</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini AI Destekli</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
            <Settings size={18} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* VIEW RENDERER */}
      <div className="flex-1 overflow-y-auto pb-24">
        {view === 'home' && (
          <div className="p-6 space-y-6">
            {/* Durum Kartı */}
            <div className="bg-[#1B4332] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-1">Selam!</h2>
              <p className="text-green-200 text-sm">
                {plants.length > 0 ? `${plants.length} bitkiniz güvende.` : "Henüz bitki eklemediniz."}
              </p>
              <Leaf className="absolute -right-6 -bottom-6 text-white/10 w-32 h-32 rotate-12" />
            </div>

            {/* Bilgi Banner */}
            {!GEMINI_API_KEY && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">API Anahtarı Gerekli</p>
                  <p>Gemini API anahtarınızı .env dosyasına ekleyin (VITE_GEMINI_API_KEY)</p>
                </div>
              </div>
            )}

            {/* Liste */}
            {plants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-medium">Henüz bitki eklemediniz</p>
                <p className="text-slate-300 text-sm mt-2">Kamera butonuna basarak ilk bitkinizi ekleyin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plants.map(plant => (
                  <div
                    key={plant.id}
                    onClick={() => { setSelectedPlant(plant); setView('detail'); }}
                    className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <img src={plant.image} alt={plant.commonName} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{plant.commonName}</h4>
                      <p className="text-xs text-slate-400 italic truncate">{plant.scientificName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          getWateringStatus(plant) === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                        }`}>
                          {getWateringStatus(plant) === 'urgent' ? 'SU ZAMANI' : 'İYİ'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); waterPlant(plant.id); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        getWateringStatus(plant) === 'urgent' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                      }`}
                    >
                      <Droplets size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'detail' && selectedPlant && (
          <div className="animate-in slide-in-from-right duration-300 pb-24 bg-white min-h-screen">
            <div className="relative h-80">
              <img src={selectedPlant.image} alt={selectedPlant.commonName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={() => setView('home')}
                className="absolute top-12 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
            <div className="px-8 -mt-12 relative z-10 bg-white rounded-t-[3rem] pt-8 space-y-6">
              {/* Plant Name & Scientific Info */}
              <div>
                <h2 className="text-3xl font-black text-[#1B4332] mb-1">{selectedPlant.commonName}</h2>
                <p className="text-slate-400 italic mb-2">{selectedPlant.scientificName}</p>
                {selectedPlant.family && (
                  <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <Leaf size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700">{selectedPlant.family}</span>
                  </div>
                )}
              </div>

              {/* Origin Section */}
              {selectedPlant.origin && (
                <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-5 rounded-3xl text-white">
                  <h4 className="font-black text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="text-xl">🌍</span> Orijin
                  </h4>
                  <p className="text-green-100 text-sm leading-relaxed">{selectedPlant.origin}</p>
                </div>
              )}

              {/* Description */}
              {selectedPlant.description && (
                <div className="space-y-2">
                  <h4 className="font-bold flex items-center gap-2 text-slate-800">
                    <Info size={18} className="text-[#1B4332]" /> Hakkında
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                    {selectedPlant.description}
                  </p>
                </div>
              )}

              {/* Care Requirements Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">Bakım Gereksinimleri</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <Droplets size={20} className="mb-2 text-blue-600" />
                    <p className="text-[10px] text-blue-400 uppercase font-black mb-1">SULAMA</p>
                    <p className="text-xs font-bold text-blue-900">{selectedPlant.wateringInterval} Günde Bir</p>
                  </div>

                  {selectedPlant.lightRequirement && (
                    <div className="bg-amber-50 p-4 rounded-2xl">
                      <Sun size={20} className="mb-2 text-amber-500" />
                      <p className="text-[10px] text-amber-400 uppercase font-black mb-1">IŞIK</p>
                      <p className="text-xs font-bold text-amber-900">{selectedPlant.lightRequirement}</p>
                    </div>
                  )}

                  {selectedPlant.temperature && (
                    <div className="bg-red-50 p-4 rounded-2xl">
                      <Thermometer size={20} className="mb-2 text-red-500" />
                      <p className="text-[10px] text-red-400 uppercase font-black mb-1">SICAKLIK</p>
                      <p className="text-xs font-bold text-red-900">{selectedPlant.temperature}</p>
                    </div>
                  )}

                  {selectedPlant.humidity && (
                    <div className="bg-cyan-50 p-4 rounded-2xl">
                      <Droplets size={20} className="mb-2 text-cyan-500" />
                      <p className="text-[10px] text-cyan-400 uppercase font-black mb-1">NEM</p>
                      <p className="text-xs font-bold text-cyan-900">{selectedPlant.humidity}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                {selectedPlant.healthStatus && (
                  <div className="bg-green-50 p-3 rounded-2xl text-center">
                    <ShieldCheck size={18} className="mx-auto mb-1 text-green-600" />
                    <p className="text-[9px] text-green-400 uppercase font-black">SAĞLIK</p>
                    <p className="text-xs font-bold text-green-900 mt-1">{selectedPlant.healthStatus}</p>
                  </div>
                )}

                {selectedPlant.growthRate && (
                  <div className="bg-purple-50 p-3 rounded-2xl text-center">
                    <span className="text-xl block mb-1">📈</span>
                    <p className="text-[9px] text-purple-400 uppercase font-black">BÜYÜME</p>
                    <p className="text-xs font-bold text-purple-900 mt-1">{selectedPlant.growthRate}</p>
                  </div>
                )}

                {selectedPlant.toxicity && (
                  <div className="bg-orange-50 p-3 rounded-2xl text-center">
                    <AlertCircle size={18} className="mx-auto mb-1 text-orange-500" />
                    <p className="text-[9px] text-orange-400 uppercase font-black">TOKSİSİTE</p>
                    <p className="text-xs font-bold text-orange-900 mt-1 leading-tight">{selectedPlant.toxicity}</p>
                  </div>
                )}
              </div>

              {/* Care Tips */}
              {selectedPlant.careTips && (
                <div className="space-y-2">
                  <h4 className="font-bold flex items-center gap-2 text-slate-800">
                    <span className="text-lg">💡</span> Bakım İpuçları
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-green-50/70 p-4 rounded-2xl border-l-4 border-green-500">
                    {selectedPlant.careTips}
                  </p>
                </div>
              )}

              {/* Common Issues */}
              {selectedPlant.commonIssues && (
                <div className="space-y-2">
                  <h4 className="font-bold flex items-center gap-2 text-slate-800">
                    <AlertCircle size={18} className="text-amber-600" /> Dikkat Edilmesi Gerekenler
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/70 p-4 rounded-2xl border-l-4 border-amber-500">
                    {selectedPlant.commonIssues}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => waterPlant(selectedPlant.id)}
                  className="w-full bg-[#2D6A4F] text-white py-4 rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
                >
                  💧 SULANDI OLARAK İŞARETLE
                </button>

                <button
                  onClick={() => deletePlant(selectedPlant.id)}
                  className="w-full text-red-400 text-xs font-bold py-4 flex items-center justify-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} /> Bitkiyi Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-[#1B4332]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-white p-10 text-center">
          <Loader2 className="animate-spin mb-6" size={48} />
          <h3 className="text-2xl font-black mb-2">Gemini Analiz Ediyor</h3>
          <p className="text-green-200 text-sm">Bitki veritabanı taranıyor, hastalıklar kontrol ediliyor...</p>
        </div>
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="fixed bottom-24 left-6 right-6 bg-red-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom z-50">
          <span className="text-xs font-bold">{error}</span>
          <button onClick={() => setError(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* PHOTO MENU MODAL */}
      {showPhotoMenu && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-in fade-in"
          onClick={() => setShowPhotoMenu(false)}
        >
          <div
            className="bg-white w-full rounded-t-[2.5rem] p-6 pb-10 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-slate-800 mb-4 text-center">Fotoğraf Seç</h3>

            <div className="space-y-3">
              {/* Camera Option */}
              <button
                onClick={() => {
                  cameraInputRef.current?.click();
                  setShowPhotoMenu(false);
                }}
                className="w-full bg-[#1B4332] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-[#2D6A4F] transition-all active:scale-[0.98]"
              >
                <Camera size={24} />
                Fotoğraf Çek
              </button>

              {/* Gallery Option */}
              <button
                onClick={() => {
                  galleryInputRef.current?.click();
                  setShowPhotoMenu(false);
                }}
                className="w-full bg-slate-100 text-slate-800 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                <Image size={24} />
                Galeriden Seç
              </button>
            </div>

            <button
              onClick={() => setShowPhotoMenu(false)}
              className="w-full text-slate-400 font-bold py-3 mt-4"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN FILE INPUTS */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleIdentify}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleIdentify}
      />

      {/* BOTTOM NAV */}
      {view === 'home' && (
        <div className="bg-white border-t border-slate-100 px-12 py-6 pb-10 flex justify-between items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
          <button className="text-[#1B4332]">
            <Leaf size={28} fill="currentColor" />
          </button>
          <button
            onClick={() => setShowPhotoMenu(true)}
            className="bg-[#1B4332] text-white w-16 h-16 rounded-full flex items-center justify-center -mt-16 border-8 border-[#F8FAF8] shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={32} />
          </button>
          <button className="text-slate-300">
            <Calendar size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
