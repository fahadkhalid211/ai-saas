import { describe, it, expect } from 'vitest';
import { changeStatus, closeStaleResolved, customerReply, deriveToken, openTicket, resolveAccess, staffReply, threadFor, TicketError } from './tickets';
import { buildTicketEmail } from './emails';
import type { AuthContext } from '@/lib/security/auth';

const uniq = () => Math.random().toString(36).slice(2, 10);
const guest: AuthContext = { authenticated: false, role: 'guest', memberId: '', workspaceId: 'default-workspace', isMasterAdmin: false };
const member = (workspaceId: string): AuthContext => ({ authenticated: true, role: 'owner', memberId: 'tm_x', workspaceId, isMasterAdmin: false });
const master: AuthContext = { authenticated: true, role: 'admin', memberId: 'master-admin', workspaceId: '*', isMasterAdmin: true };

async function make(extra: Record<string, unknown> = {}) {
  return openTicket({ name: 'Alex', email: `alex-${uniq()}@example.com`, message: 'The widget does not load on my site.', category: 'Technical Support', ...extra });
}

describe('support tickets', () => {
  it('opens a ticket with a reference and a private link token', async () => {
    const { ticket, token } = await make();
    expect(ticket.ref).toMatch(/^CR-\d{6}$/);
    expect(ticket.status).toBe('open');
    expect(token).toBe(deriveToken(ticket.ref));
  });

  it('rejects bad input', async () => {
    await expect(openTicket({ name: '', email: 'a@b.co', message: 'long enough message here' })).rejects.toBeInstanceOf(TicketError);
    await expect(openTicket({ name: 'A', email: 'not-an-email', message: 'long enough message here' })).rejects.toBeInstanceOf(TicketError);
    await expect(openTicket({ name: 'A', email: 'a@b.co', message: 'short' })).rejects.toBeInstanceOf(TicketError);
  });

  it('limits how many tickets one address can open per hour', async () => {
    const email = `flood-${uniq()}@example.com`;
    for (let i = 0; i < 3; i++) await openTicket({ name: 'A', email, message: 'a perfectly fine message ' + i });
    await expect(openTicket({ name: 'A', email, message: 'one more message please' })).rejects.toMatchObject({ status: 429 });
  });

  it('gives access only to the requester link, the raising workspace and the owner', async () => {
    const { ticket, token } = await make({ workspaceId: 'ws_sup_a' });
    expect((await resolveAccess(ticket.ref, token, guest))?.access).toBe('requester');
    expect(await resolveAccess(ticket.ref, 'wrong-token', guest)).toBeNull();
    expect(await resolveAccess(ticket.ref, null, guest)).toBeNull();
    expect((await resolveAccess(ticket.ref, null, member('ws_sup_a')))?.access).toBe('workspace');
    expect(await resolveAccess(ticket.ref, null, member('ws_sup_b'))).toBeNull();
    expect((await resolveAccess(ticket.ref, null, master))?.access).toBe('master');
    expect(await resolveAccess('CR-000001x', token, guest)).toBeNull();
  });

  it('a staff reply sets the ticket to pending, internal notes stay hidden from the requester', async () => {
    const { ticket, token } = await make();
    await staffReply(ticket, 'Have you tried clearing the cache?', 'Crescelo Support');
    await staffReply(ticket, 'customer seems to be on an old plan', 'Crescelo Support', { internal: true });
    const found = (await resolveAccess(ticket.ref, token, guest))!;
    expect(found.ticket.status).toBe('pending');
    const asRequester = await threadFor(found.ticket, 'requester');
    expect(asRequester.map((m) => m.body)).toEqual(['The widget does not load on my site.', 'Have you tried clearing the cache?']);
    const asOwner = await threadFor(found.ticket, 'master');
    expect(asOwner).toHaveLength(3);
  });

  it('a customer reply reopens a resolved ticket but not a closed one', async () => {
    const { ticket, token } = await make();
    await staffReply(ticket, 'Fixed on our side.', 'Crescelo Support', { resolve: true });
    let cur = (await resolveAccess(ticket.ref, token, guest))!.ticket;
    expect(cur.status).toBe('resolved');
    await customerReply(cur, 'Still broken, sorry.', 'Alex');
    cur = (await resolveAccess(ticket.ref, token, guest))!.ticket;
    expect(cur.status).toBe('open');
    await changeStatus(cur, 'closed');
    cur = (await resolveAccess(ticket.ref, token, guest))!.ticket;
    await expect(customerReply(cur, 'hello?', 'Alex')).rejects.toMatchObject({ status: 409 });
  });

  it('the daily job leaves recently resolved tickets alone', async () => {
    const { ticket } = await make();
    await changeStatus(ticket, 'resolved');
    const closed = await closeStaleResolved();
    expect(closed).toBe(0);
  });

  it('escapes what people type in e-mails and strips line breaks from subjects', async () => {
    const { ticket } = await make({ subject: 'Hello\r\nBcc: victim@example.com', name: '<script>alert(1)</script>' });
    const mail = buildTicketEmail('created', ticket, { token: 'tok', message: '<img src=x onerror=alert(1)>' });
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).not.toContain('<img src=x');
    expect(mail.html).toContain('&lt;img');
  });

  it('never publishes a mailbox in the e-mails', async () => {
    const { ticket } = await make();
    for (const kind of ['created', 'staff_reply', 'resolved', 'closed'] as const) {
      const mail = buildTicketEmail(kind, ticket, { token: 't', message: 'x' });
      expect(mail.html + mail.text).not.toMatch(/contact@crescelo\.com/);
    }
  });
});
