import { CATALOGS, catalogVersion } from '@/lib/i18n/server';
import { isLocaleCode, PREFIXED_LOCALES } from '@/lib/i18n/paths';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((l) => ({ file: `${l}.js` }));
}

/** /i18n/sv.js: the Swedish catalog as a script that sets globalThis.__I18N, cached for a year (the ?v= changes when it does). */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const code = file.replace(/\.js$/, '');
  if (!isLocaleCode(code) || code === 'en') return new Response('Not found', { status: 404 });
  const body = `globalThis.__I18N=Object.assign(globalThis.__I18N||{},{${JSON.stringify(code)}:${JSON.stringify(CATALOGS[code])}});`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Catalog-Version': catalogVersion(code),
    },
  });
}
