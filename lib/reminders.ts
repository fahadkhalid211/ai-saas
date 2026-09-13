import { Database, AppointmentData, DEFAULT_BARBER_LANDING_CONFIG } from './db';
import { sendAppointmentReminderEmail } from './email';

export interface ReminderProcessResult {
  timestamp: string;
  totalActiveAppointments: number;
  sent24h: number;
  sent1h: number;
  details: Array<{
    appointmentId: string;
    clientName: string;
    type: '24h' | '1h';
    email: string;
    status: 'sent' | 'skipped' | 'failed';
    reason?: string;
  }>;
}

/**
 * Process all upcoming confirmed appointments and dispatch 24h & 1h reminders
 * to both client and business administrator.
 */
export async function processScheduledReminders(): Promise<ReminderProcessResult> {
  const appointments = await Database.getUpcomingAppointmentsForReminders();
  const now = Date.now();
  let sent24h = 0;
  let sent1h = 0;
  const details: ReminderProcessResult['details'] = [];

  for (const apt of appointments) {
    try {
      // Parse appointment date & timeSlot (e.g. "2026-09-15", "14:30")
      const [yearStr, monthStr, dayStr] = apt.date.split('-');
      const [hourStr, minStr] = (apt.timeSlot || '09:00').split(':');

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);
      const hour = parseInt(hourStr, 10);
      const min = parseInt(minStr, 10);

      const aptTime = new Date(year, month, day, hour, min, 0).getTime();
      const diffHours = (aptTime - now) / (1000 * 60 * 60);

      // Skip past appointments
      if (diffHours < 0) {
        continue;
      }

      const ast = await Database.getAssistantById(apt.assistantId);
      const landingConfig = ast?.landingPageConfig || DEFAULT_BARBER_LANDING_CONFIG;
      const businessName = landingConfig.businessName || ast?.name || 'Our Business';
      const businessAddress = landingConfig.address || 'In Shop';
      const businessPhone = landingConfig.phone || '';
      const adminEmail = ast?.supportReceiverEmail;
      const assistantSlug = landingConfig.slug || apt.assistantId;

      // 1. Check for 24-hour reminder: between 18 and 26 hours prior to appointment
      if (diffHours <= 26 && diffHours >= 18 && !apt.remindersSent?.reminder24h) {
        // Send to client
        const clientRes = await sendAppointmentReminderEmail({
          to: apt.email,
          clientName: apt.name,
          clientEmail: apt.email,
          clientPhone: apt.phone,
          serviceName: apt.serviceName || 'Appointment',
          price: apt.price,
          date: apt.date,
          timeSlot: apt.timeSlot,
          durationMinutes: apt.durationMinutes,
          businessName,
          businessAddress,
          businessPhone,
          manageToken: apt.manageToken,
          assistantSlug,
          assistantId: apt.assistantId,
          reminderType: '24h',
          isAdminNotification: false,
        });

        // Send to admin if receiver email configured
        if (adminEmail && adminEmail.includes('@')) {
          await sendAppointmentReminderEmail({
            to: adminEmail,
            clientName: apt.name,
            clientEmail: apt.email,
            clientPhone: apt.phone,
            serviceName: apt.serviceName || 'Appointment',
            price: apt.price,
            date: apt.date,
            timeSlot: apt.timeSlot,
            durationMinutes: apt.durationMinutes,
            businessName,
            businessAddress,
            businessPhone,
            manageToken: apt.manageToken,
            assistantSlug,
            assistantId: apt.assistantId,
            reminderType: '24h',
            isAdminNotification: true,
          });
        }

        if (clientRes.success) {
          await Database.markReminderSent(apt.id, '24h');
          await Database.addNotification({
            assistantId: apt.assistantId,
            title: '24-Hour Reminder Sent',
            message: `Dispatched 24h appointment reminder to ${apt.name} (${apt.email}) for ${apt.date} at ${apt.timeSlot}.`,
            type: 'reminder_dispatched',
          });
          sent24h++;
          details.push({
            appointmentId: apt.id,
            clientName: apt.name,
            type: '24h',
            email: apt.email,
            status: 'sent',
          });
        } else {
          details.push({
            appointmentId: apt.id,
            clientName: apt.name,
            type: '24h',
            email: apt.email,
            status: 'failed',
            reason: clientRes.error,
          });
        }
      }

      // 2. Check for 1-hour reminder: between 0.15 hours (10 mins) and 1.5 hours (90 mins) prior to appointment
      if (diffHours <= 1.5 && diffHours >= 0.15 && !apt.remindersSent?.reminder1h) {
        // Send to client
        const clientRes = await sendAppointmentReminderEmail({
          to: apt.email,
          clientName: apt.name,
          clientEmail: apt.email,
          clientPhone: apt.phone,
          serviceName: apt.serviceName || 'Appointment',
          price: apt.price,
          date: apt.date,
          timeSlot: apt.timeSlot,
          durationMinutes: apt.durationMinutes,
          businessName,
          businessAddress,
          businessPhone,
          manageToken: apt.manageToken,
          assistantSlug,
          assistantId: apt.assistantId,
          reminderType: '1h',
          isAdminNotification: false,
        });

        // Send to admin if receiver email configured
        if (adminEmail && adminEmail.includes('@')) {
          await sendAppointmentReminderEmail({
            to: adminEmail,
            clientName: apt.name,
            clientEmail: apt.email,
            clientPhone: apt.phone,
            serviceName: apt.serviceName || 'Appointment',
            price: apt.price,
            date: apt.date,
            timeSlot: apt.timeSlot,
            durationMinutes: apt.durationMinutes,
            businessName,
            businessAddress,
            businessPhone,
            manageToken: apt.manageToken,
            assistantSlug,
            assistantId: apt.assistantId,
            reminderType: '1h',
            isAdminNotification: true,
          });
        }

        if (clientRes.success) {
          await Database.markReminderSent(apt.id, '1h');
          await Database.addNotification({
            assistantId: apt.assistantId,
            title: '1-Hour Reminder Sent',
            message: `Dispatched final 1-hour appointment reminder to ${apt.name} (${apt.email}) for ${apt.date} at ${apt.timeSlot}.`,
            type: 'reminder_dispatched',
          });
          sent1h++;
          details.push({
            appointmentId: apt.id,
            clientName: apt.name,
            type: '1h',
            email: apt.email,
            status: 'sent',
          });
        } else {
          details.push({
            appointmentId: apt.id,
            clientName: apt.name,
            type: '1h',
            email: apt.email,
            status: 'failed',
            reason: clientRes.error,
          });
        }
      }
    } catch (err: any) {
      console.error(`[Reminders] Failed processing appointment ${apt.id}:`, err?.message);
      details.push({
        appointmentId: apt.id,
        clientName: apt.name,
        type: '24h',
        email: apt.email,
        status: 'failed',
        reason: err?.message,
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalActiveAppointments: appointments.length,
    sent24h,
    sent1h,
    details,
  };
}
