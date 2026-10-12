<?php
/**
 * Admin Onboarding Wizard Template
 */

if (!defined('ABSPATH')) {
    exit;
}

$host_url     = get_option('ai_assistant_host_url', 'http://localhost:3000');
$api_key      = get_option('ai_assistant_api_key', '');
$assistant_id = get_option('ai_assistant_id', '');
$nonce        = wp_create_nonce('crescelo_wizard_nonce');
?>

<div class="wrap crescelo-wizard-wrap">
    <!-- Header -->
    <div class="crescelo-header">
        <div class="crescelo-brand">
            <div class="crescelo-logo-icon">AI</div>
            <div>
                <h1>Crescelo AI Assistant Setup</h1>
                <p>Train your AI chatbot on your website content, WooCommerce products, and documentation in minutes.</p>
            </div>
        </div>
        <div class="crescelo-header-status">
            <span class="status-pill status-ready">WordPress Connected</span>
        </div>
    </div>

    <!-- Stepper Navigation -->
    <div class="crescelo-stepper">
        <div class="step-item active" data-step="1">
            <div class="step-circle">1</div>
            <div class="step-label">Website & Goal</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="2">
            <div class="step-circle">2</div>
            <div class="step-label">Database Scan</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="3">
            <div class="step-circle">3</div>
            <div class="step-label">Curate & Features</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="4">
            <div class="step-circle">4</div>
            <div class="step-label">AI Training</div>
        </div>
        <div class="step-line"></div>
        <div class="step-item" data-step="5">
            <div class="step-circle">5</div>
            <div class="step-label">Launch & Test</div>
        </div>
    </div>

    <!-- Wizard Card Container -->
    <div class="crescelo-card">

        <!-- =================== STEP 1: WEBSITE TYPE & GOAL =================== -->
        <div class="wizard-pane active" id="pane-step-1">
            <h2 class="pane-title">What type of website is this, and what should the AI achieve?</h2>
            <p class="pane-subtitle">This customizes the AI's core behavior, sales demeanor, and integration modules.</p>

            <div class="section-label">1. Select Website Type</div>
            <div class="grid-cards-4">
                <label class="selection-card selected">
                    <input type="radio" name="website_type" value="woocommerce" checked />
                    <div class="card-icon">🛍️</div>
                    <div class="card-title">WooCommerce Store</div>
                    <div class="card-desc">Sell physical or digital goods. Understands products, stock, prices, variations, and cart.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="service_booking" />
                    <div class="card-icon">📅</div>
                    <div class="card-title">Services & Appointments</div>
                    <div class="card-desc">Salons, medical clinics, consultants. Explains services and schedules appointments.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="content_docs" />
                    <div class="card-icon">📚</div>
                    <div class="card-title">Docs & Knowledge Base</div>
                    <div class="card-desc">Blogs, documentation, support portals. Provides accurate answers and ticket deflection.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="website_type" value="lead_generation" />
                    <div class="card-icon">🎯</div>
                    <div class="card-title">B2B & Lead Generation</div>
                    <div class="card-desc">Agencies and software firms. Qualifies requirements and captures client leads.</div>
                </label>
            </div>

            <div class="section-label" style="margin-top: 24px;">2. Select Primary AI Objective</div>
            <div class="grid-cards-4">
                <label class="selection-card selected">
                    <input type="radio" name="objective" value="sales" checked />
                    <div class="card-icon">⚡</div>
                    <div class="card-title">Conversational Sales</div>
                    <div class="card-desc">Guide shoppers, compare products, answer specifications, and stage items to cart.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="booking" />
                    <div class="card-icon">🕒</div>
                    <div class="card-title">Schedule Appointments</div>
                    <div class="card-desc">Answer service inquiries and schedule consultations directly in the chat window.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="support" />
                    <div class="card-icon">🛡️</div>
                    <div class="card-title">24/7 Support Deflection</div>
                    <div class="card-desc">Fast answers to shipping, refund, and FAQ questions, escalating when necessary.</div>
                </label>
                <label class="selection-card">
                    <input type="radio" name="objective" value="leads" />
                    <div class="card-icon">💼</div>
                    <div class="card-title">Inquiry & Lead Capture</div>
                    <div class="card-desc">Collect visitor email, project requirements, and send instant notifications.</div>
                </label>
            </div>

            <!-- Server Connection -->
            <div class="connection-box">
                <div class="conn-header">
                    <strong>Crescelo AI Backend Connection</strong>
                    <span class="subtext">Connects to your high-performance external SaaS engine</span>
                </div>
                <div class="conn-fields">
                    <div>
                        <label for="crescelo-host-url">Server URL</label>
                        <input type="url" id="crescelo-host-url" value="<?php echo esc_attr($host_url); ?>" placeholder="http://localhost:3000" />
                    </div>
                    <div>
                        <label for="crescelo-api-key">API Key (Optional)</label>
                        <input type="text" id="crescelo-api-key" value="<?php echo esc_attr($api_key); ?>" placeholder="cres_live_..." />
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <div></div>
                <button type="button" class="btn btn-primary" id="btn-to-step-2">
                    Start Website & Database Scan &rarr;
                </button>
            </div>
        </div>

        <!-- =================== STEP 2: SCANNING WEBSITE =================== -->
        <div class="wizard-pane" id="pane-step-2">
            <h2 class="pane-title">Scanning Website & Knowledge Structure...</h2>
            <p class="pane-subtitle">Inspecting WordPress posts, pages, WooCommerce tables, and uploaded media documents.</p>

            <div class="scanner-visual">
                <div class="radar-pulse"></div>
                <div class="scanner-text" id="scanner-status-text">Connecting to local database...</div>
            </div>

            <div class="discovery-metrics-grid" id="discovery-metrics" style="display: none;">
                <!-- Populated dynamically via JS with all discovered post types -->
                <div class="metric-card">
                    <div class="metric-num" id="metric-pages">0</div>
                    <div class="metric-label">Published Pages</div>
                </div>
                <div class="metric-card">
                    <div class="metric-num" id="metric-posts">0</div>
                    <div class="metric-label">Blog Posts</div>
                </div>
                <div class="metric-card" id="metric-card-products">
                    <div class="metric-num" id="metric-products">0</div>
                    <div class="metric-label">WooCommerce Products</div>
                </div>
                <div class="metric-card">
                    <div class="metric-num" id="metric-docs">0</div>
                    <div class="metric-label">Media Documents</div>
                </div>
            </div>

            <div class="wizard-actions" style="margin-top: 32px;">
                <button type="button" class="btn btn-secondary btn-back" data-goto="1">&larr; Back</button>
                <button type="button" class="btn btn-primary" id="btn-to-step-3" disabled>
                    Review Discovered Post Types & Content &rarr;
                </button>
            </div>
        </div>

        <!-- =================== STEP 3: CONTENT SELECTION & FEATURES =================== -->
        <div class="wizard-pane" id="pane-step-3">
            <h2 class="pane-title">Choose Post Types & Content to Scrape</h2>
            <p class="pane-subtitle">Select which post types to allow and train into the AI Knowledge Base, and activate commerce actions.</p>

            <div class="curate-columns">
                <!-- Left: Content Checkboxes -->
                <div class="curate-col">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #f1f5f9;">
                        <span class="col-title" style="margin:0; padding:0; border:none;">Discovered Post Types & Content</span>
                        <span id="curate-selection-count" class="count-badge has-items">Loading...</span>
                    </div>

                    <!-- Dynamic Post Types Container -->
                    <div id="dynamic-post-types-curate">
                        <!-- Populated dynamically via JS for every registered post type -->
                    </div>

                    <!-- Documents Accordion -->
                    <div class="content-group" id="group-docs" style="display:none;">
                        <label class="group-header">
                            <input type="checkbox" id="check-all-docs" checked />
                            <strong>Media Documents (<span id="count-docs-label">0</span> files)</strong>
                        </label>
                        <div class="group-items" id="items-docs-list">
                            <!-- Populated via JS -->
                        </div>
                    </div>
                </div>

                <!-- Right: Feature Toggles -->
                <div class="curate-col">
                    <div class="col-title">AI Commerce & Action Features</div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name">🛒 Conversational Add-to-Cart</div>
                            <div class="feature-desc">Stages recommended products directly into the customer's active cart via WooCommerce AJAX.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-add-to-cart" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name">🔍 Real-Time Stock & Price Verification</div>
                            <div class="feature-desc">Deterministically verifies live inventory and sale prices from the database before the AI responds.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-live-stock" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name">⚡ Smart Sizing & Product Comparison</div>
                            <div class="feature-desc">Compares attributes, dimensions, and specifications to explain differences clearly.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-comparison" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name">📅 In-Chat Appointment Booking</div>
                            <div class="feature-desc">Allows clients to select dates and schedule consultation slots within the chat bubble.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-booking" />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="feature-item">
                        <div class="feature-info">
                            <div class="feature-name">🎯 Pre-Sale Lead Capture</div>
                            <div class="feature-desc">Captures visitor email and phone when they request custom quotes or help.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="feat-lead-capture" checked />
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button type="button" class="btn btn-secondary btn-back" data-goto="2">&larr; Back</button>
                <button type="button" class="btn btn-primary" id="btn-start-sync">
                    Begin AI Knowledge Training &rarr;
                </button>
            </div>
        </div>

        <!-- =================== STEP 4: ASYNC INGESTION PROGRESS =================== -->
        <div class="wizard-pane" id="pane-step-4">
            <h2 class="pane-title">Training AI Knowledge Base...</h2>
            <p class="pane-subtitle">Content is securely chunked, vectorized, and embedded in small batches to protect server resources.</p>

            <div class="progress-container">
                <div class="progress-bar-wrap">
                    <div class="progress-bar-fill" id="sync-progress-fill" style="width: 0%;"></div>
                </div>
                <div class="progress-status-row">
                    <span id="sync-status-label">Initializing ingestion queue...</span>
                    <span id="sync-percent-label">0%</span>
                </div>
            </div>

            <!-- Terminal-style Log -->
            <div class="terminal-log" id="sync-terminal-log">
                <div class="log-line info">[INIT] Preparing content extraction batches...</div>
            </div>

            <div class="wizard-actions" style="margin-top: 24px;">
                <div></div>
                <button type="button" class="btn btn-primary" id="btn-to-step-5" disabled>
                    Finalize & Test Assistant &rarr;
                </button>
            </div>
        </div>

        <!-- =================== STEP 5: LAUNCH & TEST =================== -->
        <div class="wizard-pane" id="pane-step-5">
            <div class="success-banner">
                <div class="success-icon">✓</div>
                <div>
                    <h3 style="margin:0 0 4px 0; font-size:18px;">Your AI Business Assistant is Trained & Ready!</h3>
                    <p style="margin:0; font-size:13px; color:#475569;">
                        The chatbot has indexed your selected store content and is ready to assist shoppers.
                    </p>
                </div>
            </div>

            <div class="launch-grid">
                <div class="launch-settings">
                    <h4 style="margin-top:0;">Widget Visibility & Controls</h4>

                    <div class="feature-item" style="border:none; padding:12px 0;">
                        <div class="feature-info">
                            <div class="feature-name">Enable Public Chat Widget</div>
                            <div class="feature-desc">Display the interactive chat bubble on all public pages.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="toggle-widget-public" checked />
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div style="margin-top: 16px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
                        <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">Assistant ID</div>
                        <code id="display-assistant-id" style="font-size:13px; color:#2563eb; background:#fff; padding:4px 8px; border-radius:4px; border:1px solid #cbd5e1; display:inline-block;">ast_...</code>
                    </div>

                    <div style="margin-top: 24px;">
                        <a href="<?php echo esc_url(home_url()); ?>" target="_blank" class="btn btn-secondary" style="display:inline-block; text-decoration:none;">
                            Preview on Your Live Website &rarr;
                        </a>
                    </div>
                </div>

                <div class="launch-preview-card">
                    <h4>Simulated Widget Preview</h4>
                    <div class="preview-chat-box">
                        <div class="chat-mock-header">
                            <span class="mock-dot"></span>
                            <span id="preview-ast-name">AI Shopping Assistant</span>
                        </div>
                        <div class="chat-mock-body">
                            <div class="mock-bubble assistant" id="preview-welcome-msg">
                                Hi! Welcome to our store. I'm your AI Shopping Assistant. Looking for a specific product or need a recommendation?
                            </div>
                            <div class="mock-bubble user">
                                Do you have anything under $50?
                            </div>
                            <div class="mock-bubble assistant">
                                Yes! I found several top-rated items matching your budget. Let me know if you would like me to check stock or add any to your cart!
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wizard-actions">
                <button type="button" class="btn btn-secondary" id="btn-re-run-wizard">Re-run Wizard</button>
                <button type="button" class="btn btn-primary" id="btn-finish-all">Save & Exit</button>
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
