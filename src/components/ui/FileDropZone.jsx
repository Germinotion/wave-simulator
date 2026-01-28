import React from 'react';
import Tooltip from './Tooltip.jsx';

export default function FileDropZone({ isDragging, onFileSelect, children }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300
        ${isDragging
          ? 'border-cyan-400 bg-cyan-400/10 scale-[1.02]'
          : 'border-white/20 hover:border-white/40'}`}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyan-400/10 rounded-xl z-10">
          <p className="text-cyan-300 font-bold text-lg">Drop audio file here</p>
        </div>
      )}
      <div className={isDragging ? 'opacity-0' : ''}>
        {children || (
          <>
            <p className="text-gray-400 text-sm mb-2">Drag an audio file here</p>
            <Tooltip text="Select an audio file from your computer">
              <label className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full
                               text-xs text-white/80 cursor-pointer transition-colors">
                Browse Files
                <input type="file" accept="audio/*" onChange={handleChange} className="hidden" />
              </label>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
