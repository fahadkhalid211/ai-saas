<?php
/**
 * Admin Settings / Dashboard View (After Wizard Completion)
 */

if (!defined('ABSPATH')) {
    exit;
}

$host_url     = get_option('ai_assistant_host_url', 'http://localhost:3000');
$assistant_id = get_option('ai_assistant_id', 'demo-assistant');
$enabled      = get_option('ai_assistant_enabled', true);
$site_secret  = get_option('ai_assistant_site_secret', '');
$nonce        = wp_create_nonce('crescelo_wizard_nonce');
?>

<div class="wrap crescelo-wizard-wrap">
    <div class="crescelo-header">
        <div class="crescelo-brand">
            <div class="crescelo-logo-icon">AI</div>
            <div>
                <h1>Crescelo AI Assistant Dashboard</h1>
                <p>Manage your website's active AI chatbot, knowledge base synchronization, and commerce settings.</p>
            </div>
        </div>
        <div class="crescelo-header-status">
            <?php if ($enabled): ?>
                <span class="status-pill status-ready">● Widget Active</span>
            <?php else: ?>
                <span class="status-pill" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca;">● Widget Paused</span>
            <?php endif; ?>
        </div>
    </div>

    <div class="crescelo-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <div>
                <h2 style="font-size: 18px; margin: 0 0 4px 0;">Active Connection Overview</h2>
                <div style="font-size: 13px; color: #64748b;">
                    Connected to SaaS Engine: <code><?php echo esc_html($host_url); ?></code>
                </div>
            </div>
            <div>
                <a href="<?php echo esc_url(add_query_arg(['page' => 'ai-business-assistant', 'view' => 'wizard'], admin_url('admin.php'))); ?>" class="btn btn-secondary" style="text-decoration:none;">
                    Re-run Setup Wizard &rarr;
                </a>
            </div>
        </div>

        <form method="post" action="options.php">
            <?php settings_fields('ai_assistant_options'); ?>
            <?php do_settings_sections('ai_assistant_options'); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="ai_assistant_enabled">Public Chat Widget</label></th>
                    <td>
                        <label class="switch">
                            <input name="ai_assistant_enabled" type="checkbox" id="ai_assistant_enabled" value="1" <?php checked(1, $enabled); ?> />
                            <span class="slider"></span>
                        </label>
                        <p class="description" style="margin-top:6px;">Display the floating AI chat launcher on public visitor pages.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label for="ai_assistant_id">Assistant ID</label></th>
                    <td>
                        <input name="ai_assistant_id" type="text" id="ai_assistant_id" value="<?php echo esc_attr($assistant_id); ?>" class="regular-text" />
                        <p class="description">Identifier of the provisioned AI agent in Crescelo.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row"><label for="ai_assistant_host_url">Crescelo Backend Host</label></th>
                    <td>
                        <input name="ai_assistant_host_url" type="url" id="ai_assistant_host_url" value="<?php echo esc_attr($host_url); ?>" class="regular-text" />
                        <p class="description">URL of the Crescelo Next.js service (e.g., <code>https://app.crescelo.com</code> or <code>http://localhost:3000</code>).</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">Live Grounding REST API</th>
                    <td>
                        <code style="display:inline-block; padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; font-size:12px;">
                            <?php echo esc_url(rest_url('crescelo/v1/stock-check')); ?>
                        </code>
                        <p class="description" style="margin-top:4px;">Used by Crescelo to query live stock and pricing in real time.</p>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                <?php submit_button('Save Settings', 'primary', 'submit', false); ?>
            </div>
        </form>
    </div>
</div>
