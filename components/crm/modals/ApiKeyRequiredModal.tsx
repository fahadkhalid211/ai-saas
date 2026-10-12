'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState } from 'react';
import {
  X,
  Key,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface ApiKeyRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssistant: any;
  onSuccess?: (updatedAssistant: any) => void;
  onOpenEngineSettings?: () => void;
  featureName?: string;
}

export const ApiKeyRequiredModal: React.FC<ApiKeyRequiredModalProps> = ({
  isOpen,
  onClose,
  activeAssistant,
  onSuccess,
  onOpenEngineSettings,
  featureName,
}) => {
  const __t = useT();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Groq API key.');
      return;
    }

    if (!activeAssistant?.id) {
      setErrorMessage('No active assistant selected. Please reload the dashboard.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. First verify the key directly via verification endpoint
      const verifyRes = await fetch('/api/connectors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai',
          provider: 'groq',
          apiKey: trimmed,
          modelName: 'openai/gpt-oss-120b',
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || 'Invalid Groq API key. Please check the key in your Groq console.');
      }

      // 2. Save directly to the active assistant
      const updateRes = await fetch(`/api/assistants/${activeAssistant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'groq',
          modelName: 'openai/gpt-oss-120b',
          apiKeyEncrypted: trimmed,
          customBaseUrl: '',
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.error || 'Failed to save API key to assistant.');
      }

      setSuccessMessage('Groq API key connected and verified successfully! Your assistant is now active.');
      if (onSuccess && updateData.assistant) {
        onSuccess(updateData.assistant);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to connect Groq API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white"><T>Connect Your Groq API Key</T></h2>
                <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-700">
                  <T>100% FREE</T>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {featureName
                  ? __t("To use {featureName}, connect your free Groq API key.", { featureName: featureName })
                  : <T>{'Connect your free Groq API key to activate your AI assistant.'}</T>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Value Proposition Callout */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 space-y-2 text-xs">
          <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><T>Why Groq? (Zero-Cost &amp; Blazing Fast)</T></span>
          </div>
          <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed text-[11.5px]">
            <T>Groq delivers sub-second inference (~500+ tokens/second). Their official developer tier gives you</T>{' '}
            <strong><T>14,400 free requests every day</T></strong> <T>($0 compute cost) with</T> <strong><T>no credit card required</T></strong>.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 transition shadow-xs"
            >
              <span><T>1. Get Free Key at console.groq.com</T></span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Key Form */}
        <form onSubmit={handleConnectKey} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-slate-400" />
                <span><T>2. Paste Your Groq API Key</T></span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono"><T>Starts with gsk_...</T></span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={__t("gsk_...")}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 pr-10 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-snug"><T>{successMessage}</T></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {onOpenEngineSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEngineSettings();
                }}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer order-2 sm:order-1"
              >
                <span><T>Or use OpenAI, Gemini, Claude</T></span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto ml-auto order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <T>Cancel</T>
              </button>
              <button
                type="submit"
                disabled={isLoading || !apiKey.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span><T>Verifying &amp; Saving...</T></span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span><T>Connect &amp; Activate</T></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
