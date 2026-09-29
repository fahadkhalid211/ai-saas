'use client';

import React, { useState } from 'react';
import { resolveEmbedHost } from '@/lib/embed';
import { X, ChevronDown, ChevronUp, Globe, Code2, Mail, ExternalLink } from 'lucide-react';

export interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId?: string;
  assistantName?: string;
  customEmbedHost: string;
}

/** A mail draft the owner can forward to whoever manages their website, so they never have to touch the code themselves. */
function buildWebmasterEmail(scriptTag: string, businessName: string): { subject: string; body: string } {
  const subject = `Please add our chat assistant to the website${businessName ? ` — ${businessName}` : ''}`;
  const body = [
    'Hi,',
    '',
    'Could you add this one line of code to our website? It adds a small chat bubble that answers customer questions.',
    '',
    "Paste it right before the closing </body> tag — on every page, or in whatever part of the site's template appears on every page (a footer or a snippet plugin such as Insert Headers and Footers is perfect for this):",
    '',
    scriptTag,
    '',
    'If we use WordPress, Wix, Squarespace or Shopify, step-by-step instructions for those are here:',
    typeof window !== 'undefined' ? `${window.location.origin}/guides/add-ai-assistant-to-wordpress` : '',
    '',
    'Thank you!',
  ].join('\n');
  return { subject, body };
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  isOpen,
  onClose,
  assistantId,
  assistantName,
  customEmbedHost,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [showOther, setShowOther] = useState(false);

  if (!isOpen) return null;

  const { host: effectiveHost, note: hostNote } = resolveEmbedHost(customEmbedHost, typeof window !== 'undefined' ? window.location.origin : undefined);

  const scriptTag = `<script src="${effectiveHost}/widget.js" data-assistant="${assistantId}" defer></script>`;
  const iframeTag = `<iframe src="${effectiveHost}/embed/${assistantId}" width="100%" height="650" frameborder="0" style="border:none; border-radius:16px; width:100%; height:650px; box-shadow:0 4px 20px rgba(0,0,0,0.06);" allow="microphone"></iframe>`;
  const { subject, body } = buildWebmasterEmail(scriptTag, assistantName || '');
  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Add the chat bubble to your website</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              One short line of code makes it appear on your site.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* If someone else manages the website */}
        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Someone else looks after your website?</span>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
            You don&apos;t need to touch any code yourself. This opens an email, already written, that you can send to your web designer, developer or nephew — whoever usually updates your site.
          </p>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold transition"
          >
            <Mail className="h-3.5 w-3.5" /> Email this to my web developer
          </a>
        </div>

        {/* Primary Recommendation */}
        <div className="rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Or do it yourself — one line of code</span>
          </div>
          {hostNote && (
            <p className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{hostNote}</p>
          )}
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            If you can edit your website&apos;s HTML directly, paste this one line just before <code className="text-blue-600 dark:text-blue-400 font-mono">&lt;/body&gt;</code> on any page. The chat bubble appears automatically — nothing else to configure.
          </p>
          <div className="relative">
            <pre className="p-3 pr-16 rounded-lg bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
{scriptTag}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(scriptTag);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
              }}
              className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition"
            >
              {copiedScript ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* WordPress / Wix / Squarespace / Shopify guide */}
        <a
          href="/guides/add-ai-assistant-to-wordpress"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <span>Using WordPress, Wix, Squarespace or Shopify? Read the step-by-step guide</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </a>

        {/* Other Ways — Collapsible */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOther((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <span>Advanced: embed it inside a page instead of a floating bubble</span>
            {showOther ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showOther && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Inline frame</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shows the chat as a fixed box in the middle of a page, instead of a button in the corner. Only use this if that is really what you want — most businesses should use the code above.
              </p>
              <div className="relative">
                <pre className="p-3 pr-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all">
{iframeTag}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(iframeTag);
                    setCopiedIframe(true);
                    setTimeout(() => setCopiedIframe(false), 2000);
                  }}
                  className="absolute right-2 top-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  {copiedIframe ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
