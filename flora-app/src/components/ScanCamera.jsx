import React, { useState, useRef } from 'react';
import { Camera, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { identifyPlant, convertToBase64, mockIdentifyPlant } from '../services/plantid';

const ScanCamera = ({ onNavigate, onBack }) => {
  const { addPlant } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageCapture = async (file) => {
    if (!file) return;

    try {
      setError(null);
      setLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Convert to base64 and identify
      const base64Image = await convertToBase64(file);

      let plantData;

      // Check if API key is configured
      if (!import.meta.env.VITE_PLANTID_API_KEY || import.meta.env.VITE_PLANTID_API_KEY === 'your_plantid_api_key_here') {
        // Use mock data for demo
        console.warn('Plant.id API key not configured, using mock data');
        plantData = await mockIdentifyPlant();
      } else {
        plantData = await identifyPlant(base64Image);
      }

      // Add plant with image preview
      const newPlant = addPlant({
        ...plantData,
        image: URL.createObjectURL(file)
      });

      // Navigate to detail view
      onNavigate('detail', newPlant);
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError(err.message || 'Failed to identify plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-white font-bold text-lg">Identify Plant</h2>
        <div className="w-12" />
      </div>

      {/* Camera Preview Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 pt-24">
        <div className="w-full max-w-md aspect-[4/5] bg-slate-900 rounded-6xl relative overflow-hidden border-4 border-white/20 shadow-2xl">
          {loading ? (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-12 text-center">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-8" />
              <h3 className="text-2xl font-black mb-2">AI Analyzing</h3>
              <p className="text-sm text-white/50">Connecting to plant database...</p>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <Camera size={100} strokeWidth={1} />
              <p className="mt-4 text-white/40 text-sm">No image selected</p>
            </div>
          )}

          {/* Scanning Grid Overlay */}
          {!loading && !preview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 border-2 border-green-400/30 rounded-3xl" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-3xl p-4 max-w-md">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!loading && (
          <div className="w-full max-w-md mt-8 space-y-4">
            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-white text-[#1B4332] py-5 rounded-5xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              <Camera size={24} />
              Take Photo
            </button>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white/10 backdrop-blur-md text-white py-5 rounded-5xl font-bold text-lg flex items-center justify-center gap-3 border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
              <Upload size={24} />
              Upload from Gallery
            </button>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Info Banner */}
      {!loading && (
        <div className="p-6 bg-gradient-to-t from-black/50 to-transparent text-center">
          <p className="text-white/60 text-sm">
            Take a clear photo of the plant for best results
          </p>
        </div>
      )}
    </div>
  );
};

export default ScanCamera;
