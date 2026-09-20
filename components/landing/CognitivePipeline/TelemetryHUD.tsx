'use client';

import React from 'react';
import { Activity, ShieldCheck, Cpu, Database, Lock, Calendar, Sparkles, Check } from 'lucide-react';
import { PipelineState, PipelineScenario } from './types';

interface TelemetryHUDProps {
  state: PipelineState;
  scenario: PipelineScenario;
  theme?: 'light' | 'dark';
  onStateSelect?: (state: PipelineState) => void;
}

export function TelemetryHUD({ state, scenario, theme = 'dark', onStateSelect }: TelemetryHUDProps) {
  const isLight = theme === 'light';

  const stages: Array<{ state: PipelineState; label: string; stepNum: string }> = [
    { state: 'ingesting', label: '1. Ingestion', stepNum: 'S1' },
    { state: 'retrieving', label: '2. RAG Vault', stepNum: 'S2' },
    { state: 'reasoning', label: '3. Core Deliberation', stepNum: 'S3' },
    { state: 'validating', label: '4. Firebreak Check', stepNum: 'S4' },
    { state: 'locking', label: '5. Mutex Lock', stepNum: 'S5' },
    { state: 'executing', label: '6. Action Dispatch', stepNum: 'S6' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Top Technical Telemetry Strip */}
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-mono flex flex-wrap items-center justify-between gap-3 ${
          isLight
            ? 'border-slate-200 bg-white/80 text-slate-700 shadow-sm'
            : 'border-slate-800 bg-slate-950/70 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ENGINE: 60FPS</span>
          </div>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-[11px] truncate">
            Channel: <span className="font-bold text-blue-500">{scenario.sourceChannel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`px-2 py-0.5 rounded border ${
              state === 'retrieving'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
            }`}
          >
            RAG: 384-DIM
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              state === 'validating' || state === 'locking' || state === 'executing' || state === 'complete'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
            }`}
          >
            FIREBREAK: 0.00%
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              state === 'locking' || state === 'executing' || state === 'complete'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
            }`}
          >
            MUTEX: ATOMIC
          </span>
        </div>
      </div>

      {/* Interactive Step Timeline Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {stages.map((st) => {
          const isActive = state === st.state;
          const isPassed =
            (st.state === 'ingesting' && state !== 'idle') ||
            (st.state === 'retrieving' && ['reasoning', 'validating', 'locking', 'executing', 'complete'].includes(state)) ||
            (st.state === 'reasoning' && ['validating', 'locking', 'executing', 'complete'].includes(state)) ||
            (st.state === 'validating' && ['locking', 'executing', 'complete'].includes(state)) ||
            (st.state === 'locking' && ['executing', 'complete'].includes(state)) ||
            (st.state === 'executing' && state === 'complete');

          return (
            <button
              key={st.state}
              type="button"
              onClick={() => onStateSelect && onStateSelect(st.state)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                isActive
                  ? isLight
                    ? 'border-blue-500 bg-blue-50/90 text-blue-950 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : isPassed
                  ? isLight
                    ? 'border-emerald-300 bg-emerald-50/50 text-slate-700'
                    : 'border-emerald-500/40 bg-slate-900 text-slate-300'
                  : isLight
                  ? 'border-slate-200 bg-white/60 text-slate-400 hover:border-slate-300'
                  : 'border-slate-800/80 bg-slate-950/40 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="font-bold">{st.stepNum}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
                {isPassed && !isActive && (
                  <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[3]" />
                )}
              </div>
              <div className="text-[11px] font-bold truncate leading-tight">
                {st.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
