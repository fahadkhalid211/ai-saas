import nodemailer from 'nodemailer';
import { Database, SupportCustomField } from './db';

export interface SendSupportLeadEmailOptions {
  to: string;
  cc?: string[];
  assistantName: string;
  lead: {
    name?: string;
    email: string;
    phone?: string;
    notes?: string;
    createdAt?: string;
    customData?: Record<string, any>;
  };
  customFieldsConfig?: SupportCustomField[];
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendSupportLeadEmail(
  options: SendSupportLeadEmailOptions
): Promise<EmailSendResult> {
  const { to, cc, assistantName, lead, customFieldsConfig = [] } = options;

  if (!to || !to.trim()) {
    console.warn('[EmailService] No receiver email configured for assistant:', assistantName);
    return { success: false, error: 'No receiver email configured' };
  }

  const recipient = to.trim();
  const cleanCc = (cc || [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && c.includes('@'));

  const leadName = lead.name?.trim() || 'Website Visitor';
  const leadEmail = lead.email.trim();
  const leadPhone = lead.phone?.trim() || 'Not provided';
  const leadComments = lead.notes?.trim() || 'None provided';
  const submissionDate = lead.createdAt ? new Date(lead.createdAt).toLocaleString() : new Date().toLocaleString();

  // Escape all user-supplied variables for safe HTML rendering
  const safeAssistantName = escapeHtml(assistantName);
  const safeLeadName = escapeHtml(leadName);
  const safeLeadEmail = escapeHtml(leadEmail);
  const safeLeadPhone = escapeHtml(leadPhone);
  const safeLeadComments = escapeHtml(leadComments);
  const safeSubmissionDate = escapeHtml(submissionDate);

  // Map custom fields to human-readable labels
  const customFieldEntries: Array<{ label: string; value: string }> = [];
  if (lead.customData && typeof lead.customData === 'object') {
    for (const [key, rawVal] of Object.entries(lead.customData)) {
      if (rawVal === undefined || rawVal === null || rawVal === '') continue;
      const configItem = customFieldsConfig.find((cf) => cf.id === key);
      const label = configItem ? configItem.label : key;
      const value = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal);
      customFieldEntries.push({ label, value });
    }
  }

  const safeCustomFieldEntries = customFieldEntries.map((f) => ({
    label: escapeHtml(f.label),
    value: escapeHtml(f.value),
  }));

  const subject = `New Support Request from ${leadName.replace(/[\r\n]/g, '')} (${assistantName.replace(/[\r\n]/g, '')})`;

  // Generate modern HTML template
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px 12px;
      line-height: 1.5;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: #2563eb;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff;
      padding: 24px 28px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .body {
      padding: 28px;
    }
    .badge {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
      margin-bottom: 18px;
      border: 1px solid #bfdbfe;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .info-table th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      padding: 8px 12px 8px 0;
      width: 32%;
      vertical-align: top;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-table td {
      font-size: 14px;
      color: #0f172a;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .comments-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 24px;
    }
    .comments-title {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }
    .comments-body {
      font-size: 14px;
      color: #1e293b;
      white-space: pre-wrap;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 6px;
      text-align: center;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff !important;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155 !important;
      border: 1px solid #cbd5e1;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px 28px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New Support Request</h1>
      <p>Received via your AI Assistant: <strong>${safeAssistantName}</strong></p>
    </div>
    <div class="body">
      <div class="badge">Action Required</div>

      <table class="info-table">
        <tr>
          <th>Full Name:</th>
          <td><strong>${safeLeadName}</strong></td>
        </tr>
        <tr>
          <th>Email Address:</th>
          <td><a href="mailto:${encodeURIComponent(leadEmail)}" style="color:#2563eb;text-decoration:none;font-weight:600;">${safeLeadEmail}</a></td>
        </tr>
        <tr>
          <th>Phone Number:</th>
          <td><a href="tel:${safeLeadPhone.replace(/[^0-9+\-]/g, '')}" style="color:#2563eb;text-decoration:none;">${safeLeadPhone}</a></td>
        </tr>
        <tr>
          <th>Date &amp; Time:</th>
          <td>${safeSubmissionDate}</td>
        </tr>
        ${
          safeCustomFieldEntries.length > 0
            ? safeCustomFieldEntries
                .map(
                  (f) => `
        <tr>
          <th>${f.label}:</th>
          <td><strong>${f.value}</strong></td>
        </tr>`
                )
                .join('')
            : ''
        }
      </table>

      <div class="comments-box">
        <div class="comments-title">Visitor Message / Comments:</div>
        <div class="comments-body">${safeLeadComments}</div>
      </div>

      <div class="actions">
        <a href="mailto:${encodeURIComponent(leadEmail)}?subject=Re:%20Support%20Request%20-%20${encodeURIComponent(assistantName)}" class="btn btn-primary">
          Reply via Email
        </a>
        ${
          lead.phone && lead.phone.trim() !== ''
            ? `<a href="tel:${lead.phone.trim()}" class="btn btn-secondary">Call Visitor</a>`
            : ''
        }
      </div>
    </div>
    <div class="footer">
      Sent automatically by Crescelo Chatbot Engine · Assistant: ${assistantName}
    </div>
  </div>
</body>
</html>
  `;

  // Plain text fallback
  const textContent = `
NEW SUPPORT INQUIRY / LEAD
===========================
Assistant: ${assistantName}
Time: ${submissionDate}

VISITOR DETAILS:
- Name: ${leadName}
- Email: ${leadEmail}
- Phone: ${leadPhone}

${
  customFieldEntries.length > 0
    ? `CUSTOM DETAILS:\n` +
      customFieldEntries.map((f) => `- ${f.label}: ${f.value}`).join('\n') +
      '\n\n'
    : ''
}COMMENTS / MESSAGE:
${leadComments}
===========================
`;

  // Check for Resend API Key
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
      const payload: Record<string, any> = {
        from: `Crescelo <${fromEmail}>`,
        to: [recipient],
        subject,
        html: htmlContent,
        text: textContent,
      };
      if (cleanCc.length > 0) {
        payload.cc = cleanCc;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.message || 'Resend API error');
      }

      console.log(`[EmailService] Support lead dispatched via Resend to ${recipient} (ID: ${resData.id})`);
      return { success: true, messageId: resData.id };
    } catch (resendErr: any) {
      console.error('[EmailService] Resend API failed, checking SMTP fallback:', resendErr?.message);
    }
  }

  // Check for SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || `noreply@crescelo.com`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Crescelo Support" <${smtpFrom}>`,
        to: recipient,
        cc: cleanCc.length > 0 ? cleanCc : undefined,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[EmailService] Support lead email delivered via SMTP to ${recipient} (MessageID: ${info.messageId})`);
      if (cleanCc.length > 0) {
        console.log(`[EmailService] CC delivered to: ${cleanCc.join(', ')}`);
      }
      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error('[EmailService] SMTP delivery failed:', smtpErr?.message);
      return { success: false, error: smtpErr?.message };
    }
  }

  // Fallback: SMTP not configured in .env yet
  // We log clearly so no lead data is ever lost, and provide instructions
  console.log(`
================================================================================
[LEAD EMAIL NOTIFICATION - READY FOR SMTP DISPATCH]
--------------------------------------------------------------------------------
To: ${recipient}
CC: ${cleanCc.length > 0 ? cleanCc.join(', ') : 'None'}
Subject: ${subject}
Lead Name: ${leadName}
Lead Email: ${leadEmail}
Lead Phone: ${leadPhone}
Comments: ${leadComments}
${customFieldEntries.length > 0 ? 'Custom Fields:\n' + customFieldEntries.map((f) => `  * ${f.label}: ${f.value}`).join('\n') : ''}
--------------------------------------------------------------------------------
[Admin Setup Note]: To send direct inbox emails, configure standard SMTP in your .env file:
   SMTP_HOST="smtp.gmail.com" (or your provider)
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
================================================================================
  `);

  return { success: true, simulated: true };
}

export interface SendAppointmentConfirmationEmailOptions {
  to: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName?: string;
  price?: number;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  notes?: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  manageToken?: string;
  assistantSlug?: string;
  assistantId?: string;
  isAdminNotification?: boolean;
}

export interface SendAppointmentReminderEmailOptions {
  to: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName?: string;
  price?: number;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  manageToken?: string;
  assistantSlug?: string;
  assistantId?: string;
  reminderType: '24h' | '1h';
  isAdminNotification?: boolean;
}

export function generateGoogleCalendarUrl(options: {
  title: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  details: string;
  location?: string;
}): string {
  try {
    const [hours, minutes] = options.timeSlot.split(':').map(Number);
    const [year, month, day] = options.date.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 9, minutes || 0, 0));
    const endDate = new Date(startDate.getTime() + (options.durationMinutes || 30) * 60000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${startDate.getUTCFullYear()}${pad(startDate.getUTCMonth() + 1)}${pad(startDate.getUTCDate())}T${pad(startDate.getUTCHours())}${pad(startDate.getUTCMinutes())}00Z`;
    const endStr = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}00Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(options.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(options.details)}&location=${encodeURIComponent(options.location || '')}`;
  } catch {
    return 'https://calendar.google.com';
  }
}

async function sendEmailTransport(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromName: string;
}): Promise<EmailSendResult> {
  const { to, subject, text, html, fromName } = payload;
  const dbSmtp = await Database.getSmtpSettings().catch(() => null);

  // 1. Resend API Check
  const resendKey = dbSmtp?.resendApiKey || process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    try {
      const fromEmail = dbSmtp?.resendFrom || process.env.RESEND_FROM || 'onboarding@resend.dev';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to.trim()],
          subject,
          html,
          text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Resend API error');
      console.log(`[EmailService] Delivered via Resend to ${to} (ID: ${data.id})`);
      return { success: true, messageId: data.id };
    } catch (resendErr: any) {
      console.error('[EmailService] Resend failed, falling back to SMTP:', resendErr?.message);
    }
  }

  // 2. SMTP Check
  const smtpHost = dbSmtp?.host || process.env.SMTP_HOST;
  const smtpUser = dbSmtp?.user || process.env.SMTP_USER;
  const smtpPass = dbSmtp?.pass || process.env.SMTP_PASS;
  const smtpPort = dbSmtp?.port || parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpSecure = dbSmtp?.secure !== undefined ? dbSmtp.secure : (process.env.SMTP_SECURE === 'true' || smtpPort === 465);
  const smtpFrom = dbSmtp?.from || process.env.SMTP_FROM || smtpUser || `noreply@crescelo.com`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${smtpFrom}>`,
        to: to.trim(),
        subject,
        text,
        html,
      });

