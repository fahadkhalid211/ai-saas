'use client';

import React from 'react';
import { Database, FileText, Search, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { PipelineState, PipelineScenario } from './types';

interface RagMemoryProps {
  state: PipelineState;
  scenario: PipelineScenario;
  theme?: 'light' | 'dark';
}

export function RagMemory({ state, scenario, theme = 'dark' }: RagMemoryProps) {
  const isLight = theme === 'light';
  const isScanning = state === 'retrieving';
  const isGrounded = state === 'retrieving' || state === 'reasoning' || state === 'validating' || state === 'locking' || state === 'executing' || state === 'complete';

  return (
    <div className="relative flex flex-col justify-between p-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isGrounded
                ? isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-indigo-950/80 border-indigo-700 text-indigo-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>RAG Memory Vault</span>
              {isScanning && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              384-Dim Local Vector Space • L2 Cache
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            isScanning
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
              : isGrounded
              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
          }`}
        >
          {isScanning ? 'COSINE SCAN' : isGrounded ? 'RETRIEVED' : 'IDLE'}
        </span>
      </div>

      {/* 3D Vector Memory Field with Document Nodes */}
      <div className="relative my-4 flex-1 min-h-[160px] flex flex-col justify-center">
        {/* Background Vector Mesh Lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${isLight ? '#4f46e5' : '#818cf8'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Scanning Radar Laser Line (Active when scanning) */}
        {isScanning && (
          <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-indigo-400 to-transparent animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_12px_#818cf8] pointer-events-none left-1/2" />
        )}

        {/* Document Nodes Stack */}
        <div className="space-y-2 relative z-10">
          {scenario.documents.map((doc) => {
            const isMatched = isGrounded && doc.matched;
            const isDimmed = isGrounded && !doc.matched;

            return (
              <div
                key={doc.id}
                className={`p-2 rounded-xl border text-xs transition-all duration-500 flex items-center justify-between gap-2 ${
                  isMatched
                    ? isLight
                      ? 'border-indigo-400 bg-indigo-50/90 text-indigo-950 shadow-sm'
                      : 'border-indigo-500/70 bg-indigo-950/60 text-indigo-100 shadow-md shadow-indigo-500/10'
                    : isDimmed
                    ? 'opacity-30 border-slate-800 bg-transparent text-slate-500'
                    : isLight
                    ? 'border-slate-200 bg-white/60 text-slate-700'
                    : 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      isMatched
                        ? isLight
                          ? 'bg-indigo-200 border-indigo-300 text-indigo-800'
                          : 'bg-indigo-600/40 border-indigo-400/50 text-indigo-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {doc.type}
                  </span>
                  <span className="font-mono text-[11px] truncate">{doc.filename}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                  {isMatched ? (
                    <>
                      <span className="text-emerald-500 font-bold">
                        {(doc.relevanceScore * 100).toFixed(0)}% match
                      </span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </>
                  ) : (
                    <span className="text-slate-500">
                      {(doc.relevanceScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounded Context Capsule (Formed output) */}
      <div
        className={`p-3 rounded-2xl border text-xs transition-all duration-500 ${
          isGrounded
            ? isLight
              ? 'border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 text-slate-800 shadow-sm'
              : 'border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 to-slate-900 text-slate-200 shadow-lg shadow-indigo-500/10'
            : isLight
            ? 'border-slate-200 bg-slate-50/50 opacity-50'
            : 'border-slate-800/60 bg-slate-950/40 opacity-40'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
          <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Grounded Context Capsule</span>
          </div>
          <span className="text-slate-400 font-mono">
            {scenario.contextCapsule.tokenCount} tokens
          </span>
        </div>

        <p className="text-[11px] leading-relaxed line-clamp-2 text-slate-600 dark:text-slate-300 font-sans">
          {scenario.contextCapsule.summary}
        </p>

        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span className="truncate">
            Citations: {scenario.contextCapsule.citations.join(', ')}
          </span>
          <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0 ml-1" />
        </div>
      </div>
    </div>
  );
}
