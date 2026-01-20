import React, { useState } from 'react';
import { Leaf, Camera, Calendar, ChevronRight } from 'lucide-react';
import { loginAnonymously } from '../services/firebase';

const onboardingSteps = [
  {
    icon: Camera,
    title: 'Identify Any Plant',
    description: 'Take a photo and let AI identify your plant instantly with detailed care information',
    color: 'from-green-400 to-emerald-600'
  },
  {
    icon: Calendar,
    title: 'Never Miss Watering',
    description: 'Get personalized care schedules and reminders for each plant in your collection',
    color: 'from-blue-400 to-cyan-600'
  },
  {
    icon: Leaf,
    title: 'Health Monitoring',
    description: 'Diagnose diseases early and keep your plants healthy with AI-powered insights',
    color: 'from-purple-400 to-pink-600'
  }
];

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await loginAnonymously();
      localStorage.setItem('flora_onboarding_complete', 'true');
      onComplete();
    } catch (error) {
      console.error('Error during sign in:', error);
      // Continue anyway for offline mode
      localStorage.setItem('flora_onboarding_complete', 'true');
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex flex-col items-center justify-between p-8 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-[#1B4332] p-3 rounded-2xl">
          <Leaf className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-black text-[#1B4332]">Flora</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in duration-500">
        {/* Icon Circle */}
        <div className={`bg-gradient-to-br ${step.color} p-12 rounded-full shadow-2xl mb-12`}>
          <Icon className="text-white" size={80} strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <h2 className="text-3xl font-black text-slate-800 text-center mb-4">
          {step.title}
        </h2>
        <p className="text-slate-600 text-center text-lg leading-relaxed px-4">
          {step.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md space-y-6">
        {/* Dots */}
        <div className="flex gap-2 justify-center">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-[#1B4332]'
                  : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-[#1B4332] text-white py-5 rounded-5xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight size={24} />
            </>
          )}
        </button>

        {currentStep < onboardingSteps.length - 1 && (
          <button
            onClick={handleGetStarted}
            className="w-full text-slate-400 font-bold py-2"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
