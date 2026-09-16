import { isSupabaseConfigured, fetchSupabaseState, persistSupabaseState, fetchSupabaseChunks, persistSupabaseChunks } from './supabase';
import { isPostgresConfigured, fetchPostgresState, persistPostgresState, fetchPostgresChunks, persistPostgresChunks } from './postgres';

export function isCloudDbConfigured(): boolean {
  return isPostgresConfigured() || isSupabaseConfigured();
}

export function getCloudDbProvider(): 'postgres' | 'supabase' | 'ephemeral' {
  if (isPostgresConfigured()) return 'postgres';
  if (isSupabaseConfigured()) return 'supabase';
  return 'ephemeral';
}

function mergeById<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  baseList: T[] = [],
  incomingList: T[] = [],
  incomingWins: boolean = false
): T[] {
  const map = new Map<string, T>();
  for (const item of baseList) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of incomingList) {
    if (item && item.id) {
      const existing = map.get(item.id);
      if (!existing || incomingWins) {
        map.set(item.id, { ...(existing || {}), ...item });
      } else {
        const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        if (itemTime >= existingTime) {
          map.set(item.id, { ...existing, ...item });
        }
      }
    }
  }
  return Array.from(map.values());
}

export async function fetchCloudState(): Promise<any | null> {
  if (isPostgresConfigured()) {
    const pg = await fetchPostgresState();
    if (pg) return pg;
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseState();
  }
  return null;
}

export interface PersistCloudStateOptions {
  deletedSourceId?: string;
  deletedAssistantId?: string;
}

export async function persistCloudState(
  state: any,
  options?: PersistCloudStateOptions
): Promise<boolean> {
  if (!isCloudDbConfigured()) return false;

  try {
    // Read remote state to merge transactional collections safely
    const remote = await fetchCloudState();
    let mergedState = { ...state };

    if (remote && typeof remote === 'object') {
      let baseSources = remote.knowledgeSources || [];
      if (options?.deletedSourceId) {
        baseSources = baseSources.filter((s: any) => s.id !== options.deletedSourceId);
      }
      if (options?.deletedAssistantId) {
        baseSources = baseSources.filter((s: any) => s.assistantId !== options.deletedAssistantId);
      }

      let baseAssistants = remote.assistants || [];
      if (options?.deletedAssistantId) {
        baseAssistants = baseAssistants.filter((a: any) => a.id !== options.deletedAssistantId);
      }

      mergedState.knowledgeSources = mergeById(baseSources, state.knowledgeSources || [], true);
      mergedState.assistants = mergeById(baseAssistants, state.assistants || [], true);
      mergedState.landingPages = mergeById(remote.landingPages || [], state.landingPages || [], true);
      mergedState.appointments = mergeById(remote.appointments || [], state.appointments || []);
      mergedState.conversations = mergeById(remote.conversations || [], state.conversations || []);
      mergedState.messages = mergeById(remote.messages || [], state.messages || []);
      mergedState.leads = mergeById(remote.leads || [], state.leads || []);
      mergedState.notifications = mergeById(remote.notifications || [], state.notifications || []);
      mergedState.unansweredQueries = mergeById(remote.unansweredQueries || [], state.unansweredQueries || []);
      mergedState.auditLogs = mergeById(remote.auditLogs || [], state.auditLogs || []);
      mergedState.teamMembers = mergeById(remote.teamMembers || [], state.teamMembers || []);
      mergedState.workspaces = mergeById(remote.workspaces || [], state.workspaces || []);
    }

    if (isPostgresConfigured()) {
      const ok = await persistPostgresState(mergedState);
      if (ok) return true;
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(mergedState);
    }
    return false;
  } catch (err: any) {
    console.warn('[Cloud DB] Exception during state persistence:', err?.message || err);
    if (isPostgresConfigured()) {
      const ok = await persistPostgresState(state);
      if (ok) return true;
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(state);
    }
    return false;
  }
}

export async function fetchCloudChunks(): Promise<any[] | null> {
  if (isPostgresConfigured()) {
    const pg = await fetchPostgresChunks();
    if (pg) return pg;
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseChunks();
  }
  return null;
}

export async function persistCloudChunks(chunks: any[], overwrite: boolean = false): Promise<boolean> {
  let chunksToPersist = chunks;
  if (!overwrite) {
    try {
      const remote = await fetchCloudChunks();
      if (remote && Array.isArray(remote) && remote.length > 0) {
        chunksToPersist = mergeById(remote, chunks, true);
      }
    } catch (err: any) {
      console.warn('[Cloud DB] Failed to merge remote chunks:', err?.message || err);
    }
  }

  if (isPostgresConfigured()) {
    const ok = await persistPostgresChunks(chunksToPersist);
    if (ok) return true;
  }
  if (isSupabaseConfigured()) {
    return persistSupabaseChunks(chunksToPersist);
  }
  return false;
}
