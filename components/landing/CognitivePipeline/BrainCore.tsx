'use client';

import React from 'react';
import { Cpu, Zap, Shield, Sparkles, Activity } from 'lucide-react';
import { PipelineState, PipelineScenario } from './types';

interface BrainCoreProps {
  state: PipelineState;
  scenario: PipelineScenario;
  theme?: 'light' | 'dark';
}

export function BrainCore({ state, scenario, theme = 'dark' }: BrainCoreProps) {
  const isLight = theme === 'light';
  const isActive = state === 'reasoning' || state === 'validating' || state === 'locking' || state === 'executing' || state === 'complete';
  const isProcessing = state === 'reasoning';

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer ambient glow */}
      <div
        className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isActive
            ? isLight
              ? 'bg-blue-400/25 scale-110'
              : 'bg-cyan-500/20 scale-110'
            : isLight
            ? 'bg-blue-400/10 scale-95'
            : 'bg-blue-600/10 scale-95'
        }`}
      />

      {/* SVG Multi-Ring Cinematic Reactor Core */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring Track */}
          <circle
            cx="150"
            cy="150"
            r="138"
            stroke={isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(56, 189, 248, 0.15)'}
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          {/* Outer Ring: Rotating COGNITIVE ENGINE Track */}
          <g
            className={`transition-all duration-700 origin-center ${
              isProcessing ? 'animate-[spin_8s_linear_infinite]' : 'animate-[spin_32s_linear_infinite]'
            }`}
          >
            <circle
              cx="150"
              cy="150"
              r="130"
              stroke={isActive ? (isLight ? '#0284c7' : '#38bdf8') : isLight ? '#cbd5e1' : '#334155'}
              strokeWidth="2"
              strokeDasharray="40 180"
              strokeLinecap="round"
            />
            {/* Coordinate pips */}
            <circle cx="150" cy="20" r="3" fill={isActive ? '#38bdf8' : '#64748b'} />
            <circle cx="150" cy="280" r="3" fill={isActive ? '#38bdf8' : '#64748b'} />
            <circle cx="20" cy="150" r="3" fill={isActive ? '#38bdf8' : '#64748b'} />
            <circle cx="280" cy="150" r="3" fill={isActive ? '#38bdf8' : '#64748b'} />
          </g>

          {/* Text Path for Outer Ring Label: COGNITIVE ENGINE */}
          <path
            id="outerTextPath"
            d="M 150, 150 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
            fill="none"
          />
          <text
            className={`text-[8px] font-mono tracking-[0.25em] uppercase select-none transition-colors ${
              isActive ? (isLight ? 'fill-blue-700 font-bold' : 'fill-cyan-300 font-bold') : isLight ? 'fill-slate-400' : 'fill-slate-600'
            }`}
          >
            <textPath href="#outerTextPath" startOffset="0%">
              • COGNITIVE ENGINE • AUTONOMOUS DELIBERATION • ZERO TOKEN TAX •
            </textPath>
          </text>

          {/* Middle Ring Track: Counter-Rotating GROUNDING / REASONING / VALIDATION */}
          <g
            className={`transition-all duration-700 origin-center ${
              isProcessing ? 'animate-[spin_12s_linear_infinite_reverse]' : 'animate-[spin_40s_linear_infinite_reverse]'
            }`}
          >
            <circle
              cx="150"
              cy="150"
              r="96"
              stroke={isActive ? (isLight ? '#4f46e5' : '#818cf8') : isLight ? '#e2e8f0' : '#1e293b'}
              strokeWidth="1.5"
              strokeDasharray="24 60 12 40"
            />
            <circle cx="150" cy="54" r="2.5" fill={isLight ? '#4f46e5' : '#818cf8'} />
            <circle cx="150" cy="246" r="2.5" fill={isLight ? '#4f46e5' : '#818cf8'} />
          </g>

          {/* Middle Ring Text Path */}
          <path
            id="middleTextPath"
            d="M 150, 150 m -86, 0 a 86,86 0 1,0 172,0 a 86,86 0 1,0 -172,0"
            fill="none"
          />
          <text
            className={`text-[7px] font-mono tracking-[0.2em] uppercase select-none transition-colors ${
              isActive ? (isLight ? 'fill-indigo-600 font-bold' : 'fill-indigo-300') : isLight ? 'fill-slate-300' : 'fill-slate-700'
            }`}
          >
            <textPath href="#middleTextPath" startOffset="5%">
              GROUNDING • REASONING • VALIDATION •
            </textPath>
          </text>

          {/* Inner Core Die Enclosure */}
          <circle
            cx="150"
            cy="150"
            r="60"
            fill={isLight ? '#ffffff' : '#090d16'}
            stroke={isActive ? (isLight ? '#0284c7' : '#38bdf8') : isLight ? '#cbd5e1' : '#334155'}
            strokeWidth="2"
          />

          {/* Core Circuit Lines */}
          <line x1="150" y1="90" x2="150" y2="105" stroke={isActive ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
          <line x1="150" y1="195" x2="150" y2="210" stroke={isActive ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
          <line x1="90" y1="150" x2="105" y2="150" stroke={isActive ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
          <line x1="195" y1="150" x2="210" y2="150" stroke={isActive ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
        </svg>

        {/* Center: Micro-Die & Hardware Identity */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
          <div
            className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all duration-500 shadow-md ${
              isActive
                ? isLight
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30'
                  : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-500'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Cpu className={`h-6 w-6 ${isProcessing ? 'animate-pulse' : ''}`} />
          </div>

          <div className="mt-2 space-y-0.5">
            <span className="text-[11px] font-black tracking-wider uppercase">
              KORTEX
            </span>
            <div className="text-[9px] font-mono tracking-widest text-blue-500 font-bold">
              CORE
            </div>
          </div>

          <div
            className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border ${
              isProcessing
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                : isActive
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400'
            }`}
          >
            {isProcessing ? 'SYNTHESIZING' : isActive ? 'GROUNDED' : 'STANDBY'}
          </div>
        </div>
      </div>

      {/* Decision Vector Readout (Visible when active) */}
      <div
        className={`mt-3 w-full max-w-xs p-3 rounded-2xl border text-center transition-all duration-500 ${
          isActive
            ? isLight
              ? 'border-blue-200 bg-white/95 shadow-md shadow-blue-500/5'
              : 'border-cyan-500/30 bg-slate-950/80 shadow-lg shadow-cyan-500/10'
            : isLight
            ? 'border-slate-200 bg-white/60 opacity-60'
            : 'border-slate-800 bg-slate-950/40 opacity-50'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
          <span className="text-slate-400 uppercase tracking-wider">Decision Vector:</span>
          <span
            className={`font-bold ${
              isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
            }`}
          >
            {scenario.decisionVector.actionName}
          </span>
        </div>

        <div
          className={`text-[10px] font-mono p-1.5 rounded-xl text-left truncate ${
            isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
          }`}
        >
          {JSON.stringify(scenario.decisionVector.params)}
        </div>
      </div>
    </div>
  );
}
