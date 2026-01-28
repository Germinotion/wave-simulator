import React, { useState, useEffect } from 'react';
import useAppStore from '../../stores/useAppStore.js';
import { ONBOARDING_STEPS } from '../../utils/constants.js';
import BigButton from '../ui/BigButton.jsx';

export default function OnboardingTour() {
  const showOnboarding = useAppStore((s) => s.showOnboarding);
  const setShowOnboarding = useAppStore((s) => s.setShowOnboarding);
  const [step, setStep] = useState(0);

  // Auto-show on first visit
  useEffect(() => {
    const seen = localStorage.getItem('wave-sim-onboarded');
    if (!seen) {
      setShowOnboarding(true);
    }
  }, [setShowOnboarding]);

  if (!showOnboarding) return null;

  const current = ONBOARDING_STEPS[step];

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('wave-sim-onboarded', '1');
    setStep(0);
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />

      {/* Spotlight hint (positioned statically, could be improved with portal+getBoundingClientRect) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      max-w-sm w-full p-6 bg-gray-900/95 border border-cyan-400/30 rounded-2xl
                      backdrop-blur-lg shadow-2xl shadow-cyan-500/20">
        {/* Step indicator */}
        <div className="flex gap-1 mb-4">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-cyan-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">{current.text}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip tour
          </button>
          <BigButton onClick={handleNext} className="px-6 py-3" ariaLabel={step < ONBOARDING_STEPS.length - 1 ? 'Next step' : 'Finish tour'}>
            <span className="text-sm">
              {step < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Get Started!'}
            </span>
          </BigButton>
        </div>
      </div>
    </div>
  );
}
