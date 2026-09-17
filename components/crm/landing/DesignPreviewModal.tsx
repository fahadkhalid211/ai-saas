'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { DesignArchetype } from '@/lib/landing/types';

interface DesignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  archetype: DesignArchetype | null;
  industryName?: string;
  onSelectArchetype?: (archetypeId: string) => void;
}

export const DesignPreviewModal: React.FC<DesignPreviewModalProps> = ({
  isOpen,
  onClose,
  archetype,
  industryName = 'Industry',
  onSelectArchetype,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen || !archetype) return null;

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

  const sampleServices = [
    {
      title: 'Executive Initial Consultation & Strategy',
      price: '$150',
      duration: '45 mins',
      desc: 'Comprehensive evaluation, private scoping, and customized strategic action plan.',
    },
    {
      title: 'Full-Scope Signature Engagement',
      price: '$450',
      duration: '90 mins',
      desc: 'In-depth execution with dedicated specialist delivery and priority support triage.',
    },
    {
      title: 'VIP Retainer & Priority Advisory',
      price: '$1,200',
      duration: 'Monthly',
      desc: 'Continuous advisory access, instant turnaround SLA, and direct partner channel.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{archetype.name}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {archetype.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {industryName} &middot; Aesthetic: {archetype.aesthetic}
              </p>
            </div>
          </div>

          {/* Viewport Toggles & Actions */}
          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewport === 'desktop'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View (1200px)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Select Archetype Button */}
            {onSelectArchetype && (
              <button
                type="button"
                onClick={() => {
                  onSelectArchetype(archetype.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Select This Design</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container Body */}
        <div className="flex-1 bg-slate-900/40 p-3 sm:p-6 overflow-y-auto flex justify-center items-start">
          <div
            className={`transition-all duration-300 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
              viewport === 'desktop' ? 'max-w-4xl' : 'max-w-xs'
            }`}
          >
            {/* Browser Mockup Chrome */}
            <div className="h-8 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 w-1/2 justify-center truncate">
                <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">https://yourbrand.online/site/preview</span>
              </div>

              <div className="w-10" />
            </div>

            {/* Rendered Live Webpage Mockup */}
            <div
              className={`p-5 sm:p-8 space-y-10 ${
                isDarkAesthetic ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
              }`}
            >
              {/* Navigation Bar */}
              <nav
                className={`flex items-center justify-between pb-4 border-b ${
                  isDarkAesthetic ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-lg shadow-sm"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span
                    className={`text-sm font-extrabold tracking-tight ${
                      isLuxurySerif ? 'font-serif tracking-wide text-base' : 'font-sans'
                    }`}
                  >
                    {archetype.name.split(' ')[0]} Studio
                  </span>
                </div>

                {viewport === 'desktop' && (
                  <div
                    className={`flex items-center gap-6 text-xs font-medium ${
                      isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    <span>Services</span>
                    <span>Experience</span>
                    <span>Testimonials</span>
                    <span>Contact</span>
                  </div>
                )}

                <div
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  Book Appointment
                </div>
              </nav>

              {/* Hero Section */}
              <div
                className={`grid gap-8 items-center ${
                  viewport === 'desktop' ? 'grid-cols-12' : 'grid-cols-1'
                }`}
              >
                {/* Left Column: Copy & CTAs */}
                <div className={`${viewport === 'desktop' ? 'col-span-7' : 'col-span-1'} space-y-4`}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{archetype.badge}</span>
                  </div>

                  <h1
                    className={`text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight ${
                      isLuxurySerif ? 'font-serif text-3xl sm:text-4xl' : 'font-sans'
                    }`}
                  >
                    {archetype.name}
                  </h1>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {archetype.tagline}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2"
                      style={{ backgroundColor: themeColor }}
                    >
                      <span>Reserve Your Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    <div
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkAesthetic
                          ? 'border-slate-800 text-slate-300'
                          : 'border-slate-300 text-slate-700'
                      }`}
                    >
                      View Service Menu
                    </div>
                  </div>

                  {/* Trust Rating Bar */}
                  <div className="flex items-center gap-2 pt-2 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-bold">5.0 Star Rating</span>
                    <span className="text-slate-500">&middot;</span>
                    <span className={isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}>
                      Verified Clients
                    </span>
                  </div>
                </div>

                {/* Right Column: Visual Card Showcase */}
                <div className={`${viewport === 'desktop' ? 'col-span-5' : 'col-span-1'} relative`}>
                  <div
                    className={`rounded-2xl border overflow-hidden shadow-xl p-2 space-y-3 ${
                      isDarkAesthetic
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="h-44 w-full rounded-xl overflow-hidden relative">
                      <img
                        src={archetype.previewImage}
                        alt={archetype.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                        <span>{archetype.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs">
                          {archetype.aesthetic}
                        </span>
                      </div>
                    </div>

                    {/* Booking Module Preview */}
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        isDarkAesthetic
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>Next Open Appointment</span>
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase">
                          Available Today
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div
                          className="py-1 px-2 rounded-lg text-center font-semibold text-[10px] text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          10:00 AM
                        </div>
                        <div
                          className={`py-1 px-2 rounded-lg text-center font-semibold text-[10px] border ${
                            isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-300'
                          }`}
                        >
                          1:30 PM
                        </div>
                        <div
                          className={`py-1 px-2 rounded-lg text-center font-semibold text-[10px] border ${
                            isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-300'
                          }`}
                        >
                          4:00 PM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Offerings Grid */}
              <div className="space-y-4 pt-4">
                <div>
                  <h3
                    className={`text-lg font-bold ${
                      isLuxurySerif ? 'font-serif text-xl' : 'font-sans'
                    }`}
                  >
                    Featured Services &amp; Packages
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Select an offering to schedule direct booking through the AI Concierge.
                  </p>
                </div>

                <div
                  className={`grid gap-4 ${
                    viewport === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'
                  }`}
                >
                  {sampleServices.map((svc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isDarkAesthetic
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold leading-snug">{svc.title}</h4>
                        <span className="text-xs font-extrabold text-blue-500 shrink-0">
                          {svc.price}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {svc.desc}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{svc.duration}</span>
                        </span>
                        <span
                          className="font-bold cursor-pointer"
                          style={{ color: themeColor }}
                        >
                          Book &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Features Overview */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDarkAesthetic
                    ? 'bg-slate-900/40 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Archetype Architectural Specs:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {archetype.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: themeColor }}
                      />
                      <span className={isDarkAesthetic ? 'text-slate-300' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Back to Design Archetypes
          </button>

          {onSelectArchetype && (
            <button
              type="button"
              onClick={() => {
                onSelectArchetype(archetype.id);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Select &amp; Apply {archetype.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
