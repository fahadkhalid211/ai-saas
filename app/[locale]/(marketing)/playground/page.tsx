import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { PlaygroundApp } from '@/components/marketing/PlaygroundApp';
import { withSocial } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';

const title = 'Try the AI Chatbot Playground: Upload Your Docs and Ask';
const description = 'Test a Crescelo assistant on your own documents in two minutes. Upload a PDF, paste text or add a web page, then ask it questions like a customer would. No card, no install.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({ title, description, alternates: { canonical: '/playground' } }, '/playground'));
}

const FAQ = [
  { q: 'Do I need to sign up?', a: 'No. Give us your name and email and the playground opens straight away. There is no password and no card.' },
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
      </main>
      <Footer />
    </>
  );
}
