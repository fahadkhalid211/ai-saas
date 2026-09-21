'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  TopologyNode,
  TopologyWire,
  VectorClusterInfo,
  TOPOLOGY_NODES,
  VECTOR_CLUSTERS,
  TOPOLOGY_WIRES,
  PipelineScenarioData,
} from './types';

interface PipelineSceneProps {
  scenario: PipelineScenarioData;
  theme?: 'light' | 'dark';
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export default function PipelineScene({
  scenario,
  theme = 'dark',
  selectedNodeId,
  onSelectNode,
}: PipelineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const isLight = theme === 'light';

  // Fast coordinate lookup
  const coordMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    TOPOLOGY_NODES.forEach((n) => map.set(n.id, { x: n.x, y: n.y }));
    VECTOR_CLUSTERS.forEach((vc) => map.set(vc.id, { x: vc.cx, y: vc.cy }));
    return map;
  }, []);

  // Compute curved wire paths
  const wirePaths = useMemo(() => {
    return TOPOLOGY_WIRES.map((w) => {
      const p1 = coordMap.get(w.sourceId);
      const p2 = coordMap.get(w.targetId);
      if (!p1 || !p2) return null;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      // Arc calculation
      let cx = (p1.x + p2.x) / 2;
      let cy = (p1.y + p2.y) / 2;

      if (w.targetId.startsWith('vc_') || w.sourceId.startsWith('vc_')) {
        // Curve outwards slightly
        cy += dy * 0.15;
      } else if (w.targetId === 'beacon_intent') {
        cy += (p1.y > 260 ? 15 : -15);
      } else if (w.targetId.startsWith('tool_')) {
        // Tool lines drop downwards
        cy += 25;
      } else {
        cy += dy * 0.1;
      }

      const pathData = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
      const isActive =
        scenario.primaryPath.includes(w.sourceId) &&
        scenario.primaryPath.includes(w.targetId);

      return {
        ...w,
        p1,
        p2,
        cx,
        cy,
        pathData,
        isActive,
      };
    }).filter(Boolean);
  }, [coordMap, scenario.primaryPath]);

  // Canvas 2D Particle & Photon Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number | null = null;
    let isVisible = true;

    // Set canvas dimensions with high-DPI scaling
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    // Initialize Vector Cluster Particles (Freeflow Nebulae)
    interface ClusterParticle {
      clusterId: string;
      baseX: number;
      baseY: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      phase: number;
      size: number;
      alpha: number;
    }

    const clusterParticles: ClusterParticle[] = [];

    VECTOR_CLUSTERS.forEach((cluster) => {
      const count = 36;
      for (let i = 0; i < count; i++) {
        // Clustered elliptical scatter
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 1.6) * 65;
        const baseX = cluster.cx + Math.cos(angle) * dist * 1.1;
        const baseY = cluster.cy + Math.sin(angle) * dist * 0.75;

        clusterParticles.push({
          clusterId: cluster.id,
          baseX,
          baseY,
          radius: dist,
          color: cluster.color,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.6,
          phase: Math.random() * Math.PI * 2,
          size: Math.random() < 0.2 ? 3.2 : Math.random() < 0.6 ? 2.2 : 1.4,
          alpha: 0.4 + Math.random() * 0.55,
        });
      }
    });

    let time = 0;

    const render = () => {
      if (!isVisible) return;

      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Virtual viewBox 1200 x 640 scale factor
      const scaleX = rect.width / 1200;
      const scaleY = rect.height / 640;

      ctx.save();
      ctx.scale(scaleX, scaleY);

      time += 0.018;

      // 1. Render Freeflow Vector Particle Nebulae
      clusterParticles.forEach((p, idx) => {
        const isClusterActive = scenario.primaryPath.includes(p.clusterId);
        const driftX = Math.sin(time * 0.8 + p.phase + idx * 0.1) * 6;
        const driftY = Math.cos(time * 0.9 + p.phase * 1.2 + idx * 0.1) * 5;

        const x = p.baseX + driftX;
        const y = p.baseY + driftY;

        ctx.beginPath();
        ctx.arc(x, y, p.size * (isClusterActive ? 1.25 : 1.0), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isClusterActive ? p.alpha : p.alpha * 0.6;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isClusterActive ? 8 : 4;
        ctx.fill();
      });

      // 2. Render Moving Photon Energy Pulses along Active Wires
      ctx.shadowBlur = 0;
      const activeWireList = wirePaths.filter((w) => w && w.isActive) as NonNullable<typeof wirePaths[0]>[];

      activeWireList.forEach((w) => {
        const pulseCount = 3;
        for (let i = 0; i < pulseCount; i++) {
          const t = ((time * 0.35 + i / pulseCount) % 1.0);
          // Quadratic Bezier evaluation: B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
          const invT = 1 - t;
          const px = invT * invT * w.p1.x + 2 * invT * t * w.cx + t * t * w.p2.x;
          const py = invT * invT * w.p1.y + 2 * invT * t * w.cy + t * t * w.p2.y;

          // Photon outer halo
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = w.color;
          ctx.globalAlpha = 0.45;
          ctx.shadowColor = w.color;
          ctx.shadowBlur = 10;
          ctx.fill();

          // Photon bright core
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.95;
          ctx.fill();
        }
      });

      // 3. Render Intent Beacon Golden Pulses
      const beaconPos = coordMap.get('beacon_intent');
      if (beaconPos) {
        const pulseRadius = 16 + Math.sin(time * 3) * 3;
        ctx.beginPath();
        ctx.arc(beaconPos.x, beaconPos.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.globalAlpha = 0.35 + Math.sin(time * 3) * 0.15;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Intersection & Visibility Observers
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && animationFrameId === null && !prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        isVisible = true;
        if (animationFrameId === null && !prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (prefersReducedMotion) {
      render();
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wirePaths, scenario.primaryPath, coordMap]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[460px] sm:h-[540px] lg:h-[620px] relative overflow-hidden select-none bg-[#070b16] rounded-2xl"
      aria-label="Crescelo Systems Architecture Map"
    >
      {/* 1. Crisp Vector SVG Base Layer (Typography, Wires, Nodes, Radar Arcs, Blueprint Boxes) */}
      <svg
        viewBox="0 0 1200 640"
        className="w-full h-full absolute inset-0 z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Blueprint Framing Dashed Boxes */}
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
        <text
          x="320"
          y="109"
          fill="#475569"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.05em"
        >
          chunks · embeddings · graph · hybrid RRF
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
        <text
          x="640"
          y="499"
          fill="#059669"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.05em"
        >
          tools only — not a knowledge source
        </text>

        {/* Connecting Wires */}
        {wirePaths.map((w) => {
          if (!w) return null;
          return (
            <path
              key={w.id}
              d={w.pathData}
              stroke={w.color}
              strokeWidth={w.isActive ? 1.8 : 0.8}
              strokeOpacity={w.isActive ? 0.75 : 0.16}
              fill="none"
              filter={w.isActive ? 'url(#nodeGlow)' : undefined}
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
                fontWeight="500"
                opacity={0.8}
              >
                {vc.itemCount} · {vc.dimension}
              </text>
            </g>
          );
        })}

        {/* Intent Radar Beacon Node */}
        {(() => {
          const node = TOPOLOGY_NODES.find((n) => n.id === 'beacon_intent');
          if (!node) return null;
          const isHovered = hoveredNodeId === node.id;
          const isSelected = selectedNodeId === node.id;

          return (
            <g
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode && onSelectNode(node.id)}
            >
              <circle
                r="36"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                strokeOpacity="0.4"
                fill="#f59e0b"
                fillOpacity="0.03"
              />
              <circle
                r="22"
                stroke="#f59e0b"
                strokeWidth="1.5"
                fill="#0f172a"
                fillOpacity="0.9"
                filter="url(#nodeGlow)"
              />
              <circle r="6" fill="#f59e0b" />
              <text
                x="0"
                y="-30"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="0.08em"
              >
                INTENT RADAR
              </text>
              <text
                x="0"
                y="34"
                textAnchor="middle"
                fill="#d97706"
                fontSize="8"
                fontFamily="monospace"
              >
                SIGNAL INGESTION
              </text>
            </g>
          );
        })()}

        {/* Regular Topology Nodes */}
        {TOPOLOGY_NODES.map((node) => {
          if (node.id === 'beacon_intent') return null; // rendered specially above

          const isPathActive = scenario.primaryPath.includes(node.id);
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          const isIngress = node.category === 'ingress';
          const isEgress = node.category === 'egress';
          const isTool = node.category === 'tools';

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer transition-transform duration-200 group"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode && onSelectNode(node.id)}
            >
              {/* Radar Satellite Arc for Ingress Channels */}
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

              {/* Concentric Outer Ring */}
              <circle
                r={isSelected ? 16 : isHovered ? 14 : 11}
                stroke={node.color}
                strokeWidth={isPathActive || isSelected ? 1.8 : 1.2}
                strokeOpacity={isPathActive || isSelected ? 0.9 : 0.4}
                fill={isPathActive ? node.color : '#0a0f1d'}
                fillOpacity={isPathActive ? 0.18 : 0.8}
                filter={isPathActive || isSelected ? 'url(#nodeGlow)' : undefined}
              />

              {/* Inner Glowing Center Dot */}
              <circle
                r={isSelected ? 5 : 3.5}
                fill={node.color}
                opacity={isPathActive || isSelected ? 1 : 0.8}
              />

              {/* Node Text Label */}
              <text
                x={isIngress ? -18 : isEgress ? 20 : 0}
                y={isTool ? 22 : isIngress || isEgress ? 4 : -18}
                textAnchor={isIngress ? 'end' : isEgress ? 'start' : 'middle'}
                fill={
                  isSelected
                    ? '#ffffff'
                    : isPathActive
                    ? '#f8fafc'
                    : '#94a3b8'
                }
                fontSize={isSelected || isPathActive ? 11 : 10}
                fontFamily={isIngress || isEgress ? 'monospace' : 'sans-serif'}
                fontWeight={isSelected || isPathActive ? 'bold' : '500'}
                letterSpacing={isIngress || isEgress ? '0.02em' : 'normal'}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 2. Dynamic 2D Canvas Layer (60FPS Freeflow Particle Nebulae & Moving Photon Streams) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 z-20 pointer-events-none"
      />
    </div>
  );
}
