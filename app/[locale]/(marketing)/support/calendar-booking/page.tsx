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
  alternates: { canonical: '/support/calendar-booking' },
  title: 'Calendar Booking & Concurrency Guide | Crescelo Support',
  description:
    'Learn how Crescelo synchronizes with Google Calendar, checks live slot availability, and locks appointment times using atomic mutexes.',
}, '/support/calendar-booking'));
}

export default function CalendarBookingGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Calendar Booking & Concurrency Guide', 'How Crescelo books appointments in the chat, locks slots to prevent double bookings and exports bookings to a calendar feed.', '/support/calendar-booking'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'Calendar booking', path: '/support/calendar-booking' }])]} />
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
              eyebrow="SCHEDULING DOCUMENTATION"
              title="Calendar Booking & Concurrency Locks"
              intro="How Crescelo books appointments inside the chat conversation, syncs with external calendars, and prevents race-condition double-bookings."
              id="calendar-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '28px', marginTop: '40px' }}>
              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>1. How Live Slot Verification Works</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>When a website visitor asks to book, Crescelo fetches active appointments from the database for that assistant and calculates available times against your configured opening hours (e.g. 9:00 AM – 5:00 PM) and default slot duration (e.g. 30 minutes).</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>2. The Atomic Mutex Concurrency Lock</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>If two visitors click the same 2:00 PM slot simultaneously, traditional bots often double-book both users. Crescelo uses</T> <code>acquireBookingLock(assistantId, date, timeSlot)</code><T>. The first request acquires a lock (shared across servers when Redis is configured), verifies that no conflict was written in the interim, commits the booking, and safely releases the lock. The second user receives an immediate prompt offering the next nearest available slot.</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>3. Confirmations and your calendar feed</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>Once an appointment is committed:</T>
                </p>
                <ul style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                  <li><T>• A confirmation email with a self-service reschedule and cancel link is sent to the client.</T></li>
                  <li><T>• The business owner is notified by email and in the dashboard.</T></li>
                  <li><T>• The booking appears in your private calendar feed. Subscribe to its address in Google Calendar, Outlook or Apple Calendar to see bookings there. The feed is read-only; two-way sync is on the roadmap.</T></li>
                </ul>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>4. Self-Service Rescheduling & Cancellation</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>Every confirmation email includes a unique cryptographic</T> <code>manageToken</code><T>. Clients can cancel or pick a new date/time on their own without calling your office, immediately freeing up the canceled slot for other visitors.</T>
                </p>
              </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <ButtonLink href="/support/contact"><T>Need assistance with your calendar setup? Contact us</T></ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
