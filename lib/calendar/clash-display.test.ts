import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { I18nProvider } from '@/lib/i18n/context';
import { Database } from '@/lib/db';
import { ExternalClashBadge } from '@/components/crm/ExternalClashBadge';
import { AppointmentDetailsModal } from '@/components/crm/modals/AppointmentDetailsModal';
import type { Appointment } from '@/components/crm/AppointmentsTab';

/** Spec section 4: the owner sees the clash on the booking; the guest's manage link never shows it. JSON mode, no database. */

const DB_ENV = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
const TEXT = 'Clashes with an event in your calendar';
const html = (el: React.ReactElement) => renderToString(React.createElement(I18nProvider, null, el));

beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const appt = (over: Partial<Appointment> = {}): Appointment => ({
  id: 'apt_1', assistantId: 'ast_1', name: 'Guest', email: 'g@example.com', date: '2026-11-02', timeSlot: '10:00', durationMinutes: 30, status: 'confirmed', createdAt: '2026-10-01T00:00:00.000Z', ...over,
});

describe('the clash is shown on the appointment', () => {
  it('the badge has an icon and words (not colour only), and only when a clash is marked', () => {
    const on = html(React.createElement(ExternalClashBadge, { clashAt: '2026-10-24T10:00:00.000Z' }));
    expect(on).toContain(TEXT);
    expect(on).toContain('<svg');
    expect(on).toMatch(/dark:/);
    expect(html(React.createElement(ExternalClashBadge, { clashAt: null }))).toBe(html(React.createElement(React.Fragment)));
  });

  it('the appointment details show it', () => {
    const props = { onClose: () => undefined, onStatusChange: () => undefined };
    expect(html(React.createElement(AppointmentDetailsModal, { appt: appt({ externalClashAt: '2026-10-24T10:00:00.000Z' }), ...props }))).toContain(TEXT);
    expect(html(React.createElement(AppointmentDetailsModal, { appt: appt(), ...props }))).not.toContain(TEXT);
  });
});

describe('who receives externalClashAt', () => {
  it('the dashboard list includes it; the guest manage link and the guest reschedule answer do not', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const ast = await Database.createAssistant({ name: 'Clash display', workspaceId: `ws_clash_disp_${Date.now().toString(36)}` });
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Guest', email: 'g@example.com', date: '2099-11-02', timeSlot: '10:00', durationMinutes: 30 });
    await Database.updateAppointment(apt.id, { externalClashAt: '2026-10-24T10:00:00.000Z' });
    const { GET, POST } = await import('../../app/api/appointments/route');

    const list = await (await GET(new Request(`http://localhost/api/appointments?assistantId=${ast.id}`, { headers: { Authorization: `Bearer ${adminKey}` } }))).json();
    expect(list.appointments.find((a: { id: string }) => a.id === apt.id).externalClashAt).toBe('2026-10-24T10:00:00.000Z');

    const guest = await GET(new Request(`http://localhost/api/appointments?manageToken=${apt.manageToken}`));
    const guestText = await guest.text();
    expect(guest.status).toBe(200);
    expect(guestText).toContain(apt.id);
    expect(guestText).not.toContain('externalClashAt');

    const moved = await POST(
      new Request('http://localhost/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: '2099-11-03', newTimeSlot: '11:00' }),
      }),
    );
    expect(moved.status).toBe(200);
    expect(await moved.text()).not.toContain('externalClashAt');
  });
});
