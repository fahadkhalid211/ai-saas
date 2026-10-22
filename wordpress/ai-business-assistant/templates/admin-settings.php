<?php
/**
 * Admin Settings / Dashboard View
 *
 * Tabbed Crescelo Branded Interface:
 * 1. Connection & Account (1-Click OAuth Connect + Connected Details Card + Manual API Key option)
 * 2. Knowledge Base Scraper (Allowed Post Types Grid + 1-Click Site Scraper Engine)
 * 3. Chat Widget & Actions (Widget Controls + Live Grounding REST Endpoint + Chat Preview)
 */

if (!defined('ABSPATH')) {
    exit;
}

$scanner = new Crescelo_Site_Scanner();
$available_post_types = $scanner->get_available_post_types();
$allowed_post_types   = $scanner->get_allowed_post_types();

$host_url       = get_option('ai_assistant_host_url', CRESCELO_DEFAULT_HOST);
$assistant_id   = get_option('ai_assistant_id', '');
$assistant_name = get_option('ai_assistant_assistant_name', '');
$account_email  = get_option('ai_assistant_account_email', '');
$connected_at   = get_option('ai_assistant_connected_at', '');
$enabled        = (bool) get_option('ai_assistant_enabled', true);
$api_key        = get_option('ai_assistant_api_key', '');
$site_secret    = get_option('ai_assistant_site_secret', '');
$is_connected   = !empty($assistant_id);

$nonce = wp_create_nonce('crescelo_wizard_nonce');

// One-click OAuth connect URL
$oauth_state = wp_create_nonce('crescelo_oauth_' . get_current_user_id() . '_' . wp_rand());
set_transient('crescelo_oauth_state_' . $oauth_state, home_url(), 900); // 15 mins

$return_url = admin_url('admin.php?page=ai-business-assistant');
$connect_url = add_query_arg([
    'site_url'   => home_url(),
    'site_name'  => get_bloginfo('name'),
    'return_url' => $return_url,
    'state'      => $oauth_state,
], untrailingslashit($host_url) . '/connect/wordpress');

$disconnect_url = wp_nonce_url(
    admin_url('admin.php?page=ai-business-assistant&crescelo_action=disconnect'),
    'crescelo_disconnect_nonce'
);

// Scraper settings
$include_meta       = (bool) get_option('ai_assistant_scrape_include_meta', true);
$include_taxonomies = (bool) get_option('ai_assistant_scrape_include_taxonomies', true);
$include_excerpt    = (bool) get_option('ai_assistant_scrape_include_excerpt', true);
$scrape_method      = sanitize_key(get_option('ai_assistant_scrape_method', 'db'));
$batch_size         = (int) get_option('ai_assistant_batch_size', 15);
$auto_sync          = (bool) get_option('ai_assistant_auto_sync', true);

