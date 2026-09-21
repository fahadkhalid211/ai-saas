'use client';

import React from 'react';

interface KineticMarqueeProps {
  children: React.ReactNode;
  speed?: number; // duration in seconds
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export const KineticMarquee: React.FC<KineticMarqueeProps> = ({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}) => {
  const animDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={`relative overflow-hidden w-full flex select-none group ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div
        className={`flex shrink-0 items-center gap-8 will-change-transform ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marquee ${speed}s linear infinite ${animDirection}`,
        }}
      >
        {children}
      </div>
      <div
        className={`flex shrink-0 items-center gap-8 will-change-transform ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marquee ${speed}s linear infinite ${animDirection}`,
        }}
        aria-hidden="true"
      />
    </div>
  );
};
