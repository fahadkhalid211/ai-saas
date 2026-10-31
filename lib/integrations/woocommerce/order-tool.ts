/**
 * WooCommerce Live Grounding Tool
 *
 * Interfaces with the Crescelo WordPress plugin REST API to provide
 * real-time deterministic stock verification, order dispatch tracking,
 * and customer order cancellations.
 */

export interface WooCommerceCredentials {
  siteUrl: string;
  siteSecret: string;
}

export interface OrderLookupParams extends WooCommerceCredentials {
  orderId: number;
  email: string;
}

export interface OrderCancelParams extends WooCommerceCredentials {
  orderId: number;
  email: string;
  reason?: string;
}

export interface StockCheckParams extends WooCommerceCredentials {
  productIds: number[];
}

export interface StockCheckItem {
  id: number;
  title: string;
  sku?: string;
  price?: number | null;
  stock_status: string;
  stock_quantity?: number | null;
  is_in_stock: boolean;
  url?: string;
}

export interface TrackingItem {
  provider: string;
  tracking_number: string;
  tracking_url?: string;
  date_shipped?: string;
}

export interface OrderItemSummary {
  name: string;
  quantity: number;
  total: string;
}

export interface OrderLookupResult {
  order_id: number;
  status: string;
  status_label: string;
  is_dispatched: boolean;
  total: string;
  currency: string;
  date_created: string;
  shipping_method: string;
  tracking: TrackingItem[];
  items: OrderItemSummary[];
  customer_name: string;
  cancelled_by_bot?: boolean;
}

export interface OrderCancelResult {
  success: boolean;
  order_id: number;
  status: string;
  message: string;
  was_paid?: boolean;
  timestamp?: string;
  already_cancelled?: boolean;
}

