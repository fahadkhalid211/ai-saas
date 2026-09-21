'use client';

import React from 'react';
import {
  PipelineScenarioData,
  TOPOLOGY_NODES,
  VECTOR_CLUSTERS,
  TOPOLOGY_WIRES,
} from './types';

interface PipelineFallbackSvgProps {
  scenario: PipelineScenarioData;
}

export function PipelineFallbackSvg({ scenario }: PipelineFallbackSvgProps) {
  // Map internal coords (-10 to +10 X, -5 to +5 Y) into SVG viewBox 0 0 1000 500
  const mapX = (x: number) => ((x + 10.5) / 21) * 960 + 20;
  const mapY = (y: number) => ((-y + 4.5) / 9) * 440 + 30;

  const coordLookup = new Map<string, { x: number; y: number }>();
  TOPOLOGY_NODES.forEach((n) => {
    coordLookup.set(n.id, { x: mapX(n.x), y: mapY(n.y) });
  });
  VECTOR_CLUSTERS.forEach((vc) => {
    coordLookup.set(vc.id, { x: mapX(vc.x), y: mapY(vc.y) });
  });

  return (
    <div
      className="w-full h-[420px] sm:h-[480px] lg:h-[520px] relative overflow-hidden bg-slate-950 p-4 rounded-2xl flex items-center justify-center border border-slate-800"
      aria-label="Kortex AI Systems Topology Diagram"
    >
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full text-slate-100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Blueprint Framing Boxes */}
        <rect
          x="20"
          y="20"
          width="960"
          height="460"
          rx="16"
          stroke="#1e293b"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Knowledge Bases Bounding Region */}
        <rect
          x="220"
          y="60"
          width="210"
          height="370"
          rx="12"
          stroke="#0f172a"
          fill="#020617"
          fillOpacity="0.4"
        />
        <text
          x="235"
          y="85"
          fill="#64748b"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.1em"
        >
          KNOWLEDGE VAULT · 384-D
        </text>

        {/* Deterministic Tools Bounding Region */}
        <rect
          x="480"
          y="310"
          width="290"
          height="140"
          rx="12"
          stroke="#064e3b"
          strokeDasharray="3 3"
          fill="#022c22"
          fillOpacity="0.2"
        />
        <text
          x="495"
          y="330"
          fill="#10b981"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.1em"
        >
          DETERMINISTIC CONTROLLERS · MUTEX LOCKED
        </text>

        {/* Connecting Wires */}
        {TOPOLOGY_WIRES.map((w) => {
          const p1 = coordLookup.get(w.sourceId);
          const p2 = coordLookup.get(w.targetId);
          if (!p1 || !p2) return null;

          const isActive =
            scenario.primaryPath.includes(w.sourceId) &&
            scenario.primaryPath.includes(w.targetId);

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const curvePath = `M ${p1.x} ${p1.y} Q ${midX} ${midY + (p1.y > 250 ? 20 : -20)} ${p2.x} ${p2.y}`;

          return (
            <path
              key={w.id}
              d={curvePath}
              stroke={isActive ? w.color || '#38bdf8' : '#1e293b'}
              strokeWidth={isActive ? 2 : 1}
              strokeOpacity={isActive ? 0.85 : 0.4}
              fill="none"
              filter={isActive ? 'url(#glowFilter)' : undefined}
            />
          );
        })}

        {/* Vector Clusters (Nebulae Clouds) */}
        {VECTOR_CLUSTERS.map((vc) => {
          const pt = coordLookup.get(vc.id);
          if (!pt) return null;

          return (
            <g key={vc.id} transform={`translate(${pt.x}, ${pt.y})`}>
              <ellipse
                rx="45"
                ry="30"
                fill={vc.color}
                fillOpacity="0.08"
                stroke={vc.color}
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              <circle r="4" fill={vc.color} />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {vc.name}
              </text>
              <text
                x="0"
                y="18"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontFamily="monospace"
              >
                {vc.itemCount} · {vc.dimension}
              </text>
            </g>
          );
        })}

        {/* Intent Beacon Halo */}
        {(() => {
          const pt = coordLookup.get('beacon_intent');
          if (!pt) return null;
          return (
            <g transform={`translate(${pt.x}, ${pt.y})`}>
              <circle r="28" fill="url(#beaconGlow)" />
              <circle r="16" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
              <circle r="6" fill="#f59e0b" />
              <text
                x="0"
                y="-22"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="0.05em"
              >
                INTENT BEACON
              </text>
            </g>
          );
        })()}

        {/* Topology Nodes */}
        {TOPOLOGY_NODES.map((node) => {
          if (node.id === 'beacon_intent') return null; // rendered specially above
          const pt = coordLookup.get(node.id);
          if (!pt) return null;

          const isActive = scenario.primaryPath.includes(node.id);

          return (
            <g key={node.id} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle
                r="10"
                fill={isActive ? node.color : '#0f172a'}
                fillOpacity={isActive ? 0.3 : 0.8}
                stroke={node.color}
                strokeWidth={isActive ? 2 : 1}
              />
              <circle r="4" fill={node.color} />
              <text
                x={node.category === 'ingress' ? -16 : node.category === 'egress' ? 16 : 0}
                y={node.category === 'tools' ? 22 : node.category === 'ingress' || node.category === 'egress' ? 4 : -16}
                textAnchor={
                  node.category === 'ingress' ? 'end' : node.category === 'egress' ? 'start' : 'middle'
                }
                fill={isActive ? '#f8fafc' : '#94a3b8'}
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
