'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Cpu,
  Database,
  Calendar,
  Zap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Play,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  badge: string;
  input: string;
  inputSource: string;
  steps: Array<{
    stage: 'perception' | 'memory' | 'reasoning' | 'action';
    title: string;
    detail: string;
    latency: string;
    telemetry: string;
  }>;
  finalOutcome: string;
  actionCard: {
    type: 'booking' | 'lead' | 'grounded_rag';
    headline: string;
    subline: string;
    metrics: Array<{ label: string; value: string }>;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'booking_mutex',
    name: 'Instant Calendar Booking & Concurrency Mutex',
    badge: 'Real-Time Scheduling',
    input: 'Can I reserve an executive appointment tomorrow at 10:00 AM?',
    inputSource: 'Web Concierge (Desktop / Mobile)',
    steps: [
      {
        stage: 'perception',
        title: 'Sensory Parsing & Intent Classification',
        detail: 'Extracted booking intent for slot 2026-09-22 10:00:00 UTC with 99.4% confidence.',
        latency: '8ms',
        telemetry: 'INTENT_DETECTED: schedule_appointment',
      },
      {
        stage: 'memory',
        title: 'Slot Availability & Redis L2 Cache Verification',
        detail: 'Queried active service schema and verified calendar slot availability in Upstash L2 cache.',
        latency: '12ms',
        telemetry: 'SLOT_STATUS: free | CONCURRENCY_KEY: lock_slot_10am',
      },
      {
        stage: 'reasoning',
        title: 'Cognitive Brain Engine & Firebreak Check',
        detail: 'Generated slot confirmation card. Validated business hours and strict zero-hallucination policy.',
        latency: '310ms',
        telemetry: 'PROVIDER: auto_free (Groq Llama 3.3 70B) | HALLUCINATION_RISK: 0.00%',
      },
      {
        stage: 'action',
        title: 'Physical Action & Concurrency Mutex Lock',
        detail: 'Mutex acquired in 3ms. Dispatched Google Calendar, Outlook, and .ics confirmations.',
        latency: '42ms',
        telemetry: 'MUTEX_ACQUIRED: true | CALENDAR_SYNC: dispatched',
      },
    ],
    finalOutcome: 'Appointment confirmed with zero double-booking possibility. Calendar invites and 24h reminder queue active.',
    actionCard: {
      type: 'booking',
      headline: 'Executive Appointment Confirmed',
      subline: 'Tomorrow at 10:00 AM - 10:45 AM (45 Minutes)',
      metrics: [
        { label: 'Mutex Lock Latency', value: '2.8ms' },
        { label: 'Calendar Dispatch', value: 'Instant (.ics + Google)' },
        { label: 'Reminder Automation', value: 'Active (24h & 1h prior)' },
      ],
    },
  },
  {
    id: 'lead_capture',
    name: 'In-Chat Autonomous Lead Extraction',
    badge: 'Revenue Pipeline',
    input: 'My email is david.vance@acmecorp.com and phone is (415) 555-0194. Please send details.',
    inputSource: 'WhatsApp Business Channel',
    steps: [
      {
        stage: 'perception',
        title: 'Natural Language Ingestion & Regex Scanning',
        detail: 'Detected raw contact payload within conversation text without requiring rigid forms.',
        latency: '4ms',
        telemetry: 'EXTRACTED: email="david.vance@acmecorp.com", phone="+14155550194"',
      },
      {
        stage: 'memory',
        title: 'Attribution & Workspace Lead Deduplication',
        detail: 'Checked workspace database. Verified unique visitor lead record with zero duplicates.',
        latency: '16ms',
        telemetry: 'ATTRIBUTION_ID: conv_84f92 | DEDUPE_STATUS: new_record',
      },
      {
        stage: 'reasoning',
        title: 'Cognitive Brain Contextual Grounding',
        detail: 'Formulated personalized warm response acknowledging contact details and scheduling next step.',
        latency: '280ms',
        telemetry: 'PROVIDER: auto_free (Gemini 1.5 Flash) | TONE: executive_consultative',
      },
      {
        stage: 'action',
        title: 'CRM Lead Creation & Staff Notification Toast',
        detail: 'Persisted lead to database and pushed real-time audio chime and notification to workspace.',
        latency: '24ms',
        telemetry: 'EVENT: lead_captured | NOTIFICATION_EMITTED: true',
      },
    ],
    finalOutcome: 'Qualified lead synced to CRM with full multi-turn conversation context and source attribution.',
    actionCard: {
      type: 'lead',
      headline: 'Lead Captured & Attributed',
      subline: 'david.vance@acmecorp.com • (415) 555-0194',
      metrics: [
        { label: 'Attribution Source', value: 'WhatsApp Business' },
        { label: 'Capture Method', value: 'Zero-Form In-Chat NLP' },
        { label: 'CRM Sync Status', value: 'Real-time Persisted' },
      ],
    },
  },
  {
    id: 'grounded_rag',
    name: 'Strict 2-Stage RAG & Hallucination Firebreak',
    badge: 'Enterprise Security',
    input: 'What are your exact data security, SOC-2 compliance, and encryption standards?',
    inputSource: 'Embedded Custom JS Widget',
    steps: [
      {
        stage: 'perception',
        title: 'Query Normalization & Synonym Expansion',
        detail: 'Generated 384-dimensional query vector using local Xenova bge-small model.',
        latency: '18ms',
        telemetry: 'VECTOR_DIMS: 384 | SYNONYM_EXPANSIONS: ["soc2", "infosec", "encryption"]',
      },
      {
        stage: 'memory',
        title: 'Hybrid Cosine + BM25 Knowledge Retrieval',
        detail: 'Scored 148 knowledge base chunks. Selected top 3 verified source paragraphs.',
        latency: '22ms',
        telemetry: 'MAX_COSINE_SIMILARITY: 0.884 | CHUNKS_VERIFIED: 3',
      },
      {
        stage: 'reasoning',
        title: 'Strict Hallucination Firebreak Boundary',
        detail: 'Model locked to provided chunk context. Speculation and ungrounded claims strictly rejected.',
        latency: '340ms',
        telemetry: 'FIREBREAK_CHECK: PASSED | UNGROUNDED_TOKENS: 0',
      },
      {
        stage: 'action',
        title: 'Cited Response Delivery with Human Escalation Hook',
        detail: 'Streamed response with document citations and automatic bridge to live staff if needed.',
        latency: '14ms',
        telemetry: 'CITATIONS: ["Security_Whitepaper.pdf#p4"] | ESCALATION_READY: true',
      },
    ],
    finalOutcome: 'Answer delivered with mathematical grounding. Zero hallucinations or fabricated business policies.',
    actionCard: {
      type: 'grounded_rag',
      headline: '100% Grounded Answer Delivered',
      subline: 'Grounded in Security_Whitepaper.pdf with zero hallucination',
      metrics: [
        { label: 'Vector Cosine Match', value: '0.884 (High Fidelity)' },
        { label: 'Hallucination Firebreak', value: 'Zero Ungrounded Claims' },
        { label: 'Human Escalation Bridge', value: 'Standby Ready' },
      ],
    },
  },
];

