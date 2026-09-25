import { NextResponse } from 'next/server';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { parseSessionKey } from '@/lib/playground/store';
import { PlaygroundError, addFile, addText, addUrl, removeSource } from '@/lib/playground/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const idFrom = (req: Request) => parseSessionKey(req.headers.get('x-playground-key'));
const fail = (err: unknown) => {
  if (err instanceof PlaygroundError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error('[Playground] sources failed:', (err as Error)?.message);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
};

/** Adds a document to the visitor's playground: a file upload, pasted text or a web page. */
async function POSTHandler(req: Request) {
  const id = idFrom(req);
  if (!id) return NextResponse.json({ error: 'Open your playground first.' }, { status: 401 });
  const limited = await enforceDistributedRateLimitByKey(`playground-add:${id}`, { windowMs: 60 * 60 * 1000, max: 20 });
  if (limited) return limited;
  try {
    const type = req.headers.get('content-type') || '';
    if (type.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
      const sources = await addFile(id, file.name, Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ sources });
    }
    const body = await req.json().catch(() => null);
    if (body?.kind === 'text') return NextResponse.json({ sources: await addText(id, body.title, body.text) });
    if (body?.kind === 'url') return NextResponse.json({ sources: await addUrl(id, body.url) });
    return NextResponse.json({ error: 'Choose a file, paste text or add a web address.' }, { status: 400 });
  } catch (err) {
    return fail(err);
  }
}

async function DELETEHandler(req: Request) {
  const id = idFrom(req);
  if (!id) return NextResponse.json({ error: 'Open your playground first.' }, { status: 401 });
  try {
    const sourceId = new URL(req.url).searchParams.get('id') || '';
    return NextResponse.json({ sources: await removeSource(id, sourceId) });
  } catch (err) {
    return fail(err);
  }
}

export const POST = logged(POSTHandler, { route: '/api/playground/sources' });
export const DELETE = logged(DELETEHandler, { route: '/api/playground/sources' });
