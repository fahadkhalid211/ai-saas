import { validateSafeExternalUrl } from '@/lib/security/ssrf';

/**
 * Shopify connector: reads a store's public catalog (`/products.json`, `/collections.json`) and turns it into the
 * knowledge-base documents the assistant answers from.
 *
 * Why the public storefront and not the Admin API: it needs no Shopify app credentials, token storage or OAuth, so a
 * merchant connects with the same assistant key the WordPress plugin uses. The cost is that quantities are not exposed
 * (only whether each variant is available), which is what a shopper-facing assistant should say anyway.
 */

export const SHOPIFY_ID_PREFIX = 'SHOPIFY';
export const MAX_CATALOG_PAGES = 20; // 20 x 250 = 5,000 products
const PAGE_SIZE = 250;
const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  available: boolean;
  options: string[];
}

export interface ShopifyProductItem {
  id: number;
  title: string;
  handle: string;
  url: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  imageUrl: string;
  options: Array<{ name: string; values: string[] }>;
  variants: ShopifyVariant[];
  updatedAt: string;
}

export interface ShopifyCollectionItem {
  title: string;
  handle: string;
  url: string;
  description: string;
}

export class ShopifyConnectorError extends Error {
  constructor(message: string, readonly status: number = 422) {
    super(message);
  }
}

/** The identifier that ties a knowledge source back to its Shopify product, used to replace or remove it later. */
export function shopifySourceKey(kind: 'product' | 'collections', id: string | number): string {
  return `[${SHOPIFY_ID_PREFIX}:${kind}:${id}]`;
}

/**
 * Reduce whatever the merchant typed (a pasted URL, a trailing slash, a path) to a bare hostname, or null when it
 * cannot be a public store address. Custom domains are accepted: a store's products.json is served on both.
 */
export function normalizeShopDomain(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const host = raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
  if (!host || host.length > 253) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) return null;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return null;
  return host;
}

