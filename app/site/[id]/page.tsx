'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  X,
  ExternalLink,
  QrCode,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  RefreshCw,
  Send,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Scale,
  Activity,
  Bot,
  Sun,
  Moon,
  Download,
} from 'lucide-react';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateSingleIcs } from '@/lib/calendar/ical';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  DEFAULT_BARBER_LANDING_CONFIG,
  getLandingConfigForSlugOrTemplate,
} from '@/lib/landing/types';
import { BarbershopTemplate } from '@/components/landing/templates/BarbershopTemplate';
import { GymTemplate } from '@/components/landing/templates/GymTemplate';
import { RealEstateTemplate } from '@/components/landing/templates/RealEstateTemplate';
import { SaasTemplate } from '@/components/landing/templates/SaasTemplate';
import { EcommerceTemplate } from '@/components/landing/templates/EcommerceTemplate';
import { LegalTemplate } from '@/components/landing/templates/LegalTemplate';
import { HealthcareTemplate } from '@/components/landing/templates/HealthcareTemplate';
import { NexusAiTemplate } from '@/components/landing/templates/NexusAiTemplate';
import { CreativeAgencyTemplate } from '@/components/landing/templates/CreativeAgencyTemplate';
import { FintechTemplate } from '@/components/landing/templates/FintechTemplate';
import { CustomSkeletonTemplate } from '@/components/landing/templates/CustomSkeletonTemplate';
import { consumeChatStream } from '@/lib/chat/stream';
import { MarkdownRenderer } from '@/components/markdown-renderer';


function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.33.68.14 1.4.08 2.05-.18.89-.34 1.56-1.13 1.78-2.06.12-.47.16-.96.16-1.44V.02z" />
    </svg>
  );
}

function IndustryIcon({ industry, className = 'w-5 h-5' }: { industry?: string; className?: string }) {
  const ind = (industry || '').toLowerCase();
  if (ind.includes('barber')) return <Scissors className={className} />;
  if (ind.includes('gym') || ind.includes('fitness')) return <Dumbbell className={className} />;
  if (ind.includes('estate') || ind.includes('property')) return <Home className={className} />;
  if (ind.includes('ecom') || ind.includes('retail') || ind.includes('store')) return <ShoppingBag className={className} />;
  if (ind.includes('saas') || ind.includes('tech') || ind.includes('software')) return <Briefcase className={className} />;
  if (ind.includes('legal') || ind.includes('law')) return <Scale className={className} />;
  if (ind.includes('health') || ind.includes('dental') || ind.includes('clinic')) return <Activity className={className} />;
  return <Sparkles className={className} />;
}

const INDUSTRY_THEMES: Record<string, {
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
  lightBg: string;
  btnBg: string;
  btnHoverBg: string;
  btnText: string;
  selectionBg: string;
}> = {
  barbershop: {
    accentBg: 'bg-amber-500',
    accentHoverBg: 'hover:bg-amber-400',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/30',
    badgeBg: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950',
    lightBg: 'bg-amber-500/10',
    btnBg: 'bg-amber-500',
    btnHoverBg: 'hover:bg-amber-400',
    btnText: 'text-slate-950',
    selectionBg: 'selection:bg-amber-500 selection:text-black',
  },
  gym: {
    accentBg: 'bg-rose-600',
    accentHoverBg: 'hover:bg-rose-500',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500/30',
    badgeBg: 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white',
    lightBg: 'bg-rose-500/10',
    btnBg: 'bg-rose-600',
    btnHoverBg: 'hover:bg-rose-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-rose-500 selection:text-white',
  },
  real_estate: {
    accentBg: 'bg-emerald-600',
    accentHoverBg: 'hover:bg-emerald-500',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    badgeBg: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white',
    lightBg: 'bg-emerald-500/10',
    btnBg: 'bg-emerald-600',
    btnHoverBg: 'hover:bg-emerald-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-emerald-500 selection:text-white',
  },
  ecommerce: {
    accentBg: 'bg-purple-600',
    accentHoverBg: 'hover:bg-purple-500',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/30',
    badgeBg: 'bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 text-white',
    lightBg: 'bg-purple-500/10',
    btnBg: 'bg-purple-600',
    btnHoverBg: 'hover:bg-purple-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-purple-500 selection:text-white',
  },
  saas: {
    accentBg: 'bg-blue-600',
    accentHoverBg: 'hover:bg-blue-500',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    badgeBg: 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white',
    lightBg: 'bg-blue-500/10',
    btnBg: 'bg-blue-600',
    btnHoverBg: 'hover:bg-blue-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-blue-500 selection:text-white',
  },
  legal: {
    accentBg: 'bg-slate-200',
    accentHoverBg: 'hover:bg-white',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-400/30',
    badgeBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-amber-400 border-b border-slate-800',
    lightBg: 'bg-amber-400/10',
    btnBg: 'bg-amber-500',
    btnHoverBg: 'hover:bg-amber-400',
    btnText: 'text-slate-950',
    selectionBg: 'selection:bg-amber-500 selection:text-black',
  },
  healthcare: {
    accentBg: 'bg-sky-600',
    accentHoverBg: 'hover:bg-sky-500',
    accentText: 'text-sky-400',
    accentBorder: 'border-sky-500/30',
    badgeBg: 'bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 text-white',
    lightBg: 'bg-sky-500/10',
    btnBg: 'bg-sky-600',
    btnHoverBg: 'hover:bg-sky-500',
    btnText: 'text-white',
    selectionBg: 'selection:bg-sky-500 selection:text-white',
  },
};

