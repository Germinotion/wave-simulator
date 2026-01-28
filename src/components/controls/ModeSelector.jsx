import React from 'react';
import useAppStore from '../../stores/useAppStore.js';
import { MODE_LIST } from '../../utils/constants.js';
import Tooltip from '../ui/Tooltip.jsx';

export default function ModeSelector() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="flex flex-wrap gap-2 justify-center" id="mode-selector">
      {MODE_LIST.map((m) => (
        <Tooltip key={m.id} text={m.teaches}>
          <button
            onClick={() => setMode(m.id)}
            className={`px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center
              ${mode === m.id
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            aria-label={`${m.label} mode: ${m.teaches}`}
          >
            <span className="mr-1 text-sm">{m.icon}</span>
            {m.label}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
