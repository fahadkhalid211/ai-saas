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
  Sun,
  Moon,
  Search,
  HelpCircle,
  X,
  ArrowRight,
  Share2,
  Radio,
  Webhook,
  SendHorizontal,
  Activity,
  Check,
  Link2,
  Shield,
  BookOpen,
} from 'lucide-react';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export interface SupportCustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[];
}

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
  allowWebSearch?: boolean;
  allowedDomains: string[];
  supportReceiverEmail?: string;
  supportCcEmails?: string[];
  supportCustomFields?: SupportCustomField[];
  // Omnichannel Connectors
  telegramBotToken?: string;
  telegramBotEnabled?: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappVerifyToken?: string;
  whatsappEnabled?: boolean;
  // Outbound Webhook Dispatcher
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
  // Agency White-Labeling
  whiteLabelEnabled?: boolean;
  customBrandingText?: string;
  customBrandingUrl?: string;
}

interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  chunkCount: number;
  fileSizeBytes?: number;
  status: string;
  errorMessage?: string;
  errorResolution?: string;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export default function DashboardPage() {
  // Theme state: default light, persisted in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('kortex_theme') as 'light' | 'dark' | null;
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('kortex_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'knowledge' | 'engine' | 'behavior' | 'widget' | 'channels' | 'playground' | 'leads' | 'docs'
  >('overview');

  // Channel & Integrations state
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedWaWebhookUrl, setCopiedWaWebhookUrl] = useState(false);
  const [copiedWaVerifyToken, setCopiedWaVerifyToken] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    botInfo?: { id: number; username: string; firstName: string; canJoinGroups: boolean };
  }>({ loading: false });
  const [telegramWebhookStatus, setTelegramWebhookStatus] = useState<{
    loading: boolean;
    success?: boolean;
    error?: string;
    message?: string;
  }>({ loading: false });
  const [webhookTestStatus, setWebhookTestStatus] = useState<{
    loading: boolean;
    tested?: boolean;
    success?: boolean;
    error?: string;
    statusCode?: number;
    latencyMs?: number;
  }>({ loading: false });

  // Knowledge state
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTextTitle, setUploadTextTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [sourceFilter, setSourceFilter] = useState('');

  // Engine & Behavior state
  const [formData, setFormData] = useState<Partial<Assistant>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);

  // Playground state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; citations?: any[] }[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitations, setActiveCitations] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);

  // Custom Form Field builder state
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'tel' | 'select'>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const currentFields = formData.supportCustomFields || [];
    const newField: SupportCustomField = {
      id: 'field_' + Math.random().toString(36).substring(2, 9),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      options:
        newFieldType === 'select'
          ? newFieldOptions
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };
    setFormData({
      ...formData,
      supportCustomFields: [...currentFields, newField],
    });
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setShowAddFieldForm(false);
  };

  const handleRemoveCustomField = (id: string) => {
    const currentFields = formData.supportCustomFields || [];
    setFormData({
      ...formData,
      supportCustomFields: currentFields.filter((f) => f.id !== id),
    });
  };

  // Modals & Alerts
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [failedSourceModal, setFailedSourceModal] = useState<KnowledgeSource | null>(null);
  const [uploadFailureAlert, setUploadFailureAlert] = useState<{
    title: string;
    reason: string;
    whatToDoNext: string;
  } | null>(null);

  // URL Ingestion state
  const [urlInput, setUrlInput] = useState('');
  const [urlCustomTitle, setUrlCustomTitle] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [urlFeedback, setUrlFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom host override for embed code on live sites
  const [customEmbedHost, setCustomEmbedHost] = useState('');

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

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
          content: activeAssistant.welcomeMessage || 'Hello! How can I assist you today?',
        },
      ]);
      setActiveCitations([]);

      // Zero-reload background polling: automatically updates counts & tables in real time
      const pollTimer = setInterval(() => {
        fetchKnowledge(activeAssistant.id);
        fetchLeads(activeAssistant.id);
      }, 3000);

      return () => clearInterval(pollTimer);
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
        setSources((prev) => {
          if (
            prev.length === data.sources.length &&
            prev.every(
              (s, i) =>
                s.id === data.sources[i]?.id &&
                s.status === data.sources[i]?.status &&
                s.chunkCount === data.sources[i]?.chunkCount
            )
          ) {
            return prev;
          }
          return data.sources;
        });
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
        setLeads((prev) => {
          if (
            prev.length === data.leads.length &&
            prev.every((l, i) => l.id === data.leads[i]?.id)
          ) {
            return prev;
          }
          return data.leads;
        });
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }

  const handleManualSyncLeads = async () => {
    if (!activeAssistant) return;
    setIsSyncingLeads(true);
    await fetchLeads(activeAssistant.id);
    setTimeout(() => setIsSyncingLeads(false), 500);
  };

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
    setSaveError(null);
    try {
      const res = await fetch(`/api/assistants/${activeAssistant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save settings');
      }
      if (data.assistant) {
        setActiveAssistant(data.assistant);
        setFormData(data.assistant);
        setAssistants((prev) =>
          prev.map((a) => (a.id === data.assistant.id ? data.assistant : a))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(err?.message || 'Failed to save settings');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTelegramVerify() {
    if (!formData.telegramBotToken?.trim()) {
      setTelegramStatus({ loading: false, tested: true, success: false, error: 'Please enter a Telegram Bot API Token.' });
      return;
    }
    setTelegramStatus({ loading: true });
    try {
      const res = await fetch(`/api/channels/telegram?action=verify&token=${encodeURIComponent(formData.telegramBotToken.trim())}`);
      const data = await res.json();
      if (data.ok && data.bot) {
        setTelegramStatus({ loading: false, tested: true, success: true, botInfo: data.bot });
      } else {
        setTelegramStatus({ loading: false, tested: true, success: false, error: data.error || 'Invalid Bot Token' });
      }
    } catch (err: any) {
      setTelegramStatus({ loading: false, tested: true, success: false, error: err?.message || 'Verification failed' });
    }
  }

  async function handleTelegramSetWebhook() {
    if (!activeAssistant) return;
    setTelegramWebhookStatus({ loading: true });
    try {
      const webhookUrl = `${window.location.origin}/api/channels/telegram`;
      const res = await fetch(`/api/channels/telegram?action=setWebhook&assistantId=${activeAssistant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setTelegramWebhookStatus({
          loading: false,
          success: true,
          message: 'Webhook registered with Telegram! Incoming bot messages will receive live AI answers.',
        });
        setTimeout(() => setTelegramWebhookStatus({ loading: false }), 6000);
      } else {
        setTelegramWebhookStatus({ loading: false, success: false, error: data.error || 'Failed to register webhook' });
      }
    } catch (err: any) {
      setTelegramWebhookStatus({ loading: false, success: false, error: err?.message || 'Failed to register webhook' });
    }
  }

  async function handleWebhookTestPing() {
    if (!formData.webhookUrl?.trim()) {
      setWebhookTestStatus({ loading: false, tested: true, success: false, error: 'Please provide a Target Webhook URL.' });
      return;
    }
    setWebhookTestStatus({ loading: true });
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant?.id,
          webhookUrl: formData.webhookUrl.trim(),
          webhookSecret: formData.webhookSecret?.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookTestStatus({
          loading: false,
          tested: true,
          success: true,
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      } else {
        setWebhookTestStatus({
          loading: false,
          tested: true,
          success: false,
          error: data.error || 'Webhook ping failed',
          statusCode: data.statusCode,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setWebhookTestStatus({
        loading: false,
        tested: true,
        success: false,
        error: err?.message || 'Webhook ping failed',
      });
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
        await fetchKnowledge(activeAssistant.id);

        const failedList = (data.sources || []).filter((s: any) => s.status === 'failed');
        if (failedList.length > 0) {
          const first = failedList[0];
          setUploadFailureAlert({
            title: first.title,
            reason: first.error || 'Content extraction failed',
            whatToDoNext:
              first.whatToDoNext ||
              'Please check the file format and requirements, or convert the document and try again.',
          });
        } else {
          setUploadFailureAlert(null);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleImportUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAssistant || !urlInput.trim()) return;

    setIsImportingUrl(true);
    setUrlFeedback(null);

    try {
      const res = await fetch('/api/knowledge/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          url: urlInput.trim(),
          customTitle: urlCustomTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUrlFeedback({
          type: 'success',
          message: `Successfully indexed "${data.source.title}" (${data.source.chunks} chunks generated)!`,
        });
        setUrlInput('');
        setUrlCustomTitle('');
        await fetchKnowledge(activeAssistant.id);
        setTimeout(() => setUrlFeedback(null), 5000);
      } else {
        setUrlFeedback({
          type: 'error',
          message: data.error || 'Failed to extract knowledge from this URL.',
        });
        if (data.source) {
          setUploadFailureAlert({
            title: data.source.title,
            reason: data.error,
            whatToDoNext: data.whatToDoNext,
          });
        }
        fetchKnowledge(activeAssistant.id);
      }
    } catch (err: any) {
      setUrlFeedback({
        type: 'error',
        message: err?.message || 'Network error importing URL.',
      });
    } finally {
      setIsImportingUrl(false);
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
                  setActiveCitations(citations);
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
  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(sourceFilter.toLowerCase())
  );

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} h-screen w-full flex flex-col font-sans transition-colors duration-150`}>
      <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
        
        {/* Top Enterprise Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">KORTEX AI</span>
                  <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                    Enterprise SaaS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Business Knowledge Chatbot Engine</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* Assistant Selector */}
            <div className="relative flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Assistant:</span>
                <select
                  value={activeAssistant?.id || ''}
                  onChange={(e) => {
                    const ast = assistants.find((a) => a.id === e.target.value);
                    if (ast) setActiveAssistant(ast);
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-2 font-semibold"
                >
                  {assistants.map((ast) => (
                    <option key={ast.id} value={ast.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {ast.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                title="Create New Assistant"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>New Bot</span>
              </button>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Active Provider Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Active Engine:</span>
              <span className="text-blue-600 dark:text-blue-400 uppercase font-bold">
                {activeAssistant?.provider || 'OLLAMA'}
              </span>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span className="hidden sm:inline font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {/* Deploy / WordPress Plugin Button */}
            <button
              onClick={() => setShowEmbedModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Deploy &amp; WordPress</span>
            </button>
          </div>
        </header>

        {/* Main Shell (Sidebar + Content Workspace) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Enterprise Sidebar */}
          <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                  Management
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: FileCheck },
                    { id: 'knowledge', label: 'Knowledge Base', icon: Upload, count: sources.length },
                    { id: 'playground', label: 'Testing Studio', icon: MessageSquare },
                    { id: 'channels', label: 'Channels & Integrations', icon: Share2 },
                    { id: 'engine', label: 'AI Engine (BYOK)', icon: Cpu },
                    { id: 'behavior', label: 'Behavior & Rules', icon: Sliders },
                    { id: 'widget', label: 'Widget & Styling', icon: Palette },
                    { id: 'leads', label: 'Captured Leads', icon: Users, count: leads.length },
                    { id: 'docs', label: 'Guides & Docs', icon: BookOpen },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-mono ${
                              isActive
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Status Compliance Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Enterprise RAG</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">Ready</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Zero cloud embedding fees. 384-dim normalized vector cosine search.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span>KORTEX v2.0</span>
            </div>
          </aside>

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Welcome to {activeAssistant?.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your business assistant is ready. Train it on proprietary business files, configure rules, and embed it anywhere.
                    </p>
                  </div>
                </div>

                {/* Metric Stat Cards (Balanced Typography) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Articles</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sources.length} Documents
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+100% indexed</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vector Chunks</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {totalChunks} Chunks
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">384-dim BGE-Small</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Retrieval Mode</div>
                    <div className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      Hybrid RRF
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cosine + BM25 Keywords</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Embedding Cost</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      $0.00 / mo
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Local CPU Embeddings</div>
                  </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Upload Knowledge Documents</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload your product lists (CSV), contracts (PDF/DOCX), catalogues (JSON), or plain text. The local engine chunks and embeds them instantly for $0.
                    </p>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Go to Knowledge Base &rarr;
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Test Chat in Testing Studio</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Simulate customer questions. Verify citations, check accuracy on product pricing or terms, and test fallback behavior before launching.
                    </p>
                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Testing Studio &rarr;
                    </button>
                  </div>
                </div>

                {/* Embed Snippet Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Embed On Any Business Website (WordPress, Shopify, Webflow)</span>
                    </div>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
                        );
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !customEmbedHost.trim() && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-semibold text-amber-900 dark:text-amber-200">
                          Embedding on a live HTTPS website (e.g. WordPress)?
                        </span>
                        <p className="leading-relaxed">
                          Web browsers automatically block <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-amber-800 dark:text-amber-300 font-semibold">http://localhost:3000</code> on live HTTPS websites due to browser <strong>Mixed Content Security</strong>.
                        </p>
                        <p className="leading-relaxed">
                          To display the widget on a live site, deploy this app to a public HTTPS domain (e.g., <strong>Vercel</strong>, <strong>Railway</strong>) or use a secure HTTPS tunnel (like Cloudflare Tunnel or localtunnel), then enter your live URL in the field below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Server Host URL</span>
                      <span className="text-[11px] text-slate-400 font-normal">Leave blank to use current origin</span>
                    </label>
                    <input
                      type="url"
                      placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}
                      value={customEmbedHost}
                      onChange={(e) => setCustomEmbedHost(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste this snippet before the closing <code className="text-blue-600 dark:text-blue-400 font-mono">&lt;/body&gt;</code> tag on your website:
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-800">
                    &lt;script src=&quot;{(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/widget.js&quot; data-assistant=&quot;{activeAssistant?.id}&quot; defer&gt;&lt;/script&gt;
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Knowledge Base</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upload PDF, CSV, JSON, DOCX, and TXT files. Tabular files are converted into row-aware representations for exact price and detail matching.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (activeAssistant) fetchKnowledge(activeAssistant.id);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Sync Sources</span>
                  </button>
                </div>

                {/* Metric Stat Cards (Balanced Typography) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Articles</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sources.length} Documents
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+100% indexed</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vector Chunks</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {totalChunks} Chunks
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">384-dim BGE-Small</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Retrieval Mode</div>
                    <div className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      Hybrid RRF
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cosine + BM25 Keywords</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Embedding Cost</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      $0.00 / mo
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Local CPU Embeddings</div>
                  </div>
                </div>

                {/* Upload Failure Alert */}
                {uploadFailureAlert && (
                  <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 shadow-xs flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 dark:text-rose-200">
                          Upload Processing Failed: {uploadFailureAlert.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadFailureAlert(null)}
                          className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-rose-800 dark:text-rose-300 leading-relaxed">
                        <strong>Why it failed:</strong> {uploadFailureAlert.reason}
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/50 text-slate-700 dark:text-slate-300">
                        <strong className="text-rose-700 dark:text-rose-400">What you should do next:</strong>{' '}
                        {uploadFailureAlert.whatToDoNext}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Form */}
                <form
                  onSubmit={handleUploadFiles}
                  className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-xs"
                >
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Drop files here or click to browse
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Supports PDF, CSV tables, JSON catalogues, Word DOCX, TXT, Images, &amp; Video/Audio (MP4, MP3, WAV, M4A, WEBM)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.csv,.json,.docx,.txt,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mkv,.avi,.m4v,.3gp,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Selected {selectedFiles.length} file(s) for indexing
                      </div>
                    )}
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      Or Enter Raw Business Description / FAQs
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Section Title (e.g. Return Policy, Store Hours, Contact Info)"
                      value={uploadTextTitle}
                      onChange={(e) => setUploadTextTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Paste business instructions, FAQs, shipping details, or company background..."
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploading || ((!selectedFiles || selectedFiles.length === 0) && !uploadText.trim())}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-xs"
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

                {/* Import Knowledge from URL (YouTube, Video, Webpage) */}
                <form
                  onSubmit={handleImportUrl}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Import from YouTube, Webpage, or Media URL
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Grabs transcripts and knowledge in any language (English, Chinese, Spanish, etc.)
                        </p>
                      </div>
                    </div>

                    {urlInput.trim() && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        {/(?:youtube\.com|youtu\.be)/i.test(urlInput)
                          ? '🔴 YouTube Video'
                          : /\.(mp4|webm|mov|mkv|avi|mp3|wav|m4a|ogg|flac)$/i.test(urlInput.split('?')[0])
                          ? '🎥 Direct Media Stream'
                          : '🌐 Webpage Scraper'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="md:col-span-2">
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=... or https://yourcompany.com/about"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Custom Title (optional)"
                        value={urlCustomTitle}
                        onChange={(e) => setUrlCustomTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {urlFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        urlFeedback.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {urlFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                      <span>{urlFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isImportingUrl || !urlInput.trim()}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold disabled:opacity-50 transition shadow-xs cursor-pointer"
                    >
                      {isImportingUrl ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Fetching &amp; Indexing Knowledge...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          <span>Import Knowledge from URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Failed sources alert banner */}
                {sources.some((s) => s.status === 'failed') && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3.5 flex items-start gap-3 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-rose-900 dark:text-rose-200">
                        {sources.filter((s) => s.status === 'failed').length} file(s) failed to index.
                      </span>{' '}
                      Click <span className="font-semibold text-rose-600 dark:text-rose-400">"View Fix"</span> in the table below to see the exact reason and step-by-step instructions on what to do next.
                    </div>
                  </div>
                )}

                {/* Structured Enterprise Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Knowledge Sources</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({sources.length})</span>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search sources..."
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-48"
                      />
                    </div>
                  </div>

                  {filteredSources.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No documents found matching your filter.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-5">Document Name</th>
                          <th className="py-3 px-5">Type</th>
                          <th className="py-3 px-5">Chunks</th>
                          <th className="py-3 px-5">Status</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredSources.map((source) => (
                          <tr key={source.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                source.type === 'pdf'
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : source.type === 'csv'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : source.type === 'json'
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : source.type === 'youtube'
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : source.type === 'web'
                                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                                  : ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].includes(source.type.toLowerCase())
                                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                  : ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].includes(source.type.toLowerCase())
                                  ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              }`}>
                                {source.type === 'youtube'
                                  ? '🔴 YOUTUBE'
                                  : source.type === 'web'
                                  ? '🌐 WEB'
                                  : ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].includes(source.type.toLowerCase())
                                  ? '🎥 VIDEO'
                                  : ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].includes(source.type.toLowerCase())
                                  ? '🎙️ AUDIO'
                                  : source.type.toUpperCase()}
                              </span>
                              <span className="truncate max-w-[280px]" title={source.title}>{source.title}</span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                              {source.type}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                              {source.chunkCount} chunks
                            </td>
                            <td className="py-3.5 px-5">
                              {source.status === 'ready' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  Ready
                                </span>
                              )}
                              {source.status === 'processing' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                  Processing
                                </span>
                              )}
                              {source.status === 'failed' && (
                                <button
                                  type="button"
                                  onClick={() => setFailedSourceModal(source)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold text-[11px] hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                                  title="Click to view failure explanation & fix"
                                >
                                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                                  <span>Failed · View Fix</span>
                                </button>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {new Date(source.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={() => handleDeleteSource(source.id)}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition p-1 rounded"
                                title="Delete source"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TESTING STUDIO (SPLIT PANE) */}
            {activeTab === 'playground' && (
              <div className="h-full flex flex-col max-w-6xl space-y-4 mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Testing Studio</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Verify assistant responses and inspect retrieved knowledge chunks in real time.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setChatMessages([
                        {
                          role: 'assistant',
                          content: activeAssistant?.welcomeMessage || 'Hello! How can I assist you today?',
                        },
                      ])
                    }
                    className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs transition"
                  >
                    Clear Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                  {/* Chat Messenger (2 cols) */}
                  <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between overflow-hidden">
                    {/* Chat Messages */}
                    <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[460px]">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/60'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <MarkdownRenderer content={msg.content} />
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}

                            {/* Citations */}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                                <div className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Citations &amp; Sources:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.citations.map((c: any, ci: number) => {
                                    const st = (c.sourceType || '').toLowerCase();
                                    const stTitle = (c.sourceTitle || '').toLowerCase();
                                    const isYt = st === 'youtube' || stTitle.includes('youtube');
                                    const isWeb = st === 'web';
                                    const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                                    const isAud = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                                    const icon = isYt ? '🔴' : isWeb ? '🌐' : isVid ? '🎥' : isAud ? '🎙️' : st === 'pdf' || stTitle.endsWith('.pdf') ? '📄' : st === 'csv' || stTitle.endsWith('.csv') ? '📊' : '📝';
                                    return (
                                      <span
                                        key={ci}
                                        className={`border px-2 py-0.5 rounded text-[10px] font-mono ${
                                          isYt
                                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                            : isWeb
                                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                            : isVid
                                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : isAud
                                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                        }`}
                                        title={c.preview}
                                      >
                                        {icon} {c.sourceTitle}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isStreaming && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                          <span>Retrieving context &amp; generating streaming answer...</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Starter Pills */}
                    {activeAssistant?.starterQuestions && activeAssistant.starterQuestions.length > 0 && (
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                        {activeAssistant.starterQuestions.slice(0, 3).map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type a message to test your knowledge base..."
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isStreaming || !inputQuery.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>

                  {/* RAG Inspector Panel (1 col) */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">RAG Inspector</span>
                        <span className="text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          Connected
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Active AI Provider</label>
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white uppercase font-mono">{activeAssistant?.provider || 'Ollama'}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{activeAssistant?.modelName || 'llama3.2'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          Retrieved Fragments ({activeCitations.length})
                        </label>
                        {activeCitations.length === 0 ? (
                          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                            Ask a question to see retrieved knowledge chunks and citations here.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {activeCitations.map((c, i) => {
                              const st = (c.sourceType || '').toLowerCase();
                              const stTitle = (c.sourceTitle || '').toLowerCase();
                              const isYt = st === 'youtube' || stTitle.includes('youtube');
                              const isWeb = st === 'web';
                              const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'video'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const isAud = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'audio'].some((e) => st.includes(e) || stTitle.endsWith(`.${e}`));
                              const icon = isYt ? '🔴' : isWeb ? '🌐' : isVid ? '🎥' : isAud ? '🎙️' : st === 'pdf' || stTitle.endsWith('.pdf') ? '📄' : st === 'csv' || stTitle.endsWith('.csv') ? '📊' : '📝';
                              return (
                                <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                                  <div className="text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px] flex items-center gap-1.5">
                                    <span>[{i + 1}]</span>
                                    <span>{icon} {c.sourceTitle}</span>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 line-clamp-2">{c.preview}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                      <span>Vector Dims: <strong>384</strong></span>
                      <span>Embed Cost: <strong className="text-emerald-600 dark:text-emerald-400">$0.00</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AI ENGINE (BYOK) */}
            {activeTab === 'engine' && (
              <div className="max-w-4xl space-y-6 mx-auto">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Engine &amp; BYOK Configuration</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose between 100% free open-source models (Ollama local or Groq free tier) or connect customer-provided API keys (OpenAI, Anthropic, Gemini, DeepSeek).
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

                {/* Provider Selection Cards */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select AI Provider</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'groq', label: 'Groq Cloud', tag: '⚡ ULTRA-FAST (FREE)', desc: 'Instant sub-second Llama 3.3' },
                      { id: 'gemini', label: 'Google Gemini', tag: '⚡ FAST (FREE TIER)', desc: 'Gemini 1.5 & 2.0 Flash' },
                      { id: 'ollama', label: 'Local Ollama', tag: '100% FREE', desc: 'Runs on your PC CPU/GPU' },
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
                              groq: 'openai/gpt-oss-120b',
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
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{prov.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              prov.tag.includes('ULTRA-FAST')
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
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

                {/* Groq Callout */}
                {formData.provider === 'groq' && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <span>⚡ Recommended for Lightning Speed (~500+ tokens/sec)</span>
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded text-[10px]">100% Free Tier</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Groq runs open-source Llama 3 models on specialized LPU hardware with near-instant responses. Their free tier offers 14,400 requests/day at $0 cost (no credit card required).
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://console.groq.com/keys"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <span>Get Free Groq API Key (10 Seconds)</span>
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
                        <span>⚡ Sub-Second Speed with Google Gemini Flash</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-[10px]">Free Tier</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Google AI Studio provides 15 requests per minute completely free with Gemini 1.5 &amp; 2.0 Flash.
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

                {/* Ollama CPU Notice */}
                {formData.provider === 'ollama' && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-900 dark:text-amber-200">Local CPU Speed Note</p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                        Running local LLMs on a CPU (without an Nvidia GPU) typically runs at 2-4 tokens/sec, taking ~30-60 seconds per response.
                      </p>
                      <p className="text-amber-800 dark:text-amber-300 text-[11.5px]">
                        👉 <strong>For instant responses (1-2s):</strong> Switch to <strong>Groq Cloud</strong> above (free API key at console.groq.com) for 100x faster generation at $0 cost!
                      </p>
                    </div>
                  </div>
                )}

                {/* Engine Settings Box */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Model Identifier
                      </label>
                      <input
                        type="text"
                        value={formData.modelName || ''}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        placeholder="e.g. openai/gpt-oss-120b, qwen/qwen3.8-27b, gpt-4o-mini"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                      />
                      {(formData.provider || 'ollama') === 'groq' && (
                        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Groq Models:</span>
                          {[
                            { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
                            { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B (Ultra-Fast)' },
                            { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, modelName: m.id })}
                              className={`text-[10px] px-2 py-0.5 rounded border transition font-mono ${
                                formData.modelName === m.id
                                  ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 text-blue-800 dark:text-blue-300 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Temperature ({formData.temperature ?? 0.3})</span>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          {(formData.temperature ?? 0.3) <= 0.2 ? '🎯 Strict & Factual' : (formData.temperature ?? 0.3) <= 0.5 ? '⚖️ Balanced (Recommended)' : '🎨 Creative'}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.temperature ?? 0.3}
                        onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                        className="w-full mt-1 accent-blue-600"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Controls response randomness: <strong>0.0</strong> is strict & deterministic (zero hallucination, ideal for factual business support); <strong>0.3–0.5</strong> is natural & conversational; <strong>0.8+</strong> is creative.
                      </p>
                    </div>
                  </div>

                  {/* Performance Tuning Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Knowledge Context Chunks</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formData.contextChunks ?? 5} chunks</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={formData.contextChunks ?? 5}
                        onChange={(e) => setFormData({ ...formData, contextChunks: parseInt(e.target.value) })}
                        className="w-full mt-2 accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                        <span>Max Response Tokens</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formData.maxTokens ?? 2048} tokens</span>
                      </label>
                      <input
                        type="range"
                        min="250"
                        max="4096"
                        step="50"
                        value={formData.maxTokens ?? 2048}
                        onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                        className="w-full mt-2 accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Live Web Search Permission Toggle */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Allow Live Online Web Search</span>
                        {(formData.allowWebSearch ?? true) ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">ENABLED</span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded-full">DISABLED</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
                        When enabled, visitors can ask the bot to search the internet for fresh information in real-time. The bot automatically verifies and saves the new findings into this assistant's knowledge base.
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

                  {/* API Key input if not Ollama */}
                  {(formData.provider || 'ollama') !== 'ollama' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        {(formData.provider || '').toUpperCase()} API Key (BYOK)
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={formData.apiKeyEncrypted || ''}
                          onChange={(e) => setFormData({ ...formData, apiKeyEncrypted: e.target.value })}
                          placeholder="gsk_... or sk-..."
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ollama endpoint if Ollama */}
                  {(formData.provider || 'ollama') === 'ollama' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Ollama Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={formData.customBaseUrl || 'http://localhost:11434/v1'}
                        onChange={(e) => setFormData({ ...formData, customBaseUrl: e.target.value })}
                        placeholder="http://localhost:11434/v1"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                    >
                      {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Save Engine Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BEHAVIOR & RULES */}
            {activeTab === 'behavior' && (
              <div className="max-w-4xl space-y-6 mx-auto">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Behavior &amp; Guardrails</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Define how your assistant represents the business, its personality tone, and what it says when information is missing.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Behavior updated successfully!</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Template Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Personality Templates</label>
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
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition shadow-xs"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      System Instructions &amp; Role
                    </label>
                    <textarea
                      rows={5}
                      value={formData.systemPrompt || ''}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Welcome Message
                      </label>
                      <input
                        type="text"
                        value={formData.welcomeMessage || ''}
                        onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Fallback Message
                      </label>
                      <input
                        type="text"
                        value={formData.fallbackMessage || ''}
                        onChange={(e) => setFormData({ ...formData, fallbackMessage: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition shadow-xs"
                    >
                      {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Save Guardrails</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: WIDGET & STYLING */}
            {activeTab === 'widget' && (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Widget &amp; Branding</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Customize the chat launcher, brand colors, position, and lead capture settings for your website or WordPress plugin.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className={`flex items-center gap-2 self-start sm:self-auto rounded-lg px-4 py-2 text-xs font-semibold text-white transition shadow-xs disabled:opacity-50 ${
                      saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{isSaving ? 'Saving Settings...' : saveSuccess ? 'Saved Successfully!' : 'Save Widget Settings'}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Widget &amp; support settings saved successfully!</span>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Configuration controls */}
                  <div className="space-y-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                    {/* Brand Color */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
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
                              formData.primaryColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                            }`}
                          />
                        ))}
                        <input
                          type="text"
                          value={formData.primaryColor || '#2563eb'}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                        />
                      </div>
                    </div>

                    {/* Launcher Position */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Launcher Position
                      </label>
                      <div className="flex gap-3">
                        {['bottom-right', 'bottom-left'].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setFormData({ ...formData, launcherPosition: pos })}
                            className={`rounded-lg border px-4 py-2 text-xs font-semibold capitalize transition ${
                              formData.launcherPosition === pos
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {pos.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Starter Questions */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Lead Capture Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Lead Capture Form</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Ask visitor for email address during chat</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.collectLeadEmail || false}
                        onChange={(e) => setFormData({ ...formData, collectLeadEmail: e.target.checked })}
                        className="h-4 w-4 rounded accent-blue-600"
                      />
                    </div>

                    {/* Support Handoff & Email Notifications */}
                    <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>📧 Support Handoff &amp; Lead Email Alerts</span>
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          When visitors ask to connect with support, the widget displays a sleek form and immediately dispatches an email notification.
                        </p>
                      </div>

                      {/* Receiver Email */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Receiver Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. support@yourcompany.com"
                          value={formData.supportReceiverEmail || ''}
                          onChange={(e) => setFormData({ ...formData, supportReceiverEmail: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                          Support inquiries submitted by visitors are sent directly to this address.
                        </p>
                      </div>

                      {/* CC Emails */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          CC Notification Emails (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. alerts@company.com, team@company.com"
                          value={(formData.supportCcEmails || []).join(', ')}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              supportCcEmails: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                          Comma-separated list of additional team emails to CC on every lead/support alert.
                        </p>
                      </div>

                      {/* Form Custom Fields Builder */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Support Form Custom Fields
                            </span>
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                              Default: Name, Email, Phone (Required) &amp; Comments (Optional).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddFieldForm(!showAddFieldForm)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{showAddFieldForm ? 'Close' : 'Add Custom Field'}</span>
                          </button>
                        </div>

                        {/* Existing custom fields list */}
                        {(formData.supportCustomFields || []).length > 0 ? (
                          <div className="space-y-1.5">
                            {(formData.supportCustomFields || []).map((cf) => (
                              <div
                                key={cf.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cf.label}</span>
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {cf.type}
                                  </span>
                                  {cf.required ? (
                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-1.5 py-0.5 rounded">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 px-1 py-0.5">Optional</span>
                                  )}
                                  {cf.type === 'select' && cf.options && cf.options.length > 0 && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({cf.options.length} options)
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomField(cf.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                  title="Remove Field"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No custom fields added yet.</p>
                        )}

                        {/* Add Field Form */}
                        {showAddFieldForm && (
                          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-2.5 animate-in fade-in duration-150">
                            <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                              New Custom Field
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  Field Label *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Company Name"
                                  value={newFieldLabel}
                                  onChange={(e) => setNewFieldLabel(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  Field Type
                                </label>
                                <select
                                  value={newFieldType}
                                  onChange={(e) => setNewFieldType(e.target.value as any)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                >
                                  <option value="text">Single Line Text</option>
                                  <option value="textarea">Paragraph Textarea</option>
                                  <option value="tel">Phone / Number</option>
                                  <option value="select">Dropdown Select</option>
                                </select>
                              </div>
                            </div>

                            {newFieldType === 'select' && (
                              <div>
                                <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                                  Dropdown Options (comma-separated)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Billing, Technical Support, Sales"
                                  value={newFieldOptions}
                                  onChange={(e) => setNewFieldOptions(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={newFieldRequired}
                                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                                  className="rounded accent-blue-600"
                                />
                                <span>Required field</span>
                              </label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowAddFieldForm(false)}
                                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddCustomField}
                                  disabled={!newFieldLabel.trim()}
                                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                                >
                                  Add Field
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition shadow-xs disabled:opacity-50 ${
                          saveSuccess
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isSaving ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isSaving
                            ? 'Saving Settings...'
                            : saveSuccess
                            ? 'Saved Successfully!'
                            : 'Save Widget & Support Settings'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Live Preview Frame */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 p-6 shadow-xs">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 font-mono uppercase">
                      Live Widget Preview
                    </div>

                    {/* Simulated Widget Window */}
                    <div className="w-80 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                        className="p-3.5 text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            AI
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{formData.name || 'Business AI'}</div>
                            <div className="text-[10px] opacity-85 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span> Online
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 space-y-3 min-h-[220px]">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-bl-xs text-xs shadow-xs border border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 max-w-[85%]">
                          {formData.welcomeMessage || 'Hello! How can I assist you today?'}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {(formData.starterQuestions || []).slice(0, 2).map((q, i) => (
                            <div
                              key={i}
                              className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 font-medium shadow-2xs"
                            >
                              {q}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <div className="flex-1 text-xs text-slate-400 dark:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-full">
                          Ask a question...
                        </div>
                        <div
                          style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
                          className="h-7 w-7 rounded-full text-white flex items-center justify-center text-xs shadow-xs"
                        >
                          <Send className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CHANNELS & INTEGRATIONS */}
            {activeTab === 'channels' && (
              <div className="max-w-6xl space-y-8 mx-auto pb-12">
                {/* Header Section with Save Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Channels &amp; Integrations
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider">
                        Omnichannel v2.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Deploy your RAG AI Assistant across web, Telegram, WhatsApp, and dispatch real-time events to Zapier, Make.com, or custom CRMs.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {saveSuccess && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Saved Successfully</span>
                      </div>
                    )}
                    {saveError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{saveError}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Channel Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Web Widget Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Web Chat Widget
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Embedded &amp; Live</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active on web pages
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      <Globe className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Telegram Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Telegram Bot API
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.telegramBotEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.telegramBotEnabled ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
                        {formData.telegramBotToken ? 'Token Set' : 'Token Missing'}
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/40">
                      <SendHorizontal className="h-5 w-5" />
                    </div>
                  </div>

                  {/* WhatsApp Cloud Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        WhatsApp Cloud API
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.whatsappEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {formData.whatsappPhoneNumberId ? 'Phone ID Set' : 'Setup Required'}
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                      <Radio className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Webhooks & Zapier Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Zapier &amp; Webhooks
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{formData.webhookUrl ? 'Connected' : 'Inactive'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${formData.webhookUrl ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        {(formData.webhookEvents || ['lead.created']).length} Events Active
                      </div>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                      <Webhook className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* CHANNEL 1: TELEGRAM BOT CONNECTOR */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-900/50">
                        <SendHorizontal className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Telegram Bot Integration
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            Zero Cost
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Deploy a 24/7 autonomous Telegram assistant that answers questions from your knowledge base and captures leads.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.telegramBotEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, telegramBotEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.telegramBotEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Configuration Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Telegram Bot API Token <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showTelegramToken ? 'text' : 'password'}
                            placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                            value={formData.telegramBotToken || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, telegramBotToken: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTelegramToken(!showTelegramToken)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showTelegramToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Generated via <span className="font-semibold text-sky-600 dark:text-sky-400">@BotFather</span> on Telegram.
                        </p>
                      </div>

                      {/* Action buttons: Verify and Set Webhook */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleTelegramVerify}
                          disabled={telegramStatus.loading}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {telegramStatus.loading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-500" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                          )}
                          <span>Verify Bot Token</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleTelegramSetWebhook}
                          disabled={telegramWebhookStatus.loading || !formData.telegramBotToken}
                          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {telegramWebhookStatus.loading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                          <span>Register Live Webhook</span>
                        </button>
                      </div>

                      {/* Verification feedback box */}
                      {telegramStatus.tested && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            telegramStatus.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {telegramStatus.success && telegramStatus.botInfo ? (
                            <div className="space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Verified Bot: @{telegramStatus.botInfo.username}</span>
                              </div>
                              <p className="text-[11px] opacity-90 font-mono">
                                Name: {telegramStatus.botInfo.firstName} (ID: {telegramStatus.botInfo.id})
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                              <span>{telegramStatus.error || 'Token verification failed'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Webhook status message */}
                      {telegramWebhookStatus.message && (
                        <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                          <span>{telegramWebhookStatus.message}</span>
                        </div>
                      )}
                      {telegramWebhookStatus.error && (
                        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                          <span>{telegramWebhookStatus.error}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: 3-Step Setup Guide */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                        <span>Quick 60-Second Telegram Setup</span>
                      </div>
                      <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 list-decimal pl-4">
                        <li>
                          Open Telegram and search for <strong className="text-slate-900 dark:text-white">@BotFather</strong>.
                        </li>
                        <li>
                          Send <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">/newbot</code>, choose a bot display name and a username ending in <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">bot</code>.
                        </li>
                        <li>
                          Copy the token provided by @BotFather, paste it into the field on the left, and click <strong className="text-slate-900 dark:text-white">Register Live Webhook</strong>.
                        </li>
                      </ol>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Webhook URL: <span className="text-sky-600 dark:text-sky-400">{typeof window !== 'undefined' ? window.location.origin : ''}/api/channels/telegram</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHANNEL 2: WHATSAPP CLOUD API */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
                        <Radio className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            WhatsApp Cloud API (Meta Official)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Enterprise
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Direct integration with Meta Graph API for official business phone numbers with zero 3rd-party per-message fees.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.whatsappEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.whatsappEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: WhatsApp API Credentials */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Phone Number ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 109823485729104"
                          value={formData.whatsappPhoneNumberId || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsappPhoneNumberId: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          From Meta Developer App &gt; WhatsApp &gt; API Setup &gt; Phone number ID.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          System User Access Token <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showWhatsAppToken ? 'text' : 'password'}
                            placeholder="EAAB..."
                            value={formData.whatsappAccessToken || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, whatsappAccessToken: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showWhatsAppToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Meta Webhook Verify Token
                        </label>
                        <input
                          type="text"
                          placeholder="kortex_wa_token"
                          value={formData.whatsappVerifyToken || 'kortex_wa_token'}
                          onChange={(e) =>
                            setFormData({ ...formData, whatsappVerifyToken: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Right: Meta Webhook Setup Helper */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Meta App Dashboard Webhook Settings</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Paste these two values into <strong className="text-slate-900 dark:text-white">developers.facebook.com &gt; WhatsApp &gt; Configuration &gt; Callback URL</strong>:
                      </p>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Callback URL:
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/channels/whatsapp`}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/api/channels/whatsapp`
                                );
                                setCopiedWaWebhookUrl(true);
                                setTimeout(() => setCopiedWaWebhookUrl(false), 2500);
                              }}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="Copy Callback URL"
                            >
                              {copiedWaWebhookUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Verify Token:
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={formData.whatsappVerifyToken || 'kortex_wa_token'}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  formData.whatsappVerifyToken || 'kortex_wa_token'
                                );
                                setCopiedWaVerifyToken(true);
                                setTimeout(() => setCopiedWaVerifyToken(false), 2500);
                              }}
                              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="Copy Verify Token"
                            >
                              {copiedWaVerifyToken ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        Subscribed Webhook Field: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">messages</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTEGRATION 3: OUTBOUND WEBHOOK DISPATCHER (ZAPIER / MAKE / CRMS) */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
                        <Webhook className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Outbound Webhooks (Zapier, Make.com, n8n, CRMs)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Real-time Event Stream
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Automatically post captured leads and escalation alerts to external webhooks with HMAC SHA-256 signatures.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWebhookTestPing}
                      disabled={webhookTestStatus.loading || !formData.webhookUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {webhookTestStatus.loading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                      ) : (
                        <Activity className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>Send Live Test Ping</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Webhook URL & Secret */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Target Webhook URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://hooks.zapier.com/hooks/catch/... or https://hook.eu1.make.com/..."
                          value={formData.webhookUrl || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, webhookUrl: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Compatible with Zapier "Catch Hook", Make.com "Custom Webhook", n8n, Slack, or any backend HTTP endpoint.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Webhook Signing Secret (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type={showWebhookSecret ? 'text' : 'password'}
                            placeholder="whsec_..."
                            value={formData.webhookSecret || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, webhookSecret: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Included in the <code className="font-mono">X-Kortex-Signature</code> header as HMAC SHA-256 for payload verification.
                        </p>
                      </div>

                      {/* Event Subscriptions */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Dispatched Events
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.webhookEvents || ['lead.created']).includes('lead.created')}
                              onChange={(e) => {
                                const current = formData.webhookEvents || ['lead.created'];
                                const next = e.target.checked
                                  ? [...current, 'lead.created']
                                  : current.filter((x) => x !== 'lead.created');
                                setFormData({ ...formData, webhookEvents: next });
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-950 dark:border-slate-800"
                            />
                            <span><strong className="font-semibold">lead.created</strong> — Fired immediately whenever a visitor submits the contact/lead form</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.webhookEvents || []).includes('conversation.escalated')}
                              onChange={(e) => {
                                const current = formData.webhookEvents || ['lead.created'];
                                const next = e.target.checked
                                  ? [...current, 'conversation.escalated']
                                  : current.filter((x) => x !== 'conversation.escalated');
                                setFormData({ ...formData, webhookEvents: next });
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-950 dark:border-slate-800"
                            />
                            <span><strong className="font-semibold">conversation.escalated</strong> — Fired when a user requests human support assistance</span>
                          </label>
                        </div>
                      </div>

                      {/* Test Ping Result Box */}
                      {webhookTestStatus.tested && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            webhookTestStatus.success
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-1.5">
                              {webhookTestStatus.success ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                              )}
                              <span>
                                {webhookTestStatus.success ? 'Test Ping Received (200 OK)' : 'Ping Failed'}
                              </span>
                            </div>
                            {webhookTestStatus.latencyMs !== undefined && (
                              <span className="font-mono text-[11px] opacity-80">
                                {webhookTestStatus.latencyMs}ms latency
                              </span>
                            )}
                          </div>
                          {webhookTestStatus.error && (
                            <p className="mt-1 text-[11px] font-mono opacity-90">
                              {webhookTestStatus.error}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Sample JSON Payload Preview */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <FileCode className="h-3.5 w-3.5 text-amber-400" />
                          <span>Sample Outbound Payload</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">POST / JSON</span>
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "event": "lead.created",
  "assistantId": "${activeAssistant?.id || 'ast_123'}",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.io",
    "phone": "+1 (555) 234-5678",
    "notes": "Looking for enterprise bot deployment",
    "customData": {
      "companySize": "50-200"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* INTEGRATION 4: AGENCY WHITE-LABELING & RESELLER BRANDING */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900/50">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Agency White-Labeling &amp; Custom Branding
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            Reseller Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Sell chatbots under your agency brand. Remove default "Powered by Kortex AI" or replace with your custom branding and backlink.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.whiteLabelEnabled || false}
                        onChange={(e) =>
                          setFormData({ ...formData, whiteLabelEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                      <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formData.whiteLabelEnabled ? 'White-Label Enabled' : 'Default Branding'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Custom Branding Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Custom Agency Footer Text
                        </label>
                        <input
                          type="text"
                          disabled={!formData.whiteLabelEnabled}
                          placeholder="e.g. Powered by Apex Growth Agency (or leave blank for 100% unbranded)"
                          value={formData.customBrandingText || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, customBrandingText: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          If left blank with White-Label enabled, the widget footer will be completely clean and unbranded.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Custom Agency Link (URL)
                        </label>
                        <input
                          type="url"
                          disabled={!formData.whiteLabelEnabled || !formData.customBrandingText}
                          placeholder="https://apexsolutions.agency"
                          value={formData.customBrandingUrl || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, customBrandingUrl: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Clicking your agency text will open this URL in a new tab.
                        </p>
                      </div>
                    </div>

                    {/* Right: Live Visual Preview of the Widget Footer */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-center items-center space-y-4">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                        Live Widget Footer Preview
                      </div>
                      
                      {/* Mockup Chat Box Base */}
                      <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
                        {/* Fake Input Row */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-7 rounded-lg text-[11px] text-slate-400 flex items-center px-2.5">
                            Ask anything about our business...
                          </div>
                          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Send className="h-3 w-3" />
                          </div>
                        </div>

                        {/* The Actual Footer Branding Bar */}
                        <div className="py-2 px-4 bg-white dark:bg-slate-900 text-center text-[11px] text-slate-400 dark:text-slate-500">
                          {formData.whiteLabelEnabled ? (
                            formData.customBrandingText ? (
                              formData.customBrandingUrl ? (
                                <a
                                  href={formData.customBrandingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 dark:text-slate-300 font-medium hover:underline hover:text-blue-600"
                                >
                                  {formData.customBrandingText}
                                </a>
                              ) : (
                                <span>{formData.customBrandingText}</span>
                              )
                            ) : (
                              <span className="italic text-slate-300 dark:text-slate-600 text-[10px]">
                                (Completely Clean &amp; Unbranded)
                              </span>
                            )
                          ) : (
                            <span>
                              ⚡ Powered by{' '}
                              <span className="text-slate-600 dark:text-slate-300 font-medium underline">
                                Kortex AI
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 text-center">
                        {formData.whiteLabelEnabled
                          ? '✅ Client sees only your agency branding or zero platform badges.'
                          : 'ℹ️ Displays default platform branding.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Save Reminder */}
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      Remember to click <strong>Save Channel Settings</strong> above to apply your Telegram, WhatsApp, and Webhook tokens to the live bot.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: LEADS & INQUIRIES */}
            {activeTab === 'leads' && (
              <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Captured Leads &amp; Support Requests</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Inquiries, contact info, and custom field data submitted by visitors via the chat widget.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Sync Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleManualSyncLeads}
                      disabled={isSyncingLeads}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                      title="Fetch newest leads right now"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLeads ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                      <span>{isSyncingLeads ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const csvHeader = 'ID,Name,Email,Phone,Comments,Custom Fields,Date\n';
                        const csvRows = leads
                          .map((l) => {
                            const customStr = l.customData
                              ? Object.entries(l.customData)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' | ')
                              : '';
                            return `"${l.id}","${(l.name || '').replace(/"/g, '""')}","${l.email}","${(l.phone || '').replace(/"/g, '""')}","${(l.notes || '').replace(/"/g, '""')}","${customStr.replace(/"/g, '""')}","${l.createdAt}"`;
                          })
                          .join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leads-${activeAssistant?.name || 'export'}.csv`;
                        a.click();
                      }}
                      disabled={leads.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  {leads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No leads or support requests captured yet. When visitors use the support form in the widget, submissions will appear here.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-5">Visitor Contact</th>
                          <th className="py-3 px-5">Phone</th>
                          <th className="py-3 px-5">Comments / Notes</th>
                          <th className="py-3 px-5">Custom Fields</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leads.map((lead) => {
                          const customEntries = lead.customData ? Object.entries(lead.customData) : [];
                          return (
                            <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-5">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {lead.name || 'Website Visitor'}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                                  {lead.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">
                                {lead.phone || '—'}
                              </td>
                              <td className="py-3.5 px-5 max-w-[200px]">
                                {lead.notes ? (
                                  <span className="text-slate-600 dark:text-slate-400 line-clamp-2" title={lead.notes}>
                                    {lead.notes}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                {customEntries.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                                    {customEntries.map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                      >
                                        <strong className="font-medium mr-1">{k}:</strong> {String(v)}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {new Date(lead.createdAt).toLocaleDateString()}{' '}
                                <span className="text-[10px] opacity-75">
                                  {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLeadModal(lead)}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2.5 py-1 rounded transition cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* TAB: GUIDES & DOCS */}
            {activeTab === 'docs' && (
              <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Guides &amp; Documentation
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Step-by-step guides to set up integrations, train your AI, and get the most out of Kortex AI.
                  </p>
                </div>

                {/* Section: Getting Started */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    🚀 Getting Started
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Training Your AI with Data',
                        badge: 'Core',
                        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                        steps: [
                          'Go to Knowledge Base in the sidebar.',
                          'Click "Upload File" — supports PDF, CSV, DOCX, TXT, PNG/JPG images.',
                          'Or paste a URL / YouTube link to extract content automatically.',
                          'Wait for status to turn "Ready" (green). This means the AI has indexed the data.',
                          'Test it instantly in Testing Studio by asking questions.',
                        ],
                        tip: 'For large datasets, use CSV files with column headers. The AI understands tabular data like member lists, product catalogs, and FAQs.',
                      },
                      {
                        title: 'Embedding the Widget on Your Site',
                        badge: 'Setup',
                        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                        steps: [
                          'Go to Widget & Styling → click "Embed on Your Site".',
                          'Copy the one-line <script> tag shown in the modal.',
                          'Paste it before the </body> tag on any HTML page.',
                          'For WordPress: use a plugin like "Insert Headers and Footers" to paste the script.',
                          'For Webflow/Framer: paste in "Custom Code" → Before </body>.',
                        ],
                        tip: 'The widget loads asynchronously — it won\'t slow down your page. Works on any site.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{guide.title}</h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <span className="text-base leading-none">💡</span>
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Integrations */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    🔌 Integrations
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Connect WhatsApp',
                        badge: 'WhatsApp Cloud API',
                        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                        steps: [
                          'Go to Meta for Developers → create a new app → choose "Business" type.',
                          'Add the WhatsApp product to your app.',
                          'Under WhatsApp → Getting Started: copy your Phone Number ID and temporary Access Token.',
                          'In Kortex → Channels & Integrations → WhatsApp, paste both values.',
                          'Set the Verify Token to any string you choose (e.g. "kortex2024").',
                          'In Meta Dashboard → WhatsApp → Configuration, set Webhook URL to the one shown in Kortex and use your same Verify Token.',
                          'Subscribe to the "messages" webhook field and click Verify.',
                          'Enable WhatsApp in Kortex and save.',
                        ],
                        tip: 'Use a permanent System User token for production instead of the temporary token which expires.',
                      },
                      {
                        title: 'Connect Telegram',
                        badge: 'Telegram Bot API',
                        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                        steps: [
                          'Open Telegram and search for @BotFather.',
                          'Send /newbot and follow the prompts to name your bot.',
                          'BotFather gives you a Bot Token — copy it.',
                          'Go to Kortex → Channels & Integrations → Telegram Bot.',
                          'Paste your Bot Token and click "Test Connection" to verify it works.',
                          'Click "Set Webhook" — this connects Telegram to your Kortex assistant.',
                          'Enable the bot and save. Users can now chat your AI via Telegram.',
                        ],
                        tip: 'Your Telegram bot is public by default. Consider setting /setprivacy with BotFather to control group access.',
                      },
                      {
                        title: 'Outbound Webhooks',
                        badge: 'Automation',
                        badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
                        steps: [
                          'Go to Channels & Integrations → Outbound Webhooks.',
                          'Enter your endpoint URL (e.g. a Zapier Webhook, Make.com, or your own server).',
                          'Set a Webhook Secret — this signs each request with HMAC SHA-256 for security.',
                          'Select which events to send: Lead Captured, Message Sent, etc.',
                          'Click "Send Test Ping" to verify your endpoint receives data.',
                          'Save. Every matching event will now POST JSON to your URL.',
                        ],
                        tip: 'Verify the X-Kortex-Signature header on your receiving server to prevent spoofed requests.',
                      },
                      {
                        title: 'White-Label / Agency Branding',
                        badge: 'Agency',
                        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        steps: [
                          'Go to Channels & Integrations → White-Label Agency Branding.',
                          'Toggle "Enable White-Label" to ON.',
                          'Enter your brand name (e.g. "Powered by Acme AI") in Custom Branding Text.',
                          'Enter your brand URL for the clickable link.',
                          'Save — the widget footer now shows your brand instead of Kortex AI.',
                        ],
                        tip: 'You can leave the URL blank to disable the link and just show your brand text.',
                      },
                    ].map((guide) => (
                      <div
                        key={guide.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                            {guide.badge}
                          </span>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{guide.title}</h3>
                        </div>
                        <ol className="space-y-1.5 mb-3">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        {guide.tip && (
                          <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-2.5">
                            <span className="text-base leading-none">💡</span>
                            <span>{guide.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: AI & Knowledge Tips */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    🧠 AI & Knowledge Tips
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        icon: '📄',
                        title: 'Best File Formats',
                        body: 'PDFs and CSVs give the best accuracy. For member data, use a CSV with headers like Name, Email, DOB, Plan. Avoid scanned images when possible — use real text PDFs.',
                      },
                      {
                        icon: '🎯',
                        title: 'Writing a Good System Prompt',
                        body: 'Be specific: tell the AI its role ("You are a support agent for Acme Gym"), what it should and shouldn\'t answer, and what tone to use. Short and clear beats long and vague.',
                      },
                      {
                        icon: '🔄',
                        title: 'Re-training After Updates',
                        body: 'After updating source material (new FAQ, updated policy), delete the old knowledge source and re-upload the new file. The AI uses what\'s indexed — stale data = stale answers.',
                      },
                      {
                        icon: '🌐',
                        title: 'Adding Web Pages',
                        body: 'Use the URL field to scrape any public webpage — product pages, terms, about pages. Works best on pages without JavaScript-rendered content (static HTML).',
                      },
                      {
                        icon: '🎥',
                        title: 'YouTube Transcripts',
                        body: 'Paste a YouTube URL to extract the video transcript. Great for indexing explainer videos, tutorials, and interviews. Only works if captions are available on the video.',
                      },
                      {
                        icon: '🖼️',
                        title: 'Image Text (OCR)',
                        body: 'Upload PNG/JPG files — the AI extracts printed text from the image. Works best on clear, high-contrast text. Handwritten notes and low-quality scans may not extract well.',
                      },
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
                      >
                        <div className="text-2xl mb-2">{card.icon}</div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs mb-1.5">{card.title}</h4>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">{card.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Lead Capture */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> Setting Up Lead Capture
                  </h3>
                  <ol className="space-y-2">
                    {[
                      'Go to Behavior & Rules → Lead Capture section.',
                      'Toggle "Collect Lead Email" to ON.',
                      'Enter the Receiver Email — this is who gets notified when a lead submits their info.',
                      'Optionally add CC emails (comma-separated) for your team.',
                      'Add Custom Form Fields if you need more than just name/email/phone (e.g. "Company", "Budget", "Membership Plan").',
                      'Save Settings. The widget will now show a contact form when visitors express interest.',
                      'View all captured leads in the Captured Leads tab.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>
            )}

          </main>
        </div>

        {/* MODAL: NEW ASSISTANT */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Business Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create an isolated assistant with its own knowledge base, prompt instructions, and website widget.
              </p>
              <form onSubmit={handleCreateAssistant} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assistant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Specialist, Store Support AI"
                    value={newAssistantName}
                    onChange={(e) => setNewAssistantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
                  >
                    Create Assistant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FILE FAILURE DIAGNOSTIC & WHAT TO DO NEXT */}
        {failedSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      File Indexing Diagnostic
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm" title={failedSourceModal.title}>
                      {failedSourceModal.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFailedSourceModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Cards */}
              {(() => {
                const diag = diagnoseKnowledgeFailure({
                  filename: failedSourceModal.title,
                  type: failedSourceModal.type,
                  errorMessage: failedSourceModal.errorMessage,
                  fileSizeBytes: failedSourceModal.fileSizeBytes,
                });
                return (
                  <div className="space-y-3.5 text-xs">
                    {/* Card 1: Why it failed */}
                    <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Why This File Failed:
                      </div>
                      <p className="text-rose-900 dark:text-rose-200 leading-relaxed">
                        {diag.reason}
                      </p>
                    </div>

                    {/* Card 2: What you should do next */}
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        What You Should Do Next:
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {diag.whatToDoNext}
                      </p>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <div>
                        Type: <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">{failedSourceModal.type}</span>
                      </div>
                      {failedSourceModal.fileSizeBytes && (
                        <div>
                          Size: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(failedSourceModal.fileSizeBytes)}</span>
                        </div>
                      )}
                      <div>
                        Logged: <span className="text-slate-700 dark:text-slate-200">{new Date(failedSourceModal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Technical details accordion */}
                    {failedSourceModal.errorMessage && (
                      <details className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <summary className="cursor-pointer font-semibold hover:text-slate-800 dark:hover:text-slate-200">
                          View Technical Log Details
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {failedSourceModal.errorMessage}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={async () => {
                    await handleDeleteSource(failedSourceModal.id);
                    setFailedSourceModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Failed Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFailedSourceModal(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EMBED & DEPLOY */}
        {showEmbedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Deploy on Website &amp; WordPress</h2>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
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
{`<script src="${(customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '')}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`}
                    </pre>
                    <button
                      onClick={() => {
                        const effectiveHost = (customEmbedHost.trim() || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com')).replace(/\/+$/, '');
                        navigator.clipboard.writeText(
                          `<script src="${effectiveHost}/widget.js" data-assistant="${activeAssistant?.id}" defer></script>`
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
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Option 2: 1-Click WordPress Plugin</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                    The standalone plugin is included in your repository at <code className="text-slate-700 dark:text-slate-300 font-mono">wordpress/ai-business-assistant/</code>.
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    <li>Zip the <code className="font-mono">ai-business-assistant</code> folder and upload to WordPress Admin &rarr; Plugins &rarr; Add New.</li>
                    <li>Activate the plugin and open <code className="font-mono">AI Assistant</code> settings in the WordPress menu.</li>
                    <li>Set Server URL to <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</code> and Assistant ID to <code className="font-mono">{activeAssistant?.id}</code>.</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW LEAD DETAILS */}
        {selectedLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLeadModal.name || 'Website Visitor'}
                    </h2>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {selectedLeadModal.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Phone Number</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedLeadModal.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">Submission Date</div>
                    <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(selectedLeadModal.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                {selectedLeadModal.customData && Object.keys(selectedLeadModal.customData).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Custom Fields
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      {Object.entries(selectedLeadModal.customData).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5 last:border-none last:pb-0">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">{key}:</span>
                          <span className="font-medium text-slate-900 dark:text-white font-mono">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visitor Comments */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Visitor Comments / Message
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedLeadModal.notes || <span className="text-slate-400 italic">No additional comments provided.</span>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedLeadModal.email}?subject=Re:%20Support%20Inquiry%20via%20${encodeURIComponent(activeAssistant?.name || 'AI Assistant')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <span>Reply Email</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {selectedLeadModal.phone && (
                    <a
                      href={`tel:${selectedLeadModal.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition"
                    >
                      <span>Call</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
