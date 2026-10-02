<?php
/**
 * Onboarding Wizard Controller
 *
 * Manages secure AJAX endpoints for each step of the interactive onboarding wizard.
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
    }

    /**
     * Check permissions and CSRF nonce.
     */
    private function verify_security() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['error' => 'Unauthorized user capability.'], 403);
        }
        check_ajax_referer('crescelo_wizard_nonce', 'nonce');
    }

    /**
     * Step 2: Scan the WordPress site and database.
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
     * Step 1 -> 3: Register assistant in Crescelo with selected type and objective.
     */
    public function ajax_register_assistant() {
        $this->verify_security();

        // 1. Validate website_type against strict allowlist
        $allowed_types = ['woocommerce', 'service_booking', 'content_docs', 'lead_generation', 'general'];
        $raw_type      = sanitize_key($_POST['website_type'] ?? 'woocommerce');
        $website_type  = in_array($raw_type, $allowed_types, true) ? $raw_type : 'woocommerce';

        // 2. Validate objective against strict allowlist
        $allowed_objectives = ['sales', 'booking', 'support', 'leads'];
        $raw_objective      = sanitize_key($_POST['objective'] ?? 'sales');
        $objective          = in_array($raw_objective, $allowed_objectives, true) ? $raw_objective : 'sales';

        // 3. Validate features against allowlist
        $allowed_features = ['add_to_cart', 'live_stock', 'comparison', 'booking', 'lead_capture'];
        $raw_features     = isset($_POST['features']) && is_array($_POST['features']) ? $_POST['features'] : [];
        $features         = [];
        foreach ($raw_features as $f) {
            $sanitized_f = sanitize_key($f);
            if (in_array($sanitized_f, $allowed_features, true)) {
                $features[] = $sanitized_f;
            }
        }

        // 4. Validate host_url format and protocol
        $raw_host = trim($_POST['host_url'] ?? get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $host_url = esc_url_raw($raw_host);
        $parsed   = wp_parse_url($host_url);

        if (empty($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
            wp_send_json_error(['error' => 'Invalid Server URL. Must use HTTP or HTTPS.']);
        }

        // 5. Sanitize API Key
        $api_key = sanitize_text_field(trim($_POST['api_key'] ?? get_option('ai_assistant_api_key', '')));

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
            wp_send_json_error(['error' => sanitize_text_field($result['error'] ?? 'Connection to Crescelo backend failed.')]);
        }

        $assistant_id = sanitize_text_field($result['assistantId'] ?? '');
        $site_secret  = sanitize_text_field($result['siteSecret'] ?? '');

        update_option('ai_assistant_id', $assistant_id);
        update_option('ai_assistant_site_secret', $site_secret);

        wp_send_json_success([
            'assistantId'   => $assistant_id,
            'assistantName' => sanitize_text_field($result['assistantName'] ?? ''),
            'config'        => $result['config'] ?? [],
        ]);
    }

    /**
     * Step 4: Streamlined batched ingestion with strict boundary checks.
     */
    public function ajax_sync_batch() {
        $this->verify_security();

        // 1. Validate batch type against allowlist
        $allowed_batches = ['products', 'pages', 'documents', 'faqs'];
        $raw_batch       = sanitize_key($_POST['batch_type'] ?? 'products');
        $batch_type      = in_array($raw_batch, $allowed_batches, true) ? $raw_batch : 'products';

        // 2. Validate and clamp pagination to prevent memory exhaustion
        $offset = absint($_POST['offset'] ?? 0);
        $limit  = min(50, max(1, absint($_POST['limit'] ?? 15)));

        // 3. Strictly sanitize selected IDs
        $selected_ids = [];
        if (isset($_POST['selected_ids']) && is_array($_POST['selected_ids'])) {
            $selected_ids = array_map('absint', array_filter($_POST['selected_ids'], 'is_numeric'));
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) {
            wp_send_json_error(['error' => 'No active Assistant ID configured.']);
        }

        // Fetch batch safely from WordPress DB
        $items = $this->scanner->get_items_batch($batch_type, $offset, $limit, $selected_ids);

        if (empty($items)) {
            wp_send_json_success([
                'completed'      => true,
                'processedCount' => 0,
                'totalChunks'    => 0,
                'hasMore'        => false,
            ]);
            return;
        }

        // Send to Crescelo
        $sync_res = $this->client->sync_batch($assistant_id, $batch_type, $items);

        if (empty($sync_res['success'])) {
            wp_send_json_error(['error' => sanitize_text_field($sync_res['error'] ?? 'Batch synchronization failed.')]);
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
     * Step 5: Finalize setup and activate live widget.
     */
    public function ajax_finish_setup() {
        $this->verify_security();

        update_option('ai_assistant_enabled', true);
        update_option('ai_assistant_wizard_completed', true);

        $host_url     = untrailingslashit(get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));

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

        update_option('ai_assistant_wizard_completed', false);
        wp_send_json_success(['reset' => true]);
    }
}
