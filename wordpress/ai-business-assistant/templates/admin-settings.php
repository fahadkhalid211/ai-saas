<?php
/**
 * Admin Settings / Dashboard View (With Dynamic Post Types Scraper)
 */

if (!defined('ABSPATH')) {
    exit;
}

$scanner = new Crescelo_Site_Scanner();
$available_post_types = $scanner->get_available_post_types();
$allowed_post_types   = $scanner->get_allowed_post_types();

$host_url     = get_option('ai_assistant_host_url', 'http://localhost:3000');
$assistant_id = get_option('ai_assistant_id', 'demo-assistant');
$enabled      = get_option('ai_assistant_enabled', true);
$site_secret  = get_option('ai_assistant_site_secret', '');
$nonce        = wp_create_nonce('crescelo_wizard_nonce');

$include_meta       = (bool) get_option('ai_assistant_scrape_include_meta', true);
$include_taxonomies = (bool) get_option('ai_assistant_scrape_include_taxonomies', true);
$include_excerpt    = (bool) get_option('ai_assistant_scrape_include_excerpt', true);
$scrape_method      = sanitize_key(get_option('ai_assistant_scrape_method', 'db'));
$batch_size         = (int) get_option('ai_assistant_batch_size', 15);
$auto_sync          = (bool) get_option('ai_assistant_auto_sync', true);

$last_scraped = get_option('ai_assistant_last_scraped', '');
$scrape_stats = get_option('ai_assistant_scrape_stats', []);
$total_scraped_items  = isset($scrape_stats['total_items']) ? (int) $scrape_stats['total_items'] : 0;
$total_scraped_chunks = isset($scrape_stats['total_chunks']) ? (int) $scrape_stats['total_chunks'] : 0;
?>

<div class="wrap crescelo-wizard-wrap">
    <!-- Header -->
    <div class="crescelo-header">
        <div class="crescelo-brand">
            <div class="crescelo-logo-icon">AI</div>
            <div>
                <h1>Crescelo AI Assistant & Website Scraper</h1>
                <p>Manage your AI chatbot, choose which post types to scrape into the Knowledge Base, and trigger site-wide syncing.</p>
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

    <!-- Main Settings Form -->
    <form method="post" action="options.php" id="crescelo-settings-form">
        <?php settings_fields('ai_assistant_options'); ?>
        <?php do_settings_sections('ai_assistant_options'); ?>

        <!-- SECTION 1: KNOWLEDGE BASE POST TYPES & SCRAPER -->
        <div class="crescelo-card" style="margin-bottom: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <h2 style="font-size: 18px; margin: 0 0 4px 0;">Allowed Post Types for Knowledge Base Scraping</h2>
                    <p style="margin:0; font-size: 13px; color: #64748b;">
                        Select which content types from this website should be scraped and vectorized into your AI Knowledge Base.
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
                <span style="color:#cbd5e1;">|</span>
                <button type="button" class="btn-text-action" id="action-select-defaults-pts">Defaults (Pages, Posts, Products)</button>
                <span style="color:#cbd5e1;">|</span>
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

            <!-- Scraping Configuration Options -->
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
                <h3 style="font-size: 15px; margin: 0 0 12px 0;">Scraper & Ingestion Settings</h3>
                <div class="options-grid-2">
                    <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" name="ai_assistant_scrape_include_meta" value="1" <?php checked(true, $include_meta); ?> id="opt-scrape-include-meta" />
                        <span><strong>Include Custom Fields & Metadata</strong> (ACF, specifications, public post meta)</span>
                    </label>

                    <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" name="ai_assistant_scrape_include_taxonomies" value="1" <?php checked(true, $include_taxonomies); ?> id="opt-scrape-include-tax" />
                        <span><strong>Include Taxonomies & Categories</strong> (Tags, terms, hierarchies)</span>
                    </label>

                    <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" name="ai_assistant_scrape_include_excerpt" value="1" <?php checked(true, $include_excerpt); ?> id="opt-scrape-include-excerpt" />
                        <span><strong>Include Excerpt & Summary</strong></span>
                    </label>

                    <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                        <input type="checkbox" name="ai_assistant_auto_sync" value="1" <?php checked(true, $auto_sync); ?> id="opt-auto-sync" />
                        <span><strong>Real-Time Auto-Sync</strong> (Push updates automatically on post save/publish)</span>
                    </label>
                </div>

                <div class="options-grid-2" style="margin-top: 12px;">
                    <div>
                        <label for="ai_assistant_scrape_method" style="display:block; font-size:12.5px; font-weight:600; margin-bottom:4px;">Content Extraction Method</label>
                        <select name="ai_assistant_scrape_method" id="ai_assistant_scrape_method" class="regular-text" style="width:100%; max-width:320px;">
                            <option value="db" <?php selected('db', $scrape_method); ?>>Clean Database Content (Fast, stripped shortcodes & Gutenberg)</option>
                            <option value="html" <?php selected('html', $scrape_method); ?>>Rendered HTML Scraping (Captures Elementor/Divi visual builder output)</option>
                        </select>
                    </div>

                    <div>
                        <label for="ai_assistant_batch_size" style="display:block; font-size:12.5px; font-weight:600; margin-bottom:4px;">Ingestion Batch Size</label>
                        <select name="ai_assistant_batch_size" id="ai_assistant_batch_size" class="regular-text" style="width:100%; max-width:200px;">
                            <option value="10" <?php selected(10, $batch_size); ?>>10 items per batch</option>
                            <option value="15" <?php selected(15, $batch_size); ?>>15 items per batch (Recommended)</option>
                            <option value="25" <?php selected(25, $batch_size); ?>>25 items per batch</option>
                            <option value="50" <?php selected(50, $batch_size); ?>>50 items per batch (High RAM)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- ONE-CLICK WEBSITE SCRAPER CARD -->
            <div class="scraper-box">
                <div class="scraper-header-row">
                    <div>
                        <h3 style="font-size: 16px; margin: 0 0 4px 0;">🕷️ One-Click Website Scraper</h3>
                        <div class="scraper-stats-row">
                            <span>Last Scraped: <strong><?php echo !empty($last_scraped) ? esc_html($last_scraped) : 'Not yet scraped'; ?></strong></span>
                            <span>Total Indexed Items: <strong><?php echo esc_html($total_scraped_items); ?></strong></span>
                            <span>Vector Chunks: <strong><?php echo esc_html($total_scraped_chunks); ?></strong></span>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn btn-success" id="btn-start-standalone-scrape" style="display:flex; align-items:center; gap:8px;">
                            <span>🕷️ Scrape Website & Sync to Knowledge Base</span>
                        </button>
                    </div>
                </div>

                <!-- Scraping Progress Modal / Container -->
                <div id="standalone-scraper-progress" style="display: none; margin-top: 16px;">
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

                    <div style="margin-top: 12px; display:flex; justify-content:flex-end;">
                        <button type="button" class="btn btn-danger" id="btn-cancel-standalone-scrape">Cancel Scraping</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 2: CONNECTION & WIDGET CONFIGURATION -->
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
        </div>
    </form>
</div>
