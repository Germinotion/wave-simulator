import React from 'react';
import useAppStore from '../../stores/useAppStore.js';
import Slider from '../ui/Slider.jsx';
import Tooltip from '../ui/Tooltip.jsx';

export default function TransportControls() {
  const isPaused = useAppStore((s) => s.isPaused);
  const setIsPaused = useAppStore((s) => s.setIsPaused);
  const timeScale = useAppStore((s) => s.timeScale);
  const setTimeScale = useAppStore((s) => s.setTimeScale);

  return (
    <div className="flex items-center gap-3" id="transport">
      <Tooltip text={isPaused ? 'Resume visualization' : 'Pause visualization'}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center transition-all duration-300
            ${isPaused
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/40'
              : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      </Tooltip>

      <Tooltip text="Control playback speed">
        <div className="flex-1 min-w-[100px]">
          <Slider
          label="Speed"
          value={timeScale}
          min={0.1}
          max={2}
          step={0.1}
          onChange={setTimeScale}
          unit="x"
            ariaLabel="Visualization speed"
          />
        </div>
      </Tooltip>
    </div>
  );
}
