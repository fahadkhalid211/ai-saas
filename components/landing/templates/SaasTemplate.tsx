'use client';

import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Zap,
  Shield,
  Layers,
  Cpu,
  Check,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Calendar,
  Lock,
  Globe,
  Database as DbIcon,
  Server,
  Activity,
  CheckCircle2,
  Copy,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  XCircle,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const SaasTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'ts' | 'python'>('ts');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [monthlyNodes, setMonthlyNodes] = useState<number>(25);

  const integrationPartners = [
    'AMAZON WEB SERVICES (AWS)',
    'GOOGLE CLOUD PLATFORM',
    'SNOWFLAKE DATA CLOUD',
    'DATADOG APM INTEGRATION',
    'HASHICORP TERRAFORM',
    'KUBERNETES CNCF CERTIFIED',
    'SALESFORCE ENTERPRISE CRM',
  ];

  const codeSnippets = {
    curl: `curl -X POST https://api.kortex.ai/v1/chat \\
  -H "Authorization: Bearer sk_live_99214..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "assistantId": "ast_enterprise_support",
    "message": "Does your platform support custom SAML SSO?",
    "stream": true
  }'`,
    ts: `import { KortexAI } from '@kortex/sdk';

const kortex = new KortexAI({ apiKey: process.env.KORTEX_API_KEY });

// Stream real-time RAG response with zero latency
const stream = await kortex.chat.stream({
  assistantId: 'ast_enterprise_support',
  messages: [{ role: 'user', content: 'What is your SOC-2 SLA?' }],
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta);
}`,
    python: `from kortex import KortexClient

client = KortexClient(api_key="sk_live_99214...")

# Execute hybrid semantic search & RAG generation
response = client.chat.create(
    assistant_id="ast_enterprise_support",
    messages=[{"role": "user", "content": "Book product demo for 50 seats"}],
    action_hooks=["calendar_booking", "crm_sync"]
)
print(response.reply)`,
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const capabilities = [
    {
      title: 'Real-Time Vector Knowledge RAG',
      desc: 'Connect databases, documentation, and CRM records with automated dense chunking and sub-20ms semantic retrieval.',
      badge: 'Continuous Indexing',
    },
    {
      title: 'Automated Ticket & CRM Sync',
      desc: 'Every customer interaction automatically generates structured Salesforce, HubSpot, or Zendesk ticket records.',
      badge: 'Bi-Directional Sync',
    },
    {
      title: 'Zero-Latency Human Handover',
      desc: 'Instant WebSocket escalation to human agents whenever sentiment thresholds indicate critical priority.',
      badge: 'Live Takeover',
    },
    {
      title: 'Air-Gapped Enterprise VPC',
      desc: 'Deploy on dedicated Kubernetes pods with SAML 2.0 Okta SSO, custom domain CNAMEs, and zero data retention.',
      badge: 'Single Tenant',
    },
  ];

  const faqs = [
    {
      q: 'How long does deployment take for an enterprise with 500+ seats?',
      a: 'Standard integration takes under 15 minutes via our pre-built NPM/Python SDKs or simple script tags. Full CRM and custom vector indexing completes same-day.',
    },
    {
      q: 'Do you offer custom SLA agreements and dedicated support engineers?',
      a: 'Yes. Enterprise tiers include a 99.999% uptime financial SLA, private Slack/Teams channels, and a named principal solutions architect.',
    },
    {
      q: 'Can we self-host Kortex AI within our own AWS or Azure VPC?',
      a: 'Yes. We provide certified Helm charts and Terraform modules for single-tenant air-gapped deployments on AWS EKS, GCP GKE, and Azure AKS.',
    },
    {
      q: 'How does Kortex prevent hallucination on factual company policies?',
      a: 'We enforce strict citation verification. The model only answers questions using verified snippets from your active knowledge base, complete with line-level source links.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#080C14] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

      {/* 1. TOP SYSTEM HEALTH & SECURITY TRUST BAR */}
      <div className={`border-b py-2 px-4 text-xs font-mono ${
        isDark ? 'border-slate-800 bg-[#05080E] text-slate-400' : 'border-slate-200 bg-white text-slate-600 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">API CLUSTER STATUS: OPERATIONAL</span>
            <span className="text-slate-400">|</span>
            <span>99.999% SLA Uptime</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">SOC-2 Type II &amp; ISO-27001 Certified</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Sub-25ms Global Edge P99</span>
            <span>GDPR &amp; CCPA Compliant</span>
          </div>
        </div>
      </div>

      {/* 2. COMMAND-CENTER HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
            isDark ? 'border-blue-500/30 bg-blue-950/40 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>{config.badgeText || 'Kortex v2.4 Live · Real-Time Vector RAG & CRM Sync'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
            {config.heroHeadline || (
              <>
                Autonomous AI Agents <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  For High-Velocity Teams
                </span>
              </>
            )}
          </h1>

          <p className={`text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto font-normal leading-relaxed`}>
            {config.heroSubheadline ||
              'Deploy production-ready conversational AI connected to your live knowledge base. Resolve 70% of inbound inquiries instantly and sync high-intent leads to your CRM.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenBooking()}
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Deploy Live Cluster</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className={`px-6 py-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>Interactive Agent Demo</span>
            </button>
          </div>

          {/* 3. INTERACTIVE CODE TERMINAL IN HERO */}
          <div className="mt-14 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-800 bg-[#0A0E17] text-slate-200 shadow-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-slate-400 font-bold">kortex-sdk-example</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['ts', 'python', 'curl'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveCodeTab(lang)}
                      className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition cursor-pointer ${
                        activeCodeTab === lang
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2 transition cursor-pointer"
                    title="Copy snippet"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre className="text-slate-300 whitespace-pre-wrap">{codeSnippets[activeCodeTab]}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KINETIC MARQUEE */}
      <section className={`py-5 border-y ${
        isDark ? 'border-slate-800 bg-[#05080E]' : 'border-slate-200 bg-slate-100/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {integrationPartners.map((partner, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-slate-800 bg-slate-900 text-blue-300' : 'border-slate-200 bg-white text-blue-900 shadow-2xs'
              }`}
            >
              {partner}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 5. CORE ARCHITECTURAL PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            Built For Mission-Critical Scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((item, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">{item.badge}</span>
                <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE INFRASTRUCTURE ROI CALCULATOR */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">ROI Modeling</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Support Automation Savings</h2>
          </div>

          <div className={`p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono text-slate-500 uppercase">Monthly Inbound Support Volume</span>
                <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                  {(monthlyNodes * 500).toLocaleString()} Tickets / Mo
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={monthlyNodes}
                onChange={(e) => setMonthlyNodes(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-mono text-slate-500">Estimated Annual Support Cost Saved</div>
                <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${(monthlyNodes * 2800).toLocaleString()} / yr
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-mono text-slate-500">Average First-Response Time</div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  &lt; 3.2 Seconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SERVICES & DEPLOYMENT TIERS (FROM CONFIG.SERVICES) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Cluster Tiers</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            Plans &amp; Deployment Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service) => (
            <TiltCard
              key={service.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                service.popular
                  ? isDark
                    ? 'bg-slate-900 border-blue-500/60 shadow-xl ring-1 ring-blue-500/30'
                    : 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              <div>
                {service.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 mb-3">
                    Recommended Tier
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
                    {service.price === 0 ? 'Free Trial' : `$${service.price}`}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-3 leading-relaxed`}>
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    service.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
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
      </section>

      {/* 8. COMPARISON TABLE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Standard Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">TechFlow vs Fragmented Legacy Stacks</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-blue-600 dark:text-blue-400">TechFlow Autonomous Engine</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Fragmented Legacy Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  {
                    cap: 'Vector Knowledge Synchronization',
                    flow: 'Continuous real-time embedding refresh',
                    trad: 'Manual CSV re-indexing required',
                  },
                  {
                    cap: 'Human Supervisor Live Takeover',
                    flow: 'Sub-100ms WebSocket seamless handoff',
                    trad: 'Disconnected session, email ticket generated',
                  },
                  {
                    cap: 'CRM Two-Way Synchronization',
                    flow: 'Direct webhook & REST updates in real time',
                    trad: 'Nightly batch exports with sync errors',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.cap}</td>
                    <td className="p-4 sm:p-5 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.flow}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{row.trad}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Frequently Addressed</span>
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
                  <ChevronDown className={`w-4 h-4 text-blue-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

      {/* 10. FINAL CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-900 text-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Automate Customer Support at Scale?
          </h3>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Start your 14-day free cluster trial. No credit card required.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Start Free Trial Cluster
            </button>
            <button
              onClick={onOpenChat}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tracking-wider uppercase border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Talk to Solutions Engineer</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