export function NeuralBrainWorkflow() {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scenario = SCENARIOS[activeScenarioIndex];

  // Auto-advance step sequence
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < scenario.steps.length - 1) {
          return prev + 1;
        }
        return 0;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying, scenario.steps.length]);

  // Handle manual scenario selection
  const selectScenario = (index: number) => {
    setActiveScenarioIndex(index);
    setActiveStepIndex(0);
  };

  // Canvas Neural Nodes & Synaptic Flow Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Neural Topology Nodes
    const layers = [
      { name: 'Perception', xPct: 0.12, nodeCount: 4, color: '#38bdf8' },
      { name: 'Memory', xPct: 0.38, nodeCount: 5, color: '#818cf8' },
      { name: 'Brain Core', xPct: 0.65, nodeCount: 6, color: '#60a5fa' },
      { name: 'Action', xPct: 0.88, nodeCount: 4, color: '#34d399' },
    ];

    interface Node {
      x: number;
      y: number;
      radius: number;
      baseRadius: number;
      color: string;
      layerIndex: number;
      pulsePhase: number;
    }

    const nodes: Node[] = [];
    layers.forEach((layer, lIdx) => {
      const x = width * layer.xPct;
      const spacing = height / (layer.nodeCount + 1);
      for (let i = 0; i < layer.nodeCount; i++) {
        const y = spacing * (i + 1);
        nodes.push({
          x,
          y,
          radius: 4,
          baseRadius: 4,
          color: layer.color,
          layerIndex: lIdx,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    // Synapses between adjacent layers
    interface Synapse {
      from: Node;
      to: Node;
      weight: number;
      signalProgress: number;
      speed: number;
      active: boolean;
    }

    const synapses: Synapse[] = [];
    nodes.forEach((fromNode) => {
      nodes.forEach((toNode) => {
        if (toNode.layerIndex === fromNode.layerIndex + 1) {
          synapses.push({
            from: fromNode,
            to: toNode,
            weight: 0.15 + Math.random() * 0.25,
            signalProgress: Math.random(),
            speed: 0.008 + Math.random() * 0.012,
            active: true,
          });
        }
      });
    });

    // 60FPS Render Loop
    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw background cybernetic glow on active layer
      const activeLayer = layers[activeStepIndex];
      if (activeLayer) {
        const activeX = width * activeLayer.xPct;
        const radial = ctx.createRadialGradient(activeX, height / 2, 20, activeX, height / 2, 160);
        radial.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
        radial.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Synaptic Connection Lines
      synapses.forEach((syn) => {
        const isCurrentStage =
          syn.from.layerIndex === activeStepIndex && syn.to.layerIndex === activeStepIndex + 1;

        ctx.beginPath();
        ctx.moveTo(syn.from.x, syn.from.y);
        ctx.lineTo(syn.to.x, syn.to.y);
        ctx.strokeStyle = isCurrentStage
          ? 'rgba(96, 165, 250, 0.45)'
          : 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = isCurrentStage ? 1.5 : 0.8;
        ctx.stroke();

        // Draw animated energy signal spark along active synapse
        if (isCurrentStage || syn.signalProgress > 0) {
          syn.signalProgress += syn.speed;
          if (syn.signalProgress > 1) syn.signalProgress = 0;

          const sparkX = syn.from.x + (syn.to.x - syn.from.x) * syn.signalProgress;
          const sparkY = syn.from.y + (syn.to.y - syn.from.y) * syn.signalProgress;

          ctx.beginPath();
          ctx.arc(sparkX, sparkY, isCurrentStage ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = isCurrentStage ? '#60a5fa' : 'rgba(147, 197, 253, 0.4)';
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = isCurrentStage ? 8 : 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isNodeActive = node.layerIndex === activeStepIndex;
        const dynamicRadius = isNodeActive
          ? node.baseRadius + Math.sin(time * 4 + node.pulsePhase) * 2.2
          : node.baseRadius;

        // Outer glow halo for active layer nodes
        if (isNodeActive) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, dynamicRadius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = isNodeActive ? '#93c5fd' : node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isNodeActive ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeStepIndex]);

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Header & Telemetry Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Autonomous Neural Workflow
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live 60fps Cognitive Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive visualization of real-time signal processing, grounding firebreaks, and action execution
            </p>
          </div>
        </div>

        {/* Play / Pause & Scenario Selector */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <span className="h-2 w-2 rounded-xs bg-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-emerald-400" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="px-4 sm:px-6 pt-4 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {SCENARIOS.map((sc, idx) => {
          const isActive = idx === activeScenarioIndex;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => selectScenario(idx)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{sc.name}</span>
              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-blue-600/40 text-blue-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sc.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Canvas & Pipeline Grid */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Live Input Simulation Banner */}
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] bg-slate-800 px-2 py-0.5 rounded">
              Input Payload
            </span>
            <span className="italic text-slate-300">&quot;{scenario.input}&quot;</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
            <Activity className="h-3 w-3 text-blue-400" />
            <span>Channel: {scenario.inputSource}</span>
          </div>
        </div>

        {/* 60FPS Neural Brain Canvas Visualizer */}
        <div className="relative w-full h-[240px] sm:h-[280px] rounded-2xl border border-slate-800/80 bg-slate-950/90 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Layer Overlay Labels */}
          <div className="absolute top-3 inset-x-0 px-6 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
            <span className={activeStepIndex === 0 ? 'text-sky-400' : 'text-slate-500'}>
              1. Perception
            </span>
            <span className={activeStepIndex === 1 ? 'text-indigo-400' : 'text-slate-500'}>
              2. Memory (RAG)
            </span>
            <span className={activeStepIndex === 2 ? 'text-blue-400' : 'text-slate-500'}>
              3. Cognitive Core
            </span>
            <span className={activeStepIndex === 3 ? 'text-emerald-400' : 'text-slate-500'}>
              4. Motor Action
            </span>
          </div>
        </div>

        {/* Step Sequence Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenario.steps.map((st, sIdx) => {
            const isStepActive = sIdx === activeStepIndex;
            return (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  setActiveStepIndex(sIdx);
                  setIsPlaying(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isStepActive
                    ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isStepActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Stage {sIdx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{st.latency}</span>
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold leading-tight ${
                      isStepActive ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {st.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {st.detail}
                  </p>
                </div>
                <div className="pt-1 border-t border-slate-800/60 font-mono text-[9px] text-slate-500 truncate">
                  {st.telemetry}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Execution Output & Verification Card */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/20 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Verified Outcome
              </span>
              <h4 className="text-sm font-bold text-white">{scenario.actionCard.headline}</h4>
            </div>
            <p className="text-xs text-slate-400">{scenario.actionCard.subline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {scenario.actionCard.metrics.map((m, mIdx) => (
              <div key={mIdx} className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">{m.label}</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
