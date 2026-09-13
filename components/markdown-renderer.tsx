'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content text-xs leading-relaxed space-y-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2.5 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-0.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-1.5 text-slate-800 dark:text-slate-200 leading-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 my-2 text-slate-800 dark:text-slate-200 marker:text-slate-400 dark:marker:text-slate-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2 text-slate-800 dark:text-slate-200 marker:font-semibold marker:text-slate-600 dark:marker:text-slate-400">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-0.5">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-500 dark:border-blue-400 bg-blue-50/60 dark:bg-blue-950/30 pl-3 py-1.5 my-2 rounded-r italic text-slate-700 dark:text-slate-300 text-[11.5px]">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-3 border-slate-200 dark:border-slate-800" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">
              {children}
            </em>
          ),
          a: ({ href, children }) => {
            const isSafe =
              href &&
              /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(href.trim()) &&
              !/^javascript:/i.test(href.trim());
            if (!isSafe) {
              return <span className="underline break-all text-slate-700 dark:text-slate-300">{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
              {children}
            </td>
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const raw = String(children);
            const isMultiLine = raw.includes('\n');
            if (match || isMultiLine) {
              return (
                <CodeBlock
                  code={raw.replace(/\n$/, '')}
                  language={match ? match[1] : ''}
                />
              );
            }
            return (
              <code
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200/70 dark:border-slate-700/60"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 overflow-hidden text-[11px] font-mono shadow-xs">
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
