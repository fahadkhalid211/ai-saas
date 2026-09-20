'use client';

import React from 'react';
import { Shield, ShieldCheck, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { PipelineState, PipelineScenario } from './types';

interface FirebreakGateProps {
  state: PipelineState;
  scenario: PipelineScenario;
  theme?: 'light' | 'dark';
}

export function FirebreakGate({ state, scenario, theme = 'dark' }: FirebreakGateProps) {
  const isLight = theme === 'light';
  const isValidating = state === 'validating';
  const isPassed = state === 'locking' || state === 'executing' || state === 'complete';
  const isArmed = state !== 'idle';

  return (
    <div className="relative flex flex-col justify-between p-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border transition-colors ${
              isPassed
                ? isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                : isValidating
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Security Firebreak</span>
              {isValidating && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Strict Hallucination Containment Gate
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            isPassed
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
              : isValidating
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
              : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
          }`}
        >
          {isPassed ? 'GATE OPEN • PASS' : isValidating ? 'VALIDATING' : 'PERIMETER ARMED'}
        </span>
      </div>

      {/* Physical Security Checkpoint Gate Visualization */}
      <div className="relative my-4 flex-1 flex flex-col items-center justify-center min-h-[160px]">
        {/* Containment Laser Pillars */}
        <div className="w-full flex items-center justify-between px-4 sm:px-8 relative">
          {/* Left Laser Emitter Post */}
          <div
            className={`w-3 h-28 rounded-lg border flex flex-col justify-around items-center py-2 transition-all ${
              isPassed
                ? 'border-emerald-500 bg-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : isValidating
                ? 'border-amber-400 bg-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : isLight
                ? 'border-slate-300 bg-slate-100'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isPassed ? 'bg-emerald-400 animate-ping' : isValidating ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>

          {/* Center Containment Laser Field */}
          <div className="flex-1 mx-3 h-24 relative flex items-center justify-center overflow-hidden">
            {/* Laser Scanning Lines */}
            <div
              className={`absolute inset-x-0 h-0.5 transition-all duration-500 ${
                isPassed
                  ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                  : isValidating
                  ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-bounce'
                  : 'bg-slate-700 opacity-40'
              }`}
            />
            <div
              className={`absolute inset-x-0 h-0.5 top-1/3 transition-all duration-500 ${
                isPassed ? 'bg-emerald-500/50' : isValidating ? 'bg-amber-500/50' : 'bg-slate-800'
              }`}
            />
            <div
              className={`absolute inset-x-0 h-0.5 bottom-1/3 transition-all duration-500 ${
                isPassed ? 'bg-emerald-500/50' : isValidating ? 'bg-amber-500/50' : 'bg-slate-800'
              }`}
            />

            {/* Checkpoint Status Badge in Center */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono tracking-wider font-bold transition-all shadow-md z-10 flex items-center gap-1.5 ${
                isPassed
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-500/20'
                  : isValidating
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300 animate-pulse'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-500'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {isPassed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>GROUNDING VERIFIED</span>
                </>
              ) : isValidating ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  <span>CHECKING SPECULATION</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>GATE STANDBY</span>
                </>
              )}
            </div>
          </div>

          {/* Right Laser Emitter Post */}
          <div
            className={`w-3 h-28 rounded-lg border flex flex-col justify-around items-center py-2 transition-all ${
              isPassed
                ? 'border-emerald-500 bg-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : isValidating
                ? 'border-amber-400 bg-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : isLight
                ? 'border-slate-300 bg-slate-100'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isPassed ? 'bg-emerald-400 animate-ping' : isValidating ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* Validation Checklist Output Box */}
      <div
        className={`p-3 rounded-2xl border text-xs transition-all duration-500 ${
          isPassed
            ? isLight
              ? 'border-emerald-200 bg-emerald-50/70 text-slate-800 shadow-sm'
              : 'border-emerald-500/30 bg-slate-900/90 text-slate-200'
            : isLight
            ? 'border-slate-200 bg-slate-50/50'
            : 'border-slate-800/80 bg-slate-950/40 text-slate-400'
        }`}
      >
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
          Grounding Check Protocol:
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Context Verified:</span>
            <span className={isPassed ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
              {isPassed ? 'PASS' : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Business Rules Verified:</span>
            <span className={isPassed ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
              {isPassed ? 'PASS' : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Action Validated:</span>
            <span className={isPassed ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
              {isPassed ? 'PASS' : 'STANDBY'}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold">
            <span className="text-slate-600 dark:text-slate-300">Speculation Risk:</span>
            <span className="text-emerald-500">
              {scenario.firebreakValidation.speculationRisk}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
