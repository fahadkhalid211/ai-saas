'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  FileText,
  Upload,
  Cpu,
  Sliders,
  Palette,
  MessageSquare,
  Users,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  Download,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronDown,
  Globe,
  Zap,
  AlertTriangle,
} from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  temperature: number;
  maxTokens?: number;
  contextChunks?: number;
  provider: string;
  modelName: string;
  apiKeyEncrypted?: string;
  customBaseUrl?: string;
  primaryColor: string;
  launcherPosition: string;
  starterQuestions: string[];
  collectLeadEmail: boolean;
  allowedDomains: string[];
}

interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  chunkCount: number;
  fileSizeBytes?: number;
  status: string;
  errorMessage?: string;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'knowledge' | 'engine' | 'behavior' | 'widget' | 'playground' | 'leads'
  >('overview');
  
  // Knowledge state
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTextTitle, setUploadTextTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [showChunkInspector, setShowChunkInspector] = useState(false);
  const [chunksList, setChunksList] = useState<any[]>([]);

  // Engine & Behavior state
  const [formData, setFormData] = useState<Partial<Assistant>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Playground state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; citations?: any[] }[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Initial load
  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    if (activeAssistant) {
      setFormData(activeAssistant);
      fetchKnowledge(activeAssistant.id);
      fetchLeads(activeAssistant.id);
      // Reset playground
      setChatMessages([
        {
          role: 'assistant',
          content: activeAssistant.welcomeMessage || 'Hi! How can I help you today?',
        },
      ]);
    }
  }, [activeAssistant?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isStreaming]);

  async function fetchAssistants() {
    try {
      const res = await fetch('/api/assistants');
      const data = await res.json();
      if (data.assistants && data.assistants.length > 0) {
        setAssistants(data.assistants);
        if (!activeAssistant) {
          setActiveAssistant(data.assistants[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assistants:', err);
    }
  }

  async function fetchKnowledge(assistantId: string) {
    try {
      const res = await fetch(`/api/knowledge?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    }
  }

  async function fetchLeads(assistantId: string) {
    try {
      const res = await fetch(`/api/lead?assistantId=${assistantId}`);
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }

  async function handleCreateAssistant(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssistantName.trim()) return;

    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAssistantName.trim(),
          welcomeMessage: `Hello! Welcome to ${newAssistantName.trim()}. How can I assist you?`,
        }),
      });
      const data = await res.json();
      if (data.assistant) {
        setAssistants((prev) => [...prev, data.assistant]);
        setActiveAssistant(data.assistant);
        setShowNewModal(false);
        setNewAssistantName('');
      }
    } catch (err) {
      console.error('Failed to create assistant:', err);
    }
  }

  async function handleSaveSettings() {
    if (!activeAssistant) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/assistants/${activeAssistant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.assistant) {
        setActiveAssistant(data.assistant);
        setAssistants((prev) =>
          prev.map((a) => (a.id === data.assistant.id ? data.assistant : a))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUploadFiles(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAssistant) return;
    if ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim()) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('assistantId', activeAssistant.id);

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((f) => body.append('files', f));
    }
    if (uploadText.trim()) {
      body.append('text', uploadText.trim());
      body.append('title', uploadTextTitle.trim() || 'Business Knowledge Description');
    }

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFiles(null);
        setUploadText('');
        setUploadTextTitle('');
        fetchKnowledge(activeAssistant.id);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteSource(id: string) {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = textToSend || inputQuery;
    if (!text.trim() || isStreaming || !activeAssistant) return;

    const newMsgs = [...chatMessages, { role: 'user', content: text.trim() }];
    setChatMessages(newMsgs);
    setInputQuery('');
    setIsStreaming(true);

    // Placeholder assistant message
    const tempIndex = newMsgs.length;
    setChatMessages([...newMsgs, { role: 'assistant', content: '', citations: [] }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get chat response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamed = '';
      let citations: any[] = [];

      if (reader) {
        let updateTimer: any = null;
        const flushUpdate = () => {
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[tempIndex] = {
              role: 'assistant',
              content: streamed,
              citations,
            };
            return updated;
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'citations') {
                  citations = data.citations || [];
                } else if (data.type === 'token') {
                  streamed += data.token;
                  if (!updateTimer) {
                    updateTimer = setTimeout(() => {
                      updateTimer = null;
                      flushUpdate();
                    }, 35);
                  }
                }
              } catch {
                // partial parse
              }
            }
          }
        }
        if (updateTimer) {
          clearTimeout(updateTimer);
        }
        flushUpdate();
      }
    } catch (err) {
      console.error('Playground chat error:', err);
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[tempIndex] = {
          role: 'assistant',
          content: 'Error: Unable to connect to the AI service. Please verify your provider settings.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  const totalChunks = sources.reduce((sum, s) => sum + (s.chunkCount || 0), 0);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                KORTEX <span className="text-blue-400 font-medium">ENGINE</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono uppercase">
                Zero-Cost Embeddings &bull; Multi-LLM BYOK
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 ml-2" />

          {/* Assistant Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <select
                value={activeAssistant?.id || ''}
                onChange={(e) => {
                  const ast = assistants.find((a) => a.id === e.target.value);
                  if (ast) setActiveAssistant(ast);
                }}
                className="bg-transparent text-slate-200 outline-none cursor-pointer pr-2 font-medium"
              >
                {assistants.map((ast) => (
                  <option key={ast.id} value={ast.id} className="bg-slate-900 text-slate-200">
                    {ast.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-850 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5 text-blue-400" />
            <span>New Bot</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-md">
            <span className="text-slate-500">PROVIDER:</span>
            <span className="text-cyan-400 uppercase font-bold">{activeAssistant?.provider || 'OLLAMA'}</span>
          </div>

          <button
            onClick={() => setShowEmbedModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Deploy &amp; WordPress</span>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-56 border-r border-slate-800/80 bg-slate-950/80 p-3 flex flex-col justify-between">
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: FileCheck },
              { id: 'knowledge', label: 'Knowledge Base', icon: Upload, count: sources.length },
              { id: 'engine', label: 'AI Engine (BYOK)', icon: Cpu },
              { id: 'behavior', label: 'Behavior & Guardrails', icon: Sliders },
              { id: 'widget', label: 'Widget & Styling', icon: Palette },
              { id: 'playground', label: 'Test Playground', icon: MessageSquare },
              { id: 'leads', label: 'Leads & Inquiries', icon: Users, count: leads.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom quick stats */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Embedding Cost:</span>
              <span className="text-emerald-400 font-bold">$0.00 (Local)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Chunks:</span>
              <span className="text-slate-200 font-semibold">{totalChunks}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Sources:</span>
              <span className="text-slate-200 font-semibold">{sources.length}</span>
            </div>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <span>Welcome to {activeAssistant?.name}</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Your business assistant is ready. Train it on your documents, customize its prompt, and embed it anywhere.
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-xs font-medium text-slate-400">Knowledge Sources</div>
                  <div className="mt-2 text-2xl font-bold text-white">{sources.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Files, CSVs, and descriptions</div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-xs font-medium text-slate-400">Indexed Chunks</div>
                  <div className="mt-2 text-2xl font-bold text-cyan-400">{totalChunks}</div>
                  <div className="mt-1 text-[11px] text-slate-500">384-dim local vectors</div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-xs font-medium text-slate-400">AI Model Provider</div>
                  <div className="mt-2 text-xl font-bold text-indigo-400 uppercase">
                    {activeAssistant?.provider || 'Ollama'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-mono">
                    {activeAssistant?.modelName || 'llama3.2'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <div className="text-xs font-medium text-slate-400">Captured Leads</div>
                  <div className="mt-2 text-2xl font-bold text-emerald-400">{leads.length}</div>
                  <div className="mt-1 text-[11px] text-slate-500">Customer contacts</div>
                </div>
              </div>

              {/* Quick Start Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                    <Upload className="h-4 w-4 text-blue-400" />
                    <span>Upload Knowledge Documents</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload your product lists (CSV), business return policies (PDF/DOCX), catalogues (JSON), or plain text. The local engine chunks and embeds them instantly for $0.
                  </p>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Go to Knowledge Base &rarr;
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    <span>Test Chat in Playground</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Simulate real customer inquiries. Verify citations, check accuracy on product pricing or terms, and test fallback behavior before launching.
                  </p>
                  <button
                    onClick={() => setActiveTab('playground')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Open Playground &rarr;
                  </button>
                </div>
              </div>

              {/* 1-Click Embed Snippet */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <span>Embed On Any Website</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<script src="${window.location.origin}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                      );
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Paste this single line of HTML before the closing <code className="text-cyan-400">&lt;/body&gt;</code> tag of any WordPress, Shopify, Webflow, or custom site:
                </p>
                <div className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs font-mono text-cyan-300 border border-slate-800">
                  &lt;script src=&quot;{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/widget.js&quot; data-assistant=&quot;{activeAssistant?.id}&quot; defer&gt;&lt;/script&gt;
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Knowledge Base</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Upload PDF, CSV, JSON, DOCX, and TXT files. Tabular files (CSV/JSON) are converted into row-aware semantic representations to ensure exact matching on prices, SKUs, and details.
                </p>
              </div>

              {/* Upload Form */}
              <form
                onSubmit={handleUploadFiles}
                className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30 p-6 space-y-4 hover:border-slate-600 transition"
              >
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      Drop files here or click to browse
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports PDF, CSV, JSON, DOCX, TXT &amp; Images (JPG, PNG with OCR)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.csv,.json,.docx,.txt,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="text-xs text-emerald-400 font-medium">
                      Selected {selectedFiles.length} file(s) for indexing
                    </div>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase font-mono">
                    Or Enter Raw Business Description / FAQs
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Section Title (e.g. Return Policy, Store Hours, Contact Info)"
                    value={uploadTextTitle}
                    onChange={(e) => setUploadTextTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  <textarea
                    rows={3}
                    placeholder="Paste business instructions, FAQs, shipping details, or company background..."
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim())}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Extracting &amp; Indexing Chunks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Process &amp; Train Assistant</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Sources List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>Processed Knowledge Documents ({sources.length})</span>
                  <span className="text-xs text-slate-400 font-normal font-mono">
                    Total Chunks: {totalChunks}
                  </span>
                </h3>

                {sources.length === 0 ? (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-900/20 p-8 text-center text-xs text-slate-500">
                    No documents uploaded yet. Add a PDF, product CSV, or text description above to train your assistant.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 divide-y divide-slate-800/60">
                    {sources.map((source) => {
                      return (
                        <div key={source.id} className="flex items-center justify-between p-4 hover:bg-slate-850/40 transition">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                              {source.type === 'csv' ? (
                                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                              ) : source.type === 'json' ? (
                                <FileCode className="h-4 w-4 text-amber-400" />
                              ) : source.type === 'pdf' ? (
                                <FileText className="h-4 w-4 text-rose-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">{source.title}</div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                <span className="uppercase">{source.type}</span>
                                <span>&bull;</span>
                                <span className="text-cyan-400 font-bold">{source.chunkCount} chunks</span>
                                <span>&bull;</span>
                                <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {source.status === 'ready' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                Ready
                              </span>
                            )}
                            {source.status === 'processing' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                Processing...
                              </span>
                            )}
                            {source.status === 'failed' && (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                  Failed
                                </span>
                                {source.errorMessage && (
                                  <span className="text-[9px] text-rose-400/80 max-w-[180px] truncate" title={source.errorMessage}>
                                    {source.errorMessage}
                                  </span>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => handleDeleteSource(source.id)}
                              className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded-md hover:bg-slate-800"
                              title="Delete source"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI ENGINE (BYOK & OPEN SOURCE) */}
          {activeTab === 'engine' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">AI Engine &amp; BYOK Configuration</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Choose between 100% free open-source models (Ollama local or Groq free tier) or connect customer-provided API keys (OpenAI, Anthropic, Gemini, DeepSeek).
                </p>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Configuration saved successfully!</span>
                </div>
              )}

              {/* Provider Selection Cards */}
              {/* Provider Selection Cards */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select AI Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'groq', label: 'Groq Cloud', tag: '⚡ ULTRA-FAST (FREE)', desc: 'Instant sub-second Llama-3.3' },
                    { id: 'gemini', label: 'Google Gemini', tag: '⚡ FAST (FREE TIER)', desc: 'Gemini 1.5 & 2.0 Flash' },
                    { id: 'ollama', label: 'Local Ollama', tag: '100% FREE', desc: 'Local CPU/GPU machine' },
                    { id: 'openai', label: 'OpenAI', tag: 'BYOK', desc: 'GPT-4o & GPT-4o-mini' },
                    { id: 'anthropic', label: 'Anthropic Claude', tag: 'BYOK', desc: 'Claude 3.5 Sonnet & Haiku' },
                    { id: 'deepseek', label: 'DeepSeek', tag: 'BYOK', desc: 'DeepSeek-V3 & R1' },
                  ].map((prov) => {
                    const isSelected = (formData.provider || 'ollama') === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          const defaultModels: Record<string, string> = {
                            ollama: 'llama3.2',
                            groq: 'llama-3.3-70b-versatile',
                            openai: 'gpt-4o-mini',
                            gemini: 'gemini-1.5-flash',
                            anthropic: 'claude-3-5-haiku-20241022',
                            deepseek: 'deepseek-chat',
                          };
                          setFormData({
                            ...formData,
                            provider: prov.id,
                            modelName: defaultModels[prov.id] || 'llama3.2',
                          });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition relative ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">{prov.label}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            prov.tag.includes('ULTRA-FAST')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : prov.tag.includes('FAST')
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : prov.tag.includes('FREE')
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {prov.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{prov.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider Quick Recommendations / Notice */}
              {formData.provider === 'groq' && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-3">
                  <Zap className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-emerald-300 flex items-center gap-2">
                      <span>⚡ Recommended for Lightning Speed (~500+ tokens/sec)</span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">100% Free Tier</span>
                    </p>
                    <p className="text-slate-300 text-[11.5px] leading-relaxed">
                      Groq runs open-source Llama 3 models on specialized LPU hardware with near-instant responses. Their free tier offers 14,400 requests/day at $0 cost (no credit card required).
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>Get Free Groq API Key (Takes 10 Seconds)</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {formData.provider === 'gemini' && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-cyan-200 flex items-start gap-3">
                  <Zap className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-cyan-300 flex items-center gap-2">
                      <span>⚡ Sub-Second Speed with Google Gemini Flash</span>
                      <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px]">Free Tier</span>
                    </p>
                    <p className="text-slate-300 text-[11.5px] leading-relaxed">
                      Google AI Studio provides 15 requests per minute completely free with Gemini 1.5 &amp; 2.0 Flash.
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>Get Free Gemini API Key</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {formData.provider === 'ollama' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-4 text-xs text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">Local CPU Speed Note</p>
                    <p className="text-slate-300 text-[11.5px] leading-relaxed">
                      Running local LLMs on a CPU (without an Nvidia GPU) typically runs at 2-4 tokens/sec, taking ~30-60 seconds per response.
                    </p>
                    <p className="text-amber-200/90 text-[11.5px]">
                      👉 <strong>For instant responses (1-2s):</strong> Switch to <strong>Groq Cloud</strong> above (free API key at console.groq.com) for 100x faster generation at $0 cost!
                    </p>
                  </div>
                </div>
              )}

              {/* Specific Provider Config */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.modelName || ''}
                      onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                      placeholder="e.g. llama3.2, gpt-4o-mini, gemini-1.5-flash"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      Exact model string passed to completion API
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Temperature ({formData.temperature ?? 0.3})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.temperature ?? 0.3}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0.0 (Strict factual)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>
                </div>

                {/* Performance Tuning Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                      <span>Knowledge Context Chunks</span>
                      <span className="text-blue-400 font-mono font-bold">{formData.contextChunks ?? 3} chunks</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={formData.contextChunks ?? 3}
                      onChange={(e) => setFormData({ ...formData, contextChunks: parseInt(e.target.value) })}
                      className="w-full mt-2"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Fewer chunks cut prompt size by ~40-60%, drastically accelerating generation start.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                      <span>Max Response Tokens</span>
                      <span className="text-blue-400 font-mono font-bold">{formData.maxTokens ?? 400} tokens</span>
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="800"
                      step="50"
                      value={formData.maxTokens ?? 400}
                      onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                      className="w-full mt-2"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Keeps answers crisp and avoids overly long generation times.
                    </p>
                  </div>
                </div>

                {/* API Key if not Ollama */}
                {(formData.provider || 'ollama') !== 'ollama' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {(formData.provider || '').toUpperCase()} API Key (BYOK)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={formData.apiKeyEncrypted || ''}
                        onChange={(e) => setFormData({ ...formData, apiKeyEncrypted: e.target.value })}
                        placeholder="sk-..."
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pr-10 text-xs text-slate-200 font-mono outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      This key is encrypted and strictly scoped to this assistant. You never pay for customer tokens.
                    </p>
                  </div>
                )}

                {/* Custom Base URL (For Ollama or custom local server) */}
                {(formData.provider || 'ollama') === 'ollama' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Ollama Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={formData.customBaseUrl || 'http://localhost:11434/v1'}
                      onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                      placeholder="http://localhost:11434/v1"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Run `ollama run llama3.2` locally. No API key or subscription needed!
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>Save Engine Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BEHAVIOR & PROMPTS */}
          {activeTab === 'behavior' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Behavior &amp; Guardrails</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Define how your assistant represents the business, its personality tone, and what it says when information is missing.
                </p>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Behavior updated successfully!</span>
                </div>
              )}

              {/* Template Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Quick Personality Templates</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      name: 'E-commerce Sales Rep',
                      prompt: 'You are an enthusiastic, knowledgeable sales assistant. Guide customers to the right products, highlight benefits, and confirm exact prices and shipping policies from the provided knowledge.',
                    },
                    {
                      name: 'Customer Support Specialist',
                      prompt: 'You are an empathetic, concise, and problem-solving support agent. Help customers troubleshoot issues, follow return guidelines, and provide clear step-by-step instructions.',
                    },
                    {
                      name: 'Corporate FAQ Bot',
                      prompt: 'You are an executive assistant representing our firm. Provide formal, precise, and verified facts. Never speculate on unannounced policies.',
                    },
                  ].map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, systemPrompt: t.prompt })}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    System Instructions &amp; Role
                  </label>
                  <textarea
                    rows={6}
                    value={formData.systemPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 outline-none focus:border-blue-500 leading-relaxed font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Defines the core personality. Grounded RAG instructions and retrieved knowledge fragments are automatically appended during inference.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Welcome Message
                    </label>
                    <input
                      type="text"
                      value={formData.welcomeMessage || ''}
                      onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Fallback Message (When info is not in knowledge base)
                    </label>
                    <input
                      type="text"
                      value={formData.fallbackMessage || ''}
                      onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>Save Behavior</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WIDGET & STYLING */}
          {activeTab === 'widget' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Widget &amp; Branding</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Customize the chat launcher, brand colors, position, and lead capture settings for your website or WordPress plugin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration controls */}
                <div className="space-y-5">
                  {/* Brand Color */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      Brand Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      {['#2563eb', '#7c3aed', '#059669', '#e11d48', '#d97706', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryColor: c })}
                          style={{ backgroundColor: c }}
                          className={`h-8 w-8 rounded-full border-2 transition ${
                            formData.primaryColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                        />
                      ))}
                      <input
                        type="text"
                        value={formData.primaryColor || '#2563eb'}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-24 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Launcher Position */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Launcher Position
                    </label>
                    <div className="flex gap-3">
                      {['bottom-right', 'bottom-left'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setFormData({ ...formData, launcherPosition: pos })}
                          className={`rounded-lg border px-4 py-2 text-xs font-medium capitalize transition ${
                            formData.launcherPosition === pos
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Starter Questions */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Suggested Starter Questions (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(formData.starterQuestions || []).join('\n')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          starterQuestions: e.target.value.split('\n').filter((q) => q.trim() !== ''),
                        })
                      }
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Lead Capture Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div>
                      <div className="text-xs font-semibold text-white">Lead Capture Form</div>
                      <div className="text-[11px] text-slate-400">Ask visitor for their email during the conversation</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.collectLeadEmail || false}
                      onChange={(e) => setFormData({ ...formData, collectLeadEmail: e.target.checked })}
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Save Widget Appearance</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
                  <div className="text-xs font-semibold text-slate-400 mb-4 font-mono uppercase">
                    Live Widget Preview
                  </div>

                  {/* Simulated widget window */}
                  <div className="w-80 rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
                    <div
                      style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                      className="p-3.5 text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          AI
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{formData.name || 'Business AI'}</div>
                          <div className="text-[10px] opacity-80 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 space-y-3 min-h-[220px]">
                      <div className="bg-white p-3 rounded-xl rounded-bl-sm text-xs shadow-sm border border-slate-100 max-w-[85%] text-slate-800">
                        {formData.welcomeMessage || 'Hi! How can I help you today?'}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {(formData.starterQuestions || []).slice(0, 2).map((q, i) => (
                          <div
                            key={i}
                            className="text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 font-medium"
                          >
                            {q}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                      <div className="flex-1 text-xs text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full">
                        Ask a question...
                      </div>
                      <div
                        style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                        className="h-7 w-7 rounded-full text-white flex items-center justify-center text-xs"
                      >
                        <Send className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="h-full flex flex-col max-w-4xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Chat Playground</span>
                    <span className="text-xs font-mono font-normal text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      Model: {activeAssistant?.modelName || 'llama3.2'}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Real-time streaming test environment with hybrid vector citations.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setChatMessages([
                      {
                        role: 'assistant',
                        content: activeAssistant?.welcomeMessage || 'Hi! How can I help you today?',
                      },
                    ])
                  }
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md"
                >
                  Clear Chat
                </button>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-850 text-slate-200 rounded-bl-none border border-slate-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                          <div className="font-semibold text-slate-300 mb-1">Citations &amp; Knowledge:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c: any, ci: number) => (
                              <span
                                key={ci}
                                className="bg-slate-800/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono"
                                title={c.preview}
                              >
                                {c.sourceTitle}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Retrieving context &amp; generating answer...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Starter questions quick pills */}
              {activeAssistant?.starterQuestions && (
                <div className="flex flex-wrap gap-2">
                  {activeAssistant.starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about your products, pricing, or policies..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isStreaming || !inputQuery.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  <span>Ask</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: LEADS & INQUIRIES */}
          {activeTab === 'leads' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Collected Leads</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Visitor contact information collected directly through your website chatbot.
                </p>
              </div>

              {leads.length === 0 ? (
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/20 p-8 text-center text-xs text-slate-500">
                  No leads captured yet. Turn on &quot;Lead Capture Form&quot; in the Widget tab to start collecting visitor emails!
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-850/40">
                          <td className="p-3.5 font-medium text-white">{l.email}</td>
                          <td className="p-3.5">{l.name || '—'}</td>
                          <td className="p-3.5">{l.phone || '—'}</td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-500">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Create Assistant */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Business Assistant</h3>
            <p className="text-xs text-slate-400">
              Each assistant has its own independent knowledge base, personality, and embeddable widget.
            </p>
            <form onSubmit={handleCreateAssistant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Assistant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Specialist, Store FAQ Bot"
                  value={newAssistantName}
                  onChange={(e) => setNewAssistantName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAssistantName.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Create Assistant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Embed & WordPress Installation */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                <span>Deploy &amp; Connect Website</span>
              </h3>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Option 1: WordPress Plugin */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">WP</span>
                  WordPress 1-Click Plugin
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready in /wordpress</span>
              </div>
              <p className="text-xs text-slate-400">
                Install the included <code className="text-slate-200">ai-business-assistant</code> plugin into your WordPress site, enter your Assistant ID, and your chatbot appears automatically on all pages!
              </p>
              <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                Assistant ID: <strong className="text-cyan-300">{activeAssistant?.id}</strong>
              </div>
            </div>

            {/* Option 2: Standalone HTML Embed */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
              <span className="text-xs font-bold text-white">
                Universal HTML Script Tag (Shopify, Webflow, Squarespace, Custom)
              </span>
              <div className="rounded-lg bg-slate-900 p-3 text-xs font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
                &lt;script src=&quot;{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js&quot; data-assistant=&quot;{activeAssistant?.id}&quot; defer&gt;&lt;/script&gt;
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<script src="${window.location.origin}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                  );
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Embed Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
