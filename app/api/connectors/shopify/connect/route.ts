import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { authorizeConnectorCall, presentedConnectorKey } from '@/lib/connectors/wordpress-auth';
import { normalizeShopDomain } from '@/lib/connectors/shopify';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key, X-Crescelo-Secret',
};

const SHOPIFY_RULES_MARKER = '[Shopify store rules]';
const SHOPIFY_RULES = `${SHOPIFY_RULES_MARKER}
This assistant lives on a Shopify store. When you recommend a product, show it as a card on its own line:
[PRODUCT_CARD:{"id":VARIANT_ID,"title":"PRODUCT_TITLE","price":"PRICE","url":"PRODUCT_URL","image":"IMAGE_URL","stock":"In Stock"}]
When the shopper wants to buy, offer the cart button on its own line:
[ADD_TO_CART:{"id":VARIANT_ID,"title":"PRODUCT_TITLE","price":"PRICE"}]
Use the "Add-to-cart variant ID" from the product's knowledge entry as the id (never the Product ID, which cannot be added to a cart). If the shopper needs a specific size or colour, use that variant's own ID. Only quote prices and availability that appear in your knowledge. If a product is sold out, say so and suggest an alternative.`;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: CORS });
}

/**
 * Called by the merchant's Crescelo dashboard (or the theme embed's setup link) once per store: allows the store's
 * domains to load the widget and gives the assistant its Shopify shopping rules. Idempotent, and it never overwrites a
 * prompt the customer has written: the rules are appended once.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'shopify-connect', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const assistantId = typeof body.assistantId === 'string' ? body.assistantId : '';
    const domain = normalizeShopDomain(body.shopDomain);
    const permanent = body.permanentDomain ? normalizeShopDomain(body.permanentDomain) : null;
    if (!assistantId) return fail(400, 'assistantId is required');
    if (!domain) return fail(400, 'shopDomain must be your store address, for example my-store.myshopify.com.');

    const assistant = await Database.getAssistantById(assistantId);
    const auth = assistant ? authorizeConnectorCall(assistant, presentedConnectorKey(req)) : null;
    if (!assistant || !auth || !auth.ok) {
      // One answer for "no such assistant" and "wrong key" so ids cannot be probed.
      const denied = auth && !auth.ok && auth.status === 403 ? auth : null;
      return fail(denied ? 403 : 401, denied ? denied.error : 'Unauthorized: invalid assistant or key.');
    }

    const domains = new Set([...(assistant.allowedDomains || []), domain]);
    if (permanent) domains.add(permanent);

    const prompt = assistant.systemPrompt || '';
    const updated = await Database.updateAssistant(assistant.id, {
      allowedDomains: Array.from(domains),
      systemPrompt: prompt.includes(SHOPIFY_RULES_MARKER) ? prompt : `${prompt}${prompt ? '\n\n' : ''}${SHOPIFY_RULES}`,
    });

    return NextResponse.json(
      {
        success: true,
        assistantId: assistant.id,
        assistantName: (updated || assistant).name,
        allowedDomains: Array.from(domains),
        hostUrl: req.nextUrl.origin,
      },
      { status: 200, headers: CORS },
    );
  } catch (error: any) {
    console.error('[ShopifyConnector] Connect failed:', error);
    return fail(500, error?.message || 'Failed to connect the Shopify store');
  }
}
