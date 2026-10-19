import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { generateChatCompletion } from '@/lib/ai/providers';
import { hasConnectedAiKey, withEnvProviderFallback } from '@/lib/ai/resolve-provider';
import { suggestForAssistant, type SuggestMethod } from '@/lib/knowledge/suggest-questions';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Questions for "Try it out" are kept for a while, so opening the tab again does not spend tokens on the same documents. */
const CACHE_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; questions: string[]; method: SuggestMethod }>();

/** What the documents look like right now: when they change, the questions are written again. */
function fingerprint(assistantId: string, chunks: { id: string }[], sources: { id: string; status?: string; updatedAt?: string }[]): string {
  const last = sources.reduce((m, s) => (s.updatedAt && s.updatedAt > m ? s.updatedAt : m), '');
  return `${assistantId}:${chunks.length}:${sources.length}:${last}`;
}

/** Starter questions written from this assistant's own knowledge base (see lib/knowledge/suggest-questions.ts). */
const POSTHandler = withAdminAuth(async (req: Request) => {
  const ctx = await getAuthContext(req);
  const body = await req.json().catch(() => null);
  const assistantId = typeof body?.assistantId === 'string' ? body.assistantId : '';
  if (!assistantId) return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });

  const assistant = await requireWorkspaceAssistant(ctx, assistantId);
  if (!assistant) return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });

  const limited = await enforceDistributedRateLimitByKey(`kb-suggest:${assistantId}`, { windowMs: 60 * 60 * 1000, max: 30 });
  if (limited) return limited;

  const [sources, chunks] = await Promise.all([Database.getKnowledgeSources(assistantId), Database.getChunksByAssistant(assistantId)]);
  const key = fingerprint(assistantId, chunks, sources);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return NextResponse.json({ questions: hit.questions, method: hit.method }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // The assistant's own engine writes them when it has one; with none connected they are built from the documents, at no cost.
  const engine = hasConnectedAiKey(assistant) ? withEnvProviderFallback(assistant) : null;
  const complete = engine
    ? (system: string, passages: string) =>
        Promise.race([
          generateChatCompletion(
            [
              { role: 'system', content: system },
              { role: 'user', content: passages },
            ],
            { provider: engine.provider, modelName: engine.modelName, apiKey: engine.apiKeyEncrypted, customBaseUrl: engine.customBaseUrl, temperature: 0.4, maxTokens: 260 }
          ),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error('suggestions timeout')), 12000)),
        ])
    : undefined;

  const result = await suggestForAssistant(
    sources.map((s) => ({ id: s.id, title: s.title, status: s.status })),
    chunks.map((c) => ({ knowledgeSourceId: c.knowledgeSourceId, content: c.content })),
    complete
  );
  if (cache.size > 200) cache.clear();
  cache.set(key, { at: Date.now(), ...result });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
});

export const POST = logged(POSTHandler, { route: '/api/knowledge/suggestions' });
