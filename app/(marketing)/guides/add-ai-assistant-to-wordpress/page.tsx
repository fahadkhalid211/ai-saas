import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import { PRODUCTION_URL, SITE } from '@/components/marketing/content';

const SNIPPET = `<script src="${PRODUCTION_URL}/widget.js" data-assistant="YOUR_ASSISTANT_ID" defer></script>`;

const STEPS = [
  {
    title: 'Copy your embed code',
    body: 'In the Crescelo dashboard open your assistant, then Overview and "Add to website" (or the Deploy button in the top bar). Copy the one-line script. It already contains your assistant ID and the correct address; the example below shows its shape.',
  },
  {
    title: 'Add it to every page with a plugin (recommended)',
    body: 'Install a snippet plugin such as WPCode or Insert Headers and Footers. Create a new snippet, choose "HTML", paste the script, set the location to "Site Wide Footer" and save. This survives theme changes and works with any page builder.',
  },
  {
    title: 'Or add it to one page with Elementor',
    body: 'Edit the page, drag an "HTML" widget onto it, paste the script and update the page. Use the HTML widget, not the text editor: the text editor and the classic block editor remove script tags.',
  },
  {
    title: 'Clear the cache',
    body: 'Caching plugins and host caches (SiteGround, WP Rocket, Cloudflare and others) keep serving the old page. Purge them after adding the snippet, then reload the page in a private window.',
  },
  {
    title: 'Check that it is installed',
    body: 'Open your page, view the page source (Ctrl+U) and search for "widget.js". If it is there, the chat bubble appears in the bottom corner within a second or two. If not, the script was not saved on that page or the cached copy is old.',
  },
];

const PROBLEMS = [
  ['The bubble does not appear and "widget.js" is not in the page source', 'The snippet was stripped or not published. Use the plugin or HTML widget above, publish or update the page, and clear the cache.'],
  ['"widget.js" is in the source but nothing shows', 'Open the browser console. A blocked request means a security plugin or a Content Security Policy on your site is refusing scripts from another domain; allow the address in the script.'],
  ['The script address is localhost or a vercel.app link', 'Those addresses only work on the computer that opened them. Use the code from the dashboard on the live site, which uses the public address.'],
  ['It shows, but replies fail', 'Check the assistant has an AI provider key saved and that the site is served over HTTPS.'],
];

function jsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to add an AI assistant to WordPress',
    description: 'Add the Crescelo chat assistant to a WordPress site and check it is working.',
    step: STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.body })),
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }).replace(/</g, '\\u003c');
}

export default function WordPressGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <Link href="/support" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mk-accent)' }}>
              ← Back to Help Center
            </Link>
            <SectionHead
              as="h1"
              eyebrow="INSTALLATION GUIDE"
              title="How to add an AI assistant to WordPress"
              intro="Five steps and about five minutes. It works the same on Shopify, Webflow, Wix and plain HTML: paste one script before the closing body tag."
              id="wp-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '1.25rem', marginTop: '2rem' }}>
              {STEPS.map((s, i) => (
                <div key={s.title} className="mk-card" style={{ padding: '1.5rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em' }}>STEP {i + 1}</p>
                  <h2 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0.5rem' }}>{s.title}</h2>
                  <p style={{ color: 'var(--mk-muted)', lineHeight: 1.65 }}>{s.body}</p>
                  {i === 0 && (
                    <pre style={{ marginTop: '0.75rem', background: 'var(--mk-deep)', color: '#cfe3d6', padding: '1rem', borderRadius: '0.75rem', overflowX: 'auto', fontSize: '0.8rem' }}>
                      <code>{SNIPPET}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.8rem', margin: '2.5rem 0 1rem' }}>Troubleshooting</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {PROBLEMS.map(([q, a]) => (
                <details key={q} className="mk-card" style={{ padding: '1rem 1.25rem' }}>
                  <summary style={{ fontWeight: 700, cursor: 'pointer' }}>{q}</summary>
                  <p style={{ color: 'var(--mk-muted)', marginTop: '0.5rem', lineHeight: 1.65 }}>{a}</p>
                </details>
              ))}
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <ButtonLink href="/login?mode=register">Create your assistant</ButtonLink>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--mk-muted)' }}>
                Still stuck? <Link href="/support/contact" style={{ textDecoration: 'underline' }}>Contact support</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
