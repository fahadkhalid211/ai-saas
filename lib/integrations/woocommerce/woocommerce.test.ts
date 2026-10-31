import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectOrderStatusIntent,
  detectOrderCancelIntent,
  detectProductRecommendationIntent,
  extractOrderId,
  extractEmail,
  extractProductIdsFromContext,
} from './intent-parser';
import {
  lookupWooCommerceOrder,
  cancelWooCommerceOrder,
  checkLiveProductStock,
  formatOrderContext,
  formatCancellationContext,
  formatStockVerificationContext,
} from './order-tool';

describe('WooCommerce Intent Parser', () => {
  it('detects order status inquiries correctly', () => {
    expect(detectOrderStatusIntent('my order #234 is not received yet')).toBe(true);
    expect(detectOrderStatusIntent('where is my order 5678?')).toBe(true);
    expect(detectOrderStatusIntent('can you track my order?')).toBe(true);
    expect(detectOrderStatusIntent('has my package shipped yet')).toBe(true);
    expect(detectOrderStatusIntent('what is the status of order 9999')).toBe(true);
    expect(detectOrderStatusIntent('hello there, how are you?')).toBe(false);
  });

  it('detects order cancellation requests and takes precedence over status', () => {
    expect(detectOrderCancelIntent('cancel my order #234 from email i@gmail.com')).toBe(true);
    expect(detectOrderCancelIntent('please cancel order 1234')).toBe(true);
    expect(detectOrderCancelIntent('i want to abort order #456')).toBe(true);
    // Negation guard: "don't cancel my order" should be false
    expect(detectOrderCancelIntent("please do not cancel order #234")).toBe(false);
    expect(detectOrderCancelIntent("don't cancel my order #234")).toBe(false);
    // detectOrderStatusIntent should return false when cancel intent is present
    expect(detectOrderStatusIntent('cancel my order #234')).toBe(false);
  });

  it('detects product recommendation queries', () => {
    expect(detectProductRecommendationIntent('i have acne on my skin , what should i use?')).toBe(true);
    expect(detectProductRecommendationIntent('what do you recommend for dry skin?')).toBe(true);
    expect(detectProductRecommendationIntent('looking for something for wrinkles')).toBe(true);
    expect(detectProductRecommendationIntent('where is my package')).toBe(false);
  });

  it('extracts Order ID accurately from varied formats', () => {
    expect(extractOrderId('my order #234 is not received yet')).toBe(234);
    expect(extractOrderId('cancel my order 5678 from email test@example.com')).toBe(5678);
    expect(extractOrderId('Order Number: 9876')).toBe(9876);
    expect(extractOrderId('status for #12345 please')).toBe(12345);
    expect(extractOrderId('hello there')).toBeNull();
  });

  it('extracts customer billing email', () => {
    expect(extractEmail('cancel my order from email i@gmail.com etc')).toBe('i@gmail.com');
    expect(extractEmail('My email is customer.care@store.co.uk thanks')).toBe('customer.care@store.co.uk');
    expect(extractEmail('no email here')).toBeNull();
  });

  it('extracts product IDs from markdown RAG chunks', () => {
    const context = `
      # Product: Salicylic Acid Acne Cleanser
      - **Product ID**: 101
      - Price: $19.99

      # Product: Niacinamide Blemish Treatment
      - **Product ID**: 102
      - Price: $24.99
    `;
    const ids = extractProductIdsFromContext(context);
    expect(ids).toEqual([101, 102]);
  });
});

describe('WooCommerce Order Tool', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('lookups order successfully via WordPress REST API', async () => {
    const mockOrder = {
      order_id: 234,
      status: 'completed',
      status_label: 'Completed',
      is_dispatched: true,
      total: '$45.00',
      currency: '$',
      date_created: '2026-10-25 12:00:00',
      shipping_method: 'Express Shipping',
      tracking: [
        {
          provider: 'FedEx',
          tracking_number: '1234567890',
          tracking_url: 'https://fedex.com/track/1234567890',
        },
      ],
      items: [{ name: 'Acne Cleanser', quantity: 1, total: '$45.00' }],
      customer_name: 'John Doe',
      cancelled_by_bot: false,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOrder,
    } as any);

    const result = await lookupWooCommerceOrder({
      siteUrl: 'https://example-shop.com',
      siteSecret: 'secret_1234567890123456',
      orderId: 234,
      email: 'john@example.com',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.order_id).toBe(234);
      expect(result.data.is_dispatched).toBe(true);
      expect(result.data.tracking[0].provider).toBe('FedEx');
    }
  });

  it('cancels order successfully via WordPress REST API', async () => {
    const mockCancelResponse = {
      success: true,
      order_id: 234,
      status: 'cancelled',
      message: 'Order #234 has been successfully cancelled.',
      timestamp: '2026-10-29 14:00:00',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCancelResponse,
    } as any);

    const result = await cancelWooCommerceOrder({
      siteUrl: 'https://example-shop.com',
      siteSecret: 'secret_1234567890123456',
      orderId: 234,
      email: 'i@gmail.com',
      reason: 'Customer chat request',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('cancelled');
      expect(result.data.order_id).toBe(234);
    }
  });

  it('checks live stock and returns stock map', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          { id: 101, title: 'Acne Wash', is_in_stock: false, stock_status: 'outofstock', stock_quantity: 0 },
          { id: 102, title: 'Blemish Serum', is_in_stock: true, stock_status: 'instock', stock_quantity: 5 },
        ],
        count: 2,
      }),
    } as any);

    const stockMap = await checkLiveProductStock({
      siteUrl: 'https://example-shop.com',
      siteSecret: 'secret_1234567890123456',
      productIds: [101, 102],
    });

    expect(stockMap[101].is_in_stock).toBe(false);
    expect(stockMap[102].is_in_stock).toBe(true);

    const formattedStock = formatStockVerificationContext(stockMap);
    expect(formattedStock).toContain('CURRENTLY OUT OF STOCK');
    expect(formattedStock).toContain('IN STOCK');
  });

  it('formats order and cancellation contexts accurately', () => {
    const orderContext = formatOrderContext({
      order_id: 234,
      status: 'processing',
      status_label: 'Processing',
      is_dispatched: false,
      total: '$35.00',
      currency: '$',
      date_created: '2026-10-28',
      shipping_method: 'Standard',
      tracking: [],
      items: [{ name: 'Facial Cleanser', quantity: 2, total: '$35.00' }],
      customer_name: 'Jane Doe',
    });

    expect(orderContext).toContain('Order Number: #234');
    expect(orderContext).toContain('Dispatched / Shipped: NO');

    const cancelContext = formatCancellationContext(true, 234, 'Order cancelled');
    expect(cancelContext).toContain('Successfully cancelled Order #234 in WooCommerce');
    expect(cancelContext).toContain('🤖 Bot Cancelled');
  });
});
