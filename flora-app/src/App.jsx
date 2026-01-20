import React, { useState, useEffect } from 'react';
import { Leaf, Camera, Calendar, Search, Settings } from 'lucide-react';
import { AppProvider } from './contexts/AppContext';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ScanCamera from './components/ScanCamera';
import PlantDetail from './components/PlantDetail';
import Paywall from './components/Paywall';

function FloraApp() {
  const [view, setView] = useState('home');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('flora_onboarding_complete');
    if (hasCompletedOnboarding) {
      setShowOnboarding(false);
    }
  }, []);

  const handleNavigate = (newView, data = null) => {
    if (newView === 'detail') {
      setSelectedPlant(data);
    } else if (newView === 'paywall') {
      setShowPaywall(true);
      return;
    }
    setView(newView);
  };

  const handleBack = () => {
    setView('home');
    setSelectedPlant(null);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col max-w-md mx-auto shadow-2xl relative font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      {view === 'home' && (
        <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-[#1B4332]">Flora</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Your Garden Guardian</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Search size={18} className="text-slate-600" />
            </button>
            <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Settings size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'home' && <Dashboard onNavigate={handleNavigate} />}
        {view === 'scan' && <ScanCamera onNavigate={handleNavigate} onBack={handleBack} />}
        {view === 'detail' && selectedPlant && (
          <PlantDetail plant={selectedPlant} onBack={handleBack} />
        )}
      </div>

      {/* Bottom Navigation */}
      {view !== 'scan' && (
        <div className="bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-12 py-5 pb-10 flex justify-between items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
          <button
            onClick={() => handleNavigate('home')}
            className={`transition-colors ${
              view === 'home' ? 'text-green-800' : 'text-slate-300'
            }`}
          >
            <Leaf size={28} fill={view === 'home' ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => handleNavigate('scan')}
            className="bg-[#1B4332] text-white w-16 h-16 rounded-full flex items-center justify-center -mt-16 border-8 border-[#F8FAF8] shadow-2xl active:scale-90 transition-all hover:shadow-3xl"
          >
            <Camera size={30} />
          </button>

          <button className="text-slate-300">
            <Calendar size={28} />
          </button>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <FloraApp />
    </AppProvider>
  );
}

export default App;
