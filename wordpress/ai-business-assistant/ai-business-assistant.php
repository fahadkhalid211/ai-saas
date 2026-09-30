<?php
/**
 * Plugin Name: Crescelo AI Business Assistant & WooCommerce Sales Concierge
 * Plugin URI: https://crescelo.com
 * Description: Connect your website to an intelligent AI chatbot that reads your website, WooCommerce catalog, and documents with an automated 5-step setup wizard.
 * Version: 2.0.0
 * Author: Crescelo
 * Author URI: https://crescelo.com
 * License: GPL-2.0+
 * Text Domain: ai-business-assistant
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CRESCELO_PLUGIN_VERSION', '2.0.0');
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
            'Crescelo AI Assistant',
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
            [],
            CRESCELO_PLUGIN_VERSION,
            true
        );
    }

    public function inject_widget_script() {
        $enabled = get_option('ai_assistant_enabled', true);
        if (!$enabled) return;

        $host_url     = untrailingslashit(get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $assistant_id = get_option('ai_assistant_id', '');

        if (empty($assistant_id)) return;

        $widget_src = esc_url($host_url . '/widget.js');
        $ast_id     = esc_attr($assistant_id);

        echo "\n<!-- Crescelo AI Business Assistant Widget -->\n";
        echo "<script src=\"{$widget_src}\" data-assistant=\"{$ast_id}\" defer></script>\n";
        echo "<!-- /Crescelo AI Business Assistant Widget -->\n";
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) return;

        $completed = get_option('ai_assistant_wizard_completed', false);
        $force_wizard = isset($_GET['view']) && $_GET['view'] === 'wizard';

        if (!$completed || $force_wizard) {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-wizard.php';
        } else {
            include CRESCELO_PLUGIN_DIR . 'templates/admin-settings.php';
        }
    }
}

new AIBusinessAssistantPlugin();
