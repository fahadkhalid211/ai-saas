'use client';

import React, { useState } from 'react';
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

export interface EngineTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  saveSuccess: boolean;
  saveError: string | null;
  handleSaveSettings: () => void | Promise<void>;
  isSaving: boolean;
}

export const EngineTab: React.FC<EngineTabProps> = ({
  formData,
  setFormData,
  saveSuccess,
  saveError,
  handleSaveSettings,
  isSaving,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentTemp = formData.temperature ?? 0.3;
  const currentChunks = formData.contextChunks ?? 5;

  const currentStyle =
    currentTemp <= 0.1 ? 'strict' : currentTemp <= 0.5 ? 'balanced' : 'creative';

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Choose your AI model provider and customize how your assistant communicates with customers.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Configuration saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

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
              Unlike competitors that mark up AI tokens by 300%+ with opaque credit burn, Kortex AI allows you to bring your own API key (BYOK) and pay wholesale rates directly to model providers with zero platform markup, or run on our Zero-Cost failover engine ($0 compute).
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selection Cards */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select AI Provider</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: 'auto_free', label: 'Zero-Cost Free Engine', tag: 'ZERO COST', desc: 'Auto failover across Groq, Gemini & Ollama ($0 compute)' },
            { id: 'groq', label: 'Groq Cloud', tag: 'FASTEST (FREE)', desc: 'Instant sub-second Llama 3.3 responses' },
            { id: 'gemini', label: 'Google Gemini', tag: '0% MARKUP (BYOK)', desc: 'Gemini 2.5 Flash with deep context' },
            { id: 'openai', label: 'OpenAI', tag: '0% MARKUP (BYOK)', desc: 'GPT-4o & GPT-4o-mini wholesale rates' },
            { id: 'anthropic', label: 'Anthropic Claude', tag: '0% MARKUP (BYOK)', desc: 'Claude 3.5 Sonnet & Haiku wholesale' },
            { id: 'deepseek', label: 'DeepSeek', tag: '0% MARKUP (BYOK)', desc: 'DeepSeek-V3 & R1 reasoning at cost' },
            { id: 'ollama', label: 'Local Server (Ollama)', tag: 'OFFLINE', desc: 'Self-hosted model on your computer' },
          ].map((prov) => {
            const isSelected = (formData.provider || 'auto_free') === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
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
                  setFormData({
                    ...formData,
                    provider: prov.id,
                    modelName: defaultModels[prov.id] || 'openai/gpt-oss-120b',
                  });
                }}
                className={`text-left p-3.5 rounded-xl border transition relative cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Zero-Cost Free Engine Callout */}
      {formData.provider === 'auto_free' && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <span>Zero-Cost Inference Engine (Multi-Provider Failover)</span>
              <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">100% Free - $0 Compute</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              Runs at zero cost with no credit card or server purchases required. Automatically routes requests to Groq Free Tier (sub-second Llama 3.3 70B), fails over to Google Gemini Flash Free Tier, and falls back to local Ollama on your computer.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Get Free Groq Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Get Free Gemini Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Groq Callout */}
      {formData.provider === 'groq' && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <span>Recommended for Lightning Speed (~500+ tokens/sec)</span>
              <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded text-[10px]">100% Free Tier</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              Groq runs open-source models with near-instant responses. Their free tier offers 14,400 requests/day at $0 cost with no credit card required.
            </p>
            <div className="pt-1">
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Get Free Groq API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Callout */}
      {formData.provider === 'gemini' && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <span>Fast Answers with Google Gemini Flash</span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-[10px]">Free Tier</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              Google AI Studio provides a free API key with fast, accurate responses across business documents and websites.
            </p>
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Get Free Gemini API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Primary Human-Friendly Settings Box */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-6 shadow-xs">
        {/* API Key Input (if cloud provider) */}
        {formData.provider !== 'ollama' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
              <span>
                {formData.provider === 'auto_free'
                  ? 'Free Tier API Key (Optional)'
                  : `${(formData.provider || 'Provider').toUpperCase()} API Key`}
              </span>
              {formData.provider !== 'auto_free' && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Wholesale Direct Billing (0% Platform Markup)
                </span>
              )}
            </label>
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
                : 'Your API key is securely encrypted at rest and never shared.'}
            </p>
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
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
