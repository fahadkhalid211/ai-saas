import { Database } from '@/lib/db';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const searchProductsMetadata = {
  name: 'search_products',
  description:
    'Search the store catalog or WooCommerce products in the authenticated workspace. Use when shoppers ask for specific items, categories, or products within a budget.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'products:read' as const,
};

export const getProductMetadata = {
  name: 'get_product',
  description:
    'Retrieve full product specifications, SKU, live stock status, variations, and pricing for a single product by product ID or SKU in the authenticated workspace.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'products:read' as const,
};

export async function handleSearchProducts(
  args: {
    query: string;
    category?: string;
    maxPrice?: number;
    limit?: number;
  },
  auth: McpAuthContext
) {
  assertScope(auth, 'products:read');

  const query = args?.query?.trim().toLowerCase() || '';
  const limit = Math.max(1, Math.min(20, Number(args.limit) || 8));

  const assistants = await Database.getAssistants(auth.workspaceId);
  const matchedProducts: Array<{
    id: string | number;
    title: string;
    price: string;
    sku?: string;
    stockStatus?: string;
    url?: string;
    imageUrl?: string;
    categories?: string[];
    snippet?: string;
  }> = [];

  const seenIds = new Set<string>();

  for (const ast of assistants) {
    const chunks = await Database.getChunksByAssistant(ast.id);
    for (const chunk of chunks) {
      const meta = chunk.metadata || {};
      const isProduct =
        meta.batchType === 'products' ||
        meta.sourceType === 'products' ||
        chunk.content.includes('# Product:');

      if (!isProduct) continue;

      const pId = String(meta.wpId || meta.id || chunk.id);
      if (seenIds.has(pId)) continue;

      const title = (meta.title || meta.sourceTitle || '').toLowerCase();
      const content = chunk.content.toLowerCase();

      // Check query match
      if (query && !title.includes(query) && !content.includes(query)) {
        continue;
      }

      // Check category filter
      if (args.category) {
        const catStr = Array.isArray(meta.categories)
          ? meta.categories.join(' ').toLowerCase()
          : String(meta.categories || '').toLowerCase();
        if (!catStr.includes(args.category.toLowerCase())) continue;
      }

      // Check max price filter if specified
      if (args.maxPrice !== undefined && args.maxPrice > 0) {
        const priceNum = parseFloat(String(meta.price || '').replace(/[^0-9.]/g, ''));
        if (!isNaN(priceNum) && priceNum > args.maxPrice) continue;
      }

      seenIds.add(pId);
      matchedProducts.push({
        id: meta.wpId || meta.id || pId,
        title: meta.title || meta.sourceTitle || 'Store Product',
        price: meta.price || 'Contact for price',
        sku: meta.sku || '',
        stockStatus: meta.stockStatus || 'In Stock',
        url: meta.url || '',
        imageUrl: meta.imageUrl || '',
        categories: Array.isArray(meta.categories) ? meta.categories : undefined,
        snippet: chunk.content.slice(0, 300).trim(),
      });

      if (matchedProducts.length >= limit) break;
    }

    if (matchedProducts.length >= limit) break;
  }

  return {
    query,
    totalFound: matchedProducts.length,
    products: matchedProducts,
  };
}

export async function handleGetProduct(
  args: { productId?: string | number; sku?: string },
  auth: McpAuthContext
) {
  assertScope(auth, 'products:read');

  if (!args.productId && !args.sku) {
    const error: any = new Error('Either productId or sku must be provided');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const assistants = await Database.getAssistants(auth.workspaceId);
  const targetId = args.productId !== undefined ? String(args.productId).trim() : '';
  const targetSku = args.sku ? String(args.sku).trim().toLowerCase() : '';

  for (const ast of assistants) {
    const chunks = await Database.getChunksByAssistant(ast.id);
    for (const chunk of chunks) {
      const meta = chunk.metadata || {};
      const chunkId = String(meta.wpId || meta.id || '');
      const chunkSku = String(meta.sku || '').toLowerCase();

      const matchId = targetId && (chunkId === targetId || chunk.content.includes(`Product ID**: ${targetId}`));
      const matchSku = targetSku && (chunkSku === targetSku || chunk.content.toLowerCase().includes(`sku**: ${targetSku}`));

      if (matchId || matchSku) {
        return {
          id: meta.wpId || meta.id || targetId,
          title: meta.title || meta.sourceTitle || 'Store Product',
          sku: meta.sku || args.sku || '',
          price: meta.price || '',
          stockStatus: meta.stockStatus || 'In Stock',
          url: meta.url || '',
          imageUrl: meta.imageUrl || '',
          categories: meta.categories || [],
          fullDescription: chunk.content,
        };
      }
    }
  }

  const error: any = new Error(`Product not found for ${targetId ? `ID '${targetId}'` : `SKU '${targetSku}'`}`);
  error.code = 'NOT_FOUND';
  throw error;
}
