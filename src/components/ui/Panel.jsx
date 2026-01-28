import React, { useState } from 'react';

export default function Panel({ title, children, defaultOpen = true, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white/90 hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`text-white/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          &#9660;
        </span>
      </button>
      <div
        className={`transition-all duration-300 ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
