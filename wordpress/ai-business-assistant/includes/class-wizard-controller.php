<?php
/**
 * Onboarding Wizard Controller
 *
 * Manages AJAX endpoints for each step of the interactive onboarding wizard.
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
     * Check permissions and nonce.
     */
    private function verify_security() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['error' => 'Unauthorized user.'], 403);
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
            wp_send_json_error(['error' => $e->getMessage()]);
        }
    }

    /**
     * Step 1 -> 3: Register assistant in Crescelo with selected type and objective.
     */
    public function ajax_register_assistant() {
        $this->verify_security();

        $website_type = sanitize_text_field($_POST['website_type'] ?? 'woocommerce');
        $objective    = sanitize_text_field($_POST['objective'] ?? 'sales');
        $features     = isset($_POST['features']) ? array_map('sanitize_text_field', (array) $_POST['features']) : [];
        $host_url     = esc_url_raw($_POST['host_url'] ?? get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $api_key      = sanitize_text_field($_POST['api_key'] ?? get_option('ai_assistant_api_key', ''));

        update_option('ai_assistant_host_url', $host_url);
        update_option('ai_assistant_api_key', $api_key);
        update_option('ai_assistant_website_type', $website_type);
        update_option('ai_assistant_objective', $objective);
        update_option('ai_assistant_features', $features);

        $client = new Crescelo_Client($host_url, $api_key);
        $result = $client->register_site([
            'siteUrl'     => home_url(),
            'siteName'    => get_bloginfo('name'),
            'adminEmail'  => get_option('admin_email'),
            'websiteType' => $website_type,
            'objective'   => $objective,
            'features'    => $features,
        ]);

        if (empty($result['success'])) {
            wp_send_json_error(['error' => $result['error'] ?? 'Connection to Crescelo backend failed.']);
        }

        update_option('ai_assistant_id', $result['assistantId']);
        update_option('ai_assistant_site_secret', $result['siteSecret'] ?? '');

        wp_send_json_success([
            'assistantId'   => $result['assistantId'],
            'assistantName' => $result['assistantName'],
            'config'        => $result['config'] ?? [],
        ]);
    }

    /**
     * Step 4: Streamlined batched ingestion to prevent PHP timeout.
     */
    public function ajax_sync_batch() {
        $this->verify_security();

        $batch_type   = sanitize_text_field($_POST['batch_type'] ?? 'products');
        $offset       = intval($_POST['offset'] ?? 0);
        $limit        = intval($_POST['limit'] ?? 15);
        $selected_ids = isset($_POST['selected_ids']) ? (array) $_POST['selected_ids'] : [];

        $assistant_id = get_option('ai_assistant_id', '');
        if (empty($assistant_id)) {
            wp_send_json_error(['error' => 'No active Assistant ID configured.']);
        }

        // Fetch batch from WordPress DB
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
            wp_send_json_error(['error' => $sync_res['error'] ?? 'Batch synchronization failed.']);
        }

        $processed_count = count($items);
        $next_offset     = $offset + $processed_count;
        $has_more        = ($processed_count >= $limit);

        wp_send_json_success([
            'completed'      => false,
            'processedCount' => $processed_count,
            'totalChunks'    => $sync_res['totalChunks'] ?? 0,
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
        $assistant_id = get_option('ai_assistant_id', '');

        wp_send_json_success([
            'enabled'      => true,
            'widgetSrc'    => $host_url . '/widget.js',
            'assistantId'  => $assistant_id,
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
