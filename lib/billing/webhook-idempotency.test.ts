import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../db';
import { POST as webhookHandler } from '../../app/api/billing/webhook/route';
import { NextRequest } from 'next/server';

describe('Sprint 2: Stripe Webhook Idempotency & Duplicate Protection', () => {
  beforeEach(async () => {
    // Reset state before tests
    await Database.clearProcessedWebhooksForTesting();
  });

  it('Database should record and detect processed webhook event IDs', async () => {
    const eventId = 'evt_test_' + Date.now();
    expect(await Database.isWebhookProcessed(eventId)).toBe(false);

    await Database.recordProcessedWebhook(eventId);
    expect(await Database.isWebhookProcessed(eventId)).toBe(true);

    // Repeated recording should be idempotent and not duplicate
    await Database.recordProcessedWebhook(eventId);
    expect(await Database.isWebhookProcessed(eventId)).toBe(true);
  });

  it('Database.recordProcessedWebhook should prune older events when exceeding 1000 items', async () => {
    const legacyEvents = Array.from({ length: 1005 }, (_, i) => `evt_legacy_${i}`);
    await Database.seedProcessedWebhooksForTesting(legacyEvents);

    await Database.recordProcessedWebhook('evt_fresh_new');
    const count = await Database.getProcessedWebhookCount();
    expect(count).toBeLessThanOrEqual(1000);
    expect(await Database.isWebhookProcessed('evt_fresh_new')).toBe(true);
    expect(await Database.isWebhookProcessed('evt_legacy_0')).toBe(false); // First items pruned
  });
});
