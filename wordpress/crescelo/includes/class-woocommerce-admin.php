<?php
/**
 * Crescelo WooCommerce Admin Integrations & Visual Badges
 *
 * Provides visual badges and audit indicators for orders managed or cancelled
 * by the Crescelo AI Chatbot, with full compatibility for both High-Performance
 * Order Storage (HPOS) and legacy custom post type order tables.
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_WooCommerce_Admin {

    public function __construct() {
        if (!class_exists('WooCommerce')) {
            return;
        }

        // HPOS (High-Performance Order Storage) support hooks
        add_action('woocommerce_shop_order_list_table_custom_column', [$this, 'render_hpos_order_column'], 15, 2);

        // Legacy CPT orders list table hooks
        add_action('manage_shop_order_posts_custom_column', [$this, 'render_legacy_order_column'], 15, 2);

        // Single Order Edit screen indicator
        add_action('woocommerce_admin_order_data_after_order_details', [$this, 'render_order_edit_meta_box']);

        // Admin CSS for badges
        add_action('admin_head', [$this, 'output_admin_badge_styles']);
    }

    /**
     * Render badge on WooCommerce HPOS Orders table.
     *
     * @param string   $column Column key.
     * @param WC_Order $order  Order object.
     */
    public function render_hpos_order_column($column, $order) {
        if (!is_a($order, 'WC_Order')) {
            return;
        }

        if ($column === 'order_status' || $column === 'order_number') {
            $this->maybe_render_bot_cancelled_badge($order);
        }
    }

    /**
     * Render badge on legacy CPT orders table.
     *
     * @param string $column  Column key.
     * @param int    $post_id Post ID.
     */
    public function render_legacy_order_column($column, $post_id) {
        if ($column === 'order_status' || $column === 'order_title') {
            $order = wc_get_order($post_id);
            if ($order) {
                $this->maybe_render_bot_cancelled_badge($order);
            }
        }
    }

    /**
     * Helper to output visual badge if order was cancelled by AI Chatbot.
     *
     * @param WC_Order $order Order object.
     */
    private function maybe_render_bot_cancelled_badge($order) {
        $is_bot_cancelled = $order->get_meta('_crescelo_cancelled_by_bot');
        if ($is_bot_cancelled !== 'yes') {
            return;
        }

        $reason = $order->get_meta('_crescelo_cancellation_reason');
        $email  = $order->get_meta('_crescelo_cancelled_by_email');
        $time   = $order->get_meta('_crescelo_cancelled_at');

        $tooltip = esc_attr(sprintf(
            /* translators: 1: email, 2: reason, 3: timestamp */
            __('Cancelled by AI Chatbot upon customer request (%1$s) on %2$s. Reason: %3$s', 'crescelo'),
            $email ?: 'verified email',
            $time ?: 'recent chat',
            $reason ?: 'Customer chat request'
        ));

        echo '<span class="crescelo-badge-bot-cancelled" title="' . $tooltip . '">' .
             '<span class="crescelo-badge-icon">🤖</span> ' .
             esc_html__('Bot Cancelled', 'crescelo') .
             '</span>';
    }

    /**
     * Display a prominent admin notification box in the single order edit screen.
     *
     * @param WC_Order $order Order object.
     */
    public function render_order_edit_meta_box($order) {
        if (!is_a($order, 'WC_Order')) {
            return;
        }

        $is_bot_cancelled = $order->get_meta('_crescelo_cancelled_by_bot');
        if ($is_bot_cancelled !== 'yes') {
            return;
        }

        $reason = $order->get_meta('_crescelo_cancellation_reason');
        $email  = $order->get_meta('_crescelo_cancelled_by_email');
        $time   = $order->get_meta('_crescelo_cancelled_at');

        ?>
        <div class="crescelo-order-audit-banner" style="clear:both; margin-top:15px; padding:12px 16px; background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #ef4444; border-radius:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">🤖</span>
                <strong style="color:#991b1b; font-size:13px;"><?php esc_html_e('AI Chatbot Order Cancellation Audit', 'crescelo'); ?></strong>
            </div>
            <p style="margin:6px 0 0 24px; font-size:12px; color:#475569; line-height:1.5;">
                <?php
                printf(
                    /* translators: 1: verified email, 2: timestamp, 3: reason */
                    esc_html__('This order was automatically cancelled by the Crescelo AI Chatbot following verified customer request from %1$s on %2$s.', 'crescelo'),
                    '<strong>' . esc_html($email) . '</strong>',
                    '<strong>' . esc_html($time) . '</strong>'
                );
                ?>
                <br />
                <?php
                if (!empty($reason)) {
                    printf(
                        /* translators: 1: reason text */
                        esc_html__('Reason recorded: "%s"', 'crescelo'),
                        esc_html($reason)
                    );
                }
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * Inject badge styling for WooCommerce orders table.
     */
    public function output_admin_badge_styles() {
        $screen = get_current_screen();
        if (!$screen) {
            return;
        }

        // Only inject styles on WooCommerce order screens
        $valid_screens = ['shop_order', 'woocommerce_page_wc-orders', 'edit-shop_order'];
        if (!in_array($screen->id, $valid_screens, true) && strpos($screen->id, 'order') === false) {
            return;
        }

        ?>
        <style>
            .crescelo-badge-bot-cancelled {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: #fef2f2;
                color: #991b1b;
                border: 1px solid #fca5a5;
                border-radius: 9999px;
                padding: 2px 8px;
                font-size: 11px;
                font-weight: 600;
                line-height: 1.4;
                margin-top: 3px;
                cursor: help;
                box-shadow: 0 1px 2px rgba(239, 68, 68, 0.08);
            }
            .crescelo-badge-bot-cancelled:hover {
                background: #fee2e2;
                border-color: #f87171;
            }
            .crescelo-badge-icon {
                font-size: 11px;
            }
        </style>
        <?php
    }
}
