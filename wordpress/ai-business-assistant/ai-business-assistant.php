<?php
/**
 * Plugin Name: AI Business Assistant & Knowledge Chatbot
 * Plugin URI: https://github.com/fahadkhalid211/ai-saas
 * Description: Connect your website to your custom AI Business Assistant trained on your business documents (PDF, CSV, JSON, TXT).
 * Version: 1.0.0
 * Author: AI Assistant Engine
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

class AIBusinessAssistantPlugin {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_footer', [$this, 'inject_widget_script']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'AI Assistant Settings',
            'AI Assistant',
            'manage_options',
            'ai-business-assistant',
            [$this, 'render_admin_page'],
            'dashicons-format-chat',
            90
        );
    }

    public function register_settings() {
        register_setting('ai_assistant_options', 'ai_assistant_host_url', [
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'http://localhost:3000'
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_id', [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'demo-assistant'
        ]);
        register_setting('ai_assistant_options', 'ai_assistant_enabled', [
            'type' => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default' => true
        ]);
    }

    public function inject_widget_script() {
        $enabled = get_option('ai_assistant_enabled', true);
        if (!$enabled) return;

        $host_url = untrailingslashit(get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $assistant_id = get_option('ai_assistant_id', 'demo-assistant');

        if (empty($assistant_id)) return;

        $widget_src = esc_url($host_url . '/widget.js');
        $ast_id = esc_attr($assistant_id);

        echo "\n<!-- AI Business Assistant Widget -->\n";
        echo "<script src=\"{$widget_src}\" data-assistant=\"{$ast_id}\" defer></script>\n";
        echo "<!-- /AI Business Assistant Widget -->\n";
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) return;

        $host_url = get_option('ai_assistant_host_url', 'http://localhost:3000');
        $assistant_id = get_option('ai_assistant_id', 'demo-assistant');
        $enabled = get_option('ai_assistant_enabled', true);
        ?>
        <div class="wrap" style="max-width: 800px; margin-top: 24px;">
            <div style="background: #fff; padding: 24px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <h1 style="display: flex; align-items: center; gap: 10px; font-size: 24px; margin-bottom: 8px;">
                    <span style="background: #2563eb; color: #fff; border-radius: 8px; padding: 4px 10px; font-size: 16px;">AI</span>
                    AI Business Assistant Connector
                </h1>
                <p style="color: #64748b; margin-bottom: 24px;">Connect this WordPress website to your trained AI knowledge chatbot engine with 1 click.</p>

                <form method="post" action="options.php">
                    <?php settings_fields('ai_assistant_options'); ?>
                    <?php do_settings_sections('ai_assistant_options'); ?>

                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row"><label for="ai_assistant_enabled">Enable Chatbot Widget</label></th>
                            <td>
                                <input name="ai_assistant_enabled" type="checkbox" id="ai_assistant_enabled" value="1" <?php checked(1, $enabled); ?> />
                                <span class="description">Display the AI chat bubble on all public pages</span>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row"><label for="ai_assistant_host_url">Assistant Server URL</label></th>
                            <td>
                                <input name="ai_assistant_host_url" type="url" id="ai_assistant_host_url" value="<?php echo esc_attr($host_url); ?>" class="regular-text" placeholder="https://your-ai-dashboard.com" />
                                <p class="description">URL where your AI Assistant backend is hosted (e.g. <code>http://localhost:3000</code> or your live domain).</p>
                            </td>
                        </tr>

                        <tr>
                            <th scope="row"><label for="ai_assistant_id">Assistant ID / License Key</label></th>
                            <td>
                                <input name="ai_assistant_id" type="text" id="ai_assistant_id" value="<?php echo esc_attr($assistant_id); ?>" class="regular-text" placeholder="ast_..." />
                                <p class="description">Copy your Assistant ID from your AI Dashboard.</p>
                            </td>
                        </tr>
                    </table>

                    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                        <?php submit_button('Save Configuration', 'primary'); ?>
                    </div>
                </form>

                <div style="margin-top: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <h3 style="margin-top: 0; font-size: 14px; color: #1e293b;">Connection Verification</h3>
                    <p style="font-size: 13px; color: #475569; margin: 4px 0 12px 0;">Your widget script tag will be loaded as:</p>
                    <code style="display: block; background: #0f172a; color: #38bdf8; padding: 10px 14px; border-radius: 6px; font-size: 12px; overflow-x: auto;">
                        &lt;script src="<?php echo esc_url(untrailingslashit($host_url) . '/widget.js'); ?>" data-assistant="<?php echo esc_attr($assistant_id); ?>" defer&gt;&lt;/script&gt;
                    </code>
                </div>
            </div>
        </div>
        <?php
    }
}

new AIBusinessAssistantPlugin();
