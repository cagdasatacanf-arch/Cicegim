import React from 'react';
import { X, Check, Zap, Shield, Camera, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const premiumFeatures = [
  {
    icon: Camera,
    title: 'Unlimited Plant Scans',
    description: 'Identify as many plants as you want'
  },
  {
    icon: AlertCircle,
    title: 'Disease Diagnosis',
    description: 'AI-powered health assessment and treatment recommendations'
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Get help from plant care experts'
  }
];

const Paywall = ({ onClose }) => {
  const { setIsPremium } = useApp();

  const handleUpgrade = () => {
    // In a real app, this would integrate with payment processing
    setIsPremium(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-6xl sm:rounded-6xl p-8 pb-12 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-r from-orange-400 to-rose-400 p-4 rounded-full mb-4">
            <Zap className="text-white fill-current" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Upgrade to Premium</h2>
          <p className="text-slate-600">Unlock all features and give your plants the best care</p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-4 bg-slate-50 p-4 rounded-3xl">
                <div className="bg-green-100 p-2 rounded-xl flex-shrink-0">
                  <Icon className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
                <Check className="text-green-600 flex-shrink-0" size={20} />
              </div>
            );
          })}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 mb-6 border-2 border-green-200">
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-4xl font-black text-slate-800">$4.99</span>
            <span className="text-slate-600 pb-1">/month</span>
          </div>
          <p className="text-center text-sm text-slate-600">
            7-day free trial • Cancel anytime
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-5xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
        >
          Start Free Trial
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Paywall;
