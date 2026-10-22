import { describe, it, expect } from 'vitest';
import {
  fetchShopifyCatalog,
  htmlToText,
  normalizeShopDomain,
  normalizeShopifyProduct,
  shopifyCollectionsToMarkdown,
  shopifyProductToMarkdown,
  shopifySourceKey,
} from './shopify';

const rawProduct = {
  id: 7001,
  title: 'Trail Jacket',
  handle: 'trail-jacket',
  vendor: 'Northwind',
  product_type: 'Outerwear',
  tags: ['waterproof', 'men'],
  body_html: '<p>Light &amp; warm.</p><ul><li>Taped seams</li><li>Packable</li></ul><script>alert(1)</script>',
  images: [{ src: 'https://cdn.example/jacket.jpg' }],
  options: [{ name: 'Size', values: ['S', 'M'] }],
  variants: [
    { id: 11, title: 'S', price: '120.00', compare_at_price: '150.00', sku: 'TJ-S', available: false, option1: 'S' },
    { id: 12, title: 'M', price: '120.00', compare_at_price: null, sku: 'TJ-M', available: true, option1: 'M' },
  ],
  updated_at: '2026-01-01T00:00:00Z',
};

describe('normalizeShopDomain', () => {
  it('reduces pasted URLs to a hostname', () => {
    expect(normalizeShopDomain('https://My-Store.myshopify.com/admin?x=1')).toBe('my-store.myshopify.com');
    expect(normalizeShopDomain('shop.example.com:443/')).toBe('shop.example.com');
  });
  it('rejects anything that is not a public hostname', () => {
    for (const bad of ['', 'localhost', '127.0.0.1', '10.0.0.5', 'a b.com', 'x'.repeat(300) + '.com', null, 42]) {
      expect(normalizeShopDomain(bad as any)).toBeNull();
    }
  });
});

describe('htmlToText', () => {
  it('strips scripts and tags and keeps list structure', () => {
    const text = htmlToText(rawProduct.body_html);
    expect(text).toContain('Light & warm.');
    expect(text).toContain('- Taped seams');
    expect(text).not.toContain('alert');
    expect(text).not.toContain('<');
  });
});

describe('product markdown', () => {
  const item = normalizeShopifyProduct(rawProduct, 'shop.example.com')!;

  it('builds the store URL and variant list', () => {
    expect(item.url).toBe('https://shop.example.com/products/trail-jacket');
    expect(item.variants).toHaveLength(2);
    expect(item.tags).toEqual(['waterproof', 'men']);
  });

  it('writes the add-to-cart variant id of the first AVAILABLE variant', () => {
    const md = shopifyProductToMarkdown(item, 'USD');
    expect(md).toContain('**Add-to-cart variant ID**: 12');
    expect(md).toContain('120.00 USD');
    expect(md).toContain('Regular Price');
    expect(md).toContain('S: 120.00 USD, SKU TJ-S, sold out (variant ID 11)');
    expect(md).toContain('In stock');
  });

  it('reports a product as sold out when no variant is available', () => {
    const soldOut = normalizeShopifyProduct({ ...rawProduct, variants: [{ ...rawProduct.variants[0] }] }, 'shop.example.com')!;
    expect(shopifyProductToMarkdown(soldOut)).toContain('Sold out');
  });

  it('skips malformed products', () => {
    expect(normalizeShopifyProduct({ id: 1 }, 'x.com')).toBeNull();
    expect(normalizeShopifyProduct(null, 'x.com')).toBeNull();
  });
});

describe('collections and keys', () => {
  it('lists collections and returns nothing for an empty store', () => {
    expect(shopifyCollectionsToMarkdown([])).toBe('');
    expect(shopifyCollectionsToMarkdown([{ title: 'Sale', handle: 'sale', url: 'https://s.com/collections/sale', description: 'Deals' }])).toContain('[Sale](https://s.com/collections/sale): Deals');
  });
  it('builds the identifier used to replace a product later', () => {
    expect(shopifySourceKey('product', 7001)).toBe('[SHOPIFY:product:7001]');
  });
});

describe('fetchShopifyCatalog', () => {
  it('refuses a store address that resolves to an internal host', async () => {
    const never = (async () => {
      throw new Error('must not be fetched');
    }) as unknown as typeof fetch;
    await expect(fetchShopifyCatalog('metadata.internal', never)).rejects.toThrow(/forbidden|blocked/i);
  });
});
