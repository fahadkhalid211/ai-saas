<?php
/**
 * Crescelo Live Grounding REST API
 *
 * Exposes fast, lightweight REST endpoints for real-time inventory and pricing checks,
 * allowing the Crescelo LLM to deterministically verify data before responding.
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Live_API {

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('crescelo/v1', '/health', [
            'methods'             => 'GET',
            'callback'            => [$this, 'health_check'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('crescelo/v1', '/stock-check', [
            'methods'             => 'GET',
            'callback'            => [$this, 'check_stock'],
            'permission_callback' => [$this, 'validate_crescelo_secret'],
            'args'                => [
                'product_id'  => [
                    'description'       => esc_html__('WooCommerce Product ID', 'crescelo'),
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                ],
                'product_ids' => [
                    'description'       => esc_html__('Comma-separated WooCommerce Product IDs', 'crescelo'),
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'sku'         => [
                    'description'       => esc_html__('WooCommerce Product SKU', 'crescelo'),
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        register_rest_route('crescelo/v1', '/order-lookup', [
            'methods'             => 'GET',
            'callback'            => [$this, 'lookup_order'],
            'permission_callback' => [$this, 'validate_crescelo_secret'],
            'args'                => [
                'order_id' => [
                    'description'       => esc_html__('WooCommerce Order ID or Number', 'crescelo'),
                    'type'              => 'integer',
                    'required'          => true,
                    'sanitize_callback' => 'absint',
                ],
                'email'    => [
                    'description'       => esc_html__('Customer Billing Email for 2FA Verification', 'crescelo'),
                    'type'              => 'string',
                    'required'          => true,
                    'sanitize_callback' => 'sanitize_email',
                ],
            ],
        ]);

        register_rest_route('crescelo/v1', '/order-cancel', [
            'methods'             => 'POST',
            'callback'            => [$this, 'cancel_order'],
            'permission_callback' => [$this, 'validate_crescelo_secret'],
            'args'                => [
                'order_id' => [
                    'description'       => esc_html__('WooCommerce Order ID or Number', 'crescelo'),
                    'type'              => 'integer',
                    'required'          => true,
                    'sanitize_callback' => 'absint',
                ],
                'email'    => [
                    'description'       => esc_html__('Customer Billing Email for Verification', 'crescelo'),
                    'type'              => 'string',
                    'required'          => true,
                    'sanitize_callback' => 'sanitize_email',
                ],
                'reason'   => [
                    'description'       => esc_html__('Cancellation reason', 'crescelo'),
                    'type'              => 'string',
                    'required'          => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    /**
     * Verify caller using the shared siteSecret generated during registration.
     * Prevents unauthorized access and brute-force inspection.
     *
     * @param WP_REST_Request $request REST request object.
     * @return bool|WP_Error
     */
    public function validate_crescelo_secret($request) {
        $stored_secret = (string) crescelo_get_option('site_secret', '');

        // Secret MUST be configured and at least 16 characters long
        if (empty($stored_secret) || strlen($stored_secret) < 16) {
            return new WP_Error(
                'rest_forbidden',
                esc_html__('AI Assistant site secret is not configured. Please complete the setup wizard.', 'crescelo'),
                ['status' => 403]
            );
        }

        // Header authentication only (prevent secret leakage in server URL logs)
        $incoming = (string) $request->get_header('x-crescelo-secret');

        if (empty($incoming) || !hash_equals($stored_secret, $incoming)) {
            return new WP_Error(
                'rest_forbidden',
                esc_html__('Invalid or missing Crescelo authentication secret.', 'crescelo'),
                ['status' => 401]
            );
        }

        return true;
    }

    public function health_check() {
        return rest_ensure_response([
            'status'    => 'ok',
            'timestamp' => current_time('mysql'),
            'has_woo'   => class_exists('WooCommerce'),
            'site'      => esc_html(get_bloginfo('name')),
        ]);
    }

    /**
     * Check real-time stock and price for a product or variation, or a batch of products.
     *
     * @param WP_REST_Request $request REST request object.
     * @return WP_REST_Response|WP_Error
     */
    public function check_stock($request) {
        if (!class_exists('WooCommerce')) {
            return new WP_Error(
                'no_woocommerce',
                esc_html__('WooCommerce is not installed on this site', 'crescelo'),
                ['status' => 400]
            );
        }

        if (!crescelo_get_option('ecommerce_enabled', true)) {
            return new WP_Error(
                'ecommerce_disabled',
                esc_html__('E-Commerce features are currently disabled in store settings.', 'crescelo'),
                ['status' => 403]
            );
        }

        $product_ids_param = $request->get_param('product_ids');
        if (!empty($product_ids_param)) {
            $raw_ids = array_slice(array_filter(array_map('absint', explode(',', (string) $product_ids_param))), 0, 50);
            $results = [];
            foreach ($raw_ids as $pid) {
                $p = wc_get_product($pid);
                if (!$p || $p->get_status() !== 'publish') {
                    continue;
                }
                $results[] = [
                    'id'             => absint($p->get_id()),
                    'title'          => esc_html($p->get_name()),
                    'sku'            => esc_attr($p->get_sku()),
                    'price'          => $p->get_price() !== '' ? floatval($p->get_price()) : null,
                    'stock_status'   => esc_attr($p->get_stock_status()),
                    'stock_quantity' => $p->get_stock_quantity() !== null ? intval($p->get_stock_quantity()) : null,
                    'is_in_stock'    => (bool) $p->is_in_stock(),
                    'url'            => esc_url_raw(get_permalink($p->get_id())),
                ];
            }
            return rest_ensure_response([
                'items' => $results,
                'count' => count($results),
            ]);
        }

        $product_id = absint($request->get_param('product_id'));
        $sku        = sanitize_text_field($request->get_param('sku') ?? '');

        $product = null;
        if ($product_id > 0) {
            $product = wc_get_product($product_id);
        } elseif (!empty($sku)) {
            $pid = wc_get_product_id_by_sku($sku);
            if ($pid > 0) {
                $product = wc_get_product($pid);
            }
        }

        if (!$product || $product->get_status() !== 'publish') {
            return new WP_Error(
                'product_not_found',
                esc_html__('Product was not found by ID or SKU, or is not published.', 'crescelo'),
                ['status' => 404]
            );
        }

        $price         = $product->get_price();
        $regular_price = $product->get_regular_price();
        $sale_price    = $product->get_sale_price();

        return rest_ensure_response([
            'id'             => absint($product->get_id()),
            'title'          => esc_html($product->get_name()),
            'sku'            => esc_attr($product->get_sku()),
            'price'          => $price !== '' ? floatval($price) : null,
            'regular_price'  => $regular_price !== '' ? floatval($regular_price) : null,
            'sale_price'     => $sale_price !== '' ? floatval($sale_price) : null,
            'is_on_sale'     => (bool) $product->is_on_sale(),
            'stock_status'   => esc_attr($product->get_stock_status()), // 'instock', 'outofstock', 'onbackorder'
            'stock_quantity' => $product->get_stock_quantity() !== null ? intval($product->get_stock_quantity()) : null,
            'is_in_stock'    => (bool) $product->is_in_stock(),
            'currency'       => esc_html(get_woocommerce_currency_symbol()),
            'url'            => esc_url_raw(get_permalink($product->get_id())),
        ]);
    }

    /**
     * Check real-time order status, fulfillment, and shipment tracking with 2FA email match.
     *
     * @param WP_REST_Request $request REST request object.
     * @return WP_REST_Response|WP_Error
     */
    public function lookup_order($request) {
        if (!class_exists('WooCommerce')) {
            return new WP_Error(
                'no_woocommerce',
                esc_html__('WooCommerce is not installed on this site', 'crescelo'),
                ['status' => 400]
            );
        }

        if (!crescelo_get_option('ecommerce_enabled', true)) {
            return new WP_Error(
                'ecommerce_disabled',
                esc_html__('E-Commerce features are currently disabled in store settings.', 'crescelo'),
                ['status' => 403]
            );
        }

        $order_id = absint($request->get_param('order_id'));
        $email    = sanitize_email(strtolower(trim((string) $request->get_param('email'))));

        if ($order_id <= 0) {
            return new WP_Error('invalid_order_id', esc_html__('Please provide a valid Order ID.', 'crescelo'), ['status' => 400]);
        }
        if (empty($email) || !is_email($email)) {
            return new WP_Error('invalid_email', esc_html__('Please provide a valid billing email address for verification.', 'crescelo'), ['status' => 400]);
        }

        $order = wc_get_order($order_id);
        if (!$order && function_exists('wc_get_orders')) {
            $orders = wc_get_orders([
                'limit'      => 1,
                'meta_key'   => '_order_number',
                'meta_value' => (string) $order_id,
            ]);
            if (!empty($orders)) {
                $order = $orders[0];
            }
        }

        $billing_email = $order ? sanitize_email(strtolower(trim($order->get_billing_email()))) : '';

        // Unified 404 to prevent Order ID enumeration/timing attacks
        if (!$order || empty($billing_email) || $billing_email !== $email) {
            return new WP_Error(
                'order_lookup_failed',
                esc_html__('Sorry, no order could be found matching those details. Please check the order number and billing email address.', 'crescelo'),
                ['status' => 404]
            );
        }

        $status       = $order->get_status();
        $status_label = wc_get_order_status_name($status);

        // Extract Tracking Items from popular shipping plugins and meta
        $tracking_items = [];
        $wc_tracking = $order->get_meta('_wc_shipment_tracking_items', true);
        if (is_array($wc_tracking)) {
            foreach ($wc_tracking as $item) {
                if (!empty($item['tracking_number'])) {
                    $tracking_items[] = [
                        'provider'        => !empty($item['custom_tracking_provider']) ? $item['custom_tracking_provider'] : ($item['tracking_provider'] ?? ''),
                        'tracking_number' => $item['tracking_number'],
                        'tracking_url'    => !empty($item['custom_tracking_link']) ? $item['custom_tracking_link'] : ($item['formatted_tracking_link'] ?? ''),
                        'date_shipped'    => !empty($item['date_shipped']) ? date_i18n(get_option('date_format'), $item['date_shipped']) : '',
                    ];
                }
            }
        }

        // ShipStation Tracking
        $ss_number = $order->get_meta('_shipstation_tracking_number', true);
        if (!empty($ss_number)) {
            $tracking_items[] = [
                'provider'        => $order->get_meta('_shipstation_carrier', true) ?: 'ShipStation',
                'tracking_number' => $ss_number,
                'tracking_url'    => '',
                'date_shipped'    => '',
            ];
        }

        // AfterShip Tracking
        $as_number = $order->get_meta('_aftership_tracking_number', true);
        if (!empty($as_number)) {
            $tracking_items[] = [
                'provider'        => $order->get_meta('_aftership_tracking_provider', true) ?: 'AfterShip',
                'tracking_number' => $as_number,
                'tracking_url'    => '',
                'date_shipped'    => '',
            ];
        }

        // Generic tracking meta
        $generic_tracking = $order->get_meta('_tracking_number', true);
        if (!empty($generic_tracking) && empty($tracking_items)) {
            $tracking_items[] = [
                'provider'        => $order->get_meta('_shipping_provider', true) ?: 'Carrier',
                'tracking_number' => $generic_tracking,
                'tracking_url'    => $order->get_meta('_tracking_url', true) ?: '',
                'date_shipped'    => '',
            ];
        }

        $is_dispatched = ($status === 'completed' || !empty($tracking_items));

        // Format items summary
        $items_summary = [];
        foreach ($order->get_items() as $item) {
            $items_summary[] = [
                'name'     => esc_html($item->get_name()),
                'quantity' => absint($item->get_quantity()),
                'total'    => html_entity_decode(strip_tags(wc_price($item->get_total()))),
            ];
        }

        $date_created = $order->get_date_created() ? $order->get_date_created()->date_i18n(get_option('date_format') . ' ' . get_option('time_format')) : '';

        return rest_ensure_response([
            'order_id'       => $order_id,
            'status'         => $status,
            'status_label'   => $status_label,
            'is_dispatched'  => $is_dispatched,
            'total'          => html_entity_decode(strip_tags($order->get_formatted_order_total())),
            'currency'       => esc_html(get_woocommerce_currency_symbol()),
            'date_created'   => $date_created,
            'shipping_method'=> esc_html($order->get_shipping_method() ?: 'Standard Shipping'),
            'tracking'       => $tracking_items,
            'items'          => $items_summary,
            'customer_name'  => esc_html($order->get_formatted_billing_full_name()),
            'cancelled_by_bot' => ($order->get_meta('_crescelo_cancelled_by_bot') === 'yes'),
        ]);
    }

    /**
     * Cancel an unfulfilled WooCommerce order on customer request with verification and admin audit trail.
     *
     * @param WP_REST_Request $request REST request object.
     * @return WP_REST_Response|WP_Error
     */
    public function cancel_order($request) {
        if (!class_exists('WooCommerce')) {
            return new WP_Error(
                'no_woocommerce',
                esc_html__('WooCommerce is not installed on this site', 'crescelo'),
                ['status' => 400]
            );
        }

        if (!crescelo_get_option('ecommerce_enabled', true)) {
            return new WP_Error(
                'ecommerce_disabled',
                esc_html__('E-Commerce features are currently disabled in store settings.', 'crescelo'),
                ['status' => 403]
            );
        }

        $allow_cancel = (bool) crescelo_get_option('allow_order_cancellation', true);
        if (!$allow_cancel) {
            return new WP_Error(
                'cancellation_disabled',
                esc_html__('Self-service order cancellation is currently disabled by store administration.', 'crescelo'),
                ['status' => 403]
            );
        }

        $order_id = absint($request->get_param('order_id'));
        $email    = sanitize_email(strtolower(trim((string) $request->get_param('email'))));
        $reason   = sanitize_text_field($request->get_param('reason') ?? 'Customer request via AI Chatbot');

        if ($order_id <= 0) {
            return new WP_Error('invalid_order_id', esc_html__('Please provide a valid Order ID.', 'crescelo'), ['status' => 400]);
        }
        if (empty($email) || !is_email($email)) {
            return new WP_Error('invalid_email', esc_html__('Please provide a valid billing email address for verification.', 'crescelo'), ['status' => 400]);
        }

        $order = wc_get_order($order_id);
        if (!$order && function_exists('wc_get_orders')) {
            $orders = wc_get_orders([
                'limit'      => 1,
                'meta_key'   => '_order_number',
                'meta_value' => (string) $order_id,
            ]);
            if (!empty($orders)) {
                $order = $orders[0];
            }
        }

        $billing_email = $order ? sanitize_email(strtolower(trim($order->get_billing_email()))) : '';

        // Unified 404 to prevent Order ID enumeration
        if (!$order || empty($billing_email) || $billing_email !== $email) {
            return new WP_Error(
                'order_lookup_failed',
                esc_html__('Sorry, no order could be found matching those details. Please check the order number and billing email address.', 'crescelo'),
                ['status' => 404]
            );
        }

        $status = $order->get_status();

        if ($status === 'cancelled') {
            return rest_ensure_response([
                'success'           => true,
                'already_cancelled' => true,
                'order_id'          => $order_id,
                'status'            => 'cancelled',
                'message'           => sprintf(esc_html__('Order #%d was already cancelled.', 'crescelo'), $order_id),
            ]);
        }

        // Only allow cancellation for unfulfilled statuses
        $cancellable_statuses = ['pending', 'processing', 'on-hold'];
        if (!in_array($status, $cancellable_statuses, true)) {
            $status_name = wc_get_order_status_name($status);
            return new WP_Error(
                'cannot_cancel_status',
                sprintf(
                    esc_html__('Order #%1$d is currently "%2$s" and has already entered fulfillment or shipping. It cannot be cancelled automatically. Please contact our support team.', 'crescelo'),
                    $order_id,
                    $status_name
                ),
                ['status' => 400]
            );
        }

        // Payment status & gateway refund note
        $was_paid = method_exists($order, 'is_paid') ? $order->is_paid() : ($status === 'processing');
        $payment_method_title = $order->get_payment_method_title() ?: 'Payment Gateway';

        $audit_note = sprintf(
            /* translators: 1: email, 2: reason, 3: payment info */
            __('Order cancelled by AI Assistant on verified customer request (%1$s). Reason: %2$s. %3$s', 'crescelo'),
            $email,
            $reason,
            $was_paid
                ? sprintf(__('Payment was previously captured (%s via %s). Manual gateway refund may be required.', 'crescelo'), html_entity_decode(strip_tags($order->get_formatted_order_total())), $payment_method_title)
                : __('Order was not paid or funds not captured.', 'crescelo')
        );

        $order->update_status('cancelled', $audit_note);
        $order->update_meta_data('_crescelo_cancelled_by_bot', 'yes');
        $order->update_meta_data('_crescelo_cancellation_reason', $reason);
        $order->update_meta_data('_crescelo_cancelled_by_email', $email);
        $order->update_meta_data('_crescelo_cancelled_at', current_time('mysql'));
        $order->update_meta_data('_crescelo_refund_required', $was_paid ? 'yes' : 'no');
        $order->save();

        return rest_ensure_response([
            'success'   => true,
            'order_id'  => $order_id,
            'status'    => 'cancelled',
            'was_paid'  => (bool) $was_paid,
            'message'   => sprintf(esc_html__('Order #%d has been successfully cancelled.', 'crescelo'), $order_id),
            'timestamp' => current_time('mysql'),
        ]);
    }
}
