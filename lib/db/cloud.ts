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
  incomingList: T[] = []
): T[] {
  const map = new Map<string, T>();
  for (const item of baseList) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of incomingList) {
    if (item && item.id) {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const itemTime = item.updatedAt || item.createdAt || '';
        const existingTime = existing.updatedAt || existing.createdAt || '';
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
    return fetchPostgresState();
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseState();
  }
  return null;
}

export async function persistCloudState(state: any): Promise<boolean> {
  if (!isCloudDbConfigured()) return false;

  try {
    // Read remote state to merge transactional collections safely
    const remote = await fetchCloudState();
    let mergedState = { ...state };

    if (remote && typeof remote === 'object') {
      mergedState.appointments = mergeById(remote.appointments || [], state.appointments || []);
      mergedState.conversations = mergeById(remote.conversations || [], state.conversations || []);
      mergedState.messages = mergeById(remote.messages || [], state.messages || []);
      mergedState.leads = mergeById(remote.leads || [], state.leads || []);
      mergedState.notifications = mergeById(remote.notifications || [], state.notifications || []);
      mergedState.unansweredQueries = mergeById(remote.unansweredQueries || [], state.unansweredQueries || []);
      mergedState.auditLogs = mergeById(remote.auditLogs || [], state.auditLogs || []);
      mergedState.landingPages = mergeById(remote.landingPages || [], state.landingPages || []);
      mergedState.assistants = mergeById(remote.assistants || [], state.assistants || []);
    }

    if (isPostgresConfigured()) {
      return await persistPostgresState(mergedState);
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(mergedState);
    }
    return false;
  } catch (err: any) {
    console.warn('[Cloud DB] Exception during state persistence:', err?.message || err);
    if (isPostgresConfigured()) {
      return await persistPostgresState(state);
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(state);
    }
    return false;
  }
}

export async function fetchCloudChunks(): Promise<any[] | null> {
  if (isPostgresConfigured()) {
    return fetchPostgresChunks();
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseChunks();
  }
  return null;
}

export async function persistCloudChunks(chunks: any[]): Promise<boolean> {
  if (isPostgresConfigured()) {
    return persistPostgresChunks(chunks);
  }
  if (isSupabaseConfigured()) {
    return persistSupabaseChunks(chunks);
  }
  return false;
}
