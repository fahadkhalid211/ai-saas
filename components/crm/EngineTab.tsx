'use client';

import { SaveButton } from '@/components/ui/SaveButton';
import React, { useState } from 'react';
import { CostCapCard } from './CostCapCard';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  ExternalLink,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  Sliders,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { hasConnectedAiKey } from '@/lib/ai/resolve-provider';

export interface EngineTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  saveSuccess: boolean;
  saveError: string | null;
  handleSaveSettings: () => void | Promise<void>;
  isSaving: boolean;
  /** The assistant as last saved, so the panel can show what is live rather than what is being edited. */
  activeAssistant?: any;
}

export const PROVIDER_GUIDES: Record<
  string,
  {
    label: string;
    slug: string;
    href: string;
    actionText: string;
    consoleUrl?: string;
    consoleLabel?: string;
    badge: string;
    badgeColor: 'emerald' | 'blue' | 'purple' | 'amber';
    tagline: string;
    summary: string;
  }
> = {
  auto_free: {
    label: 'Zero-Cost Free Engine',
    slug: 'auto-free',
    href: '/support/ai-connectors/auto-free',
    actionText: "Here's how to connect the Zero-Cost Multi-Provider Engine",
    badge: '100% Free - $0 Compute',
    badgeColor: 'emerald',
    tagline: 'Multi-Provider Failover (Groq + Gemini + Ollama)',
    summary:
      'Runs at zero cost with no credit card or server purchases required. Automatically routes requests to Groq Free Tier (sub-second Llama 3.3 70B), fails over to Google Gemini Flash Free Tier, and falls back to local Ollama on your computer.',
    consoleUrl: 'https://console.groq.com/keys',
    consoleLabel: 'Get Free Groq Key',
  },
  groq: {
    label: 'Groq Cloud',
    slug: 'groq',
    href: '/support/ai-connectors/groq',
    actionText: "Here's how to connect Groq for free in 90 seconds",
    badge: '100% Free Tier (14.4k req/day)',
    badgeColor: 'emerald',
    tagline: 'Sub-Second LPU Inference (~500+ tokens/sec)',
    summary:
      'Groq runs open-source models with near-instant responses on dedicated LPU hardware. Their free tier offers 14,400 requests/day at $0 cost with no credit card required.',
    consoleUrl: 'https://console.groq.com/keys',
    consoleLabel: 'Get Free Groq API Key',
  },
  gemini: {
    label: 'Google Gemini',
    slug: 'gemini',
    href: '/support/ai-connectors/gemini',
    actionText: "Here's how to connect Google Gemini with free API key",
    badge: 'Free Tier (15 RPM) + BYOK',
    badgeColor: 'blue',
    tagline: 'Massive 1,000,000+ Context Window with Gemini Flash',
    summary:
      'Google AI Studio provides a free API key with fast, accurate responses across huge business documents, catalogs, and websites without truncation.',
    consoleUrl: 'https://aistudio.google.com/app/apikey',
    consoleLabel: 'Get Free Gemini Key',
  },
  openai: {
    label: 'OpenAI',
    slug: 'openai',
    href: '/support/ai-connectors/openai',
    actionText: "Here's how to connect OpenAI & configure API limits",
    badge: '0% Markup BYOK Wholesale',
    badgeColor: 'emerald',
    tagline: 'Direct OpenAI Connection (GPT-4o & GPT-4o-mini)',
    summary:
      'Connect your OpenAI Developer account. Pay wholesale rates directly to OpenAI ($0.15/1M tokens on gpt-4o-mini). Keys are encrypted at rest with AES-256-GCM.',
    consoleUrl: 'https://platform.openai.com/api-keys',
    consoleLabel: 'Open OpenAI API Keys Console',
  },
  anthropic: {
    label: 'Anthropic Claude',
    slug: 'anthropic',
    href: '/support/ai-connectors/anthropic',
    actionText: "Here's how to connect Anthropic Claude & generate keys",
    badge: '0% Markup BYOK Wholesale',
    badgeColor: 'purple',
    tagline: 'Claude 3.5 Sonnet & Haiku with Human-Like Empathy',
    summary:
      'Industry-leading conversational nuance and factual adherence. Pay raw wholesale rates directly to Anthropic Console with zero platform surcharge.',
    consoleUrl: 'https://console.anthropic.com/',
    consoleLabel: 'Open Anthropic Console',
  },
  deepseek: {
    label: 'DeepSeek',
    slug: 'deepseek',
    href: '/support/ai-connectors/deepseek',
    actionText: "Here's how to connect DeepSeek at 95% wholesale savings",
    badge: 'Ultra-Low Cost ($0.14/1M)',
    badgeColor: 'blue',
    tagline: 'DeepSeek-V3 & R1 High-Precision Reasoning',
    summary:
      'Frontier model intelligence at a fraction of standard LLM pricing ($0.14 per 1M input tokens). DeepSeek-V3 and R1 reasoning handle high-volume customer inquiries at nominal cost.',
    consoleUrl: 'https://platform.deepseek.com/',
    consoleLabel: 'Open DeepSeek Platform',
  },
  ollama: {
    label: 'Local Server (Ollama)',
    slug: 'ollama',
    href: '/support/ai-connectors/ollama',
    actionText: "Here's how to set up local Ollama & configure CORS",
    badge: '100% Offline Air-Gapped Privacy',
    badgeColor: 'amber',
    tagline: 'Self-Hosted Llama 3.2 on Your Own Hardware',
    summary:
      'Run open-source models completely locally on your machine. Customer queries and sensitive documents never leave your local environment or device.',
    consoleUrl: 'https://ollama.com/download',
    consoleLabel: 'Download Ollama (Free)',
  },
};

