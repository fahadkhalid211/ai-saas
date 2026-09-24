'use client';

import { useEffect, useState } from 'react';

/** How much bigger than 16px the page's root font size currently is (1 on laptops, up to ~2 on 4K TVs). For sizes given in px. */
export function useRootScale(): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const read = () => {
      const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setScale(Math.max(1, px / 16));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  return scale;
}