$last_scraped        = get_option('ai_assistant_last_scraped', '');
$scrape_stats        = get_option('ai_assistant_scrape_stats', []);
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
                <h1 class="crescelo-main-title">Crescelo AI Assistant</h1>
                <p class="crescelo-sub-title">Intelligent AI Chatbot &amp; Website Knowledge Base Scraper</p>
            </div>
        </div>

        <div class="crescelo-header-actions">
            <?php if ($is_connected): ?>
                <div class="crescelo-status-tag status-connected">
                    <span class="live-dot-lime"></span>
                    <span>Connected: <strong><?php echo esc_html($assistant_name ?: $assistant_id); ?></strong></span>
                </div>
            <?php else: ?>
                <div class="crescelo-status-tag status-disconnected">
                    <span class="live-dot-gray"></span>
                    <span>Not Connected</span>
                </div>
            <?php endif; ?>
        </div>
    </header>

    <!-- Crescelo Branded Tabs Navigation -->
    <nav class="crescelo-nav-tabs" role="tablist">
        <button type="button" class="crescelo-tab-btn active" data-tab="tab-connection" role="tab" aria-selected="true">
            <span class="tab-icon">🔗</span>
            <span class="tab-text">Connection &amp; Account</span>
        </button>
        <button type="button" class="crescelo-tab-btn" data-tab="tab-scraper" role="tab" aria-selected="false">
            <span class="tab-icon">🕷️</span>
            <span class="tab-text">Knowledge Base Scraper</span>
            <span class="tab-badge" id="tab-pt-count"><?php echo count($allowed_post_types); ?></span>
        </button>
        <button type="button" class="crescelo-tab-btn" data-tab="tab-widget" role="tab" aria-selected="false">
            <span class="tab-icon">💬</span>
            <span class="tab-text">Chat Widget &amp; Actions</span>
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
                            <span>Active Connection</span>
                        </div>
                        <div class="connected-header-right">
                            <span class="server-pill">Server: <?php echo esc_html($host_url); ?></span>
                        </div>
                    </div>

                    <div class="connected-details-grid">
                        <div class="detail-box">
                            <span class="detail-label">AI Assistant Name</span>
                            <span class="detail-val highlight"><?php echo esc_html($assistant_name ?: 'AI Business Assistant'); ?></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Assistant ID</span>
                            <span class="detail-val mono"><code><?php echo esc_html($assistant_id); ?></code></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Connected Account</span>
                            <span class="detail-val"><?php echo esc_html($account_email ?: 'Crescelo Authorized User'); ?></span>
                        </div>
                        <div class="detail-box">
                            <span class="detail-label">Connection Date</span>
                            <span class="detail-val"><?php echo esc_html($connected_at ? date('M j, Y - H:i', strtotime($connected_at)) : 'Active'); ?></span>
                        </div>
                    </div>

                    <!-- Connection Action Buttons -->
                    <div class="connected-actions-row">
                        <div class="actions-left">
                            <button type="button" class="btn-crescelo-lime" id="btn-test-connection">
                                <span>⚡ Test Connection Health</span>
                            </button>
                            <span id="test-connection-status" class="test-status-msg" style="display:none;"></span>
                        </div>
                        <div class="actions-right">
                            <a href="<?php echo esc_url($connect_url); ?>" class="btn-crescelo-secondary" title="Switch to another assistant or refresh permissions">
                                <span>Switch Assistant</span>
                            </a>
                            <a href="<?php echo esc_url($disconnect_url); ?>" class="btn-crescelo-danger" id="btn-disconnect-link" onclick="return confirm('Are you sure you want to disconnect this WordPress site from Crescelo? Your chat widget will be deactivated until you reconnect.');">
                                <span>Disconnect Site</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Grounding & Store Information Card -->
                <div class="crescelo-subcard" style="margin-top: 24px;">
                    <div class="subcard-header">
                        <h3>Real-Time Live Grounding Endpoint</h3>
                        <span class="badge-status-ok">REST API Active</span>
                    </div>
                    <p class="subcard-desc">
                        Crescelo securely queries this endpoint in real time to fetch live WooCommerce product pricing, real-time stock levels, and store details during customer conversations.
                    </p>
                    <div class="code-snippet-box">
                        <code><?php echo esc_url(rest_url('crescelo/v1/stock-check')); ?></code>
                        <span class="protected-pill">🔒 Protected by Crescelo Key</span>
                    </div>
                </div>

            <?php else: ?>
                <!-- DISCONNECTED STATE: 1-Click Login / Connect + Manual API Key Option -->
                <div class="crescelo-hero-connect-card">
                    <div class="hero-connect-inner">
                        <div class="hero-badge">One-Click Setup</div>
                        <h2 class="hero-title">Connect your WordPress Site to Crescelo</h2>
                        <p class="hero-subtitle">
                            No complicated configuration required. Click the button below to log in to your Crescelo account and automatically connect your AI Assistant.
                        </p>

                        <div class="hero-cta-wrap">
                            <a href="<?php echo esc_url($connect_url); ?>" class="btn-crescelo-login-cta" id="btn-primary-oauth-login">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M15 12H3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Log In &amp; Connect with Crescelo</span>
                            </a>
                        </div>

                        <div class="hero-features-list">
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span>Automatic Assistant Selection or Creation</span>
                            </div>
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span>Zero manual server or key configuration</span>
                            </div>
                            <div class="feature-item">
                                <span class="chk-icon">✓</span>
                                <span>Encrypted end-to-end handshake</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div class="crescelo-divider">
                    <span>OR CONNECT MANUALLY WITH API KEY</span>
                </div>

                <!-- Manual Connection via API Key Card -->
                <div class="crescelo-subcard">
                    <div class="subcard-header">
                        <div>
                            <h3 style="margin:0 0 4px 0;">Manual Connection via API Key</h3>
                            <p class="subcard-desc" style="margin:0;">
                                Prefer connecting with a key? Generate a WordPress connector key from your Crescelo Assistant and paste it here.
                            </p>
                        </div>
                    </div>

                    <div class="manual-steps-box">
                        <div class="manual-step-item">
                            <span class="step-num">1</span>
                            <span>Log in to Crescelo and open your Assistant Settings</span>
                        </div>
                        <div class="manual-step-item">
                            <span class="step-num">2</span>
                            <span>Go to <strong>WordPress Integration</strong> &rarr; <strong>Generate Connector Key</strong></span>
                        </div>
                        <div class="manual-step-item">
                            <span class="step-num">3</span>
                            <span>Paste the generated <code>cres_wp_...</code> API key below</span>
                        </div>
                    </div>

                    <div class="manual-form-grid" style="margin-top: 18px;">
                        <div>
                            <label for="input-manual-api-key" class="field-label">WordPress Connector API Key</label>
                            <div class="input-with-toggle">
                                <input type="password" id="input-manual-api-key" class="crescelo-input" placeholder="cres_wp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" autocomplete="off" />
                                <button type="button" class="btn-toggle-secret" id="btn-toggle-key-visibility" title="Show/Hide Key">👁️</button>
                            </div>
                            <span class="field-help">Your secure assistant webhook secret or connector key.</span>
                        </div>

                        <!-- Optional server URL toggle -->
                        <details class="server-config-details" style="margin-top: 14px;">
                            <summary class="details-summary">Advanced Server Settings (Custom Host / Localhost)</summary>
                            <div style="margin-top: 10px;">
                                <label for="input-manual-host-url" class="field-label">Crescelo Server URL</label>
                                <input type="url" id="input-manual-host-url" class="crescelo-input" value="<?php echo esc_attr($host_url); ?>" placeholder="http://localhost:3000" />
                                <span class="field-help">Defaults to your active Crescelo host. Change only for custom instances.</span>
                            </div>
                        </details>

                        <div style="margin-top: 20px; display:flex; align-items:center; gap:14px;">
                            <button type="button" class="btn-crescelo-lime" id="btn-submit-manual-key">
                                <span>Verify &amp; Connect via Key</span>
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
                <?php settings_fields('ai_assistant_options'); ?>
                <?php do_settings_sections('ai_assistant_options'); ?>

                <!-- Hidden inputs to preserve non-scraper fields -->
                <input type="hidden" name="ai_assistant_host_url" value="<?php echo esc_attr($host_url); ?>" />
                <input type="hidden" name="ai_assistant_id" value="<?php echo esc_attr($assistant_id); ?>" />
                <input type="hidden" name="ai_assistant_api_key" value="<?php echo esc_attr($api_key); ?>" />
                <input type="hidden" name="ai_assistant_site_secret" value="<?php echo esc_attr($site_secret); ?>" />
                <input type="hidden" name="ai_assistant_account_email" value="<?php echo esc_attr($account_email); ?>" />
                <input type="hidden" name="ai_assistant_assistant_name" value="<?php echo esc_attr($assistant_name); ?>" />
                <input type="hidden" name="ai_assistant_connected_at" value="<?php echo esc_attr($connected_at); ?>" />
                <input type="hidden" name="ai_assistant_enabled" value="<?php echo $enabled ? '1' : '0'; ?>" />

                <!-- Allowed Post Types Card -->
                <div class="crescelo-card">
                    <div class="card-header-flex">
                        <div>
                            <h2 class="card-section-title">Allowed Post Types for Scraping</h2>
                            <p class="card-section-desc">
                                Choose which post types from your WordPress site should be vectorized into your Crescelo AI Knowledge Base.
                            </p>
                        </div>
                        <div>
                            <span class="count-badge has-items" id="total-selected-indicator">
                                <?php echo count($allowed_post_types); ?> types allowed
                            </span>
                        </div>
                    </div>

                    <div class="pt-quick-actions">
                        <button type="button" class="btn-text-action" id="action-select-all-pts">Select All</button>
                        <span class="action-sep">|</span>
                        <button type="button" class="btn-text-action" id="action-select-defaults-pts">Defaults (Pages, Posts, Products)</button>
                        <span class="action-sep">|</span>
                        <button type="button" class="btn-text-action" id="action-deselect-all-pts">Deselect All</button>
                    </div>

                    <!-- Dynamic Post Types Grid -->
                    <div class="post-types-grid">
                        <?php foreach ($available_post_types as $slug => $pt): 
                            $is_checked = in_array($slug, $allowed_post_types, true);
                        ?>
                            <label class="post-type-card <?php echo $is_checked ? 'selected' : ''; ?>">
                                <input type="checkbox" name="ai_assistant_allowed_post_types[]" value="<?php echo esc_attr($slug); ?>" <?php checked(true, $is_checked); ?> class="pt-checkbox" />
                                <div class="pt-details">
                                    <div class="pt-header-row">
                                        <span class="pt-title"><?php echo esc_html($pt['label']); ?></span>
                                        <span class="count-badge <?php echo $pt['count'] > 0 ? 'has-items' : ''; ?>">
                                            <?php echo esc_html($pt['count']); ?> <?php echo esc_html(_n('item', 'items', $pt['count'], 'ai-business-assistant')); ?>
                                        </span>
                                    </div>
                                    <div class="pt-slug">Type: <code><?php echo esc_html($slug); ?></code></div>

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
                        <h3 class="panel-subtitle">Scraper Ingestion Options</h3>
                        
                        <div class="options-grid-2">
                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="ai_assistant_scrape_include_meta" value="1" <?php checked(true, $include_meta); ?> id="opt-scrape-include-meta" />
                                <span><strong>Include Custom Fields &amp; Meta</strong> (ACF, SKU, pricing, specs)</span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="ai_assistant_scrape_include_taxonomies" value="1" <?php checked(true, $include_taxonomies); ?> id="opt-scrape-include-tax" />
                                <span><strong>Include Taxonomies &amp; Categories</strong> (Tags, terms, hierarchies)</span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="ai_assistant_scrape_include_excerpt" value="1" <?php checked(true, $include_excerpt); ?> id="opt-scrape-include-excerpt" />
                                <span><strong>Include Excerpt &amp; Summary</strong></span>
                            </label>

                            <label class="crescelo-checkbox-label">
                                <input type="checkbox" name="ai_assistant_auto_sync" value="1" <?php checked(true, $auto_sync); ?> id="opt-auto-sync" />
                                <span><strong>Real-Time Auto-Sync</strong> (Sync content changes when published)</span>
                            </label>
                        </div>

                        <div class="options-grid-2" style="margin-top: 16px;">
                            <div>
                                <label for="ai_assistant_scrape_method" class="field-label">Content Extraction Method</label>
                                <select name="ai_assistant_scrape_method" id="ai_assistant_scrape_method" class="crescelo-select">
                                    <option value="db" <?php selected('db', $scrape_method); ?>>Clean Database Content (Fast, stripped shortcodes &amp; blocks)</option>
                                    <option value="html" <?php selected('html', $scrape_method); ?>>Rendered HTML Scraping (Captures Elementor/Divi output)</option>
                                </select>
                            </div>

                            <div>
                                <label for="ai_assistant_batch_size" class="field-label">Ingestion Batch Size</label>
                                <select name="ai_assistant_batch_size" id="ai_assistant_batch_size" class="crescelo-select">
                                    <option value="10" <?php selected(10, $batch_size); ?>>10 items per batch</option>
                                    <option value="15" <?php selected(15, $batch_size); ?>>15 items per batch (Recommended)</option>
                                    <option value="25" <?php selected(25, $batch_size); ?>>25 items per batch</option>
                                    <option value="50" <?php selected(50, $batch_size); ?>>50 items per batch (High RAM)</option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-top: 20px;">
                            <?php submit_button('Save Scraper Settings', 'primary crescelo-btn-save', 'submit', false); ?>
                        </div>
                    </div>
                </div>
            </form>

            <!-- ONE-CLICK WEBSITE SCRAPER CARD -->
            <div class="crescelo-card scraper-engine-card" style="margin-top: 24px;">
                <div class="scraper-header-row">
                    <div>
                        <h3 class="engine-title">🕷️ One-Click Website Scraper</h3>
                        <p class="engine-desc">
                            Extracts and vectorizes all allowed content directly into your active Crescelo assistant knowledge base.
                        </p>
                        <div class="scraper-stats-row">
                            <span>Last Scraped: <strong><?php echo !empty($last_scraped) ? esc_html($last_scraped) : 'Not yet scraped'; ?></strong></span>
                            <span>Total Indexed: <strong><?php echo esc_html($total_scraped_items); ?> items</strong></span>
                            <span>Vector Chunks: <strong><?php echo esc_html($total_scraped_chunks); ?></strong></span>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn-crescelo-lime btn-lg" id="btn-start-standalone-scrape" <?php disabled(false, $is_connected); ?>>
                            <span>🕷️ Scrape Website &amp; Sync to Knowledge Base</span>
                        </button>
                        <?php if (!$is_connected): ?>
                            <div class="muted-warning">Connect an assistant in Tab 1 to run scraper.</div>
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
                            <span id="standalone-status-label">Initializing site-wide extraction...</span>
                            <span id="standalone-percent-label">0%</span>
                        </div>
                    </div>

                    <!-- Live Terminal Output -->
                    <div class="terminal-log" id="standalone-terminal-log">
                        <div class="log-line info">[INIT] Preparing scraper across selected post types...</div>
                    </div>

                    <div style="margin-top: 14px; display:flex; justify-content:flex-end;">
                        <button type="button" class="btn-crescelo-danger" id="btn-cancel-standalone-scrape">Cancel Scraping</button>
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
                    <h2 class="card-section-title">Chat Widget Configuration</h2>
                    <p class="card-section-desc">Manage how the floating AI chatbot behaves and appears on your site.</p>

                    <form method="post" action="options.php" id="crescelo-widget-form">
                        <?php settings_fields('ai_assistant_options'); ?>
                        <?php do_settings_sections('ai_assistant_options'); ?>

                        <!-- Preserve existing options -->
                        <input type="hidden" name="ai_assistant_host_url" value="<?php echo esc_attr($host_url); ?>" />
                        <input type="hidden" name="ai_assistant_api_key" value="<?php echo esc_attr($api_key); ?>" />
                        <input type="hidden" name="ai_assistant_site_secret" value="<?php echo esc_attr($site_secret); ?>" />
                        <input type="hidden" name="ai_assistant_account_email" value="<?php echo esc_attr($account_email); ?>" />
                        <input type="hidden" name="ai_assistant_assistant_name" value="<?php echo esc_attr($assistant_name); ?>" />
                        <input type="hidden" name="ai_assistant_connected_at" value="<?php echo esc_attr($connected_at); ?>" />
                        <?php foreach ($allowed_post_types as $pt): ?>
                            <input type="hidden" name="ai_assistant_allowed_post_types[]" value="<?php echo esc_attr($pt); ?>" />
                        <?php endforeach; ?>

                        <div class="setting-row">
                            <label for="ai_assistant_enabled" class="field-label">Public Chat Widget Display</label>
                            <label class="crescelo-switch">
                                <input name="ai_assistant_enabled" type="checkbox" id="ai_assistant_enabled" value="1" <?php checked(1, $enabled); ?> />
                                <span class="crescelo-slider"></span>
                            </label>
                            <span class="field-help">Renders the floating AI chat bubble on visitor pages.</span>
                        </div>

                        <div class="setting-row" style="margin-top: 18px;">
                            <label for="ai_assistant_id" class="field-label">Assistant ID</label>
                            <input name="ai_assistant_id" type="text" id="ai_assistant_id" value="<?php echo esc_attr($assistant_id); ?>" class="crescelo-input mono" />
                            <span class="field-help">Linked identifier for this site's AI persona.</span>
                        </div>

                        <div class="setting-row" style="margin-top: 18px;">
                            <label class="field-label">Injected Script URL</label>
                            <div class="code-snippet-box">
                                <code><?php echo esc_url(untrailingslashit($host_url) . '/widget.js'); ?></code>
                            </div>
                            <span class="field-help">Automatically loaded asynchronously via WordPress footer hooks.</span>
                        </div>

                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e8e6d1;">
                            <?php submit_button('Save Widget Settings', 'primary crescelo-btn-save', 'submit', false); ?>
                        </div>
                    </form>
                </div>

                <!-- Widget Preview Card -->
                <div class="crescelo-card">
                    <h2 class="card-section-title">Brand &amp; Chat Widget Preview</h2>
                    <p class="card-section-desc">Live preview matching your Crescelo palette (#08251a &amp; #abff44).</p>

                    <div class="widget-preview-frame">
                        <div class="preview-chat-window">
                            <div class="preview-chat-header">
                                <div class="preview-header-brand">
                                    <div class="preview-avatar">AI</div>
                                    <div>
                                        <div class="preview-name"><?php echo esc_html($assistant_name ?: 'Crescelo Assistant'); ?></div>
                                        <div class="preview-status">● Online &amp; Grounded</div>
                                    </div>
                                </div>
                                <span class="preview-close">✕</span>
                            </div>

                            <div class="preview-chat-body">
                                <div class="preview-msg bot">
                                    <div class="preview-bubble">
                                        Hi there! 👋 Welcome to <?php echo esc_html(get_bloginfo('name')); ?>. How can I assist you today?
                                    </div>
                                </div>

                                <div class="preview-suggestions">
                                    <span class="preview-pill">What are your top products?</span>
                                    <span class="preview-pill">Check shipping policy</span>
                                    <span class="preview-pill">Talk to support</span>
                                </div>
                            </div>

                            <div class="preview-chat-footer">
                                <div class="preview-input-sim">Ask a question...</div>
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
                            <span>Open Public Website &rarr;</span>
                        </a>
                    </div>
                </div>
            </div>

        </section>

    </div>
</div>
