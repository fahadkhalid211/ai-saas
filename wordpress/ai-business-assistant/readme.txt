=== Crescelo AI Business Assistant & WooCommerce Sales Concierge ===
Contributors: crescelo, fahadkhalid
Tags: woocommerce, ai chatbot, sales assistant, customer support, rag, product recommendations, appointments
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WordPress site to an intelligent AI chatbot that scans your website, WooCommerce products, and documentation with an automated 5-step setup wizard.

== Description ==

Crescelo AI Business Assistant transforms your WordPress and WooCommerce site into an autonomous 24/7 sales and customer support powerhouse.

Unlike generic chatbot widgets that require tedious manual copying and pasting, Crescelo features an **intelligent 5-step setup wizard** that scans your WordPress database, reads your WooCommerce catalog, analyzes pages and policy documents, and indexes your knowledge base into high-performance vector search in seconds.

### Key Capabilities

* **Automated 5-Step Setup Wizard**: Answers two simple questions about your website type and primary goal, scans your database, shows you everything it found, and indexes your selected content with a single click.
* **WooCommerce Deep Intelligence**: Understands products, categories, tags, attributes, pricing, stock availability, and variations.
* **Conversational Sales Concierge**: Recommends products matching shopper requirements, explains differences, handles pre-purchase objections, and renders interactive product cards right in the chat.
* **In-Chat Add to Cart**: Stages recommended products directly into the shopper's active cart via native WooCommerce AJAX, refreshing the store's mini-cart badge automatically.
* **Deterministic Stock & Price Verification**: Eliminates hallucinations by checking live inventory and sale prices directly from your database before responding.
* **Automatic Knowledge Synchronization**: Listens to WordPress lifecycle hooks (`save_post`, `woocommerce_update_product`, `delete_post`) to keep your AI knowledge base fresh in real time without manual re-crawling.
* **Multi-Format Ingestion**: Indexes pages, blog posts, FAQs, and Media Library documents (PDF, DOCX, CSV, TXT) seamlessly through Crescelo's backend engine.
* **In-Chat Appointment Booking**: Direct scheduling cards for service businesses, salons, and consultants.
* **Zero Host Overhead**: All heavy text chunking, embedding, vector storage, and LLM inference run on your external Crescelo SaaS backend, keeping your WordPress site fast and preventing timeouts on shared hosting.

== Installation ==

1. Upload the `ai-business-assistant` folder to the `/wp-content/plugins/` directory, or install via the WordPress Plugins menu.
2. Activate the plugin.
3. Click on the **AI Assistant** menu in your WordPress dashboard.
4. Follow the 5-step setup wizard:
   - Step 1: Select your website type (e.g. WooCommerce Store) and primary goal (e.g. Conversational Sales).
   - Step 2: Allow the automated scanner to inspect your database and content structure.
   - Step 3: Review discovered products, pages, and documents, and toggle desired AI features.
   - Step 4: Watch the live progress bar as content is vectorized in safe, non-blocking batches.
   - Step 5: Test the live chatbot and activate it on your public website!

== Frequently Asked Questions ==

= Will indexing my catalog slow down my server or trigger PHP timeouts? =
No. Content is extracted locally in lightweight, paginated batches and dispatched to the external Crescelo backend, where vectorization and embedding take place. Your WordPress server remains fast and responsive.

= Does this support WooCommerce variable products (e.g., color and size)? =
Yes. The scanner extracts variations, attributes, and stock status so the chatbot can recommend the exact variant a shopper is looking for.

= Can I use this for non-WooCommerce sites? =
Absolutely. The setup wizard supports Service & Appointment businesses, Documentation/Knowledge Bases, and B2B Lead Generation sites.

== Changelog ==

= 2.0.0 =
* Major release: Added 5-step interactive onboarding wizard in WordPress admin.
* Added automated database scanner for pages, WooCommerce catalog, and media documents.
* Added interactive WooCommerce Product Cards and in-chat Add-to-Cart actions.
* Added live REST API (`/wp-json/crescelo/v1/stock-check`) for real-time stock and price verification.
* Added incremental background synchronization hooks for posts, pages, and WooCommerce products.
* Added dedicated Crescelo SaaS connector endpoints (`/api/connectors/wordpress/*`).

= 1.0.0 =
* Initial release with basic script injection.
