'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SaaSMarketingHomepage } from '@/components/landing/SaaSMarketingHomepage';

export default function LandingPageClient() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('kortex_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('kortex_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleOpenAuth = (mode: 'admin' | 'staff' | 'register') => {
    router.push(`/?auth=${mode}`);
  };

  return (
    <SaaSMarketingHomepage
      theme={theme}
      onToggleTheme={toggleTheme}
      onOpenAuth={handleOpenAuth}
    />
  );
}
