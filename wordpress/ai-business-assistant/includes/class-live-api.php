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
        ]);
    }

    /**
     * Verify caller using the shared siteSecret generated during registration.
     */
    public function validate_crescelo_secret($request) {
        $stored_secret = get_option('ai_assistant_site_secret', '');
        if (empty($stored_secret)) {
            return true; // Allow initial handshake if not set
        }

        $incoming = $request->get_header('x-crescelo-secret');
        if (!$incoming) {
            $incoming = $request->get_param('secret');
        }

        return hash_equals($stored_secret, (string) $incoming);
    }

    public function health_check() {
        return rest_ensure_response([
            'status'     => 'ok',
            'timestamp'  => current_time('mysql'),
            'has_woo'    => class_exists('WooCommerce'),
            'site'       => get_bloginfo('name'),
        ]);
    }

    /**
     * Check real-time stock and price for a product or variation.
     */
    public function check_stock($request) {
        if (!class_exists('WooCommerce')) {
            return new WP_Error('no_woocommerce', 'WooCommerce is not installed on this site', ['status' => 400]);
        }

        $product_id = (int) $request->get_param('product_id');
        $sku        = sanitize_text_field($request->get_param('sku'));

        $product = null;
        if ($product_id > 0) {
            $product = wc_get_product($product_id);
        } elseif (!empty($sku)) {
            $pid = wc_get_product_id_by_sku($sku);
            if ($pid) {
                $product = wc_get_product($pid);
            }
        }

        if (!$product) {
            return new WP_Error('product_not_found', 'Product was not found by ID or SKU', ['status' => 404]);
        }

        return rest_ensure_response([
            'id'             => $product->get_id(),
            'title'          => $product->get_name(),
            'sku'            => $product->get_sku(),
            'price'          => $product->get_price(),
            'regular_price'  => $product->get_regular_price(),
            'sale_price'     => $product->get_sale_price(),
            'is_on_sale'     => $product->is_on_sale(),
            'stock_status'   => $product->get_stock_status(), // 'instock', 'outofstock', 'onbackorder'
            'stock_quantity' => $product->get_stock_quantity(),
            'is_in_stock'    => $product->is_in_stock(),
            'currency'       => get_woocommerce_currency_symbol(),
            'url'            => get_permalink($product->get_id()),
        ]);
    }
}
