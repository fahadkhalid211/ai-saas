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
    name: 'Calendar feed (Google Calendar, Outlook, Apple)',
    category: 'calendar',
    categoryLabel: 'Calendar',
    badge: 'Native',
    tone: 'lime',
    tagline: 'Subscribe to your bookings in any calendar app.',
    overview:
      'Every assistant has a private calendar feed (iCalendar, .ics). Add its address to Google Calendar, Outlook or Apple Calendar with "subscribe from URL" and new bookings appear there. The feed is read-only: events you add in your calendar do not block times in Crescelo, and there is no two-way sync yet (see the roadmap).',
    features: [
      'Private, token-protected feed address per assistant',
      'Works with Google Calendar, Outlook and Apple Calendar subscriptions',
      'Slot locking so two visitors cannot take the same time',
      'Confirmation and reminder emails with self-service reschedule links',
    ],
    latency: 'Refresh rate is set by your calendar app',
    security: 'Feed address contains a secret token; regenerate it in the dashboard if it leaks',
    guideHref: '/support/calendar-booking',
    guideLabel: 'Read Calendar Booking Guide',
    samplePayload: {
      feedUrl: 'https://www.crescelo.com/api/appointments/calendar?assistantId=<your assistant>&token=<your private token>',
      format: 'iCalendar (.ics)',
      direction: 'Crescelo to your calendar (read-only)',
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
  {
    id: 'slack',
    name: 'Slack',
    category: 'messaging',
    categoryLabel: 'Messaging Channels',
    badge: 'Native',
    tone: 'lime',
    tagline: 'Instant Block Kit cards in team channels for leads & bookings.',
    overview:
      'Send structured, actionable notifications directly to any Slack channel whenever a prospective customer submits contact info or locks in an appointment. Team members get instant visibility with formatted lead details, contact links, and booking notes without context switching.',
    features: [
      'Interactive Slack Block Kit rich card formatting',
      'Configurable per-assistant channel routing via Incoming Webhooks',
      'Instant alerts for lead.created and appointment.created events',
      'Sub-80ms notification delivery with automatic SSRF protection',
    ],
    latency: '60ms delivery latency',
    security: 'Validated Incoming Webhook endpoint with SSRF & private IP filtering',
    samplePayload: {
      text: '🎯 New Lead Captured: Jordan Rivera (jordan@acme.com)',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎯 New Lead Captured!' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Lead Name:*\nJordan Rivera' },
            { type: 'mrkdwn', text: '*Email:*\njordan@acme.com' },
            { type: 'mrkdwn', text: '*Phone:*\n+1 (555) 438-9210' },
            { type: 'mrkdwn', text: '*Source:*\nWebsite Live Chat' },
          ],
        },
      ],
    },
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'crm',
    categoryLabel: 'CRM & Storage',
    badge: 'Native',
    tone: 'mint',
    tagline: 'Zero-code auto-sync appending formatted rows in real time.',
    overview:
      'Automatically append structured tabular rows into any Google Sheet the instant an appointment is booked or a lead is captured. Includes an auto-header creation template with customer contact details, service types, scheduled dates, and notes for immediate team collaboration without paid database tools.',
    features: [
      'Auto-appends structured 12-column customer rows in real time',
      'Includes 30-second copy-paste Google Apps Script Web App template',
      'Zero per-seat or third-party automation tool costs',
      'Concurrency lock protection preventing row collisions',
    ],
    latency: '120ms append latency',
    security: 'TLS encrypted transport with least-privilege Web App authorization',
    samplePayload: {
      event: 'appointment.created',
      assistantName: 'Corporate Concierge',
      customerName: 'Marcus Brody',
      customerEmail: 'marcus@brody.io',
      customerPhone: '+1 (555) 019-2834',
      service: 'Haircut & Styling',
      appointmentDate: '2026-09-23',
      appointmentTime: '2:30 PM',
      duration: '30m',
      notes: 'Confirmed slot via Web Chat',
      source: 'Calendar Booking',
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
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              INTEGRATIONS
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Plugs into the <span className="mk-echo-em">tools</span> you already run.
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              Calendars, messaging apps, AI providers, webhooks — Crescelo connects to your existing setup without you having to rebuild anything.
            </p>
            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}>Start your 14-day free trial</ButtonLink>
              <ButtonLink href="/support/contact" variant="ghost">
                Request an integration
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Visual Connectivity Diagram Banner */}
        <section className="mk-section" style={{ paddingBottom: '32px' }}>
          <div className="mk-wrap">
            <SectionHead
              eyebrow="How it connects"
              title="One assistant. Every channel."
              intro="Click any integration below to see how it works, what it sends, and how to set it up."
              id="architecture-title"
              align="center"
            />

            {/* Interactive Ecosystem Explorer */}
            <div
              className="mk-card"
              style={{
                padding: 'clamp(18px, 4vw, 28px)',
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

                <div style={{ position: 'relative', width: '100%', maxWidth: '320px', minWidth: 'min(100%, 200px)' }}>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: '32px',
                  alignItems: 'start',
                }}
              >
                {/* Left Column: Interactive Integration List */}
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', fontWeight: 700 }}>
                    Select an integration to read specifications ({filtered.length})
                  </p>

                  <div data-lenis-prevent style={{ display: 'grid', gap: '10px', maxHeight: '680px', overflowY: 'auto', paddingRight: '6px' }}>
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
                    padding: 'clamp(18px, 4vw, 32px)',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                    maxWidth: '100%',
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
                        maxWidth: '100%',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
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
                <ButtonLink href={SIGNUP_HREF}>Start your 14-day free trial</ButtonLink>
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
