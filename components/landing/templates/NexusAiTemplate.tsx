'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  Terminal,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Database,
  Lock,
  Globe,
  Radio,
  Calendar,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Server,
  Play,
  Copy,
  Check,
  Code2,
  GitBranch,
  Key,
  Flame,
  Gauge,
  Sliders,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const NexusAiTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'inference' | 'tools' | 'memory'>('inference');
  const [throughput, setThroughput] = useState(94280);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Live fluctuating telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput((prev) => prev + Math.floor(Math.random() * 240) - 110);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const terminalDemos = {
    inference: {
      title: 'Real-Time Neural Inference',
      command: 'nexus.cluster.stream({ model: "nexus-omni-v3", latency: "sub-15ms" })',
      output: `[00:00:00.014] Connected to us-east cluster node 04
[00:00:00.021] Context cached: 128,400 tokens (99.4% cache hit)
[00:00:00.038] Streaming response delta:
  > Synthesized cross-agent dependency graph in 18ms.
  > Executed 14 parallel tools with zero safety violations.
[STATUS: COMPLETED] Throughput: 142.8k tok/s | Cost: $0.00012`,
    },
    tools: {
      title: 'Autonomous Tool Synthesis & Dispatch',
      command: 'nexus.agent.dispatch({ goal: "Optimize DB queries", env: "sandbox" })',
      output: `[STEP 1] Generating AST parse tree for slow queries...
[STEP 2] Running speculative execution in isolated WASM enclave...
[STEP 3] Index recommendations validated:
  + CREATE INDEX CONCURRENTLY idx_customer_token ON sessions(token);
[STEP 4] Deploying canary migration. Zero downtime confirmed.
[STATUS: VERIFIED] Query latency reduced by 84.6%`,
    },
    memory: {
      title: 'Cognitive Vector Knowledge Graph',
      command: 'nexus.graph.query({ vector: "enterprise_soc2_compliance" })',
      output: `[EMBEDDING] 1536-dimensional dense vector generated in 4.2ms
[SEARCH] Hybrid lexical + HNSW graph traversal:
  - node_881: "SOC-2 Type II Audit Certificate (2026)" (similarity: 0.962)
  - node_419: "AES-256 Key Rotation Policy" (similarity: 0.941)
  - node_102: "HIPAA Business Associate Agreement" (similarity: 0.915)
[GRAPH TRAVERSAL COMPLETE] 3 verified root citations linked.`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalDemos[activeTab].command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 1400);
  };

  const partners = [
    'NVIDIA TENSORRT',
    'ANTHROPIC FOUNDRY',
    'SUPABASE HYBRID',
    'VERCEL EDGE',
    'CLOUDFLARE WORKERS',
    'DATADOG APM',
    'STRIPE ATOM',
    'SCALE AI PIPELINE',
  ];

  const modelSpecs = [
    {
      name: 'Nexus Omni-v3',
      type: 'Multimodal Foundation',
      context: '1,000,000 Tokens',
      ttft: '12ms',
      price: '$0.80 / 1M tokens',
      recommended: true,
    },
    {
      name: 'Nexus Reasoning Alpha',
      type: 'Deep Sequential Math & Code',
      context: '256,000 Tokens',
      ttft: '24ms',
      price: '$1.40 / 1M tokens',
      recommended: false,
    },
    {
      name: 'Nexus Flash-Edge',
      type: 'Ultra-low Latency Dispatch',
      context: '64,000 Tokens',
      ttft: '6ms',
      price: '$0.15 / 1M tokens',
      recommended: false,
    },
  ];

  const faqs = [
    {
      q: 'How does Nexus achieve sub-15ms latency on cold queries?',
      a: 'We implement speculative decoding across decentralized NVLink edge clusters combined with prompt key-value cache persistence at 320+ worldwide edge PoPs.',
    },
    {
      q: 'Is customer data ever utilized to retrain base models?',
      a: 'Never. Our enterprise architecture enforces Zero Data Retention (ZDR) and customer-isolated cryptographic enclaves. All inference transactions are signed and scrubbed at the edge.',
    },
    {
      q: 'How does human takeover work during live chat escalation?',
      a: 'When an AI agent detects high sentiment urgency or complex escalation triggers, our WebSocket state synchronizer hands complete session control to your human operators with zero conversation restart.',
    },
    {
      q: 'Can we deploy Nexus in our own private AWS or GCP VPC?',
      a: 'Yes. Enterprise tiers include single-tenant VPC helm charts with complete air-gapped support, dedicated HSM key management, and custom domain routing.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#06080F] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS BAR */}
      <ScrollProgress color="bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500" />

      {/* 1. TOP ANNOUNCEMENT & TRUST RIBBON */}
      <div className={`border-b ${isDark ? 'border-slate-800/80 bg-slate-950/70 text-slate-300' : 'border-slate-200 bg-white text-slate-700'} py-2 px-4 text-xs font-mono`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">GLOBAL CLUSTER STATUS: OPTIMAL</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-500">P99 Latency: 14.2ms</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-500">SLA: 99.999% Verified</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>SOC-2 Type II Certified</span>
            <span>HIPAA Compliant Enclaves</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION: COMMAND-CENTER ARCHITECTURE */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border mb-8 ${
          isDark 
            ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-lg shadow-cyan-950/30' 
            : 'border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm'
        }`}>
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>{config.badgeText || 'Nexus v3.2 Engine Live · Sub-15ms Multimodal Inference'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto">
          {config.heroHeadline || (
            <>
              Autonomous Intelligence <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                Engineered for Enterprise Scale
              </span>
            </>
          )}
        </h1>

        {/* Subhead */}
        <p className={`mt-6 text-base sm:text-xl ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-3xl mx-auto font-normal leading-relaxed`}>
          {config.heroSubheadline ||
            'Deploy self-orchestrating AI agents with native tool synthesis, hybrid vector cognition, and real-time human supervisor takeover.'}
        </p>

        {/* Dual Primary Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onOpenBooking()}
            className="px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-100" />
            <span>Schedule Architecture Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenChat}
            className={`px-7 py-4 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 shadow-md'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Ask Live AI Agent</span>
          </button>
        </div>

        {/* 3. 3D INTERACTIVE TILT TELEMETRY CARD */}
        <div className="mt-16 max-w-5xl mx-auto">
          <TiltCard
            maxTilt={6}
            glareColor={isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.08)'}
            className={`rounded-2xl border p-6 sm:p-8 text-left transition-all ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 shadow-xl shadow-cyan-950/20'
                : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/60'
            }`}
          >
            {/* Telemetry Header */}
            <div className={`flex flex-wrap items-center justify-between gap-4 pb-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                  Cluster Status: Operational (99.999% SLA)
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500">Live Throughput: </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{throughput.toLocaleString()} tok/s</span>
                </div>
                <div>
                  <span className="text-slate-500">Avg Latency: </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">14.2ms</span>
                </div>
              </div>
            </div>

            {/* Visual Waveform / Matrix Display */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Cognitive Engine</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">Sub-15ms TTFT</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  Accelerated by speculative drafting and KV kernel caching.
                </p>
              </div>

              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Zero-Trust Isolation</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">WASM Enclaves</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  Customer environments executed in cryptographic sandboxes.
                </p>
              </div>

              <div className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400 mb-2">
                  <Radio className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Live Takeover</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">Instant Sync</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  Real-time human operator handover with zero chat disruption.
                </p>
              </div>
            </div>

            {/* Quick Specs in Card */}
            <div className={`pt-4 flex items-center justify-between text-xs border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              <span className="font-mono">Encrypted with AES-256 GCM</span>
              <button
                onClick={() => onOpenBooking()}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Architecture Specs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 4. KINETIC LOGO MARQUEE */}
      <section className={`py-6 border-y ${isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200 bg-slate-100/60'}`}>
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Powering Autonomous Workflows Across Global Infrastructure
          </span>
        </div>
        <KineticMarquee speed={24} pauseOnHover={true}>
          {partners.map((partner, idx) => (
            <div
              key={idx}
              className={`px-5 py-2 rounded-lg border text-xs font-mono font-bold tracking-wider whitespace-nowrap transition-colors ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-cyan-700 hover:border-cyan-300 shadow-2xs'
              }`}
            >
              {partner}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 5. CORE ARCHITECTURAL CAPABILITIES */}
      <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-3 ${
            isDark ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}>
            <Layers className="w-3.5 h-3.5" />
            <span>Architectural Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Engineered For Frictionless Autonomy
          </h2>
          <p className={`mt-3 text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Every layer of the stack is purpose-built to eliminate hallucination, lower inference costs, and guarantee sub-second execution.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: 'Cognitive Memory Fabric',
              description: 'Hybrid dense vector embeddings and lexical indexing with automated source attribution and dynamic temporal decay.',
              badge: 'Persistent Knowledge',
            },
            {
              icon: Server,
              title: 'Decentralized Edge Nodes',
              description: 'Global point-of-presence routing ensuring requests land on the nearest bare-metal GPU node within 15 milliseconds.',
              badge: '320+ Global Pops',
            },
            {
              icon: Shield,
              title: 'Multi-Tenant Security Shields',
              description: 'Strict logical data segregation, private tenant VPC peering, and complete isolation from public LLM retraining runs.',
              badge: 'SOC-2 / HIPAA',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <TiltCard
                key={idx}
                className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-400' : 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      isDark ? 'bg-slate-800 text-cyan-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                    {feature.description}
                  </p>
                </div>
                <div className={`pt-5 mt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button
                    onClick={() => onOpenBooking()}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    <span>Read Whitepaper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* 6. INTERACTIVE LIVE NEURAL TERMINAL */}
      <section id="terminal" className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">Interactive Sandbox</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 dark:text-white">Test Drive the Execution Engine</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Inspect live code execution, tool call synthesis, and semantic knowledge retrieval.
            </p>
          </div>

          {/* Terminal Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19] text-slate-200 shadow-xl overflow-hidden">
            {/* Terminal Header */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-xs text-slate-400 font-bold">nexus-runtime@v3.2</span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'inference', label: 'Inference Stream' },
                    { id: 'tools', label: 'Tool Synthesis' },
                    { id: 'memory', label: 'Knowledge Graph' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>{simulating ? 'Executing...' : 'Run Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-xs leading-relaxed space-y-4">
              <div className="text-slate-400">
                <span className="text-cyan-400 font-bold">$ </span>
                <span>{terminalDemos[activeTab].command}</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                {simulating ? 'Streaming token packets from nearest cluster node...\\nComputing vector trajectory...\\nValidation passed.' : terminalDemos[activeTab].output}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ENTERPRISE MODEL MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Model Directory</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Foundation Model Architecture</h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Select from frontier latency-tuned foundational models optimized for enterprise automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelSpecs.map((spec, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                spec.recommended
                  ? isDark
                    ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-white border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              {spec.recommended && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 mb-3">
                  Default Cluster
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{spec.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{spec.type}</p>

              <div className={`mt-5 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} space-y-2 text-xs`}>
                <div className="flex justify-between">
                  <span className="text-slate-500">Context Window:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{spec.context}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time-To-First-Token:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{spec.ttft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cost Efficiency:</span>
                  <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{spec.price}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    spec.recommended
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Deploy Model Sandbox
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. 4-STAGE AUTONOMOUS LIFECYCLE */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">Lifecycle Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">How Nexus Executes In Production</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              From multi-source ingestion to live human supervisor fallback in 4 automated stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Data Ingestion & Index',
                desc: 'Upload PDFs, API endpoints, or database tables. Dense embeddings and HNSW graph nodes generate automatically.',
              },
              {
                step: '02',
                title: 'WASM Enclave Validation',
                desc: 'Agents test candidate actions in isolated sandbox enclaves to prevent destructive mutations before live execution.',
              },
              {
                step: '03',
                title: 'Canary Execution',
                desc: 'Transactions dispatch with real-time guardrails and automated circuit-breaking on unexpected latency spikes.',
              },
              {
                step: '04',
                title: 'Supervisor Escalation',
                desc: 'Seamless zero-latency handover to your CRM support team whenever customer sentiment requires human empathy.',
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="text-2xl font-mono font-black text-cyan-600 dark:text-cyan-400 mb-3">{st.step}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{st.title}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHY NEXUS VS TRADITIONAL LLM STACKS (COMPARISON TABLE) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">Direct Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Why Modern Teams Choose Nexus</h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Compare our bare-metal agentic orchestrator against legacy API wrappers and raw LLM endpoints.
          </p>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-slate-800 bg-slate-900/90 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Capability Dimension</th>
                  <th className="p-4 sm:p-5 font-bold text-cyan-600 dark:text-cyan-400">Nexus Autonomous Engine</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Generic API Wrappers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  {
                    feature: 'Cold-Start Latency (TTFT)',
                    nexus: 'Sub-15ms via Speculative Edge Caching',
                    legacy: '800ms - 2,400ms variable',
                  },
                  {
                    feature: 'Live Human Takeover',
                    nexus: 'Real-time WebSocket zero-interrupt state',
                    legacy: 'Broken session / manual ticket created',
                  },
                  {
                    feature: 'Knowledge Grounding (RAG)',
                    nexus: 'Hybrid Lexical + Dense HNSW Graph',
                    legacy: 'Naive similarity top-k chunking',
                  },
                  {
                    feature: 'Safety & Isolation Enclaves',
                    nexus: 'Cryptographic WASM Sandboxes',
                    legacy: 'Direct execution in shared process',
                  },
                  {
                    feature: 'Enterprise Compliance',
                    nexus: 'SOC-2 Type II, HIPAA, Zero Retention',
                    legacy: 'Standard public cloud data policies',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.nexus}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{row.legacy}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 10. SERVICES & ARCHITECTURE CONSULTATION (FROM CONFIG) */}
      <section id="pricing" className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-3 ${
              isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
            }`}>
              <Zap className="w-3.5 h-3.5" />
              <span>Deployment Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Enterprise Onboarding & Reviews</h2>
            <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Book a dedicated consultation session with our principal AI solutions architects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.services || []).map((service) => (
              <TiltCard
                key={service.id}
                className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                  service.popular
                    ? isDark
                      ? 'bg-slate-900 border-cyan-500/50 shadow-xl ring-1 ring-cyan-500/30'
                      : 'bg-white border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div>
                  {service.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 mb-3">
                      Recommended Architecture
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {service.price === 0 ? 'Free' : `$${service.price}`}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-3 leading-relaxed`}>
                    {service.description}
                  </p>

                  <div className={`space-y-2 pt-5 mt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} text-xs text-slate-600 dark:text-slate-400`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Dedicated Principal Solutions Architect</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>Interactive Latency & Throughput Benchmark</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      service.popular
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Architecture Slot</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">Frequently Addressed</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Technical Architecture FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. FINAL HIGH-CONVERTING FOOTER CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to Accelerate Your AI Workflows?
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl mx-auto`}>
            Deploy your dedicated cluster in under 5 minutes with zero infrastructure maintenance.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Start Free Trial
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
              <span>Chat With Engineer</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
