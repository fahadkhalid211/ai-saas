=== Crescelo – AI Chatbot, Website Scraper & Customer Support Assistant ===
Contributors: crescelo, fahadkhalid
Tags: ai-chatbot, customer-support, woocommerce-chatbot, website-scraper, knowledge-base
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.2.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WordPress and WooCommerce site to an intelligent AI chatbot trained on your pages, posts, products, and documents with 1-click scraping.

== Description ==

Crescelo transforms your WordPress and WooCommerce website into an autonomous 24/7 sales, customer support, and knowledge powerhouse.

Instead of manual copying and pasting, Crescelo features an automated **deep website scraper** and an interactive **5-step onboarding wizard** that lets you choose exactly which content to index (Pages, Posts, WooCommerce Products, FAQs, and Custom Post Types). The scraper extracts content and rich taxonomies, indexing them into vector search in seconds.

### Key Capabilities

* **Dynamic Post Type Selection**: Choose which post types to index into your AI Knowledge Base with simple toggles for Pages, Posts, WooCommerce Products, FAQs, and registered Custom Post Types (CPTs).
* **One-Click Website Scraper**: Scrapes and indexes your site in non-blocking batches with a live progress bar and terminal console in your WordPress dashboard.
* **Rich Metadata & Taxonomy Extraction**: Captures categories, tags, custom taxonomies, author names, publication dates, and public custom fields (ACF, specifications, summaries).
* **Automated 5-Step Setup Wizard**: Answer two quick questions about your website type and primary goal, scan your database, review discovered post types, and index content in minutes.
* **WooCommerce Deep Intelligence**: Understands products, categories, tags, attributes, live pricing, stock availability, and variations.
* **Conversational Sales Concierge**: Recommends products matching shopper requests, explains differences, handles questions, and presents interactive product cards in chat.
* **In-Chat Add to Cart**: Stages recommended products directly into the customer's cart via native WooCommerce AJAX, refreshing the store cart badge automatically.
* **Deterministic Stock & Price Verification**: Eliminates hallucinations by verifying live inventory and sale prices directly from your WordPress database via secure REST API before responding.
* **Real-Time Automatic Synchronization**: Listens to WordPress lifecycle hooks (`save_post`, `woocommerce_update_product`, `before_delete_post`) across all allowed post types to keep your AI knowledge base fresh in real time without manual re-crawling.
* **Media Library Ingestion**: Indexes PDF, DOCX, CSV, and TXT files uploaded to your Media Library.
* **Dual Scraping Modes**: Supports clean database extraction (stripping Gutenberg blocks and shortcodes) or rendered HTML scraping (capturing Elementor, Divi, Beaver Builder, and page builder layouts).
* **Zero Host Overhead**: Vector chunking, embedding, storage, and LLM inference run on Crescelo Cloud, keeping your WordPress site fast on shared hosting.

== Third-Party Service Disclosure ==

