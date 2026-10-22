'use client';

import { T, useT } from '@/lib/i18n/context';
import { SaveButton } from '@/components/ui/SaveButton';
import React, { useState, useRef } from 'react';
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
import { useAiKeyHealth } from '@/lib/ai/use-key-health';
import { ProviderLogo } from '@/components/crm/ProviderLogo';

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
    label: 'Free engine (automatic)',
    slug: 'auto-free',
    href: '/support/ai-connectors/auto-free',
    actionText: "How the free engine works",
    badge: 'Free — no card needed',
    badgeColor: 'emerald',
    tagline: 'Tries a free service, then another if the first is busy',
    summary:
      "Costs nothing and needs no card. It answers using Groq's free plan, and if that is ever busy, it quietly tries Google Gemini's free plan instead, so your assistant keeps working either way.",
    consoleUrl: 'https://console.groq.com/keys',
    consoleLabel: 'Get a free Groq key',
  },
  groq: {
    label: 'Groq',
    slug: 'groq',
    href: '/support/ai-connectors/groq',
    actionText: 'How to get a free Groq key (about 90 seconds)',
    badge: 'Free (up to 14,400 replies a day)',
    badgeColor: 'emerald',
    tagline: 'Very fast replies',
    summary:
      "Groq answers almost instantly. Its free plan covers 14,400 replies a day at no cost, and doesn't ask for a card.",
    consoleUrl: 'https://console.groq.com/keys',
    consoleLabel: 'Get a free Groq key',
  },
  gemini: {
    label: 'Google Gemini',
    slug: 'gemini',
    href: '/support/ai-connectors/gemini',
    actionText: 'How to get a free Gemini key',
    badge: 'Free plan available',
    badgeColor: 'blue',
    tagline: "Good with very large documents",
    summary:
      "Google's AI. Its free plan is generous and it handles long documents and catalogues especially well.",
    consoleUrl: 'https://aistudio.google.com/app/apikey',
    consoleLabel: 'Get a free Gemini key',
  },
  openai: {
    label: 'OpenAI',
    slug: 'openai',
    href: '/support/ai-connectors/openai',
    actionText: 'How to connect OpenAI',
    badge: 'You pay OpenAI directly — no markup',
    badgeColor: 'emerald',
    tagline: "The AI behind ChatGPT",
    summary:
      'Connect your own OpenAI account. You pay OpenAI its normal price for what your assistant uses; Crescelo adds nothing on top. Your key is stored encrypted.',
    consoleUrl: 'https://platform.openai.com/api-keys',
    consoleLabel: 'Open your OpenAI account',
  },
  anthropic: {
    label: 'Anthropic Claude',
    slug: 'anthropic',
    href: '/support/ai-connectors/anthropic',
    actionText: 'How to connect Claude',
    badge: 'You pay Anthropic directly — no markup',
    badgeColor: 'purple',
    tagline: 'Known for a careful, natural tone',
    summary:
      "Anthropic's Claude models. You pay Anthropic its normal price directly; we add nothing on top.",
    consoleUrl: 'https://console.anthropic.com/',
    consoleLabel: 'Open your Anthropic account',
  },
  deepseek: {
    label: 'DeepSeek',
    slug: 'deepseek',
    href: '/support/ai-connectors/deepseek',
    actionText: 'How to connect DeepSeek',
    badge: 'You pay DeepSeek directly — very low cost',
    badgeColor: 'blue',
    tagline: 'A capable model at a low price',
    summary:
      'A lower-cost AI model. You pay DeepSeek its normal (low) price directly; we add nothing on top.',
    consoleUrl: 'https://platform.deepseek.com/',
    consoleLabel: 'Open your DeepSeek account',
  },
  ollama: {
    label: 'Your own computer (advanced)',
    slug: 'ollama',
    href: '/support/ai-connectors/ollama',
    actionText: 'How to set this up',
    badge: 'For technical users',
    badgeColor: 'amber',
    tagline: 'Runs on hardware you control, not the internet',
    summary:
      "For technical users only. It runs on a computer you set up yourself, so nothing about your customers' questions ever leaves your building. If that sentence didn't mean much to you, one of the other options above is a better fit.",
    consoleUrl: 'https://ollama.com/download',
    consoleLabel: 'Download Ollama (free)',
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
  const __t = useT();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  // Whether the saved key really works: asked of the provider every minute or so, and updated the moment a customer's chat is refused
  const { health, checking, refresh } = useAiKeyHealth(activeAssistant?.id, activeAssistant?.keyHealth);
  // What was typed or chosen for each provider while looking around, so clicking another provider card and coming back loses nothing
  // (and never carries one provider's key over to another).
  const drafts = useRef<Record<string, { apiKeyEncrypted?: string; modelName?: string; customBaseUrl?: string; ollamaHost?: string }>>({});

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
          assistantId: activeAssistant?.id,
          // a saved key is shown masked; the server then tests the saved key itself
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
      // the server stored the verdict for a saved key: bring the badge and the status panel up to date at once
      void refresh();
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
  const keyState: 'n/a' | 'missing' | 'valid' | 'invalid' | 'unreachable' | 'checking' = !liveUsesKey
    ? 'n/a'
    : !liveHasKey || health?.state === 'missing'
      ? 'missing'
      : health?.state === 'valid' || health?.state === 'invalid' || health?.state === 'unreachable'
        ? health.state
        : 'checking';
  const checkedAtText = health?.checkedAt ? new Date(health.checkedAt).toLocaleTimeString() : '';
  const liveModel =
    liveProviderId === 'auto_free' ? 'Groq, then Gemini, then Ollama (automatic failover)' : live.modelName || 'openai/gpt-oss-120b';
  const hasUnsavedProviderChange =
    Boolean(activeAssistant) && (formData.provider || 'groq') !== liveProviderId;

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"><T>AI Settings</T></h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            <T>Choose which AI answers your customers, and how it should sound. The free option below works fine for most businesses — you can always change this later.</T>
          </p>
        </div>
        <a
          href="/support/ai-connectors"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span><T>Help with this page ↗</T></span>
        </a>
      </div>

      {/* Currently active AI: green only while the provider accepts the key */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          keyState === 'invalid'
            ? 'border-rose-300 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30'
            : keyState === 'unreachable'
              ? 'border-amber-300 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30'
              : keyState === 'missing' || keyState === 'checking'
                ? 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40'
                : 'border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30'
        }`}
        role="status"
        aria-label={__t("Currently active AI")}
        data-key-state={keyState}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {(keyState === 'valid' || keyState === 'n/a') && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                keyState === 'invalid' ? 'bg-rose-500' : keyState === 'unreachable' ? 'bg-amber-500' : keyState === 'missing' || keyState === 'checking' ? 'bg-slate-400' : 'bg-emerald-500'
              }`}
            />
          </span>
          <div className="min-w-0">
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                keyState === 'invalid' ? 'text-rose-700 dark:text-rose-400' : keyState === 'unreachable' ? 'text-amber-700 dark:text-amber-400' : keyState === 'missing' || keyState === 'checking' ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {keyState === 'invalid'
                ? <T>Your assistant cannot answer right now</T>
                : keyState === 'unreachable'
                  ? <T>Cannot reach the AI provider right now</T>
                  : keyState === 'checking'
                    ? <T>Checking your key…</T>
                    : keyState === 'missing'
                      ? <T>Not answering yet</T>
                      : <T>Answering your customers right now</T>}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              <T>{liveGuide.label}</T>
              <span className="font-medium text-slate-600 dark:text-slate-400"> · {liveModel}</span>
            </div>
            {(keyState === 'invalid' || keyState === 'unreachable') && health?.message && (
              <div className="mt-1 text-xs text-slate-700 dark:text-slate-300 break-words">{health.message}</div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {liveUsesKey && (
            <span
              className={`px-2 py-0.5 rounded-md border ${
                keyState === 'valid'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                  : keyState === 'invalid'
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
                    : keyState === 'checking'
                      ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {keyState === 'valid'
                ? <T>{'Key verified'}</T>
                : keyState === 'invalid'
                  ? <T>{'Key rejected'}</T>
                  : keyState === 'unreachable'
                    ? <T>{'Could not verify the key'}</T>
                    : keyState === 'checking'
                      ? <T>{'Checking…'}</T>
                      : <T>{'No key connected yet'}</T>}
            </span>
          )}
          {liveUsesKey && liveHasKey && (
            <button
              type="button"
              onClick={() => void refresh(true)}
              disabled={checking}
              className="px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {checking ? <T>{'Checking…'}</T> : <T>{'Check now'}</T>}
            </button>
          )}
          {liveUsesKey && liveHasKey && checkedAtText && (
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400"><T>Last checked</T> {checkedAtText}</span>
          )}
          {hasUnsavedProviderChange && (
            <span className="px-2 py-0.5 rounded-md border bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800">
              <T>Switching to</T> <T>{currentGuide.label}</T> <T>once you save</T>
            </span>
          )}
        </div>
      </div>

      {/* The saved key stopped working: say so, and what to do */}
      {keyState === 'invalid' && (
        <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-sm shadow-xs flex items-start gap-3" data-key-alert="invalid">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-900 dark:text-rose-200"><T>The AI provider rejected your key</T></div>
            <p className="text-rose-900/90 dark:text-rose-300/90 text-sm leading-relaxed">
              <T>It may have been deleted, expired, or run out of credit. Customers cannot get answers until you paste a working key below and click &ldquo;Save&rdquo;.</T>
            </p>
          </div>
        </div>
      )}

      {/* Bring-your-own-key: no markup */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 p-4 text-sm text-slate-700 dark:text-slate-300 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm"><T>You&apos;re never charged for the AI itself</T></span>
              <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-xs border border-blue-200 dark:border-blue-700">
                <T>No markup</T>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <T>Use the free option below and it costs nothing. Or connect your own account with one of the paid services and pay them their normal price directly — we don&apos;t add anything on top, ever.</T>
            </p>
          </div>
        </div>
      </div>

      {/* Alert if API Key is Missing for Active Provider */}
      {liveUsesKey && !liveHasKey && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 text-sm shadow-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              <T>Connect a key before this can talk to customers</T>
            </div>
            <p className="text-amber-900/90 dark:text-amber-300/90 text-sm leading-relaxed">
              <T>It can&apos;t answer questions or be tested until then.</T>
              {liveProviderId === 'groq'
                ? <T>{' Groq is free, up to 14,400 replies a day, and does not ask for a card.'}</T>
                : ''} <T>Paste your key below, then click &ldquo;Save&rdquo;.</T>
            </p>
            {liveGuide.consoleUrl && (
              <div className="pt-1.5">
                <a
                  href={liveGuide.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 transition"
                >
                  <span>{liveGuide.consoleLabel || <T>{'Get a free key'}</T>} ↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300"><T>Choose which AI answers your customers</T></label>
          <span className="text-xs text-slate-500 dark:text-slate-500"><T>You can change this any time</T></span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: 'groq', label: 'Groq', tag: 'Free — recommended', desc: 'Fast, and free for normal use. No card needed.' },
            { id: 'auto_free', label: 'Free engine (automatic)', tag: 'Free — automatic', desc: 'Tries another free service if the first is busy.' },
            { id: 'gemini', label: 'Google Gemini', tag: 'Bring your own key', desc: "Google's AI. Good with very large documents." },
            { id: 'openai', label: 'OpenAI', tag: 'Bring your own key', desc: "The AI behind ChatGPT, at OpenAI's own price." },
            { id: 'anthropic', label: 'Anthropic Claude', tag: 'Bring your own key', desc: "Known for a careful, natural tone." },
            { id: 'deepseek', label: 'DeepSeek', tag: 'Bring your own key', desc: 'A capable model at a low price.' },
            { id: 'ollama', label: 'Your own computer', tag: 'Advanced — technical users', desc: 'Runs on hardware you set up yourself.' },
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
                  const from = formData.provider || 'groq';
                  if (prov.id === from) return; // already selected: clicking it again must not reset the model or the key
                  // keep what was typed or chosen for the provider being left
                  drafts.current[from] = {
                    apiKeyEncrypted: formData.apiKeyEncrypted,
                    modelName: formData.modelName,
                    customBaseUrl: formData.customBaseUrl,
                    ollamaHost: formData.ollamaHost,
                  };
                  const isCloud = prov.id !== 'ollama' && prov.id !== 'custom';
                  const saved = activeAssistant && (activeAssistant.provider || 'groq') === prov.id ? activeAssistant : null;
                  const keyProviders = ['groq', 'gemini', 'openai', 'anthropic', 'deepseek'];
                  const back = drafts.current[prov.id];
                  const next = back ?? (saved
                    // the provider that is live: show its saved (masked) key and its own model again
                    ? { apiKeyEncrypted: saved.apiKeyEncrypted, modelName: saved.modelName, customBaseUrl: saved.customBaseUrl, ollamaHost: saved.ollamaHost }
                    : {
                        // another provider: its key has to be pasted, so the previous provider's key is not carried over. The providers
                        // that run without one keep whatever is saved (the masked placeholder means "leave it as it is").
                        apiKeyEncrypted: keyProviders.includes(prov.id) ? '' : (activeAssistant?.apiKeyEncrypted ?? formData.apiKeyEncrypted ?? ''),
                        modelName: defaultModels[prov.id] || 'openai/gpt-oss-120b',
                        ...(isCloud ? { customBaseUrl: '', ollamaHost: '' } : {}),
                      });
                  setFormData({ ...formData, provider: prov.id, ...next });
                  setTestResult(null);
                }}
                className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <ProviderLogo id={prov.id} size={22} />
                      <span><T>{prov.label}</T></span>
                    </span>
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
                    <T>{prov.desc}</T>
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
                    <span><T>Setup Guide ↗</T></span>
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
                <span><T>{currentGuide.tagline}</T></span>
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
                <span><T>{currentGuide.actionText}</T> ↗</span>
              </a>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              <T>{currentGuide.summary}</T>
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {currentGuide.consoleUrl && (
                <a
                  href={currentGuide.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white px-3 py-1.5 rounded-lg transition shadow-xs"
                >
                  <span>{currentGuide.consoleLabel || <T>{'Open Console'}</T>}</span>
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
                <span><T>View Full Step-by-Step Connection Guide</T></span>
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
                <ProviderLogo id={formData.provider || ''} size={20} />
                <span>
                  {formData.provider === 'auto_free'
                    ? <T>{'Free Tier API Key (Optional)'}</T>
                    : __t("{n1} API Key", { n1: (formData.provider || 'Provider').toUpperCase() })}
                </span>
                {formData.provider !== 'auto_free' && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <T>Wholesale Direct Billing (0% Markup)</T>
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
                  <span><T>Here&apos;s how to get your</T> <T>{currentGuide.label}</T> <T>key (Guide ↗)</T></span>
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
            {typeof formData.apiKeyEncrypted === 'string' && formData.apiKeyEncrypted.includes('****') && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                <T>Your saved key is shown masked. Test Connection checks that saved key; paste a new key only to replace it.</T>
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {formData.provider === 'auto_free'
                ? <T>{'Zero-cost failover automatically tests your key with Groq, then Gemini, and falls back to local Ollama.'}</T>
                : <T>{'Your API key is securely encrypted at rest using AES-256-GCM and never shared or logged.'}</T>}
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
                <span>{isTesting ? <T>{'Testing…'}</T> : <T>{'Test Connection'}</T>}</span>
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
                  <T>{testResult.message}</T>
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
                <T>Ollama Server Endpoint URL</T>
              </label>
              <a
                href="/support/ai-connectors/ollama"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span><T>Here&apos;s how to set up local Ollama &amp; configure CORS (Guide ↗)</T></span>
              </a>
            </div>
            <input
              type="text"
              value={formData.ollamaHost || formData.customBaseUrl || 'http://localhost:11434'}
              onChange={(e) => setFormData({ ...formData, ollamaHost: e.target.value, customBaseUrl: e.target.value })}
              placeholder={__t("http://localhost:11434")}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <T>Ensure you have launched Ollama with</T> <code>OLLAMA_ORIGINS=&quot;*&quot;</code> <T>to permit browser CORS requests.</T>
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
                <span>{isTesting ? <T>{'Testing…'}</T> : <T>{'Test Ollama Connection'}</T>}</span>
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
                  <T>{testResult.message}</T>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Response Style (Human-Friendly Selection) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              <T>Response Style</T>
            </label>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              {currentStyle === 'strict' ? <T>{'Strict & Factual'}</T> : currentStyle === 'balanced' ? <T>{'Balanced (Recommended)'}</T> : <T>{'Creative'}</T>}
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
                    <span><T>{style.label}</T></span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    <T>{style.desc}</T>
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
              <T>How much knowledge to search per answer</T>
            </label>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {currentChunks} <T>sections</T>
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
                    <span><T>{preset.label}</T></span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    <T>{preset.desc}</T>
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
              <span><T>Allow Live Web Search</T></span>
              {(formData.allowWebSearch ?? true) ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full"><T>ENABLED</T></span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded-full"><T>DISABLED</T></span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              <T>When enabled, your assistant can look up real-time information from the web if a visitor asks about something not in your knowledge base.</T>
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
            <span><T>Advanced Technical Settings</T></span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    <T>Model Identifier Override</T>
                  </label>
                  <input
                    type="text"
                    value={formData.modelName || ''}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    placeholder={__t("e.g. gpt-4o-mini, gemini-3.6-flash")}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    <T>Default model for</T> {formData.provider || <T>{'this provider'}</T>}.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    <T>Max Response Tokens (</T>{formData.maxTokens ?? 2048})
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
                    <T>Upper limit on answer length. 2048 tokens is ~1,500 words.</T>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  <T>Fine-Tuning Temperature (</T>{currentTemp})
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
                    <T>Local Ollama Endpoint URL (Fallback)</T>
                  </label>
                  <input
                    type="text"
                    value={formData.customBaseUrl || ''}
                    onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                    placeholder={__t("http://localhost:11434/v1")}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    <T>Custom host address for self-hosted local model instances.</T>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
            <T>Saving will verify your connection before applying — a bad key will be rejected with an error.</T>
          </p>
          <SaveButton
            onClick={() => {
              const isCloud = formData.provider !== 'ollama' && formData.provider !== 'custom';
              if (isCloud && formData.customBaseUrl) {
                setFormData((prev: any) => ({ ...prev, customBaseUrl: '', ollamaHost: '' }));
              }
              void Promise.resolve(handleSaveSettings()).then(() => {
                drafts.current = {};
                void refresh(true);
              });
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
