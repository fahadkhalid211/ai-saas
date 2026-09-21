'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Cpu, Activity, ArrowRight, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { PIPELINE_SCENARIOS, PipelineScenarioData } from './types';
import { PipelineFallbackSvg } from './PipelineFallbackSvg';

// Dynamically import Three.js scene with ssr: false so Three.js stays out of initial bundle
const PipelineScene = dynamic(() => import('./PipelineScene'), {
  ssr: false,
  loading: () => <PipelineFallbackSvg stages={PIPELINE_SCENARIOS[0].stages} activeStageIndex={0} />,
});

interface PipelineSectionProps {
  theme?: 'light' | 'dark';
}

export function PipelineSection({ theme = 'dark' }: PipelineSectionProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenario = PIPELINE_SCENARIOS[activeScenarioIdx];
  const isLight = theme === 'light';

  // Auto-advance through stages
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % scenario.stages.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, scenario.stages.length]);

  const selectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setActiveStageIdx(0);
  };

  const activeStage = scenario.stages[activeStageIdx];

  return (
    <div
      className={`w-full rounded-3xl border transition-colors duration-300 shadow-2xl overflow-hidden backdrop-blur-2xl ${
        isLight
          ? 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-200/70'
          : 'border-slate-800/90 bg-slate-950/95 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
      }`}
      aria-label="Kortex AI Autonomous Processing Pipeline: 6-stage grounded execution flow"
    >
      {/* Top Header & Telemetry Bar */}
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
                Autonomous Systems Pipeline
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                WebGL System Engine
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Hardware-accelerated visualization of local vector embeddings, hybrid RRF retrieval, factual grounding, and deterministic booking execution
            </p>
          </div>
        </div>

        {/* Play/Pause & Reset Controls */}
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
            onClick={() => setActiveStageIdx(0)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Restart Stages"
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
              <span>{sc.tabName}</span>
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

      <div className="p-4 sm:p-6 space-y-6">
        {/* Real-time Inbound Payload Banner */}
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
              INCOMING SIGNAL
            </span>
            <span className="italic truncate">&quot;{scenario.inputMessage}&quot;</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-400">
            <Activity className="h-3 w-3 text-cyan-500" />
            <span>Active Stage: {activeStageIdx + 1} of {scenario.stages.length}</span>
          </div>
        </div>

        {/* Dynamic Three.js WebGL Scene */}
        <div
          className={`rounded-2xl border overflow-hidden relative ${
            isLight ? 'border-slate-200 bg-slate-50/60' : 'border-slate-800/80 bg-slate-950/90'
          }`}
        >
          <PipelineScene
            stages={scenario.stages}
            activeStageIndex={activeStageIdx}
            theme={theme}
          />
        </div>

        {/* HTML Accessible Overlay: Stage Step Navigation & Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {scenario.stages.map((st, sIdx) => {
            const isActive = sIdx === activeStageIdx;
            const isPassed = sIdx < activeStageIdx;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setActiveStageIdx(sIdx);
                  setIsPlaying(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isActive
                    ? isLight
                      ? 'border-blue-500 bg-blue-50/90 text-blue-950 shadow-sm ring-1 ring-blue-500/20'
                      : 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : isPassed
                    ? isLight
                      ? 'border-emerald-300 bg-emerald-50/40 text-slate-700'
                      : 'border-emerald-500/30 bg-slate-900/60 text-slate-300'
                    : isLight
                    ? 'border-slate-200 bg-white/70 hover:border-slate-300 text-slate-500'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold">Stage {sIdx + 1}</span>
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ) : isPassed ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : null}
                </div>

                <div className="font-bold text-xs leading-tight">
                  {st.name}
                </div>

                <div className="text-[9px] font-mono text-slate-400 truncate">
                  {st.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Architecture Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
            isLight
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800 bg-slate-900/70'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                }`}
              >
                {activeStage.badge}
              </span>
              <h4 className="text-sm font-bold">{activeStage.name}</h4>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {activeStage.description}
            </p>
            <p className="text-[11px] font-mono text-slate-400 pt-0.5">
              {activeStage.detail}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs font-mono">
            {scenario.outcome.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className={`px-3 py-1.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">{m.label}</div>
                <div className="text-xs font-bold mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