export const EngineTab: React.FC<EngineTabProps> = ({
  formData,
  setFormData,
  saveSuccess,
  saveError,
  handleSaveSettings,
  isSaving,
  activeAssistant,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const prov = formData.provider || 'groq';
      const isCustomOrOllama = prov === 'custom' || prov === 'ollama';
      const res = await fetch('/api/connectors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai',
          provider: prov,
          apiKey: formData.apiKeyEncrypted,
          customBaseUrl: isCustomOrOllama ? (formData.customBaseUrl || formData.ollamaHost) : undefined,
          modelName: formData.modelName,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: res.ok && data.success,
        message: data.message || (res.ok ? 'Connection verified successfully!' : 'Connection test failed.'),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to reach verification endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentTemp = formData.temperature ?? 0.3;
  const currentChunks = formData.contextChunks ?? 5;

  const currentStyle =
    currentTemp <= 0.1 ? 'strict' : currentTemp <= 0.5 ? 'balanced' : 'creative';

  const currentProviderId = formData.provider || 'groq';
  const currentGuide = PROVIDER_GUIDES[currentProviderId] || PROVIDER_GUIDES.groq;

  // What is live is the saved assistant; formData may hold edits that are not saved yet.
  const live = activeAssistant || formData;
  const liveProviderId = live.provider || 'groq';
  const liveGuide = PROVIDER_GUIDES[liveProviderId] || PROVIDER_GUIDES.groq;
  const liveUsesKey = liveProviderId !== 'ollama';
  const liveHasKey = hasConnectedAiKey(live);
  const liveModel =
    liveProviderId === 'auto_free' ? 'Groq, then Gemini, then Ollama (automatic failover)' : live.modelName || 'openai/gpt-oss-120b';
  const hasUnsavedProviderChange =
    Boolean(activeAssistant) && (formData.provider || 'groq') !== liveProviderId;

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Settings &amp; Connectors</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose your AI model provider and customize how your assistant communicates with customers.
          </p>
        </div>
        <a
          href="/support/ai-connectors"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Browse All AI Connector Guides ↗</span>
        </a>
      </div>

      {/* Currently active AI */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3"
        role="status"
        aria-label="Currently active AI"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Currently active AI</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {liveGuide.label}
              <span className="font-medium text-slate-500 dark:text-slate-400"> · {liveModel}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {liveUsesKey && (
            <span
              className={`px-2 py-0.5 rounded-md border ${
                liveHasKey
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {liveHasKey ? 'Your API key is set' : 'No API key yet'}
            </span>
          )}
          {hasUnsavedProviderChange && (
            <span className="px-2 py-0.5 rounded-md border bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">
              Switching to {currentGuide.label} once you save
            </span>
          )}
        </div>
      </div>

      {/* Zero-Markup BYOK Positioning Banner */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 p-4 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Zero-Markup BYOK Architecture</span>
              <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200 dark:border-blue-700">
                0% TOKEN MARKUP
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Unlike competitors that mark up AI tokens by 300%+ with opaque credit burn, Crescelo allows you to bring your own API key (BYOK) and pay wholesale rates directly to model providers with zero platform markup, or run on our Zero-Cost failover engine ($0 compute).
            </p>
          </div>
        </div>
      </div>

      {/* Alert if API Key is Missing for Active Provider */}
      {liveUsesKey && !liveHasKey && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 text-xs shadow-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              API Key Required for {liveGuide.label}
            </div>
            <p className="text-amber-800/90 dark:text-amber-300/90 text-[11.5px] leading-relaxed">
              Your assistant cannot answer customer questions or test chat in the playground until your API key is connected.
              {liveProviderId === 'groq'
                ? ' Groq provides 14,400 free daily requests ($0 compute, no credit card required).'
                : ''} Enter your key below and click &ldquo;Save AI Engine Settings&rdquo;.
            </p>
            {liveGuide.consoleUrl && (
              <div className="pt-1.5">
                <a
                  href={liveGuide.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 transition"
                >
                  <span>{liveGuide.consoleLabel || 'Get Free API Key'} ↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select AI Provider</label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Click any card to switch provider</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: 'groq', label: 'Groq Cloud', tag: 'RECOMMENDED (FREE)', desc: 'Instant sub-second inference (14,400 free req/day, $0 compute)' },
            { id: 'gemini', label: 'Google Gemini', tag: '0% MARKUP (BYOK)', desc: 'Gemini 2.5 Flash with deep context' },
            { id: 'openai', label: 'OpenAI', tag: '0% MARKUP (BYOK)', desc: 'GPT-4o & GPT-4o-mini wholesale rates' },
            { id: 'anthropic', label: 'Anthropic Claude', tag: '0% MARKUP (BYOK)', desc: 'Claude 3.5 Sonnet & Haiku wholesale' },
            { id: 'deepseek', label: 'DeepSeek', tag: '0% MARKUP (BYOK)', desc: 'DeepSeek-V3 & R1 reasoning at cost' },
            { id: 'auto_free', label: 'Zero-Cost Free Engine', tag: 'MULTI-CLOUD', desc: 'Auto failover across Groq, Gemini & Ollama ($0 compute)' },
            { id: 'ollama', label: 'Local Server (Ollama)', tag: 'OFFLINE', desc: 'Self-hosted model on your computer' },
          ].map((prov) => {
            const isSelected = (formData.provider || 'groq') === prov.id;
            const guide = PROVIDER_GUIDES[prov.id];
            return (
              <div
                key={prov.id}
                onClick={() => {
                  const defaultModels: Record<string, string> = {
                    auto_free: 'openai/gpt-oss-120b',
                    groq: 'openai/gpt-oss-120b',
                    gemini: 'gemini-3.6-flash',
                    openai: 'gpt-4o-mini',
                    anthropic: 'claude-3-5-haiku-20241022',
                    deepseek: 'deepseek-chat',
                    ollama: 'llama3.2',
                  };
                  const isCloud = prov.id !== 'ollama' && prov.id !== 'custom';
                  setFormData({
                    ...formData,
                    provider: prov.id,
                    modelName: defaultModels[prov.id] || 'openai/gpt-oss-120b',
                    ...(isCloud ? { customBaseUrl: '', ollamaHost: '' } : {}),
                  });
                }}
                className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{prov.label}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        prov.tag.includes('FASTEST')
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {prov.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {prov.desc}
                  </p>
                </div>

                {guide && (
                  <a
                    href={guide.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80"
                  >
                    <BookOpen className="h-3 w-3 shrink-0" />
                    <span>Setup Guide ↗</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Connection Guide Callout for Selected Provider */}
      {currentGuide && (
        <div
          className={`rounded-xl border p-4 text-xs shadow-xs flex items-start gap-3.5 transition-all ${
            currentGuide.badgeColor === 'emerald'
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100'
              : currentGuide.badgeColor === 'blue'
              ? 'border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100'
              : currentGuide.badgeColor === 'purple'
              ? 'border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
          }`}
        >
          <Zap
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              currentGuide.badgeColor === 'emerald'
                ? 'text-emerald-600 dark:text-emerald-400'
                : currentGuide.badgeColor === 'blue'
                ? 'text-blue-600 dark:text-blue-400'
                : currentGuide.badgeColor === 'purple'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          />
          <div className="space-y-2 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-sm flex items-center gap-2">
                <span>{currentGuide.tagline}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-current opacity-85">
                  {currentGuide.badge}
                </span>
              </p>
              <a
                href={currentGuide.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{currentGuide.actionText} ↗</span>
              </a>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              {currentGuide.summary}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {currentGuide.consoleUrl && (
                <a
                  href={currentGuide.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white px-3 py-1.5 rounded-lg transition shadow-xs"
                >
                  <span>{currentGuide.consoleLabel || 'Open Console'}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <a
                href={currentGuide.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <BookOpen className="h-3 w-3" />
                <span>View Full Step-by-Step Connection Guide</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Primary Settings Box */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-6 shadow-xs">
        {/* API Key Input (if cloud provider) */}
        {formData.provider !== 'ollama' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>
                  {formData.provider === 'auto_free'
                    ? 'Free Tier API Key (Optional)'
                    : `${(formData.provider || 'Provider').toUpperCase()} API Key`}
                </span>
                {formData.provider !== 'auto_free' && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Wholesale Direct Billing (0% Markup)
                  </span>
                )}
              </label>

              {currentGuide && (
                <a
                  href={currentGuide.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  <span>Here&apos;s how to get your {currentGuide.label} key (Guide ↗)</span>
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKeyEncrypted || ''}
                onChange={(e) => setFormData({ ...formData, apiKeyEncrypted: e.target.value })}
                placeholder={
                  formData.provider === 'auto_free'
                    ? 'Paste your free Groq (gsk_...) or Gemini (AIza...) key, or leave blank...'
                    : 'Paste your API key here...'
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {formData.provider === 'auto_free'
                ? 'Zero-cost failover automatically tests your key with Groq, then Gemini, and falls back to local Ollama.'
                : 'Your API key is securely encrypted at rest using AES-256-GCM and never shared or logged.'}
            </p>
            {/* Test Connection Row */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !formData.apiKeyEncrypted}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isTesting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span>{isTesting ? 'Testing…' : 'Test Connection'}</span>
              </button>
              {testResult && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    testResult.success
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {testResult.message}
                </span>
              )}
            </div>
            {formData.provider !== 'auto_free' && (
              <CostCapCard formData={formData} setFormData={setFormData} activeAssistant={activeAssistant} />
            )}
          </div>
        ) : (
          /* Ollama Host Configuration */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ollama Server Endpoint URL
              </label>
              <a
                href="/support/ai-connectors/ollama"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Here&apos;s how to set up local Ollama &amp; configure CORS (Guide ↗)</span>
              </a>
            </div>
            <input
              type="text"
              value={formData.ollamaHost || formData.customBaseUrl || 'http://localhost:11434'}
              onChange={(e) => setFormData({ ...formData, ollamaHost: e.target.value, customBaseUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ensure you have launched Ollama with <code>OLLAMA_ORIGINS=&quot;*&quot;</code> to permit browser CORS requests.
            </p>
            {/* Test Connection Row (Ollama) */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isTesting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>{isTesting ? 'Testing…' : 'Test Ollama Connection'}</span>
              </button>
              {testResult && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    testResult.success
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {testResult.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Response Style (Human-Friendly Selection) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Response Style
            </label>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              {currentStyle === 'strict' ? 'Strict & Factual' : currentStyle === 'balanced' ? 'Balanced (Recommended)' : 'Creative'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'strict',
                label: 'Strict & Factual',
                val: 0.0,
                desc: 'Answers strictly from your uploaded knowledge. Zero guessing or creative extrapolation.',
              },
              {
                id: 'balanced',
                label: 'Balanced',
                val: 0.3,
                desc: 'Conversational, helpful, and friendly while sticking accurately to your business facts.',
              },
              {
                id: 'creative',
                label: 'Creative',
                val: 0.7,
                desc: 'Expressive and engaging phrasing with varied wording.',
              },
            ].map((style) => {
              const isSelected = currentStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, temperature: style.val })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs mb-1">
                    <span>{style.label}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {style.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Knowledge Search Depth */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              How much knowledge to search per answer
            </label>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {currentChunks} sections
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { chunks: 3, label: 'Focused', desc: 'Fastest answers. Searches top 3 most relevant passages.' },
              { chunks: 5, label: 'Standard (Recommended)', desc: 'Best balance of thoroughness and response speed.' },
              { chunks: 8, label: 'Comprehensive', desc: 'Deep multi-topic search across larger document sets.' },
            ].map((preset) => {
              const isSelected = currentChunks === preset.chunks;
              return (
                <button
                  key={preset.chunks}
                  type="button"
                  onClick={() => setFormData({ ...formData, contextChunks: preset.chunks })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs mb-1">
                    <span>{preset.label}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {preset.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Web Search Permission Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Allow Live Web Search</span>
              {(formData.allowWebSearch ?? true) ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">ENABLED</span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded-full">DISABLED</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              When enabled, your assistant can look up real-time information from the web if a visitor asks about something not in your knowledge base.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={formData.allowWebSearch ?? true}
              onChange={(e) => setFormData({ ...formData, allowWebSearch: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Advanced Technical Settings Disclosure */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Advanced Technical Settings</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Model Identifier Override
                  </label>
                  <input
                    type="text"
                    value={formData.modelName || ''}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    placeholder="e.g. gpt-4o-mini, gemini-3.6-flash"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Default model for {formData.provider || 'this provider'}.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Response Tokens ({formData.maxTokens ?? 2048})
                  </label>
                  <input
                    type="range"
                    min="250"
                    max="4096"
                    step="50"
                    value={formData.maxTokens ?? 2048}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Upper limit on answer length. 2048 tokens is ~1,500 words.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Fine-Tuning Temperature ({currentTemp})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentTemp}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              {(formData.provider === 'ollama' || formData.provider === 'auto_free') && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Local Ollama Endpoint URL (Fallback)
                  </label>
                  <input
                    type="text"
                    value={formData.customBaseUrl || ''}
                    onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                    placeholder="http://localhost:11434/v1"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Custom host address for self-hosted local model instances.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
            Saving will verify your connection before applying — a bad key will be rejected with an error.
          </p>
          <SaveButton
            onClick={() => {
              const isCloud = formData.provider !== 'ollama' && formData.provider !== 'custom';
              if (isCloud && formData.customBaseUrl) {
                setFormData((prev: any) => ({ ...prev, customBaseUrl: '', ollamaHost: '' }));
              }
              handleSaveSettings();
            }}
            saving={isSaving}
            error={saveError}
            idleLabel="Save Settings"
            savingLabel="Verifying & Saving…"
            savedLabel="Settings Saved"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
