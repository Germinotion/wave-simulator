import React from 'react';

export default function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange, unit = '', ariaLabel }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{label}</span>
          <span>{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{unit}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={ariaLabel || label}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,200,255,0.5)]
                   [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
