'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

type Category = 'all' | 'calendar' | 'voice' | 'messaging' | 'ai' | 'crm';

interface IntegrationItem {
  name: string;
  category: Category;
  categoryLabel: string;
  badge: 'Native' | 'One-Click' | 'BYOK' | 'Webhook';
  desc: string;
  tone: 'lime' | 'lav' | 'mint' | 'pink' | 'amber';
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: 'Google Calendar',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'Native',
    desc: 'Two-way slot verification and automated booking dispatch. Syncs appointments to staff calendars with Google Meet links.',
    tone: 'lime',
  },
  {
    name: 'Microsoft Outlook & 365',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'Native',
    desc: 'Enterprise scheduling sync for Outlook calendars. Prevents double-booking across team schedules automatically.',
    tone: 'lav',
  },
  {
    name: 'Cal.com',
    category: 'calendar',
    categoryLabel: 'Calendar Sync',
    badge: 'One-Click',
    desc: 'Round-robin host allocation and dynamic buffer periods integrated straight into chat booking flows.',
    tone: 'mint',
  },
  {
    name: 'Telnyx TeXML Telephony',
    category: 'voice',
    categoryLabel: 'Phone & Voice',
    badge: 'Native',
    desc: 'Inbound phone calls answered by Crescelo voice-worker with sub-second latency and interruption support at wholesale rates.',
    tone: 'pink',
  },
  {
    name: 'Twilio Media Streams',
    category: 'voice',
    categoryLabel: 'Phone & Voice',
    badge: 'Native',
    desc: 'Bidirectional WebSocket audio streaming for phone numbers. Connects callers directly to faster-whisper and Piper TTS.',
    tone: 'amber',
  },
  {
    name: 'WhatsApp Business Cloud API',
    category: 'messaging',
    categoryLabel: 'Omnichannel',
    badge: 'Native',
    desc: 'Turn customer WhatsApp conversations into booked appointments. Verified Meta webhook integration with rich reply buttons.',
    tone: 'lime',
  },
  {
    name: 'Telegram Bot API',
    category: 'messaging',
    categoryLabel: 'Omnichannel',
    badge: 'Native',
    desc: 'Deploy your trained assistant as an official Telegram bot. Answers documentation questions and captures leads in chat.',
    tone: 'lav',
  },
  {
    name: 'Embeddable Web Widget',
    category: 'messaging',
    categoryLabel: 'Omnichannel',
    badge: 'Native',
    desc: 'Lightweight script tag embed. Works seamlessly on WordPress, Shopify, Webflow, Squarespace, and custom HTML.',
    tone: 'mint',
  },
  {
    name: 'Groq LPU Inference',
    category: 'ai',
    categoryLabel: 'AI Engine',
    badge: 'BYOK',
    desc: 'Ultra-fast sub-200ms Time-To-First-Token generation with Llama 3.3 70B. 0% markup with wholesale billing direct to Groq.',
    tone: 'pink',
  },
  {
    name: 'OpenAI (GPT-4o & o3)',
    category: 'ai',
    categoryLabel: 'AI Engine',
    badge: 'BYOK',
    desc: 'Plug in your OpenAI key for state-of-the-art conversational nuance, multilingual translation, and reasoning.',
    tone: 'amber',
  },
  {
    name: 'Google Gemini',
    category: 'ai',
    categoryLabel: 'AI Engine',
    badge: 'BYOK',
    desc: 'Leverage Gemini 2.5 Flash and Pro for immense context windows across long manuals, policy books, and catalogs.',
    tone: 'lime',
  },
  {
    name: 'Anthropic Claude',
    category: 'ai',
    categoryLabel: 'AI Engine',
    badge: 'BYOK',
    desc: 'Connect Claude 3.5 Sonnet or Haiku for steerable, empathetic tone of voice and strict constraint adherence.',
    tone: 'lav',
  },
  {
    name: 'Local Ollama Instance',
    category: 'ai',
    categoryLabel: 'AI Engine',
    badge: 'BYOK',
    desc: 'Run completely private open-weights models (DeepSeek, Llama, Qwen) on your own local GPU with zero external cloud calls.',
    tone: 'mint',
  },
  {
    name: 'Supabase PostgreSQL & Vector',
    category: 'crm',
    categoryLabel: 'Data & Storage',
    badge: 'Native',
    desc: 'Persistent relational appointment records, audit logs, and pgvector embeddings with Row-Level Security.',
    tone: 'pink',
  },
  {
    name: 'Upstash Redis',
    category: 'crm',
    categoryLabel: 'Data & Storage',
    badge: 'One-Click',
    desc: 'Serverless L2 cache layer for high-speed session storage, rate limiting, and ephemeral instance persistence.',
    tone: 'amber',
  },
  {
    name: 'Outbound Webhooks & Zapier',
    category: 'crm',
    categoryLabel: 'CRM & Automation',
    badge: 'Webhook',
    desc: 'Send real-time JSON payloads to HubSpot, Salesforce, Slack, or Make.com whenever an appointment is confirmed or lead captured.',
    tone: 'lime',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Integrations' },
  { id: 'calendar', label: 'Calendars' },
  { id: 'voice', label: 'Phone & Voice' },
  { id: 'messaging', label: 'Messaging Channels' },
  { id: 'ai', label: 'AI Providers (BYOK)' },
  { id: 'crm', label: 'CRM & Storage' },
] as const;

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<Category>('all');

  const filtered =
    activeTab === 'all'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((item) => item.category === activeTab);

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
                Request an integration
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Directory Section */}
        <section className="mk-section">
          <div className="mk-wrap">
            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '48px',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id as Category)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: '1.5px solid var(--mk-ink)',
                    cursor: 'pointer',
                    background: activeTab === cat.id ? 'var(--mk-deep)' : 'var(--mk-surface)',
                    color: activeTab === cat.id ? 'var(--mk-bg)' : 'var(--mk-deep)',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {filtered.map((item) => (
                <Reveal
                  key={item.name}
                  as="article"
                  className="mk-card"
                  style={{
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-muted)', fontWeight: 700 }}>
                        {item.categoryLabel}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          border: '1px solid var(--mk-ink)',
                          background: `var(--mk-${item.tone})`,
                          color: 'var(--mk-deep)',
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{item.name}</h3>
                    <p style={{ color: 'var(--mk-muted)', fontSize: '14.5px', lineHeight: 1.55 }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '16px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--mk-accent)', fontWeight: 600 }}>
                      Setup in &lt; 2 minutes
                    </span>
                    <ButtonLink href={SIGNUP_HREF} className="mk-btn-sm" variant="ghost">
                      Configure →
                    </ButtonLink>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mk-final" style={{ margin: '48px 12px 12px 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>GET STARTED</p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              Ready to automate customer bookings across your stack?
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              Create an assistant in under 5 minutes. Connect your calendar and test it live.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/support" variant="ghost" style={{ borderColor: '#fff', color: '#fff' }}>
                Browse integration guides
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
