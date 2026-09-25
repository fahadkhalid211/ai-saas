import { tokenFor } from '@/lib/security/test-session';
import { describe, it, expect, beforeAll } from 'vitest';
import { Database } from '@/lib/db';
import { generateConversationAccessToken, generateSessionToken } from '@/lib/security/auth';
import { GET as conversationsGET, POST as conversationsPOST } from '@/app/api/conversations/route';

describe('Live Agent to Widget communication', () => {
  let assistantId = '';
  let convId = '';
  let convToken = '';
  let adminSession = '';

  beforeAll(async () => {
    const assistants = await Database.getAssistants();
    const a = assistants[0];
    assistantId = a.id;
    adminSession = await tokenFor('admin', 'admin-user', a.workspaceId || 'default-workspace');

    // Create a conversation as visitor
    const conv = await Database.getOrCreateConversation(assistantId, 'vis_test_123');
    convId = conv.id;
    convToken = generateConversationAccessToken(convId);
    await Database.saveMessage(convId, 'user', 'I need human help');
  });

  it('allows unauthenticated widget to query conversation with capability token', async () => {
    const req = new Request(`http://localhost/api/conversations?id=${convId}&token=${convToken}`, {
      method: 'GET',
    });
    const res = await conversationsGET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.conversation).toBeDefined();
    expect(data.conversation.id).toBe(convId);
    expect(data.conversation.messages).toBeDefined();
  });

  it('rejects unauthenticated widget without valid token', async () => {
    const req = new Request(`http://localhost/api/conversations?id=${convId}&token=wrongtoken`, {
      method: 'GET',
    });
    const res = await conversationsGET(req);
    expect(res.status).toBe(401);
  });

  it('allows admin to send operator message to the conversation', async () => {
    const req = new Request('http://localhost/api/conversations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `kortex_admin_session=${adminSession}`,
      },
      body: JSON.stringify({
        conversationId: convId,
        content: 'Hello! I am a live agent.',
        agentName: 'Sarah (Support)',
        takeover: true,
      }),
    });
    const res = await conversationsPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message.content).toBe('Hello! I am a live agent.');
    expect(data.message.role).toBe('agent');
    expect(data.message.senderName).toBe('Sarah (Support)');
  });

  it('returns the agent message to the widget upon polling', async () => {
    const req = new Request(`http://localhost/api/conversations?id=${convId}&token=${convToken}`, {
      method: 'GET',
    });
    const res = await conversationsGET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    const messages = data.conversation.messages;
    expect(messages).toBeDefined();
    const agentMsg = messages.find((m: any) => m.role === 'agent');
    expect(agentMsg).toBeDefined();
    expect(agentMsg.content).toBe('Hello! I am a live agent.');
    expect(agentMsg.senderName).toBe('Sarah (Support)');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('supports OPTIONS preflight on /api/conversations with CORS headers', async () => {
    const { OPTIONS: conversationsOPTIONS } = await import('@/app/api/conversations/route');
    const res = await conversationsOPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
  });

  it('supports incremental polling with sinceCount and returns CORS headers', async () => {
    const req = new Request(`http://localhost/api/conversations?id=${convId}&token=${convToken}&sinceCount=1`, {
      method: 'GET',
    });
    const res = await conversationsGET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    const data = await res.json();
    expect(data.newMessages).toBeDefined();
    expect(Array.isArray(data.newMessages)).toBe(true);
    expect(data.newMessages.length).toBeGreaterThan(0);
    expect(data.newMessages[0].role).toBe('agent');
  });
});
