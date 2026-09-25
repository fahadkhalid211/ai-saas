import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';

// Not available yet: kept out of search results until phone calls ship.
export const metadata: Metadata = {
  alternates: { canonical: '/support/voice-agent' },
  title: 'Phone Voice Calls: Coming Soon | Crescelo Support',
  description: 'Answering phone calls with your Crescelo assistant is under development.',
  robots: { index: false, follow: true },
};

export default function VoiceAgentGuidePage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <Link href="/support" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-accent)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              ← Back to Help Center
            </Link>

            <SectionHead
              as="h1"
              eyebrow="COMING SOON"
              title="Phone calls are under development."
              intro="We are building an assistant that answers inbound phone calls from your knowledge base and books appointments by voice. It is not available yet, so there is nothing to set up today."
              id="voice-title"
              align="left"
            />

            <div className="mk-card" style={{ padding: '28px', marginTop: '24px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>What works today</p>
              <p style={{ color: 'var(--mk-muted)' }}>
                The website chat widget, WhatsApp and Telegram all answer from the same knowledge base and book appointments. Follow the progress of phone calls on the roadmap.
              </p>
              <div className="mk-cta-row" style={{ marginTop: '20px' }}>
                <ButtonLink href="/roadmap">See the roadmap</ButtonLink>
                <ButtonLink href="/support/contact" variant="ghost">
                  Ask us a question
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
