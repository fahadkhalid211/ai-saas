import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Lock,
  Terminal,
  Server,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Connect Local Ollama to Crescelo | 100% Offline AI Guide',
  description:
    'Complete guide to install Ollama, pull local open-source models (Llama 3.2, Mistral), configure CORS origins, and run 100% private offline inference on Crescelo.',
};

export default function OllamaGuidePage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Breadcrumb & Hero */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link href="/support" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                Help Center
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <Link href="/support/ai-connectors" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                AI Connectors
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>Local Server (Ollama)</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Lock style={{ width: '13px', height: '13px' }} />
              <span>100% Air-Gapped Privacy • Zero Cloud Dependencies</span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How to connect <span className="mk-echo-em">Local Ollama</span> to Crescelo.
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              Run Llama 3.2, Mistral, or Qwen entirely on your own hardware.
              Follow this step-by-step guide to download Ollama, configure cross-origin permissions, and connect your assistant.
            </p>
          </div>
        </section>

        {/* Step-by-Step Guide Section */}
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '860px' }}>
            {/* Quick Summary Card */}
            <div
              style={{
                borderRadius: '16px',
                border: '1.5px solid var(--mk-ink)',
                background: 'var(--mk-surface)',
                padding: '24px',
                marginBottom: '36px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Estimated Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>5 Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Cloud Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>$0.00 Forever</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Recommended Model</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>llama3.2:3b / llama3.1:8b</div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  1
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Download &amp; Install Ollama
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Download the free Ollama installer for your operating system:
              </p>
              <div style={{ margin: '16px 0' }}>
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--mk-sand)',
                    border: '1.5px solid var(--mk-ink)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--mk-ink)',
                    textDecoration: 'none',
                  }}
                >
                  <span>Download from ollama.com</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Ollama runs locally on macOS (Apple Silicon M1/M2/M3/M4 is exceptionally fast), Windows, and Linux.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  2
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Pull Your Desired Open-Source Model
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Open your terminal (Terminal on Mac/Linux, PowerShell or Command Prompt on Windows) and run:
              </p>
              <div
                style={{
                  background: 'var(--mk-deep)',
                  color: '#abff44',
                  fontFamily: 'monospace',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  margin: '14px 0',
                }}
              >
                ollama run llama3.2
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Ollama will download Llama 3.2 (~2.0 GB) and boot the local server. You can also pull larger models such as <code>ollama pull llama3.1:8b</code> or <code>ollama pull mistral</code>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  3
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Configure CORS Allowed Origins (Crucial Step)
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                By default, Ollama only accepts requests originating from localhost applications. To allow your Crescelo web dashboard to send prompts to your local Ollama server, you must set the <code>OLLAMA_ORIGINS</code> environment variable:
              </p>
              
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}>On macOS:</div>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace' }}>launchctl setenv OLLAMA_ORIGINS &quot;*&quot;</code>
                  <div style={{ fontSize: '12px', color: 'var(--mk-muted)', marginTop: '4px' }}>Then restart the Ollama desktop app from your top menu bar.</div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}>On Windows:</div>
                  <div style={{ fontSize: '12px', color: 'var(--mk-ink)' }}>
                    Quit Ollama from the Windows taskbar tray &rarr; Search &ldquo;Edit environment variables for your account&rdquo; &rarr; Click <strong>New</strong> &rarr; Variable name: <code>OLLAMA_ORIGINS</code> &rarr; Variable value: <code>*</code> &rarr; Click OK &rarr; Restart Ollama.
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}>On Linux (systemd):</div>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace' }}>sudo systemctl edit ollama.service</code>
                  <div style={{ fontSize: '12px', color: 'var(--mk-muted)', marginTop: '4px' }}>
                    Add under [Service]: <code>Environment=&quot;OLLAMA_ORIGINS=*&quot;</code>, save, and run <code>sudo systemctl restart ollama</code>.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  4
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Connect to Crescelo
                </h2>
              </div>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>In your <strong>Crescelo Dashboard</strong>, go to <strong>Settings</strong> &rarr; <strong>AI Settings</strong>.</li>
                <li>Select <strong>Local Server (Ollama)</strong>.</li>
                <li>Verify the host URL is set to <code>http://localhost:11434</code> (or your custom server IP).</li>
                <li>In the <strong>Model Name</strong> box, enter the model tag you pulled (e.g. <code>llama3.2</code>).</li>
                <li>Click <strong>Save AI Settings</strong>.</li>
              </ol>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>
                  <strong>100% Data Confidentiality:</strong> When running Ollama, prompt text and customer inquiries never leave your local device or internal network.
                </span>
              </div>
            </div>

            {/* Need Help CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ButtonLink href="/support/contact" variant="primary">
                  Contact Support Engineer
                </ButtonLink>
                <ButtonLink href="/support/ai-connectors" variant="ghost">
                  View All AI Connector Guides
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