/** Product and collection descriptions arrive as HTML. */
export function htmlToText(html: unknown): string {
  if (typeof html !== 'string' || !html) return '';
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

export function normalizeShopifyProduct(raw: any, domain: string): ShopifyProductItem | null {
  if (!raw || raw.id == null || !raw.title) return null;
  const handle = str(raw.handle);
  const variants: ShopifyVariant[] = (Array.isArray(raw.variants) ? raw.variants : []).map((v: any) => ({
    id: Number(v.id),
    title: str(v.title),
    price: str(v.price),
    compareAtPrice: str(v.compare_at_price),
    sku: str(v.sku),
    available: v.available !== false,
    options: [v.option1, v.option2, v.option3].filter((o) => o != null && o !== '').map(str),
  }));
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map(str)
    : str(raw.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
  return {
    id: Number(raw.id),
    title: str(raw.title),
    handle,
    url: handle ? `https://${domain}/products/${handle}` : `https://${domain}`,
    vendor: str(raw.vendor),
    productType: str(raw.product_type),
    tags,
    description: htmlToText(raw.body_html),
    imageUrl: str(raw.images?.[0]?.src || raw.image?.src),
    options: (Array.isArray(raw.options) ? raw.options : [])
      .filter((o: any) => o && o.name && o.name !== 'Title')
      .map((o: any) => ({ name: str(o.name), values: (Array.isArray(o.values) ? o.values : []).map(str) })),
    variants,
    updatedAt: str(raw.updated_at),
  };
}

function priceRange(variants: ShopifyVariant[]): { min: number; max: number } | null {
  const prices = variants.map((v) => parseFloat(v.price)).filter((n) => Number.isFinite(n));
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function money(n: number, currency: string): string {
  const amount = n.toFixed(2);
  return currency ? `${amount} ${currency}` : amount;
}

/**
 * One knowledge document per product. The first available variant's id is written out because the widget's
 * add-to-cart button needs a Shopify *variant* id (the product id cannot be added to a cart).
 */
export function shopifyProductToMarkdown(item: ShopifyProductItem, currency = ''): string {
  const parts: string[] = [`# Product: ${item.title}`];
  parts.push(`- **Product ID**: ${item.id}`);
  const range = priceRange(item.variants);
  if (range) {
    parts.push(
      `- **Price**: ${range.min === range.max ? money(range.min, currency) : `${money(range.min, currency)} - ${money(range.max, currency)}`}`,
    );
  }
  const onSale = item.variants.find((v) => parseFloat(v.compareAtPrice) > parseFloat(v.price));
  if (onSale) parts.push(`- **Regular Price**: ${money(parseFloat(onSale.compareAtPrice), currency)} (currently on sale)`);
  const anyAvailable = item.variants.some((v) => v.available);
  parts.push(`- **Stock Status**: ${anyAvailable ? 'In stock' : 'Sold out'}`);
  if (item.vendor) parts.push(`- **Brand**: ${item.vendor}`);
  if (item.productType) parts.push(`- **Categories**: ${item.productType}`);
  if (item.tags.length) parts.push(`- **Tags**: ${item.tags.join(', ')}`);
  for (const o of item.options) {
    if (o.values.length) parts.push(`- **${o.name}**: ${o.values.join(', ')}`);
  }
  parts.push(`- **Product URL**: ${item.url}`);
  if (item.imageUrl) parts.push(`- **Image URL**: ${item.imageUrl}`);

  const addable = item.variants.find((v) => v.available) || item.variants[0];
  if (addable) parts.push(`- **Add-to-cart variant ID**: ${addable.id}`);

  if (item.variants.length > 1) {
    const lines = item.variants.map((v) => {
      const label = v.options.join(' / ') || v.title;
      const sku = v.sku ? `, SKU ${v.sku}` : '';
      return `  - ${label}: ${money(parseFloat(v.price) || 0, currency)}${sku}, ${v.available ? 'in stock' : 'sold out'} (variant ID ${v.id})`;
    });
    parts.push(`- **Variants**:\n${lines.join('\n')}`);
  } else if (item.variants[0]?.sku) {
    parts.push(`- **SKU**: ${item.variants[0].sku}`);
  }

  if (item.description) parts.push(`\n### Product Details & Specifications\n${item.description}`);
  return parts.join('\n');
}

export function shopifyCollectionsToMarkdown(collections: ShopifyCollectionItem[]): string {
  if (collections.length === 0) return '';
  const lines = collections.map((c) => {
    const desc = c.description ? `: ${c.description.replace(/\s+/g, ' ').slice(0, 300)}` : '';
    return `- [${c.title}](${c.url})${desc}`;
  });
  return `# Store collections\nThe store organises its products into these collections:\n${lines.join('\n')}`;
}

/** GET a JSON document from a store, following at most a few redirects and re-checking every hop against the SSRF guard. */
async function fetchJson(url: string, fetchImpl: typeof fetch): Promise<any> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const safe = await validateSafeExternalUrl(current);
    if (!safe.safe) throw new ShopifyConnectorError(safe.error || 'That store address is blocked by the security policy.', 400);

    const res = await fetchImpl(current, {
      redirect: 'manual',
      headers: { Accept: 'application/json', 'User-Agent': 'CresceloShopifyConnector/1.0' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) throw new ShopifyConnectorError('The store redirected without a destination.');
      current = new URL(location, current).toString();
      continue;
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      throw new ShopifyConnectorError(
        'The store did not share its catalog. If it is password protected, remove the storefront password while you sync, and check the address is the store domain.',
        422,
      );
    }
    if (!res.ok) throw new ShopifyConnectorError(`The store answered with HTTP ${res.status}.`, 502);

    const text = await res.text();
    if (Buffer.byteLength(text, 'utf-8') > MAX_BODY_BYTES) throw new ShopifyConnectorError('The store catalog page was too large to read.', 413);
    try {
      return JSON.parse(text);
    } catch {
      throw new ShopifyConnectorError('That address did not return Shopify catalog data. Check the store domain.');
    }
  }
  throw new ShopifyConnectorError('The store redirected too many times.');
}

export async function fetchShopifyCatalog(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ products: ShopifyProductItem[]; collections: ShopifyCollectionItem[]; domain: string }> {
  const products: ShopifyProductItem[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= MAX_CATALOG_PAGES; page++) {
    const json = await fetchJson(`https://${domain}/products.json?limit=${PAGE_SIZE}&page=${page}`, fetchImpl);
    const batch = Array.isArray(json?.products) ? json.products : null;
    if (!batch) throw new ShopifyConnectorError('That address did not return Shopify catalog data. Check the store domain.');
    for (const raw of batch) {
      const item = normalizeShopifyProduct(raw, domain);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        products.push(item);
      }
    }
    if (batch.length < PAGE_SIZE) break;
  }

  // Collections are a nice-to-have: a store that hides them still syncs its products.
  const collections: ShopifyCollectionItem[] = [];
  try {
    const json = await fetchJson(`https://${domain}/collections.json?limit=${PAGE_SIZE}`, fetchImpl);
    for (const c of Array.isArray(json?.collections) ? json.collections : []) {
      if (!c?.title || !c?.handle) continue;
      collections.push({
        title: str(c.title),
        handle: str(c.handle),
        url: `https://${domain}/collections/${c.handle}`,
        description: htmlToText(c.body_html),
      });
    }
  } catch {
    // ignore
  }

  return { products, collections, domain };
}