interface SitePageProps {
  params: Promise<{ id: string }>;
}

export default function HostedBusinessSite({ params }: SitePageProps) {
  // Theme Mode State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const isDark = themeMode === 'dark';
  const [identifier, setIdentifier] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assistantId, setAssistantId] = useState<string>('');
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(DEFAULT_BARBER_LANDING_CONFIG);
  const [assistantData, setAssistantData] = useState<any>(null);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<LandingPageServiceItem | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('10:00');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Manage Booking Modal (via manageToken)
  const [manageToken, setManageToken] = useState<string | null>(null);
  const [managedAppointment, setManagedAppointment] = useState<any>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [manageSuccessMsg, setManageSuccessMsg] = useState<string | null>(null);


  // Record live pageview event for Google-grade analytics
  useEffect(() => {
    if (!identifier || typeof window === 'undefined') return;
    try {
      let vid = localStorage.getItem('kortex_visitor_id');
      if (!vid) {
        vid = 'vis_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('kortex_visitor_id', vid);
      }

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: identifier,
          landingPageName: landingConfig.businessName,
          visitorId: vid,
          referrer: document.referrer || '',
          userAgent: navigator.userAgent || '',
        }),
      }).catch(() => {});
    } catch {}
  }, [identifier, landingConfig.businessName]);

  // Floating Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id?: string; role: 'user' | 'assistant' | 'agent'; content: string; senderName?: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState('Support Agent');
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const knownServerMessageCountRef = useRef(0);

  // Auto-scroll to the latest message whenever the transcript grows or the
  // assistant's streamed reply updates, so a new message never sits below
  // the visible fold.
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages, chatLoading]);

  const playChatSendSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  };

  const playChatReceiveSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && identifier) {
      const key = `kortex_conv_${identifier}`;
      let cId = sessionStorage.getItem(key);
      if (!cId) {
        cId = 'conv_' + Math.random().toString(36).substring(2, 11);
        sessionStorage.setItem(key, cId);
      }
      setConversationId(cId);
    }
  }, [identifier]);

  // Real-time synchronization with Live Agent Takeover in Admin Panel.
  // /api/conversations requires either an admin session or the per-conversation
  // capability token issued by /api/chat, so polling only starts once a
  // token has actually been received (i.e. after the first message).
  useEffect(() => {
    if (!conversationId || !conversationToken) return;
    knownServerMessageCountRef.current = 0;

    const interval = setInterval(async () => {
      try {
        const params = new URLSearchParams({
          id: conversationId,
          token: conversationToken,
          sinceCount: String(knownServerMessageCountRef.current),
        });
        const res = await fetch(`/api/conversations?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.conversation) return;

        const conv = data.conversation;
        setIsTakeoverActive(Boolean(conv.isLiveTakeover));
        if (conv.assignedAgentName) {
          setAssignedAgentName(conv.assignedAgentName);
        }

        if (typeof data.totalMessageCount === 'number') {
          knownServerMessageCountRef.current = data.totalMessageCount;
        }

        const incomingMessages = data.newMessages || [];
        if (incomingMessages.length === 0) return;

        setChatMessages((prev) => {
          const prevIds = new Set(prev.map((m) => m.id).filter(Boolean));
          const newAgentMessages = incomingMessages.filter(
            (m: any) => m.role === 'agent' && !prevIds.has(m.id)
          );

          if (newAgentMessages.length === 0) return prev;

          playChatReceiveSound();
          const formatted = newAgentMessages.map((m: any) => ({
            id: m.id,
            role: 'agent' as const,
            content: m.content,
            senderName: m.senderName || conv.assignedAgentName || 'Live Support Agent',
          }));

          return [...prev, ...formatted];
        });
      } catch {
        // Silent polling error
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [conversationId, conversationToken]);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kortex_site_theme') as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeMode(saved);
      }
    }
  }, []);

  const toggleThemeMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kortex_site_theme', next);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  // Dynamic SEO Meta Tags
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const pageTitle = landingConfig.seo?.metaTitle || (landingConfig.businessName ? (landingConfig.businessName + ' - Official Booking & Services') : 'Online Booking');
    document.title = pageTitle;

    const setMeta = (name: string, val: string, isProp = false) => {
      if (!val) return;
      let el = document.querySelector(isProp ? ('meta[property="' + name + '"]') : ('meta[name="' + name + '"]'));
      if (!el) {
        el = document.createElement('meta');
        if (isProp) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    setMeta('description', landingConfig.seo?.metaDescription || landingConfig.heroSubheadline || '');
    if (landingConfig.seo?.metaKeywords) {
      setMeta('keywords', landingConfig.seo.metaKeywords);
    }
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', landingConfig.seo?.metaDescription || landingConfig.heroSubheadline || '', true);
    if (landingConfig.seo?.ogImageUrl || landingConfig.heroImageUrl) {
      setMeta('og:image', landingConfig.seo?.ogImageUrl || landingConfig.heroImageUrl || '', true);
    }
    if (landingConfig.seo?.canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', landingConfig.seo.canonicalUrl);
    }
    if (landingConfig.seo?.noIndex) {
      setMeta('robots', 'noindex, nofollow');
    }
  }, [landingConfig]);

  // Google Analytics & Meta Pixel Injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const gaId = landingConfig.analytics?.googleAnalyticsId;
    if (gaId && !document.getElementById('ga-script')) {
      const script1 = document.createElement('script');
      script1.id = 'ga-script';
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga-init-script';
      script2.innerHTML = "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '" + gaId + "');";
      document.head.appendChild(script2);
    }

    const pixelId = landingConfig.analytics?.metaPixelId;
    if (pixelId && !document.getElementById('meta-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'meta-pixel-script';
      script.innerHTML = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '" + pixelId + "'); fbq('track', 'PageView');";
      document.head.appendChild(script);
    }
  }, [landingConfig.analytics]);


  useEffect(() => {
    params.then((p) => {
      setIdentifier(p.id);
    });
  }, [params]);

  // Check for manageToken in query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('manageToken');
      if (token) {
        setManageToken(token);
      }
    }
  }, []);

  // Fetch landing page and assistant data in a single roundtrip
  useEffect(() => {
    if (!identifier) return;

    setLoading(true);
    fetch(`/api/landing-page?slug=${encodeURIComponent(identifier)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load landing page configuration');
        return res.json();
      })
      .then((data) => {
        if (data.assistantId) {
          setAssistantId(data.assistantId);
        }
        if (data.config) {
          setLandingConfig(data.config);
        }
        if (data.assistant) {
          setAssistantData(data.assistant);
          if (data.assistant.welcomeMessage) {
            setChatMessages([
              {
                role: 'assistant',
                content: data.assistant.welcomeMessage,
              },
            ]);
          }
        }
      })
      .catch((err) => {
        console.warn('Using default landing configuration:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [identifier]);

  // Fetch managed appointment if token is present
  useEffect(() => {
    if (!manageToken) return;

    setManageLoading(true);
    fetch(`/api/appointments?manageToken=${encodeURIComponent(manageToken)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Appointment not found or link expired');
        return res.json();
      })
      .then((data) => {
        setManagedAppointment(data.appointment);
        setRescheduleDate(data.appointment.date);
        setRescheduleTime(data.appointment.timeSlot);
      })
      .catch((err) => {
        setManageError(err.message);
      })
      .finally(() => {
        setManageLoading(false);
      });
  }, [manageToken]);

  // Generate available time slots based on service duration
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 19;
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:40`);
    }
    return slots;
  }, []);

  // Check live availability for selected booking date to avoid double bookings
  useEffect(() => {
    if (!bookingDate) {
      setOccupiedSlots([]);
      return;
    }
    let isCancelled = false;
    setIsLoadingSlots(true);
    fetch(
      `/api/appointments?assistantId=${encodeURIComponent(assistantId || 'demo-assistant')}&checkDate=${encodeURIComponent(
        bookingDate
      )}`
    )
      .then((res) => (res.ok ? res.json() : { bookedSlots: [] }))
      .then((data) => {
        if (!isCancelled) {
          setOccupiedSlots(data.bookedSlots || []);
        }
      })
      .catch(() => {
        if (!isCancelled) setOccupiedSlots([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingSlots(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [bookingDate, assistantId]);

  const openBookingForService = (service: LandingPageServiceItem) => {
    setSelectedService(service);
    setIsBookingOpen(true);
    setBookingSuccessData(null);
    setBookingError(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !bookingDate || !bookingTime) {
      setBookingError('Please complete all required fields.');
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || 'demo-assistant',
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          date: bookingDate,
          timeSlot: bookingTime,
          durationMinutes: selectedService?.durationMinutes || 40,
          serviceId: selectedService?.id,
          serviceName: selectedService?.name || 'Haircut & Styling',
          price: selectedService?.price || 45,
          notes: bookingNotes,
          landingPageName: landingConfig.businessName || 'Landing Page',
          landingPageSlug: landingConfig.slug || identifier || 'default',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm appointment');
      }

      setBookingSuccessData(data.appointment);

      // Log the confirmation in the chat transcript too, so a visitor who
      // booked via the in-chat form (or reopens the chat later) can see it
      // was confirmed without having to re-check the separate success panel.
      const appt = data.appointment || {};
      const serviceLabel = appt.serviceName || selectedService?.name || 'your appointment';
      const dateLabel = appt.date || bookingDate;
      const timeLabel = appt.timeSlot || bookingTime;
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `**Booking confirmed!** ${serviceLabel} on **${dateLabel}** at **${timeLabel}**. A confirmation has been sent to ${clientEmail}. We look forward to seeing you!`,
        },
      ]);
      playChatReceiveSound();
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleClientReschedule = async () => {
    if (!manageToken || !rescheduleDate || !rescheduleTime) return;
    setIsRescheduling(true);
    setManageError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'client_reschedule',
          manageToken,
          newDate: rescheduleDate,
          newTimeSlot: rescheduleTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule');
      setManagedAppointment(data.appointment);
      setManageSuccessMsg('Your appointment has been successfully rescheduled.');
    } catch (err: any) {
      setManageError(err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleClientCancel = async () => {
    if (!manageToken) return;
    setIsCancelling(true);
    setManageError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'client_cancel',
          manageToken,
          cancellationReason: cancelReason || 'Cancelled by client',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');
      setManagedAppointment((prev: any) => ({ ...prev, status: 'cancelled' }));
      setManageSuccessMsg('Your appointment has been cancelled.');
    } catch (err: any) {
      setManageError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const currentTheme = useMemo(() => {
    return INDUSTRY_THEMES[landingConfig.industry || 'barbershop'] || INDUSTRY_THEMES.barbershop;
  }, [landingConfig.industry]);

  const starterQuestionsList = useMemo<string[]>(() => {
    if (landingConfig.starterQuestions && landingConfig.starterQuestions.length > 0) {
      return landingConfig.starterQuestions;
    }
    if (assistantData?.starterQuestions && assistantData.starterQuestions.length > 0) {
      return assistantData.starterQuestions;
    }
    return [
      'What are your services and prices?',
      'Can I book an appointment for tomorrow?',
      'Where is your location?',
      'What are your opening hours?',
    ];
  }, [landingConfig, assistantData]);

  const handleSendChatMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const userText = (directText || chatInput).trim();
    if (!userText || chatLoading) return;

    setChatInput('');
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userText }];
    // Append empty placeholder for real-time assistant streaming
    setChatMessages([...updatedMessages, { role: 'assistant' as const, content: '' }]);
    setChatLoading(true);
    playChatSendSound();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || identifier || 'demo-assistant',
          conversationId: conversationId || undefined,
          landingPageSlug: landingConfig.slug || identifier,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      if (!res.body) throw new Error('No stream available');

      const accumulated = await consumeChatStream(res.body, {
        onToken: (acc) => {
          setChatMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: acc };
            return copy;
          });
        },
        onTakeover: (agentName, convId, convToken) => {
          if (convId) setConversationId(convId);
          if (convToken) setConversationToken(convToken);
          setIsTakeoverActive(true);
          if (agentName) setAssignedAgentName(agentName);
        },
        onDone: (convId, convToken) => {
          if (convId) setConversationId(convId);
          if (convToken) setConversationToken(convToken);
          playChatReceiveSound();
        },
      });

      if (!accumulated.trim()) {
        setChatMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: assistantData?.fallbackMessage || "I'm here to assist you! Would you like to schedule an appointment with our team?",
          };
          return copy;
        });
      }
    } catch {
      setChatMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Unable to reach the assistant right now. Please use the booking button to schedule directly.',
        };
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  };

  const navLinks = useMemo(() => {
    const ind = (landingConfig.industry || '').toLowerCase();
    if (ind.includes('nexus') || ind === 'nexus_ai' || ind === 'ai_tech') {
      return [
        { href: '#capabilities', label: 'Architecture' },
        { href: '#terminal', label: 'Live Sandbox' },
        { href: '#pricing', label: 'Deployment Plans' },
      ];
    }
    if (ind.includes('hyperion') || ind === 'creative_agency' || ind === 'design_agency') {
      return [
        { href: '#works', label: 'Selected Works' },
        { href: '#capabilities', label: 'Methodology' },
        { href: '#retainers', label: 'Engagements' },
      ];
    }
    if (ind.includes('aether') || ind === 'fintech' || ind === 'finance') {
      return [
        { href: '#calculator', label: 'Yield Projection' },
        { href: '#security', label: 'Custody Architecture' },
        { href: '#services', label: 'Private Office' },
      ];
    }
    if (ind.includes('gym') || ind.includes('fitness')) {
      return [
        { href: '#membership', label: 'Memberships' },
        { href: '#schedule', label: 'Class Schedule' },
        { href: '#amenities', label: 'Amenities' },
      ];
    }
    if (ind.includes('estate') || ind.includes('property')) {
      return [
        { href: '#search', label: 'Property Search' },
        { href: '#listings', label: 'Exclusive Listings' },
        { href: '#valuation', label: 'Valuation' },
        { href: '#services', label: 'Advisory' },
      ];
    }
    if (ind.includes('saas') || ind.includes('tech')) {
      return [
        { href: '#capabilities', label: 'Platform' },
        { href: '#security', label: 'Security & SOC-2' },
        { href: '#pricing', label: 'Pricing Plans' },
      ];
    }
    if (ind.includes('ecom') || ind.includes('retail') || ind.includes('store')) {
      return [
        { href: '#catalog', label: 'Signature Collection' },
        { href: '#services', label: 'Styling Services' },
        { href: '#reviews', label: 'Reviews' },
      ];
    }
    if (ind.includes('legal') || ind.includes('law')) {
      return [
        { href: '#practice', label: 'Practice Areas' },
        { href: '#process', label: 'Methodology' },
        { href: '#retainers', label: 'Case Evaluation' },
        { href: '#leadership', label: 'Partners' },
      ];
    }
    if (ind.includes('health') || ind.includes('dental') || ind.includes('clinic')) {
      return [
        { href: '#insurance', label: 'Insurance' },
        { href: '#procedures', label: 'Procedures' },
        { href: '#amenities', label: 'Patient Comfort' },
        { href: '#doctors', label: 'Care Team' },
      ];
    }
    return [
      { href: '#services', label: 'Services & Pricing' },
      { href: '#gallery', label: 'Gallery' },
      { href: '#about', label: 'About Us' },
      { href: '#testimonials', label: 'Reviews' },
      { href: '#hours', label: 'Hours & Location' },
    ];
  }, [landingConfig.industry]);

  const renderIndustryTemplate = () => {
    const ind = (landingConfig.industry || '').toLowerCase().trim();
    const templateProps = {
      config: landingConfig,
      isDark,
      currentTheme,
      onOpenBooking: (serviceId?: string) => {
        if (serviceId && landingConfig.services) {
          const found = landingConfig.services.find((s) => s.id === serviceId);
          if (found) {
            openBookingForService(found);
            return;
          }
        }
        openBookingForService(landingConfig.services?.[0] || {
          id: 'srv_default',
          name: 'Consultation & Appointment',
          description: 'Scheduled service visit',
          durationMinutes: 45,
          price: 50,
        });
      },
      onOpenChat: () => setIsChatOpen(true),
      chatMessagesCount: chatMessages.length,
    };

    if (ind.includes('nexus') || ind === 'nexus_ai' || ind === 'ai_tech') {
      return <NexusAiTemplate {...templateProps} />;
    }
    if (ind.includes('hyperion') || ind === 'creative_agency' || ind === 'design_agency') {
      return <CreativeAgencyTemplate {...templateProps} />;
    }
    if (ind.includes('aether') || ind === 'fintech' || ind === 'finance') {
      return <FintechTemplate {...templateProps} />;
    }
    if (ind.includes('custom') || ind.includes('skeleton')) {
      return <CustomSkeletonTemplate {...templateProps} />;
    }
    if (ind.includes('gym') || ind.includes('fitness')) {
      return <GymTemplate {...templateProps} />;
    }
    if (ind.includes('estate') || ind.includes('property')) {
      return <RealEstateTemplate {...templateProps} />;
    }
    if (ind.includes('saas') || ind.includes('tech') || ind.includes('software')) {
      return <SaasTemplate {...templateProps} />;
    }
    if (ind.includes('ecom') || ind.includes('retail') || ind.includes('store')) {
      return <EcommerceTemplate {...templateProps} />;
    }
    if (ind.includes('legal') || ind.includes('law')) {
      return <LegalTemplate {...templateProps} />;
    }
    if (ind.includes('health') || ind.includes('dental') || ind.includes('clinic') || ind.includes('medical')) {
      return <HealthcareTemplate {...templateProps} />;
    }
    return <BarbershopTemplate {...templateProps} />;
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans ${currentTheme.selectionBg} transition-colors duration-200`}>
      {/* Top Announcement Bar */}
      <div className={`${currentTheme.badgeBg} py-2 px-4 text-center text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>{landingConfig.badgeText || 'Verified Excellence & Instant Online Booking'}</span>
      </div>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-xs'} backdrop-blur-md border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${currentTheme.lightBg} border ${currentTheme.accentBorder} flex items-center justify-center ${currentTheme.accentText}`}>
              <IndustryIcon industry={landingConfig.industry} className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{landingConfig.businessName}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium capitalize`}>{landingConfig.industry?.replace(/_/g, ' ') || 'Official Service'}</div>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={`hover:${currentTheme.accentText} transition-colors`}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Media Links in Header */}
          {landingConfig.socialLinks && (
            <div className={`hidden xl:flex items-center gap-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {landingConfig.socialLinks.instagram && (
                <a href={landingConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="Instagram">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.facebook && (
                <a href={landingConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="Facebook">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.twitter && (
                <a href={landingConfig.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="X / Twitter">
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.linkedin && (
                <a href={landingConfig.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="LinkedIn">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.youtube && (
                <a href={landingConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="YouTube">
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.tiktok && (
                <a href={landingConfig.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="TikTok">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                isDark
                  ? 'text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-800'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
              title="Countertop QR Code"
            >
              <QrCode className={`w-4 h-4 ${currentTheme.accentText}`} />
              <span>In-Store QR</span>
            </button>

            <button
              onClick={() => openBookingForService(landingConfig.services?.[0] || {
                id: 'srv_1',
                name: 'Standard Appointment',
                description: 'Service appointment',
                durationMinutes: 40,
                price: 45,
              })}
              className={`flex items-center gap-2 px-5 py-2.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-semibold text-sm rounded-lg shadow-lg transition-all active:scale-95`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Industry-Specific Landing Layout */}
      <main className="pb-16">
        {renderIndustryTemplate()}
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 text-center text-xs ${isDark ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-slate-600'} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className={`flex items-center justify-center gap-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <IndustryIcon industry={landingConfig.industry} className={`w-4 h-4 ${currentTheme.accentText}`} />
            <span>{landingConfig.businessName}</span>
          </div>
          
          <p>{landingConfig.address} &bull; {landingConfig.phone}</p>

          {/* Social Media Links in Footer */}
          {landingConfig.socialLinks && (
            <div className="flex items-center justify-center gap-4 pt-2">
              {landingConfig.socialLinks.instagram && (
                <a
                  href={landingConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.facebook && (
                <a
                  href={landingConfig.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.twitter && (
                <a
                  href={landingConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="X / Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.linkedin && (
                <a
                  href={landingConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.youtube && (
                <a
                  href={landingConfig.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {landingConfig.socialLinks.tiktok && (
                <a
                  href={landingConfig.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="TikTok"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <p className={isDark ? 'text-slate-600' : 'text-slate-500'}>
            Powered by Kortex AI Enterprise Platform &bull; Real-time Booking, 24h/1h Reminders & Hosted Landing Pages
          </p>
        </div>
      </footer>

      {/* Booking Appointment Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'} border rounded-3xl p-6 sm:p-8 my-8`}>
            <button
              onClick={() => setIsBookingOpen(false)}
              className={`absolute top-6 right-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccessData ? (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <span className={`${currentTheme.accentText} text-xs font-bold uppercase tracking-wider`}>Book Your Chair</span>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>
                    {selectedService ? selectedService.name : 'Schedule Appointment'}
                  </h3>
                  {selectedService && (
                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1.5`}>
                      <span className={`${currentTheme.accentText} font-bold`}>${selectedService.price}</span>
                      <span>&bull;</span>
                      <span>{selectedService.durationMinutes} Minutes</span>
                    </div>
                  )}
                </div>

                {bookingError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                      Time Slot {isLoadingSlots ? '(Checking availability...)' : ''}
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500`}
                    >
                      {availableSlots.map((slot) => {
                        const isBooked = occupiedSlots.includes(slot);
                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot} {isBooked ? '(Reserved / Unavailable)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>Email (For 24h/1h Reminders)</label>
                    <input
                      type="email"
                      required
                      placeholder="client@gmail.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2831"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>Notes or Special Preferences</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Skin taper fade, beard sculpting, or preferred barber"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className={`w-full py-3.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {bookingSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Confirming Appointment...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Confirm Appointment (${selectedService?.price || 45})</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Chair Confirmed!</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-1`}>
                    We look forward to seeing you, <strong>{bookingSuccessData.name}</strong>.
                  </p>
                </div>

                <div className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4 text-left text-sm space-y-2`}>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Service:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bookingSuccessData.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Date & Time:</span>
                    <span className={`${currentTheme.accentText} font-semibold`}>
                      {bookingSuccessData.date} at {bookingSuccessData.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Shop:</span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{landingConfig.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Reminders:</span>
                    <span className="text-emerald-500 font-medium">Active (24h & 1h prior)</span>
                  </div>
                </div>

                {/* 1-Click Calendar Sync for Client */}
                <div className="pt-1 space-y-2">
                  <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add to Your Calendar
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <a
                      href={generateGoogleCalendarUrl(
                        {
                          name: bookingSuccessData.name,
                          email: bookingSuccessData.email,
                          phone: bookingSuccessData.phone,
                          date: bookingSuccessData.date,
                          timeSlot: bookingSuccessData.timeSlot,
                          durationMinutes: bookingSuccessData.durationMinutes,
                          serviceName: bookingSuccessData.serviceName,
                          notes: bookingSuccessData.notes,
                        },
                        landingConfig.businessName || 'Our Business',
                        landingConfig.address || ''
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Google Calendar</span>
                    </a>

                    <a
                      href={generateOutlookCalendarUrl(
                        {
                          name: bookingSuccessData.name,
                          email: bookingSuccessData.email,
                          phone: bookingSuccessData.phone,
                          date: bookingSuccessData.date,
                          timeSlot: bookingSuccessData.timeSlot,
                          durationMinutes: bookingSuccessData.durationMinutes,
                          serviceName: bookingSuccessData.serviceName,
                          notes: bookingSuccessData.notes,
                        },
                        landingConfig.businessName || 'Our Business',
                        landingConfig.address || ''
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Outlook</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const ics = generateSingleIcs(
                          bookingSuccessData,
                          landingConfig.businessName || 'Our Business',
                          landingConfig.address || ''
                        );
                        const blob = new Blob([ics], { type: 'text/calendar' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `appointment-${bookingSuccessData.id || 'confirmed'}.ics`;
                        link.click();
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      } text-xs font-semibold transition cursor-pointer`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ics</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setIsBookingOpen(false)}
                    className={`w-full py-3 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} font-medium rounded-xl text-sm transition-colors`}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Managed Appointment Modal (Reschedule / Cancel) */}
      {manageToken && managedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className={`w-full max-w-md ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'} border rounded-3xl p-6 sm:p-8 relative`}>
            <button
              onClick={() => setManageToken(null)}
              className={`absolute top-6 right-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <span className={`${currentTheme.accentText} text-xs font-bold uppercase tracking-wider`}>Client Self-Service</span>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>Manage Your Booking</h3>

            {manageSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{manageSuccessMsg}</span>
              </div>
            )}

            {manageError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manageError}</span>
              </div>
            )}

            <div className={`mt-5 p-4 rounded-2xl ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border text-xs space-y-2`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Client:</span>
                <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-medium`}>{managedAppointment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Service:</span>
                <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-medium`}>{managedAppointment.serviceName || 'Haircut'}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Current Slot:</span>
                <span className={`${currentTheme.accentText} font-semibold`}>{managedAppointment.date} at {managedAppointment.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Status:</span>
                <span className={`capitalize font-semibold ${managedAppointment.status === 'cancelled' ? 'text-rose-400' : 'text-emerald-500'}`}>
                  {managedAppointment.status}
                </span>
              </div>
            </div>

            {managedAppointment.status !== 'cancelled' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Pick New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3 py-2 text-xs`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Pick New Time</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3 py-2 text-xs`}
                  >
                    {availableSlots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleClientReschedule}
                    disabled={isRescheduling}
                    className={`flex-1 py-2.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{isRescheduling ? 'Rescheduling...' : 'Confirm New Time'}</span>
                  </button>

                  <button
                    onClick={handleClientCancel}
                    disabled={isCancelling}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarX className="w-4 h-4" />
                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Slot'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Concierge Chatbot Button & Drawer */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className={`flex items-center gap-2.5 px-5 py-3.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Chat with {landingConfig.businessName.split(' ')[0]} AI</span>
          </button>
        ) : (
          <div className={`w-[360px] sm:w-[400px] h-[520px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
            {/* Chat Header */}
            <div className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${currentTheme.lightBg} ${currentTheme.accentText} border ${currentTheme.accentBorder} flex items-center justify-center`}>
                  <IndustryIcon industry={landingConfig.industry} className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{landingConfig.businessName} AI</div>
                  <div className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online & Ready to Assist</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Takeover Status Banner */}
            {isTakeoverActive && (
              <div className="px-3 py-1.5 bg-amber-950/80 border-b border-amber-800/80 text-[11px] text-amber-300 font-medium flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Live Operator Active: {assignedAgentName}</span>
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">AI Paused</span>
              </div>
            )}

            {/* Chat Messages */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${isDark ? 'bg-slate-950/40 text-slate-200' : 'bg-slate-50/60 text-slate-800'} text-xs`}>
              {chatMessages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const isAgent = msg.role === 'agent';
                const hasBookingAction =
                  msg.content.includes('[ACTION:BOOKING_FORM]') ||
                  msg.content.includes('[BOOKING_FORM]');
                const cleanContent = msg.content
                  .replace(/\[ACTION:BOOKING_FORM\]/g, '')
                  .replace(/\[BOOKING_FORM\]/g, '')
                  .trim();

                return (
                  <div
                    key={i}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                        isUser
                          ? `${currentTheme.btnBg} ${currentTheme.btnText} font-medium`
                          : isAgent
                          ? 'bg-amber-950/40 text-slate-200 border border-amber-800/60'
                          : isDark
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                      }`}
                    >
                      {isAgent && (
                        <div className="text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                          <span>Operator {msg.senderName || assignedAgentName}</span>
                        </div>
                      )}

                      {cleanContent ? (
                        isUser ? (
                          <div className="whitespace-pre-line">{cleanContent}</div>
                        ) : (
                          <MarkdownRenderer content={cleanContent} />
                        )
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Consulting knowledgebase...</span>
                        </span>
                      )}

                      {/* Interactive In-Chat Booking Form Card */}
                      {hasBookingAction && (
                        <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-slate-900 border-slate-700/80' : 'bg-slate-50 border-slate-200'} border space-y-2.5 shadow-md`}>
                          <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} pb-2`}>
                            <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              <span>{landingConfig.businessName} Booking</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                              Instant Confirmation
                            </span>
                          </div>

                          {landingConfig.services && landingConfig.services.length > 0 && (
                            <div className="space-y-1">
                              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} block font-medium`}>Select a service:</span>
                              <div className="grid grid-cols-1 gap-1">
                                {landingConfig.services.slice(0, 3).map((srv) => (
                                  <button
                                    key={srv.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedService(srv);
                                      setIsBookingOpen(true);
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'} border text-[11px] transition flex items-center justify-between text-left cursor-pointer`}
                                  >
                                    <span className="font-semibold">{srv.name}</span>
                                    <span className="font-mono text-emerald-500 font-bold">${srv.price}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setIsBookingOpen(true)}
                            className={`w-full py-2 px-3 rounded-lg ${currentTheme.btnBg} ${currentTheme.btnText} font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition hover:opacity-95 cursor-pointer`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Complete Booking Form &amp; Pick Slot</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {chatLoading && chatMessages[chatMessages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-2xs'} border rounded-2xl p-3 flex items-center gap-1.5`}>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Prompts (Instant Auto-Send on Click) */}
            {starterQuestionsList && starterQuestionsList.length > 0 && (
              <div className={`px-3 py-2 ${isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100/80 border-slate-200'} border-t flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar`}>
                {starterQuestionsList.map((q: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChatMessage(undefined, q)}
                    disabled={chatLoading}
                    className={`px-2.5 py-1 ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800' : 'bg-white hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'} rounded-lg whitespace-nowrap border transition-colors shrink-0 disabled:opacity-50 cursor-pointer`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className={`p-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-t flex gap-2`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask anything about ${landingConfig.businessName.split(' ')[0]} or booking...`}
                className={`flex-1 ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500`}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className={`p-2 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} rounded-xl transition-colors disabled:opacity-50 cursor-pointer`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* In-Store Countertop QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-950 shadow-2xl'} border rounded-3xl p-8 max-w-sm w-full text-center space-y-5 relative`}>
            <button
              onClick={() => setIsQrModalOpen(false)}
              className={`absolute top-4 right-4 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${currentTheme.lightBg} ${currentTheme.accentText}`}>
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{landingConfig.businessName}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Scan to Book a Chair or View Services</p>
            </div>

            <div className={`p-4 ${isDark ? 'bg-white border border-slate-200' : 'bg-slate-50 border border-slate-200'} rounded-2xl flex items-center justify-center`}>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-56 h-56 rounded-lg shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className={`w-full py-2.5 ${isDark ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-white font-semibold'} rounded-xl text-xs transition-colors cursor-pointer`}
              >
                Print Countertop Sign
              </button>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Place this QR code on your reception desk or mirror stations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
