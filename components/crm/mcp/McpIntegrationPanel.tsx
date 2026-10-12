'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Terminal,
  ExternalLink,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { ALL_MCP_SCOPES, McpScope } from '@/lib/mcp/types';

interface TokenItem {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: McpScope[];
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

interface AuditLogItem {
  id: string;
  tool: string;
  success: boolean;
  durationMs: number;
  timestamp: string;
  errorCode?: string;
}

export function McpIntegrationPanel({ activeSubTab }: { activeSubTab: 'settings' | 'guide' }) {
  const __t = useT();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeClientTab, setActiveClientTab] = useState<'chatgpt' | 'claude' | 'cursor'>('chatgpt');

  // New token generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<McpScope[]>([
    'knowledge:read',
    'business:read',
    'services:read',
    'bookings:read',
    'bookings:create',
    'products:read',
  ]);
  const [expiresInDays, setExpiresInDays] = useState<number>(90);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [copiedNewToken, setCopiedNewToken] = useState(false);

  const mcpEndpointUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/mcp`
      : 'https://www.crescelo.com/api/mcp';

  async function loadData() {
    setLoading(true);
    try {
      const [tokensRes, auditRes] = await Promise.all([
        fetch('/api/mcp/tokens'),
        fetch('/api/mcp/audit?limit=15'),
      ]);
      if (tokensRes.ok) {
        const data = await tokensRes.json();
        setTokens(data.tokens || []);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load MCP tokens or logs', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenName.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/mcp/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenName.trim(),
          scopes: selectedScopes,
          expiresInDays: expiresInDays > 0 ? expiresInDays : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedToken(data.token);
        void loadData();
      }
    } catch (err) {
      console.error('Failed to create token', err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevokeToken(tokenId: string) {
    if (!confirm('Are you sure you want to revoke this MCP token? Connected AI agents will immediately lose access.')) {
      return;
    }
    try {
      const res = await fetch(`/api/mcp/tokens?id=${encodeURIComponent(tokenId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        void loadData();
      }
    } catch (err) {
      console.error('Failed to revoke token', err);
    }
  }

  const claudeConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        crescelo: {
          url: mcpEndpointUrl,
          headers: {
            Authorization: `Bearer ${tokens[0]?.tokenPrefix ? tokens[0].tokenPrefix.replace('...', 'YOUR_TOKEN_HERE') : 'cres_mcp_YOUR_TOKEN'}`,
          },
        },
      },
    },
    null,
    2
  );

  const cursorConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        'crescelo-business': {
          url: mcpEndpointUrl,
          transport: 'streamable-http',
          headers: {
            Authorization: 'Bearer cres_mcp_YOUR_TOKEN',
          },
        },
      },
    },
    null,
    2
  );

  if (activeSubTab === 'guide') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                <T>Connecting External AI Agents via Model Context Protocol (MCP)</T>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <T>Allow ChatGPT, Claude, Cursor, and Windsurf to securely interact with your Crescelo knowledge base, booking calendar, and CRM.</T>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white"><T>Generate an MCP Token</T></h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <T>Create a scoped token for your external AI agent. Granular scopes guarantee the agent can only access allowed data.</T>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white"><T>Configure Your AI Client</T></h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <T>Add the Crescelo server endpoint</T> <code className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">/api/mcp</code> <T>to your AI client configuration with Bearer authorization.</T>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white"><T>Verify Real-Time Tools</T></h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <T>Your AI agent now has 13 native tools for booking appointments, searching docs, capturing leads, and answering client questions.</T>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Endpoint Banner & Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  <T>Model Context Protocol (MCP) Server</T>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <T>Ready &amp; Operational</T>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <T>Official high-speed MCP gateway for ChatGPT, Claude Desktop, Cursor, and autonomous AI agents.</T>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setTokenName('');
              setSelectedScopes([
                'knowledge:read',
                'business:read',
                'services:read',
                'bookings:read',
                'bookings:create',
                'products:read',
              ]);
              setNewlyCreatedToken(null);
              setShowGenerateModal(true);
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span><T>Generate New Token</T></span>
          </button>
        </div>

        {/* Server Endpoint URL Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <T>Public MCP Endpoint URL</T>
            </span>
            <span className="text-[11px] text-slate-400"><T>Supports Streamable HTTP &amp; SSE</T></span>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 select-all overflow-x-auto">
              {mcpEndpointUrl}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(mcpEndpointUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition shrink-0"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? <T>{'Copied'}</T> : <T>{'Copy URL'}</T>}</span>
            </button>
          </div>
        </div>

        {/* Client Config Quick Snippets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <T>Client Configuration Snippets</T>
            </h4>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveClientTab('chatgpt')}
                className={`px-2.5 py-1 rounded-md transition ${activeClientTab === 'chatgpt' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              >
                <T>ChatGPT Actions</T>
              </button>
              <button
                type="button"
                onClick={() => setActiveClientTab('claude')}
                className={`px-2.5 py-1 rounded-md transition ${activeClientTab === 'claude' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              >
                <T>Claude Desktop</T>
              </button>
              <button
                type="button"
                onClick={() => setActiveClientTab('cursor')}
                className={`px-2.5 py-1 rounded-md transition ${activeClientTab === 'cursor' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              >
                <T>Cursor / Windsurf</T>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800 text-slate-200 text-xs font-mono overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                const text =
                  activeClientTab === 'claude'
                    ? claudeConfigSnippet
                    : activeClientTab === 'cursor'
                    ? cursorConfigSnippet
                    : `${mcpEndpointUrl}\nAuthentication: Bearer cres_mcp_YOUR_TOKEN`;
                navigator.clipboard.writeText(text);
                setCopiedSnippet(true);
                setTimeout(() => setCopiedSnippet(false), 2000);
              }}
              className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
            >
              {copiedSnippet ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSnippet ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}</span>
            </button>

            {activeClientTab === 'chatgpt' && (
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <p className="text-emerald-400 font-bold"><T># ChatGPT Custom GPTs Setup:</T></p>
                <p><T>1. Open ChatGPT → Explore GPTs → Create a GPT → Configure → Actions.</T></p>
                <p><T>2. Set Authentication Type to</T> <span className="text-purple-300"><T>API Key</T></span> <T>with Auth Type:</T> <span className="text-purple-300"><T>Bearer</T></span>.</p>
                <p><T>3. Paste your Crescelo MCP Token as the API Key.</T></p>
                <p><T>4. Point schema URL to:</T> <span className="text-blue-400">{mcpEndpointUrl}</span></p>
              </div>
            )}

            {activeClientTab === 'claude' && (
              <pre className="text-[11px] leading-relaxed text-slate-300">{claudeConfigSnippet}</pre>
            )}

            {activeClientTab === 'cursor' && (
              <pre className="text-[11px] leading-relaxed text-slate-300">{cursorConfigSnippet}</pre>
            )}
          </div>
        </div>
      </div>

      {/* 2. Active Tokens Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-500" />
              <T>Active Workspace MCP Tokens</T>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <T>Tokens authenticate external agents to this workspace. Secret tokens are never stored in plain text.</T>
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title={__t("Refresh")}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <T>No MCP tokens generated yet. Click &quot;Generate New Token&quot; above to connect your first AI agent.</T>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold"><T>Name</T></th>
                  <th className="pb-2 font-semibold"><T>Token Prefix</T></th>
                  <th className="pb-2 font-semibold"><T>Scopes</T></th>
                  <th className="pb-2 font-semibold"><T>Created</T></th>
                  <th className="pb-2 font-semibold"><T>Last Used</T></th>
                  <th className="pb-2 font-semibold text-right"><T>Actions</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      <T>{token.name}</T>
                    </td>
                    <td className="py-3 font-mono text-slate-500 dark:text-slate-400">
                      {token.tokenPrefix}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {token.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-slate-500">
                      {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : <T>{'Never'}</T>}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRevokeToken(token.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                        title={__t("Revoke Token")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Live MCP Tool Execution Audit Stream */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <T>Live MCP Tool Execution Audit Stream</T>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <T>Real-time audit log of tools called by connected AI agents for compliance and observability.</T>
            </p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <T>No external agent calls recorded yet. Tool calls will appear here in real time.</T>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-semibold"><T>Tool</T></th>
                  <th className="pb-2 font-semibold"><T>Status</T></th>
                  <th className="pb-2 font-semibold"><T>Duration</T></th>
                  <th className="pb-2 font-semibold text-right"><T>Time</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                      {log.tool}
                    </td>
                    <td className="py-2.5">
                      {log.success ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <T>SUCCESS</T>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          {log.errorCode || <T>{'FAILED'}</T>}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {Math.round(log.durationMs)}<T>ms</T>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Token Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            {newlyCreatedToken ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white"><T>Token Generated Successfully</T></h3>
                    <p className="text-xs text-rose-500 font-semibold mt-0.5">
                      <T>Copy this token now! It will never be shown again.</T>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-all select-all">
                  {newlyCreatedToken}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newlyCreatedToken);
                      setCopiedNewToken(true);
                      setTimeout(() => setCopiedNewToken(false), 2000);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                  >
                    {copiedNewToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedNewToken ? <T>{'Copied to Clipboard'}</T> : <T>{'Copy Token'}</T>}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setNewlyCreatedToken(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    <T>Done</T>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    <T>Generate New MCP Token</T>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <T>Configure granular permissions for an external AI agent connecting to this workspace.</T>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Client Name</T>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={__t("e.g. ChatGPT Agent or Claude Desktop")}
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Expiration</T>
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value={30}>{__t("30 Days")}</option>
                    <option value={90}>{__t("90 Days (Recommended)")}</option>
                    <option value={180}>{__t("180 Days")}</option>
                    <option value={365}>{__t("1 Year")}</option>
                    <option value={0}>{__t("Never Expire")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <T>Permitted Scopes</T>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {ALL_MCP_SCOPES.map((scope) => {
                      const isChecked = selectedScopes.includes(scope);
                      return (
                        <label
                          key={scope}
                          className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-mono cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScopes([...selectedScopes, scope]);
                              } else {
                                setSelectedScopes(selectedScopes.filter((s) => s !== scope));
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">{scope}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    <T>Cancel</T>
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !tokenName.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition"
                  >
                    {isGenerating ? <T>{'Generating...'}</T> : <T>{'Generate Token'}</T>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
