import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

export const metadata: Metadata = {
  title: 'Virtual Teammates by Industry | Crescelo',
  description:
    'Tailored AI assistants for service businesses: salons, wellness clinics, real estate, fitness studios, legal practices, and SaaS.',
};

const USE_CASES = [
  {
    id: 'salons',
    title: 'Salons, Spas & Barbershops',
    tagline: 'Never miss a booking while your hands are busy.',
    tone: 'lime',
    bottleneck:
      'Barbers and stylists lose hundreds in daily revenue because they cannot answer phone calls or DMs while working with clients.',
    solution:
      'Crescelo acts as a 24/7 digital front desk. It answers pricing questions, checks your live calendar, allows visitors to pick their preferred stylist, and locks the slot with SMS confirmations.',
    features: [
      'In-chat & telephone voice booking',
      'Stylist & service duration selection',
      'Atomic mutex lock prevents chair double-booking',
      'Automatic cancellation & reschedule self-service',
    ],
    metric: '+42%',
    metricLabel: 'Increase in after-hours bookings',
  },
  {
    id: 'clinics',
    title: 'Healthcare & Wellness Clinics',
    tagline: 'Relieve front desk burnout with verified intake answers.',
    tone: 'lav',
    bottleneck:
      'Receptionists spend 60% of their workday repeating parking directions, insurance lists, and pre-appointment instructions.',
    solution:
      'Grounded strictly in clinic guidelines, Crescelo triages patient inquiries, explains preparation rules without hallucinating, and reserves consultation slots on doctor calendars.',
    features: [
      'Strict grounding (never invents medical advice)',
      'Pre-visit intake questionnaire collection',
      'Instant escalation to nursing staff when needed',
      'Syncs directly to Outlook and Google Calendar',
    ],
    metric: '18 hrs',
    metricLabel: 'Saved weekly per clinic location',
  },
  {
    id: 'real-estate',
    title: 'Real Estate & Property Management',
    tagline: 'Qualify buyers and schedule property showings instantly.',
    tone: 'mint',
    bottleneck:
      'Prospective tenants and buyers browse listings at night. If an inquiry sits unanswered until morning, they book a showing with a competitor.',
    solution:
      'Crescelo captures budget, move-in timeline, and pre-qualifies inquiries right inside the chat or on phone calls, instantly booking an open house or showing slot on the agent’s calendar.',
    features: [
      'Automated buyer & tenant qualification',
      'Direct scheduling for property showings',
      'Instant CRM lead push with full conversation brief',
      'WhatsApp and SMS notification alerts',
    ],
    metric: '3.4×',
    metricLabel: 'Faster response to high-intent buyer leads',
  },
  {
    id: 'fitness',
    title: 'Fitness Studios & Personal Trainers',
    tagline: 'Turn casual website visitors into trial class attendees.',
    tone: 'pink',
    bottleneck:
      'Website visitors looking for gym memberships abandon signups if class schedules are hard to find or trial classes require calling.',
    solution:
      'Visitors choose a workout time, confirm their fitness goals, and lock in a trial class reservation in under 45 seconds.',
    features: [
      'Class timetable lookup & instant reservation',
      'Membership tier explanation with zero token markup',
      'Trainer schedule synchronization',
      'Automated reminder notifications to reduce no-shows',
    ],
    metric: '$14k',
    metricLabel: 'Monthly recovered revenue from drop-offs',
  },
  {
    id: 'legal',
    title: 'Legal, Accounting & Advisory',
    tagline: 'Qualify consultations and automate intake screening.',
    tone: 'amber',
    bottleneck:
      'Partners waste valuable billable hours fielding general inquiries and manual intake calls from unqualified leads.',
    solution:
      'Crescelo conducts preliminary conflict screening, answers standard retainer and fee questions from verified docs, and schedules paid initial consultations.',
    features: [
      'Conflict-free preliminary case screening',
      'Retainer and consultation booking workflow',
      'Secure document collection links',
      'Direct human escort with full brief to senior partners',
    ],
    metric: '100%',
    metricLabel: 'Qualified initial consultation schedule',
  },
  {
    id: 'startups',
    title: 'SaaS & Technology Startups',
    tagline: 'Book high-intent product demos from technical documentation.',
    tone: 'lime',
    bottleneck:
      'Technical buyers bounce when support bots reply with generic canned responses or fail to book executive demos.',
    solution:
      'Crescelo indexes your API docs, changelogs, and pricing pages to answer deep technical questions, immediately offering calendar booking for qualified enterprise tiers.',
    features: [
      'Technical RAG search across markdown and PDF docs',
      'Executive demo calendar scheduling',
      'BYOK model usage with sub-200ms Groq inference',
      'Outbound webhook dispatch to HubSpot and Slack',
    ],
    metric: '2.6×',
    metricLabel: 'Increase in qualified pipeline demos',
  },
];

