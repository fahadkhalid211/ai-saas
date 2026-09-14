import type { AppointmentData } from '../db';

export interface CalendarEventDetails {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  id?: string;
  url?: string;
}

/**
 * Parses appointment date and timeSlot into start and end Date objects in UTC
 */
export function parseAppointmentDates(
  dateStr: string,
  timeSlotStr: string,
  durationMinutes: number = 30
): { startDate: Date; endDate: Date } {
  let hours = 9;
  let minutes = 0;

  const cleanTime = (timeSlotStr || '').trim();
  const match12h = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (match12h) {
    hours = parseInt(match12h[1], 10);
    minutes = parseInt(match12h[2], 10);
    const meridiem = (match12h[3] || '').toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  }

  const [yearStr, monthStr, dayStr] = (dateStr || '').split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = (parseInt(monthStr, 10) || 1) - 1;
  const day = parseInt(dayStr, 10) || 1;

  const startDate = new Date(Date.UTC(year, month, day, hours, minutes, 0));
  const endDate = new Date(startDate.getTime() + (durationMinutes || 30) * 60000);

  return { startDate, endDate };
}

/**
 * Formats a Date into UTC iCalendar timestamp string: YYYYMMDDTHHMMSSZ
 */
export function formatIcsUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escapes characters for iCalendar RFC 5545 format
 */
export function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generates an RFC 5545 compliant .ics calendar feed for an array of appointments
 */
export function generateIcsFeed(
  appointments: AppointmentData[],
  calendarName: string = 'Kortex AI Appointments'
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kortex AI//Calendar Sync Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  const nowStr = formatIcsUtc(new Date());

  for (const apt of appointments) {
    if (apt.status === 'cancelled') continue;

    const { startDate, endDate } = parseAppointmentDates(apt.date, apt.timeSlot, apt.durationMinutes || 30);
    const summary = `${apt.serviceName || 'Appointment'}: ${apt.name}`;
    const description = [
      `Client: ${apt.name}`,
      `Email: ${apt.email}`,
      apt.phone ? `Phone: ${apt.phone}` : '',
      apt.serviceName ? `Service: ${apt.serviceName}` : '',
      apt.price ? `Price: $${apt.price}` : '',
      apt.notes ? `Notes: ${apt.notes}` : '',
      apt.landingPageName ? `Source: ${apt.landingPageName}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${apt.id}@kortex-ai`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${formatIcsUtc(startDate)}`);
    lines.push(`DTEND:${formatIcsUtc(endDate)}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(`STATUS:${apt.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);

    // 30 minute reminder alarm
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT30M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${escapeIcsText(summary)}`);
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Generates an .ics string for a single appointment
 */
export function generateSingleIcs(
  apt: Partial<AppointmentData> & { name: string; email: string; date: string; timeSlot: string },
  businessName: string = 'Business Appointment',
  location: string = ''
): string {
  const { startDate, endDate } = parseAppointmentDates(apt.date, apt.timeSlot, apt.durationMinutes || 30);
  const nowStr = formatIcsUtc(new Date());
  const summary = `${apt.serviceName || 'Appointment'} at ${businessName}`;
  const description = [
    `Client: ${apt.name}`,
    `Email: ${apt.email}`,
    apt.phone ? `Phone: ${apt.phone}` : '',
    apt.serviceName ? `Service: ${apt.serviceName}` : '',
    apt.price ? `Price: $${apt.price}` : '',
    apt.notes ? `Notes: ${apt.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kortex AI//Calendar Sync Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${apt.id || Date.now().toString(36)}@kortex-ai`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${formatIcsUtc(startDate)}`,
    `DTEND:${formatIcsUtc(endDate)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeIcsText(summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

/**
 * Generates a one-click Google Calendar web creation URL
 */
export function generateGoogleCalendarUrl(
  apt: {
    name: string;
    email: string;
    phone?: string;
    date: string;
    timeSlot: string;
    durationMinutes?: number;
    serviceName?: string;
    price?: number;
    notes?: string;
  },
  businessName: string = 'Our Business',
  location: string = ''
): string {
  try {
    const { startDate, endDate } = parseAppointmentDates(apt.date, apt.timeSlot, apt.durationMinutes || 30);
    const startStr = formatIcsUtc(startDate);
    const endStr = formatIcsUtc(endDate);
    const title = `${apt.serviceName || 'Appointment'} at ${businessName}`;
    const details = [
      `Client: ${apt.name} (${apt.email})`,
      apt.phone ? `Phone: ${apt.phone}` : '',
      apt.serviceName ? `Service: ${apt.serviceName}` : '',
      apt.price ? `Price: $${apt.price}` : '',
      apt.notes ? `Notes: ${apt.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  } catch {
    return 'https://calendar.google.com';
  }
}

/**
 * Generates a one-click Outlook Web event creation URL
 */
export function generateOutlookCalendarUrl(
  apt: {
    name: string;
    email: string;
    phone?: string;
    date: string;
    timeSlot: string;
    durationMinutes?: number;
    serviceName?: string;
    price?: number;
    notes?: string;
  },
  businessName: string = 'Our Business',
  location: string = ''
): string {
  try {
    const { startDate, endDate } = parseAppointmentDates(apt.date, apt.timeSlot, apt.durationMinutes || 30);
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();
    const subject = `${apt.serviceName || 'Appointment'} at ${businessName}`;
    const body = [
      `Client: ${apt.name} (${apt.email})`,
      apt.phone ? `Phone: ${apt.phone}` : '',
      apt.serviceName ? `Service: ${apt.serviceName}` : '',
      apt.price ? `Price: $${apt.price}` : '',
      apt.notes ? `Notes: ${apt.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return `https://outlook.live.com/calendar/0/action/compose?rru=addevent&subject=${encodeURIComponent(
      subject
    )}&startdt=${encodeURIComponent(startStr)}&enddt=${encodeURIComponent(endStr)}&body=${encodeURIComponent(
      body
    )}&location=${encodeURIComponent(location)}`;
  } catch {
    return 'https://outlook.live.com';
  }
}
