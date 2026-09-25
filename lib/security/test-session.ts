import { Database } from '@/lib/db';
import { generateSessionToken } from './auth';

/**
 * Test helper: a session is only valid for an account that exists, so this makes sure the account is there
 * (in memory, with the given role and workspace) before signing the token.
 */
export async function tokenFor(role: string, memberId: string, workspaceId = 'default-workspace', isMasterAdmin?: boolean): Promise<string> {
  if (!isMasterAdmin) {
    const state = await Database.getState();
    if (!state.teamMembers) state.teamMembers = [];
    const existing = state.teamMembers.find((m) => m.id === memberId);
    if (existing) {
      existing.role = role as any;
      existing.workspaceId = workspaceId;
      existing.status = 'active';
    } else {
      state.teamMembers.push({ id: memberId, workspaceId, name: memberId, email: `${memberId}@test.local`, role: role as any, status: 'active', createdAt: new Date().toISOString() });
    }
    return generateSessionToken(role, memberId, workspaceId, undefined, existing?.sessionVersion || 0);
  }
  return generateSessionToken(role, memberId, workspaceId, true);
}
