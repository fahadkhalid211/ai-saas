import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support/rag-knowledge' },
  title: 'RAG Knowledge Base & Document Indexing Guide | Crescelo',
  description:
    'Learn how Crescelo indexes documents, scrapes live URLs, and uses hybrid vector retrieval to answer customer inquiries without hallucinations.',
}, '/support/rag-knowledge'));
}

export default function RagKnowledgeGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Knowledge Base & Document Indexing Guide', 'How Crescelo reads your documents and web pages, finds the right passage for each question and logs what it could not answer.', '/support/rag-knowledge'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'Knowledge base', path: '/support/rag-knowledge' }])]} />
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
              <T>← Back to Help Center</T>
            </Link>

            <SectionHead
              as="h1"
              eyebrow="KNOWLEDGE ARCHITECTURE"
              title="Knowledge Base & Grounded RAG Indexing"
              intro="How Crescelo reads your documentation, creates vector embeddings, and ensures that answers cite your exact material without inventing facts."
              id="rag-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '28px', marginTop: '40px' }}>
              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>1. Supported File Types & Live Web Scraping</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>You can train your assistant on:</T>
                </p>
                <ul style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                  <li>• <strong><T>PDF & Word Documents:</T></strong> <T>Price sheets, employee handbooks, service descriptions, and policy files.</T></li>
                  <li>• <strong><T>CSV & Spreadsheets:</T></strong> <T>Product catalogs, inventory rates, and structured FAQs.</T></li>
                  <li>• <strong><T>Website URLs:</T></strong> <T>Enter your domain URL. Crescelo automatically fetches and strips HTML boilerplate, indexing only high-value content.</T></li>
                </ul>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>2. Hybrid Dense Vector & BM25 Keyword Search</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>Crescelo utilizes local ONNX embeddings (</T><code>Xenova/bge-small-en-v1.5</code><T>) combined with BM25 lexical keyword ranking through Reciprocal Rank Fusion (RRF). If a visitor asks a colloquial question like</T> <em><T>&ldquo;how much does it set me back?&rdquo;</T></em><T>, the vector engine recognizes that &ldquo;set me back&rdquo; corresponds semantically to your &ldquo;Pricing&rdquo; passage.</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>3. The Anti-Hallucination Guardrail</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>If a question cannot be verified against any passage in your knowledge base with sufficient similarity, Crescelo explicitly states that it does not have that information, rather than fabricating a confident but false answer.</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>4. Unanswered Query Diagnostics</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>Every time the assistant cannot find an answer, the question is logged in your CRM dashboard under</T> <strong><T>Unanswered Queries</T></strong><T>. This allows your team to see exactly what prospective customers are asking for and upload a 1-sentence note to fill the gap permanently.</T>
                </p>
              </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <ButtonLink href="/support/contact"><T>Have questions about document chunking? Contact us</T></ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
