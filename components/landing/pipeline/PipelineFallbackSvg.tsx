'use client';

import React from 'react';
import { PipelineStageInfo } from './types';

interface PipelineFallbackSvgProps {
  stages: PipelineStageInfo[];
  activeStageIndex: number;
  theme?: 'light' | 'dark';
}

export function PipelineFallbackSvg({
  stages,
  activeStageIndex,
  theme = 'dark',
}: PipelineFallbackSvgProps) {
  const isLight = theme === 'light';

  return (
    <div
      className="w-full h-48 sm:h-56 relative flex items-center justify-center overflow-hidden"
      role="img"
      aria-label="Interactive pipeline flow diagram representing real-time AI stages: Visitor message, Embedding, Hybrid Retrieval, Rerank, Grounded LLM Answer, and Action Execution."
    >
      <svg
        className="w-full h-full max-w-4xl"
        viewBox="0 0 900 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connecting bus curve */}
        <path
          d="M 75 90 C 200 90, 250 90, 450 90 C 650 90, 700 90, 825 90"
          stroke={isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(56, 189, 248, 0.25)'}
          strokeWidth="3"
          strokeDasharray="6 6"
        />

        {/* Stage Nodes */}
        {stages.map((stage, idx) => {
          const x = 75 + (idx * 750) / (stages.length - 1);
          const y = 90;
          const isActive = idx === activeStageIndex;
          const isPassed = idx < activeStageIndex;

          return (
            <g key={stage.id} className="transition-all duration-300">
              {/* Outer halo */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r="28"
                  fill={isLight ? 'rgba(14, 165, 233, 0.15)' : 'rgba(56, 189, 248, 0.18)'}
                />
              )}

              {/* Station Ring */}
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={isLight ? '#ffffff' : '#0f172a'}
                stroke={
                  isActive
                    ? isLight
                      ? '#0284c7'
                      : '#38bdf8'
                    : isPassed
                    ? isLight
                      ? '#059669'
                      : '#10b981'
                    : isLight
                    ? '#cbd5e1'
                    : '#334155'
                }
                strokeWidth={isActive ? '3' : '2'}
              />

              {/* Center Dot */}
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={
                  isActive
                    ? isLight
                      ? '#0284c7'
                      : '#38bdf8'
                    : isPassed
                    ? isLight
                      ? '#059669'
                      : '#10b981'
                    : isLight
                    ? '#94a3b8'
                    : '#475569'
                }
              />

              {/* Text Label */}
              <text
                x={x}
                y={y + 36}
                textAnchor="middle"
                className={`text-[11px] font-bold font-sans ${
                  isActive
                    ? isLight
                      ? 'fill-sky-800'
                      : 'fill-cyan-300'
                    : isLight
                    ? 'fill-slate-600'
                    : 'fill-slate-400'
                }`}
              >
                {stage.name.split(' ')[0]}
              </text>

              <text
                x={x}
                y={y + 50}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-400"
              >
                {idx + 1} / {stages.length}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
