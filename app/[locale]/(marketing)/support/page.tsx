import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support' },
  title: 'Help Center & Documentation | Crescelo',
  description:
    'Setup guides for connecting your AI provider, adding the chat widget, booking, leads and WhatsApp or Telegram, plus how to open a support ticket.',
}, '/support'));
}

const TOPIC_HUBS = [
  {
    title: 'AI Platform Connectors & BYOK',
    desc: 'Step-by-step guides for connecting OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek, and local Ollama.',
    href: '/support/ai-connectors',
    tone: 'lime',
    count: '7 Guides',
  },
  {
    title: 'Inbound Phone Voice Calling',
    desc: 'Coming soon. Answering phone calls with your assistant is under development; the setup guide will be published when it ships.',
    href: '/support/voice-agent',
    tone: 'lav',
    count: 'Coming soon',
  },
  {
    title: 'Calendar Links & Booking Checks',
    desc: 'Linking your Google, Apple or Outlook calendar, the busy-only Crescelo calendar link, and how every booking is checked before it is confirmed.',
    href: '/support/calendar-booking',
    tone: 'mint',
    count: '4 Guides',
  },
  {
    title: 'Knowledge Base & RAG Indexing',
    desc: 'Uploading documents, scraping website URLs, and troubleshooting vector retrieval diagnostics.',
    href: '/support/rag-knowledge',
    tone: 'amber',
    count: '5 Guides',
  },
  {
    title: 'Widget & Website Embedding',
    desc: 'Adding the script tag to WordPress, Shopify, Webflow, or custom HTML with custom brand colors.',
    href: '/guides/add-ai-assistant-to-wordpress',
    tone: 'pink',
    count: '3 Guides',
  },
  {
    title: 'Omnichannel: WhatsApp & Telegram',
    desc: 'Connecting Meta WhatsApp Business Cloud webhooks and creating official Telegram bots.',
    href: '/integrations',
    tone: 'lime',
    count: '2 Guides',
  },
];

const POPULAR_ARTICLES = [
  {
    title: 'How to connect OpenAI (GPT-4o & GPT-4o-mini) to Crescelo',
    href: '/support/ai-connectors/openai',
    cat: 'AI Models',
  },
  {
    title: 'How to connect Google Gemini with free API key and 1M context',
    href: '/support/ai-connectors/gemini',
    cat: 'AI Models',
  },
  {
    title: 'Achieving ~500+ tokens/sec with Groq Cloud Llama 3.3 for free',
    href: '/support/ai-connectors/groq',
    cat: 'AI Models',
  },
  {
    title: 'How to connect Anthropic Claude 3.5 Sonnet & Haiku',
    href: '/support/ai-connectors/anthropic',
    cat: 'AI Models',
  },
  {
    title: 'Subscribing to your bookings in Google Calendar or Outlook',
    href: '/support/calendar-booking',
    cat: 'Calendar',
  },
  {
    title: 'How to run 100% private offline inference with local Ollama',
    href: '/support/ai-connectors/ollama',
    cat: 'AI Models',
  },
];

export default function SupportPage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Help Center & Documentation', 'Setup guides for connecting your AI provider, adding the chat widget, booking, leads and WhatsApp or Telegram, plus how to open a support ticket.', '/support'), breadcrumbSchema([{ name: 'Support', path: '/support' }])]} />
      <Header />
      <main id="main">
        {/* Support Hero with Search Bar Look */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              <T>HELP CENTER</T>
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                <T>Find what you need.</T> <span className="mk-echo-em"><T>Get it working.</T></span>
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              <T>Step-by-step guides for setting up your assistant, connecting your AI key, syncing your calendar, and going live on your website or messaging channels.</T>
            </p>

            {/* Quick action buttons */}
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href="/support/contact"><T>Contact Support</T></ButtonLink>
              <ButtonLink href="/report-bug" variant="ghost">
                <T>Report a Bug</T>
              </ButtonLink>
              <ButtonLink href="/support/ticket" variant="ghost">
                <T>Check a ticket</T>
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Browse by topic"
              title="Everything you need to go from zero to live."
              intro="Guides organised by feature area. Start with AI connectors if you are just getting set up."
              id="topics"
              align="center"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '24px',
                marginTop: '48px',
              }}
            >
              {TOPIC_HUBS.map((hub) => (
                <Reveal
                  key={hub.title}
                  as="article"
                  className="mk-card"
                  style={{
                    padding: 'clamp(20px, 4vw, 32px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          border: '1px solid var(--mk-ink)',
                          background: `var(--mk-${hub.tone})`,
                          color: 'var(--mk-deep)',
                        }}
                      >
                        <T>{hub.count}</T>
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>{hub.title}</T></h3>
                    <p style={{ color: 'var(--mk-muted)', fontSize: '14.5px', lineHeight: 1.55 }}>
                      <T>{hub.desc}</T>
                    </p>
                  </div>

                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--mk-line)', paddingTop: '16px' }}>
                    <Link
                      href={hub.href}
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--mk-deep)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <T>Read documentation →</T>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mk-section mk-section-tint">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <SectionHead
              eyebrow="Popular Articles"
              title="Frequently viewed setup instructions."
              id="popular"
              align="center"
            />

            <div style={{ display: 'grid', gap: '12px', marginTop: '36px' }}>
              {POPULAR_ARTICLES.map((art, idx) => (
                <Link
                  key={idx}
                  href={art.href}
                  className="mk-card"
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, background-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--mk-surface)',
                        border: '1px solid var(--mk-line)',
                        color: 'var(--mk-deep)',
                      }}
                    >
                      <T>{art.cat}</T>
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mk-deep)' }}>
                      <T>{art.title}</T>
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', color: 'var(--mk-muted)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Banner */}
        <section className="mk-final" style={{ margin: '48px 0.75rem 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}><T>NEED ASSISTANCE?</T></p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              <T>Still have questions? Our engineering team is here.</T>
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              <T>Send us a ticket, ask for custom integration support, or talk directly with a specialist.</T>
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href="/support/contact"><T>Open support request</T></ButtonLink>
              <ButtonLink href="/report-bug" variant="ghost">
                <T>Report a Bug</T>
              </ButtonLink>
              <ButtonLink href="/support/ticket" variant="ghost">
                <T>Check a ticket</T>
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
