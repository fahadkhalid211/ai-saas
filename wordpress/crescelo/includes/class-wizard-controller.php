<?php
/**
 * Onboarding Wizard and Scraper Controller
 *
 * Manages secure AJAX endpoints for the interactive setup wizard and website scraping engine.
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Wizard_Controller {

    private $scanner;
    private $client;

    public function __construct(Crescelo_Site_Scanner $scanner, Crescelo_Client $client) {
        $this->scanner = $scanner;
        $this->client  = $client;

        // Register AJAX handlers
        add_action('wp_ajax_crescelo_wizard_scan', [$this, 'ajax_scan_site']);
        add_action('wp_ajax_crescelo_wizard_register', [$this, 'ajax_register_assistant']);
        add_action('wp_ajax_crescelo_wizard_sync_batch', [$this, 'ajax_sync_batch']);
        add_action('wp_ajax_crescelo_wizard_finish', [$this, 'ajax_finish_setup']);
        add_action('wp_ajax_crescelo_wizard_reset', [$this, 'ajax_reset_configuration']);
        add_action('wp_ajax_crescelo_save_post_types', [$this, 'ajax_save_post_types']);
        add_action('wp_ajax_crescelo_record_scrape_complete', [$this, 'ajax_record_scrape_complete']);
        add_action('wp_ajax_crescelo_manual_connect_key', [$this, 'ajax_manual_connect_key']);
        add_action('wp_ajax_crescelo_test_connection', [$this, 'ajax_test_connection']);
        add_action('wp_ajax_crescelo_disconnect', [$this, 'ajax_disconnect']);
    }

    /**
     * Check permissions and CSRF nonce.
     */
    private function verify_security() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['error' => esc_html__('Unauthorized user capability.', 'crescelo')], 403);
        }
        check_ajax_referer('crescelo_wizard_nonce', 'nonce');
    }

    /**
     * Step 2 / Diagnostic: Scan the WordPress site and database.
     */
    public function ajax_scan_site() {
        $this->verify_security();

        try {
            $summary = $this->scanner->scan_site_summary();
            wp_send_json_success($summary);
        } catch (Exception $e) {
            wp_send_json_error(['error' => sanitize_text_field($e->getMessage())]);
        }
    }

    /**
     * Save the administrator's selection of post types allowed for scraping.
     */
    public function ajax_save_post_types() {
        $this->verify_security();

        $raw_post_types = isset($_POST['allowed_post_types']) && is_array($_POST['allowed_post_types'])
            ? array_map('sanitize_key', wp_unslash($_POST['allowed_post_types']))
            : [];

        $available = $this->scanner->get_available_post_types();
        $sanitized_types = [];

        foreach ($raw_post_types as $pt) {
            $slug = sanitize_key($pt);
            if (isset($available[$slug]) || $slug === 'product' || $slug === 'page' || $slug === 'post') {
                $sanitized_types[] = $slug;
            }
        }

        crescelo_update_option('allowed_post_types', $sanitized_types);
        update_option('ai_assistant_allowed_post_types', $sanitized_types);

        // Optional scrape settings
        if (isset($_POST['scrape_include_meta'])) {
            $val = (bool) rest_sanitize_boolean(wp_unslash($_POST['scrape_include_meta']));
            crescelo_update_option('scrape_include_meta', $val);
            update_option('ai_assistant_scrape_include_meta', $val);
        }
        if (isset($_POST['scrape_include_taxonomies'])) {
            $val = (bool) rest_sanitize_boolean(wp_unslash($_POST['scrape_include_taxonomies']));
            crescelo_update_option('scrape_include_taxonomies', $val);
            update_option('ai_assistant_scrape_include_taxonomies', $val);
        }
        if (isset($_POST['scrape_include_excerpt'])) {
            $val = (bool) rest_sanitize_boolean(wp_unslash($_POST['scrape_include_excerpt']));
            crescelo_update_option('scrape_include_excerpt', $val);
            update_option('ai_assistant_scrape_include_excerpt', $val);
        }
        if (isset($_POST['scrape_method'])) {
            $method = sanitize_key(wp_unslash($_POST['scrape_method']));
            $val = in_array($method, ['db', 'html'], true) ? $method : 'db';
            crescelo_update_option('scrape_method', $val);
            update_option('ai_assistant_scrape_method', $val);
        }
        if (isset($_POST['batch_size'])) {
            $size = min(50, max(5, absint(wp_unslash($_POST['batch_size']))));
            crescelo_update_option('batch_size', $size);
            update_option('ai_assistant_batch_size', $size);
        }

        wp_send_json_success([
            'saved'              => true,
            'allowed_post_types' => $sanitized_types,
            'message'            => esc_html__('Scraping configuration updated successfully.', 'crescelo'),
        ]);
    }

    /**
     * Step 1 -> 3: Register assistant in Crescelo with selected type and objective.
     */
    public function ajax_register_assistant() {
        $this->verify_security();

        // 1. Validate website_type against strict allowlist
        $allowed_types = ['woocommerce', 'service_booking', 'content_docs', 'lead_generation', 'general'];
        $raw_type      = isset($_POST['website_type']) ? sanitize_key(wp_unslash($_POST['website_type'])) : 'woocommerce';
        $website_type  = in_array($raw_type, $allowed_types, true) ? $raw_type : 'woocommerce';

        // 2. Validate objective against strict allowlist
        $allowed_objectives = ['sales', 'booking', 'support', 'leads'];
        $raw_objective      = isset($_POST['objective']) ? sanitize_key(wp_unslash($_POST['objective'])) : 'sales';
        $objective          = in_array($raw_objective, $allowed_objectives, true) ? $raw_objective : 'sales';

        // 3. Validate features against allowlist
        $allowed_features = ['add_to_cart', 'live_stock', 'comparison', 'order_tracking', 'order_cancel', 'booking', 'lead_capture'];
        $raw_features     = isset($_POST['features']) && is_array($_POST['features']) ? array_map('sanitize_key', wp_unslash($_POST['features'])) : [];
        $features         = [];
        foreach ($raw_features as $f) {
            if (in_array($f, $allowed_features, true)) {
                $features[] = $f;
            }
        }

        // 4. Validate host_url format and protocol
        $raw_host = isset($_POST['host_url']) ? trim(wp_unslash($_POST['host_url'])) : crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
        $host_url = esc_url_raw($raw_host);
        $parsed   = wp_parse_url($host_url);

        if (empty($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
            wp_send_json_error(['error' => esc_html__('Invalid Server URL. Must use HTTP or HTTPS.', 'crescelo')]);
        }

        // 5. Sanitize API Key
        $api_key = isset($_POST['api_key']) ? sanitize_text_field(trim(wp_unslash($_POST['api_key']))) : sanitize_text_field(crescelo_get_option('api_key', ''));

        crescelo_update_option('host_url', $host_url);
        crescelo_update_option('api_key', $api_key);
        crescelo_update_option('website_type', $website_type);
        crescelo_update_option('objective', $objective);
        crescelo_update_option('features', $features);

        // Keep legacy options in sync
        update_option('ai_assistant_host_url', $host_url);
        update_option('ai_assistant_api_key', $api_key);
        update_option('ai_assistant_website_type', $website_type);
        update_option('ai_assistant_objective', $objective);
        update_option('ai_assistant_features', $features);

        $client = new Crescelo_Client($host_url, $api_key);
        $result = $client->register_site([
            'siteUrl'     => esc_url_raw(home_url()),
            'siteName'    => sanitize_text_field(get_bloginfo('name')),
            'adminEmail'  => sanitize_email(get_option('admin_email')),
            'websiteType' => $website_type,
            'objective'   => $objective,
            'features'    => $features,
        ]);

        if (empty($result['success'])) {
            wp_send_json_error(['error' => sanitize_text_field($result['error'] ?? esc_html__('Connection to Crescelo backend failed.', 'crescelo'))]);
        }

        $assistant_id = sanitize_text_field($result['assistantId'] ?? '');
        $site_secret  = sanitize_text_field($result['siteSecret'] ?? '');

        crescelo_update_option('id', $assistant_id);
        crescelo_update_option('site_secret', $site_secret);
        update_option('ai_assistant_id', $assistant_id);
        update_option('ai_assistant_site_secret', $site_secret);

        wp_send_json_success([
            'assistantId'   => $assistant_id,
            'assistantName' => sanitize_text_field($result['assistantName'] ?? ''),
            'config'        => $result['config'] ?? [],
        ]);
    }

    /**
     * Step 4 & Standalone Scraper: Streamlined batched ingestion with strict boundary checks.
     * Supports ANY allowed post type (pages, posts, products, custom post types) and media documents.
     */
    public function ajax_sync_batch() {
        $this->verify_security();

        $raw_batch  = isset($_POST['batch_type']) ? sanitize_key(wp_unslash($_POST['batch_type'])) : 'page';
        $batch_type = $raw_batch;

        if ($batch_type === 'product' && class_exists('WooCommerce')) {
            $batch_type = 'products';
        } elseif ($batch_type === 'attachment' || $batch_type === 'document') {
            $batch_type = 'documents';
        }

        // Verify that the batch type is either a recognized post type, products, or documents
        $is_valid_type = ($batch_type === 'products' || $batch_type === 'documents' || post_type_exists($batch_type));
        if (!$is_valid_type) {
            wp_send_json_error(['error' => sprintf(
                /* translators: %s: invalid post type name */
                esc_html__('Invalid post type requested for scraping: %s', 'crescelo'),
                esc_html($batch_type)
            )]);
        }

        // Validate and clamp pagination to prevent memory exhaustion
        $default_limit = (int) crescelo_get_option('batch_size', 15);
        $offset        = isset($_POST['offset']) ? absint(wp_unslash($_POST['offset'])) : 0;
        $limit         = min(50, max(1, absint(isset($_POST['limit']) ? wp_unslash($_POST['limit']) : $default_limit)));

        // Strictly sanitize selected IDs
        $selected_ids = [];
        if (isset($_POST['selected_ids']) && is_array($_POST['selected_ids'])) {
            $selected_ids = array_map('absint', array_filter(wp_unslash($_POST['selected_ids']), 'is_numeric'));
        }

        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));
        if (empty($assistant_id)) {
            wp_send_json_error(['error' => esc_html__('No active Assistant ID configured. Please configure an assistant first.', 'crescelo')]);
        }

        // Collect scraping options
        $options = [
            'include_meta'       => isset($_POST['include_meta']) ? (bool) rest_sanitize_boolean(wp_unslash($_POST['include_meta'])) : (bool) crescelo_get_option('scrape_include_meta', true),
            'include_taxonomies' => isset($_POST['include_taxonomies']) ? (bool) rest_sanitize_boolean(wp_unslash($_POST['include_taxonomies'])) : (bool) crescelo_get_option('scrape_include_taxonomies', true),
            'include_excerpt'    => isset($_POST['include_excerpt']) ? (bool) rest_sanitize_boolean(wp_unslash($_POST['include_excerpt'])) : (bool) crescelo_get_option('scrape_include_excerpt', true),
            'scrape_method'      => isset($_POST['scrape_method']) ? sanitize_key(wp_unslash($_POST['scrape_method'])) : sanitize_key(crescelo_get_option('scrape_method', 'db')),
        ];

        // Fetch batch safely from WordPress DB
        $items = $this->scanner->get_items_batch($batch_type, $offset, $limit, $selected_ids, $options);

        if (empty($items)) {
            wp_send_json_success([
                'completed'      => true,
                'processedCount' => 0,
                'totalChunks'    => 0,
                'hasMore'        => false,
            ]);
            return;
        }

        // Send to Crescelo Knowledge Base backend
        $sync_res = $this->client->sync_batch($assistant_id, $batch_type, $items);

        if (empty($sync_res['success'])) {
            wp_send_json_error(['error' => sanitize_text_field($sync_res['error'] ?? esc_html__('Batch synchronization failed.', 'crescelo'))]);
        }

        $processed_count = count($items);
        $next_offset     = $offset + $processed_count;
        $has_more        = ($processed_count >= $limit);

        wp_send_json_success([
            'completed'      => false,
            'processedCount' => $processed_count,
            'totalChunks'    => absint($sync_res['totalChunks'] ?? 0),
            'nextOffset'     => $next_offset,
            'hasMore'        => $has_more,
        ]);
    }

    /**
     * Record completed website scrape metrics into WordPress options.
     */
    public function ajax_record_scrape_complete() {
        $this->verify_security();

        $total_items  = isset($_POST['total_items']) ? absint(wp_unslash($_POST['total_items'])) : 0;
        $total_chunks = isset($_POST['total_chunks']) ? absint(wp_unslash($_POST['total_chunks'])) : 0;
        $post_types   = isset($_POST['scraped_post_types']) && is_array($_POST['scraped_post_types'])
            ? array_map('sanitize_key', wp_unslash($_POST['scraped_post_types']))
            : [];

        $now = current_time('mysql');
        $stats = [
            'total_items'        => $total_items,
            'total_chunks'       => $total_chunks,
            'last_run'           => $now,
            'scraped_post_types' => $post_types,
        ];

        crescelo_update_option('last_scraped', $now);
        crescelo_update_option('scrape_stats', $stats);
        update_option('ai_assistant_last_scraped', $now);
        update_option('ai_assistant_scrape_stats', $stats);

        wp_send_json_success([
            'recorded'    => true,
            'lastScraped' => $now,
            'totalItems'  => $total_items,
            'totalChunks' => $total_chunks,
        ]);
    }

    /**
     * Step 5: Finalize setup and activate live widget.
     */
    public function ajax_finish_setup() {
        $this->verify_security();

        crescelo_update_option('enabled', true);
        crescelo_update_option('wizard_completed', true);
        update_option('ai_assistant_enabled', true);
        update_option('ai_assistant_wizard_completed', true);

        $host_url     = untrailingslashit(crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST));
        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));

        wp_send_json_success([
            'enabled'     => true,
            'widgetSrc'   => esc_url_raw($host_url . '/widget.js'),
            'assistantId' => $assistant_id,
        ]);
    }

    /**
     * Reset configuration to re-run the wizard.
     */
    public function ajax_reset_configuration() {
        $this->verify_security();

        crescelo_update_option('wizard_completed', false);
        update_option('ai_assistant_wizard_completed', false);
        wp_send_json_success(['reset' => true]);
    }

    /**
     * Connect manually using an API key.
     */
    public function ajax_manual_connect_key() {
        $this->verify_security();

        $api_key  = isset($_POST['api_key']) ? sanitize_text_field(trim(wp_unslash($_POST['api_key']))) : '';
        $raw_host = isset($_POST['host_url']) ? trim(wp_unslash($_POST['host_url'])) : crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
        $host_url = esc_url_raw($raw_host);

        if (empty($api_key)) {
            wp_send_json_error(['error' => esc_html__('Please enter a valid API Key.', 'crescelo')]);
        }

        $endpoint = untrailingslashit($host_url) . '/api/connectors/wordpress/verify-key';

        $response = wp_remote_post($endpoint, [
            'timeout'     => 20,
            'headers'     => [
                'Content-Type'   => 'application/json',
                'X-Crescelo-Key' => $api_key,
            ],
            'body'        => wp_json_encode([
                'apiKey'     => $api_key,
                'siteUrl'    => esc_url_raw(home_url()),
                'siteName'   => sanitize_text_field(get_bloginfo('name')),
                'adminEmail' => sanitize_email(get_option('admin_email')),
            ]),
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error(['error' => sprintf(
                /* translators: %s: error message */
                esc_html__('Connection failed: %s', 'crescelo'),
                sanitize_text_field($response->get_error_message())
            )]);
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        // Fallback for direct Assistant ID connection or pending cloud route deployment
        if ($code !== 200 || empty($body['success'])) {
            $is_uuid_or_id = (bool) preg_match('/^[a-zA-Z0-9_\-]{8,64}$/', $api_key);
            if ($is_uuid_or_id && ($code === 404 || is_wp_error($response) || $code === 0)) {
                $assistant_id   = sanitize_text_field($api_key);
                $assistant_name = sanitize_text_field(get_bloginfo('name')) . ' AI Assistant';
                $site_secret    = sanitize_text_field($api_key);
                $connected_now  = current_time('mysql');

                crescelo_update_option('id', $assistant_id);
                crescelo_update_option('assistant_name', $assistant_name);
                crescelo_update_option('api_key', $api_key);
                crescelo_update_option('site_secret', $site_secret);
                crescelo_update_option('host_url', $host_url);
                crescelo_update_option('connected_at', $connected_now);
                crescelo_update_option('enabled', true);
                crescelo_update_option('wizard_completed', true);

                update_option('ai_assistant_id', $assistant_id);
                update_option('ai_assistant_assistant_name', $assistant_name);
                update_option('ai_assistant_api_key', $api_key);
                update_option('ai_assistant_site_secret', $site_secret);

                wp_send_json_success([
                    'assistantId'   => $assistant_id,
                    'assistantName' => $assistant_name,
                    'message'       => esc_html__('Connected successfully with Assistant ID! Chatbot is now active.', 'crescelo'),
                ]);
            }

            wp_send_json_error(['error' => sanitize_text_field($body['error'] ?? esc_html__('Invalid API Key or server response.', 'crescelo'))]);
        }

        $assistant_id   = sanitize_text_field($body['assistantId'] ?? '');
        $assistant_name = sanitize_text_field($body['assistantName'] ?? esc_html__('AI Assistant', 'crescelo'));
        $site_secret    = sanitize_text_field($body['siteSecret'] ?? $api_key);
        $connected_now  = current_time('mysql');

        crescelo_update_option('id', $assistant_id);
        crescelo_update_option('assistant_name', $assistant_name);
        crescelo_update_option('api_key', $api_key);
        crescelo_update_option('site_secret', $site_secret);
        crescelo_update_option('host_url', $host_url);
        crescelo_update_option('connected_at', $connected_now);
        crescelo_update_option('enabled', true);
        crescelo_update_option('wizard_completed', true);

        // Keep legacy options in sync
        update_option('ai_assistant_id', $assistant_id);
        update_option('ai_assistant_assistant_name', $assistant_name);
        update_option('ai_assistant_api_key', $api_key);
        update_option('ai_assistant_site_secret', $site_secret);
        update_option('ai_assistant_host_url', $host_url);
        update_option('ai_assistant_connected_at', $connected_now);
        update_option('ai_assistant_enabled', true);
        update_option('ai_assistant_wizard_completed', true);

        wp_send_json_success([
            'connected'     => true,
            'assistantId'   => $assistant_id,
            'assistantName' => $assistant_name,
            'hostUrl'       => $host_url,
            'connectedAt'   => $connected_now,
            'message'       => esc_html__('Connected successfully via API Key!', 'crescelo'),
        ]);
    }

    /**
     * Test active connection health.
     */
    public function ajax_test_connection() {
        $this->verify_security();

        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));
        $host_url     = esc_url_raw(crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST));

        if (empty($assistant_id)) {
            wp_send_json_error(['error' => esc_html__('No assistant connected.', 'crescelo')]);
        }

        $endpoint = untrailingslashit($host_url) . '/api/widget/' . $assistant_id . '/config';
        $res = wp_remote_get($endpoint, ['timeout' => 10]);

        if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
            wp_send_json_error(['error' => esc_html__('Could not communicate with Crescelo assistant. Check server status.', 'crescelo')]);
        }

        wp_send_json_success([
            'healthy'       => true,
            'assistantId'   => $assistant_id,
            'assistantName' => crescelo_get_option('assistant_name', esc_html__('Active Assistant', 'crescelo')),
            'message'       => esc_html__('Connection is healthy and active!', 'crescelo'),
        ]);
    }

    /**
     * Disconnect the site from Crescelo.
     */
    public function ajax_disconnect() {
        $this->verify_security();

        crescelo_delete_option('id');
        crescelo_delete_option('assistant_name');
        crescelo_delete_option('api_key');
        crescelo_delete_option('site_secret');
        crescelo_delete_option('account_email');
        crescelo_delete_option('connected_at');

        wp_send_json_success([
            'disconnected' => true,
            'message'      => esc_html__('Disconnected from Crescelo.', 'crescelo'),
        ]);
    }
}