      console.log(`[EmailService] Delivered via SMTP to ${to} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[EmailService] SMTP delivery failed:', err?.message);
      return { success: false, error: err?.message };
    }
  }

  // Fallback simulator
  console.log(`
================================================================================
[SIMULATED EMAIL DISPATCH - NO SMTP CONFIGURED]
To: ${to}
From: ${fromName} <${smtpFrom}>
Subject: ${subject}
--------------------------------------------------------------------------------
${text}
================================================================================
  `);
  return { success: true, simulated: true };
}

export async function sendTestDiagnosticEmail(
  to: string,
  customConfig?: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    from?: string;
    resendApiKey?: string;
    resendFrom?: string;
  }
): Promise<EmailSendResult> {
  const subject = `Crescelo SMTP Test: Verification Succeeded`;
  const text = `Congratulations! Your email server settings are working correctly.\nDispatched at: ${new Date().toISOString()}\nTarget: ${to}\n`;
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:20px auto;border:1px solid #e2e8f0;border-radius:12px;padding:24px;background:#ffffff;">
      <h2 style="color:#0f172a;margin-top:0;">Email Delivery Verification</h2>
      <p style="color:#16a34a;font-weight:bold;font-size:16px;">Success! Your SMTP / Email delivery configuration is connected.</p>
      <p style="color:#475569;font-size:13px;line-height:1.6;">
        All appointment confirmations, 24-hour and 1-hour reminders, and new lead inquiries will now be dispatched live to client inboxes.
      </p>
      <div style="background:#f8fafc;padding:12px;border-radius:8px;font-size:12px;color:#64748b;font-family:monospace;margin-top:16px;">
        Dispatched at: ${new Date().toLocaleString()}<br/>
        Recipient: ${escapeHtml(to)}
      </div>
    </div>
  `;

  if (customConfig?.resendApiKey) {
    try {
      const fromEmail = customConfig.resendFrom || 'onboarding@resend.dev';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${customConfig.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Crescelo <${fromEmail}>`,
          to: [to.trim()],
          subject,
          html,
          text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Resend API error');
      return { success: true, messageId: data.id };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  if (customConfig?.host && customConfig?.user && customConfig?.pass) {
    try {
      const port = customConfig.port || 587;
      const secure = customConfig.secure !== undefined ? customConfig.secure : port === 465;
      const transporter = nodemailer.createTransport({
        host: customConfig.host,
        port,
        secure,
        auth: { user: customConfig.user, pass: customConfig.pass },
      });

      const info = await transporter.sendMail({
        from: `"Crescelo Diagnostic" <${customConfig.from || customConfig.user}>`,
        to: to.trim(),
        subject,
        text,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  return sendEmailTransport({
    to,
    subject,
    text,
    html,
    fromName: 'Crescelo Diagnostic',
  });
}

export async function sendAppointmentConfirmationEmail(
  options: SendAppointmentConfirmationEmailOptions
): Promise<EmailSendResult> {
  const {
    to,
    clientName,
    clientEmail,
    clientPhone = 'Not provided',
    serviceName = 'Appointment',
    price,
    date,
    timeSlot,
    durationMinutes,
    notes = 'None',
    businessName,
    businessAddress = 'Our Location',
    businessPhone = '',
    manageToken,
    assistantSlug,
    assistantId,
    isAdminNotification = false,
  } = options;

  if (!to || !to.trim()) {
    return { success: false, error: 'Recipient email missing' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetSlug = assistantSlug || assistantId || 'demo-assistant';
  const manageUrl = manageToken
    ? `${appUrl}/site/${targetSlug}?manageToken=${manageToken}`
    : `${appUrl}/site/${targetSlug}`;

  const calUrl = generateGoogleCalendarUrl({
    title: `${serviceName} at ${businessName}`,
    date,
    timeSlot,
    durationMinutes,
    details: `Client: ${clientName} (${clientPhone})\nService: ${serviceName}${price ? ` - $${price}` : ''}\nSelf-service manage link: ${manageUrl}`,
    location: businessAddress,
  });

  const subject = isAdminNotification
    ? `New Booking: ${clientName} - ${serviceName} on ${date} at ${timeSlot}`
    : `Appointment Confirmed: ${serviceName} at ${businessName}`;

  const textContent = isAdminNotification
    ? `NEW APPOINTMENT BOOKED\n\nClient: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nService: ${serviceName}${price ? ` ($${price})` : ''}\nDate: ${date}\nTime: ${timeSlot} (${durationMinutes} mins)\nNotes: ${notes}\n`
    : `APPOINTMENT CONFIRMATION\n\nDear ${clientName},\n\nYour appointment for ${serviceName} at ${businessName} is confirmed!\n\nDate: ${date}\nTime: ${timeSlot} (${durationMinutes} mins)\nLocation: ${businessAddress}\n${businessPhone ? `Phone: ${businessPhone}\n` : ''}${price ? `Price: $${price}\n` : ''}\nAdd to Google Calendar:\n${calUrl}\n\nReschedule or cancel:\n${manageUrl}\n`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px 12px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 28px 24px; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #2563eb; color: #ffffff; padding: 4px 8px; border-radius: 4px; }
    .content { padding: 28px 24px; }
    .appointment-box { background: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px; margin: 20px 0; }
    .item-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 600; text-align: right; }
    .btn-primary { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 10px; margin-bottom: 10px; }
    .btn-secondary { display: inline-block; background: #ffffff; color: #0f172a !important; text-decoration: none; padding: 11px 19px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 10px; }
    .footer { padding: 20px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${isAdminNotification ? 'ADMIN NOTICE' : 'CONFIRMED'}</span>
      <h1 style="margin-top: 10px;">${isAdminNotification ? 'New Booking Received' : 'Appointment Confirmed'}</h1>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">${escapeHtml(businessName)}</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">
        ${isAdminNotification ? `A new appointment has been scheduled by <strong>${escapeHtml(clientName)}</strong>.` : `Hello <strong>${escapeHtml(clientName)}</strong>, your booking is confirmed. We look forward to seeing you.`}
      </p>
      <div class="appointment-box">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Service</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(serviceName)}</td>
          </tr>
          ${price ? `<tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Price</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">$${price}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Date & Time</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(date)} at ${escapeHtml(timeSlot)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Duration</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${durationMinutes} Minutes</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Location</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(businessAddress)}</td>
          </tr>
          ${clientPhone && clientPhone !== 'Not provided' ? `<tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Phone</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(clientPhone)}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="margin-top: 24px;">
        <a href="${calUrl}" class="btn-primary" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
        <a href="${manageUrl}" class="btn-secondary" target="_blank" rel="noopener noreferrer">Manage Appointment</a>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
        Automated reminders will be sent 24 hours and 1 hour prior to your scheduled time. Need to make changes? Use the manage link above at any time.
      </p>
    </div>
    <div class="footer">
      <div>${escapeHtml(businessName)} &bull; ${escapeHtml(businessAddress)}</div>
      ${businessPhone ? `<div style="margin-top: 4px;">Inquiries: ${escapeHtml(businessPhone)}</div>` : ''}
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailTransport({
    to,
    subject,
    text: textContent,
    html: htmlContent,
    fromName: businessName,
  });
}

export async function sendAppointmentReminderEmail(
  options: SendAppointmentReminderEmailOptions
): Promise<EmailSendResult> {
  const {
    to,
    clientName,
    clientEmail,
    clientPhone = 'Not provided',
    serviceName = 'Appointment',
    price,
    date,
    timeSlot,
    durationMinutes,
    businessName,
    businessAddress = 'Our Location',
    businessPhone = '',
    manageToken,
    assistantSlug,
    assistantId,
    reminderType,
    isAdminNotification = false,
  } = options;

  if (!to || !to.trim()) {
    return { success: false, error: 'Recipient email missing' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetSlug = assistantSlug || assistantId || 'demo-assistant';
  const manageUrl = manageToken
    ? `${appUrl}/site/${targetSlug}?manageToken=${manageToken}`
    : `${appUrl}/site/${targetSlug}`;

  const reminderLabel = reminderType === '24h' ? 'Tomorrow (in 24 hours)' : 'Today (in 1 hour)';
  const badgeLabel = reminderType === '24h' ? '24-HOUR REMINDER' : '1-HOUR REMINDER';

  const subject = isAdminNotification
    ? `Admin Reminder (${badgeLabel}): ${clientName} - ${serviceName} on ${date} at ${timeSlot}`
    : `Upcoming Appointment Reminder: ${serviceName} ${reminderLabel}`;

  const textContent = isAdminNotification
    ? `UPCOMING APPOINTMENT REMINDER (${badgeLabel})\n\nClient: ${clientName}\nPhone: ${clientPhone}\nEmail: ${clientEmail}\nService: ${serviceName}${price ? ` ($${price})` : ''}\nScheduled for: ${date} at ${timeSlot} (${durationMinutes} mins)\n`
    : `APPOINTMENT REMINDER (${badgeLabel})\n\nDear ${clientName},\n\nThis is a friendly reminder of your upcoming ${serviceName} at ${businessName} scheduled for ${reminderLabel}.\n\nDate: ${date}\nTime: ${timeSlot}\nLocation: ${businessAddress}\n${businessPhone ? `Phone: ${businessPhone}\n` : ''}\nManage appointment:\n${manageUrl}\n`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px 12px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 28px 24px; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #f59e0b; color: #0f172a; padding: 4px 8px; border-radius: 4px; }
    .content { padding: 28px 24px; }
    .appointment-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 18px; margin: 20px 0; }
    .btn-secondary { display: inline-block; background: #ffffff; color: #0f172a !important; text-decoration: none; padding: 11px 19px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${badgeLabel}</span>
      <h1 style="margin-top: 10px;">${isAdminNotification ? 'Upcoming Appointment Reminder' : `Appointment ${reminderLabel}`}</h1>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">${escapeHtml(businessName)}</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">
        ${isAdminNotification ? `Reminder for upcoming appointment with <strong>${escapeHtml(clientName)}</strong>.` : `Hello <strong>${escapeHtml(clientName)}</strong>, this is a reminder that your appointment is coming up ${escapeHtml(reminderLabel)}.`}
      </p>
      <div class="appointment-box">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Service</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(serviceName)}</td>
          </tr>
          ${price ? `<tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Price</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">$${price}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Scheduled Time</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(date)} at ${escapeHtml(timeSlot)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Location</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(businessAddress)}</td>
          </tr>
          ${clientPhone && clientPhone !== 'Not provided' ? `<tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Client Phone</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(clientPhone)}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="margin-top: 24px;">
        <a href="${manageUrl}" class="btn-secondary" target="_blank" rel="noopener noreferrer">View or Reschedule Appointment</a>
      </div>
    </div>
    <div class="footer">
      <div>${escapeHtml(businessName)} &bull; ${escapeHtml(businessAddress)}</div>
      ${businessPhone ? `<div style="margin-top: 4px;">Inquiries: ${escapeHtml(businessPhone)}</div>` : ''}
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailTransport({
    to,
    subject,
    text: textContent,
    html: htmlContent,
    fromName: businessName,
  });
}

export interface SendContactInquiryOptions {
  name: string;
  email: string;
  business?: string;
  category: string;
  priority?: string;
  message: string;
}

export async function sendContactInquiryEmail(
  options: SendContactInquiryOptions
): Promise<EmailSendResult> {
  const { name, email, business, category, priority = 'Normal', message } = options;
  const recipient = process.env.CONTACT_EMAIL || 'contact@crescelo.com';
  const cleanName = name.trim() || 'Visitor';
  const cleanEmail = email.trim();
  const cleanBusiness = business?.trim() || 'Not specified';
  const cleanCategory = category.trim();
  const cleanPriority = priority.trim();
  const cleanMessage = message.trim();
  const dateStr = new Date().toLocaleString();

  const subject = `[${cleanPriority}] Support Inquiry: ${cleanCategory} - ${cleanName}`;
  const textContent = `
NEW SUPPORT INQUIRY
===================
Time: ${dateStr}
From: ${cleanName}
Email: ${cleanEmail}
Company: ${cleanBusiness}
Category: ${cleanCategory}
Priority: ${cleanPriority}

MESSAGE:
${cleanMessage}
===================
`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 12px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; }
    .body { padding: 24px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th { text-align: left; font-size: 12px; color: #64748b; padding: 6px 0; width: 30%; }
    .info-table td { font-size: 14px; color: #0f172a; padding: 6px 0; }
    .msg-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 6px; padding: 14px; white-space: pre-wrap; font-size: 14px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0;font-size:18px;">New Crescelo Support Inquiry</h2>
      <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8;">${escapeHtml(cleanCategory)} &bull; Priority: ${escapeHtml(cleanPriority)}</p>
    </div>
    <div class="body">
      <table class="info-table">
        <tr><th>Name:</th><td><strong>${escapeHtml(cleanName)}</strong></td></tr>
        <tr><th>Email:</th><td><a href="mailto:${encodeURIComponent(cleanEmail)}">${escapeHtml(cleanEmail)}</a></td></tr>
        <tr><th>Company:</th><td>${escapeHtml(cleanBusiness)}</td></tr>
        <tr><th>Category:</th><td>${escapeHtml(cleanCategory)}</td></tr>
        <tr><th>Date:</th><td>${escapeHtml(dateStr)}</td></tr>
      </table>
      <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Message</div>
      <div class="msg-box">${escapeHtml(cleanMessage)}</div>
      <a href="mailto:${encodeURIComponent(cleanEmail)}?subject=Re:%20${encodeURIComponent(subject)}" class="btn">Reply to ${escapeHtml(cleanName)}</a>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailTransport({
    to: recipient,
    subject,
    text: textContent,
    html: htmlContent,
    fromName: `Crescelo Support (${cleanName})`,
  });
}

