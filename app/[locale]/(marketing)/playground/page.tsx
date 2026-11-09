import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { PlaygroundApp } from '@/components/marketing/PlaygroundApp';
import { withSocial } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';

const title = 'Try the AI Chatbot Playground: Upload Your Docs and Ask';
const description = 'Test a Crescelo assistant on your own documents in two minutes: upload a PDF, paste text or add a web page, then ask it questions like a customer would.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({ title, description, alternates: { canonical: '/playground' } }, '/playground'));
}

const FAQ = [
  { q: 'Do I need to create an account?', a: 'No account, no password and no card. You enter your name and email so the playground can open, and it starts straight away.' },
  { q: 'What can I upload?', a: 'PDF, Word (.docx), text, Markdown, CSV and JSON files up to 5 MB, pasted text, or the address of a web page. Up to five sources at a time.' },
  { q: 'Does it make things up?', a: 'The playground assistant answers only from what you gave it. If the answer is not in your documents it says so and suggests what to add.' },
  { q: 'How long are my documents kept?', a: 'Seven days, then they are deleted automatically. You can remove any source yourself at any time.' },
  { q: 'What happens after I like it?', a: 'Start a free trial, connect the same documents, and put the assistant on your website with one line of code.' },
];

export default function PlaygroundPage() {
  return (
    <>
      <JsonLd data={[webPageSchema(title, description, '/playground'), breadcrumbSchema([{ name: 'Playground', path: '/playground' }]), faqSchema(FAQ)]} />
      <Header />
      <main id="main">
        <PlaygroundApp faq={FAQ} />
        {/* Written into the page itself, so what the playground does is readable without running it */}
        <section className="mk-section" aria-labelledby="pg-how">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <h2 id="pg-how" className="mk-h2"><T>How the playground works</T></h2>
            <p className="mk-lead">
              <T>The playground is a free sandbox for the same assistant you would put on your website. You give it a document or a web page about your business, then ask it the questions your customers ask and see whether the answers are right.</T>
            </p>
            <ol style={{ display: 'grid', gap: '0.75rem', paddingLeft: '1.2rem', margin: '1.25rem 0' }}>
              <li><T>Add up to five sources: a PDF, a Word file, a text or CSV file, pasted text or a web page address.</T></li>
              <li><T>Ask a question the way a customer would, for example about prices, opening hours or what a service includes.</T></li>
              <li><T>Read the answer. It comes only from what you added, and if the answer is not there the assistant says so and suggests what to add.</T></li>
              <li><T>Happy with it? Start a free trial and put the same assistant on your website with one line of code.</T></li>
            </ol>
            <h3><T>An example</T></h3>
            <p><strong><T>You add:</T></strong> <T>your price list and opening hours.</T></p>
            <p><strong><T>Customer asks:</T></strong> <T>Are you open on Sundays, and how much is a standard cut?</T></p>
            <p><strong><T>Assistant answers:</T></strong> <T>Only from your price list and hours. If Sundays are not mentioned in your documents, it tells the visitor it does not have that information and offers a booking form or a person.</T></p>
            <p style={{ marginTop: '1.5rem' }}>
              <T>Learn more:</T>{' '}
              <Link href="/product/knowledge-base" style={{ textDecoration: 'underline' }}><T>knowledge base</T></Link>{' · '}
              <Link href="/product/ai-assistant" style={{ textDecoration: 'underline' }}><T>AI website assistant</T></Link>{' · '}
              <Link href="/pricing" style={{ textDecoration: 'underline' }}><T>pricing</T></Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
