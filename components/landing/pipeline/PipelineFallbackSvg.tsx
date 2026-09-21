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
  const coordMap = new Map<string, { x: number; y: number }>();
  TOPOLOGY_NODES.forEach((n) => coordMap.set(n.id, { x: n.x, y: n.y }));
  VECTOR_CLUSTERS.forEach((vc) => coordMap.set(vc.id, { x: vc.cx, y: vc.cy }));

  return (
    <div
      className="w-full h-[460px] sm:h-[540px] lg:h-[620px] relative overflow-hidden bg-[#070b16] rounded-2xl"
      aria-label="Kortex AI Systems Architecture Map"
    >
      <svg
        viewBox="0 0 1200 640"
        className="w-full h-full absolute inset-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Knowledge Bases Region */}
        <rect
          x="300"
          y="70"
          width="260"
          height="450"
          rx="12"
          stroke="#1e293b"
          strokeDasharray="4 4"
          strokeWidth="1"
          fill="#0a0f1d"
          fillOpacity="0.3"
        />
        <text
          x="320"
          y="95"
          fill="#64748b"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.12em"
        >
          KNOWLEDGE BASES · 384-D
        </text>

        {/* Deterministic Controllers Region */}
        <rect
          x="620"
          y="460"
          width="320"
          height="120"
          rx="12"
          stroke="#064e3b"
          strokeDasharray="4 4"
          strokeWidth="1"
          fill="#022c22"
          fillOpacity="0.2"
        />
        <text
          x="640"
          y="485"
          fill="#10b981"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.12em"
        >
          DETERMINISTIC TOOLS · MUTEX LOCKED
        </text>

        {/* Connecting Wires */}
        {TOPOLOGY_WIRES.map((w) => {
          const p1 = coordMap.get(w.sourceId);
          const p2 = coordMap.get(w.targetId);
          if (!p1 || !p2) return null;

          const cx = (p1.x + p2.x) / 2;
          const cy = (p1.y + p2.y) / 2 + 10;
          const pathData = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
          const isActive =
            scenario.primaryPath.includes(w.sourceId) &&
            scenario.primaryPath.includes(w.targetId);

          return (
            <path
              key={w.id}
              d={pathData}
              stroke={w.color}
              strokeWidth={isActive ? 1.8 : 0.8}
              strokeOpacity={isActive ? 0.75 : 0.16}
              fill="none"
            />
          );
        })}

        {/* Vector Clusters Label Anchors */}
        {VECTOR_CLUSTERS.map((vc) => {
          const isClusterActive = scenario.primaryPath.includes(vc.id);
          return (
            <g key={vc.id} transform={`translate(${vc.cx}, ${vc.cy})`}>
              <ellipse
                rx="62"
                ry="40"
                stroke={vc.color}
                strokeWidth="1"
                strokeDasharray="2 3"
                strokeOpacity={isClusterActive ? 0.45 : 0.18}
                fill={vc.color}
                fillOpacity={isClusterActive ? 0.04 : 0.01}
              />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill={isClusterActive ? '#f8fafc' : '#94a3b8'}
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight={isClusterActive ? 'bold' : '600'}
              >
                {vc.name}
              </text>
              <text
                x="0"
                y="24"
                textAnchor="middle"
                fill={vc.color}
                fontSize="9"
                fontFamily="monospace"
                opacity={0.8}
              >
                {vc.itemCount} · {vc.dimension}
              </text>
            </g>
          );
        })}

        {/* Topology Nodes */}
        {TOPOLOGY_NODES.map((node) => {
          const isPathActive = scenario.primaryPath.includes(node.id);
          const isIngress = node.category === 'ingress';
          const isEgress = node.category === 'egress';
          const isTool = node.category === 'tools';

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {node.radarArc && (
                <g transform="translate(18, 0)">
                  {[0.5, 0.75, 1.0].map((scale, sIdx) => (
                    <circle
                      key={sIdx}
                      r="1.4"
                      cx={Math.cos((sIdx - 1) * 0.5) * 8}
                      cy={Math.sin((sIdx - 1) * 0.5) * 8}
                      fill={node.color}
                      opacity={0.6 + sIdx * 0.2}
                    />
                  ))}
                </g>
              )}
              <circle
                r="11"
                stroke={node.color}
                strokeWidth={isPathActive ? 1.8 : 1.2}
                strokeOpacity={isPathActive ? 0.9 : 0.4}
                fill={isPathActive ? node.color : '#0a0f1d'}
                fillOpacity={isPathActive ? 0.18 : 0.8}
              />
              <circle r="3.5" fill={node.color} opacity={isPathActive ? 1 : 0.8} />
              <text
                x={isIngress ? -18 : isEgress ? 20 : 0}
                y={isTool ? 22 : isIngress || isEgress ? 4 : -18}
                textAnchor={isIngress ? 'end' : isEgress ? 'start' : 'middle'}
                fill={isPathActive ? '#f8fafc' : '#94a3b8'}
                fontSize="10"
                fontFamily={isIngress || isEgress ? 'monospace' : 'sans-serif'}
                fontWeight={isPathActive ? 'bold' : '500'}
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
