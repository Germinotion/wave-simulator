import React from 'react';

export default function InfoPanel() {
  return (
    <div className="text-right text-xs text-gray-400 pointer-events-none space-y-1">
      <p className="flex items-center justify-end gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full" /> Volume = Wave Height
      </p>
      <p className="flex items-center justify-end gap-2">
        <span className="w-2 h-2 bg-purple-400 rounded-full" /> Bass = Deep Swells
      </p>
      <p className="flex items-center justify-end gap-2">
        <span className="w-2 h-2 bg-pink-400 rounded-full" /> Treble = Fine Ripples
      </p>
      <p className="flex items-center justify-end gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full" /> Beats = Ring Explosions
      </p>
    </div>
  );
}
