'use client';

import { T } from '@/lib/i18n/context';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  X,
  ExternalLink,
  Lightbulb,
  FileText,
  Target,
  RefreshCw,
  Globe,
  Eye,
  ClipboardList,
  Sparkles,
  Layers,
  Calendar,
  MessageSquare,
  Headphones,
  ShieldCheck,
  Zap,
  Sliders,
  Palette,
  Send,
  HelpCircle,
  Tag,
  Clock,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Share2,
  Shield,
  Building,
} from 'lucide-react';
import BLOG_META_RAW from '@/lib/blog/meta.json';

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  datePublished: string;
  readMinutes: number;
  tags?: string[];
  clusterName?: string;
  clusterId?: number;
  primaryKeyword?: string;
}

export interface DocsTabProps {
  setActiveTab?: (tab: any) => void;
}

export const DocsTab: React.FC<DocsTabProps> = ({ setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(18);

  const blogArticles: BlogArticle[] = useMemo(() => {
    return (BLOG_META_RAW as any[]) || [];
  }, []);

  // Core Product Implementation Guides
  const coreGuides = useMemo(() => [
    {
      id: 'knowledge-base',
      title: 'Training Your AI with Knowledge Base Data',
      category: 'Core Setup',
      badge: 'Core',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      icon: Layers,
      steps: [
        'Navigate to Knowledge Base in the left sidebar.',
        'Click "Upload File" — supports PDF, CSV, DOCX, TXT, and PNG/JPG images.',
        'Or paste a website URL to automatically crawl and extract public page content.',
        'Wait for the status indicator to turn "Ready" (green), confirming the AI has vectorized and indexed your content.',
        'Test questions immediately in the Testing Studio to verify high-accuracy citations.',
      ],
      tip: 'For complex catalogs or member lists, use CSV files with clear column headers (e.g. Plan, Price, Features, FAQs).',
      targetTab: 'knowledge',
      actionLabel: 'Open Knowledge Base',
    },
    {
      id: 'widget-embed',
      title: 'Embedding the Chat Widget on Your Website',
      category: 'Widget & Styling',
      badge: 'Setup',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: Palette,
      steps: [
        'Go to Widget & Styling in the sidebar.',
        'Customize your brand accent color, chat title, avatar, and launcher position.',
        'Click "Save Settings" and copy the 1-line <script> tag provided in the embed box.',
        'Paste the script directly before the closing </body> tag on any website HTML page.',
        'For WordPress: use our native WordPress plugin (crescelo) or an Insert Headers & Footers plugin.',
        "For Webflow, Framer, Wix, or Shopify: paste in your site's Custom Code footer block.",
      ],
      tip: 'The widget script loads asynchronously with "defer", ensuring zero impact on your website Core Web Vitals (CWV) or page speed.',
      targetTab: 'widget',
      actionLabel: 'Open Widget Settings',
    },
    {
      id: 'appointment-booking',
      title: 'Interactive Calendar & Appointment Booking',
      category: 'Booking & Scheduling',
      badge: 'Conversion',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      icon: Calendar,
      steps: [
        'In Widget & Styling, scroll down to "Interactive Calendar & Appointment Booking" and toggle ON.',
        'Choose your booking provider: Direct Date Picker, Calendly, or Cal.com.',
        'If using Direct Picker, configure daily working hours (e.g. 09:00 to 17:00), slot duration (15m, 30m, 1h), and active days.',
        'When visitors ask about scheduling, consultations, or tours, the AI automatically dispatches an interactive calendar card inside the chat.',
        'View and manage all booked appointments with contact details in the Appointments tab.',
      ],
      tip: 'Syncs automatically across your dashboard and triggers immediate confirmation emails to both you and the customer.',
      targetTab: 'appointments',
      actionLabel: 'Manage Appointments',
    },
    {
      id: 'lead-capture',
      title: 'Lead Capture Forms & Real-time Email Alerts',
      category: 'Lead Generation',
      badge: 'Growth',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      icon: ClipboardList,
      steps: [
        'Open Widget & Styling → scroll to "Lead Capture Form" and enable the toggle.',
        'Enter your Receiver Email Address (where inquiries will be routed).',
        'Add CC Notification Emails (comma-separated) to keep your sales and support teams in the loop.',
        'Add Custom Fields (e.g. "Company", "Service Requested", "Budget") to qualify leads before handoff.',
        'Every lead captured is instantly emailed to you and saved to the Captured Leads tab.',
      ],
      tip: 'The AI dynamically prompts for contact information when high intent is detected (e.g. asking for quotes or pricing).',
      targetTab: 'leads',
      actionLabel: 'View Captured Leads',
    },
    {
      id: 'whatsapp-integration',
      title: 'Connecting WhatsApp Cloud API',
      category: 'Channels & Integrations',
      badge: 'WhatsApp',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      icon: MessageSquare,
      steps: [
        'Go to Meta for Developers and create a Business App with the WhatsApp product.',
        'Under WhatsApp → Getting Started, copy your Phone Number ID and Access Token.',
        'In Crescelo → Channels & Integrations → select WhatsApp from the dropdown.',
        'Paste your Phone Number ID and Access Token, and enter your chosen Verify Token.',
        'In Meta Dashboard → WhatsApp Configuration, paste the Webhook Callback URL shown in Crescelo and verify.',
        'Subscribe to the "messages" field to activate 24/7 AI WhatsApp responses.',
      ],
      tip: 'For production, create a permanent System User token in Meta Business Manager to avoid 24-hour token expiration.',
      targetTab: 'channels',
      actionLabel: 'Open Channels',
    },
        {
      id: 'instagram-integration',
      title: 'Connecting Instagram Direct & Ads',
      category: 'Channels & Integrations',
      badge: 'Instagram',
      badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
      icon: MessageSquare,
      steps: [
        'Switch your Instagram account to a Professional (Business/Creator) account in the Instagram app.',
        'Connect your Instagram account to your Facebook Page in Settings > Creator/Business Tools.',
        'In Instagram app > Message Controls > Connected Tools, toggle ON "Allow access to messages".',
        'In Meta for Developers, create a Business App and add Messenger / Instagram Graph API.',
        'Generate a System User token with permissions: instagram_basic and instagram_manage_messages.',
        'In Crescelo → Channels & Integrations → select Instagram Direct, and paste your Account ID, Access Token, and Verify Token.',
        'Set your Webhook Callback URL in Meta Developer Dashboard and subscribe to "messages" and "messaging_postbacks".',
        'Click-to-Instagram Direct Ads will now automatically route inquiries with ad context to your AI assistant!',
      ],
      tip: 'When running Instagram Ads, any lead clicking "Send Message" automatically passes referral metadata so the AI knows the exact promotion they saw.',
      targetTab: 'channels',
      actionLabel: 'Open Channels',
    },
    {
      id: 'tiktok-integration',
      title: 'Connecting TikTok Direct Messages & Ads',
      category: 'Channels & Integrations',
      badge: 'TikTok',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
      icon: MessageSquare,
      steps: [
        'Switch your TikTok account to a Business Account in TikTok app > Settings & Privacy > Account.',
        'Register on developers.tiktok.com and create a Business App with Direct Messaging permissions.',
        'Link your TikTok Business Center account to manage ads and messaging assets.',
        'Generate a Long-Lived Access Token with im and business.message permissions.',
        'In Crescelo → Channels & Integrations → select TikTok Direct, and paste your Account ID, Access Token, and Verify Token.',
        'Set your Webhook Callback URL in TikTok Developer Dashboard and subscribe to im.message.receive.',
        'Direct messages from profile visits and Click-to-Message TikTok Ads will now be answered 24/7 by AI!',
      ],
      tip: 'TikTok Spark Ads and Direct Message Ads pass campaign referral details so the AI responds with the exact offer or product seen in the video.',
      targetTab: 'channels',
      actionLabel: 'Open Channels',
    },
    {
      id: 'telegram-bot',
      title: 'Connecting Telegram Bot API',
      category: 'Channels & Integrations',
      badge: 'Telegram',
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
      icon: Send,
      steps: [
        'Open Telegram and start a chat with @BotFather.',
        'Send /newbot and follow instructions to name your bot and pick a username.',
        'Copy the HTTP API Bot Token provided by BotFather.',
        'In Crescelo → Channels & Integrations → select Telegram from the dropdown.',
        'Paste your Bot Token, click "Test Connection", and click "Set Webhook".',
        'Your bot will now answer customer questions in Telegram around the clock.',
      ],
      tip: 'Use @BotFather command /setprivacy to control whether the bot reads all messages or only direct mentions in groups.',
      targetTab: 'channels',
      actionLabel: 'Open Channels',
    },
    {
      id: 'outbound-webhooks',
      title: 'Outbound Webhooks & CRM Integration',
      category: 'Automation',
      badge: 'API',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
      icon: Zap,
      steps: [
        'In Channels & Integrations, select Outbound Webhooks.',
        'Enter your destination URL (e.g. Zapier Webhook, Make.com, or your API server).',
        'Set a Webhook Secret — used to cryptographically sign every payload with HMAC SHA-256.',
        'Select target events: Lead Captured, Appointment Booked, New Conversation, etc.',
        'Click "Send Test Ping" to verify payload receipt and click Save.',
      ],
      tip: 'Verify the X-Crescelo-Signature header on your receiving server to prevent unauthorized spoofing.',
      targetTab: 'channels',
      actionLabel: 'Configure Webhooks',
    },
    {
      id: 'live-takeover',
      title: 'Human Escalation & Live Agent Takeover',
      category: 'Customer Experience',
      badge: 'Live Support',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      icon: Headphones,
      steps: [
        'When a visitor requests human assistance, the conversation flags "Waiting for Agent" with an audible chime.',
        'In Chat History, click "Take Over Chat" (via the three-dots action menu or banner) to pause the AI.',
        'Type your response in the bottom Live Operator composer and press Enter.',
        'Send interactive appointment booking cards or quick replies with one click.',
        'When done, click "Hand Back to AI" or "Mark Resolved" to return control.',
      ],
      tip: 'Download full conversation audit logs anytime using the three-dots menu to inspect tool traces and token usage.',
      targetTab: 'history',
      actionLabel: 'Open Chat History',
    },
    {
      id: 'figure-guard',
      title: 'FigureGuard AI Firewall & Anti-Hallucination',
      category: 'AI Security',
      badge: 'Security',
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      icon: ShieldCheck,
      steps: [
        'Crescelo includes FigureGuard, a strict factual verification layer built directly into the inference pipeline.',
        'FigureGuard prevents the AI from inventing unauthorized pricing, fabricated discounts, or false promises.',
        'Ensure all official prices, terms, and refund policies are explicitly documented in your Knowledge Base files.',
        'If a customer asks about a price not present in your documents, the AI gracefully declines and offers human escalation.',
      ],
      tip: 'Use Behavior & Rules to further specify custom system instructions and tone of voice.',
      targetTab: 'behavior',
      actionLabel: 'Behavior & Rules',
    },
    {
      id: 'white-label',
      title: 'White-Label Agency Reseller Branding',
      category: 'Agency & White-Label',
      badge: 'Agency',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      icon: Shield,
      steps: [
        'Go to Channels & Integrations → select White-Label Agency Branding.',
        'Toggle "Enable White-Label" to ON.',
        'Enter your custom agency or brand name in "Custom Branding Text" (e.g. "Powered by Apex Digital").',
        'Enter your website URL for the clickable branding link.',
        'Click Save. The widget footer and notification emails will now show your brand name instead of Crescelo.',
      ],
      tip: 'Leave the brand URL empty if you prefer an unclickable clean text copyright line.',
      targetTab: 'channels',
      actionLabel: 'White-Label Branding',
    },
    {
      id: 'multilingual-bot',
      title: 'Multilingual Auto-Detection & Dual Language Support',
      category: 'Internationalization',
      badge: 'Multilingual',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
      icon: Globe,
      steps: [
        "Crescelo automatically identifies the visitor's language (Spanish, French, German, Arabic, Urdu, etc.) on the very first turn.",
        "The AI answers natively in the user's language without requiring manual language switchers.",
        'Add translated FAQ documents into the Knowledge Base for region-specific phrasing and local terminology.',
        'Language detection badges and transcripts in Chat History display the detected language for each session.',
      ],
      tip: 'The AI automatically respects Right-to-Left (RTL) text formatting for Arabic and Urdu customers.',
      targetTab: 'history',
      actionLabel: 'Inspect Languages',
    },
  ], []);

  // Filter categories
  const categories = useMemo(() => [
    { id: 'all', label: 'All Guides & Articles' },
    { id: 'core', label: 'Core Platform Guides' },
    { id: 'chatbots', label: 'AI Website Chatbots' },
    { id: 'booking', label: 'Appointment Booking' },
    { id: 'leads', label: 'Lead Generation' },
    { id: 'rag', label: 'Knowledge & RAG' },
    { id: 'local', label: 'Local & Home Services' },
    { id: 'salons', label: 'Barbers & Salons' },
    { id: 'health', label: 'Healthcare & Clinics' },
    { id: 'integrations', label: 'Channels & Integrations' },
  ], []);

  // Filtered Core Guides
  const filteredCoreGuides = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'core') {
      if (selectedCategory === 'chatbots') return coreGuides.filter(g => ['knowledge-base', 'widget-embed'].includes(g.id));
      if (selectedCategory === 'booking') return coreGuides.filter(g => ['appointment-booking'].includes(g.id));
      if (selectedCategory === 'leads') return coreGuides.filter(g => ['lead-capture'].includes(g.id));
      if (selectedCategory === 'rag') return coreGuides.filter(g => ['knowledge-base', 'figure-guard'].includes(g.id));
      if (selectedCategory === 'integrations') return coreGuides.filter(g => ['whatsapp-integration', 'instagram-integration', 'tiktok-integration', 'telegram-bot', 'outbound-webhooks', 'white-label'].includes(g.id));
      return [];
    }
    if (!searchQuery.trim()) return coreGuides;
    const q = searchQuery.toLowerCase().trim();
    return coreGuides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.steps.some(s => s.toLowerCase().includes(q)) ||
      (g.tip && g.tip.toLowerCase().includes(q))
    );
  }, [coreGuides, selectedCategory, searchQuery]);

  // Filtered Blog Articles
  const filteredArticles = useMemo(() => {
    return blogArticles.filter((art) => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'core') return false; // Core tab only shows core guides
        const cluster = (art.clusterName || '').toLowerCase();
        const title = (art.title || '').toLowerCase();
        const tags = (art.tags || []).map(t => t.toLowerCase()).join(' ');

        if (selectedCategory === 'chatbots' && !cluster.includes('chatbot') && !title.includes('chatbot') && !tags.includes('chatbot')) return false;
        if (selectedCategory === 'booking' && !cluster.includes('booking') && !title.includes('booking') && !title.includes('calendar') && !title.includes('appointment')) return false;
        if (selectedCategory === 'leads' && !cluster.includes('lead') && !title.includes('lead') && !title.includes('conversion')) return false;
        if (selectedCategory === 'rag' && !cluster.includes('rag') && !cluster.includes('knowledge') && !title.includes('knowledge') && !title.includes('hallucination')) return false;
        if (selectedCategory === 'local' && !cluster.includes('home') && !cluster.includes('local') && !cluster.includes('contractor') && !cluster.includes('roofing')) return false;
        if (selectedCategory === 'salons' && !cluster.includes('barber') && !cluster.includes('salon') && !title.includes('salon') && !title.includes('barber')) return false;
        if (selectedCategory === 'health' && !cluster.includes('dental') && !cluster.includes('clinic') && !title.includes('dental') && !title.includes('medical') && !title.includes('spa')) return false;
        if (selectedCategory === 'integrations' && !cluster.includes('integration') && !cluster.includes('comparison') && !title.includes('zapier') && !title.includes('calendar') && !title.includes('byok')) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = art.title.toLowerCase().includes(q);
        const inDesc = (art.description || '').toLowerCase().includes(q);
        const inExcerpt = (art.excerpt || '').toLowerCase().includes(q);
        const inCluster = (art.clusterName || '').toLowerCase().includes(q);
        const inKeyword = (art.primaryKeyword || '').toLowerCase().includes(q);
        const inTags = (art.tags || []).some(t => t.toLowerCase().includes(q));

        if (!inTitle && !inDesc && !inExcerpt && !inCluster && !inKeyword && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [blogArticles, selectedCategory, searchQuery]);

  const totalResults = filteredCoreGuides.length + filteredArticles.length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span><T>Guides &amp; Documentation Library</T></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            <T>Search step-by-step setup walkthroughs, architectural documentation, and 300+ industry automation playbooks.</T>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            {coreGuides.length} <T>System Guides</T> &bull; {blogArticles.length} <T>Articles</T>
          </span>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(18);
            }}
            placeholder="Search across all 300+ guides, tutorials, setup walkthroughs, and blogs..."
            className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setVisibleCount(18);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-[#abff44] text-[#08251a] border border-[#08251a]/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            {searchQuery.trim()
              ? `Found ${totalResults} results matching "${searchQuery}"`
              : `Showing ${totalResults} guides & articles`}
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setVisibleCount(18);
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              <T>Reset all filters</T>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {totalResults === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white"><T>No Guides Found</T></h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            <T>We could not find any guides matching your query. Try searching for &quot;booking&quot;, &quot;whatsapp&quot;, &quot;leads&quot;, or &quot;embedding&quot;.</T>
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span><T>Show All 300+ Guides</T></span>
          </button>
        </div>
      )}

      {/* SECTION 1: Core System Step-by-Step Guides */}
      {filteredCoreGuides.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <T>Core System Walkthroughs</T> ({filteredCoreGuides.length})
              </h2>
            </div>
            {selectedCategory === 'all' && (
              <span className="text-[11px] text-slate-400">
                <T>Step-by-step interactive instructions</T>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCoreGuides.map((guide) => {
              const IconComp = guide.icon || FileText;
              return (
                <div
                  key={guide.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                          {guide.badge}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-medium text-slate-400">{guide.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
                      <T>{guide.title}</T>
                    </h3>

                    <ol className="space-y-2 mb-3.5">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="shrink-0 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold mt-0.5 border border-slate-200 dark:border-slate-700">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>

                    {guide.tip && (
                      <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-2.5 mb-3 leading-relaxed">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{guide.tip}</span>
                      </div>
                    )}
                  </div>

                  {setActiveTab && guide.targetTab && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab(guide.targetTab)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        <span>{guide.actionLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Knowledge & Industry Playbooks Library (300 Articles) */}
      {filteredArticles.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <T>Knowledge Base &amp; Industry Playbooks</T> ({filteredArticles.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Showing {Math.min(visibleCount, filteredArticles.length)} of {filteredArticles.length} guides
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.slice(0, visibleCount).map((art) => (
              <div
                key={art.slug}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-900 transition hover:shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[170px]">
                      {art.clusterName || 'Guide'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{art.readMinutes || 5} min read</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
                    {art.excerpt || art.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {art.datePublished ? new Date(art.datePublished).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Guide'}
                  </span>
                  <Link
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    <span><T>Read Guide</T></span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredArticles.length && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <span><T>Load More Guides</T></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  +{Math.min(24, filteredArticles.length - visibleCount)}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
