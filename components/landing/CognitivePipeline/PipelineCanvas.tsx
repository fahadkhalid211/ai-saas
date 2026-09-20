'use client';

import React, { useEffect, useRef } from 'react';
import { PipelineState } from './types';

interface PipelineCanvasProps {
  state: PipelineState;
  theme?: 'light' | 'dark';
}

export function PipelineCanvas({ state, theme = 'dark' }: PipelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 120);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 120;
    };
    window.addEventListener('resize', handleResize);

    // Multi-packet continuous and state-driven energy particles
    interface Packet {
      progress: number;
      speed: number;
      size: number;
      color: string;
      glow: string;
      trail: Array<{ x: number; y: number }>;
    }

    const packets: Packet[] = [
      { progress: 0.05, speed: 0.0035, size: 4, color: '#38bdf8', glow: '#0284c7', trail: [] },
      { progress: 0.28, speed: 0.0038, size: 5, color: '#818cf8', glow: '#6366f1', trail: [] },
      { progress: 0.52, speed: 0.0042, size: 5, color: '#60a5fa', glow: '#3b82f6', trail: [] },
      { progress: 0.74, speed: 0.0036, size: 4.5, color: '#34d399', glow: '#10b981', trail: [] },
      { progress: 0.91, speed: 0.0045, size: 4, color: '#10b981', glow: '#059669', trail: [] },
    ];

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const startX = 30;
      const endX = width - 30;
      const centerY = height / 2;

      // Draw Main Arterial Conduit Bus Track
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.4)' : 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Laser conduit inner core
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Waypoint Circuit Stations
      const stations = [
        { pct: 0.08, label: 'INGEST', color: isLight ? '#0284c7' : '#38bdf8' },
        { pct: 0.30, label: 'RAG', color: isLight ? '#4f46e5' : '#818cf8' },
        { pct: 0.52, label: 'CORE', color: isLight ? '#2563eb' : '#60a5fa' },
        { pct: 0.75, label: 'GATE', color: isLight ? '#059669' : '#34d399' },
        { pct: 0.94, label: 'LOCK', color: isLight ? '#059669' : '#10b981' },
      ];

      stations.forEach((st) => {
        const sx = startX + (endX - startX) * st.pct;

        // Station Halo
        ctx.beginPath();
        ctx.arc(sx, centerY, 14 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `${st.color}40`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Station Node Dot
        ctx.beginPath();
        ctx.arc(sx, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = st.color;
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Station Label
        ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(st.label, sx, centerY + 18);
      });

      // Render Animated Data Packets with Acceleration & Trails
      packets.forEach((pkt) => {
        // Natural speed modulation (decelerates when entering RAG/Brain/Gate, accelerates across straightaways)
        const isNearStation = stations.some((st) => Math.abs(pkt.progress - st.pct) < 0.05);
        const currentSpeed = isNearStation ? pkt.speed * 0.65 : pkt.speed * 1.35;

        pkt.progress += currentSpeed;
        if (pkt.progress >= 1.0) {
          pkt.progress = 0;
          pkt.trail = [];
        }

        const px = startX + (endX - startX) * pkt.progress;
        const py = centerY + Math.sin(time * 4 + pkt.progress * 10) * 2;

        // Update particle trail
        pkt.trail.push({ x: px, y: py });
        if (pkt.trail.length > 8) pkt.trail.shift();

        // Draw particle motion trail
        for (let i = 0; i < pkt.trail.length - 1; i++) {
          const p1 = pkt.trail[i];
          const p2 = pkt.trail[i + 1];
          const alpha = (i / pkt.trail.length) * 0.5;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `${pkt.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = pkt.size * (i / pkt.trail.length);
          ctx.stroke();
        }

        // Draw glowing packet head
        ctx.beginPath();
        ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.glow;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner bright spark
        ctx.beginPath();
        ctx.arc(px, py, pkt.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isLight]);

  return (
    <div className="w-full h-[90px] relative overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
