import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF, SITE } from '@/components/marketing/content';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';
import { LEGAL } from '@/lib/legal/config';
import { TEAM } from '@/lib/site/team';

const title = 'About Crescelo | AI Website Assistant for Service Businesses';
const description = 'Who builds Crescelo, what it does and does not do, how its articles are written and checked, and how to contact the team.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMetaEnglishOnly(withSocial({ title, description, alternates: { canonical: '/about' } }, '/about'), { path: '/about' });
}

const PRINCIPLES = [
  { title: 'Answers come from your content', body: 'The assistant answers from the documents and pages you give it, and says so when it does not know. It is built to be useful to your customers without making things up on your behalf.' },
  { title: 'The roadmap is public and honest', body: 'Our roadmap page marks every feature as shipped, in polish, in development or planned. If something is not available yet, we say so on the page that mentions it.' },
  { title: 'No markup on AI usage', body: 'You connect your own AI provider key and the provider bills you directly at its own rates. Crescelo adds nothing on top of that.' },
  { title: 'No certifications we do not hold', body: 'We do not claim SOC 2, HIPAA or similar certifications. The security section lists the controls that exist today, and the data processing addendum and sub-processor list are public.' },
];

export default function AboutPage() {
  const aboutSchema = {
    ...webPageSchema('About Crescelo', description, '/about', 'AboutPage'),
    mainEntity: { '@id': `${SITE.url}/#organization` },
  };
  return (
    <>
      <JsonLd data={[aboutSchema, breadcrumbSchema([{ name: 'About', path: '/about' }])]} />
      <Header />
      <main id="main">
        <section className="mk-hero" style={{ marginTop: '1rem' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '22ch', marginInline: 'auto', fontSize: 'clamp(2.4rem, 6vw, 4.4rem)', ['--mk-delay' as string]: '140ms' }}>
              <span className="mk-h1-kicker">About Crescelo</span>{' '}
              An AI website assistant that stays honest about what it can do.
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '62ch', ['--mk-delay' as string]: '320ms' }}>
              Crescelo is software that answers a business&apos;s website visitors from the business&apos;s own content, books appointments in the chat, captures leads and hands the conversation to a person when one is needed. It is built for service businesses: salons, clinics, trades, real estate, law and advisory practices, fitness studios and agencies.
            </p>
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink>
              <ButtonLink href="/support/contact" variant="ghost">Contact the team</ButtonLink>
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="about-principles">
          <div className="mk-wrap">
            <SectionHead eyebrow="HOW WE WORK" title="What we hold ourselves to" id="about-principles" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {PRINCIPLES.map((p) => (
                <article key={p.title} className="mk-card">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="about-company">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead eyebrow="THE COMPANY" title="Who is behind it, and where to reach us" id="about-company" align="center" />
            <div className="mk-card" style={{ marginTop: '2rem', display: 'grid', gap: '0.75rem' }}>
              <p>
                <strong>Product.</strong> {LEGAL.tradeName} is a web-based software product sold worldwide in US dollars, with plans listed on the <Link href="/pricing" style={{ textDecoration: 'underline' }}>pricing page</Link>.
              </p>
              <p>
                <strong>Custom AI work.</strong> The same team takes on custom AI projects (chatbots, agents and integrations) under the Crescelo name. That is a separate service from the software product; see <Link href="/custom-ai" style={{ textDecoration: 'underline' }}>Custom AI</Link>. You do not need it to use the product.
              </p>
              <p>
                <strong>Contact.</strong> Every message to us opens a support ticket you can follow, and we reply by email. Use the <Link href="/support/contact" style={{ textDecoration: 'underline' }}>contact form</Link> for sales questions, support, press and security reports. We do not publish a mailbox on purpose, to keep automated spam out of it.
              </p>
              <p>
                <strong>Legal documents.</strong> <Link href="/terms" style={{ textDecoration: 'underline' }}>Terms</Link>, <Link href="/privacy" style={{ textDecoration: 'underline' }}>privacy policy</Link>, <Link href="/dpa" style={{ textDecoration: 'underline' }}>data processing addendum</Link> and <Link href="/subprocessors" style={{ textDecoration: 'underline' }}>sub-processors</Link> are public.
              </p>
            </div>

            {TEAM.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))' }}>
                {TEAM.map((m) => (
                  <li key={m.name} className="mk-card">
                    <h3>{m.name}</h3>
                    <p style={{ fontWeight: 700, color: 'var(--mk-accent)' }}>{m.role}</p>
                    <p>{m.bio}</p>
                    {m.profileUrl ? <p><a href={m.profileUrl} rel="me noopener" style={{ textDecoration: 'underline' }}>Profile</a></p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section id="editorial" className="mk-section" aria-labelledby="about-editorial" style={{ scrollMarginTop: '5rem' }}>
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead eyebrow="EDITORIAL STANDARDS" title="How we write and check the articles" id="about-editorial" align="center" intro="The Knowledge Hub is written to help owners of appointment-based businesses make decisions. This is how we try to keep it trustworthy." />
            <ul style={{ margin: '2rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem' }}>
              <li><strong>Written by the Crescelo team, with AI assistance.</strong> Many articles are drafted with the help of AI tools and then edited by people on the team. We do not present AI-drafted text as the work of an independent expert.</li>
              <li><strong>Product statements follow the product.</strong> When an article says what Crescelo does, it should match the <Link href="/roadmap" style={{ textDecoration: 'underline' }}>roadmap</Link> and the pricing page. If you find an article that says otherwise, the article is wrong and we want to hear about it.</li>
              <li><strong>Numbers are sourced or labelled.</strong> A statistic should link to its source. Worked examples with round numbers are illustrations, not forecasts or customer results, and are labelled as such. If you find a figure with no source, tell us and we will source it or remove it.</li>
              <li><strong>Not professional advice.</strong> Articles about law, health, money or data protection are general information. They are not legal, medical or financial advice; check with a qualified professional for your situation.</li>
              <li><strong>Dates and corrections.</strong> Every article shows when it was published and last updated. We correct mistakes in place and update the date.</li>
            </ul>
            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href="/support/contact" style={{ textDecoration: 'underline' }}>Report an error in an article</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
