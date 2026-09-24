'use client';

import React, { useState } from 'react';
import { resolveEmbedHost } from '@/lib/embed';
import { X, ChevronDown, ChevronUp, Globe, Code2, Layers } from 'lucide-react';

export interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string;
  customEmbedHost: string;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen,
  onClose,
  assistantId,
  customEmbedHost,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [showOther, setShowOther] = useState(false);

  if (!isOpen) return null;

  const { host: effectiveHost, note: hostNote } = resolveEmbedHost(customEmbedHost, typeof window !== 'undefined' ? window.location.origin : undefined);

  const scriptTag = `<script src="${effectiveHost}/widget.js" data-assistant="${assistantId}" defer></script>`;
  const iframeTag = `<iframe src="${effectiveHost}/embed/${assistantId}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add to Your Website</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copy the code below and paste it into your site.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Recommendation */}
        <div className="rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Recommended — Script Tag</span>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">Best Option</span>
          </div>
          {hostNote && (
            <p className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">{hostNote}</p>
          )}
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Paste this one line before <code className="text-blue-600 dark:text-blue-400 font-mono">&lt;/body&gt;</code> on any HTML, Shopify, or Webflow page. The chat button will appear automatically.
          </p>
          <div className="relative">
            <pre className="p-3 pr-16 rounded-lg bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-700 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
{scriptTag}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(scriptTag);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
              }}
              className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition"
            >
              {copiedScript ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Other Ways — Collapsible */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOther((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <span>Other ways to add the assistant</span>
            {showOther ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showOther && (
            <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">

              {/* Iframe */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Inline Iframe</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">— embed inside a page section instead of a floating button</span>
                </div>
                <div className="relative">
                  <pre className="p-3 pr-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
{iframeTag}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(iframeTag);
                      setCopiedIframe(true);
                      setTimeout(() => setCopiedIframe(false), 2000);
                    }}
                    className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    {copiedIframe ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* WordPress */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">WordPress Plugin</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>Zip the <code className="font-mono">ai-business-assistant</code> folder from your repository and upload it at <strong>WordPress Admin &rarr; Plugins &rarr; Add New</strong>.</li>
                  <li>Activate the plugin, then open <strong>AI Assistant</strong> in the WordPress menu.</li>
                  <li>Set <strong>Server URL</strong> to <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}</code> and <strong>Assistant ID</strong> to <code className="font-mono">{assistantId}</code>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
