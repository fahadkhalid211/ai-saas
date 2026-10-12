'use client';

import { T } from '@/lib/i18n/context';
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

  const archetypeIndex =
    archetype.id.includes('classic') || archetype.id.includes('prestige') || archetype.id.includes('power') || archetype.id.includes('minimal') || archetype.id.includes('editorial')
      ? 0
      : archetype.id.includes('modern') || archetype.id.includes('split') || archetype.id.includes('wellness') || archetype.id.includes('tech') || archetype.id.includes('dark') || archetype.id.includes('d2c')
      ? 1
      : 2;

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
          <span className="truncate"><T>site/preview/</T>{archetype.id}</span>
        </div>

        {/* Badge */}
        <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
          {archetype.badge || <T>{'Template'}</T>}
        </div>
      </div>

      {/* Rendered Webpage Mini Layout */}
      <div
        className={`relative h-48 w-full p-2.5 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
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
          className={`flex items-center justify-between pb-1.5 border-b shrink-0 ${
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
              {archetype.name.split(' ')[0]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[8px] hidden sm:inline ${
                isDarkAesthetic ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <T>Services</T>
            </span>
            <div
              className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              <T>Book</T>
            </div>
          </div>
        </div>

        {/* 3 DISTINCT MINI LAYOUTS */}
        {archetypeIndex === 0 ? (
          /* LAYOUT 0: CENTERED PRESTIGE & EDITORIAL */
          <div className="my-auto py-1 text-center space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[7px] font-semibold text-slate-400 mx-auto">
              <Sparkles className="w-2 h-2 text-amber-400" />
              <span>{archetype.badge}</span>
            </div>
            <div
              className={`text-[12px] font-extrabold leading-tight px-2 max-w-[240px] mx-auto ${
                isLuxurySerif ? 'font-serif' : 'font-sans'
              }`}
            >
              <T>{archetype.name}</T>
            </div>
            <p className="text-[7.5px] text-slate-400 line-clamp-1 max-w-[200px] mx-auto">
              <T>{archetype.tagline}</T>
            </p>
            <div className="flex justify-center gap-1.5 pt-0.5">
              <div
                className="px-2.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                <T>Reserve Appointment</T>
              </div>
              <div
                className={`px-2 py-0.5 rounded text-[8px] font-medium border ${
                  isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}
              >
                <T>Learn More</T>
              </div>
            </div>
          </div>
        ) : archetypeIndex === 1 ? (
          /* LAYOUT 1: HIGH-VELOCITY SPLIT SCREEN WITH LIVE BOOKING CARD */
          <div className="grid grid-cols-12 gap-2 my-auto items-center py-1">
            <div className="col-span-7 space-y-1">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[7px] font-semibold text-slate-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span><T>Available Today</T></span>
              </div>
              <div className="text-[10.5px] font-bold leading-tight line-clamp-2">
                <T>{archetype.name}</T>
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <div
                  className="px-2 py-0.5 rounded text-[7.5px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  <T>Book Instant</T>
                </div>
              </div>
            </div>
            <div className="col-span-5">
              <div
                className={`rounded-lg p-1.5 border shadow-sm space-y-1 ${
                  isDarkAesthetic ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[7px]">
                  <span className="font-bold flex items-center gap-0.5">
                    <Calendar className="w-2 h-2 text-blue-400" />
                    <span><T>Slot</T></span>
                  </span>
                  <span className="text-emerald-400 font-bold"><T>10:00 AM</T></span>
                </div>
                <div className="h-1 bg-slate-700/40 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-500 rounded-full" />
                </div>
                <div className="text-[6.5px] text-slate-400 text-center font-mono"><T>1-Click Confirmed</T></div>
              </div>
            </div>
          </div>
        ) : (
          /* LAYOUT 2: IMMERSIVE VISUAL SHOWCASE & METRIC BADGES */
          <div className="my-auto relative rounded-lg overflow-hidden h-24 border border-slate-800">
            <img
              src={archetype.previewImage}
              alt={archetype.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-2 flex flex-col justify-end">
              <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider">
                {archetype.badge}
              </span>
              <div className="text-[10px] font-extrabold text-white leading-tight truncate drop-shadow-xs">
                <T>{archetype.name}</T>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[7px] text-slate-300 font-medium"><T>5.0 Star Rating</T></span>
                <div
                  className="px-1.5 py-0.5 rounded text-[7px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  <T>VIP Access &rarr;</T>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mini Services & Trust Matrix Bar */}
        <div
          className={`pt-1 border-t flex items-center justify-between text-[7.5px] shrink-0 ${
            isDarkAesthetic ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            <span className="truncate">{archetype.features[0] || <T>{'Verified Architecture'}</T>}</span>
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
              <T>Interactive Webpage Design</T>
            </span>
            <span className="text-xs font-extrabold block drop-shadow-sm"><T>{archetype.name}</T></span>
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
            <span><T>Preview Sample Page</T></span>
          </button>
        </div>
      </div>
    </div>
  );
};
