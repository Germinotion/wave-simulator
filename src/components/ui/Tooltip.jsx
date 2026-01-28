import React, { useState } from 'react';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                        bg-gray-900/95 border border-white/10 rounded-lg text-xs text-gray-200
                        max-w-[200px] text-center pointer-events-none z-50 backdrop-blur-sm">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2
                          bg-gray-900/95 border-r border-b border-white/10 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
