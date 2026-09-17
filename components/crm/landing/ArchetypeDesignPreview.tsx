'use client';

import React from 'react';
import {
  Eye,
  Calendar,
  Star,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { DesignArchetype } from '@/lib/landing/types';

interface ArchetypeDesignPreviewProps {
  archetype: DesignArchetype;
  isSelected?: boolean;
  onPreviewClick?: (archetype: DesignArchetype) => void;
  className?: string;
}

export const ArchetypeDesignPreview: React.FC<ArchetypeDesignPreviewProps> = ({
  archetype,
  isSelected = false,
  onPreviewClick,
  className = '',
}) => {
  const themeColor = archetype.themeColor || '#2563eb';
  const isDarkAesthetic =
    archetype.aesthetic.toLowerCase().includes('dark') ||
    archetype.aesthetic.toLowerCase().includes('obsidian') ||
    archetype.aesthetic.toLowerCase().includes('charcoal') ||
    archetype.aesthetic.toLowerCase().includes('black') ||
    archetype.aesthetic.toLowerCase().includes('navy');

  const isLuxurySerif =
    archetype.category.toLowerCase().includes('luxury') ||
    archetype.category.toLowerCase().includes('prestige') ||
    archetype.category.toLowerCase().includes('boutique') ||
    archetype.category.toLowerCase().includes('editorial') ||
    archetype.name.toLowerCase().includes('luxury') ||
    archetype.name.toLowerCase().includes('chambers');

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border ${
        isSelected
          ? 'border-blue-500/80 shadow-md'
          : 'border-slate-200 dark:border-slate-800'
      } bg-slate-900 group ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="h-6 bg-slate-950/90 border-b border-slate-800/80 px-2.5 flex items-center justify-between select-none">
        {/* Browser Dots */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400 max-w-[170px] truncate">
          <Lock className="w-2 h-2 text-emerald-400 shrink-0" />
          <span className="truncate">site/preview/{archetype.id}</span>
        </div>

        {/* Badge */}
        <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
          {archetype.badge || 'Template'}
        </div>
      </div>

      {/* Rendered Webpage Mini Layout */}
      <div
        className={`relative h-44 w-full p-2.5 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
          isDarkAesthetic ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Subtle Background Glow or Pattern */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        {/* Mini Navbar */}
        <div
          className={`flex items-center justify-between pb-1.5 border-b ${
            isDarkAesthetic ? 'border-slate-800/60' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <span
              className={`text-[9.5px] font-bold tracking-tight truncate max-w-[95px] ${
                isLuxurySerif ? 'font-serif tracking-wider' : 'font-sans'
              }`}
            >
              {archetype.name.split(' ')[0]} Brand
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[8px] hidden sm:inline ${
                isDarkAesthetic ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Services
            </span>
            <span
              className={`text-[8px] hidden sm:inline ${
                isDarkAesthetic ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              About
            </span>
            <div
              className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              Book
            </div>
          </div>
        </div>

        {/* Hero Section Layout */}
        <div className="grid grid-cols-12 gap-2 my-auto items-center py-1">
          {/* Hero Left Content */}
          <div className="col-span-7 space-y-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[7.5px] font-semibold text-slate-400">
              <Sparkles className="w-2 h-2 text-amber-400" />
              <span className="truncate">{archetype.aesthetic.split('&')[0].trim()}</span>
            </div>

            <div
              className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                isLuxurySerif ? 'font-serif' : 'font-sans tracking-tight'
              }`}
            >
              {archetype.name}
            </div>

            <p
              className={`text-[8px] leading-tight line-clamp-1 ${
                isDarkAesthetic ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {archetype.tagline}
            </p>

            <div className="flex items-center gap-1 pt-0.5">
              <div
                className="px-2 py-0.5 rounded-md text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                Schedule Consultation
              </div>
              <div
                className={`px-1.5 py-0.5 rounded-md text-[8px] font-medium border ${
                  isDarkAesthetic
                    ? 'border-slate-800 text-slate-300'
                    : 'border-slate-300 text-slate-700'
                }`}
              >
                Explore
              </div>
            </div>
          </div>

          {/* Hero Right Visual Element / Card Preview */}
          <div className="col-span-5 relative">
            <div
              className={`rounded-lg p-1.5 border shadow-md space-y-1 ${
                isDarkAesthetic
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="h-10 w-full rounded overflow-hidden relative">
                <img
                  src={archetype.previewImage}
                  alt={archetype.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0.5 left-1 text-[7px] font-bold text-white truncate">
                  {archetype.badge}
                </div>
              </div>

              {/* Mini Interactive Booking Slot Pill */}
              <div
                className={`flex items-center justify-between px-1 py-0.5 rounded text-[7px] font-medium ${
                  isDarkAesthetic ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-0.5 truncate">
                  <Calendar className="w-2 h-2 text-blue-400 shrink-0" />
                  <span>Calendar Slot</span>
                </div>
                <span className="font-bold text-emerald-400">Open</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Services & Trust Matrix Bar */}
        <div
          className={`pt-1 border-t flex items-center justify-between text-[7.5px] ${
            isDarkAesthetic ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            <span className="truncate">{archetype.features[0] || 'Verified Architecture'}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <div className="flex text-amber-400">
              <Star className="w-2 h-2 fill-current" />
              <Star className="w-2 h-2 fill-current" />
              <Star className="w-2 h-2 fill-current" />
            </div>
            <span className="font-bold text-[8px]">5.0</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
          <div className="text-center text-white space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              Interactive Webpage Design
            </span>
            <span className="text-xs font-extrabold block drop-shadow-sm">{archetype.name}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreviewClick) {
                onPreviewClick(archetype);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-lg transition cursor-pointer hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Sample Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
