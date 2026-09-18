import {
  isSupabaseConfigured,
  fetchSupabaseState,
  persistSupabaseState,
  fetchSupabaseChunks,
  persistSupabaseChunks,
  fetchSupabaseStateUpdatedAt,
} from './supabase';
import {
  isPostgresConfigured,
  fetchPostgresState,
  persistPostgresState,
  fetchPostgresChunks,
  persistPostgresChunks,
  fetchPostgresStateUpdatedAt,
} from './postgres';

export function isCloudDbConfigured(): boolean {
  return isPostgresConfigured() || isSupabaseConfigured();
}

export function getCloudDbProvider(): 'postgres' | 'supabase' | 'ephemeral' {
  if (isPostgresConfigured()) return 'postgres';
  if (isSupabaseConfigured()) return 'supabase';
  return 'ephemeral';
}

export async function fetchCloudStateUpdatedAt(): Promise<string | null> {
  if (isPostgresConfigured()) {
    const pg = await fetchPostgresStateUpdatedAt();
    if (pg) return pg;
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseStateUpdatedAt();
  }
  return null;
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
  deletedLandingPageId?: string;
  deletedLandingPageSlug?: string;
}

export async function persistCloudState(
  state: any,
  _options?: PersistCloudStateOptions
): Promise<boolean> {
  if (!isCloudDbConfigured()) return false;

  try {
    if (isPostgresConfigured()) {
      const ok = await persistPostgresState(state);
      if (ok) return true;
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(state);
    }
    return false;
  } catch (err: any) {
    console.warn('[Cloud DB] Exception during state persistence:', err?.message || err);
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

export async function persistCloudChunks(chunks: any[], _overwrite: boolean = false): Promise<boolean> {
  if (isPostgresConfigured()) {
    const ok = await persistPostgresChunks(chunks);
    if (ok) return true;
  }
  if (isSupabaseConfigured()) {
    return persistSupabaseChunks(chunks);
  }
  return false;
}

