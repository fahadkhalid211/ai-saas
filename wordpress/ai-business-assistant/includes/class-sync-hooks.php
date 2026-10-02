<?php
/**
 * Real-time Content Synchronization Hooks
 *
 * Automatically notifies Crescelo when products, pages, or posts are modified or deleted,
 * ensuring the AI knowledge base remains 100% synchronized without manual re-crawling.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Sync_Hooks {

    private $client;

    public function __construct(Crescelo_Client $client) {
        $this->client = $client;

        // Post & Page lifecycle
        add_action('save_post', [$this, 'handle_post_save'], 20, 2);
        add_action('before_delete_post', [$this, 'handle_post_delete'], 20, 1);

        // WooCommerce Product lifecycle
        add_action('woocommerce_update_product', [$this, 'handle_product_save'], 20, 1);
        add_action('woocommerce_delete_product', [$this, 'handle_product_delete'], 20, 1);
    }

    public function handle_post_save($post_id, $post) {
        $post_id = absint($post_id);
        if ($post_id <= 0) return;

        // Skip autosaves, revisions, or unapproved types
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        if (!is_object($post) || !in_array($post->post_type, ['page', 'post'], true) || $post->post_status !== 'publish') {
            return;
        }

        // Authorization check: only process when the current context allows editing
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $item = [
            'id'           => $post_id,
            'title'        => esc_html($post->post_title),
            'postType'     => sanitize_key($post->post_type),
            'content'      => wp_strip_all_tags(strip_shortcodes($post->post_content)),
            'excerpt'      => wp_strip_all_tags($post->post_excerpt),
            'url'          => esc_url_raw(get_permalink($post_id)),
            'dateModified' => sanitize_text_field($post->post_modified),
        ];

        $this->client->sync_item_async($assistant_id, 'update', 'pages', $item);
    }

    public function handle_post_delete($post_id) {
        $post_id = absint($post_id);
        if ($post_id <= 0) return;

        if (!current_user_can('delete_post', $post_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $post = get_post($post_id);
        if (!$post || !in_array($post->post_type, ['page', 'post'], true)) return;

        $item = [
            'id'    => $post_id,
            'title' => esc_html($post->post_title),
        ];

        $this->client->sync_item_async($assistant_id, 'delete', 'pages', $item);
    }

    public function handle_product_save($product_id) {
        $product_id = absint($product_id);
        if ($product_id <= 0 || !class_exists('WooCommerce')) return;

        if (!current_user_can('edit_post', $product_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $product = wc_get_product($product_id);
        if (!$product || $product->get_status() !== 'publish') return;

        $cats     = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'names']);
        $image_id = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

        $item = [
            'id'               => $product_id,
            'title'            => esc_html($product->get_name()),
            'sku'              => sanitize_text_field($product->get_sku()),
            'price'            => html_entity_decode(strip_tags(wc_price($product->get_price()))),
            'regularPrice'     => html_entity_decode(strip_tags(wc_price($product->get_regular_price()))),
            'salePrice'        => $product->is_on_sale() ? html_entity_decode(strip_tags(wc_price($product->get_sale_price()))) : '',
            'stockStatus'      => sanitize_text_field($product->get_stock_status()),
            'stockQuantity'    => $product->get_stock_quantity() !== null ? intval($product->get_stock_quantity()) : null,
            'categories'       => is_wp_error($cats) ? [] : array_map('esc_html', (array) $cats),
            'shortDescription' => wp_strip_all_tags(strip_shortcodes($product->get_short_description())),
            'description'      => wp_strip_all_tags(strip_shortcodes($product->get_description())),
            'url'              => esc_url_raw(get_permalink($product_id)),
            'imageUrl'         => $image_url ? esc_url_raw($image_url) : '',
        ];

        $this->client->sync_item_async($assistant_id, 'update', 'products', $item);
    }

    public function handle_product_delete($product_id) {
        $product_id = absint($product_id);
        if ($product_id <= 0) return;

        if (!current_user_can('delete_post', $product_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $item = [
            'id'    => $product_id,
            'title' => esc_html(get_the_title($product_id)),
        ];

        $this->client->sync_item_async($assistant_id, 'delete', 'products', $item);
    }
}
