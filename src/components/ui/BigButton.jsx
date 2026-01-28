import React from 'react';

export default function BigButton({ children, onClick, className = '', variant = 'primary', disabled = false, ariaLabel }) {
  const base = 'min-w-[48px] min-h-[48px] rounded-full font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden';

  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white shadow-2xl hover:scale-105 hover:shadow-cyan-500/50',
    secondary: 'bg-white/10 text-white/80 hover:bg-white/20',
    success: 'bg-gradient-to-r from-green-500/30 to-cyan-500/30 border border-green-400/50 text-green-300 backdrop-blur-sm',
    danger: 'bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
