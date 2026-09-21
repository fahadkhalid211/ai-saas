import { describe, it, expect } from 'vitest';
import {
  parseAppointmentDates,
  formatIcsUtc,
  escapeIcsText,
  generateIcsFeed,
  generateSingleIcs,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
} from './ical';
import { AppointmentData } from '../db';

describe('iCalendar Engine & Calendar Sync', () => {
  it('parses appointment dates correctly with 24-hour time slots', () => {
    const { startDate, endDate } = parseAppointmentDates('2026-10-15', '14:30', 45);
    expect(startDate.getUTCFullYear()).toBe(2026);
    expect(startDate.getUTCMonth()).toBe(9); // 0-indexed October
    expect(startDate.getUTCDate()).toBe(15);
    expect(startDate.getUTCHours()).toBe(14);
    expect(startDate.getUTCMinutes()).toBe(30);

    // 45 minutes later -> 15:15
    expect(endDate.getUTCHours()).toBe(15);
    expect(endDate.getUTCMinutes()).toBe(15);
  });

  it('parses appointment dates correctly with 12-hour AM/PM time slots', () => {
    const { startDate, endDate } = parseAppointmentDates('2026-10-15', '2:30 PM', 30);
    expect(startDate.getUTCHours()).toBe(14);
    expect(startDate.getUTCMinutes()).toBe(30);
    expect(endDate.getUTCHours()).toBe(15);
    expect(endDate.getUTCMinutes()).toBe(0);

    const morning = parseAppointmentDates('2026-10-15', '9:15 AM', 60);
    expect(morning.startDate.getUTCHours()).toBe(9);
    expect(morning.startDate.getUTCMinutes()).toBe(15);
    expect(morning.endDate.getUTCHours()).toBe(10);
    expect(morning.endDate.getUTCMinutes()).toBe(15);
  });

  it('parses appointment dates correctly with time ranges like 10:00 AM - 10:30 AM', () => {
    const range = parseAppointmentDates('2026-10-15', '10:00 AM - 10:30 AM');
    expect(range.startDate.getUTCHours()).toBe(10);
    expect(range.startDate.getUTCMinutes()).toBe(0);
    expect(range.endDate.getUTCHours()).toBe(10);
    expect(range.endDate.getUTCMinutes()).toBe(30);

    const rangeEnDash = parseAppointmentDates('2026-10-15', '02:00 PM – 03:00 PM');
    expect(rangeEnDash.startDate.getUTCHours()).toBe(14);
    expect(rangeEnDash.startDate.getUTCMinutes()).toBe(0);
    expect(rangeEnDash.endDate.getUTCHours()).toBe(15);
    expect(rangeEnDash.endDate.getUTCMinutes()).toBe(0);
  });

  it('formats dates in UTC iCalendar standard (YYYYMMDDTHHMMSSZ)', () => {
    const d = new Date(Date.UTC(2026, 9, 15, 14, 30, 0));
    expect(formatIcsUtc(d)).toBe('20261015T143000Z');
  });

  it('escapes special iCalendar characters', () => {
    expect(escapeIcsText('Hello, World; test\\run\nnewline')).toBe('Hello\\, World\\; test\\\\run\\nnewline');
  });

  it('generates compliant RFC 5545 calendar feed with events and alarms', () => {
    const appointments: AppointmentData[] = [
      {
        id: 'apt_test1',
        assistantId: 'demo-assistant',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-0199',
        date: '2026-10-15',
        timeSlot: '10:00',
        durationMinutes: 45,
        serviceName: 'Haircut & Styling',
        price: 50,
        status: 'confirmed',
        notes: 'First time visit',
        landingPageName: 'Crown & Blade Barbershop',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'apt_test2',
        assistantId: 'demo-assistant',
        name: 'Cancelled User',
        email: 'cancelled@example.com',
        date: '2026-10-16',
        timeSlot: '11:00',
        durationMinutes: 30,
        status: 'cancelled',
        createdAt: new Date().toISOString(),
      },
    ];

    const ics = generateIcsFeed(appointments, 'Crown & Blade Calendar');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Crescelo//Calendar Sync Engine//EN');
    expect(ics).toContain('X-WR-CALNAME:Crown & Blade Calendar');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:apt_test1@kortex-ai');
    expect(ics).toContain('SUMMARY:Haircut & Styling: Jane Doe');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(ics).toContain('END:VALARM');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');

    // Cancelled appointments should be omitted from active feed
    expect(ics).not.toContain('UID:apt_test2@kortex-ai');
  });

  it('generates a downloadable .ics for a single appointment', () => {
    const single = generateSingleIcs(
      {
        id: 'apt_single',
        name: 'Alex Smith',
        email: 'alex@example.com',
        date: '2026-11-20',
        timeSlot: '15:00',
        durationMinutes: 60,
        serviceName: 'Private Consultation',
      },
      'Nexus Agency',
      'Suite 400, 100 Main St'
    );

    expect(single).toContain('BEGIN:VCALENDAR');
    expect(single).toContain('BEGIN:VEVENT');
    expect(single).toContain('UID:apt_single@kortex-ai');
    expect(single).toContain('SUMMARY:Private Consultation at Nexus Agency');
    expect(single).toContain('LOCATION:Suite 400\\, 100 Main St');
    expect(single).toContain('END:VCALENDAR');
  });

  it('generates valid one-click Google Calendar web event URL', () => {
    const url = generateGoogleCalendarUrl(
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        date: '2026-10-15',
        timeSlot: '14:00',
        durationMinutes: 30,
        serviceName: 'Fitness Onboarding',
      },
      'IronForge Gym',
      '123 Fitness Ave'
    );

    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('Fitness%20Onboarding%20at%20IronForge%20Gym');
    expect(url).toContain('dates=20261015T140000Z/20261015T143000Z');
    expect(url).toContain('location=123%20Fitness%20Ave');
  });

  it('generates valid one-click Outlook Web event URL', () => {
    const url = generateOutlookCalendarUrl(
      {
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        date: '2026-10-15',
        timeSlot: '14:00',
        durationMinutes: 30,
        serviceName: 'Executive Consultation',
      },
      'Wayne Enterprises',
      'Gotham City'
    );

    expect(url).toContain('https://outlook.live.com/calendar/0/action/compose?rru=addevent');
    expect(url).toContain('subject=Executive%20Consultation%20at%20Wayne%20Enterprises');
  });
});
