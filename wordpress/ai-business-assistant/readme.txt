=== Crescelo AI Business Assistant & Website Knowledge Scraper ===
Contributors: crescelo, fahadkhalid
Tags: website scraper, ai chatbot, knowledge base, woocommerce, rag, custom post types, sales concierge, appointments
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WordPress site to an intelligent AI chatbot that scrapes your entire website (posts, pages, WooCommerce products, custom post types, and documents) into an active vector knowledge base with dynamic post type selection, an automated 5-step setup wizard, and real-time synchronization.

== Description ==

Crescelo AI Business Assistant transforms your WordPress and WooCommerce site into an autonomous 24/7 sales, support, and information powerhouse.

Unlike generic chatbot widgets that require tedious manual copying and pasting, Crescelo features a **deep website scraper** and an **intelligent 5-step setup wizard** that allows administrators to choose exactly which post types to allow for scraping (Pages, Posts, WooCommerce Products, FAQs, Documentation, Portfolio, and any Custom Post Types), cleanly extracts their contents and metadata, and indexes them into high-performance vector search in seconds.

### Key Capabilities

* **Dynamic Post Type Selection**: Choose which post types to scrape into your AI Knowledge Base with one-click toggles for Pages, Posts, Products, FAQs, and all registered Custom Post Types (CPTs).
* **One-Click Whole Website Scraper**: Scrapes and indexes your entire website in safe, non-blocking batches with an interactive progress bar and live terminal console in your WordPress dashboard.
* **Rich Metadata & Taxonomy Extraction**: Captures categories, tags, custom taxonomies, author names, publication dates, and public custom fields (ACF, technical specifications, SEO summaries).
* **Automated 5-Step Setup Wizard**: Answers two simple questions about your website type and primary goal, scans your database, shows you all discovered post types, and indexes your selected content with a single click.
* **WooCommerce Deep Intelligence**: Understands products, categories, tags, attributes, pricing, stock availability, and variations.
* **Conversational Sales Concierge**: Recommends products matching shopper requirements, explains differences, handles pre-purchase objections, and renders interactive product cards right in the chat.
* **In-Chat Add to Cart**: Stages recommended products directly into the shopper's active cart via native WooCommerce AJAX, refreshing the store's mini-cart badge automatically.
* **Deterministic Stock & Price Verification**: Eliminates hallucinations by checking live inventory and sale prices directly from your database before responding.
* **Automatic Knowledge Synchronization**: Listens to WordPress lifecycle hooks (`save_post`, `woocommerce_update_product`, `before_delete_post`) across all allowed post types to keep your AI knowledge base fresh in real time without manual re-crawling.
* **Multi-Format Ingestion**: Indexes pages, blog posts, custom post types, and Media Library documents (PDF, DOCX, CSV, TXT) seamlessly through Crescelo's backend engine.
* **Flexible Scraping Methods**: Supports clean database extraction (stripping Gutenberg blocks and shortcodes) or rendered HTML scraping (capturing Elementor, Divi, Beaver Builder, and visual builder layouts).
* **In-Chat Appointment Booking**: Direct scheduling cards for service businesses, salons, and consultants.
* **Zero Host Overhead**: All heavy text chunking, embedding, vector storage, and LLM inference run on your external Crescelo SaaS backend, keeping your WordPress site fast and preventing timeouts on shared hosting.

== Installation ==

1. Upload the `ai-business-assistant` folder to the `/wp-content/plugins/` directory, or install via the WordPress Plugins menu using the provided `ai-business-assistant.zip`.
2. Activate the plugin.
3. Click on the **AI Assistant** menu in your WordPress dashboard.
4. Follow the 5-step setup wizard or visit the settings page:
   - Step 1: Select your website type (e.g. WooCommerce Store) and primary goal (e.g. Conversational Sales).
   - Step 2: Allow the automated scanner to inspect your database and discover all registered post types.
   - Step 3: Choose which post types (and specific items or categories) to allow for scraping.
   - Step 4: Watch the live progress bar as content across all chosen post types is scraped and vectorized in safe batches.
   - Step 5: Test the live chatbot and activate it on your public website!

== Frequently Asked Questions ==

= Can I choose which post types get scraped into the knowledge base? =
Yes! On the AI Assistant dashboard and in Step 3 of the setup wizard, administrators can choose which post types to allow (Pages, Posts, WooCommerce Products, Portfolio, FAQs, Docs, or any other Custom Post Type).

= Will scraping my website slow down my server or trigger PHP timeouts? =
No. Content is extracted locally in lightweight, paginated batches (configurable from 10 to 50 items per batch) and dispatched to the external Crescelo backend, where vectorization and embedding take place. Your WordPress server remains fast and responsive.

= Does it update the knowledge base when I publish or edit a post? =
Yes. When "Real-Time Auto-Sync" is enabled, any time you save, update, or delete a post belonging to an allowed post type, the plugin immediately syncs the change with your Crescelo knowledge base in the background.

= Does this support WooCommerce variable products (e.g., color and size)? =
Yes. The scanner extracts variations, attributes, and stock status so the chatbot can recommend the exact variant a shopper is looking for.

= Can I use this for non-WooCommerce sites? =
Absolutely. The setup wizard and scraper support blogs, documentation portals, portfolio sites, booking platforms, and B2B lead generation websites.

== Changelog ==

= 2.1.0 =
* Feature: Admin Post Type Selection - choose which post types (Pages, Posts, Products, Custom Post Types) to allow for scraping.
* Feature: One-Click Website Scraper with interactive real-time progress bar and live terminal logging.
* Feature: Rich metadata extraction - captures categories, tags, custom taxonomies, and public custom fields (ACF).
* Feature: Multiple scraping methods - clean database content or rendered HTML extraction.
* Enhancement: Real-time synchronization hooks now dynamically handle all allowed post types.
* Enhancement: Enriched Markdown formatting and vector chunking in Crescelo Knowledge Base backend.

= 2.0.0 =
* Major release: Added 5-step interactive onboarding wizard in WordPress admin.
* Added automated database scanner for pages, WooCommerce catalog, and media documents.
* Added interactive WooCommerce Product Cards and in-chat Add-to-Cart actions.
* Added live REST API (`/wp-json/crescelo/v1/stock-check`) for real-time stock and price verification.
* Added incremental background synchronization hooks for posts, pages, and WooCommerce products.
* Added dedicated Crescelo SaaS connector endpoints (`/api/connectors/wordpress/*`).

= 1.0.0 =
* Initial release with basic script injection.
