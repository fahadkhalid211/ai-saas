import nodemailer from 'nodemailer';
import { SupportCustomField } from './db';

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

/**
 * Sends a modern, branded HTML notification email to the admin/support team
 * when a new support inquiry or lead is submitted from the chat widget.
 */
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

  const subject = `New Support Request from ${leadName} (${assistantName})`;

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
      <p>Received via your AI Assistant: <strong>${assistantName}</strong></p>
    </div>
    <div class="body">
      <div class="badge">Action Required</div>

      <table class="info-table">
        <tr>
          <th>Full Name:</th>
          <td><strong>${leadName}</strong></td>
        </tr>
        <tr>
          <th>Email Address:</th>
          <td><a href="mailto:${leadEmail}" style="color:#2563eb;text-decoration:none;font-weight:600;">${leadEmail}</a></td>
        </tr>
        <tr>
          <th>Phone Number:</th>
          <td><a href="tel:${leadPhone}" style="color:#2563eb;text-decoration:none;">${leadPhone}</a></td>
        </tr>
        <tr>
          <th>Date &amp; Time:</th>
          <td>${submissionDate}</td>
        </tr>
        ${
          customFieldEntries.length > 0
            ? customFieldEntries
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
        <div class="comments-body">${leadComments}</div>
      </div>

      <div class="actions">
        <a href="mailto:${leadEmail}?subject=Re:%20Support%20Request%20-%20${encodeURIComponent(assistantName)}" class="btn btn-primary">
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
      Sent automatically by Kortex AI Chatbot Engine · Assistant: ${assistantName}
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
        from: `Kortex AI <${fromEmail}>`,
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
  const smtpFrom = process.env.SMTP_FROM || smtpUser || `noreply@kortex-ai.com`;

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
        from: `"Kortex AI Support" <${smtpFrom}>`,
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
