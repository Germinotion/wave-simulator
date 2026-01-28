import React from 'react';
import useAppStore from '../../stores/useAppStore.js';
import BigButton from '../ui/BigButton.jsx';
import Tooltip from '../ui/Tooltip.jsx';

export default function AudioSourcePanel({ enableMicrophone, removeSource }) {
  const isListening = useAppStore((s) => s.isListening);
  const sources = useAppStore((s) => s.sources);

  return (
    <div className="space-y-3" id="source-panel">
      {!isListening && (
        <Tooltip text="Capture audio from your microphone">
          <BigButton
            onClick={enableMicrophone}
            className="w-full px-6 py-4"
            ariaLabel="Enable microphone"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm tracking-wider">ENABLE MIC</span>
          </BigButton>
        </Tooltip>
      )}

      {isListening && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500/30 to-cyan-500/30
                        border border-green-400/50 rounded-full backdrop-blur-sm" id="mic-button">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
          <span className="text-green-300 font-bold tracking-wider text-xs">LISTENING</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-green-400 rounded-full animate-pulse"
                style={{ height: `${8 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active sources list */}
      {sources.length > 0 && (
        <div className="space-y-1">
          {sources.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase">{s.type}</span>
                <span className="text-xs text-white/80 truncate max-w-[120px]">{s.label}</span>
              </div>
              <Tooltip text="Remove this source">
                <button
                  onClick={() => removeSource(s)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 min-w-[32px] min-h-[32px]"
                  aria-label={`Remove ${s.label}`}
                >
                  ✕
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
