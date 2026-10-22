# Crescelo AI Assistant for Shopify

The Shopify counterpart of the WordPress plugin in `../../wordpress/ai-business-assistant`.

| | WordPress plugin | Shopify app |
|---|---|---|
| Chat widget on the storefront | `wp_footer` script | **Theme app embed** (`extensions/crescelo-widget`) |
| Catalog into the knowledge base | WP database scraper | **Public storefront** `products.json` / `collections.json`, read by Crescelo |
| Keeps knowledge fresh | save/delete hooks | **Re-sync** from the dashboard; removed products are dropped on every full sync |
| In-chat add to cart | WooCommerce AJAX | `/cart/add.js` (the widget detects Shopify itself) |
| Credential | assistant connector key | the same assistant connector key |

There is no Admin API access, token storage or Shopify-side webhook: the catalog is read from what the storefront already
publishes, so the app asks for **no access scopes**.

## What the merchant does

1. In Crescelo open **Dashboard > Connect Shopify** (`/connect/shopify`), pick the assistant, enter the store address and press
   **Connect & sync catalog**. Crescelo allows the store's domain, teaches the assistant to show product cards and cart
   buttons, and indexes every product and collection.
2. In Shopify open **Online Store > Themes > Customize > App embeds**, switch on **Crescelo AI Assistant** and paste the
   Assistant ID shown on the Crescelo page. Save.
3. After the catalog changes, press **Sync again** (a storefront with a password must have it removed while syncing).

## What the developer does (once)

```bash
npm install -g @shopify/cli
cd shopify/crescelo-ai-assistant
shopify app config link     # fills client_id in shopify.app.toml from your Partner Dashboard app
shopify app dev             # try it on a development store
shopify app deploy          # publish a version; then submit it for review / choose a distribution in the Partner Dashboard
```

## Server side (this repo)

- `lib/connectors/shopify.ts` reads and normalises the catalog (SSRF-guarded, redirects re-checked, size and time limits).
- `POST /api/connectors/shopify/connect` allows the store's domains and appends the Shopify shopping rules to the prompt once.
- `POST /api/connectors/shopify/sync` indexes one slice of the catalog per call (`offset` / `limit`) and, on the last slice, removes
  products that left the store. Both routes need the assistant's connector key in `X-Crescelo-Secret`.
- `public/widget.js` adds products to the cart with the Shopify cart API when it runs on a Shopify storefront.

## Known limits

- Stock is "in stock / sold out" per variant. The public storefront does not expose quantities.
- Only what the storefront publishes is indexed: products and collections, not pages, blog articles or policies.
  Add those through the dashboard's website/URL knowledge sources.
- Updates are not instant; they happen when the merchant syncs. A scheduled re-sync or Shopify product webhooks (which need an
  Admin API app and token storage) are the natural next step.
