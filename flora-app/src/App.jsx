import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf, Droplets, Camera, Plus, Search, Settings,
  CheckCircle2, AlertCircle, ChevronRight, ChevronLeft,
  ArrowLeft, Trash2, ShieldCheck, Thermometer, Sun,
  Loader2, RefreshCcw, Calendar, Info, X, Image,
  Home, Flower2, Check, Sparkles, Share2, Scissors, Sprout, ShoppingCart, Activity,
  Cloud, CloudRain, Snowflake, SunMedium, Clock, MapPin, RotateCcw, User
} from 'lucide-react';

// --- GEMINI API AYARLARI ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * GEMINI API SERVİSİ
 * Görüntüyü analiz eder ve yapılandırılmış JSON döner.
 */
const identifyWithGemini = async (base64Image) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const systemPrompt = `Bir bitki uzmanısın. Gönderilen fotoğraftaki bitkiyi tanı ve detaylı bilgi ver. Ayrıca sağlık durumunu analiz et.
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
    "healthStatus": "İyi" veya "Sorunlu",
    "careTips": "Önemli bakım önerileri",
    "commonIssues": "Sık karşılaşılan sorunlar ve çözümleri",
    "treatmentPlan": {
      "problemName": "Hastalık/Sorun Adı (Örn: Kök Çürümesi)",
      "severity": "Yüksek" veya "Orta" veya "Düşük",
      "confidence": 95,
      "recoveryTime": "3 Hafta",
      "steps": [
        { "title": "Adım Başlığı", "description": "Detaylı açıklama" }
      ],
      "products": [
        { "name": "Ürün Adı", "price": "₺120" }
      ]
    }
  }
  Not: Eğer bitki sağlıklıysa ("İyi"), treatmentPlan null olabilir.`;

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState([]);
  const [skippedTasks, setSkippedTasks] = useState([]);
  const [seasonMode, setSeasonMode] = useState(() => {
    // Determine season based on current month
    const month = new Date().getMonth();
    return (month >= 10 || month <= 2) ? 'winter' : 'summer';
  });
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'urgent', 'upcoming', 'done'
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Weather API - Open-Meteo (Free, no API key needed)
  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
            );
            const data = await response.json();

            // Weather codes: 0-3 clear, 45-48 fog, 51-67 rain/drizzle, 71-77 snow, 80-99 showers
            const code = data.current?.weather_code || 0;
            const isRainy = code >= 51 && code <= 99;
            const temp = Math.round(data.current?.temperature_2m || 20);

            setWeather({
              temp,
              isRainy,
              condition: isRainy ? 'Yağmurlu' : code >= 71 ? 'Karlı' : code >= 45 ? 'Sisli' : 'Açık',
              code
            });
            setWeatherLoading(false);
          },
          () => {
            // Geolocation failed, use default (Istanbul)
            fetchWeatherDefault();
          }
        );
      } else {
        fetchWeatherDefault();
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setWeatherLoading(false);
    }
  };

  const fetchWeatherDefault = async () => {
    try {
      // Default to Istanbul coordinates
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=auto`
      );
      const data = await response.json();
      const code = data.current?.weather_code || 0;
      const isRainy = code >= 51 && code <= 99;
      const temp = Math.round(data.current?.temperature_2m || 20);

      setWeather({
        temp,
        isRainy,
        condition: isRainy ? 'Yağmurlu' : code >= 71 ? 'Karlı' : code >= 45 ? 'Sisli' : 'Açık',
        code
      });
    } catch (err) {
      console.error('Weather default fetch error:', err);
    }
    setWeatherLoading(false);
  };

  // Fetch weather when schedule view is opened
  useEffect(() => {
    if (view === 'schedule' && !weather) {
      fetchWeather();
    }
  }, [view]);

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

  // Calendar Helper Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getTurkishMonth = (date) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const getTodaysTasks = () => {
    const today = new Date();
    return plants.filter(plant => {
      const lastWatered = new Date(plant.lastWatered);
      const daysSinceWatered = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
      return daysSinceWatered >= plant.wateringInterval - 1; // Due today or overdue
    }).map(plant => ({
      ...plant,
      taskType: getWateringStatus(plant) === 'urgent' ? 'Sulama Zamanı' : 'Kontrol Et',
      taskIcon: getWateringStatus(plant) === 'urgent' ? 'water' : 'check'
    }));
  };

  const toggleTaskComplete = (plantId) => {
    if (completedTasks.includes(plantId)) {
      setCompletedTasks(completedTasks.filter(id => id !== plantId));
    } else {
      setCompletedTasks([...completedTasks, plantId]);
      waterPlant(plantId);
    }
  };

  const getDateHasTasks = (day) => {
    // Check if any plant needs watering on this day
    const checkDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return plants.some(plant => {
      const lastWatered = new Date(plant.lastWatered);
      const nextWatering = new Date(lastWatered);
      nextWatering.setDate(nextWatering.getDate() + plant.wateringInterval);
      return nextWatering.toDateString() === checkDate.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden font-sans text-slate-900">

      {/* HEADER */}
      {view === 'home' && (
        <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <img src="/cicegim-logo.jpg" alt="Çiçeğim Logo" className="w-14 h-14 rounded-2xl shadow-md object-cover" />
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getWateringStatus(plant) === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                          }`}>
                          {getWateringStatus(plant) === 'urgent' ? 'SU ZAMANI' : 'İYİ'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); waterPlant(plant.id); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${getWateringStatus(plant) === 'urgent' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'
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

                {selectedPlant.healthStatus === "Sorunlu" && selectedPlant.treatmentPlan && (
                  <button
                    onClick={() => setView('treatment')}
                    className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Activity size={20} />
                    TEDAVİ PLANINI GÖRÜNTÜLE
                  </button>
                )}

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

        {/* AKILLI SULAMA TAKVİMİ (SMART WATERING CALENDAR) VIEW */}
        {view === 'schedule' && (
          <div className="animate-in slide-in-from-right duration-300 bg-[#0D1F17] min-h-screen">
            {/* Header */}
            <div className="bg-[#0D1F17] px-6 pt-14 pb-4 flex justify-between items-center">
              <button
                onClick={() => setView('home')}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-bold text-white">Çiçeğim Takvim</h1>
              <button className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white">
                <User size={20} />
              </button>
            </div>

            {/* Month & Week Navigation */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{getTurkishMonth(selectedDate)}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Horizontal Week View */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {(() => {
                  const today = new Date();
                  const weekDays = [];
                  const dayNames = ['PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];

                  // Show current week (3 days before, today, 3 days after)
                  for (let i = -3; i <= 3; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    const dayNum = date.getDate();
                    const dayName = dayNames[date.getDay()];
                    const isToday = i === 0;

                    // Check task status for this day
                    const tasksForDay = plants.filter(plant => {
                      const lastWatered = new Date(plant.lastWatered);
                      const nextWatering = new Date(lastWatered);
                      const interval = seasonMode === 'winter'
                        ? Math.ceil(plant.wateringInterval * 1.5)
                        : plant.wateringInterval;
                      nextWatering.setDate(nextWatering.getDate() + interval);
                      return nextWatering.toDateString() === date.toDateString();
                    });

                    const hasUrgent = tasksForDay.some(p => getWateringStatus(p) === 'urgent');
                    const hasDone = tasksForDay.some(p => completedTasks.includes(p.id));
                    const hasTask = tasksForDay.length > 0;

                    // Determine dot color
                    let dotColor = '';
                    if (hasDone) dotColor = 'bg-green-500';
                    else if (hasUrgent) dotColor = 'bg-red-500';
                    else if (hasTask) dotColor = 'bg-yellow-500';

                    weekDays.push(
                      <div
                        key={i}
                        className={`flex flex-col items-center min-w-[50px] py-2 px-3 rounded-2xl transition-all ${isToday
                          ? 'bg-[#2D6A4F] text-white'
                          : 'text-white/60 hover:bg-white/5'
                          }`}
                      >
                        <span className="text-xs font-medium mb-1">{dayName}</span>
                        <span className={`text-lg font-bold ${isToday ? 'text-white' : ''}`}>{dayNum}</span>
                        {dotColor && (
                          <div className={`w-2 h-2 ${dotColor} rounded-full mt-1`}></div>
                        )}
                      </div>
                    );
                  }
                  return weekDays;
                })()}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="px-6 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setTaskFilter('urgent')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${taskFilter === 'urgent'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  <AlertCircle size={14} />
                  Acil
                </button>
                <button
                  onClick={() => setTaskFilter('upcoming')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${taskFilter === 'upcoming'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  <Clock size={14} />
                  Yaklaşan
                </button>
                <button
                  onClick={() => setTaskFilter('done')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${taskFilter === 'done'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  <Check size={14} />
                  Tamamlandı
                </button>
              </div>
            </div>

            {/* Weather Card */}
            <div className="px-6 pb-4">
              <div className="bg-[#1A3328] rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  {weatherLoading ? (
                    <Loader2 className="animate-spin text-white/50" size={24} />
                  ) : weather?.isRainy ? (
                    <CloudRain className="text-blue-400" size={24} />
                  ) : (
                    <Cloud className="text-white/70" size={24} />
                  )}
                  <span className="text-white font-bold">
                    {weather ? `${weather.condition} - ${weather.temp}°C` : 'Hava durumu yükleniyor...'}
                  </span>
                </div>
                {weather?.isRainy && (
                  <p className="text-white/60 text-sm mb-3">
                    AI: Dış mekan balkon bitkileri için sulama duraklatıldı
                  </p>
                )}
                <button
                  onClick={fetchWeather}
                  className="bg-[#2D6A4F] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#3D7A5F] transition-colors"
                >
                  Detaylar
                </button>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="px-6 pb-40">
              <h3 className="text-xl font-bold text-white mb-4">Bugünün Görevleri</h3>

              {(() => {
                const allTasks = getTodaysTasks().map(task => ({
                  ...task,
                  isOutdoor: task.lightRequirement?.toLowerCase().includes('güneş') ||
                    task.lightRequirement?.toLowerCase().includes('outdoor') ||
                    task.origin?.toLowerCase().includes('bahçe'),
                  isSkipped: skippedTasks.includes(task.id),
                  isCompleted: completedTasks.includes(task.id),
                  waterAmount: Math.round(150 + Math.random() * 150) // Simulated water amount
                }));

                // Apply filter
                let filteredTasks = allTasks;
                if (taskFilter === 'urgent') {
                  filteredTasks = allTasks.filter(t => getWateringStatus(t) === 'urgent' && !t.isCompleted);
                } else if (taskFilter === 'upcoming') {
                  filteredTasks = allTasks.filter(t => getWateringStatus(t) !== 'urgent' && !t.isCompleted);
                } else if (taskFilter === 'done') {
                  filteredTasks = allTasks.filter(t => t.isCompleted);
                }

                if (filteredTasks.length === 0) {
                  return (
                    <div className="text-center py-12 bg-[#1A3328] rounded-3xl">
                      <Sparkles className="mx-auto text-green-400 mb-3" size={40} />
                      <p className="text-white/70 font-medium">
                        {taskFilter === 'done' ? 'Henüz tamamlanan görev yok' :
                          taskFilter === 'urgent' ? 'Acil görev yok!' :
                            taskFilter === 'upcoming' ? 'Yaklaşan görev yok' :
                              'Bugün görev yok!'}
                      </p>
                      <p className="text-white/40 text-sm mt-1">
                        {taskFilter === 'all' && 'Tüm bitkileriniz bakımlı'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className={`bg-[#1A3328] rounded-2xl overflow-hidden transition-all ${task.isCompleted ? 'opacity-60' : ''
                          }`}
                      >
                        <div className="p-4 flex items-center gap-4">
                          <img
                            src={task.image}
                            alt={task.commonName}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-white truncate">{task.commonName}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.isOutdoor
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-green-500/20 text-green-400'
                                }`}>
                                {task.isOutdoor ? 'DIŞ MEKAN' : 'İÇ MEKAN'}
                              </span>
                            </div>
                            <p className="text-sm text-white/50">
                              {task.isCompleted
                                ? `Tamamlandı: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                                : task.isSkipped
                                  ? 'Yağmur nedeniyle atlandı'
                                  : weather?.isRainy && task.isOutdoor
                                    ? 'Yağmur nedeniyle atlandı'
                                    : `Şimdi ${task.waterAmount}ml su gerekiyor`
                              }
                            </p>
                          </div>
                          {task.isCompleted && (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Check size={18} className="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {!task.isCompleted && (
                          <div className="px-4 pb-4">
                            {(weather?.isRainy && task.isOutdoor) || task.isSkipped ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSkippedTasks([...skippedTasks, task.id])}
                                  className="flex-1 bg-white/10 text-white/70 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                                >
                                  Atla (Yağmur)
                                </button>
                                <button
                                  onClick={() => {
                                    setSkippedTasks(skippedTasks.filter(id => id !== task.id));
                                  }}
                                  className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                                >
                                  Yeniden Planla
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  waterPlant(task.id);
                                  toggleTaskComplete(task.id);
                                }}
                                className="w-full bg-[#4ADE80] text-[#0D1F17] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#5AEE90] transition-colors active:scale-[0.98]"
                              >
                                <Droplets size={18} />
                                Şimdi Sula
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Seasonal Mode Toggle - Fixed Bottom */}
            <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-6 z-30">
              <div className="bg-[#1A3328] rounded-2xl p-1 flex">
                <button
                  onClick={() => setSeasonMode('winter')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${seasonMode === 'winter'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-white/50 hover:text-white/70'
                    }`}
                >
                  <Snowflake size={16} />
                  Kış Modu
                </button>
                <button
                  onClick={() => setSeasonMode('summer')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${seasonMode === 'summer'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-white/50 hover:text-white/70'
                    }`}
                >
                  <SunMedium size={16} />
                  Yaz Modu
                </button>
              </div>
              <p className="text-center text-white/30 text-xs mt-2 uppercase tracking-wider">
                AI MEVSİME GÖRE SULAMA SIKLIĞINI AYARLIYOR
              </p>
            </div>
          </div>
        )}

        {/* TEDAVİ PLANI (TREATMENT PLAN) VIEW */}
        {view === 'treatment' && selectedPlant?.treatmentPlan && (
          <div className="animate-in slide-in-from-right duration-300 bg-[#F8FAF8] min-h-screen pb-32">
            {/* Header */}
            <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-50">
              <button
                onClick={() => setView('detail')}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-bold text-slate-800">Tedavi Planı</h1>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600">
                <Share2 size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Diagnosis Summary Card */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={selectedPlant.image} alt="Sorunlu Bitki" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-xl text-slate-800">{selectedPlant.treatmentPlan.problemName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${selectedPlant.treatmentPlan.severity === 'Yüksek' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                      }`}>
                      {selectedPlant.treatmentPlan.severity.toUpperCase()} ŞİDDET
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Teşhis: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • %{selectedPlant.treatmentPlan.confidence} Doğruluk
                  </p>
                  <div className="flex items-center gap-2 text-blue-500 text-xs font-bold">
                    <RefreshCcw size={14} />
                    <span>Tahmini İyileşme: {selectedPlant.treatmentPlan.recoveryTime}</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Treatment */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800">Adım Adım Tedavi</h3>
                <p className="text-sm text-slate-400 -mt-2">Bitkinizi kurtarmak için bu adımları izleyin</p>

                <div className="space-y-6 relative ml-4">
                  {/* Vertical Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-blue-100 z-0"></div>

                  {selectedPlant.treatmentPlan.steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex gap-4">
                      <div className="w-9 h-9 flex-shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {idx + 1}
                      </div>
                      <div className="bg-white p-4 rounded-2xl flex-1 shadow-sm border border-slate-50">
                        <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                          {idx === 0 && <Scissors size={14} className="text-blue-500" />}
                          {idx === 1 && <Sprout size={14} className="text-blue-500" />}
                          {idx === 2 && <Droplets size={14} className="text-blue-500" />}
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Products */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800">Önerilen Ürünler</h3>
                <div className="space-y-3">
                  {selectedPlant.treatmentPlan.products.map((product, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-[#1B4332]">
                        <Flower2 size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800">{product.name}</h4>
                        <p className="text-blue-500 font-bold text-xs">{product.price}</p>
                      </div>
                      <button className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white/80 backdrop-blur-md border-t border-slate-50 z-40">
              <button
                onClick={() => setView('detail')}
                className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <Activity size={24} />
                İyileşme Sürecini Takip Et
              </button>
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
      {(view === 'home' || view === 'schedule') && (
        <div className="bg-white border-t border-slate-100 px-6 py-4 pb-8 flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
          {/* Home Button */}
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${view === 'home' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Home size={24} />
            <span className="text-xs font-semibold">Ana Sayfa</span>
          </button>

          {/* Schedule Button */}
          <button
            onClick={() => setView('schedule')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${view === 'schedule' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Calendar size={24} />
            <span className="text-xs font-semibold">Takvim</span>
          </button>

          {/* Add Plant FAB */}
          <button
            onClick={() => setShowPhotoMenu(true)}
            className="bg-[#1B4332] text-white w-14 h-14 rounded-full flex items-center justify-center -mt-10 border-4 border-white shadow-xl hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={28} />
          </button>

          {/* My Plants Button */}
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${view === 'home' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Flower2 size={24} />
            <span className="text-xs font-semibold">Bitkilerim</span>
          </button>

          {/* Settings Button */}
          <button
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
          >
            <Settings size={24} />
            <span className="text-xs font-semibold">Ayarlar</span>
          </button>
        </div>
      )}
    </div>
  );
}
