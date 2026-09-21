'use client';

import React, { useState } from 'react';
import {
  Bot,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

interface NavHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenAuth: (mode: 'admin' | 'staff' | 'register') => void;
}

const NAV_LINKS = [
  { label: 'Product', href: '#sandbox' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing' },
];

export function NavHeader({ theme, onToggleTheme, onOpenAuth }: NavHeaderProps) {
  const isLight = theme === 'light';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
          isLight
            ? 'bg-white/80 border-slate-200/80 text-slate-900'
            : 'bg-slate-950/80 border-slate-800/50 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              CRESCELO<span className="text-blue-500">.AI</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                aria-label="Toggle theme"
              >
                {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenAuth('staff')}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg shadow-sm shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition cursor-pointer ${
              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            isLight ? 'bg-white' : 'bg-slate-950'
          }`}
        >
          <div className="pt-20 px-6 pb-8 flex flex-col h-full">
            <nav className="flex flex-col gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg font-medium py-3 px-4 rounded-xl transition ${
                    isLight
                      ? 'text-slate-800 hover:bg-slate-50'
                      : 'text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
                    isLight
                      ? 'text-slate-700 hover:bg-slate-50'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {isLight ? 'Dark Mode' : 'Light Mode'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { onOpenAuth('staff'); setMobileOpen(false); }}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isLight
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { onOpenAuth('register'); setMobileOpen(false); }}
                className="w-full py-3 px-4 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
