<?php
/**
 * Plugin Name: Crescelo – AI Chatbot, Website Scraper & Customer Support Assistant
 * Plugin URI: https://crescelo.com
 * Description: Connect your website to an intelligent AI chatbot that scrapes your website (posts, pages, WooCommerce products, custom post types, and documents) into an active vector knowledge base with an automated setup wizard and real-time synchronization.
 * Version: 2.2.0
 * Author: Crescelo
 * Author URI: https://crescelo.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: crescelo
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CRESCELO_PLUGIN_VERSION', '2.2.0');
define('CRESCELO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CRESCELO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CRESCELO_DEFAULT_HOST', 'https://www.crescelo.com');

/**
 * Helper to fetch plugin options with fallback to legacy keys.
 *
 * @param string $key Option key without prefix.
 * @param mixed  $default Default value if option is unset.
 * @return mixed
 */
function crescelo_get_option($key, $default = false) {
    $primary = get_option('crescelo_' . $key, null);
    if ($primary !== null && $primary !== false) {
        return $primary;
    }
    $legacy = get_option('ai_assistant_' . $key, null);
    if ($legacy !== null && $legacy !== false) {
        return $legacy;
    }
    return $default;
}

/**
 * Helper to update plugin options.
 *
 * @param string $key Option key without prefix.
 * @param mixed  $value New value.
 * @return bool
 */
function crescelo_update_option($key, $value) {
    return update_option('crescelo_' . $key, $value);
}

/**
 * Helper to delete plugin options across both current and legacy keys.
 *
 * @param string $key Option key without prefix.
 */
function crescelo_delete_option($key) {
    delete_option('crescelo_' . $key);
    delete_option('ai_assistant_' . $key);
}

// Require Core Modules
require_once CRESCELO_PLUGIN_DIR . 'includes/class-crescelo-client.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-site-scanner.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-wizard-controller.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-live-api.php';
require_once CRESCELO_PLUGIN_DIR . 'includes/class-sync-hooks.php';

class Crescelo_AI_Assistant {

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

