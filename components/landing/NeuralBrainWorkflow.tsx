'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Database,
  Calendar,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Activity,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
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
    transformation: {
      inputForm: string;
      outputForm: string;
    };
  }>;
  finalOutcome: string;
  actionCard: {
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
        title: 'Sensory Parsing & Normalization',
        detail: 'Ingests unstructured visitor query and parses scheduling intent for slot 2026-09-22 10:00:00 UTC.',
        latency: '8ms',
        telemetry: 'INTENT_DETECTED: schedule_appointment | CONFIDENCE: 99.4%',
        transformation: {
          inputForm: 'Raw Natural Language Stream',
          outputForm: 'Serialized Query Token [tok_booking_req]',
        },
      },
      {
        stage: 'memory',
        title: 'RAG Knowledge Vault & Slot Verification',
        detail: 'RAG chamber verifies provider schedule schemas and checks real-time slot availability in Upstash L2 cache.',
        latency: '12ms',
        telemetry: 'SLOT_STATUS: verified_free | CONCURRENCY_KEY: lock_slot_10am',
        transformation: {
          inputForm: 'Query Token [tok_booking_req]',
          outputForm: 'Grounded Context Capsule [Slot verified + Service rules]',
        },
      },
      {
        stage: 'reasoning',
        title: 'Cognitive Deliberation & Firebreak Check',
        detail: 'Validates operating hours, buffers, and service durations. Passes strict zero-hallucination firebreak.',
        latency: '260ms',
        telemetry: 'REASONING_PIPELINE: high_speed_deliberation | HALLUCINATION_RISK: 0.00%',
        transformation: {
          inputForm: 'Grounded Context Capsule',
          outputForm: 'Structured Decision Vector [Action: BookSlot_10AM]',
        },
      },
      {
        stage: 'action',
        title: 'Concurrency Mutex Clamp & Dispatch',
        detail: 'Atomic mutex lock locks slot in 2.8ms, preventing double-bookings. Dispatches calendar invites.',
        latency: '34ms',
        telemetry: 'MUTEX_LOCK: atomic_redis | DOUBLE_BOOKINGS: 0',
        transformation: {
          inputForm: 'Decision Vector [Action: BookSlot_10AM]',
          outputForm: 'Confirmed Calendar Event (.ics + Google Sync)',
        },
      },
    ],
    finalOutcome: 'Appointment locked with 100% double-booking immunity. Calendar sync and reminders active.',
    actionCard: {
      headline: 'Executive Appointment Confirmed',
      subline: 'Tomorrow at 10:00 AM - 10:45 AM (45 Minutes)',
      metrics: [
        { label: 'Mutex Lock Latency', value: '2.8ms' },
        { label: 'Calendar Dispatch', value: 'Instant (.ics + Google)' },
        { label: 'Double-Booking Risk', value: '0.00% (Guaranteed)' },
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
        title: 'Natural Language Ingestion & Entity Detection',
        detail: 'Detects raw contact payload inside conversational prose without requiring rigid input forms.',
        latency: '4ms',
        telemetry: 'EXTRACTED: email="david.vance@acmecorp.com", phone="+14155550194"',
        transformation: {
          inputForm: 'Unstructured Conversational Text',
          outputForm: 'Structured Contact Tuple [email, phone, company]',
        },
      },
      {
        stage: 'memory',
        title: 'RAG Lead Attribution & Deduplication',
        detail: 'Scans workspace records to verify visitor attribution ID and ensure no duplicate CRM records exist.',
        latency: '16ms',
        telemetry: 'ATTRIBUTION_ID: conv_84f92 | DEDUPE_STATUS: new_record',
        transformation: {
          inputForm: 'Contact Tuple',
          outputForm: 'Attributed Profile Capsule [Lead + Multi-turn Context]',
        },
      },
      {
        stage: 'reasoning',
        title: 'Cognitive Synthesis & Warm Engagement',
        detail: 'Synthesizes personalized consultation acknowledgment and schedules immediate staff dispatch.',
        latency: '240ms',
        telemetry: 'COGNITIVE_PIPELINE: high_speed_deliberation | CONVERSATION_TONE: consultative',
        transformation: {
          inputForm: 'Attributed Profile Capsule',
          outputForm: 'CRM Ingestion Vector & Response Plan',
        },
      },
      {
        stage: 'action',
        title: 'CRM Lead Persistence & Staff Notification',
        detail: 'Writes qualified lead to workspace database, emits real-time notification toast and audio alert.',
        latency: '22ms',
        telemetry: 'EVENT: lead_persisted | AUDIO_CHIME: emitted',
        transformation: {
          inputForm: 'CRM Ingestion Vector',
          outputForm: 'Verified CRM Lead Profile & Notification Alert',
        },
      },
    ],
    finalOutcome: 'Qualified lead synced to CRM with full multi-turn conversation context and attribution.',
    actionCard: {
      headline: 'Lead Captured & Attributed',
      subline: 'david.vance@acmecorp.com • (415) 555-0194',
      metrics: [
        { label: 'Attribution Source', value: 'WhatsApp Business' },
        { label: 'Capture Method', value: 'Zero-Form In-Chat NLP' },
        { label: 'CRM Sync Status', value: 'Real-Time Persisted' },
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
        title: 'Query Normalization & Vector Encoding',
        detail: 'Normalizes search terms and computes 384-dimensional query vector using local embedding pipeline.',
        latency: '16ms',
        telemetry: 'VECTOR_DIMS: 384 | SYNONYM_EXPANSIONS: ["soc2", "infosec", "encryption"]',
        transformation: {
          inputForm: 'Raw Search String',
          outputForm: '384-Dim Query Embedding Vector',
        },
      },
      {
        stage: 'memory',
        title: 'RAG Knowledge Vault & Cosine Ranking',
        detail: 'RAG engine scans indexed documents, calculates cosine similarity, and isolates top 3 verified chunks.',
        latency: '24ms',
        telemetry: 'RETRIEVAL_ALGORITHM: hybrid_cosine_bm25 | MAX_SIMILARITY: 0.884',
        transformation: {
          inputForm: 'Query Embedding Vector',
          outputForm: 'Grounded Context Capsule [Fused 3x Source Paragraphs]',
        },
      },
      {
        stage: 'reasoning',
        title: 'Cognitive Deliberation & Firebreak Boundary',
        detail: 'Locks answer synthesis strictly to retrieved context. Speculative and ungrounded statements are rejected.',
        latency: '280ms',
        telemetry: 'FIREBREAK_STATUS: locked_grounded | UNGROUNDED_CLAIMS: 0',
        transformation: {
          inputForm: 'Grounded Context Capsule',
          outputForm: 'Verified Factual Reasoning Tensor',
        },
      },
      {
        stage: 'action',
        title: 'Cited Response Delivery & Escalation Hook',
        detail: 'Streams mathematically grounded response with footnote citations and ready-to-bridge human escalation.',
        latency: '14ms',
        telemetry: 'CITATIONS: ["Security_Whitepaper.pdf#p4"] | ESCALATION_READY: true',
        transformation: {
          inputForm: 'Factual Reasoning Tensor',
          outputForm: 'Mathematical 100% Grounded Answer with Citations',
        },
      },
    ],
    finalOutcome: 'Grounded answer delivered with zero hallucination risk and verified document citations.',
    actionCard: {
      headline: '100% Grounded Answer Delivered',
      subline: 'Grounded in Security_Whitepaper.pdf with zero hallucination',
      metrics: [
        { label: 'Vector Cosine Match', value: '0.884 (High Fidelity)' },
        { label: 'Hallucination Firebreak', value: 'Zero Ungrounded Claims' },
        { label: 'Document Citations', value: 'Exact Page Citations' },
      ],
    },
  },
];

