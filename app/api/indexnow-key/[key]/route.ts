import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** IndexNow proves site ownership by serving the key at /<key>.txt (rewritten here from next.config.ts). Only the configured key answers. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const configured = process.env.INDEXNOW_KEY?.trim();
  if (!configured || key !== configured) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(configured, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
}
