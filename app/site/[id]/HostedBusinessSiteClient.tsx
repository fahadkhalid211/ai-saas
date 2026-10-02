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
  Copy,
  ChevronDown,
  CalendarCheck,
  CalendarX,
  RefreshCw,
  Eye,
  Send,
  User,
  Headphones,
  Building2,
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
import { validateAppointmentPayload } from '@/lib/security/validation';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateSingleIcs } from '@/lib/calendar/ical';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  getThemePalette,
  ThemePalette,
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
import { CresceloTemplate } from '@/components/landing/templates/CresceloTemplate';
import { UniversalTemplate } from '@/components/landing/templates/UniversalTemplate';
import { consumeChatStream } from '@/lib/chat/stream';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ChatBookingCard } from '@/components/chat/ChatBookingCard';

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

export interface HostedBusinessSiteClientProps {
  identifier: string;
  initialConfig?: LandingPageConfig | null;
  initialAssistant?: any;
}

export default function HostedBusinessSiteClient({
  identifier,
  initialConfig,
  initialAssistant,
}: HostedBusinessSiteClientProps) {
  // Theme Mode State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const isDark = themeMode === 'dark';
  const [loading, setLoading] = useState(!initialConfig);
  const [assistantId, setAssistantId] = useState<string>(initialConfig?.assistantId || '');
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig | null>(initialConfig || null);
  const [assistantData, setAssistantData] = useState<any>(initialAssistant || null);

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

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Floating Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id?: string; role: 'user' | 'assistant' | 'agent'; content: string; senderName?: string }>>(() => {
    if (initialAssistant?.welcomeMessage) {
      return [{ role: 'assistant', content: initialAssistant.welcomeMessage }];
    }
    return [];
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState('Support Agent');
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const knownServerMessageCountRef = useRef(0);

  // Theme Palette Computation (strictly respects themeColor, prevents amber bleed)
  const currentTheme = useMemo<ThemePalette>(() => {
    return getThemePalette(landingConfig?.themeColor, landingConfig?.industry);
  }, [landingConfig?.themeColor, landingConfig?.industry]);

  // Record live pageview event for analytics
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
          landingPageName: landingConfig?.businessName || identifier,
          visitorId: vid,
          referrer: document.referrer || '',
          userAgent: navigator.userAgent || '',
        }),
      }).catch(() => {});
    } catch {}
  }, [identifier, landingConfig?.businessName]);

  // Auto-scroll chat messages
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

  const currentSiteConvIdRef = useRef<string | null>(null);

  // Real-time synchronization with Live Agent Takeover
  useEffect(() => {
    if (!conversationId || !conversationToken) return;
    if (currentSiteConvIdRef.current !== conversationId) {
      currentSiteConvIdRef.current = conversationId;
      knownServerMessageCountRef.current = 0;
    }

    const pollSiteConv = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
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
            (m: any) => m.role === 'agent' && (!m.id || !prevIds.has(m.id))
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
      } catch {}
    };

    const interval = setInterval(pollSiteConv, 6000);
    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        pollSiteConv();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [conversationId, conversationToken]);

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
    if (typeof document === 'undefined' || !landingConfig) return;
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
    if (typeof document === 'undefined' || !landingConfig) return;
    const gaId = landingConfig.analytics?.googleAnalyticsId;
    const gaRegex = /^G-[A-Z0-9]+$/i;
    if (gaId && gaRegex.test(gaId) && !document.getElementById('ga-script')) {
      const script1 = document.createElement('script');
      script1.id = 'ga-script';
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga-init-script';
      script2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', ${JSON.stringify(gaId)});`;
      document.head.appendChild(script2);
    }

    const pixelId = landingConfig.analytics?.metaPixelId;
    const pixelRegex = /^\d{6,20}$/;
    if (pixelId && pixelRegex.test(pixelId) && !document.getElementById('meta-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'meta-pixel-script';
      script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(pixelId)}); fbq('track', 'PageView');`;
      document.head.appendChild(script);
    }
  }, [landingConfig?.analytics]);

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

  // Fetch updated landing page if not provided or to ensure fresh data
  useEffect(() => {
    if (!identifier) return;

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
          if (data.assistant.welcomeMessage && chatMessages.length === 0) {
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
        console.warn('Using existing/initial landing configuration:', err);
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

    const appointmentPayload = {
      assistantId: assistantId || 'demo-assistant',
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      date: bookingDate,
      timeSlot: bookingTime,
      durationMinutes: selectedService?.durationMinutes || 40,
      serviceId: selectedService?.id,
      serviceName: selectedService?.name || 'Appointment',
      price: selectedService?.price,
      notes: bookingNotes,
      landingPageName: landingConfig?.businessName || 'Landing Page',
      landingPageSlug: landingConfig?.slug || identifier || 'default',
      source: 'landing_form',
    };

    const validation = validateAppointmentPayload(appointmentPayload);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || 'Please complete all required fields properly.';
      setBookingError(firstError);
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized || appointmentPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm appointment');
      }

      setBookingSuccessData(data.appointment);

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

  const starterQuestionsList = useMemo<string[]>(() => {
    if (landingConfig?.starterQuestions && landingConfig.starterQuestions.length > 0) {
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
    if (!isTakeoverActive) {
      setChatMessages([...updatedMessages, { role: 'assistant' as const, content: '' }]);
    } else {
      setChatMessages(updatedMessages);
    }
    setChatLoading(true);
    playChatSendSound();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantId || identifier || 'demo-assistant',
          conversationId: conversationId || undefined,
          landingPageSlug: landingConfig?.slug || identifier,
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
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
              copy[lastIdx] = { role: 'assistant', content: acc };
            }
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

      if (!isTakeoverActive && !accumulated.trim()) {
        setChatMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
            copy[lastIdx] = {
              role: 'assistant',
              content: assistantData?.fallbackMessage || "I'm here to assist you! Would you like to schedule an appointment with our team?",
            };
          }
          return copy;
        });
      }
    } catch {
      setChatMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
          copy[lastIdx] = {
            role: 'assistant',
            content: 'Unable to reach the assistant right now. Please use the booking button to schedule directly.',
          };
        }
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Menu entries point at sections of the page. A template does not have every section a menu can name, so once the page
  // is on screen the entries whose section is missing are dropped instead of leading nowhere.
  const [presentAnchors, setPresentAnchors] = useState<Set<string> | null>(null);

  const navLinks = useMemo(() => {
    // If customized menu items are saved, use them
    if (landingConfig?.menuItems && landingConfig.menuItems.length > 0) {
      return landingConfig.menuItems;
    }

    const ind = (landingConfig?.industry || '').toLowerCase();
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
  }, [landingConfig?.industry, landingConfig?.menuItems]);

  useEffect(() => {
    const present = new Set<string>();
    for (const link of navLinks) {
      if (link.href.startsWith('#') && document.getElementById(link.href.slice(1))) present.add(link.href);
    }
    setPresentAnchors(present);
  }, [navLinks, landingConfig]);

  const visibleNavLinks = useMemo(
    () => (presentAnchors ? navLinks.filter((l) => !l.href.startsWith('#') || presentAnchors.has(l.href)) : navLinks),
    [navLinks, presentAnchors]
  );

  const renderIndustryTemplate = () => {
    if (!landingConfig) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-slate-400">Loading site layout...</p>
          </div>
        </div>
      );
    }

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

    if (ind.includes('universal') || ind === 'general' || ind === 'default' || ind === 'business' || ind === 'consulting') {
      return <UniversalTemplate {...templateProps} />;
    }
    if (ind.includes('crescelo') || ind === 'website_assistant' || ind === 'ai_assistant_saas') {
      return <CresceloTemplate {...templateProps} />;
    }
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
    if (ind.includes('barber') || ind.includes('salon')) {
      return <BarbershopTemplate {...templateProps} />;
    }
    return <UniversalTemplate {...templateProps} />;
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  if (loading && !landingConfig) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-400">Loading business site...</p>
        </div>
      </div>
    );
  }

  const activeConfig = landingConfig || {
    businessName: identifier,
    industry: 'business',
    tagline: 'Premier Services',
    heroHeadline: identifier,
    heroSubheadline: 'Online Booking & Inquiries',
    heroCtaText: 'Book Appointment',
    enabled: true,
    slug: identifier,
  };

  const indLower = (activeConfig?.industry || '').toLowerCase().trim();
  const isCrescelo = indLower.includes('crescelo') || indLower === 'website_assistant' || indLower === 'ai_assistant_saas';

  return (
    <div className={`min-h-screen ${isCrescelo ? 'bg-[#fffeeb] text-[#1a1a1a]' : isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans ${currentTheme.selectionBg} transition-colors duration-200 overflow-x-hidden`}>
      {/* Top Announcement Bar */}
      {!isCrescelo && (
        <div className={`${currentTheme.badgeBg} py-2 px-4 text-center text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{activeConfig.badgeText || 'Verified Excellence & Instant Online Booking'}</span>
        </div>
      )}

      {/* Navigation Header */}
      {!isCrescelo && (
        <header className={`sticky top-0 z-40 ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-xs'} backdrop-blur-md border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeConfig.logoUrl ? (
              <img
                src={activeConfig.logoUrl}
                alt={activeConfig.businessName}
                className="w-10 h-10 rounded-lg object-contain border border-slate-700/40"
              />
            ) : (
              <div className={`w-10 h-10 rounded-lg ${currentTheme.lightBg} border ${currentTheme.accentBorder} flex items-center justify-center ${currentTheme.accentText}`}>
                <IndustryIcon industry={activeConfig.industry} className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeConfig.businessName}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium capitalize`}>{activeConfig.industry?.replace(/_/g, ' ') || 'Official Service'}</div>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {visibleNavLinks.map((link) => (
              <a key={link.href} href={link.href} className={`hover:${currentTheme.accentText} transition-colors`}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Media Links in Header */}
          {activeConfig.socialLinks && (
            <div className={`hidden xl:flex items-center gap-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {activeConfig.socialLinks.instagram && (
                <a href={activeConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="Instagram">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.facebook && (
                <a href={activeConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="Facebook">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.twitter && (
                <a href={activeConfig.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="X / Twitter">
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.linkedin && (
                <a href={activeConfig.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="LinkedIn">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.youtube && (
                <a href={activeConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="YouTube">
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.tiktok && (
                <a href={activeConfig.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className={`hover:${currentTheme.accentText} transition-colors`} title="TikTok">
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
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
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
              onClick={() => openBookingForService(activeConfig.services?.[0] || {
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
      )}

      {/* Dynamic Industry-Specific Landing Layout */}
      <main className={isCrescelo ? '' : 'pb-16'}>
        {renderIndustryTemplate()}
      </main>

      {/* Footer */}
      {!isCrescelo && (
      <footer className={`border-t py-12 text-center text-xs ${isDark ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-slate-600'} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className={`flex items-center justify-center gap-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <IndustryIcon industry={activeConfig.industry} className={`w-4 h-4 ${currentTheme.accentText}`} />
            <span>{activeConfig.businessName}</span>
          </div>
          
          <p>{activeConfig.address} {activeConfig.phone ? `\u2022 ${activeConfig.phone}` : ''}</p>

          {/* Social Media Links in Footer */}
          {activeConfig.socialLinks && (
            <div className="flex items-center justify-center gap-4 pt-2">
              {activeConfig.socialLinks.instagram && (
                <a
                  href={activeConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.facebook && (
                <a
                  href={activeConfig.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.twitter && (
                <a
                  href={activeConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="X / Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.linkedin && (
                <a
                  href={activeConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.youtube && (
                <a
                  href={activeConfig.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'} transition-colors`}
                  title="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {activeConfig.socialLinks.tiktok && (
                <a
                  href={activeConfig.socialLinks.tiktok}
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
            {activeConfig.footerText || `Powered by Crescelo Enterprise Platform \u2022 Real-time Booking, 24h/1h Reminders & Hosted Landing Pages`}
          </p>
        </div>
      </footer>
      )}

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
                  <span className={`${currentTheme.accentText} text-xs font-bold uppercase tracking-wider`}>Book Appointment</span>
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

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      } ${currentTheme.focusRing} outline-none transition`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                        } ${currentTheme.focusRing} outline-none transition`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                        Mobile Phone (For SMS Reminders)
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                        } ${currentTheme.focusRing} outline-none transition`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        } ${currentTheme.focusRing} outline-none transition`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Time Slot * {isLoadingSlots && <span className="text-slate-500 text-[10px]">(checking availability...)</span>}
                        </label>
                        {landingConfig?.timezone && (
                          <span className="text-[11px] font-medium text-blue-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {landingConfig.timezone}
                          </span>
                        )}
                      </div>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        } ${currentTheme.focusRing} outline-none transition`}
                      >
                        {availableSlots.map((slot) => {
                          const isOccupied = occupiedSlots.includes(slot);
                          return (
                            <option key={slot} value={slot} disabled={isOccupied}>
                              {slot} {isOccupied ? '(Booked)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1.5`}>
                      Special Requests / Consultation Notes
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Any specific goals or preferences..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      } ${currentTheme.focusRing} outline-none transition`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className={`w-full py-3.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                  >
                    {bookingSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Securing Your Slot...</span>
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-4 h-4" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                  <p className={`text-center text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-2`}>
                    Instant confirmation email and calendar invite will be generated.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Appointment Confirmed!</h3>
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
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Location:</span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{activeConfig.businessName}</span>
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
                        activeConfig.businessName || 'Our Business',
                        activeConfig.address || ''
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
                        activeConfig.businessName || 'Our Business',
                        activeConfig.address || ''
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
                          activeConfig.businessName || 'Our Business',
                          activeConfig.address || ''
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
                <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-medium`}>{managedAppointment.serviceName || 'Service'}</span>
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
      {activeConfig.assistantId !== '' && activeConfig.assistantId !== 'none' && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[calc(100vw-2rem)]">
          {!isChatOpen ? (
            <button
              onClick={() => setIsChatOpen(true)}
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span className="text-sm">Chat with {activeConfig.businessName.split(' ')[0]} AI</span>
            </button>
          ) : (
            <div className={`w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] h-[520px] max-h-[85vh] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
              {/* Chat Header */}
              <div className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${currentTheme.lightBg} ${currentTheme.accentText} border ${currentTheme.accentBorder} flex items-center justify-center`}>
                    <IndustryIcon industry={activeConfig.industry} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeConfig.businessName} AI</div>
                    <div className="text-xs text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online & Ready to Assist</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} p-1.5 rounded-lg hover:bg-slate-800 transition`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages Transcript */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isAgent = msg.role === 'agent';
                  return (
                    <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      {isAgent && (
                        <div className="text-[10px] font-semibold text-amber-500 mb-1 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>{msg.senderName || assignedAgentName} (Live Agent)</span>
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? `${currentTheme.btnBg} !text-white font-medium`
                            : isDark
                            ? 'bg-slate-800 text-slate-100 border border-slate-700'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {(() => {
                          const hasBookingAction = msg.content.includes('[ACTION:BOOKING_FORM]');
                          const cleanContent = msg.content.replace(/\s*\[ACTION:[A-Z_]+\]/g, '').trim();
                          return (
                            <>
                              {cleanContent && <MarkdownRenderer content={cleanContent} />}
                              {hasBookingAction && (
                                <ChatBookingCard
                                  assistantId={activeConfig.assistantId || assistantId}
                                  businessName={activeConfig.businessName || 'Our Business'}
                                  conversationId={conversationId || undefined}
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI is formulating reply...</span>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Starter Quick Questions */}
              {starterQuestionsList.length > 0 && (
                <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
                  {starterQuestionsList.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendChatMessage(undefined, q)}
                      disabled={chatLoading}
                      className={`text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full border transition ${
                        isDark
                          ? 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Form */}
              <form onSubmit={handleSendChatMessage} className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'} flex items-center gap-2`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question or request appointment..."
                  className={`flex-1 text-xs px-3.5 py-2 rounded-xl border outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  } ${currentTheme.focusRing}`}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className={`p-2 rounded-xl ${currentTheme.btnBg} ${currentTheme.btnHoverBg} ${currentTheme.btnText} disabled:opacity-50 transition`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Countertop QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-sm ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'} border rounded-3xl p-6 text-center space-y-4`}>
            <button
              onClick={() => setIsQrModalOpen(false)}
              className={`absolute top-5 right-5 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">In-Store Countertop QR</h3>
              <p className="text-xs text-slate-400 mt-0.5">Scan to open this booking page on mobile</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
              <img src={qrCodeUrl} alt="Storefront QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <p className="text-[11px] text-slate-400 break-all">
              {currentUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