This plugin connects to and relies on the external Crescelo Cloud Service (https://crescelo.com) to provide AI chatbot capabilities, semantic search, vector embedding, and real-time knowledge base synchronization.

* **Service Provider**: Crescelo (https://crescelo.com)
* **Terms of Service**: https://crescelo.com/terms
* **Privacy Policy**: https://crescelo.com/privacy

**What data is sent to Crescelo?**
When you connect your site, run the website scraper, or when real-time auto-sync is triggered, the plugin transmits:
1. Public content (post titles, body text, excerpts, taxonomies, and public meta fields) from post types you explicitly select.
2. Public URLs and featured image URLs of selected items.
3. Your site URL, site name, and administrator contact email for authentication and connection handshake.

**When is data sent?**
* During initial 1-click connection or manual API key verification.
* When an administrator clicks "Scan" or "Scrape Website" in the setup wizard or dashboard.
* When an authorized post, page, or product is published, edited, or trashed (if real-time auto-sync is enabled).
* When a visitor asks the chatbot about product availability, the assistant verifies live pricing and stock via the secure local REST endpoint (`/wp-json/crescelo/v1/stock-check`).

== Installation ==

1. Upload the `crescelo` folder to the `/wp-content/plugins/` directory, or install via the WordPress Plugins screen using `crescelo.zip`.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Click on the **Crescelo AI** menu in your WordPress admin sidebar.
4. Follow the interactive 5-step onboarding wizard:
   - Step 1: Select your website type and primary goal, then connect via 1-Click login or API Key.
   - Step 2: Let the database scanner discover your registered post types, products, and documents.
   - Step 3: Choose which post types to allow for scraping and enable desired commerce features.
   - Step 4: Watch the live progress bar as your content is indexed in safe batches.
   - Step 5: Test the chatbot preview and activate the floating widget on your live site!

== Frequently Asked Questions ==

= Can I choose which post types get scraped into the knowledge base? =
Yes. On the Crescelo dashboard and in Step 3 of the setup wizard, administrators can enable or disable scraping for any registered post type (Pages, Posts, WooCommerce Products, Portfolio, FAQs, Docs, or custom post types).

= Will scraping my website slow down my server or trigger PHP timeouts? =
No. Content is extracted locally in lightweight, paginated batches (configurable between 10 and 50 items per batch) and dispatched to the external Crescelo backend, where vectorization takes place. Your WordPress server remains fast and responsive.

= Does it update the knowledge base when I publish or edit a post? =
Yes. When "Real-Time Auto-Sync" is enabled, saving, updating, or deleting any post belonging to an allowed post type immediately updates your Crescelo knowledge base in the background.

= Does this support WooCommerce variable products? =
Yes. The scanner extracts variations, attributes, and stock status so the chatbot can recommend the exact variant a shopper is looking for.

= Can I use this for non-WooCommerce sites? =
Yes. The setup wizard and scraper support blogs, corporate sites, documentation portals, portfolio sites, booking platforms, and lead generation websites.

== Screenshots ==

1. Interactive 5-step onboarding wizard with website type and goal selection.
2. Step 2: Automated database scan discovering all registered post types with dynamic metrics.
3. Step 3: Structured post type cards with collapsible sample drawers and WooCommerce category filter.
4. Step 4: Real-time asynchronous content vectorization with progress bar and terminal logs.
5. Step 5: Live simulated chat preview with interactive product advice, stock verification, and order tracking.

== Changelog ==

= 2.2.1 =
* Fixed wizard step pane isolation so inactive steps do not render prematurely in the DOM flow.
* Enhanced Step 2 database scanner with an animated multi-phase progress bar and dynamic metrics cards for all registered post types.
* Redesigned Step 3 content curation with structured card components, collapsible sample content drawers, and quick selection toolbar.
* Upgraded Step 5 with an interactive simulated preview supporting live test messages, deterministic stock verification, and order inquiry prompts.
* Added deterministic WooCommerce stock checking (`/stock-check`), order lookup (`/order-lookup`), and customer-driven cancellation (`/order-cancel`) with HPOS admin badges.
* Synchronized siteName and siteUrl parameters across WordPress localization and onboarding wizard state.

= 2.2.0 =
* Full WordPress.org compliance: slug updated to `crescelo`, text domain set to `crescelo`, strict sanitization and output escaping.
* Standardized script enqueueing using `wp_enqueue_script` and `script_loader_tag`.
* Added backward compatibility option mappings for existing installations.
* Added explicit Third-Party Service Disclosure for Crescelo Cloud in compliance with Guideline 7.
* Enhanced `$wpdb->prepare` queries for document attachments and product variations.

= 2.1.0 =
* Feature: Admin Post Type Selection - choose which post types (Pages, Posts, Products, Custom Post Types) to allow for scraping.
* Feature: One-Click Website Scraper with interactive real-time progress bar and live terminal logging.
* Feature: Rich metadata extraction - captures categories, tags, custom taxonomies, and public custom fields (ACF).
* Feature: Multiple scraping methods - clean database content or rendered HTML extraction.
* Enhancement: Real-time synchronization hooks now dynamically handle all allowed post types.

= 2.0.0 =
* Major release: Added 5-step interactive onboarding wizard in WordPress admin.
* Added automated database scanner for pages, WooCommerce catalog, and media documents.
* Added interactive WooCommerce Product Cards and in-chat Add-to-Cart actions.
* Added live REST API (`/wp-json/crescelo/v1/stock-check`) for real-time stock and price verification.
* Added incremental background synchronization hooks for posts, pages, and WooCommerce products.

= 1.0.0 =
* Initial release with basic chat widget integration.
