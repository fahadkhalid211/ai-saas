'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

type Category = 'all' | 'calendar' | 'voice' | 'messaging' | 'ai' | 'crm';

interface IntegrationDetail {
  id: string;
  name: string;
  category: Category;
  categoryLabel: string;
  badge: 'Native' | 'One-Click' | 'BYOK' | 'Webhook';
  tone: 'lime' | 'lav' | 'mint' | 'pink' | 'amber';
  tagline: string;
  overview: string;
  features: string[];
  latency: string;
  security: string;
  guideHref?: string;
  guideLabel?: string;
  samplePayload: Record<string, unknown>;
}

const INTEGRATIONS: IntegrationDetail[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'Native',
    tone: 'lime',
    tagline: 'Two-way slot synchronization with atomic mutex locking.',
    overview:
      'Crescelo communicates directly with Google Calendar via OAuth 2.0 to inspect free/busy slots across team schedules in real time. When a customer confirms an appointment in chat or over phone, Crescelo claims the slot atomically, generates a Google Meet video conference link, and sends instant calendar invites to all attendees.',
    features: [
      'Zero double-booking via atomic mutex locking',
      'Automatic Google Meet video link generation',
      'Two-way sync: manual events block assistant availability instantly',
      'Dynamic buffer times (e.g. 15-minute prep between appointments)',
    ],
    latency: '180ms sync latency',
    security: 'Scoped OAuth 2.0 (calendar.events only), refresh tokens AES-256 encrypted',
    guideHref: '/support/calendar-booking',
    guideLabel: 'Read Calendar Booking Guide',
    samplePayload: {
      event: 'calendar.booking.created',
      calendarId: 'primary',
      summary: 'Haircut & Styling with Marcus',
      start: { dateTime: '2026-09-23T14:30:00Z', timeZone: 'America/New_York' },
      end: { dateTime: '2026-09-23T15:15:00Z', timeZone: 'America/New_York' },
      attendees: [{ email: 'client@example.com', name: 'Sophia Miller' }],
      conference: { type: 'google_meet', url: 'https://meet.google.com/abc-defg-hij' },
    },
  },
  {
    id: 'outlook-calendar',
    name: 'Microsoft Outlook & 365',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'Native',
    tone: 'lav',
    tagline: 'Enterprise Microsoft Graph calendar synchronization.',
    overview:
      'Seamlessly connects to Microsoft 365 and Outlook Exchange accounts. The assistant respects working hours, multi-person availability, and tentative holds, locking confirmed appointments directly into corporate staff calendars with Microsoft Teams meeting coordinates.',
    features: [
      'Microsoft Graph API multi-calendar availability query',
      'Teams conference link auto-provisioning',
      'Respects user working hours and out-of-office blocks',
      'Corporate tenant isolation and Single Sign-On friendly',
    ],
    latency: '210ms sync latency',
    security: 'Microsoft Azure App Registration with least-privilege Graph scopes',
    guideHref: '/support/calendar-booking',
    guideLabel: 'Read Calendar Booking Guide',
    samplePayload: {
      event: 'outlook.event.created',
      mailbox: 'partner@lawfirm.com',
      subject: 'Initial Retainer Consultation',
      start: '2026-09-24T10:00:00-04:00',
      end: '2026-09-24T11:00:00-04:00',
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    },
  },
  {
    id: 'cal-com',
    name: 'Cal.com',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'One-Click',
    tone: 'mint',
    tagline: 'Open-source scheduling with round-robin host routing.',
    overview:
      'Direct integration with Cal.com event types. Distribute booked leads across team members using weighted round-robin distribution, dynamic booking questions, and automated reminder sequences.',
    features: [
      'Weighted round-robin host assignment',
      'Custom booking questions piped into conversation summary',
      'Embedded Cal.com booking confirmation fallback',
      'Native time-zone conversion for global clients',
    ],
    latency: '150ms webhook trigger',
    security: 'API Key integration with HMAC signature verification',
    guideHref: '/support/calendar-booking',
    guideLabel: 'Read Calendar Booking Guide',
    samplePayload: {
      event: 'BOOKING_CREATED',
      eventTypeId: 84920,
      title: '30 Min Discovery with Crescelo Team',
      startTime: '2026-09-25T16:00:00.000Z',
      assignedUser: { id: 142, name: 'Elena Rostova' },
    },
  },
  {
    id: 'telnyx-voice',
    name: 'Telnyx Voice & TeXML',
    category: 'voice',
    categoryLabel: 'Phone & Voice',
    badge: 'Native',
    tone: 'pink',
    tagline: 'Inbound telephony worker with CPU speech synthesis.',
    overview:
      'Answers incoming phone calls directly with Crescelo’s local voice worker. Webhooks stream caller audio to faster-whisper on CPU, formulate knowledge answers and bookings, and synthesize neural speech with Piper in under 400ms without expensive per-minute transcription markups.',
    features: [
      'Sub-400ms voice turn-around latency',
      'Real-time caller interruption detection',
      'Wholesale carrier pricing directly on your Telnyx balance',
      'Automatic call summary, transcript, and SMS confirmation dispatch',
    ],
    latency: '380ms end-to-end voice turn',
    security: 'TeXML webhook signature verification via Ed25519 & HMAC-SHA256',
    guideHref: '/support/voice-agent',
    guideLabel: 'Read Voice Agent Setup Guide',
    samplePayload: {
      event: 'call.session.turn',
      call_control_id: 'v3:call_1947291a8',
      caller_number: '+15550192834',
      speech_text: 'Hi, I need an appointment for a haircut tomorrow afternoon.',
      detected_intent: 'appointment.request',
      suggested_slots: ['2:30 PM', '4:00 PM'],
    },
  },
  {
    id: 'twilio-streams',
    name: 'Twilio Media Streams',
    category: 'voice',
    categoryLabel: 'Phone & Voice',
    badge: 'Native',
    tone: 'amber',
    tagline: 'Bidirectional WebSocket audio streaming for phone lines.',
    overview:
      'Connect any existing Twilio phone number to Crescelo. Audio frames are streamed over secure bidirectional WebSockets (`wss://`) with mulaw 8kHz transcoding, enabling low-latency phone conversations backed by your assistant’s verified knowledge base.',
    features: [
      'Bidirectional WebSocket media stream routing',
      'Native Twilio TwiML <Stream> and <Connect> actions',
      'DTMF keypad digit detection fallback',
      'Direct caller caller-ID lookup in CRM',
    ],
    latency: '410ms roundtrip audio turn',
    security: 'Twilio X-Twilio-Signature validation on all ingress webhooks',
    guideHref: '/support/voice-agent',
    guideLabel: 'Read Voice Agent Setup Guide',
    samplePayload: {
      event: 'media.stream.start',
      streamSid: 'MZ182937401928384',
      callSid: 'CA817263548192837',
      tracks: ['inbound', 'outbound'],
      customParameters: { assistantId: 'ast_prod_01' },
    },
  },
  {
    id: 'whatsapp-cloud',
    name: 'WhatsApp Business Cloud API',
    category: 'messaging',
    categoryLabel: 'Messaging Channels',
    badge: 'Native',
    tone: 'lime',
    tagline: 'Turn WhatsApp conversations into scheduled appointments.',
    overview:
      'Deploy your assistant directly on your official WhatsApp Business number via Meta Cloud API. Send interactive slot selection buttons, rich list messages, and automatic booking reminders straight to customer chat threads.',
    features: [
      'Interactive quick-reply buttons and list pickers',
      '24-hour customer service window management',
      'Rich media handling (PDF pricing guides, images, locations)',
      'Verified Meta Cloud API webhook routing',
    ],
    latency: '< 200ms message delivery',
    security: 'Meta App Secret Proof and SHA-256 HMAC payload verification',
    samplePayload: {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '15559876543',
                    id: 'wamid.HBgL...',
                    text: { body: 'Can I book a consultation for Thursday?' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'telegram-bot',
    name: 'Telegram Bot API',
    category: 'messaging',
    categoryLabel: 'Messaging Channels',
    badge: 'Native',
    tone: 'lav',
    tagline: 'Instant 24/7 client assistant inside Telegram.',
    overview:
      'Connect any Telegram bot token. The assistant processes incoming queries, conducts preliminary intake questionnaires, links to verified knowledge sources, and triggers appointment booking without requiring any external server.',
    features: [
      'Instant bot token setup in Crescelo dashboard',
      'Inline keyboard slot selection',
      'Voice note speech-to-text processing',
      'Automatic conversation history persistence',
    ],
    latency: '95ms webhook turnaround',
    security: 'Telegram Bot Secret Token validation on all incoming updates',
    samplePayload: {
      update_id: 819203,
      message: {
        message_id: 42,
        from: { id: 918234, first_name: 'Alex' },
        chat: { id: 918234, type: 'private' },
        text: 'What are your weekend consultation rates?',
      },
    },
  },
  {
    id: 'web-widget',
    name: 'Embeddable Web Widget',
    category: 'messaging',
    categoryLabel: 'Messaging Channels',
    badge: 'Native',
    tone: 'mint',
    tagline: 'Lightweight zero-dependency chat widget for any website.',
    overview:
      'A single 14KB script tag embed that runs on WordPress, Shopify, Webflow, Squarespace, Wix, or custom React/HTML apps. Features customizable brand themes, proactive greetings, sound effects, and inline calendar booking.',
    features: [
      '14KB gzipped bundle with zero external dependencies',
      'Proactive trigger rules based on URL path and scroll depth',
      'WCAG 2.1 AA accessible with full keyboard navigation',
      'Custom CSS variable theming matching your site brand',
    ],
    latency: 'Instant script initialization',
    security: 'Content Security Policy compliant, sandboxed iframe option',
    samplePayload: {
      event: 'widget.interaction',
      visitorId: 'vis_81203',
      pageUrl: 'https://myshop.com/services',
      sessionTurns: 4,
      convertedToLead: true,
    },
  },
  {
    id: 'groq-lpu',
    name: 'Groq LPU Inference',
    category: 'ai',
    categoryLabel: 'AI Providers (BYOK)',
    badge: 'BYOK',
    tone: 'pink',
    tagline: 'Sub-200ms Time-To-First-Token generation with Llama 3.3.',
    overview:
      'Run blazing-fast open-weight models at 500+ tokens per second on Groq LPUs. Provides instant response streaming for voice synthesis and real-time chat with 0% token markup.',
    features: [
      'Sub-200ms TTFT (Time To First Token)',
      'Llama 3.3 70B & 8B model selection',
      '0% platform markup: pay wholesale direct to Groq',
      'High-throughput streaming for real-time telephony',
    ],
    latency: '140ms first token',
    security: 'API keys stored in AES-256 encrypted database vaults',
    samplePayload: {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 512,
      usage: { prompt_tokens: 1420, completion_tokens: 64, total_tokens: 1484 },
    },
  },
  {
    id: 'openai-gpt4o',
    name: 'OpenAI (GPT-4o & o3)',
    category: 'ai',
    categoryLabel: 'AI Providers (BYOK)',
    badge: 'BYOK',
    tone: 'amber',
    tagline: 'State-of-the-art multilingual conversation and reasoning.',
    overview:
      'Bring your own OpenAI API key to power your assistant with GPT-4o, GPT-4o-mini, or o3-mini. Perfect for multi-lingual international clientele, complex constraint satisfaction, and nuanced service negotiation.',
    features: [
      'Native support for GPT-4o and lightweight mini models',
      'Structured Outputs via JSON Schema enforcement',
      'BYOK model: zero platform token surcharges',
      'Automated fallback routing if rate limits occur',
    ],
    latency: '290ms first token',
    security: 'Encrypted storage with optional client-side API key masking',
    samplePayload: {
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      tokens: { prompt: 840, completion: 48 },
    },
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    category: 'ai',
    categoryLabel: 'AI Providers (BYOK)',
    badge: 'BYOK',
    tone: 'lime',
    tagline: 'Massive context windows for comprehensive manuals and policy books.',
    overview:
      'Leverage Google Gemini 2.5 Flash and Pro with up to 1M+ token context windows. Allows assistants to reason across entire product catalogs, medical protocols, and hundreds of pages of company SOPs with high fidelity.',
    features: [
      'Gemini 2.5 Flash and Pro support',
      'Massive context retrieval across extensive PDF collections',
      'Cost-effective high-token throughput',
      'Direct integration via Google Cloud AI platform or Gemini API',
    ],
    latency: '220ms first token',
    security: 'Google Cloud IAM or API key with per-workspace quotas',
    samplePayload: {
      model: 'gemini-2.5-flash',
      groundingMetadata: { searchChunks: 3, confidence: 0.98 },
    },
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    category: 'ai',
    categoryLabel: 'AI Providers (BYOK)',
    badge: 'BYOK',
    tone: 'lav',
    tagline: 'Empathetic tone of voice with steerable guidelines.',
    overview:
      'Connect Claude 3.5 Sonnet or Haiku for articulate, human-like dialogue. Claude excels at adhering strictly to negative constraints, maintaining polite boundary enforcement, and avoiding hallucinations.',
    features: [
      'Claude 3.5 Sonnet & Haiku 3.5 support',
      'Strict constraint following and zero medical/legal drift',
      'Natural conversational cadence for customer support',
      'Wholesale BYOK pricing directly on your Anthropic console',
    ],
    latency: '260ms first token',
    security: 'Stored in secure enclave, refreshed on demand',
    samplePayload: {
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'end_turn',
      usage: { input_tokens: 950, output_tokens: 58 },
    },
  },
  {
    id: 'supabase-db',
    name: 'Supabase PostgreSQL & Vector',
    category: 'crm',
    categoryLabel: 'CRM & Storage',
    badge: 'Native',
    tone: 'mint',
    tagline: 'Persistent relational storage and pgvector similarity embeddings.',
    overview:
      'Connect your Supabase PostgreSQL database to store complete conversation records, customer lead profiles, audit logs, and vector embeddings with Row-Level Security (RLS).',
    features: [
      'Relational schema for leads, appointments, and messages',
      'pgvector cosine similarity search for document chunks',
      'Row-Level Security (RLS) ensuring strict multi-tenant isolation',
      'Realtime database change subscriptions',
    ],
    latency: '15ms database query',
    security: 'PostgreSQL Row-Level Security with encrypted connection pooling',
    guideHref: '/support/rag-knowledge',
    guideLabel: 'Read RAG Knowledge Guide',
    samplePayload: {
      table: 'crescelo_appointments',
      action: 'INSERT',
      record: {
        id: 'apt_91283',
        customer_name: 'David Vance',
        service: 'Discovery Consultation',
        status: 'confirmed',
        created_at: '2026-09-22T08:00:00Z',
      },
    },
  },
  {
    id: 'outbound-webhooks',
    name: 'Outbound Webhooks & Zapier',
    category: 'crm',
    categoryLabel: 'CRM & Storage',
    badge: 'Webhook',
    tone: 'amber',
    tagline: 'Real-time JSON event dispatch to HubSpot, Slack, and Make.com.',
    overview:
      'Trigger custom HTTPS POST webhooks whenever an appointment is booked, a high-intent lead is captured, or an escalation occurs. Pipe verified event payloads straight into Zapier, Make.com, HubSpot, or your custom internal API.',
    features: [
      'Real-time HTTPS POST delivery with exponential backoff retries',
      'HMAC-SHA256 signature verification header (`X-Crescelo-Signature`)',
      'Filtered trigger events (leads only, bookings only, all turns)',
      'Pre-configured Zapier and Make.com templates',
    ],
    latency: '< 50ms webhook dispatch',
    security: 'Signed payloads with timestamp replay attack protection',
    samplePayload: {
      event: 'lead.captured',
      timestamp: 1790046900,
      lead: {
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne.io',
        phone: '+15550192834',
        budget: '$10,000+',
        notes: 'Interested in enterprise voice worker deployment',
      },
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Ecosystem' },
  { id: 'calendar', label: 'Calendars' },
  { id: 'voice', label: 'Phone & Voice' },
  { id: 'messaging', label: 'Messaging Channels' },
  { id: 'ai', label: 'AI Engines (BYOK)' },
  { id: 'crm', label: 'Data & Webhooks' },
] as const;

export default function IntegrationsPage() {
  const [activeCat, setActiveCat] = useState<Category>('all');
  const [selectedId, setSelectedId] = useState<string>(INTEGRATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = INTEGRATIONS.filter((item) => {
    const matchesCat = activeCat === 'all' || item.category === activeCat;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedIntegration =
    INTEGRATIONS.find((item) => item.id === selectedId) || filtered[0] || INTEGRATIONS[0];

  return (
    <>
      <Header />
      <main id="main">
        {/* Integrations Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">CONNECTED ECOSYSTEM</p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              Connect with the <span className="mk-echo-em">tools</span> you run every day.
            </h1>
            <p className="mk-lead">
              From calendars and phone lines to AI engines and CRMs, Crescelo plugs directly into
              your existing workflow without requiring changes to your stack.
            </p>
            <div className="mk-cta-row">
              <ButtonLink href={SIGNUP_HREF}>Connect your first integration</ButtonLink>
              <ButtonLink href="/support/contact" variant="ghost">
                Request custom integration
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Visual Connectivity Diagram Banner */}
        <section className="mk-section" style={{ paddingBottom: '32px' }}>
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Architecture Flow"
              title="How Crescelo links your business in real time."
              intro="Click any integration below to inspect its live data flow, verification protocols, and integration guides."
              id="architecture-title"
              align="center"
            />

            {/* Interactive Ecosystem Explorer */}
            <div
              className="mk-card"
              style={{
                padding: '28px',
                background: 'var(--mk-surface)',
                marginTop: '32px',
                display: 'grid',
                gap: '24px',
              }}
            >
              {/* Category Filter & Search Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderBottom: '1.5px solid var(--mk-line)',
                  paddingBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORIES.map((c) => {
                    const isActive = activeCat === c.id;
                    const count =
                      c.id === 'all'
                        ? INTEGRATIONS.length
                        : INTEGRATIONS.filter((i) => i.category === c.id).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`mk-cockpit-tab ${isActive ? 'is-active' : ''}`}
                        onClick={() => setActiveCat(c.id as Category)}
                      >
                        {c.label} <small style={{ opacity: 0.75, marginLeft: '4px' }}>({count})</small>
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      border: '1.5px solid var(--mk-ink)',
                      fontSize: '14px',
                      background: 'var(--mk-bg)',
                    }}
                  />
                </div>
              </div>

              {/* Master-Detail Dual Pane View */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '32px',
                  alignItems: 'start',
                }}
              >
                {/* Left Column: Interactive Integration List */}
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', fontWeight: 700 }}>
                    Select an integration to read specifications ({filtered.length})
                  </p>

                  <div style={{ display: 'grid', gap: '10px', maxHeight: '680px', overflowY: 'auto', paddingRight: '6px' }}>
                    {filtered.map((item) => {
                      const isSelected = item.id === selectedIntegration.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          style={{
                            textAlign: 'left',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: '1.5px solid var(--mk-ink)',
                            background: isSelected ? 'var(--mk-deep)' : 'var(--mk-bg)',
                            color: isSelected ? 'var(--mk-bg)' : 'var(--mk-ink)',
                            boxShadow: isSelected ? '0 4px 0 var(--mk-ink)' : 'none',
                            transform: isSelected ? 'translateY(-2px)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'all 0.18s var(--mk-ease)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  background: isSelected ? 'rgba(171,255,68,0.2)' : 'var(--mk-lime-soft)',
                                  color: isSelected ? 'var(--mk-lime)' : 'var(--mk-deep)',
                                }}
                              >
                                {item.badge}
                              </span>
                              <span style={{ fontSize: '12px', color: isSelected ? '#a9c4b4' : 'var(--mk-muted)' }}>
                                {item.categoryLabel}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                              {item.name}
                            </h3>
                            <p
                              style={{
                                fontSize: '13px',
                                color: isSelected ? '#cfe3d6' : 'var(--mk-muted)',
                                margin: '4px 0 0',
                                lineHeight: 1.35,
                              }}
                            >
                              {item.tagline}
                            </p>
                          </div>

                          <span
                            style={{
                              fontSize: '20px',
                              fontWeight: 700,
                              color: isSelected ? 'var(--mk-lime)' : 'var(--mk-muted)',
                              transform: isSelected ? 'translateX(4px)' : 'none',
                              transition: 'transform 0.18s',
                            }}
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Deep-Dive Integration Reader */}
                <div
                  style={{
                    position: 'sticky',
                    top: '90px',
                    borderRadius: '24px',
                    border: '2px solid var(--mk-ink)',
                    background: 'var(--mk-bg)',
                    padding: '32px',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', borderBottom: '1.5px solid var(--mk-line)', paddingBottom: '20px', marginBottom: '24px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: 'var(--mk-lime)',
                            color: 'var(--mk-deep)',
                          }}
                        >
                          {selectedIntegration.badge}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-accent)' }}>
                          {selectedIntegration.categoryLabel}
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--mk-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: 0, lineHeight: 1.1 }}>
                        {selectedIntegration.name}
                      </h2>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, background: 'var(--mk-lav)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--mk-ink)' }}>
                        ⚡ {selectedIntegration.latency}
                      </span>
                    </div>
                  </div>

                  {/* Overview Paragraph */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', marginBottom: '8px' }}>
                      How It Works in Crescelo
                    </h3>
                    <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--mk-ink)' }}>
                      {selectedIntegration.overview}
                    </p>
                  </div>

                  {/* Feature Pillars */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', marginBottom: '12px' }}>
                      Core Capabilities
                    </h3>
                    <ul style={{ display: 'grid', gap: '8px', padding: 0, listStyle: 'none' }}>
                      {selectedIntegration.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Security Specs */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: 'var(--mk-accent-soft)',
                      border: '1.5px solid var(--mk-ink)',
                      marginBottom: '24px',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--mk-deep)' }}>
                      🔒 Security & Protocol
                    </strong>
                    <span style={{ color: 'var(--mk-ink)' }}>{selectedIntegration.security}</span>
                  </div>

                  {/* Live JSON Webhook Payload Preview */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', marginBottom: '8px' }}>
                      Sample Event Payload
                    </h3>
                    <pre
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--mk-deep)',
                        color: 'var(--mk-lime)',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        overflowX: 'auto',
                        fontFamily: 'monospace',
                        border: '1.5px solid var(--mk-ink)',
                        margin: 0,
                      }}
                    >
                      {JSON.stringify(selectedIntegration.samplePayload, null, 2)}
                    </pre>
                  </div>

                  {/* Action Link to Guide */}
                  {selectedIntegration.guideHref ? (
                    <div style={{ paddingTop: '8px' }}>
                      <Link
                        href={selectedIntegration.guideHref}
                        className="mk-btn mk-btn-primary"
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        {selectedIntegration.guideLabel || 'View Setup Documentation'} →
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mk-final" aria-labelledby="mk-final-title" style={{ marginTop: '56px' }}>
          <div className="mk-wrap">
            <Reveal className="mk-final-inner">
              <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
                Build your autonomous stack with Crescelo.
              </h2>
              <p className="mk-lead">
                No vendor lock-in. No per-minute markups. Complete ownership of your schedule and customer relationships.
              </p>
              <div className="mk-cta-row">
                <ButtonLink href={SIGNUP_HREF}>Start your 14-day trial</ButtonLink>
                <ButtonLink href="/support/contact" variant="ghost">
                  Book an onboarding call
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
