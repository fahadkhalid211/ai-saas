import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import type { Metadata } from 'next';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';

// Not available yet: kept out of search results until phone calls ship.
export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  alternates: { canonical: '/support/voice-agent' },
  title: 'Phone Voice Calls: Coming Soon | Crescelo Support',
  description: 'Answering phone calls with your Crescelo assistant is under development.',
  robots: { index: false, follow: true },
});
}

export default function VoiceAgentGuidePage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <Link href="/support" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-accent)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              <T>← Back to Help Center</T>
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
              <p style={{ fontWeight: 700, marginBottom: '8px' }}><T>What works today</T></p>
              <p style={{ color: 'var(--mk-muted)' }}>
                <T>The website chat widget, WhatsApp and Telegram all answer from the same knowledge base and book appointments. Follow the progress of phone calls on the roadmap.</T>
              </p>
              <div className="mk-cta-row" style={{ marginTop: '20px' }}>
                <ButtonLink href="/roadmap"><T>See the roadmap</T></ButtonLink>
                <ButtonLink href="/support/contact" variant="ghost">
                  <T>Ask us a question</T>
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
