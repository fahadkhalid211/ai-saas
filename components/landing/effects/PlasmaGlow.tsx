'use client';

import React from 'react';

interface PlasmaGlowProps {
  variant?: 'cyan-violet' | 'emerald-gold' | 'rose-amber' | 'blue-indigo';
  intensity?: 'subtle' | 'vibrant';
  className?: string;
}

export const PlasmaGlow: React.FC<PlasmaGlowProps> = ({
  variant = 'cyan-violet',
  intensity = 'subtle',
  className = '',
}) => {
  const opacities = intensity === 'vibrant' ? 'opacity-40' : 'opacity-20';

  const gradientMap = {
    'cyan-violet': {
      orb1: 'from-cyan-500/60 to-blue-600/30',
      orb2: 'from-indigo-600/50 to-purple-600/30',
      orb3: 'from-fuchsia-500/40 to-pink-600/20',
    },
    'emerald-gold': {
      orb1: 'from-emerald-500/60 to-teal-600/30',
      orb2: 'from-green-600/50 to-emerald-700/30',
      orb3: 'from-amber-400/40 to-yellow-600/20',
    },
    'rose-amber': {
      orb1: 'from-rose-500/60 to-pink-600/30',
      orb2: 'from-orange-500/50 to-amber-600/30',
      orb3: 'from-red-500/40 to-rose-700/20',
    },
    'blue-indigo': {
      orb1: 'from-blue-500/60 to-cyan-600/30',
      orb2: 'from-indigo-600/50 to-sky-600/30',
      orb3: 'from-violet-500/40 to-indigo-800/20',
    },
  };

  const current = gradientMap[variant] || gradientMap['cyan-violet'];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Orb 1 */}
      <div
        className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr ${current.orb1} blur-[120px] ${opacities} animate-pulse`}
        style={{ animationDuration: '8s' }}
      />
      {/* Orb 2 */}
      <div
        className={`absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br ${current.orb2} blur-[140px] ${opacities} animate-pulse`}
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />
      {/* Orb 3 */}
      <div
        className={`absolute -bottom-48 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-t ${current.orb3} blur-[130px] ${opacities} animate-pulse`}
        style={{ animationDuration: '10s', animationDelay: '4s' }}
      />
    </div>
  );
};
