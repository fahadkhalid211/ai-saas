import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.trim();
}

export function getSupabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (supabaseClientInstance) return supabaseClientInstance;

  const url = getSupabaseUrl()!;
  const key = getSupabaseKey()!;

  supabaseClientInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    },
  });

  return supabaseClientInstance;
}

export interface SupabaseAppStateRow {
  id: string;
  data: any;
  chunks?: any;
  updated_at: string;
}

/**
 * Fetches the lightweight updated_at timestamp from kortex_app_state.
 * Transfers only ~30 bytes of egress instead of downloading the multi-megabyte data column.
 */
export async function fetchSupabaseStateUpdatedAt(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('kortex_app_state')
      .select('updated_at')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) return null;
    return data.updated_at || null;
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching state updated_at:', err?.message);
    return null;
  }
}

/**
 * Loads persisted app state from the Supabase `kortex_app_state` table.
 * Returns null if Supabase is not configured or if table/row does not exist yet.
 */
export async function fetchSupabaseState(): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('kortex_app_state')
      .select('data')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Could not fetch kortex_app_state:', error.message);
      return null;
    }

    return data?.data || null;
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching state:', err?.message);
    return null;
  }
}

/**
 * Persists app state to the Supabase `kortex_app_state` table.
 */
export async function persistSupabaseState(state: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { chunks: _chunks, pageViews: rawPageViews, ...transactional } = state;
    // Cap pageViews in cloud payload to at most 50 recent items so the blob never bloats to megabytes
    const cloudPageViews = Array.isArray(rawPageViews) ? rawPageViews.slice(0, 50) : [];
    const payload = {
      id: 'default',
      data: {
        ...transactional,
        pageViews: cloudPageViews,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('kortex_app_state')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not persist state:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[Supabase] Exception persisting state:', err?.message);
    return false;
  }
}

/**
 * Loads vector chunks from the Supabase `kortex_chunks` table or state row.
 */
export async function fetchSupabaseChunks(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('kortex_app_state')
      .select('chunks')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data || !Array.isArray(data.chunks)) {
      return null;
    }

    return data.chunks;
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching chunks:', err?.message);
    return null;
  }
}

/**
 * Persists vector chunks to the Supabase `kortex_app_state` table.
 */
export async function persistSupabaseChunks(chunks: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('kortex_app_state')
      .update({
        chunks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'default');

    if (error) {
      console.warn('[Supabase] Could not persist chunks:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[Supabase] Exception persisting chunks:', err?.message);
    return false;
  }
}
