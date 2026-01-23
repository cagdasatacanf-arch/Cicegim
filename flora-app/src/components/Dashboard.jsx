import React from 'react';
import { Leaf, Droplets, CheckCircle2, Plus, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Dashboard = ({ onNavigate }) => {
  const { plants, waterPlant, getPlantsNeedingWater, isPremium } = useApp();
  const plantsNeedingWater = getPlantsNeedingWater();

  const formatNextWatering = (plant) => {
    if (!plant.lastWatered || !plant.wateringInterval) return 'Not set';

    const lastWatered = new Date(plant.lastWatered);
    const nextDate = new Date(lastWatered);
    nextDate.setDate(nextDate.getDate() + plant.wateringInterval);

    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Needs watering!';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-28 pt-4 space-y-6 animate-in fade-in duration-500">
      {/* Premium Banner */}
      {!isPremium && (
        <div
          onClick={() => onNavigate('paywall')}
          className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 rounded-3xl text-white flex justify-between items-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Zap className="fill-current" size={20} />
            <span className="text-sm font-bold">Unlock Health Diagnosis</span>
          </div>
          <ChevronRight size={20} />
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-[#1B4332] rounded-5xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Your Plants Are Happy!</h2>
          <p className="text-green-200 text-sm mb-6">
            {plantsNeedingWater.length === 0
              ? 'No plants need watering today'
              : `${plantsNeedingWater.length} plant${plantsNeedingWater.length > 1 ? 's' : ''} need${plantsNeedingWater.length === 1 ? 's' : ''} watering`}
          </p>
          <div className="flex gap-2">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
              <ShieldCheck size={12} /> Health Score: {plants.length > 0 ? '94%' : '0%'}
            </div>
          </div>
        </div>
        <Leaf className="absolute -right-10 -bottom-10 text-white/5 w-48 h-48 rotate-12" />
      </div>

      {/* Plants List */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800 px-2">My Collection</h3>

        {plants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-5xl border border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-medium">No plants added yet</p>
            <p className="text-slate-300 text-sm mt-2">Tap the camera button to identify your first plant</p>
          </div>
        ) : (
          plants.map((plant) => {
            const needsWater = plantsNeedingWater.some(p => p.id === plant.id);

            return (
              <div
                key={plant.id}
                onClick={() => onNavigate('detail', plant)}
                className="bg-white p-4 rounded-4xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <img
                  src={plant.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=400'}
                  alt={plant.nickname || plant.commonName}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-lg truncate">
                    {plant.nickname || plant.commonName}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2 italic truncate">
                    {plant.scientificName}
                  </p>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md w-fit ${
                    needsWater
                      ? 'text-red-600 bg-red-50'
                      : 'text-green-600 bg-green-50'
                  }`}>
                    <CheckCircle2 size={10} />
                    {needsWater ? 'Needs Water' : formatNextWatering(plant)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    waterPlant(plant.id);
                  }}
                  className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <Droplets size={20} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
