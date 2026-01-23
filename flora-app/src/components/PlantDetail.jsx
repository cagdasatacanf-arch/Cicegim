import React, { useState } from 'react';
import { ArrowLeft, Trash2, Sun, Thermometer, Droplets, Edit3, Check, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const PlantDetail = ({ plant, onBack }) => {
  const { waterPlant, deletePlant, updatePlant, getNextWateringDate } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(plant.nickname || '');

  const handleWater = () => {
    waterPlant(plant.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove this plant?')) {
      deletePlant(plant.id);
      onBack();
    }
  };

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      updatePlant(plant.id, { nickname: nickname.trim() });
    }
    setIsEditing(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nextWatering = getNextWateringDate(plant);

  return (
    <div className="flex-1 bg-white min-h-screen relative overflow-y-auto pb-28 animate-in slide-in-from-right">
      {/* Plant Image Header */}
      <div className="relative h-96">
        <img
          src={plant.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800'}
          alt={plant.commonName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Top Actions */}
        <button
          onClick={onBack}
          className="absolute top-14 left-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleDelete}
          className="absolute top-14 right-6 w-12 h-12 bg-red-500/20 backdrop-blur-xl rounded-full flex items-center justify-center text-red-100 hover:bg-red-500/30 transition-colors"
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-6xl p-8 shadow-2xl shadow-green-900/10 border border-slate-50">
          {/* Plant Name */}
          <div className="mb-8">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={plant.commonName}
                  className="flex-1 text-3xl font-black text-[#1B4332] border-b-2 border-green-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveNickname}
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNickname(plant.nickname || '');
                  }}
                  className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-[#1B4332] mb-1">
                    {plant.nickname || plant.commonName}
                  </h2>
                  <p className="text-slate-400 text-sm italic">{plant.scientificName}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Care Information Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-50 p-4 rounded-3xl text-center">
              <Sun size={20} className="mx-auto mb-1 text-orange-400" />
              <p className="text-[10px] text-slate-400 uppercase font-black">LIGHT</p>
              <p className="text-xs font-bold mt-1">{plant.sunlight || 'Indirect'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl text-center">
              <Thermometer size={20} className="mx-auto mb-1 text-red-400" />
              <p className="text-[10px] text-slate-400 uppercase font-black">TEMP</p>
              <p className="text-xs font-bold mt-1">18-24°C</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl text-center">
              <Droplets size={20} className="mx-auto mb-1 text-blue-400" />
              <p className="text-[10px] text-slate-400 uppercase font-black">WATER</p>
              <p className="text-xs font-bold mt-1">
                Every {plant.wateringInterval || 7}d
              </p>
            </div>
          </div>

          {/* Watering Schedule */}
          <div className="bg-blue-50 rounded-3xl p-6 mb-6">
            <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
              <Droplets size={18} className="text-blue-600" />
              Watering Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Last watered:</span>
                <span className="font-bold text-slate-800">{formatDate(plant.lastWatered)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Next watering:</span>
                <span className="font-bold text-blue-600">
                  {nextWatering ? formatDate(nextWatering) : 'Not scheduled'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {plant.description && (
            <div className="mb-6">
              <h3 className="font-black text-slate-800 mb-2">About</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{plant.description}</p>
            </div>
          )}

          {/* Water Button */}
          <button
            onClick={handleWater}
            className="w-full bg-[#2D6A4F] text-white py-5 rounded-5xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
          >
            MARK AS WATERED
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
