import crypto from 'node:crypto';
import { getMasterEmail } from '@/lib/security/master';
import { sendOperationalEmail } from '@/lib/email';
import { getMonitoringConfig } from './config';
import { Incident, MonitoringAlert } from './types';
import { recordAlert } from './store';

interface AlertDispatchInput {
  incident: Incident;
  alertType: 'created' | 'escalated' | 'recovered';
  message: string;
}

const alertCooldownCache = new Map<string, number>();

export async function dispatchAlert(input: AlertDispatchInput): Promise<void> {
  const { incident, alertType, message } = input;
  const config = getMonitoringConfig();

  // Deduplication & cooldown key
  const cooldownKey = `${incident.id}:${alertType}`;
  const now = Date.now();
  const lastSent = alertCooldownCache.get(cooldownKey);
  const cooldownMs = config.alertCooldownMinutes * 60_000;

  if (lastSent && now - lastSent < cooldownMs) {
    // Cooldown active, skip to prevent alert spam
    return;
  }
  alertCooldownCache.set(cooldownKey, now);

  const subject = `[Crescelo Status] ${alertType.toUpperCase()}: ${incident.title}`;
  const emailBody = [
    `Crescelo System Monitoring Alert`,
    `----------------------------------------`,
    `Status: ${alertType.toUpperCase()}`,
    `Service: ${incident.serviceName} (${incident.serviceId})`,
    `Severity: ${incident.severity.toUpperCase()}`,
    `Detected At: ${incident.detectedAt}`,
    incident.resolvedAt ? `Resolved At: ${incident.resolvedAt}` : null,
    incident.durationSeconds ? `Duration: ${Math.round(incident.durationSeconds / 60)} minutes` : null,
    `Reason: ${incident.detectedReason}`,
    incident.deploymentRef ? `Nearby Deployment: ${incident.deploymentRef}` : null,
    `Public Message: ${incident.publicMessage}`,
    `----------------------------------------`,
    `Incident ID: ${incident.id}`,
    `Live Status Page: https://status.crescelo.com`,
  ]
    .filter(Boolean)
    .join('\n');

  // 1. Dispatch Email to Master Admin
  const masterEmail = getMasterEmail();
  if (masterEmail) {
    try {
      const emailResult = await sendOperationalEmail({
        to: masterEmail,
        subject,
        text: emailBody,
      });

      const alertRecord: MonitoringAlert = {
        id: `alt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        incidentId: incident.id,
        serviceId: incident.serviceId,
        alertType,
        sentAt: new Date().toISOString(),
        channel: 'email',
        recipient: masterEmail,
        message: subject,
        status: emailResult.success ? 'sent' : 'failed',
      };
      await recordAlert(alertRecord);
    } catch {
      // alert errors must never throw
    }
  }

  // 2. Dispatch to Webhook (Slack / Discord / PagerDuty / Custom)
  if (config.webhookUrl) {
    try {
      const payload = {
        text: subject,
        incidentId: incident.id,
        service: incident.serviceName,
        severity: incident.severity,
        status: incident.status,
        alertType,
        message,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      const alertRecord: MonitoringAlert = {
        id: `alt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        incidentId: incident.id,
        serviceId: incident.serviceId,
        alertType,
        sentAt: new Date().toISOString(),
        channel: 'webhook',
        recipient: config.webhookUrl.replace(/\/\/[^@]+@/, '//***@').slice(0, 80),
        message: subject,
        status: res && res.ok ? 'sent' : 'failed',
      };
      await recordAlert(alertRecord);
    } catch {
      // ignore webhook failures
    }
  }
}

export function _resetAlertCooldownForTesting(): void {
  alertCooldownCache.clear();
}
