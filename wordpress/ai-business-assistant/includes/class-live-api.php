<?php
/**
 * Crescelo Live Grounding REST API
 *
 * Exposes fast, lightweight REST endpoints for real-time inventory and pricing checks,
 * allowing the Crescelo LLM to deterministically verify data before responding.
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
                'product_id' => [
                    'description'       => 'WooCommerce Product ID',
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ($param) {
                        return is_numeric($param) && $param >= 0;
                    },
                ],
                'sku'        => [
                    'description'       => 'WooCommerce Product SKU',
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    /**
     * Verify caller using the shared siteSecret generated during registration.
     * Prevents unauthorized access and brute-force inspection.
     */
    public function validate_crescelo_secret($request) {
        $stored_secret = (string) get_option('ai_assistant_site_secret', '');

        // Secret MUST be configured and at least 16 characters long
        if (empty($stored_secret) || strlen($stored_secret) < 16) {
            return new WP_Error(
                'rest_forbidden',
                'AI Assistant site secret is not configured. Please complete the setup wizard.',
                ['status' => 403]
            );
        }

        // Header takes precedence, fallback to URL parameter
        $incoming = (string) $request->get_header('x-crescelo-secret');
        if (empty($incoming)) {
            $incoming = (string) $request->get_param('secret');
        }

        if (empty($incoming) || !hash_equals($stored_secret, $incoming)) {
            return new WP_Error(
                'rest_forbidden',
                'Invalid or missing Crescelo authentication secret.',
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
     * Check real-time stock and price for a product or variation.
     */
    public function check_stock($request) {
        if (!class_exists('WooCommerce')) {
            return new WP_Error('no_woocommerce', 'WooCommerce is not installed on this site', ['status' => 400]);
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

        if (!$product) {
            return new WP_Error('product_not_found', 'Product was not found by ID or SKU', ['status' => 404]);
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
}