export default function UseCasePage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Solutions Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">VIRTUAL TEAMMATES</p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              Tailored for your domain. <span className="mk-echo-em">Trained</span> on your rules.
            </h1>
            <p className="mk-lead">
              A website assistant should not act like a generic chatbot. Crescelo adapts its
              workflow to the operational realities of your specific industry.
            </p>
            <div className="mk-cta-row">
              <ButtonLink href={SIGNUP_HREF}>Deploy your virtual teammate</ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                Compare plans
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Industry Deep Dives */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Industries"
              title="Built for businesses where an appointment is a sale."
              intro="Explore how teams across service industries use Crescelo to automate bookings, answer complex questions, and protect their staff's time."
              id="solutions-list"
              align="center"
            />

            <div style={{ display: 'grid', gap: '40px', marginTop: '48px' }}>
              {USE_CASES.map((uc) => (
                <Reveal
                  key={uc.id}
                  as="article"
                  id={uc.id}
                  className="mk-card"
                  style={{
                    padding: '36px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '32px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '999px',
                        border: '1.5px solid var(--mk-ink)',
                        background: `var(--mk-${uc.tone})`,
                        marginBottom: '14px',
                      }}
                    >
                      {uc.tagline}
                    </span>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '14px', lineHeight: 1.1 }}>
                      {uc.title}
                    </h2>

                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-warn)' }}>
                        The Bottleneck
                      </p>
                      <p style={{ fontSize: '15px', color: 'var(--mk-muted)', marginTop: '4px' }}>
                        {uc.bottleneck}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-accent)' }}>
                        The Crescelo Fix
                      </p>
                      <p style={{ fontSize: '15px', color: 'var(--mk-deep)', marginTop: '4px' }}>
                        {uc.solution}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--mk-surface)',
                      border: '1.5px solid var(--mk-ink)',
                      borderRadius: '20px',
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '24px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--mk-muted)', marginBottom: '14px' }}>
                        Core Capabilities
                      </p>
                      <ul style={{ display: 'grid', gap: '10px' }}>
                        {uc.features.map((f, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--mk-deep)' }}>
                            <span style={{ color: 'var(--mk-lime)', background: 'var(--mk-deep)', borderRadius: '50%', width: '16px', height: '16px', display: 'grid', placeItems: 'center', fontSize: '10px', flexShrink: 0 }}>
                              ✓
                            </span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '18px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <strong style={{ fontFamily: 'var(--mk-display)', fontSize: '2.6rem', color: 'var(--mk-deep)', lineHeight: 1 }}>
                        {uc.metric}
                      </strong>
                      <span style={{ fontSize: '13px', color: 'var(--mk-muted)', fontWeight: 600 }}>
                        {uc.metricLabel}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Conversion Banner */}
        <section className="mk-final" style={{ margin: '48px 12px 12px 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>GET STARTED</p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              Train an assistant on your business rules today.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              No custom coding required. Upload your documents, set your hours, and go live.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/support/contact" variant="ghost" style={{ borderColor: '#fff', color: '#fff' }}>
                Talk to our solutions team
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
