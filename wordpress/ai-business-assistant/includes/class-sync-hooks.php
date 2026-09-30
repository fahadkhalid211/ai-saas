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
        // Skip autosaves, revisions, or unapproved types
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        if (!in_array($post->post_type, ['page', 'post'], true) || $post->post_status !== 'publish') {
            return;
        }

        $assistant_id = get_option('ai_assistant_id', '');
        if (empty($assistant_id)) return;

        $item = [
            'id'           => $post_id,
            'title'        => $post->post_title,
            'postType'     => $post->post_type,
            'content'      => wp_strip_all_tags(strip_shortcodes($post->post_content)),
            'excerpt'      => wp_strip_all_tags($post->post_excerpt),
            'url'          => get_permalink($post_id),
            'dateModified' => $post->post_modified,
        ];

        $this->client->sync_item_async($assistant_id, 'update', 'pages', $item);
    }

    public function handle_post_delete($post_id) {
        $assistant_id = get_option('ai_assistant_id', '');
        if (empty($assistant_id)) return;

        $post = get_post($post_id);
        if (!$post || !in_array($post->post_type, ['page', 'post'], true)) return;

        $item = [
            'id'    => $post_id,
            'title' => $post->post_title,
        ];

        $this->client->sync_item_async($assistant_id, 'delete', 'pages', $item);
    }

    public function handle_product_save($product_id) {
        if (!class_exists('WooCommerce')) return;

        $assistant_id = get_option('ai_assistant_id', '');
        if (empty($assistant_id)) return;

        $product = wc_get_product($product_id);
        if (!$product || $product->get_status() !== 'publish') return;

        $cats = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'names']);
        $image_id = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

        $item = [
            'id'               => $product_id,
            'title'            => $product->get_name(),
            'sku'              => $product->get_sku(),
            'price'            => html_entity_decode(strip_tags(wc_price($product->get_price()))),
            'regularPrice'     => html_entity_decode(strip_tags(wc_price($product->get_regular_price()))),
            'salePrice'        => $product->is_on_sale() ? html_entity_decode(strip_tags(wc_price($product->get_sale_price()))) : '',
            'stockStatus'      => $product->get_stock_status(),
            'stockQuantity'    => $product->get_stock_quantity(),
            'categories'       => is_wp_error($cats) ? [] : $cats,
            'shortDescription' => wp_strip_all_tags(strip_shortcodes($product->get_short_description())),
            'description'      => wp_strip_all_tags(strip_shortcodes($product->get_description())),
            'url'              => get_permalink($product_id),
            'imageUrl'         => $image_url,
        ];

        $this->client->sync_item_async($assistant_id, 'update', 'products', $item);
    }

    public function handle_product_delete($product_id) {
        $assistant_id = get_option('ai_assistant_id', '');
        if (empty($assistant_id)) return;

        $item = [
            'id'    => $product_id,
            'title' => get_the_title($product_id),
        ];

        $this->client->sync_item_async($assistant_id, 'delete', 'products', $item);
    }
}
