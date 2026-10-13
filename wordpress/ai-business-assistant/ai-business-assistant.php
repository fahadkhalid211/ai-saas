<?php
/**
 * Plugin Name: Crescelo AI Business Assistant & Knowledge Scraper
 * Plugin URI: https://crescelo.com
 * Description: Connect your website to an intelligent AI chatbot that scrapes your entire website (posts, pages, WooCommerce products, custom post types, and documents) into an active vector knowledge base with an automated setup wizard and real-time synchronization.
 * Version: 2.2.0
 * Author: Crescelo
 * Author URI: https://crescelo.com
 * License: GPL-2.0+
 * Text Domain: ai-business-assistant
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CRESCELO_PLUGIN_VERSION', '2.2.0');
define('CRESCELO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CRESCELO_PLUGIN_URL', plugin_dir_url(__FILE__));

// Require Core Modules
require_once CRESCELO_PLUGIN_DIR . 'includes/class-crescelo-client.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-site-scanner.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-wizard-controller.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-live-api.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-sync-hooks.php';

class AIBusinessAssistantPlugin {

    private $client;
    private $scanner;
    private $wizard;
    private $live_api;
    private $sync_hooks;

    public function __construct() {
        // Initialize Core Dependencies
        $this->client     = new Crescelo_Client();
        $this->scanner    = new Crescelo_Site_Scanner();
        $this->wizard     = new Crescelo_Wizard_Controller($this->scanner, $this->client);
        $this->live_api   = new Crescelo_Live_API();
        $this->sync_hooks = new Crescelo_Sync_Hooks($this->client);

        // WordPress Actions
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_init', [$this, 'handle_crescelo_actions']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_footer', [$this, 'inject_widget_script']);
        add_action('admin_notices', [$this, 'render_admin_notices']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'Crescelo AI Assistant & Knowledge Scraper',
            'AI Assistant',
            'manage_options',
            'ai-business-assistant',
            [$this, 'render_admin_page'],
            'dashicons-format-chat',
            58
        );
    }

    public function register_settings() {
        register_setting('ai_assistant_options', 'ai_assistant_host_url', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => 'http://localhost:3000',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_id', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_api_key', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_site_secret', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_account_email', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_email',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_assistant_name', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_connected_at', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_enabled', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_wizard_completed', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => false,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_allowed_post_types', [
            'type'              => 'array',
            'sanitize_callback' => [$this, 'sanitize_post_types_array'],
            'default'           => ['page', 'post', 'product'],
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_scrape_include_meta', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_scrape_include_taxonomies', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_scrape_include_excerpt', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_scrape_method', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_key',
            'default'           => 'db',
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_batch_size', [
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 15,
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_auto_sync', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
        ]);
    }

    public function sanitize_post_types_array($input) {
        if (!is_array($input)) {
            return [];
        }
        return array_values(array_filter(array_map('sanitize_key', $input)));
    }

    /**
     * Handle OAuth / 1-Click Connect callback or Disconnect action.
     */
    public function handle_crescelo_actions() {
        if (!isset($_GET['page']) || $_GET['page'] !== 'ai-business-assistant') {
            return;
        }

        if (!current_user_can('manage_options')) {
            return;
        }

        $action = isset($_GET['crescelo_action']) ? sanitize_key($_GET['crescelo_action']) : '';

        // 1. OAuth Callback from Crescelo Cloud
        if ($action === 'callback') {
            $state = isset($_GET['state']) ? sanitize_text_field($_GET['state']) : '';
            $saved_state = get_transient('crescelo_oauth_state_' . $state);

            if (empty($state) || !$saved_state) {
                set_transient('crescelo_admin_error', 'Connection failed: Expired or invalid state token. Please try again.', 30);
                wp_safe_redirect(admin_url('admin.php?page=ai-business-assistant'));
                exit;
            }

            // Invalidate single-use state token
            delete_transient('crescelo_oauth_state_' . $state);

            $assistant_id   = sanitize_text_field($_GET['assistant_id'] ?? '');
            $assistant_name = sanitize_text_field($_GET['assistant_name'] ?? 'AI Assistant');
            $api_key        = sanitize_text_field($_GET['api_key'] ?? '');
            $site_secret    = sanitize_text_field($_GET['site_secret'] ?? '');
            $host_url       = esc_url_raw($_GET['host_url'] ?? get_option('ai_assistant_host_url', 'http://localhost:3000'));
            $account_email  = sanitize_email($_GET['account_email'] ?? '');

            if (empty($assistant_id)) {
                set_transient('crescelo_admin_error', 'Connection failed: Missing Assistant ID in response.', 30);
                wp_safe_redirect(admin_url('admin.php?page=ai-business-assistant'));
                exit;
            }

            update_option('ai_assistant_id', $assistant_id);
            update_option('ai_assistant_assistant_name', $assistant_name);
            update_option('ai_assistant_api_key', $api_key);
            update_option('ai_assistant_site_secret', $site_secret);
            update_option('ai_assistant_host_url', $host_url);
            update_option('ai_assistant_account_email', $account_email);
            update_option('ai_assistant_connected_at', current_time('mysql'));
            update_option('ai_assistant_enabled', true);

            set_transient('crescelo_admin_notice', 'Successfully connected your WordPress site to Crescelo AI Assistant!', 30);
            wp_safe_redirect(admin_url('admin.php?page=ai-business-assistant'));
            exit;
        }

        // 2. Disconnect Action
        if ($action === 'disconnect') {
            check_admin_referer('crescelo_disconnect_nonce');

            update_option('ai_assistant_id', '');
            update_option('ai_assistant_assistant_name', '');
            update_option('ai_assistant_api_key', '');
            update_option('ai_assistant_site_secret', '');
            update_option('ai_assistant_account_email', '');
            update_option('ai_assistant_connected_at', '');

            set_transient('crescelo_admin_notice', 'Disconnected from Crescelo. You can reconnect anytime.', 30);
            wp_safe_redirect(admin_url('admin.php?page=ai-business-assistant'));
            exit;
        }
    }

    public function render_admin_notices() {
        $notice = get_transient('crescelo_admin_notice');
        if ($notice) {
            delete_transient('crescelo_admin_notice');
            echo '<div class="notice notice-success is-dismissible" style="border-left-color:#abff44;"><p><strong>' . esc_html($notice) . '</strong></p></div>';
        }

        $error = get_transient('crescelo_admin_error');
        if ($error) {
            delete_transient('crescelo_admin_error');
            echo '<div class="notice notice-error is-dismissible"><p><strong>' . esc_html($error) . '</strong></p></div>';
        }
    }

    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'ai-business-assistant') === false) {
            return;
        }

        wp_enqueue_style(
            'crescelo-wizard-css',
            CRESCELO_PLUGIN_URL . 'assets/css/wizard.css',
            [],
            CRESCELO_PLUGIN_VERSION
        );

        wp_enqueue_script(
            'crescelo-wizard-js',
            CRESCELO_PLUGIN_URL . 'assets/js/wizard.js',
            ['jquery'],
            CRESCELO_PLUGIN_VERSION,
            true
        );

        $allowed_post_types   = $this->scanner->get_allowed_post_types();
        $available_post_types = $this->scanner->get_available_post_types();

        // Generate secure single-use state token for OAuth
        $oauth_state = wp_create_nonce('crescelo_oauth_' . get_current_user_id() . '_' . wp_rand());
        set_transient('crescelo_oauth_state_' . $oauth_state, home_url(), 900); // 15 mins

        $return_url = admin_url('admin.php?page=ai-business-assistant');
        $host_url   = esc_url_raw(get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));

        // Connect URL
        $connect_url = add_query_arg([
            'site_url'   => home_url(),
            'site_name'  => get_bloginfo('name'),
            'return_url' => $return_url,
            'state'      => $oauth_state,
        ], untrailingslashit($host_url) . '/connect/wordpress');

        wp_localize_script('crescelo-wizard-js', 'CresceloWizardData', [
            'ajaxUrl'            => admin_url('admin-ajax.php'),
            'nonce'              => wp_create_nonce('crescelo_wizard_nonce'),
            'hostUrl'            => $host_url,
            'connectUrl'         => $connect_url,
            'currentAssistantId' => $assistant_id,
            'isConnected'        => !empty($assistant_id),
            'assistantName'      => sanitize_text_field(get_option('ai_assistant_assistant_name', '')),
            'accountEmail'       => sanitize_email(get_option('ai_assistant_account_email', '')),
            'connectedAt'        => sanitize_text_field(get_option('ai_assistant_connected_at', '')),
            'allowedPostTypes'   => $allowed_post_types,
            'availablePostTypes' => $available_post_types,
            'batchSize'          => (int) get_option('ai_assistant_batch_size', 15),
        ]);
    }

    public function inject_widget_script() {
        $enabled = (bool) get_option('ai_assistant_enabled', true);
        if (!$enabled) return;

        $raw_host = get_option('ai_assistant_host_url', 'http://localhost:3000');
        $clean_host = esc_url_raw(untrailingslashit($raw_host));
        $parsed = wp_parse_url($clean_host);

        // Security check: Must be a valid HTTP/HTTPS URL
        if (empty($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        // Security check: Ensure assistant ID contains only safe alphanumeric/hyphen/underscore characters
        if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $assistant_id)) {
            return;
        }

        $widget_src = esc_url($clean_host . '/widget.js');
        $ast_id     = esc_attr($assistant_id);

        echo "\n<!-- Crescelo AI Business Assistant Widget -->\n";
        echo "<script src=\"{$widget_src}\" data-assistant=\"{$ast_id}\" defer></script>\n";
        echo "<!-- /Crescelo AI Business Assistant Widget -->\n";
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'ai-business-assistant'), 403);
        }

        $completed = (bool) get_option('ai_assistant_wizard_completed', false);
        $force_wizard = isset($_GET['view']) && sanitize_key($_GET['view']) === 'wizard';

        if (!$completed || $force_wizard) {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-wizard.php';
        } else {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-settings.php';
        }
    }
}

new AIBusinessAssistantPlugin();
