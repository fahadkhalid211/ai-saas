import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';

export const metadata: Metadata = {
  title: 'Help Center & Documentation | Crescelo',
  description:
    'Documentation, setup guides, and technical support for Crescelo autonomous website and phone assistants.',
};

const TOPIC_HUBS = [
  {
    title: 'Inbound Phone Voice Calling',
    desc: 'How to purchase numbers on Telnyx or Twilio, configure TeXML webhooks, and run the sub-second voice worker.',
    href: '/support/voice-agent',
    tone: 'lime',
    count: '3 Guides',
  },
  {
    title: 'Calendar Sync & Concurrency Locks',
    desc: 'Connecting Google Calendar & Outlook, configuring buffer durations, and understanding atomic mutex slot locks.',
    href: '/support/calendar-booking',
    tone: 'lav',
    count: '4 Guides',
  },
  {
    title: 'Knowledge Base & RAG Indexing',
    desc: 'Uploading documents, scraping website URLs, and troubleshooting vector retrieval diagnostics.',
    href: '/support/rag-knowledge',
    tone: 'mint',
    count: '5 Guides',
  },
  {
    title: 'Widget & Website Embedding',
    desc: 'Adding the script tag to WordPress, Shopify, Webflow, or custom HTML with custom brand colors.',
    href: '/support#embeds',
    tone: 'pink',
    count: '3 Guides',
  },
  {
    title: 'Omnichannel: WhatsApp & Telegram',
    desc: 'Connecting Meta WhatsApp Business Cloud webhooks and creating official Telegram bots.',
    href: '/integrations',
    tone: 'amber',
    count: '2 Guides',
  },
  {
    title: 'Security, BYOK & Admin Passcodes',
    desc: 'Configuring AES-256 GCM vault encryption, master login passcodes, and managing team access.',
    href: '/product#specifications',
    tone: 'lime',
    count: '4 Guides',
  },
];

const POPULAR_ARTICLES = [
  {
    title: 'How to connect an inbound phone number for AI voice calls',
    href: '/support/voice-agent',
    cat: 'Telephony',
  },
  {
    title: 'Setting up Google Calendar two-way synchronization',
    href: '/support/calendar-booking',
    cat: 'Calendar',
  },
  {
    title: 'Best practices for document formatting and vector chunking',
    href: '/support/rag-knowledge',
    cat: 'Knowledge',
  },
  {
    title: 'Configuring Bring-Your-Own-Key (BYOK) for Groq, OpenAI & Gemini',
    href: '/product#architecture',
    cat: 'AI Models',
  },
  {
    title: 'How to embed the chat bubble on Webflow or WordPress',
    href: '/support/contact',
    cat: 'Integration',
  },
];

export default function SupportPage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Support Hero with Search Bar Look */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">HELP CENTER & KNOWLEDGE BASE</p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How can we <span className="mk-echo-em">help</span> you today?
            </h1>
            <p className="mk-lead">
              Find technical setup guides, integration walkthroughs, and architecture documentation
              for your Crescelo assistant.
            </p>

            {/* Quick action buttons */}
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href="/support/contact">Contact Support Team</ButtonLink>
              <ButtonLink href="/support/voice-agent" variant="ghost">
                Phone Setup Guide
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Browse by Topic"
              title="Everything you need to launch and scale."
              intro="Comprehensive guides organized by feature and operational area."
              id="topics"
              align="center"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                    padding: '32px',
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
                        {hub.count}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{hub.title}</h3>
                    <p style={{ color: 'var(--mk-muted)', fontSize: '14.5px', lineHeight: 1.55 }}>
                      {hub.desc}
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
                      Read documentation →
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
                        color: 'var(--mk-muted)',
                      }}
                    >
                      {art.cat}
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--mk-deep)' }}>
                      {art.title}
                    </strong>
                  </div>
                  <span style={{ fontSize: '18px', color: 'var(--mk-muted)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Banner */}
        <section className="mk-final" style={{ margin: '48px 12px 12px 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>NEED ASSISTANCE?</p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              Still have questions? Our engineering team is here.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              Send us a ticket, ask for custom integration support, or talk directly with a specialist.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href="/support/contact">Open support request</ButtonLink>
              <ButtonLink href="mailto:contact@crescelo.com" variant="ghost" style={{ borderColor: '#fff', color: '#fff' }}>
                Email contact@crescelo.com
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