interface NeuralBrainWorkflowProps {
  theme?: 'light' | 'dark';
}

export function NeuralBrainWorkflow({ theme = 'dark' }: NeuralBrainWorkflowProps) {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scenario = SCENARIOS[activeScenarioIndex];
  const isLight = theme === 'light';

  // 60FPS Continuous Pipeline Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 340);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 340;
    };
    window.addEventListener('resize', handleResize);

    // Continuous Data Packets in Flight (never pausing, spaced evenly)
    const packetCount = 5;
    const packets = Array.from({ length: packetCount }, (_, i) => ({
      id: i,
      progress: i / packetCount,
      speed: 0.0022, // Smooth continuous speed
    }));

    // Floating knowledge chunks around Stage 2 (RAG)
    const ragChunks = [
      { angle: 0, radius: 36, speed: 0.015, label: 'PDF' },
      { angle: (Math.PI * 2) / 3, radius: 42, speed: 0.012, label: 'DB' },
      { angle: (Math.PI * 4) / 3, radius: 38, speed: 0.018, label: 'DOCS' },
    ];

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Define 4 Stage Chambers along horizontal axis
      const stages = [
        {
          index: 0,
          name: 'Sensory Ingestion',
          sub: 'Raw Payload -> Token Packet',
          x: width * 0.12,
          y: height * 0.5,
          color: isLight ? '#0284c7' : '#38bdf8',
          accent: '#0ea5e9',
        },
        {
          index: 1,
          name: 'RAG Knowledge Vault',
          sub: 'Query -> Enriched Grounded Capsule',
          x: width * 0.38,
          y: height * 0.5,
          color: isLight ? '#6366f1' : '#818cf8',
          accent: '#4f46e5',
        },
        {
          index: 2,
          name: 'Cognitive Brain Core',
          sub: 'Capsule -> Action Decision Vector',
          x: width * 0.65,
          y: height * 0.5,
          color: isLight ? '#2563eb' : '#60a5fa',
          accent: '#3b82f6',
        },
        {
          index: 3,
          name: 'Deterministic Motor Action',
          sub: 'Mutex Lock -> Dispatched Output',
          x: width * 0.88,
          y: height * 0.5,
          color: isLight ? '#059669' : '#34d399',
          accent: '#10b981',
        },
      ];

      // Draw Highway Pipeline Tracks connecting the stages
      ctx.beginPath();
      ctx.moveTo(stages[0].x, stages[0].y);
      for (let i = 1; i < stages.length; i++) {
        ctx.lineTo(stages[i].x, stages[i].y);
      }
      ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(51, 65, 85, 0.45)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner flowing glow line
      ctx.beginPath();
      ctx.moveTo(stages[0].x, stages[0].y);
      for (let i = 1; i < stages.length; i++) {
        ctx.lineTo(stages[i].x, stages[i].y);
      }
      ctx.strokeStyle = isLight ? 'rgba(59, 130, 246, 0.25)' : 'rgba(96, 165, 250, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Specialized Machinery at Each Stage
      stages.forEach((st) => {
        // Stage Ambient Glow
        const radGlow = ctx.createRadialGradient(st.x, st.y, 10, st.x, st.y, 70);
        radGlow.addColorStop(0, isLight ? `${st.color}22` : `${st.color}26`);
        radGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(st.x, st.y, 70, 0, Math.PI * 2);
        ctx.fill();

        // Stage 1: Ingestion Aperture (Concentric Pulsing Sensor Rings)
        if (st.index === 0) {
          ctx.beginPath();
          ctx.arc(st.x, st.y, 32 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(st.x, st.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#f0f9ff' : '#082f49';
          ctx.strokeStyle = st.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Inbound stream arrows
          ctx.fillStyle = st.color;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('IN', st.x, st.y);
        }

        // Stage 2: RAG Vector Knowledge Vault (Cylindrical Vector Chamber & Orbiting Chunks)
        if (st.index === 1) {
          // Rotating outer similarity ring
          ctx.beginPath();
          ctx.ellipse(st.x, st.y, 44, 24, time * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.45)' : 'rgba(129, 140, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core Vector Cylinder Chamber
          ctx.beginPath();
          ctx.arc(st.x, st.y, 24, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#eef2ff' : '#1e1b4b';
          ctx.strokeStyle = st.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = st.color;
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('RAG', st.x, st.y);

          // Orbiting Knowledge Documents (PDF, DB, DOCS) feeding into RAG
          ragChunks.forEach((chunk) => {
            chunk.angle += chunk.speed;
            const cx = st.x + Math.cos(chunk.angle) * chunk.radius;
            const cy = st.y + Math.sin(chunk.angle) * (chunk.radius * 0.55);

            ctx.beginPath();
            ctx.arc(cx, cy, 7, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#ffffff' : '#312e81';
            ctx.strokeStyle = isLight ? '#6366f1' : '#a5b4fc';
            ctx.lineWidth = 1.2;
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? '#4338ca' : '#e0e7ff';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(chunk.label, cx, cy);
          });
        }

        // Stage 3: Cognitive Brain Core & Strict Firebreak Barrier
        if (st.index === 2) {
          // Firebreak Security Perimeter Laser
          ctx.beginPath();
          ctx.moveTo(st.x - 36, st.y - 48);
          ctx.lineTo(st.x - 36, st.y + 48);
          ctx.strokeStyle = isLight ? 'rgba(16, 185, 129, 0.8)' : 'rgba(52, 211, 153, 0.9)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Firebreak Shield Tag
          ctx.fillStyle = isLight ? '#065f46' : '#34d399';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('FIREBREAK', st.x - 36, st.y - 54);

          // Pulsing Multi-Core Neural Sphere
          const pulseR = 25 + Math.sin(time * 3) * 2;
          ctx.beginPath();
          ctx.arc(st.x, st.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#eff6ff' : '#172554';
          ctx.strokeStyle = st.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Inner Synaptic Sparks
          ctx.beginPath();
          ctx.arc(st.x - 6, st.y - 5, 3, 0, Math.PI * 2);
          ctx.arc(st.x + 7, st.y - 4, 3, 0, Math.PI * 2);
          ctx.arc(st.x, st.y + 7, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = st.color;
          ctx.fill();

          ctx.fillStyle = st.color;
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CORE', st.x, st.y - 1);
        }

        // Stage 4: Deterministic Motor Action (Mutex Clamping Brackets & Dispatch)
        if (st.index === 3) {
          // Mutex Clamp Brackets
          const clampOffset = 2 + Math.abs(Math.sin(time * 1.5) * 3);

          // Left Clamp
          ctx.beginPath();
          ctx.rect(st.x - 28 - clampOffset, st.y - 18, 6, 36);
          ctx.fillStyle = isLight ? '#059669' : '#34d399';
          ctx.fill();

          // Right Clamp
          ctx.beginPath();
          ctx.rect(st.x + 22 + clampOffset, st.y - 18, 6, 36);
          ctx.fillStyle = isLight ? '#059669' : '#34d399';
          ctx.fill();

          // Mutex Status Banner
          ctx.fillStyle = isLight ? '#065f46' : '#34d399';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('MUTEX: LOCKED', st.x, st.y - 32);

          // Action Chamber
          ctx.beginPath();
          ctx.arc(st.x, st.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#ecfdf5' : '#064e3b';
          ctx.strokeStyle = st.color;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = st.color;
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SYNC', st.x, st.y);
        }

        // Stage Labels Below Chambers
        ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(st.name, st.x, st.y + 36);

        ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.fillText(st.sub, st.x, st.y + 51);
      });

      // CONTINUOUS DATA PACKETS METAMORPHOSIS & FLOW (NO PAUSES)
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1.0) pkt.progress = 0;

        // Current position along the stages
        const totalSpan = stages[3].x - stages[0].x;
        const currentX = stages[0].x + pkt.progress * totalSpan;
        const currentY = height * 0.5;

        // FORM METAMORPHOSIS AT EACH PHASE:
        // Phase 1: 0.00 to 0.25 -> Sensory Ingestion to RAG
        // Phase 2: 0.25 to 0.50 -> Inside RAG Vault: query absorbs knowledge chunks -> emerges as Grounded Context Capsule
        // Phase 3: 0.50 to 0.75 -> Inside Cognitive Core: passes Firebreak -> emerges as Decision Vector
        // Phase 4: 0.75 to 1.00 -> Inside Motor Action: Mutex Lock clamp -> emerges as Dispatched Result

        if (pkt.progress < 0.25) {
          // FORM 1: Raw Stream -> Tokenized Query Packet (Cyan Crystal Box)
          const localT = pkt.progress / 0.25;
          ctx.save();
          ctx.translate(currentX, currentY);

          // Wave oscillations when near stage 1, consolidating into a token box
          if (localT < 0.4) {
            // Raw text wave signal
            ctx.beginPath();
            ctx.arc(0, Math.sin(time * 8 + pkt.id) * 6, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
            ctx.fill();
          } else {
            // Tokenized Query Box
            ctx.fillStyle = isLight ? '#0284c7' : '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillRect(-7, -7, 14, 14);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TOK', 0, 0);
          }
          ctx.restore();
        } else if (pkt.progress < 0.5) {
          // FORM 2: Inside RAG -> Token enters, absorbs knowledge chunks, exits as Enriched Grounded Capsule
          const localT = (pkt.progress - 0.25) / 0.25;
          ctx.save();
          ctx.translate(currentX, currentY);

          // RAG Capsule (Indigo/Purple pill with verified badge)
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 12;

          // Pill body
          ctx.fillStyle = isLight ? '#6366f1' : '#818cf8';
          ctx.beginPath();
          ctx.roundRect(-16, -9, 32, 18, 9);
          ctx.fill();

          // Knowledge chunk indicator embedded in capsule
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(localT < 0.5 ? 'RAG+' : 'DOC#4', 0, 0);

          ctx.restore();
        } else if (pkt.progress < 0.75) {
          // FORM 3: Inside Cognitive Core -> Capsule passes Firebreak gate, transforms into Decision Vector
          const localT = (pkt.progress - 0.5) / 0.25;
          ctx.save();
          ctx.translate(currentX, currentY);

          // Rotating Decision Diamond Vector (Electric Blue / Amber)
          ctx.rotate(time * 2);
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 14;

          ctx.beginPath();
          ctx.moveTo(0, -11);
          ctx.lineTo(11, 0);
          ctx.lineTo(0, 11);
          ctx.lineTo(-11, 0);
          ctx.closePath();

          ctx.fillStyle = isLight ? '#2563eb' : '#60a5fa';
          ctx.fill();

          // Inner core pip
          ctx.beginPath();
          ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
        } else {
          // FORM 4: Inside Motor Action -> Clamps with Mutex, transforms into Confirmed Executed Output
          ctx.save();
          ctx.translate(currentX, currentY);

          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 16;

          // Executed Result Badge (Hexagon Shield)
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? '#059669' : '#34d399';
          ctx.fill();

          // Checkmark inside result
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-4, 0);
          ctx.lineTo(-1, 3);
          ctx.lineTo(5, -3);
          ctx.stroke();

          ctx.restore();
        }
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
    <div
      className={`w-full rounded-3xl border transition-colors duration-300 shadow-2xl overflow-hidden backdrop-blur-xl ${
        isLight
          ? 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-200/60'
          : 'border-slate-800 bg-slate-900/90 text-slate-100'
      }`}
    >
      {/* Top Header & Continuous Pipeline Status Bar */}
      <div
        className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                : 'bg-blue-600/20 border-blue-500/30 text-blue-400'
            }`}
          >
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">
                Continuous Cognitive Processing Pipeline
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 60fps Metamorphosis Loop
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Continuous signal ingestion, RAG vector memory augmentation, cognitive grounding firebreak, and deterministic motor action
            </p>
          </div>
        </div>

        {/* Pipeline Telemetry Pill */}
        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-600 shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span>PIPELINE: NON-STOP STREAM</span>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div
        className={`px-4 sm:px-6 pt-3 border-b flex items-center gap-2 overflow-x-auto no-scrollbar ${
          isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-800/80 bg-slate-950/20'
        }`}
      >
        {SCENARIOS.map((sc, idx) => {
          const isActive = idx === activeScenarioIndex;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setActiveScenarioIndex(idx);
                setSelectedStageIndex(null);
              }}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                isActive
                  ? isLight
                    ? 'border-blue-600 bg-white text-blue-700 shadow-sm'
                    : 'border-blue-500 bg-blue-950/40 text-blue-300'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{sc.name}</span>
              <span
                className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? isLight
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-blue-600/40 text-blue-200'
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

      {/* Visual Canvas & Pipeline Grid */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Live Input Payload Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            isLight ? 'border-slate-200 bg-slate-50/80 text-slate-700' : 'border-slate-800 bg-slate-950/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Payload Ingestion
            </span>
            <span className="italic font-medium">&quot;{scenario.input}&quot;</span>
          </div>
          <div
            className={`text-[11px] font-mono flex items-center gap-1.5 shrink-0 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Activity className="h-3 w-3 text-blue-500" />
            <span>Channel: {scenario.inputSource}</span>
          </div>
        </div>

        {/* 60FPS Continuous Flow Canvas Visualizer */}
        <div
          className={`relative w-full h-[260px] sm:h-[300px] rounded-2xl border overflow-hidden ${
            isLight
              ? 'border-slate-200 bg-slate-50/60 shadow-inner'
              : 'border-slate-800/80 bg-slate-950/90'
          }`}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Top Live Metamorphosis Legend */}
          <div className="absolute top-3 inset-x-0 px-4 sm:px-6 flex justify-between text-[10px] font-bold uppercase tracking-wider pointer-events-none">
            <span className={isLight ? 'text-sky-700' : 'text-sky-400'}>1. Raw Signal</span>
            <span className={isLight ? 'text-indigo-700' : 'text-indigo-400'}>2. RAG Vault (Docs)</span>
            <span className={isLight ? 'text-blue-700' : 'text-blue-400'}>3. Brain Core (Firebreak)</span>
            <span className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>4. Mutex Locked Action</span>
          </div>
        </div>

        {/* Continuous Step Cards with Form Metamorphosis Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {scenario.steps.map((st, sIdx) => {
            const isSelected = selectedStageIndex === sIdx;
            return (
              <div
                key={sIdx}
                onClick={() => setSelectedStageIndex(isSelected ? null : sIdx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? isLight
                      ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
                      : 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10'
                    : isLight
                    ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Stage {sIdx + 1}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {st.latency}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold leading-snug">{st.title}</h4>
                  <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {st.detail}
                  </p>
                </div>

                {/* Form Transformation Badge */}
                <div
                  className={`p-2 rounded-xl text-[10px] font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[9px] uppercase text-slate-400 tracking-wider">Form Transformation:</div>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold">
                    <span className="truncate">{st.transformation.inputForm}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                    <span className="truncate text-blue-600 dark:text-blue-400 font-bold">
                      {st.transformation.outputForm}
                    </span>
                  </div>
                </div>

                {/* Sanitized Telemetry Bar (Vendor-Neutral) */}
                <div
                  className={`pt-2 border-t font-mono text-[9px] truncate ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-500'
                  }`}
                >
                  {st.telemetry}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Execution Output & Verification Card */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isLight
              ? 'border-slate-200 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white shadow-sm'
              : 'border-slate-800 bg-gradient-to-r from-blue-950/20 via-slate-900 to-slate-950'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
                }`}
              >
                Verified Pipeline Result
              </span>
              <h4 className="text-sm font-bold">{scenario.actionCard.headline}</h4>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {scenario.actionCard.subline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {scenario.actionCard.metrics.map((m, mIdx) => (
              <div
                key={mIdx}
                className={`px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-950/80 border-slate-800'
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
