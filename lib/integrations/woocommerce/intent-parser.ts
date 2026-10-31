/**
 * WooCommerce intent detection and entity extraction utilities.
 *
 * Lightweight, zero-LLM, regex-based fast path for:
 * 1. Order status / tracking questions ("where is my order", "order #234 not received")
 * 2. Order cancellation requests ("cancel my order #234 from email x@y.com")
 * 3. Product recommendation inquiries ("i have acne on my skin, what should i use?")
 */

// ---------------------------------------------------------------------------
// Intent Detection Patterns
// ---------------------------------------------------------------------------

const ORDER_CANCEL_PATTERNS = [
  /\bcancel\b.*\border\b/i,
  /\border\b.*\bcancel/i,
  /\bcancel\s*(?:my\s*)?(?:order|purchase|item|package)/i,
  /\bstop\s*(?:my\s*)?order\b/i,
  /\babort\s*(?:my\s*)?order\b/i,
  /\bvoid\s*(?:my\s*)?order\b/i,
];

const ORDER_STATUS_PATTERNS = [
  /\b(?:where\s+is|track|status\s+of|check|find)\b.*\b(?:order|package|parcel|shipment)\b/i,
  /\b(?:order|package|parcel|shipment)\b.*\b(?:status|tracking|shipped|dispatched|arrive|received|delivery|transit)\b/i,
  /\bhas\s+(?:my\s+)?(?:order|package|parcel|shipment)\b.*\b(?:shipped|dispatched|arrived|sent)\b/i,
  /\border\s*#?\s*\d+\b/i,
  /\b(?:not\s+received|hasn't\s+arrived|haven't\s+received|where('s|\s+is))\s*(?:my\s*)?(?:order|package|delivery|parcel)\b/i,
  /\btracking\s*(?:number|info|code|link|update)\b/i,
  /\bwhen\s+will\s+(?:my\s+)?(?:order|package)\b/i,
];

const PRODUCT_RECOMMENDATION_PATTERNS = [
  /\b(?:what\s+should\s+i\s+use|what\s+do\s+you\s+recommend|recommend\s+me|best\s+product\s+for|looking\s+for\s+something\s+for)\b/i,
  /\b(?:have|got|suffer\s+from|struggling\s+with)\s+([a-z\s]+?)\s*(?:on\s+my\s+(?:skin|face|body|hair)|what\s+should|any\s+recommendation)/i,
  /\b(?:acne|blemish|breakout|dry\s+skin|oily\s+skin|wrinkles|eczema|hyperpigmentation|rosacea|anti-aging)\b/i,
];

/**
 * Returns true if the customer is requesting to cancel an order.
 */
export function detectOrderCancelIntent(text: string): boolean {
  if (!text) return false;
  // Negation check: "don't cancel my order", "please do not cancel"
  if (/\b(?:don'?t|do\s+not|never)\s+(?:cancel|abort|stop)\b/i.test(text)) {
    return false;
  }
  return ORDER_CANCEL_PATTERNS.some((p) => p.test(text));
}

/**
 * Returns true if the customer is inquiring about the status, tracking,
 * or delivery of an existing order.
 */
export function detectOrderStatusIntent(text: string): boolean {
  if (!text) return false;
  // If user says "cancel order #123", prioritize cancel intent
  if (detectOrderCancelIntent(text)) return false;
  return ORDER_STATUS_PATTERNS.some((p) => p.test(text));
}

/**
 * Returns true if the customer is asking for a product recommendation.
 */
export function detectProductRecommendationIntent(text: string): boolean {
  if (!text) return false;
  return PRODUCT_RECOMMENDATION_PATTERNS.some((p) => p.test(text));
}

// ---------------------------------------------------------------------------
// Entity Extraction
// ---------------------------------------------------------------------------

/**
 * Extracts an Order ID from customer message or conversation snippet.
 * Matches:
 *  - "order #234"
 *  - "order 234"
 *  - "#234"
 *  - "order number: 234"
 *  - Standalone 3-8 digit numeric identifier when near order keywords
 */
export function extractOrderId(text: string): number | null {
  if (!text) return null;

  // #1. Explicit prefixes: "order #1234", "order 1234", "order: 1234", "order id 1234"
  const prefixMatch = text.match(/\border(?:\s*id|\s*number|\s*no\.?|\s*#)?\s*[:#-]?\s*(\d{1,10})\b/i);
  if (prefixMatch && prefixMatch[1]) {
    const id = parseInt(prefixMatch[1], 10);
    if (!isNaN(id) && id > 0) return id;
  }

  // #2. Hashtag format: "#1234"
  const hashMatch = text.match(/#(\d{2,10})\b/);
  if (hashMatch && hashMatch[1]) {
    const id = parseInt(hashMatch[1], 10);
    if (!isNaN(id) && id > 0) return id;
  }

  // #3. Contextual numeric sequence directly associated with order/status/tracking
  const contextMatch = text.match(/\b(?:order|tracking|package|parcel|ref|reference)\s*(?:number|id|no\.?)?\s*[:#-]?\s*(\d{2,10})\b/i);
  if (contextMatch && contextMatch[1]) {
    const id = parseInt(contextMatch[1], 10);
    if (!isNaN(id) && id > 0) return id;
  }

  return null;
}

/**
 * Extracts a valid customer email address from customer message.
 */
export function extractEmail(text: string): string | null {
  if (!text) return null;

  // Standard RFC-compliant email regex pattern
  const emailMatch = text.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/);
  if (emailMatch && emailMatch[0]) {
    return emailMatch[0].trim().toLowerCase();
  }

  return null;
}

/**
 * Extracts product IDs embedded in Markdown or knowledge base retrieved passages.
 * Example: "- **Product ID**: 45" or "Product ID: 45" or "[PRODUCT_CARD:{\"id\":45"
 */
export function extractProductIdsFromContext(context: string): number[] {
  if (!context) return [];
  const ids = new Set<number>();

  const matches = context.matchAll(/(?:\*\*Product ID\*\*|Product ID|["']id["'])\s*[:=]\s*(\d+)/gi);
  for (const m of matches) {
    if (m[1]) {
      const id = parseInt(m[1], 10);
      if (!isNaN(id) && id > 0) {
        ids.add(id);
      }
    }
  }

  return Array.from(ids);
}
