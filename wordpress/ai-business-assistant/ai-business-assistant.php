<?php
/**
 * Plugin Name: Crescelo AI Business Assistant & Knowledge Scraper
 * Plugin URI: https://crescelo.com
 * Description: Connect your website to an intelligent AI chatbot that scrapes your entire website (posts, pages, WooCommerce products, custom post types, and documents) into an active vector knowledge base with an automated setup wizard and real-time synchronization.
 * Version: 2.1.0
 * Author: Crescelo
 * Author URI: https://crescelo.com
 * License: GPL-2.0+
 * Text Domain: ai-business-assistant
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CRESCELO_PLUGIN_VERSION', '2.1.0');
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
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_footer', [$this, 'inject_widget_script']);
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

        $allowed_post_types = $this->scanner->get_allowed_post_types();
        $available_post_types = $this->scanner->get_available_post_types();

        wp_localize_script('crescelo-wizard-js', 'CresceloWizardData', [
            'ajaxUrl'            => admin_url('admin-ajax.php'),
            'nonce'              => wp_create_nonce('crescelo_wizard_nonce'),
            'hostUrl'            => esc_url_raw(get_option('ai_assistant_host_url', 'http://localhost:3000')),
            'currentAssistantId' => sanitize_text_field(get_option('ai_assistant_id', '')),
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
