import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { denyUnlessMaster } from '@/lib/logging/access';
import { addTimelineEntry, getIncidents, upsertIncident, upsertService } from '@/lib/monitoring/store';
import { Incident, IncidentStatus, IncidentTimelineEntry } from '@/lib/monitoring/types';
import { dispatchAlert } from '@/lib/monitoring/alerts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const filter = (url.searchParams.get('filter') as any) || 'all';
  const incidents = await getIncidents(filter);

  return NextResponse.json({ incidents });
}

export async function POST(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create_incident') {
      const { serviceId, serviceName, severity, title, publicMessage, detectedReason, affectedComponents } = body;
      const incidentId = `inc_${Date.now()}_${serviceId}`;
      const nowIso = new Date().toISOString();

      const newIncident: Incident = {
        id: incidentId,
        serviceId,
        serviceName: serviceName || serviceId.toUpperCase(),
        severity: severity || 'warning',
        status: 'investigating',
        title,
        publicMessage: publicMessage || `We are investigating an issue affecting ${serviceName || serviceId}.`,
        detectedReason: detectedReason || 'Manually created by operator',
        detectedAt: nowIso,
        affectedComponents: affectedComponents || [serviceId],
        timeline: [
          {
            id: `tl_${Date.now()}_1`,
            incidentId,
            timestamp: nowIso,
            status: 'investigating',
            message: publicMessage || 'Investigation started.',
            isPublic: true,
            createdBy: 'developer',
          },
        ],
      };

      await upsertIncident(newIncident);
      await upsertService({
        id: serviceId,
        status: severity === 'critical' ? 'outage' : 'degraded',
        lastCheckedAt: nowIso,
      });

      await dispatchAlert({
        incident: newIncident,
        alertType: 'created',
        message: `Manual incident: ${newIncident.title}`,
      });

      return NextResponse.json({ success: true, incident: newIncident });
    }

    if (action === 'update_status') {
      const { incidentId, status, message, isPublic } = body;
      const incidents = await getIncidents('all');
      const inc = incidents.find((i) => i.id === incidentId);

      if (!inc) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }

      const nowIso = new Date().toISOString();
      const prevStatus = inc.status;
      inc.status = status as IncidentStatus;
      if (message) inc.publicMessage = message;

      if (status === 'resolved' && !inc.resolvedAt) {
        inc.resolvedAt = nowIso;
        inc.durationSeconds = Math.round(
          (new Date(nowIso).getTime() - new Date(inc.detectedAt).getTime()) / 1000
        );
        await upsertService({
          id: inc.serviceId,
          status: 'operational',
          lastCheckedAt: nowIso,
        });
      }

      await upsertIncident(inc);

      const timelineEntry: IncidentTimelineEntry = {
        id: `tl_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        incidentId: inc.id,
        timestamp: nowIso,
        status: inc.status,
        message: message || `Incident status updated to ${status.toUpperCase()}`,
        isPublic: isPublic !== false,
        createdBy: 'developer',
      };
      await addTimelineEntry(timelineEntry);

      if (status === 'resolved') {
        await dispatchAlert({
          incident: inc,
          alertType: 'recovered',
          message: `RESOLVED: ${inc.title}`,
        });
      } else if (prevStatus !== status) {
        await dispatchAlert({
          incident: inc,
          alertType: 'escalated',
          message: `STATUS UPDATE (${status.toUpperCase()}): ${inc.title}`,
        });
      }

      return NextResponse.json({ success: true, incident: inc });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to process incident update' }, { status: 500 });
  }
}
