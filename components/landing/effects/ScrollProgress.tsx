'use client';

import React, { useEffect, useState } from 'react';

interface ScrollProgressProps {
  color?: string;
  height?: number;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  color = 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500',
  height = 3,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const scrollPercent = (currentScroll / totalHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-300"
      style={{ height: `${height}px` }}
    >
      <div
        className={`h-full ${color} transition-[width] duration-75 ease-out shadow-sm`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
