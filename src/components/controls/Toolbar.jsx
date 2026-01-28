import React from 'react';
import useAppStore from '../../stores/useAppStore.js';
import Tooltip from '../ui/Tooltip.jsx';

export default function Toolbar({ onReset }) {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const showLabels = useAppStore((s) => s.showLabels);
  const setShowLabels = useAppStore((s) => s.setShowLabels);
  const showHarmonics = useAppStore((s) => s.showHarmonics);
  const setShowHarmonics = useAppStore((s) => s.setShowHarmonics);

  return (
    <div className="grid grid-cols-2 gap-2" id="split-view">
      <Tooltip text="Show two visualizations side-by-side to compare different sound sources">
        <button
          onClick={() => setViewMode(viewMode === 'single' ? 'split' : 'single')}
          className={`w-full px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300
            ${viewMode === 'split'
              ? 'bg-cyan-500 text-black'
              : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          aria-label="Toggle split view"
        >
          {viewMode === 'split' ? 'SINGLE' : 'SPLIT'}
        </button>
      </Tooltip>

      <Tooltip text="Overlay frequency, amplitude, and wavelength labels on the visualization">
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`w-full px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300
            ${showLabels
              ? 'bg-yellow-500 text-black'
              : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          aria-label="Toggle labels"
        >
          LABELS
        </button>
      </Tooltip>

      <Tooltip text="Break a complex wave into its individual sine components (Fourier analysis)">
        <button
          onClick={() => setShowHarmonics(!showHarmonics)}
          className={`w-full px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300
            ${showHarmonics
              ? 'bg-purple-500 text-black'
              : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          aria-label="Toggle harmonics panel"
        >
          HARMONICS
        </button>
      </Tooltip>

      <Tooltip text="Reset all settings to defaults">
        <button
          onClick={onReset}
          className="w-full px-3 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-300
            bg-white/10 text-white/70 hover:bg-red-500/30 hover:text-red-300"
          aria-label="Reset to defaults"
        >
          RESET
        </button>
      </Tooltip>
    </div>
  );
}
