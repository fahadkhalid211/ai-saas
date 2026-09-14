'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedIframeCode, setCopiedIframeCode] = useState(false);

  if (!isOpen) return null;

  const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Deploy on Website &amp; WordPress</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Option 1: Single-Line JavaScript Embed</h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
              Paste this snippet before <code className="text-blue-600 dark:text-blue-400">&lt;/body&gt;</code> on any HTML, Shopify, or Webflow site:
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto">
{`<script src="${effectiveHost}/widget.js" data-assistant="${assistantId}" defer></script>`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<script src="${effectiveHost}/widget.js" data-assistant="${assistantId}" defer></script>`
                  );
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">Option 2: Inline Iframe Embed (Embed Anywhere on Page)</h4>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">Inline Chatbox</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
              Embed the chatbox directly inside any page container, contact section, blog post, or full-width customer portal without a floating bubble:
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto">
{`<iframe src="${effectiveHost}/embed/${assistantId}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<iframe src="${effectiveHost}/embed/${assistantId}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`
                  );
                  setCopiedIframeCode(true);
                  setTimeout(() => setCopiedIframeCode(false), 2000);
                }}
                className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[10px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                {copiedIframeCode ? 'Copied!' : 'Copy Iframe'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Option 3: 1-Click WordPress Plugin</h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
              The standalone plugin is included in your repository at <code className="text-slate-700 dark:text-slate-300 font-mono">wordpress/ai-business-assistant/</code>.
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>Zip the <code className="font-mono">ai-business-assistant</code> folder and upload to WordPress Admin &rarr; Plugins &rarr; Add New.</li>
              <li>Activate the plugin and open <code className="font-mono">AI Assistant</code> settings in the WordPress menu.</li>
              <li>Set Server URL to <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</code> and Assistant ID to <code className="font-mono">{assistantId}</code>.</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end pt-2">
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
