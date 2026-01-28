import React from 'react';
import useAppStore from '../../stores/useAppStore.js';

/**
 * Shows amplitude/wavelength/frequency labels with arrows.
 * Visible when showLabels is true and mode is pureSine (most educational).
 */
export default function EducationalOverlay() {
  const showLabels = useAppStore((s) => s.showLabels);
  const mode = useAppStore((s) => s.mode);

  if (!showLabels) return null;

  // Different labels per mode
  const isPureSine = mode === 'pureSine';
  const isString = mode === 'stringVibration';

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {isPureSine && (
        <>
          {/* Amplitude label */}
          <div className="absolute top-[30%] left-[15%] flex items-center gap-2">
            <div className="h-16 w-0.5 bg-yellow-400/60" />
            <div className="flex flex-col">
              <span className="text-yellow-400 text-xs font-bold">AMPLITUDE</span>
              <span className="text-yellow-400/70 text-[10px]">How loud the sound is</span>
              <span className="text-yellow-400/50 text-[10px]">Taller wave = louder sound</span>
            </div>
          </div>

          {/* Wavelength label */}
          <div className="absolute top-[55%] left-[30%]">
            <div className="flex items-center gap-1">
              <div className="w-20 h-0.5 bg-cyan-400/60" />
              <span className="text-cyan-400/60">&#9664;</span>
              <span className="text-cyan-400/60">&#9654;</span>
              <div className="w-20 h-0.5 bg-cyan-400/60" />
            </div>
            <div className="mt-1 text-center">
              <span className="text-cyan-400 text-xs font-bold">WAVELENGTH</span>
              <p className="text-cyan-400/70 text-[10px]">Distance between wave peaks</p>
              <p className="text-cyan-400/50 text-[10px]">Shorter = higher pitch</p>
            </div>
          </div>

          {/* Frequency label */}
          <div className="absolute top-[25%] right-[15%] text-right">
            <span className="text-pink-400 text-xs font-bold">FREQUENCY</span>
            <p className="text-pink-400/70 text-[10px]">How many waves per second</p>
            <p className="text-pink-400/50 text-[10px]">Measured in Hertz (Hz)</p>
          </div>
        </>
      )}

      {isString && (
        <>
          {/* Node labels */}
          <div className="absolute top-[45%] left-[10%]">
            <div className="w-3 h-3 rounded-full bg-red-500/60 border border-red-400" />
            <span className="text-red-400 text-[10px] font-bold mt-1 block">NODE</span>
            <span className="text-red-400/60 text-[10px]">No movement here</span>
          </div>

          <div className="absolute top-[45%] right-[10%]">
            <div className="w-3 h-3 rounded-full bg-red-500/60 border border-red-400" />
            <span className="text-red-400 text-[10px] font-bold mt-1 block">NODE</span>
          </div>

          {/* Antinode label */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center">
            <span className="text-green-400 text-xs font-bold">ANTINODE</span>
            <p className="text-green-400/70 text-[10px]">Maximum displacement</p>
          </div>

          <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 text-center">
            <span className="text-purple-400 text-xs font-bold">HARMONICS</span>
            <p className="text-purple-400/70 text-[10px]">Higher harmonics = more nodes</p>
          </div>
        </>
      )}

      {/* Generic labels for other modes */}
      {!isPureSine && !isString && (
        <div className="absolute bottom-[20%] left-[10%]">
          <span className="text-cyan-400/80 text-xs font-bold">TIP</span>
          <p className="text-cyan-400/60 text-[10px]">
            Switch to Pure Sine or String mode to see detailed wave labels.
          </p>
        </div>
      )}
    </div>
  );
}
