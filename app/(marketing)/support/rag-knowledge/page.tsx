import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';

export const metadata: Metadata = {
  title: 'RAG Knowledge Base & Document Indexing Guide | Crescelo Support',
  description:
    'Learn how Crescelo indexes documents, scrapes live URLs, and uses hybrid vector retrieval to answer customer inquiries without hallucinations.',
};

export default function RagKnowledgeGuidePage() {
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
              eyebrow="KNOWLEDGE ARCHITECTURE"
              title="Knowledge Base & Grounded RAG Indexing"
              intro="How Crescelo reads your documentation, creates vector embeddings, and ensures that answers cite your exact material without inventing facts."
              id="rag-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '28px', marginTop: '40px' }}>
              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>1. Supported File Types & Live Web Scraping</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  You can train your assistant on:
                </p>
                <ul style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                  <li>• <strong>PDF & Word Documents:</strong> Price sheets, employee handbooks, service descriptions, and policy files.</li>
                  <li>• <strong>CSV & Spreadsheets:</strong> Product catalogs, inventory rates, and structured FAQs.</li>
                  <li>• <strong>Website URLs:</strong> Enter your domain URL. Crescelo automatically fetches and strips HTML boilerplate, indexing only high-value content.</li>
                </ul>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>2. Hybrid Dense Vector & BM25 Keyword Search</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  Crescelo utilizes local ONNX embeddings (<code>Xenova/bge-small-en-v1.5</code>) combined with BM25 lexical keyword ranking through Reciprocal Rank Fusion (RRF). If a visitor asks a colloquial question like <em>&ldquo;how much does it set me back?&rdquo;</em>, the vector engine recognizes that &ldquo;set me back&rdquo; corresponds semantically to your &ldquo;Pricing&rdquo; passage.
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>3. The Anti-Hallucination Guardrail</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  If a question cannot be verified against any passage in your knowledge base with sufficient similarity, Crescelo explicitly states that it does not have that information, rather than fabricating a confident but false answer.
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>4. Unanswered Query Diagnostics</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  Every time the assistant cannot find an answer, the question is logged in your CRM dashboard under <strong>Unanswered Queries</strong>. This allows your team to see exactly what prospective customers are asking for and upload a 1-sentence note to fill the gap permanently.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <ButtonLink href="/support/contact">Have questions about document chunking? Contact us</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
