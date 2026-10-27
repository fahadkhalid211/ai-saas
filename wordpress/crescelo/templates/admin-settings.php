<?php
/**
 * Admin Settings / Dashboard View
 *
 * Tabbed Crescelo Branded Interface:
 * 1. Connection & Account (1-Click OAuth Connect + Connected Details Card + Manual API Key option)
 * 2. Knowledge Base Scraper (Allowed Post Types Grid + 1-Click Site Scraper Engine)
 * 3. Chat Widget & Actions (Widget Controls + Live Grounding REST Endpoint + Chat Preview)
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

$scanner = new Crescelo_Site_Scanner();
$available_post_types = $scanner->get_available_post_types();
$allowed_post_types   = $scanner->get_allowed_post_types();

$host_url       = crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
$assistant_id   = crescelo_get_option('id', '');
$assistant_name = crescelo_get_option('assistant_name', '');
$account_email  = crescelo_get_option('account_email', '');
$connected_at   = crescelo_get_option('connected_at', '');
$enabled        = (bool) crescelo_get_option('enabled', true);
$api_key        = crescelo_get_option('api_key', '');
$site_secret    = crescelo_get_option('site_secret', '');
$is_connected   = !empty($assistant_id);

$nonce = wp_create_nonce('crescelo_wizard_nonce');

// One-click OAuth connect URL
$oauth_state = wp_create_nonce('crescelo_oauth_' . get_current_user_id() . '_' . wp_rand());
set_transient('crescelo_oauth_state_' . $oauth_state, home_url(), 900); // 15 mins

$return_url = admin_url('admin.php?page=crescelo');
$connect_url = add_query_arg([
    'site_url'   => home_url(),
    'site_name'  => get_bloginfo('name'),
    'return_url' => $return_url,
    'state'      => $oauth_state,
], untrailingslashit($host_url) . '/connect/wordpress');

$disconnect_url = wp_nonce_url(
    admin_url('admin.php?page=crescelo&crescelo_action=disconnect'),
    'crescelo_disconnect_nonce'
);

// Scraper settings
$include_meta       = (bool) crescelo_get_option('scrape_include_meta', true);
$include_taxonomies = (bool) crescelo_get_option('scrape_include_taxonomies', true);
$include_excerpt    = (bool) crescelo_get_option('scrape_include_excerpt', true);
$scrape_method      = sanitize_key(crescelo_get_option('scrape_method', 'db'));
$batch_size         = (int) crescelo_get_option('batch_size', 15);
$auto_sync          = (bool) crescelo_get_option('auto_sync', true);

$last_scraped        = crescelo_get_option('last_scraped', '');
$scrape_stats        = crescelo_get_option('scrape_stats', []);
$total_scraped_items  = isset($scrape_stats['total_items']) ? (int) $scrape_stats['total_items'] : 0;
$total_scraped_chunks = isset($scrape_stats['total_chunks']) ? (int) $scrape_stats['total_chunks'] : 0;
?>

<div class="wrap crescelo-admin-wrap">

    <!-- Top Branded Header -->
    <header class="crescelo-brand-header">
        <div class="crescelo-brand-identity">
            <div class="crescelo-brand-mark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#abff44" stroke-width="2.5" />
                    <path d="M7 12L10.5 15.5L17 8.5" stroke="#abff44" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div>
                <h1 class="crescelo-main-title"><?php esc_html_e('Crescelo AI Assistant', 'crescelo'); ?></h1>
                <p class="crescelo-sub-title"><?php esc_html_e('Intelligent AI Chatbot & Website Knowledge Base Scraper', 'crescelo'); ?></p>
            </div>
        </div>

        <div class="crescelo-header-actions">
            <?php if ($is_connected): ?>
                <div class="crescelo-status-tag status-connected">
                    <span class="live-dot-lime"></span>
                    <span><?php esc_html_e('Connected:', 'crescelo'); ?> <strong><?php echo esc_html($assistant_name ? $assistant_name : $assistant_id); ?></strong></span>
                </div>
            <?php else: ?>
                <div class="crescelo-status-tag status-disconnected">
                    <span class="live-dot-gray"></span>
                    <span><?php esc_html_e('Not Connected', 'crescelo'); ?></span>
                </div>
            <?php endif; ?>
        </div>
    </header>

    <!-- Crescelo Branded Tabs Navigation -->
    <nav class="crescelo-nav-tabs" role="tablist">
        <button type="button" class="crescelo-tab-btn active" data-tab="tab-connection" role="tab" aria-selected="true">
            <span class="tab-icon">🔗</span>
            <span class="tab-text"><?php esc_html_e('Connection & Account', 'crescelo'); ?></span>
        </button>
        <button type="button" class="crescelo-tab-btn" data-tab="tab-scraper" role="tab" aria-selected="false">
            <span class="tab-icon">🕷️</span>
            <span class="tab-text"><?php esc_html_e('Knowledge Base Scraper', 'crescelo'); ?></span>
            <span class="tab-badge" id="tab-pt-count"><?php echo count($allowed_post_types); ?></span>
        </button>
        <button type="button" class="crescelo-tab-btn" data-tab="tab-widget" role="tab" aria-selected="false">
            <span class="tab-icon">💬</span>
            <span class="tab-text"><?php esc_html_e('Chat Widget & Actions', 'crescelo'); ?></span>
        </button>
    </nav>

    <!-- Tab Contents Container -->
    <div class="crescelo-tab-content-container">

        <!-- ======================================================== -->
        <!-- TAB 1: CONNECTION & ACCOUNT                              -->
        <!-- ======================================================== -->
        <section id="tab-connection" class="crescelo-tab-pane active" role="tabpanel">

            <?php if ($is_connected): ?>
                <!-- CONNECTED STATE: Rich Connection Details Card -->
                <div class="crescelo-connected-card">
                    <div class="connected-card-header">
                        <div class="connected-status-pill">
                            <span class="pulse-lime-ring"></span>
                            <span><?php esc_html_e('Active Connection', 'crescelo'); ?></span>
                        </div>
                        <div class="connected-header-right">
                            <span class="server-pill"><?php echo esc_html(sprintf(__('Server: %s', 'crescelo'), $host_url)); ?></span>
                        </div>
                    </div>

                    <div class="connected-details-grid">
                        <div class="detail-box">
                            <span class="detail-label"><?php esc_html_e('AI Assistant Name', 'crescelo'); ?></span>
                            <span class="detail-val highlight"><?php echo esc_html($assistant_name ? $assistant_name : __('AI Business Assistant', 'crescelo')); ?></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label"><?php esc_html_e('Assistant ID', 'crescelo'); ?></span>
                            <span class="detail-val mono"><code><?php echo esc_html($assistant_id); ?></code></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label"><?php esc_html_e('Connected Account', 'crescelo'); ?></span>
                            <span class="detail-val"><?php echo esc_html($account_email ? $account_email : __('Crescelo Authorized User', 'crescelo')); ?></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label"><?php esc_html_e('Connection Date', 'crescelo'); ?></span>
                            <span class="detail-val"><?php echo esc_html($connected_at ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($connected_at)) : __('Active', 'crescelo')); ?></span>
                        </div>
                    </div>

                    <!-- Connection Action Buttons -->
                    <div class="connected-actions-row">
                        <div class="actions-left">
                            <button type="button" class="btn-crescelo-lime" id="btn-test-connection">
                                <span><?php esc_html_e('⚡ Test Connection Health', 'crescelo'); ?></span>
                            </button>
                            <span id="test-connection-status" class="test-status-msg" style="display:none;"></span>
                        </div>
                        <div class="actions-right">
                            <a href="<?php echo esc_url($connect_url); ?>" class="btn-crescelo-secondary" title="<?php esc_attr_e('Switch to another assistant or refresh permissions', 'crescelo'); ?>">
                                <span><?php esc_html_e('Switch Assistant', 'crescelo'); ?></span>
                            </a>
                            <a href="<?php echo esc_url($disconnect_url); ?>" class="btn-crescelo-danger" id="btn-disconnect-link" onclick="return confirm('<?php echo esc_js(__('Are you sure you want to disconnect this WordPress site from Crescelo? Your chat widget will be deactivated until you reconnect.', 'crescelo')); ?>');">
                                <span><?php esc_html_e('Disconnect Site', 'crescelo'); ?></span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Grounding & Store Information Card -->
                <div class="crescelo-subcard" style="margin-top: 24px;">
                    <div class="subcard-header">
                        <h3><?php esc_html_e('Real-Time Live Grounding Endpoint', 'crescelo'); ?></h3>
                        <span class="badge-status-ok"><?php esc_html_e('REST API Active', 'crescelo'); ?></span>
                    </div>
                    <p class="subcard-desc">
                        <?php esc_html_e('Crescelo securely queries this endpoint in real time to fetch live WooCommerce product pricing, real-time stock levels, and store details during customer conversations.', 'crescelo'); ?>
                    </p>
                    <div class="code-snippet-box">
                        <code><?php echo esc_url(rest_url('crescelo/v1/stock-check')); ?></code>
                        <span class="protected-pill"><?php esc_html_e('🔒 Protected by Crescelo Key', 'crescelo'); ?></span>
                    </div>
                </div>

            <?php else: ?>
                <!-- DISCONNECTED STATE: 1-Click Login / Connect + Manual API Key Option -->
                <div class="crescelo-hero-connect-card">
                    <div class="hero-connect-inner">
                        <div class="hero-badge"><?php esc_html_e('One-Click Setup', 'crescelo'); ?></div>
                        <h2 class="hero-title"><?php esc_html_e('Connect your WordPress Site to Crescelo', 'crescelo'); ?></h2>
                        <p class="hero-subtitle">
                            <?php esc_html_e('No complicated configuration required. Click the button below to log in to your Crescelo account and automatically connect your AI Assistant.', 'crescelo'); ?>
                        </p>

                        <div class="hero-cta-wrap">
                            <a href="<?php echo esc_url($connect_url); ?>" class="btn-crescelo-login-cta" id="btn-primary-oauth-login">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M15 12H3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span><?php esc_html_e('Log In & Connect with Crescelo', 'crescelo'); ?></span>
                            </a>
                        </div>

                        <div class="hero-features-list">
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span><?php esc_html_e('Automatic Assistant Selection or Creation', 'crescelo'); ?></span>
                            </div>
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span><?php esc_html_e('Zero manual server or key configuration', 'crescelo'); ?></span>
                            </div>
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span><?php esc_html_e('Encrypted end-to-end handshake', 'crescelo'); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div class="crescelo-divider">
                    <span><?php esc_html_e('OR CONNECT MANUALLY WITH API KEY', 'crescelo'); ?></span>
                </div>

                <!-- Manual Connection via API Key Card -->
                <div class="crescelo-subcard">
                    <div class="subcard-header">
                        <div>
                            <h3 style="margin:0 0 4px 0;"><?php esc_html_e('Manual Connection via API Key', 'crescelo'); ?></h3>
                            <p class="subcard-desc" style="margin:0;">
                                <?php esc_html_e('Prefer connecting with a key? Generate a WordPress connector key from your Crescelo Assistant and paste it here.', 'crescelo'); ?>
                            </p>
                        </div>
                    </div>

                    <div class="manual-steps-box">
                        <div class="manual-step-item">
                            <span class="step-num">1</span>
                            <span><?php esc_html_e('Log in to Crescelo and open your Assistant Settings', 'crescelo'); ?></span>
                        </div>
                        <div class="manual-step-item">
                            <span class="step-num">2</span>
                            <span><?php esc_html_e('Go to WordPress Integration → Generate Connector Key', 'crescelo'); ?></span>
                        </div>
                        <div class="manual-step-item">
                            <span class="step-num">3</span>
                            <span><?php esc_html_e('Paste the generated cres_wp_... API key below', 'crescelo'); ?></span>
                        </div>
                    </div>

                    <div class="manual-form-grid" style="margin-top: 18px;">
                        <div>
                            <label for="input-manual-api-key" class="field-label"><?php esc_html_e('WordPress Connector API Key', 'crescelo'); ?></label>
                            <div class="input-with-toggle">
                                <input type="password" id="input-manual-api-key" class="crescelo-input" placeholder="cres_wp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" autocomplete="off" />
                                <button type="button" class="btn-toggle-secret" id="btn-toggle-key-visibility" title="<?php esc_attr_e('Show/Hide Key', 'crescelo'); ?>">👁️</button>
                            </div>
                            <span class="field-help"><?php esc_html_e('Your secure assistant webhook secret or connector key.', 'crescelo'); ?></span>
                        </div>

                        <!-- Optional server URL toggle -->
                        <details class="server-config-details" style="margin-top: 14px;">
                            <summary class="details-summary"><?php esc_html_e('Advanced Server Settings (Custom Host / Staging)', 'crescelo'); ?></summary>
                            <div style="margin-top: 10px;">
                                <label for="input-manual-host-url" class="field-label"><?php esc_html_e('Crescelo Server URL', 'crescelo'); ?></label>
                                <input type="url" id="input-manual-host-url" class="crescelo-input" value="<?php echo esc_attr($host_url); ?>" placeholder="https://www.crescelo.com" />
                                <span class="field-help"><?php esc_html_e('Defaults to your active Crescelo host. Change only for custom instances.', 'crescelo'); ?></span>
                            </div>
                        </details>

                        <div style="margin-top: 20px; display:flex; align-items:center; gap:14px;">
                            <button type="button" class="btn-crescelo-lime" id="btn-submit-manual-key">
                                <span><?php esc_html_e('Verify & Connect via Key', 'crescelo'); ?></span>
                            </button>
                            <span id="manual-key-feedback" class="manual-feedback-text" style="display:none;"></span>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

        </section>


        <!-- ======================================================== -->
        <!-- TAB 2: KNOWLEDGE BASE SCRAPER                            -->
        <!-- ======================================================== -->
        <section id="tab-scraper" class="crescelo-tab-pane" role="tabpanel">

            <form method="post" action="options.php" id="crescelo-scraper-form">
                <?php settings_fields('crescelo_options'); ?>
                <?php do_settings_sections('crescelo_options'); ?>

                <!-- Hidden inputs to preserve non-scraper fields -->
                <input type="hidden" name="crescelo_host_url" value="<?php echo esc_attr($host_url); ?>" />
                <input type="hidden" name="crescelo_id" value="<?php echo esc_attr($assistant_id); ?>" />
                <input type="hidden" name="crescelo_api_key" value="<?php echo esc_attr($api_key); ?>" />
                <input type="hidden" name="crescelo_site_secret" value="<?php echo esc_attr($site_secret); ?>" />
                <input type="hidden" name="crescelo_account_email" value="<?php echo esc_attr($account_email); ?>" />
                <input type="hidden" name="crescelo_assistant_name" value="<?php echo esc_attr($assistant_name); ?>" />
                <input type="hidden" name="crescelo_connected_at" value="<?php echo esc_attr($connected_at); ?>" />
                <input type="hidden" name="crescelo_enabled" value="<?php echo $enabled ? '1' : '0'; ?>" />

                <!-- Allowed Post Types Card -->
                <div class="crescelo-card">
                    <div class="card-header-flex">
                        <div>
                            <h2 class="card-section-title"><?php esc_html_e('Allowed Post Types for Scraping', 'crescelo'); ?></h2>
                            <p class="card-section-desc">
                                <?php esc_html_e('Choose which post types from your WordPress site should be vectorized into your Crescelo AI Knowledge Base.', 'crescelo'); ?>
                            </p>
                        </div>
                        <div>
                            <span class="count-badge has-items" id="total-selected-indicator">
                                <?php echo esc_html(sprintf(__('%d types allowed', 'crescelo'), count($allowed_post_types))); ?>
                            </span>
                        </div>
                    </div>

                    <div class="pt-quick-actions">
                        <button type="button" class="btn-text-action" id="action-select-all-pts"><?php esc_html_e('Select All', 'crescelo'); ?></button>
                        <span class="action-sep">|</span>
                        <button type="button" class="btn-text-action" id="action-select-defaults-pts"><?php esc_html_e('Defaults (Pages, Posts, Products)', 'crescelo'); ?></button>
                        <span class="action-sep">|</span>
                        <button type="button" class="btn-text-action" id="action-deselect-all-pts"><?php esc_html_e('Deselect All', 'crescelo'); ?></button>
                    </div>

                    <!-- Dynamic Post Types Grid -->
                    <div class="post-types-grid">
                        <?php foreach ($available_post_types as $slug => $pt): 
                            $is_checked = in_array($slug, $allowed_post_types, true);
                        ?>
                            <label class="post-type-card <?php echo $is_checked ? 'selected' : ''; ?>">
                                <input type="checkbox" name="crescelo_allowed_post_types[]" value="<?php echo esc_attr($slug); ?>" <?php checked(true, $is_checked); ?> class="pt-checkbox" />
                                <div class="pt-details">
                                    <div class="pt-header-row">
                                        <span class="pt-title"><?php echo esc_html($pt['label']); ?></span>
                                        <span class="count-badge <?php echo $pt['count'] > 0 ? 'has-items' : ''; ?>">
                                            <?php echo esc_html($pt['count']); ?> <?php echo esc_html(_n('item', 'items', $pt['count'], 'crescelo')); ?>
                                        </span>
                                    </div>
                                    <div class="pt-slug"><?php esc_html_e('Type:', 'crescelo'); ?> <code><?php echo esc_html($slug); ?></code></div>

                                    <?php if (!empty($pt['taxonomies'])): ?>
                                        <div class="pt-taxonomies">
                                            <?php foreach (array_slice($pt['taxonomies'], 0, 3) as $tax): ?>
                                                <span class="badge-tax"><?php echo esc_html($tax['label']); ?></span>
                                            <?php endforeach; ?>
                                            <?php if (count($pt['taxonomies']) > 3): ?>
                                                <span class="badge-tax">+<?php echo count($pt['taxonomies']) - 3; ?></span>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </label>
                        <?php endforeach; ?>
                    </div>

                    <!-- Scraper Ingestion Configuration Options -->
                    <div class="scraper-options-panel">
                        <h3 class="panel-subtitle"><?php esc_html_e('Scraper Ingestion Options', 'crescelo'); ?></h3>
                        
                        <div class="options-grid-2">
                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="crescelo_scrape_include_meta" value="1" <?php checked(true, $include_meta); ?> id="opt-scrape-include-meta" />
                                <span><strong><?php esc_html_e('Include Custom Fields & Meta', 'crescelo'); ?></strong> <?php esc_html_e('(ACF, SKU, pricing, specs)', 'crescelo'); ?></span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="crescelo_scrape_include_taxonomies" value="1" <?php checked(true, $include_taxonomies); ?> id="opt-scrape-include-tax" />
                                <span><strong><?php esc_html_e('Include Taxonomies & Categories', 'crescelo'); ?></strong> <?php esc_html_e('(Tags, terms, hierarchies)', 'crescelo'); ?></span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="crescelo_scrape_include_excerpt" value="1" <?php checked(true, $include_excerpt); ?> id="opt-scrape-include-excerpt" />
                                <span><strong><?php esc_html_e('Include Excerpt & Summary', 'crescelo'); ?></strong></span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="crescelo_auto_sync" value="1" <?php checked(true, $auto_sync); ?> id="opt-auto-sync" />
                                <span><strong><?php esc_html_e('Real-Time Auto-Sync', 'crescelo'); ?></strong> <?php esc_html_e('(Sync content changes when published)', 'crescelo'); ?></span>
                            </label>
                        </div>

                        <div class="options-grid-2" style="margin-top: 16px;">
                            <div>
                                <label for="crescelo_scrape_method" class="field-label"><?php esc_html_e('Content Extraction Method', 'crescelo'); ?></label>
                                <select name="crescelo_scrape_method" id="crescelo_scrape_method" class="crescelo-select">
                                    <option value="db" <?php selected('db', $scrape_method); ?>><?php esc_html_e('Clean Database Content (Fast, stripped shortcodes & blocks)', 'crescelo'); ?></option>
                                    <option value="html" <?php selected('html', $scrape_method); ?>><?php esc_html_e('Rendered HTML Scraping (Captures Elementor/Divi output)', 'crescelo'); ?></option>
                                </select>
                            </div>

                            <div>
                                <label for="crescelo_batch_size" class="field-label"><?php esc_html_e('Ingestion Batch Size', 'crescelo'); ?></label>
                                <select name="crescelo_batch_size" id="crescelo_batch_size" class="crescelo-select">
                                    <option value="10" <?php selected(10, $batch_size); ?>><?php esc_html_e('10 items per batch', 'crescelo'); ?></option>
                                    <option value="15" <?php selected(15, $batch_size); ?>><?php esc_html_e('15 items per batch (Recommended)', 'crescelo'); ?></option>
                                    <option value="25" <?php selected(25, $batch_size); ?>><?php esc_html_e('25 items per batch', 'crescelo'); ?></option>
                                    <option value="50" <?php selected(50, $batch_size); ?>><?php esc_html_e('50 items per batch (High RAM)', 'crescelo'); ?></option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-top: 20px;">
                            <?php submit_button(esc_html__('Save Scraper Settings', 'crescelo'), 'primary crescelo-btn-save', 'submit', false); ?>
                        </div>
                    </div>
                </div>
            </form>

            <!-- ONE-CLICK WEBSITE SCRAPER CARD -->
            <div class="crescelo-card scraper-engine-card" style="margin-top: 24px;">
                <div class="scraper-header-row">
                    <div>
                        <h3 class="engine-title"><?php esc_html_e('🕷️ One-Click Website Scraper', 'crescelo'); ?></h3>
                        <p class="engine-desc">
                            <?php esc_html_e('Extracts and vectorizes all allowed content directly into your active Crescelo assistant knowledge base.', 'crescelo'); ?>
                        </p>
                        <div class="scraper-stats-row">
                            <span><?php esc_html_e('Last Scraped:', 'crescelo'); ?> <strong><?php echo !empty($last_scraped) ? esc_html($last_scraped) : esc_html__('Not yet scraped', 'crescelo'); ?></strong></span>
                            <span><?php esc_html_e('Total Indexed:', 'crescelo'); ?> <strong><?php echo esc_html(sprintf(__('%d items', 'crescelo'), $total_scraped_items)); ?></strong></span>
                            <span><?php esc_html_e('Vector Chunks:', 'crescelo'); ?> <strong><?php echo esc_html($total_scraped_chunks); ?></strong></span>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn-crescelo-lime btn-lg" id="btn-start-standalone-scrape" <?php disabled(false, $is_connected); ?>>
                            <span><?php esc_html_e('🕷️ Scrape Website & Sync to Knowledge Base', 'crescelo'); ?></span>
                        </button>
                        <?php if (!$is_connected): ?>
                            <div class="muted-warning"><?php esc_html_e('Connect an assistant in Tab 1 to run scraper.', 'crescelo'); ?></div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Scraping Progress Modal / Container -->
                <div id="standalone-scraper-progress" style="display: none; margin-top: 24px;">
                    <div class="progress-container">
                        <div class="progress-bar-wrap">
                            <div class="progress-bar-fill" id="standalone-progress-fill" style="width: 0%;"></div>
                        </div>
                        <div class="progress-status-row">
                            <span id="standalone-status-label"><?php esc_html_e('Initializing site-wide extraction...', 'crescelo'); ?></span>
                            <span id="standalone-percent-label">0%</span>
                        </div>
                    </div>

                    <!-- Live Terminal Output -->
                    <div class="terminal-log" id="standalone-terminal-log">
                        <div class="log-line info"><?php esc_html_e('[INIT] Preparing scraper across selected post types...', 'crescelo'); ?></div>
                    </div>

                    <div style="margin-top: 14px; display:flex; justify-content:flex-end;">
                        <button type="button" class="btn-crescelo-danger" id="btn-cancel-standalone-scrape"><?php esc_html_e('Cancel Scraping', 'crescelo'); ?></button>
                    </div>
                </div>
            </div>

        </section>


        <!-- ======================================================== -->
        <!-- TAB 3: CHAT WIDGET & ACTIONS                             -->
        <!-- ======================================================== -->
        <section id="tab-widget" class="crescelo-tab-pane" role="tabpanel">

            <div class="crescelo-grid-2col">
                <!-- Widget Settings Form -->
                <div class="crescelo-card">
                    <h2 class="card-section-title"><?php esc_html_e('Chat Widget Configuration', 'crescelo'); ?></h2>
                    <p class="card-section-desc"><?php esc_html_e('Manage how the floating AI chatbot behaves and appears on your site.', 'crescelo'); ?></p>

                    <form method="post" action="options.php" id="crescelo-widget-form">
                        <?php settings_fields('crescelo_options'); ?>
                        <?php do_settings_sections('crescelo_options'); ?>

                        <!-- Preserve existing options -->
                        <input type="hidden" name="crescelo_host_url" value="<?php echo esc_attr($host_url); ?>" />
                        <input type="hidden" name="crescelo_api_key" value="<?php echo esc_attr($api_key); ?>" />
                        <input type="hidden" name="crescelo_site_secret" value="<?php echo esc_attr($site_secret); ?>" />
                        <input type="hidden" name="crescelo_account_email" value="<?php echo esc_attr($account_email); ?>" />
                        <input type="hidden" name="crescelo_assistant_name" value="<?php echo esc_attr($assistant_name); ?>" />
                        <input type="hidden" name="crescelo_connected_at" value="<?php echo esc_attr($connected_at); ?>" />
                        <?php foreach ($allowed_post_types as $pt): ?>
                            <input type="hidden" name="crescelo_allowed_post_types[]" value="<?php echo esc_attr($pt); ?>" />
                        <?php endforeach; ?>

                        <div class="setting-row">
                            <label for="crescelo_enabled" class="field-label"><?php esc_html_e('Public Chat Widget Display', 'crescelo'); ?></label>
                            <label class="crescelo-switch">
                                <input name="crescelo_enabled" type="checkbox" id="crescelo_enabled" value="1" <?php checked(1, $enabled); ?> />
                                <span class="crescelo-slider"></span>
                            </label>
                            <span class="field-help"><?php esc_html_e('Renders the floating AI chat bubble on visitor pages.', 'crescelo'); ?></span>
                        </div>

                        <div class="setting-row" style="margin-top: 18px;">
                            <label for="crescelo_id" class="field-label"><?php esc_html_e('Assistant ID', 'crescelo'); ?></label>
                            <input name="crescelo_id" type="text" id="crescelo_id" value="<?php echo esc_attr($assistant_id); ?>" class="crescelo-input mono" />
                            <span class="field-help"><?php esc_html_e('Linked identifier for this site persona.', 'crescelo'); ?></span>
                        </div>

                        <div class="setting-row" style="margin-top: 18px;">
                            <label class="field-label"><?php esc_html_e('Injected Script URL', 'crescelo'); ?></label>
                            <div class="code-snippet-box">
                                <code><?php echo esc_url(untrailingslashit($host_url) . '/widget.js'); ?></code>
                            </div>
                            <span class="field-help"><?php esc_html_e('Automatically enqueued asynchronously via standard WordPress script APIs.', 'crescelo'); ?></span>
                        </div>

                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e8e6d1;">
                            <?php submit_button(esc_html__('Save Widget Settings', 'crescelo'), 'primary crescelo-btn-save', 'submit', false); ?>
                        </div>
                    </form>
                </div>

                <!-- Widget Preview Card -->
                <div class="crescelo-card">
                    <h2 class="card-section-title"><?php esc_html_e('Brand & Chat Widget Preview', 'crescelo'); ?></h2>
                    <p class="card-section-desc"><?php esc_html_e('Live preview matching your Crescelo palette (#08251a & #abff44).', 'crescelo'); ?></p>

                    <div class="widget-preview-frame">
                        <div class="preview-chat-window">
                            <div class="preview-chat-header">
                                <div class="preview-header-brand">
                                    <div class="preview-avatar">AI</div>
                                    <div>
                                        <div class="preview-name"><?php echo esc_html($assistant_name ? $assistant_name : __('Crescelo Assistant', 'crescelo')); ?></div>
                                        <div class="preview-status"><?php esc_html_e('● Online & Grounded', 'crescelo'); ?></div>
                                    </div>
                                </div>
                                <span class="preview-close">✕</span>
                            </div>

                            <div class="preview-chat-body">
                                <div class="preview-msg bot">
                                    <div class="preview-bubble">
                                        <?php echo esc_html(sprintf(__('Hi there! 👋 Welcome to %s. How can I assist you today?', 'crescelo'), get_bloginfo('name'))); ?>
                                    </div>
                                </div>

                                <div class="preview-suggestions">
                                    <span class="preview-pill"><?php esc_html_e('What are your top products?', 'crescelo'); ?></span>
                                    <span class="preview-pill"><?php esc_html_e('Check shipping policy', 'crescelo'); ?></span>
                                    <span class="preview-pill"><?php esc_html_e('Talk to support', 'crescelo'); ?></span>
                                </div>
                            </div>

                            <div class="preview-chat-footer">
                                <div class="preview-input-sim"><?php esc_html_e('Ask a question...', 'crescelo'); ?></div>
                                <div class="preview-send-btn">➤</div>
                            </div>
                        </div>

                        <!-- Floating Launcher Preview -->
                        <div class="preview-launcher-bubble">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 20.0001 12.5 20.0001C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#08251a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <div style="margin-top: 16px; text-align:center;">
                        <a href="<?php echo esc_url(home_url()); ?>" target="_blank" class="btn-crescelo-secondary" style="display:inline-block; text-decoration:none;">
                            <span><?php esc_html_e('Open Public Website →', 'crescelo'); ?></span>
                        </a>
                    </div>
                </div>
            </div>

        </section>

    </div>
</div>
