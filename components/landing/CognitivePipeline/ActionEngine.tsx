'use client';

import React from 'react';
import { Lock, CheckCircle2, Calendar, Database, Mail, Users, ArrowRight } from 'lucide-react';
import { PipelineState, PipelineScenario } from './types';

interface ActionEngineProps {
  state: PipelineState;
  scenario: PipelineScenario;
  theme?: 'light' | 'dark';
}

export function ActionEngine({ state, scenario, theme = 'dark' }: ActionEngineProps) {
  const isLight = theme === 'light';
  const isLocking = state === 'locking';
  const isLocked = state === 'locking' || state === 'executing' || state === 'complete';
  const isComplete = state === 'complete';

  const destinationIcons: Record<string, React.ElementType> = {
    'CALENDAR SYNC': Calendar,
    'CRM DATABASE': Database,
    'EMAIL DISPATCH': Mail,
    'HUMAN TAKEOVER': Users,
    'STREAM CHANNEL': CheckCircle2,
    'AUDIT TRAIL': Database,
    'FIREBREAK GATE': Lock,
    'STAFF CHIME': Users,
  };

  return (
    <div className="relative flex flex-col justify-between p-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border transition-colors ${
              isLocked
                ? isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Deterministic Action Engine</span>
              {isLocking && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Atomic Mutex Clamps • Concurrency Immunity
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            isLocked
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
              : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
          }`}
        >
          {isLocked ? 'MUTEX LOCKED' : 'STANDBY'}
        </span>
      </div>

      {/* Physical Mutex Lock Mechanism Visualization */}
      <div className="relative my-4 flex-1 flex flex-col items-center justify-center min-h-[160px]">
        {/* Clamp Housing & Mechanical Lock Arms */}
        <div className="relative w-full max-w-[220px] flex items-center justify-center py-4">
          {/* Left Mechanical Clamp Arm */}
          <div
            className={`w-12 h-14 rounded-l-2xl border-y-2 border-l-2 flex items-center justify-center transition-transform duration-500 ${
              isLocked
                ? 'translate-x-1 border-emerald-500 bg-emerald-950/80 shadow-[-4px_0_15px_rgba(16,185,129,0.25)]'
                : isLight
                ? '-translate-x-3 border-slate-300 bg-slate-100'
                : '-translate-x-3 border-slate-700 bg-slate-900'
            }`}
          >
            <div className="w-1.5 h-6 rounded-full bg-slate-400/50" />
          </div>

          {/* Center Lock Cylinder Core */}
          <div
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center z-10 transition-all duration-500 shadow-lg ${
              isLocked
                ? 'border-emerald-400 bg-emerald-900 text-emerald-200 shadow-emerald-500/30'
                : isLight
                ? 'border-slate-300 bg-white text-slate-400'
                : 'border-slate-700 bg-slate-950 text-slate-600'
            }`}
          >
            <Lock className={`h-6 w-6 ${isLocked ? 'text-emerald-300' : ''}`} />
            <span className="text-[8px] font-mono font-bold mt-0.5">
              {isLocked ? 'LOCKED' : 'READY'}
            </span>
          </div>

          {/* Right Mechanical Clamp Arm */}
          <div
            className={`w-12 h-14 rounded-r-2xl border-y-2 border-r-2 flex items-center justify-center transition-transform duration-500 ${
              isLocked
                ? '-translate-x-1 border-emerald-500 bg-emerald-950/80 shadow-[4px_0_15px_rgba(16,185,129,0.25)]'
                : isLight
                ? 'translate-x-3 border-slate-300 bg-slate-100'
                : 'translate-x-3 border-slate-700 bg-slate-900'
            }`}
          >
            <div className="w-1.5 h-6 rounded-full bg-slate-400/50" />
          </div>
        </div>

        {/* Lock Telemetry Pill */}
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${
            isLocked
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
          }`}
        >
          Key: {scenario.mutexAction.lockKey} ({scenario.mutexAction.lockLatency})
        </div>
      </div>

      {/* Destination Actuator Nodes */}
      <div className="space-y-1.5">
        <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
          Connected Destination Actuators:
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {scenario.mutexAction.destinations.slice(0, 3).map((dest, idx) => {
            const Icon = destinationIcons[dest.name] || CheckCircle2;
            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-[11px] font-mono flex items-center justify-between transition-all ${
                  isComplete
                    ? isLight
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-xs'
                      : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                    : isLocked
                    ? isLight
                      ? 'border-slate-200 bg-white text-slate-700'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300'
                    : isLight
                    ? 'border-slate-200 bg-slate-50/50 text-slate-400'
                    : 'border-slate-800/60 bg-slate-950/30 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isComplete ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="font-bold truncate">{dest.name}</span>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isComplete ? dest.status : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
