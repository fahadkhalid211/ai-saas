import {
  isSupabaseConfigured,
  fetchSupabaseState,
  persistSupabaseState,
  fetchSupabaseChunks,
  persistSupabaseChunks,
  fetchSupabaseStateUpdatedAt,
  getSupabaseClient,
} from './supabase';
import {
  isPostgresConfigured,
  fetchPostgresState,
  persistPostgresState,
  fetchPostgresChunks,
  persistPostgresChunks,
  fetchPostgresStateUpdatedAt,
  getPostgresPool,
  CloudStateResult,
} from './postgres';

export type { CloudStateResult };

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

/**
 * Pings cloud database with lightweight ~10 byte check without downloading
 * the multi-megabyte application state blob.
 */
export async function pingCloudDb(): Promise<{ reachable: boolean; error?: string }> {
  if (isPostgresConfigured()) {
    try {
      const updatedAt = await fetchPostgresStateUpdatedAt();
      if (updatedAt !== null) return { reachable: true };
      const pool = getPostgresPool();
      if (pool) {
        await pool.query('SELECT 1');
        return { reachable: true };
      }
    } catch (err: any) {
      return { reachable: false, error: err?.message || String(err) };
    }
  }
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
      if (!client) return { reachable: false, error: 'Supabase client not configured' };
      const { error } = await client.from('kortex_app_state').select('id').limit(1);
      if (error) return { reachable: false, error: error.message };
      return { reachable: true };
    } catch (err: any) {
      return { reachable: false, error: err?.message || String(err) };
    }
  }
  return { reachable: false, error: 'No cloud database configured' };
}

export async function fetchCloudState(): Promise<CloudStateResult> {
  if (isPostgresConfigured()) {
    const pg = await fetchPostgresState();
    if (pg.status === 'found') return pg;
    if (pg.status === 'error' && isSupabaseConfigured()) {
      console.warn('[Cloud DB] Postgres fetch failed, trying Supabase fallback:', pg.error);
    } else {
      return pg;
    }
  }
  if (isSupabaseConfigured()) {
    return fetchSupabaseState();
  }
  return { status: 'not_found' };
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
): Promise<{ ok: boolean; updatedAt?: string }> {
  if (!isCloudDbConfigured()) return { ok: false };

  try {
    if (isPostgresConfigured()) {
      const res = await persistPostgresState(state);
      if (res.ok) return res;
    }
    if (isSupabaseConfigured()) {
      return await persistSupabaseState(state);
    }
    return { ok: false };
  } catch (err: any) {
    console.warn('[Cloud DB] Exception during state persistence:', err?.message || err);
    return { ok: false };
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

