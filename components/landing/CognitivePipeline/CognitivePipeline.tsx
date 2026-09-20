'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Database,
  Calendar,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';
import { PipelineState, PIPELINE_SCENARIOS, PipelineScenario } from './types';
import { BrainCore } from './BrainCore';
import { RagMemory } from './RagMemory';
import { FirebreakGate } from './FirebreakGate';
import { ActionEngine } from './ActionEngine';
import { TelemetryHUD } from './TelemetryHUD';
import { PipelineCanvas } from './PipelineCanvas';

interface CognitivePipelineProps {
  theme?: 'light' | 'dark';
}

export function CognitivePipeline({ theme = 'dark' }: CognitivePipelineProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [state, setState] = useState<PipelineState>('ingesting');
  const [isPlaying, setIsPlaying] = useState(true);

  const scenario = PIPELINE_SCENARIOS[activeScenarioIdx];
  const isLight = theme === 'light';

  // Automated 8-Step Demonstration State Machine Loop
  useEffect(() => {
    if (!isPlaying) return;

    const stateSequence: Array<{ nextState: PipelineState; durationMs: number }> = [
      { nextState: 'ingesting', durationMs: 2400 },
      { nextState: 'retrieving', durationMs: 3200 },
      { nextState: 'reasoning', durationMs: 3400 },
      { nextState: 'validating', durationMs: 2600 },
      { nextState: 'locking', durationMs: 2200 },
      { nextState: 'executing', durationMs: 2000 },
      { nextState: 'complete', durationMs: 3800 },
    ];

    let currentIndex = stateSequence.findIndex((s) => s.nextState === state);
    if (currentIndex === -1) currentIndex = 0;

    const currentStep = stateSequence[currentIndex];
    const timeout = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % stateSequence.length;
      setState(stateSequence[nextIndex].nextState);
    }, currentStep.durationMs);

    return () => clearTimeout(timeout);
  }, [isPlaying, state]);

  const selectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setState('ingesting');
  };

  return (
    <div
      className={`w-full rounded-3xl border transition-colors duration-300 shadow-2xl overflow-hidden backdrop-blur-2xl ${
        isLight
          ? 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-200/70'
          : 'border-slate-800/90 bg-slate-950/95 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Top Header Bar */}
      <div
        className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-cyan-500/20'
            }`}
          >
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight uppercase">
                Autonomous Cognitive Pipeline
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Systems Operating
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Cinematic visual tracking of signal ingestion, vector memory, cognitive deliberation, firebreak validation, and mutex locking
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-mono transition flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="h-2 w-2 rounded-xs bg-amber-400" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-emerald-400" />
                <span>RESUME</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setState('ingesting')}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Reset Pipeline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div
        className={`px-4 sm:px-6 pt-3 border-b flex items-center gap-2 overflow-x-auto no-scrollbar ${
          isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-800/80 bg-slate-950/30'
        }`}
      >
        {PIPELINE_SCENARIOS.map((sc, idx) => {
          const isActive = idx === activeScenarioIdx;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => selectScenario(idx)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                isActive
                  ? isLight
                    ? 'border-blue-600 bg-white text-blue-700 shadow-sm'
                    : 'border-cyan-400 bg-cyan-950/30 text-cyan-200 font-bold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{sc.title}</span>
              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? isLight
                      ? 'bg-blue-100 text-blue-800 font-bold'
                      : 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : isLight
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sc.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Operational Surface */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Real-time Inbound Payload Terminal Banner */}
        <div
          className={`p-3.5 rounded-2xl border font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isLight
              ? 'border-slate-200 bg-slate-50/90 text-slate-800 shadow-inner'
              : 'border-slate-800 bg-slate-900/80 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded border shrink-0 ${
                isLight
                  ? 'bg-blue-100 border-blue-200 text-blue-800'
                  : 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300'
              }`}
            >
              LIVE SIGNAL
            </span>
            <span className="italic truncate">&quot;{scenario.inputMessage}&quot;</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-bold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              INTENT: {scenario.intent} ({scenario.intentConfidence})
            </span>
          </div>
        </div>

        {/* Dynamic 60fps Arterial Bus Track Canvas */}
        <PipelineCanvas state={state} theme={theme} />

        {/* Central Core & Architectural Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Pillar 1: RAG Memory Vault (Cols 1-4) */}
          <div
            className={`lg:col-span-4 rounded-3xl border overflow-hidden flex flex-col justify-between transition-colors ${
              isLight
                ? 'border-slate-200 bg-slate-50/60 shadow-sm'
                : 'border-slate-800/90 bg-slate-900/50 shadow-inner'
            }`}
          >
            <RagMemory state={state} scenario={scenario} theme={theme} />
          </div>

          {/* Pillar 2: Central KORTEX CORE (Cols 5-8) */}
          <div
            className={`lg:col-span-4 rounded-3xl border overflow-hidden flex flex-col items-center justify-center transition-colors relative ${
              isLight
                ? 'border-slate-200 bg-white shadow-md'
                : 'border-slate-800/90 bg-slate-950/90 shadow-2xl'
            }`}
          >
            <BrainCore state={state} scenario={scenario} theme={theme} />
          </div>

          {/* Pillar 3: Firebreak & Mutex Action Engine (Cols 9-12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Firebreak Security Checkpoint */}
            <div
              className={`rounded-3xl border overflow-hidden transition-colors flex-1 ${
                isLight
                  ? 'border-slate-200 bg-slate-50/60 shadow-sm'
                  : 'border-slate-800/90 bg-slate-900/50 shadow-inner'
              }`}
            >
              <FirebreakGate state={state} scenario={scenario} theme={theme} />
            </div>

            {/* Mutex Deterministic Action Engine */}
            <div
              className={`rounded-3xl border overflow-hidden transition-colors flex-1 ${
                isLight
                  ? 'border-slate-200 bg-slate-50/60 shadow-sm'
                  : 'border-slate-800/90 bg-slate-900/50 shadow-inner'
              }`}
            >
              <ActionEngine state={state} scenario={scenario} theme={theme} />
            </div>
          </div>
        </div>

        {/* Operational Telemetry HUD & Step Timeline */}
        <TelemetryHUD
          state={state}
          scenario={scenario}
          theme={theme}
          onStateSelect={(st) => {
            setState(st);
            setIsPlaying(false);
          }}
        />

        {/* Confirmed Real-World Execution Result Banner */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            state === 'complete' || state === 'executing'
              ? isLight
                ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-blue-50 text-slate-800 shadow-md'
                : 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 text-slate-100 shadow-lg shadow-emerald-500/10'
              : isLight
              ? 'border-slate-200 bg-slate-50/80 text-slate-600'
              : 'border-slate-800 bg-slate-900/40 text-slate-400'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  state === 'complete' || state === 'executing'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {state === 'complete' ? 'EXECUTION COMPLETE' : 'PIPELINE ACTIVE'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold">
                {scenario.mutexAction.confirmedOutcome}
              </h4>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Lock Key: {scenario.mutexAction.lockKey} • Mutex Acquired: {scenario.mutexAction.lockLatency}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400">
              Zero Token Markup
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
