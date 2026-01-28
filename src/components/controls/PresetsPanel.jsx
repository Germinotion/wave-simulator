import React from 'react';
import { PRESETS } from '../../utils/constants.js';
import Tooltip from '../ui/Tooltip.jsx';

export default function PresetsPanel({ addTone }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRESETS.map((preset) => (
        <Tooltip key={preset.name} text={`${preset.waveform} wave at ${preset.frequency}Hz`}>
          <button
            onClick={() => addTone({
              waveform: preset.waveform,
              frequency: preset.frequency,
              amplitude: preset.amplitude,
            })}
            className="px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                       rounded-xl text-xs text-white/80 font-medium transition-all duration-200
                       min-h-[48px] text-left w-full"
            aria-label={`Load ${preset.name} preset`}
          >
            <div className="font-bold text-white/90">{preset.name}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {preset.waveform} {preset.frequency}Hz
            </div>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