        // WordPress Actions & Filters
        add_action('init', [$this, 'load_textdomain']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_init', [$this, 'handle_crescelo_actions']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_widget']);
        add_filter('script_loader_tag', [$this, 'filter_widget_script_tag'], 10, 3);
        add_action('admin_notices', [$this, 'render_admin_notices']);
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_action_links']);
    }

    public function load_textdomain() {
        load_plugin_textdomain('crescelo', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function add_action_links($links) {
        $settings_link = '<a href="' . esc_url(admin_url('admin.php?page=crescelo')) . '">' . esc_html__('Settings', 'crescelo') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    public function add_admin_menu() {
        add_menu_page(
            esc_html__('Crescelo AI Assistant & Knowledge Scraper', 'crescelo'),
            esc_html__('Crescelo AI', 'crescelo'),
            'manage_options',
            'crescelo',
            [$this, 'render_admin_page'],
            'dashicons-format-chat',
            58
        );
    }

    public function register_settings() {
        $settings = [
            'crescelo_host_url'                 => ['type' => 'string',  'sanitize' => 'esc_url_raw', 'default' => CRESCELO_DEFAULT_HOST],
            'crescelo_id'                       => ['type' => 'string',  'sanitize' => 'sanitize_text_field', 'default' => ''],
            'crescelo_api_key'                  => ['type' => 'string',  'sanitize' => 'sanitize_text_field', 'default' => ''],
            'crescelo_site_secret'              => ['type' => 'string',  'sanitize' => 'sanitize_text_field', 'default' => ''],
            'crescelo_account_email'            => ['type' => 'string',  'sanitize' => 'sanitize_email', 'default' => ''],
            'crescelo_assistant_name'           => ['type' => 'string',  'sanitize' => 'sanitize_text_field', 'default' => ''],
            'crescelo_connected_at'              => ['type' => 'string',  'sanitize' => 'sanitize_text_field', 'default' => ''],
            'crescelo_enabled'                   => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => true],
            'crescelo_wizard_completed'          => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => false],
            'crescelo_allowed_post_types'       => ['type' => 'array',   'sanitize' => [$this, 'sanitize_post_types_array'], 'default' => ['page', 'post', 'product']],
            'crescelo_scrape_include_meta'       => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => true],
            'crescelo_scrape_include_taxonomies' => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => true],
            'crescelo_scrape_include_excerpt'    => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => true],
            'crescelo_scrape_method'             => ['type' => 'string',  'sanitize' => 'sanitize_key', 'default' => 'db'],
            'crescelo_batch_size'                => ['type' => 'integer', 'sanitize' => 'absint', 'default' => 15],
            'crescelo_auto_sync'                 => ['type' => 'boolean', 'sanitize' => 'rest_sanitize_boolean', 'default' => true],
        ];

        foreach ($settings as $opt_name => $meta) {
            register_setting('crescelo_options', $opt_name, [
                'type'              => $meta['type'],
                'sanitize_callback' => $meta['sanitize'],
                'default'           => $meta['default'],
            ]);
        }
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
        if (!isset($_GET['page']) || !in_array($_GET['page'], ['crescelo', 'ai-business-assistant'], true)) {
            return;
        }

        if (!current_user_can('manage_options')) {
            return;
        }

        $action = isset($_GET['crescelo_action']) ? sanitize_key(wp_unslash($_GET['crescelo_action'])) : '';

        // 1. OAuth Callback from Crescelo Cloud
        if ($action === 'callback') {
            $state = isset($_GET['state']) ? sanitize_text_field(wp_unslash($_GET['state'])) : '';
            $saved_state = get_transient('crescelo_oauth_state_' . $state);

            if (empty($state) || !$saved_state) {
                set_transient('crescelo_admin_error', esc_html__('Connection failed: Expired or invalid state token. Please try again.', 'crescelo'), 30);
                wp_safe_redirect(admin_url('admin.php?page=crescelo'));
                exit;
            }

            // Invalidate single-use state token
            delete_transient('crescelo_oauth_state_' . $state);

            $assistant_id   = isset($_GET['assistant_id']) ? sanitize_text_field(wp_unslash($_GET['assistant_id'])) : '';
            $assistant_name = isset($_GET['assistant_name']) ? sanitize_text_field(wp_unslash($_GET['assistant_name'])) : esc_html__('AI Assistant', 'crescelo');
            $api_key        = isset($_GET['api_key']) ? sanitize_text_field(wp_unslash($_GET['api_key'])) : '';
            $site_secret    = isset($_GET['site_secret']) ? sanitize_text_field(wp_unslash($_GET['site_secret'])) : '';
            $raw_host       = isset($_GET['host_url']) ? esc_url_raw(wp_unslash($_GET['host_url'])) : crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
            $account_email  = isset($_GET['account_email']) ? sanitize_email(wp_unslash($_GET['account_email'])) : '';

            if (empty($assistant_id)) {
                set_transient('crescelo_admin_error', esc_html__('Connection failed: Missing Assistant ID in response.', 'crescelo'), 30);
                wp_safe_redirect(admin_url('admin.php?page=crescelo'));
                exit;
            }

            crescelo_update_option('id', $assistant_id);
            crescelo_update_option('assistant_name', $assistant_name);
            crescelo_update_option('api_key', $api_key);
            crescelo_update_option('site_secret', $site_secret);
            crescelo_update_option('host_url', $raw_host);
            crescelo_update_option('account_email', $account_email);
            crescelo_update_option('connected_at', current_time('mysql'));
            crescelo_update_option('enabled', true);

            // Keep legacy options synchronized for backward compatibility
            update_option('ai_assistant_id', $assistant_id);
            update_option('ai_assistant_assistant_name', $assistant_name);
            update_option('ai_assistant_api_key', $api_key);
            update_option('ai_assistant_site_secret', $site_secret);
            update_option('ai_assistant_host_url', $raw_host);
            update_option('ai_assistant_account_email', $account_email);
            update_option('ai_assistant_connected_at', current_time('mysql'));
            update_option('ai_assistant_enabled', true);

            set_transient('crescelo_admin_notice', esc_html__('Successfully connected your WordPress site to Crescelo AI Assistant!', 'crescelo'), 30);
            wp_safe_redirect(admin_url('admin.php?page=crescelo'));
            exit;
        }

        // 2. Disconnect Action
        if ($action === 'disconnect') {
            check_admin_referer('crescelo_disconnect_nonce');

            crescelo_delete_option('id');
            crescelo_delete_option('assistant_name');
            crescelo_delete_option('api_key');
            crescelo_delete_option('site_secret');
            crescelo_delete_option('account_email');
            crescelo_delete_option('connected_at');

            set_transient('crescelo_admin_notice', esc_html__('Disconnected from Crescelo. You can reconnect anytime.', 'crescelo'), 30);
            wp_safe_redirect(admin_url('admin.php?page=crescelo'));
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
        if (strpos($hook, 'crescelo') === false && strpos($hook, 'ai-business-assistant') === false) {
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

        $return_url = admin_url('admin.php?page=crescelo');
        $host_url   = esc_url_raw(crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST));
        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));

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
            'assistantName'      => sanitize_text_field(crescelo_get_option('assistant_name', '')),
            'accountEmail'       => sanitize_email(crescelo_get_option('account_email', '')),
            'connectedAt'        => sanitize_text_field(crescelo_get_option('connected_at', '')),
            'allowedPostTypes'   => $allowed_post_types,
            'availablePostTypes' => $available_post_types,
            'batchSize'          => (int) crescelo_get_option('batch_size', 15),
        ]);
    }

    /**
     * Enqueue the public AI chat widget in compliance with WordPress.org standards.
     */
    public function enqueue_public_widget() {
        if (is_admin()) {
            return;
        }

        $enabled = (bool) crescelo_get_option('enabled', true);
        if (!$enabled) {
            return;
        }

        $raw_host = crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
        $clean_host = esc_url_raw(untrailingslashit($raw_host));
        $parsed = wp_parse_url($clean_host);

        // Security check: Must be a valid HTTP/HTTPS URL
        if (empty($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
            return;
        }

        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));
        if (empty($assistant_id) || !preg_match('/^[a-zA-Z0-9_\-]+$/', $assistant_id)) {
            return;
        }

        $widget_src = $clean_host . '/widget.js';
        wp_enqueue_script(
            'crescelo-widget',
            $widget_src,
            [],
            CRESCELO_PLUGIN_VERSION,
            true
        );
    }

    /**
     * Add data-assistant attribute and defer loading to the enqueued widget script tag.
     */
    public function filter_widget_script_tag($tag, $handle, $src) {
        if ('crescelo-widget' !== $handle) {
            return $tag;
        }

        $assistant_id = sanitize_text_field(crescelo_get_option('id', ''));
        if (empty($assistant_id)) {
            return $tag;
        }

        return sprintf(
            '<script src="%1$s" data-assistant="%2$s" defer id="crescelo-widget-js"></script>' . "\n",
            esc_url($src),
            esc_attr($assistant_id)
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'crescelo'), 403);
        }

        $completed = (bool) crescelo_get_option('wizard_completed', false);
        $force_wizard = isset($_GET['view']) && sanitize_key(wp_unslash($_GET['view'])) === 'wizard';

        if (!$completed || $force_wizard) {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-wizard.php';
        } else {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-settings.php';
        }
    }
}

new Crescelo_AI_Assistant();
