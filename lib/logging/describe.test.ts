import { describe, it, expect } from 'vitest';
import { describeLog, technicalLine } from './describe';

describe('plain-language log descriptions', () => {
  it('describes a Google sign-up with the person and workspace', () => {
    const text = describeLog(
      { event: 'auth.oauth_provisioned', userId: 'tm_1', meta: { actorName: 'Waqas Ali', email: 'waqas@example.com', details: { provider: 'google' } } },
      { workspace: 'Waqas Studio' }
    );
    expect(text).toBe('New sign-up: waqas@example.com created an account with Google (workspace "Waqas Studio").');
  });

  it('describes a password sign-up', () => {
    expect(describeLog({ event: 'auth.tenant_registered', meta: { details: { businessName: 'Bright Dental', email: 'amy@bright.co' } } })).toBe(
      'New sign-up: amy@bright.co created an account and the workspace "Bright Dental".'
    );
  });

  it('describes an access code, a failed sign-in and a saved assistant', () => {
    expect(describeLog({ event: 'billing.access_code_redeemed', userId: 'tm_1', meta: { actorName: 'Amy', details: { code: 'WAQAS', planId: 'growth', days: 30 } } })).toBe(
      'Amy used the access code WAQAS: Growth plan, free for 30 days.'
    );
    expect(describeLog({ event: 'auth.login_failed', meta: { details: { attemptedEmail: 'x@y.co' } } })).toContain('A sign-in failed for x@y.co');
    expect(describeLog({ event: 'assistant.updated', userId: 'tm_1', meta: { actorName: 'Amy', details: { name: 'Front desk', provider: 'anthropic', modelName: 'claude-haiku-4-5' } } })).toBe(
      'Amy saved settings for the assistant "Front desk" (AI engine: anthropic, claude-haiku-4-5).'
    );
  });

  it('describes requests by what they do and how they ended', () => {
    expect(describeLog({ event: 'http.request', method: 'PUT', route: '/api/assistants/[id]', status: 200, userId: 'tm_1' }, { user: 'Amy (amy@bright.co)' })).toBe(
      'Amy (amy@bright.co) saved assistant settings. It worked.'
    );
    expect(describeLog({ event: 'http.request', method: 'GET', route: '/api/assistants', status: 401 })).toBe(
      'Someone not signed in loaded their assistants. It was refused: not signed in, or the session had ended.'
    );
    expect(describeLog({ event: 'http.request', method: 'PUT', route: '/api/assistants/[id]', status: 402, userId: 'tm_1' })).toContain('no active plan');
    expect(describeLog({ event: 'http.request', method: 'GET', route: '/api/analytics', status: 500, userId: 'master-admin', role: 'master' })).toBe(
      'The platform owner opened the analytics. It failed because of an error on the server.'
    );
    expect(describeLog({ event: 'http.request', method: 'POST', route: '/api/chat', status: 200 })).toBe('A website visitor sent a chat message. It worked.');
  });

  it('marks what the platform owner does inside a customer account', () => {
    expect(describeLog({ event: 'http.request', method: 'PUT', route: '/api/assistants/[id]', status: 200, userId: 'tm_1', role: 'support' })).toContain('The platform owner (support access) saved assistant settings');
  });

  it('falls back to a readable sentence for unknown routes and events', () => {
    expect(describeLog({ event: 'http.request', method: 'POST', route: '/api/new-thing', status: 200, userId: 'tm_1' })).toBe('A signed-in user made a POST request to /api/new-thing. It worked.');
    expect(describeLog({ event: 'inventory.stock_synced', userId: 'tm_1', meta: { actorName: 'Amy' } })).toBe('Amy: inventory stock synced.');
    expect(describeLog({ event: 'custom.thing', message: 'Already a sentence.' })).toBe('Already a sentence.');
  });

  it('keeps the technical cause available separately', () => {
    const row = { event: 'console.error', message: 'Failed to get analytics: e.createdAt.slice is not a function', errorName: 'TypeError', errorMessage: 'e.createdAt.slice is not a function' };
    expect(describeLog(row)).toContain('The server reported an error: Failed to get analytics');
    expect(technicalLine(row)).toBe('TypeError: e.createdAt.slice is not a function');
    expect(technicalLine({ event: 'x' })).toBe('');
  });
});
