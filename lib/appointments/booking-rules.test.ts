import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// each call comes from its own address, so the per-address booking limit does not get in the way
beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());

async function book(body: Record<string, unknown>) {
  const { POST } = await import('../../app/api/appointments/route');
  const res = await POST(
    new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, json: await res.json() };
}

// 2099-11-02 is a Monday, 2099-11-01 a Sunday
const person = { name: 'Rule Tester', email: 'rules@example.com', phone: '+1 555-456-7890' };

describe('public booking rules', () => {
  it('refuses a closed day and times outside the configured hours, and accepts a valid one', async () => {
    const { Database } = await import('../db');
    const created = await Database.createAssistant({ name: 'Rules test', workspaceId: 'ws_rules_test' });
    const ast = (await Database.updateAssistant(created.id, {
      bookingStartHour: '09:00',
      bookingEndHour: '18:00',
      bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }))!;

    expect((await book({ ...person, assistantId: ast.id, date: '2099-11-01', timeSlot: '10:00 AM' })).status).toBe(400);
    expect((await book({ ...person, assistantId: ast.id, date: '2099-11-02', timeSlot: '03:00 AM' })).status).toBe(400);
    expect((await book({ ...person, assistantId: ast.id, date: '2099-11-02', timeSlot: '10:00 AM' })).status).toBe(201);
  });

  it('answers a repeat of the same person\'s booking with the booking they already hold, without a manage token', async () => {
    const { Database } = await import('../db');
    const ast = await Database.createAssistant({ name: 'Retry test', workspaceId: 'ws_retry_test' });
    const first = await book({ ...person, assistantId: ast.id, date: '2099-11-03', timeSlot: '11:00 AM' });
    expect(first.status).toBe(201);
    expect(first.json.appointment.manageToken).toBeTruthy();

    const again = await book({ ...person, email: 'RULES@example.com', assistantId: ast.id, date: '2099-11-03', timeSlot: '11:00 AM' });
    expect(again.status).toBe(200);
    expect(again.json.alreadyBooked).toBe(true);
    expect(again.json.appointment.id).toBe(first.json.appointment.id);
    expect(again.json.appointment.manageToken).toBeUndefined();

    const someoneElse = await book({ ...person, email: 'other@example.com', assistantId: ast.id, date: '2099-11-03', timeSlot: '11:00 AM' });
    expect(someoneElse.status).toBe(409);
  });

  it('refuses an assistant id that matches nothing instead of booking into the demo assistant', async () => {
    const res = await book({ ...person, assistantId: 'ast_does_not_exist', date: '2099-11-04', timeSlot: '10:00 AM' });
    expect(res.status).toBe(404);
  });
});
