import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';

export const metadata: Metadata = withSocial({
  alternates: { canonical: '/support/voice-agent' },
  title: 'Voice Agent & Inbound Phone Setup Guide | Crescelo Support',
  description:
    'Complete setup guide for answering inbound telephone calls with the Crescelo voice worker, Telnyx TeXML, and local faster-whisper CPU inference.',
}, '/support/voice-agent');

export default function VoiceAgentGuidePage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <Link
              href="/support"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--mk-accent)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '20px',
              }}
            >
              ← Back to Help Center
            </Link>

            <SectionHead
              as="h1"
              eyebrow="TELEPHONY SETUP GUIDE"
              title="Connecting Inbound AI Phone Calls"
              intro="How to give your Crescelo assistant a real phone number so callers can ask questions, verify hours, and book appointments over the phone."
              id="voice-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '32px', marginTop: '40px' }}>
              {/* Step 1 */}
              <div className="mk-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ background: 'var(--mk-lime)', padding: '4px 10px', borderRadius: '999px', fontWeight: 800, fontSize: '12px', border: '1px solid var(--mk-ink)' }}>
                    STEP 1
                  </span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Deploy the Voice Worker on a VPS</h3>
                </div>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  The voice worker is a lightweight Python microservice that handles real-time audio detection (Silero VAD), local speech-to-text (faster-whisper int8 on CPU), and neural voice synthesis (Piper TTS).
                </p>
                <div style={{ background: 'var(--mk-deep)', color: '#cfe3d6', padding: '16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '13px', marginTop: '16px', overflowX: 'auto' }}>
                  <code>
                    # Clone repository and navigate to voice-worker<br />
                    cd voice-worker<br />
                    cp .env.example .env<br />
                    docker compose up -d --build<br />
                    docker compose run --rm worker sh scripts/download-voice.sh en_US-lessac-medium
                  </code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mk-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ background: 'var(--mk-lav)', padding: '4px 10px', borderRadius: '999px', fontWeight: 800, fontSize: '12px', border: '1px solid var(--mk-ink)' }}>
                    STEP 2
                  </span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Configure DNS & SSL Certificate</h3>
                </div>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  Point an <strong>A record</strong> from your domain registrar (e.g. <code>voice.yourdomain.com</code>) to your VPS public IPv4 address. The built-in Caddy container will automatically provision a free Let&apos;s Encrypt SSL/TLS certificate for secure WebSockets (<code>wss://</code>).
                </p>
              </div>

              {/* Step 3 */}
              <div className="mk-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ background: 'var(--mk-mint)', padding: '4px 10px', borderRadius: '999px', fontWeight: 800, fontSize: '12px', border: '1px solid var(--mk-ink)' }}>
                    STEP 3
                  </span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Create Telnyx TeXML Application</h3>
                </div>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  1. Buy a local phone number in the Telnyx Portal.<br />
                  2. Create a TeXML Application and set the Webhook URL to:<br />
                  <code style={{ background: 'var(--mk-surface)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--mk-line)', display: 'inline-block', marginTop: '6px' }}>
                    https://YOUR-APP/api/channels/voice?k=YOUR_VOICE_WEBHOOK_SECRET
                  </code><br />
                  3. Assign your phone number to this TeXML application.
                </p>
              </div>

              {/* Step 4 */}
              <div className="mk-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ background: 'var(--mk-pink)', padding: '4px 10px', borderRadius: '999px', fontWeight: 800, fontSize: '12px', border: '1px solid var(--mk-ink)' }}>
                    STEP 4
                  </span>
                  <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Test Your Live Calling Assistant</h3>
                </div>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  Dial your phone number from a mobile phone. The assistant will answer with your custom greeting, listen to your inquiry, perform grounded RAG lookup, and schedule appointments into your calendar!
                </p>
              </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <ButtonLink href="/support/contact">Need help setting up? Contact engineering</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
