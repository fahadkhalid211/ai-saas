'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Cpu,
  Activity,
  Layers,
  Database,
  Calendar,
  Shield,
  MessageSquare,
  Terminal,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  PIPELINE_SCENARIOS,
  TOPOLOGY_NODES,
  VECTOR_CLUSTERS,
  TopologyNode,
} from './types';
import { PipelineFallbackSvg } from './PipelineFallbackSvg';

// Dynamically import Three.js scene with ssr: false so Three.js stays out of initial bundle
const PipelineScene = dynamic(() => import('./PipelineScene'), {
  ssr: false,
  loading: () => <PipelineFallbackSvg scenario={PIPELINE_SCENARIOS[0]} />,
});

interface PipelineSectionProps {
  theme?: 'light' | 'dark';
}

export function PipelineSection({ theme = 'dark' }: PipelineSectionProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tool_mutex');

  const scenario = PIPELINE_SCENARIOS[activeScenarioIdx];
  const isLight = theme === 'light';

  const selectedNode =
    TOPOLOGY_NODES.find((n) => n.id === selectedNodeId) || TOPOLOGY_NODES[0];

  return (
    <div
      className={`w-full rounded-3xl border transition-colors duration-300 shadow-2xl overflow-hidden backdrop-blur-2xl ${
        isLight
          ? 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-200/70'
          : 'border-slate-800/90 bg-slate-950/95 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
      }`}
      aria-label="Kortex AI Autonomous Processing Systems Network: Wired & Freeflow Architecture Visualizer"
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
                Systems Architecture Network
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Topology 60FPS
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Hardware-accelerated WebGL network topology: Ingress channels, 384-d vector particle clouds, reasoning core, and concurrency-locked tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Radio className="h-3 w-3 text-cyan-500 animate-pulse" />
            <span>Interactive Node Inspector Ready</span>
          </div>
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
              onClick={() => setActiveScenarioIdx(idx)}
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
              INBOUND SIGNAL
            </span>
            <span className="italic truncate">&quot;{scenario.inboundText}&quot;</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-400">
            <Activity className="h-3 w-3 text-cyan-500" />
            <span>Click or hover any node in canvas to inspect telemetry</span>
          </div>
        </div>

        {/* Dynamic Three.js WebGL Wired & Freeflow Scene */}
        <div
          className={`rounded-2xl border overflow-hidden relative ${
            isLight ? 'border-slate-200 bg-slate-950' : 'border-slate-800/80 bg-slate-950'
          }`}
        >
          {/* Blueprint Overlay Header Tags */}
          <div className="absolute top-3 left-4 z-30 pointer-events-none flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span className="font-bold tracking-wider text-slate-300">WORKSPACE: KORTEX-PRODUCTION</span>
            <span>·</span>
            <span>TOPOLOGY: WIRED GRAPH + 384-D PARTICLE NEBULAE</span>
          </div>

          <div className="absolute top-3 right-4 z-30 pointer-events-none flex items-center gap-2 font-mono text-[10px] text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>PHOTON BUS ACTIVE</span>
          </div>

          <PipelineScene
            scenario={scenario}
            theme={theme}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />

          {/* Blueprint Bottom Subsystem Labels Bar */}
          <div className="p-3 border-t border-slate-900 bg-slate-950/95 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
              <span className="text-cyan-400 font-bold">6 INGRESS CHANNELS</span>
              <span>·</span>
              <span className="text-indigo-400 font-bold">3 VECTOR VAULTS</span>
              <span>·</span>
              <span className="text-purple-400 font-bold">3 COGNITIVE CORES</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">3 EXECUTION TOOLS</span>
            </div>
            <div className="text-slate-500 font-mono tracking-wider">
              PER-INSTANCE MUTEX LOCK · STRICT GROUNDING
            </div>
          </div>
        </div>

        {/* Subsystem Quick Nav Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1">Inspect Node:</span>
          {TOPOLOGY_NODES.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isPathActive = scenario.primaryPath.includes(node.id);

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? isLight
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'border-cyan-400 bg-cyan-950/60 text-cyan-200 font-bold'
                    : isPathActive
                    ? isLight
                      ? 'border-slate-300 bg-white text-slate-800'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    : 'border-slate-800/80 bg-slate-950/40 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <span>{node.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Node Detailed Architecture Telemetry Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800 bg-slate-900/70'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isLight
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                  }`}
                >
                  {selectedNode.badge}
                </span>
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Category: {selectedNode.category.replace('_', ' ')}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedNode.label}
              </h4>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {selectedNode.description}
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {selectedNode.telemetryMetrics?.map((metric, mIdx) => (
                <div
                  key={mIdx}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                    {metric.label}
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Spec & Sample Payload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Technical Specification
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedNode.technicalSpec}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-cyan-500" />
                <span>Live Event Payload</span>
              </div>
              <pre
                className={`p-2.5 rounded-xl text-[11px] font-mono overflow-x-auto border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800/90 text-cyan-300'
                }`}
              >
                <code>{selectedNode.samplePayload || '{}'}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Current Scenario Outcome Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs ${
            isLight
              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
              : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-200'
          }`}
        >
          <div className="space-y-0.5">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
              Verified Outcome: {scenario.outcome.title}
            </div>
            <p className="text-[11px] opacity-90">{scenario.outcome.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {scenario.outcome.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className={`px-2.5 py-1 rounded-lg border text-[10px] ${
                  isLight ? 'bg-white border-emerald-200' : 'bg-slate-900 border-emerald-800/80'
                }`}
              >
                <span className="text-slate-400 mr-1">{m.label}:</span>
                <span className="font-bold">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