function cleanBaseUrl(url: string): string {
  let cleaned = url.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

/**
 * Fetch real-time order status and tracking from WooCommerce via REST API.
 */
export async function lookupWooCommerceOrder(
  params: OrderLookupParams
): Promise<{ ok: true; data: OrderLookupResult } | { ok: false; error: string; code?: string }> {
  try {
    const baseUrl = cleanBaseUrl(params.siteUrl);
    const endpoint = `${baseUrl}/wp-json/crescelo/v1/order-lookup?order_id=${params.orderId}&email=${encodeURIComponent(params.email)}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-crescelo-secret': params.siteSecret,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      const code = json?.code || `HTTP_${res.status}`;
      const message = json?.message || 'Unable to lookup order at this time.';
      return { ok: false, error: message, code };
    }

    return { ok: true, data: json as OrderLookupResult };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error communicating with store.' };
  }
}

/**
 * Cancel an unfulfilled WooCommerce order on customer request.
 */
export async function cancelWooCommerceOrder(
  params: OrderCancelParams
): Promise<{ ok: true; data: OrderCancelResult } | { ok: false; error: string; code?: string }> {
  try {
    const baseUrl = cleanBaseUrl(params.siteUrl);
    const endpoint = `${baseUrl}/wp-json/crescelo/v1/order-cancel`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crescelo-secret': params.siteSecret,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        order_id: params.orderId,
        email: params.email,
        reason: params.reason || 'Customer request in chat',
      }),
      signal: AbortSignal.timeout(8000),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      const code = json?.code || `HTTP_${res.status}`;
      const message = json?.message || 'Unable to cancel order at this time.';
      return { ok: false, error: message, code };
    }

    return { ok: true, data: json as OrderCancelResult };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error communicating with store.' };
  }
}

/**
 * Check live product inventory and pricing directly from WooCommerce.
 */
export async function checkLiveProductStock(
  params: StockCheckParams
): Promise<Record<number, StockCheckItem>> {
  if (!params.productIds || params.productIds.length === 0) {
    return {};
  }

  try {
    const baseUrl = cleanBaseUrl(params.siteUrl);
    const endpoint = `${baseUrl}/wp-json/crescelo/v1/stock-check?product_ids=${params.productIds.join(',')}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-crescelo-secret': params.siteSecret,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json || !Array.isArray(json.items)) {
      return {};
    }

    const map: Record<number, StockCheckItem> = {};
    for (const item of json.items) {
      if (item && item.id) {
        map[item.id] = item;
      }
    }
    return map;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Context Formatters for LLM Prompt Injection
// ---------------------------------------------------------------------------

/**
 * Format order lookup results into unambiguous, structured context for the assistant.
 */
export function formatOrderContext(order: OrderLookupResult): string {
  const lines: string[] = [];
  lines.push(`[REAL-TIME WOOCOMMERCE ORDER STATUS — VERIFIED]:`);
  lines.push(`- Order Number: #${order.order_id}`);
  lines.push(`- Customer: ${order.customer_name || 'Customer'}`);
  lines.push(`- Status: ${order.status_label || order.status} (${order.status})`);
  lines.push(`- Placed On: ${order.date_created}`);
  lines.push(`- Total Amount: ${order.total}`);
  lines.push(`- Shipping Method: ${order.shipping_method}`);
  lines.push(`- Dispatched / Shipped: ${order.is_dispatched ? 'YES' : 'NO'}`);

  if (order.tracking && order.tracking.length > 0) {
    lines.push(`- Shipment Tracking:`);
    for (const t of order.tracking) {
      const urlPart = t.tracking_url ? ` (Tracking Link: ${t.tracking_url})` : '';
      const datePart = t.date_shipped ? ` on ${t.date_shipped}` : '';
      lines.push(`  * Carrier: ${t.provider || 'Carrier'}, Number: ${t.tracking_number}${urlPart}${datePart}`);
    }
  } else if (order.is_dispatched) {
    lines.push(`- Tracking Note: Order marked as dispatched/completed. Carrier tracking update in progress.`);
  } else {
    lines.push(`- Tracking Note: Order has not been dispatched yet. It is currently being processed by the store team.`);
  }

  if (order.items && order.items.length > 0) {
    const itemStrings = order.items.map((i) => `${i.quantity}x ${i.name} (${i.total})`);
    lines.push(`- Ordered Items: ${itemStrings.join(', ')}`);
  }

  if (order.cancelled_by_bot) {
    lines.push(`- Audit Notice: This order was previously cancelled by the AI Assistant on customer request.`);
  }

  return lines.join('\n');
}

/**
 * Format cancellation execution result for LLM prompt.
 */
export function formatCancellationContext(
  success: boolean,
  orderId: number,
  message: string,
  wasPaid?: boolean,
  alreadyCancelled = false
): string {
  if (success) {
    const refundNote = wasPaid
      ? `- Payment & Refund: Payment was previously captured for this order. The store team has been notified to process the gateway refund to the original payment method (typically 3–5 business days depending on their bank).`
      : `- Payment & Refund: Order was unpaid or not captured, so no card refund is required.`;

    return [
      `[REAL-TIME ORDER CANCELLATION RESULT — ACTION COMPLETED]:`,
      `- Action: Successfully cancelled Order #${orderId} in WooCommerce.`,
      `- Store Notice: Status updated to 'Cancelled'. Store administrator order list tagged with '🤖 Bot Cancelled'.`,
      `- Audit: Added official order note recording customer cancellation via chat.`,
      refundNote,
      `- User Instruction: Reassure the customer that Order #${orderId} has been successfully cancelled. Clearly explain the refund timing (${wasPaid ? 'their refund will be processed back to their original payment method within standard banking processing times' : 'no charge was made'}).`,
    ].join('\n');
  }

  return [
    `[REAL-TIME ORDER CANCELLATION RESULT — ACTION FAILED]:`,
    `- Order #${orderId} could not be cancelled automatically.`,
    `- Reason: ${message}`,
    `- User Instruction: Explain courteously why the order cannot be cancelled (e.g. it has already entered dispatch/shipping, or email mismatch). Direct them to customer support if they need further assistance.`,
  ].join('\n');
}

/**
 * Format live inventory status check results into instructions.
 */
export function formatStockVerificationContext(
  stockMap: Record<number, StockCheckItem>
): string {
  const entries = Object.values(stockMap);
  if (entries.length === 0) return '';

  const lines: string[] = ['[REAL-TIME WOOCOMMERCE INVENTORY STATUS — LIVE GROUNDING]:'];
  for (const item of entries) {
    if (item.is_in_stock) {
      const qtyText = item.stock_quantity !== null && item.stock_quantity !== undefined ? ` (${item.stock_quantity} left)` : '';
      lines.push(`- Product ID ${item.id} ("${item.title}"): IN STOCK${qtyText}. Safe to recommend and link.`);
    } else {
      lines.push(`- Product ID ${item.id} ("${item.title}"): CURRENTLY OUT OF STOCK. Label explicitly as [Out of Stock]. Do NOT present Add to Cart for this item; suggest in-stock alternatives.`);
    }
  }

  return lines.join('\n');
}
