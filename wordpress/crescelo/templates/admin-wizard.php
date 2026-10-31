<?php
/**
 * Admin Onboarding Wizard Template
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

$host_url     = crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
$api_key      = crescelo_get_option('api_key', '');
$assistant_id = crescelo_get_option('id', '');
$nonce        = wp_create_nonce('crescelo_wizard_nonce');
?>

<div class="wrap crescelo-wizard-wrap">
    <!-- Header -->
    <div class="crescelo-header">
        <div class="crescelo-brand">
            <div class="crescelo-logo-icon">AI</div>
            <div>
                <h1><?php esc_html_e('Crescelo AI Assistant Setup', 'crescelo'); ?></h1>
                <p><?php esc_html_e('Train your AI chatbot on your website content, WooCommerce products, and documentation in minutes.', 'crescelo'); ?></p>
            </div>
        </div>
        <div class="crescelo-header-status">
            <span class="status-pill status-ready"><?php esc_html_e('WordPress Connected', 'crescelo'); ?></span>
        </div>
    </div>

    <!-- Stepper Navigation -->
    <div class="crescelo-stepper">
        <div class="step-item active" data-step="1">
            <div class="step-circle">1</div>
            <div class="step-label"><?php esc_html_e('Website & Goal', 'crescelo'); ?></div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="2">
            <div class="step-circle">2</div>
            <div class="step-label"><?php esc_html_e('Database Scan', 'crescelo'); ?></div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="3">
            <div class="step-circle">3</div>
            <div class="step-label"><?php esc_html_e('Curate & Features', 'crescelo'); ?></div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="4">
            <div class="step-circle">4</div>
            <div class="step-label"><?php esc_html_e('AI Training', 'crescelo'); ?></div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="5">
            <div class="step-circle">5</div>
            <div class="step-label"><?php esc_html_e('Launch & Test', 'crescelo'); ?></div>
        </div>
    </div>

    <!-- Wizard Card Container -->
    <div class="crescelo-card">

        <!-- =================== STEP 1: WEBSITE TYPE & GOAL =================== -->
        <div class="wizard-pane active" id="pane-step-1">
            <h2 class="pane-title"><?php esc_html_e('What type of website is this, and what should the AI achieve?', 'crescelo'); ?></h2>
            <p class="pane-subtitle"><?php esc_html_e('This customizes the AI demeanor, sales style, and integration modules.', 'crescelo'); ?></p>

            <div class="section-label"><?php esc_html_e('1. Select Website Type', 'crescelo'); ?></div>
            <div class="grid-cards-4">
                <label class="selection-card selected">
                    <input type="radio" name="website_type" value="woocommerce" checked />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
                    <div class="card-title"><?php esc_html_e('WooCommerce Store', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Sell physical or digital goods. Understands products, stock, prices, variations, and cart.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="service_booking" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></div>
                    <div class="card-title"><?php esc_html_e('Services & Appointments', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Salons, clinics, consultants. Explains services and schedules appointments.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="content_docs" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg></div>
                    <div class="card-title"><?php esc_html_e('Docs & Knowledge Base', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Blogs, documentation, support portals. Provides accurate answers and ticket deflection.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="lead_generation" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
                    <div class="card-title"><?php esc_html_e('B2B & Lead Generation', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Agencies and software firms. Qualifies requirements and captures client leads.', 'crescelo'); ?></div>
                </label>
            </div>

            <div class="section-label" style="margin-top: 24px;"><?php esc_html_e('2. Select Primary AI Objective', 'crescelo'); ?></div>
            <div class="grid-cards-4">
                <label class="selection-card selected">
                    <input type="radio" name="objective" value="sales" checked />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                    <div class="card-title"><?php esc_html_e('Conversational Sales', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Guide shoppers, compare products, answer specifications, and stage items to cart.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="booking" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                    <div class="card-title"><?php esc_html_e('Schedule Appointments', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Answer service inquiries and schedule consultations directly in the chat window.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="support" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    <div class="card-title"><?php esc_html_e('24/7 Support Deflection', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Fast answers to shipping, refund, and FAQ questions, escalating when necessary.', 'crescelo'); ?></div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="leads" />
                    <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                    <div class="card-title"><?php esc_html_e('Inquiry & Lead Capture', 'crescelo'); ?></div>
                    <div class="card-desc"><?php esc_html_e('Collect visitor email, project requirements, and send instant notifications.', 'crescelo'); ?></div>
                </label>
            </div>

            <!-- Server Connection -->
            <?php
            $is_connected = !empty($assistant_id);
            $oauth_state = wp_create_nonce('crescelo_oauth_' . get_current_user_id() . '_' . wp_rand());
            set_transient('crescelo_oauth_state_' . $oauth_state, home_url(), 900);
            $connect_url = add_query_arg([
                'site_url'   => home_url(),
                'site_name'  => get_bloginfo('name'),
                'return_url' => admin_url('admin.php?page=crescelo'),
                'state'      => $oauth_state,
            ], untrailingslashit($host_url) . '/connect/wordpress');
            ?>

            <div class="connection-box">
                <div class="conn-header">
                    <strong><?php esc_html_e('Crescelo Account & Connection', 'crescelo'); ?></strong>
                    <span class="subtext"><?php esc_html_e('Connect automatically with 1-click or configure manually', 'crescelo'); ?></span>
                </div>

                <?php if ($is_connected): ?>
                    <div style="background:#08251a; color:#ffffff; padding:16px 20px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; margin-top:12px; border:1px solid #1a4734;">
                        <div>
                            <span style="color:#abff44; font-weight:700; font-size:12px; display:block;"><?php esc_html_e('● Connected to Crescelo', 'crescelo'); ?></span>
                            <strong style="font-size:14.5px; color:#ffffff;"><?php echo esc_html(crescelo_get_option('assistant_name', $assistant_id)); ?></strong>
                        </div>
                        <a href="<?php echo esc_url($connect_url); ?>" class="btn-text-action" style="color:#abff44; font-size:12px; text-decoration:underline;"><?php esc_html_e('Switch Assistant', 'crescelo'); ?></a>
                    </div>
                    <input type="hidden" id="crescelo-host-url" value="<?php echo esc_attr($host_url); ?>" />
                    <input type="hidden" id="crescelo-api-key" value="<?php echo esc_attr($api_key); ?>" />
                <?php else: ?>
                    <div style="margin-top:14px; text-align:center; padding:18px; background:#fbfbf4; border-radius:12px; border:1px solid #e8e6d1;">
                        <a href="<?php echo esc_url($connect_url); ?>" class="btn-crescelo-login-cta" style="margin:0 auto 10px auto; max-width:340px; display:inline-flex;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 12H3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span><?php esc_html_e('Log In & Connect with Crescelo', 'crescelo'); ?></span>
                        </a>
                        <p style="font-size:12px; color:#6b6b5c; margin:0;"><?php esc_html_e('Recommended: Instantly links your account and assistant without entering URLs or keys.', 'crescelo'); ?></p>
                    </div>

                    <details style="margin-top:12px; font-size:12.5px; color:#4b5b51;">
                        <summary style="cursor:pointer; font-weight:600; color:#0f6e58;"><?php esc_html_e('Or connect manually with Server URL & API Key', 'crescelo'); ?></summary>
                        <div class="conn-fields" style="margin-top:10px;">
                            <div>
                                <label for="crescelo-host-url"><?php esc_html_e('Server URL', 'crescelo'); ?></label>
                                <input type="url" id="crescelo-host-url" value="<?php echo esc_attr($host_url); ?>" placeholder="https://www.crescelo.com" />
                            </div>
                            <div>
                                <label for="crescelo-api-key"><?php esc_html_e('API Key', 'crescelo'); ?></label>
                                <input type="text" id="crescelo-api-key" value="<?php echo esc_attr($api_key); ?>" placeholder="cres_wp_..." />
                            </div>
                        </div>
                    </details>
                <?php endif; ?>
            </div>

            <div class="wizard-actions">
                <div></div>
                <button type="button" class="btn btn-primary" id="btn-to-step-2">
                    <?php esc_html_e('Start Website & Database Scan →', 'crescelo'); ?>
                </button>
            </div>
        </div>

        <!-- =================== STEP 2: SCANNING WEBSITE =================== -->
        <div class="wizard-pane" id="pane-step-2">
            <h2 class="pane-title"><?php esc_html_e('Scanning Website & Knowledge Structure...', 'crescelo'); ?></h2>
            <p class="pane-subtitle"><?php esc_html_e('Inspecting WordPress posts, pages, WooCommerce tables, and uploaded media documents.', 'crescelo'); ?></p>

            <div class="scanner-visual">
                <div class="radar-pulse"></div>
                <div class="scanner-text" id="scanner-status-text"><?php esc_html_e('Connecting to local database...', 'crescelo'); ?></div>
            </div>

            <div class="discovery-metrics-grid" id="discovery-metrics" style="display: none;">
                <!-- Populated dynamically via JS with all discovered post types -->
                <div class="metric-card">
                    <div class="metric-num" id="metric-pages">0</div>
                    <div class="metric-label"><?php esc_html_e('Published Pages', 'crescelo'); ?></div>
                </div>
                <div class="metric-card">
                    <div class="metric-num" id="metric-posts">0</div>
                    <div class="metric-label"><?php esc_html_e('Blog Posts', 'crescelo'); ?></div>
                </div>
                <div class="metric-card" id="metric-card-products">
                    <div class="metric-num" id="metric-products">0</div>
                    <div class="metric-label"><?php esc_html_e('WooCommerce Products', 'crescelo'); ?></div>
                </div>
                <div class="metric-card">
                    <div class="metric-num" id="metric-docs">0</div>
                    <div class="metric-label"><?php esc_html_e('Media Documents', 'crescelo'); ?></div>
                </div>
            </div>

            <div class="wizard-actions" style="margin-top: 32px;">
                <button type="button" class="btn btn-secondary btn-back" data-goto="1"><?php esc_html_e('← Back', 'crescelo'); ?></button>
                <button type="button" class="btn btn-primary" id="btn-to-step-3" disabled>
                    <?php esc_html_e('Review Discovered Post Types & Content →', 'crescelo'); ?>
                </button>
            </div>
        </div>

        <!-- =================== STEP 3: CONTENT SELECTION & FEATURES =================== -->
        <div class="wizard-pane" id="pane-step-3">
            <h2 class="pane-title"><?php esc_html_e('Choose Post Types & Content to Scrape', 'crescelo'); ?></h2>
            <p class="pane-subtitle"><?php esc_html_e('Select which post types to allow and train into the AI Knowledge Base, and activate commerce actions.', 'crescelo'); ?></p>

            <div class="curate-columns">
                <!-- Left: Content Checkboxes -->
                <div class="curate-col">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #f1f5f9;">
                        <span class="col-title" style="margin:0; padding:0; border:none;"><?php esc_html_e('Discovered Post Types & Content', 'crescelo'); ?></span>
                        <span id="curate-selection-count" class="count-badge has-items"><?php esc_html_e('Loading...', 'crescelo'); ?></span>
                    </div>

                    <!-- Dynamic Post Types Container -->
                    <div id="dynamic-post-types-curate">
                        <!-- Populated dynamically via JS for every registered post type -->
                    </div>

                    <!-- Documents Accordion -->
                    <div class="content-group" id="group-docs" style="display:none;">
                        <label class="group-header">
                            <input type="checkbox" id="check-all-docs" checked />
                            <strong><?php esc_html_e('Media Documents', 'crescelo'); ?> (<span id="count-docs-label">0</span> <?php esc_html_e('files', 'crescelo'); ?>)</strong>
                        </label>
                        <div class="group-items" id="items-docs-list">
                            <!-- Populated via JS -->
                        </div>
                    </div>
                </div>

                <!-- Right: Feature Toggles -->
                <div class="curate-col">
                    <div class="col-title"><?php esc_html_e('AI Commerce & Action Features', 'crescelo'); ?></div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Conversational Add-to-Cart', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e("Stages recommended products directly into the customer's active cart via WooCommerce AJAX.", 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-add-to-cart" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Real-Time Stock & Price Verification', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Deterministically verifies live inventory and sale prices from the database before the AI responds.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-live-stock" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Smart Sizing & Product Comparison', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Compares attributes, dimensions, and specifications to explain differences clearly.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-comparison" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Live Order Tracking & Dispatch', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Checks real-time WooCommerce order status, fulfillment, carrier, and tracking numbers in chat.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-order-tracking" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Self-Service Order Cancellation', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Allows verified shoppers to cancel unfulfilled orders, tagging WooCommerce admin with a 🤖 Bot Cancelled badge.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-order-cancel" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('In-Chat Appointment Booking', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Allows clients to select dates and schedule consultation slots within the chat bubble.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-booking" />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Pre-Sale Lead Capture', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Captures visitor email and phone when they request custom quotes or help.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-lead-capture" checked />
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button type="button" class="btn btn-secondary btn-back" data-goto="2"><?php esc_html_e('← Back', 'crescelo'); ?></button>
                <button type="button" class="btn btn-primary" id="btn-start-sync">
                    <?php esc_html_e('Begin AI Knowledge Training →', 'crescelo'); ?>
                </button>
            </div>
        </div>

        <!-- =================== STEP 4: ASYNC INGESTION PROGRESS =================== -->
        <div class="wizard-pane" id="pane-step-4">
            <h2 class="pane-title"><?php esc_html_e('Training AI Knowledge Base...', 'crescelo'); ?></h2>
            <p class="pane-subtitle"><?php esc_html_e('Content is securely chunked, vectorized, and embedded in small batches to protect server resources.', 'crescelo'); ?></p>

            <div class="progress-container">
                <div class="progress-bar-wrap">
                    <div class="progress-bar-fill" id="sync-progress-fill" style="width: 0%;"></div>
                </div>
                <div class="progress-status-row">
                    <span id="sync-status-label"><?php esc_html_e('Initializing ingestion queue...', 'crescelo'); ?></span>
                    <span id="sync-percent-label">0%</span>
                </div>
            </div>

            <!-- Terminal-style Log -->
            <div class="terminal-log" id="sync-terminal-log">
                <div class="log-line info"><?php esc_html_e('[INIT] Preparing content extraction batches...', 'crescelo'); ?></div>
            </div>

            <div class="wizard-actions" style="margin-top: 24px;">
                <div></div>
                <button type="button" class="btn btn-primary" id="btn-to-step-5" disabled>
                    <?php esc_html_e('Finalize & Test Assistant →', 'crescelo'); ?>
                </button>
            </div>
        </div>

        <!-- =================== STEP 5: LAUNCH & TEST =================== -->
        <div class="wizard-pane" id="pane-step-5">
            <div class="success-banner">
                <div class="success-icon">✓</div>
                <div>
                    <h3 style="margin:0 0 4px 0; font-size:18px;"><?php esc_html_e('Your AI Business Assistant is Trained & Ready!', 'crescelo'); ?></h3>
                    <p style="margin:0; font-size:13px; color:#475569;">
                        <?php esc_html_e('The chatbot has indexed your selected store content and is ready to assist shoppers.', 'crescelo'); ?>
                    </p>
                </div>
            </div>

            <div class="launch-grid">
                <div class="launch-settings">
                    <h4 style="margin-top:0;"><?php esc_html_e('Widget Visibility & Controls', 'crescelo'); ?></h4>

                    <div class="feature-item" style="border:none; padding:12px 0;">
                        <div class="feature-info">
                            <div class="feature-name"><?php esc_html_e('Enable Public Chat Widget', 'crescelo'); ?></div>
                            <div class="feature-desc"><?php esc_html_e('Display the interactive chat bubble on all public pages.', 'crescelo'); ?></div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="toggle-widget-public" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div style="margin-top: 16px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
                        <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;"><?php esc_html_e('Assistant ID', 'crescelo'); ?></div>
                        <code id="display-assistant-id" style="font-size:13px; color:#2563eb; background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; display:inline-block;">ast_...</code>
                    </div>

                    <div style="margin-top: 24px;">
                        <a href="<?php echo esc_url(home_url()); ?>" target="_blank" class="btn btn-secondary" style="display:inline-block; text-decoration:none;">
                            <span><?php esc_html_e('Preview on Your Live Website →', 'crescelo'); ?></span>
                        </a>
                    </div>
                </div>

                <div class="launch-preview-card">
                    <h4><?php esc_html_e('Simulated Widget Preview', 'crescelo'); ?></h4>
                    <div class="preview-chat-box">
                        <div class="chat-mock-header">
                            <span class="mock-dot"></span>
                            <span id="preview-ast-name"><?php esc_html_e('AI Shopping Assistant', 'crescelo'); ?></span>
                        </div>
                        <div class="chat-mock-body">
                            <div class="mock-bubble assistant" id="preview-welcome-msg">
                                <?php esc_html_e("Hi! Welcome to our store. I'm your AI Shopping Assistant. Looking for a specific product or need a recommendation?", 'crescelo'); ?>
                            </div>
                            <div class="mock-bubble user">
                                <?php esc_html_e('Do you have anything under $50?', 'crescelo'); ?>
                            </div>
                            <div class="mock-bubble assistant">
                                <?php esc_html_e('Yes! I found several top-rated items matching your budget. Let me know if you would like me to check stock or add any to your cart!', 'crescelo'); ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button type="button" class="btn btn-secondary" id="btn-re-run-wizard"><?php esc_html_e('Re-run Wizard', 'crescelo'); ?></button>
                <button type="button" class="btn btn-primary" id="btn-finish-all"><?php esc_html_e('Save & Exit', 'crescelo'); ?></button>
            </div>
        </div>

    </div>
</div>

<script>
if (!window.CresceloWizardData) {
    window.CresceloWizardData = {
        ajaxUrl: <?php echo wp_json_encode(admin_url('admin-ajax.php')); ?>,
        nonce: <?php echo wp_json_encode($nonce); ?>,
        hostUrl: <?php echo wp_json_encode(esc_url_raw($host_url)); ?>,
        currentAssistantId: <?php echo wp_json_encode(sanitize_text_field($assistant_id)); ?>
    };
}
</script>
