import { describe, it, expect, vi } from 'vitest';

// pg hands TIMESTAMPTZ columns back as Date objects
const created = new Date('2026-09-26T12:18:48.000Z');
const row = { id: 'lead_1', assistant_id: 'ast_1', email: 'a@b.co', name: 'A', created_at: created, updated_at: created, custom_data: {} };

vi.mock('./postgres', () => ({
  getPostgresPool: () => ({
    connect: async () => ({ query: async () => ({ rows: [row] }), release: () => undefined }),
  }),
}));

import { relationalGetLeads, relationalGetConversations, relationalGetAppointments } from './relational';

describe('relational reads', () => {
  it('return timestamps as ISO strings, like the rest of the app expects', async () => {
    const [lead] = await relationalGetLeads('ast_1');
    expect(lead.createdAt).toBe('2026-09-26T12:18:48.000Z');
    expect(lead.createdAt.slice(0, 10)).toBe('2026-09-26'); // what /api/analytics does

    const [conv] = await relationalGetConversations('ast_1');
    expect(typeof conv.createdAt).toBe('string');
    expect(typeof conv.updatedAt).toBe('string');

    const [apt] = await relationalGetAppointments('ast_1');
    expect(typeof apt.createdAt).toBe('string');
  });
});
