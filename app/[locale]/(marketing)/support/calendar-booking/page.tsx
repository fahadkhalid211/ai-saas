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
    'Learn how Crescelo checks live slot availability, blocks times from your Google, Apple or Outlook calendar links, and checks every booking before confirming it.',
}, '/support/calendar-booking'));
}

export default function CalendarBookingGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Calendar Booking & Concurrency Guide', 'How Crescelo books appointments in the chat, checks every booking against your bookings and calendar links, and exports bookings to a calendar feed.', '/support/calendar-booking'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'Calendar booking', path: '/support/calendar-booking' }])]} />
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
              intro="How Crescelo books appointments inside the chat conversation, reads your calendar links, and checks every booking so overlapping times are not confirmed."
              id="calendar-guide"
              align="center"
            />

            <div style={{ display: 'grid', gap: '28px', marginTop: '40px' }}>
              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>1. How Live Slot Verification Works</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>When a website visitor asks to book, Crescelo fetches active appointments from the database for that assistant and calculates available times against your configured opening hours (e.g. 9:00 AM – 5:00 PM) and slot length (e.g. 30 minutes). Times that are already booked, or busy in a calendar you linked (see section 3), are not offered.</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>2. The Booking Check and Day Lock</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>If two visitors pick the same 2:00 PM slot, or overlapping times such as 2:00 PM and 2:15 PM, at nearly the same moment, traditional bots often double-book both users. Crescelo checks every booking against your existing bookings and calendars before confirming it, whether it comes from the website widget, the hosted page, a connected AI tool, a reschedule or the reactivation of a cancelled booking. The first request takes a lock for that assistant and day, checks the new booking by time range (not just identical start times) against existing bookings and the busy times read from your calendar links, saves it and releases the lock. In database mode the database itself also refuses two overlapping bookings for the same assistant. The second user receives an immediate prompt offering the next nearest available slot.</T>
                </p>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>3. Calendar links that block your slots</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>With the built-in date picker you can add up to 5 calendar links per assistant in the booking settings of Add to My Website: Google, Apple or iCloud, Outlook, or any iCal/ICS or webcal:// link.</T>
                </p>
                <ul style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                  <li><T>• Crescelo only reads the links. It never changes your calendar.</T></li>
                  <li><T>• The links are read again right before a booking is confirmed and about every 10 minutes. Busy events become unavailable slots.</T></li>
                  <li><T>• Common repeating events (daily, weekly, monthly and yearly patterns, such as every Monday or the second Tuesday) are understood. Unusual repeat rules are not, and the settings show how many events have repeats we can't read yet.</T></li>
                  <li><T>• All-day events that Google marks as Free do not block slots.</T></li>
                  <li><T>• An event added to your calendar in the very same second a visitor confirms the same slot cannot be seen by either side. If a clash happens anyway, you get a notification and an email, and the guest's booking is never cancelled automatically.</T></li>
                </ul>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>4. Confirmations and your calendar feeds</T></h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                  <T>Once an appointment is committed:</T>
                </p>
                <ul style={{ display: 'grid', gap: '8px', marginTop: '12px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                  <li><T>• A confirmation email with a self-service reschedule and cancel link is sent to the client.</T></li>
                  <li><T>• The business owner is notified by email and in the dashboard.</T></li>
                  <li><T>• The booking appears in your private calendar feed. Subscribe to its address in Google Calendar, Outlook or Apple Calendar to see bookings there. This feed shows guest details and is for your own use.</T></li>
                  <li><T>• For a link that shows only "Busy" for booked times, with no guest names or details, use Your Crescelo calendar link in the same booking settings. Google, Apple and Outlook refresh subscribed links slowly, often every few hours, so a new booking may show there late. Treat the link like a password; you can reset it.</T></li>
                  <li><T>• Crescelo does not yet write bookings into Google or Apple calendar events as they happen. That instant two-way sync is planned, not available yet.</T></li>
                </ul>
              </div>

              <div className="mk-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}><T>5. Self-Service Rescheduling & Cancellation</T></h3>
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
