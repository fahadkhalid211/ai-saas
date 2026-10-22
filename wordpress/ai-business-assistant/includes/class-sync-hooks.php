<?php
/**
 * Real-time Content Synchronization Hooks
 *
 * Automatically notifies Crescelo when products, pages, posts, or any allowed
 * custom post types are created, modified, or deleted, ensuring the AI Knowledge Base
 * remains 100% synchronized in real time without manual re-crawling.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Sync_Hooks {

    private $client;

    public function __construct(Crescelo_Client $client) {
        $this->client = $client;

        // Dynamic Post & Custom Post Type lifecycle
        add_action('save_post', [$this, 'handle_post_save'], 20, 2);
        add_action('before_delete_post', [$this, 'handle_post_delete'], 20, 1);
        // Unpublishing (draft, private, trash) must remove the content from the knowledge base as well.
        add_action('transition_post_status', [$this, 'handle_status_transition'], 20, 3);

        // WooCommerce Product lifecycle
        if (class_exists('WooCommerce')) {
            add_action('woocommerce_update_product', [$this, 'handle_product_save'], 20, 1);
            add_action('woocommerce_delete_product', [$this, 'handle_product_delete'], 20, 1);
        }
    }

    /**
     * Get allowed post types for automatic syncing.
     */
    private function get_allowed_post_types() {
        $allowed = get_option('ai_assistant_allowed_post_types', null);
        if (is_array($allowed) && !empty($allowed)) {
            return array_map('sanitize_key', $allowed);
        }

        $defaults = ['page', 'post'];
        if (class_exists('WooCommerce')) {
            $defaults[] = 'product';
        }
        return $defaults;
    }

    /**
     * Handle saving/updating any post, page, or custom post type.
     */
    public function handle_post_save($post_id, $post) {
        $post_id = absint($post_id);
        if ($post_id <= 0) return;

        // Skip autosaves, revisions, or unapproved states
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        if (!is_object($post) || $post->post_status !== 'publish') {
            return;
        }

        // Check if auto-sync is enabled
        $auto_sync = (bool) get_option('ai_assistant_auto_sync', true);
        if (!$auto_sync) return;

        $post_type = sanitize_key($post->post_type);

        // Products are handled with richer metadata by handle_product_save
        if ($post_type === 'product' && class_exists('WooCommerce')) {
            return;
        }

        $allowed_types = $this->get_allowed_post_types();
        if (!in_array($post_type, $allowed_types, true)) {
            return;
        }

        // Authorization check: only process when the current context allows editing
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        // Taxonomies
        $post_taxonomies = [];
        $categories      = [];
        $tags            = [];
        $tax_objects     = get_object_taxonomies($post_type, 'objects');

        foreach ($tax_objects as $tax_name => $tax_obj) {
            if (!$tax_obj->public && !$tax_obj->show_ui) continue;
            $terms = wp_get_post_terms($post_id, $tax_name, ['fields' => 'names']);
            if (!is_wp_error($terms) && !empty($terms) && is_array($terms)) {
                $term_names = array_map('esc_html', $terms);
                $post_taxonomies[$tax_obj->labels->name ?: $tax_name] = $term_names;
                if ($tax_name === 'category') $categories = $term_names;
                if ($tax_name === 'post_tag') $tags = $term_names;
            }
        }

        // Custom Fields / Meta
        $clean_meta = [];
        if ((bool) get_option('ai_assistant_scrape_include_meta', true)) {
            $raw_meta = get_post_meta($post_id);
            if (is_array($raw_meta)) {
                foreach ($raw_meta as $key => $values) {
                    if (substr($key, 0, 1) === '_') continue;
                    $val = maybe_unserialize($values[0] ?? '');
                    if (is_string($val) || is_numeric($val)) {
                        $val_str = trim((string) $val);
                        if ($val_str !== '' && strlen($val_str) < 3000) {
                            $clean_meta[sanitize_text_field($key)] = sanitize_text_field($val_str);
                        }
                    }
                }
            }
        }

        // Author Name
        $author_name = '';
        if (!empty($post->post_author)) {
            $author_name = get_the_author_meta('display_name', $post->post_author);
        }

        // Featured Image
        $image_id  = get_post_thumbnail_id($post_id);
        $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

        // Content
        $clean_content = wp_strip_all_tags(strip_shortcodes(preg_replace('/<!--(.|\s)*?-->/', '', $post->post_content)));
        $clean_excerpt = wp_strip_all_tags($post->post_excerpt ?: wp_trim_words($post->post_content, 40));

        $item = [
            'id'            => $post_id,
            'title'         => esc_html($post->post_title ?: ('Untitled #' . $post_id)),
            'postType'      => $post_type,
            'content'       => trim($clean_content),
            'excerpt'       => trim($clean_excerpt),
            'url'           => esc_url_raw(get_permalink($post_id)),
            'imageUrl'      => $image_url ? esc_url_raw($image_url) : '',
            'author'        => sanitize_text_field($author_name),
            'categories'    => $categories,
            'tags'          => $tags,
            'taxonomies'    => $post_taxonomies,
            'meta'          => $clean_meta,
            'dateModified'  => sanitize_text_field($post->post_modified),
        ];

        $this->client->sync_item_async($assistant_id, 'update', $post_type, $item);
    }

    /**
     * Remove an item from the knowledge base when it stops being published.
     */
    public function handle_status_transition($new_status, $old_status, $post) {
        if ($old_status !== 'publish' || $new_status === 'publish' || !is_object($post)) {
            return;
        }
        if (wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID)) {
            return;
        }
        if (!(bool) get_option('ai_assistant_auto_sync', true)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $post_type = sanitize_key($post->post_type);
        if (!in_array($post_type, $this->get_allowed_post_types(), true)) {
            return;
        }

        $batch_type = ($post_type === 'product' && class_exists('WooCommerce')) ? 'products' : $post_type;
        $this->client->sync_item_async($assistant_id, 'delete', $batch_type, [
            'id'    => absint($post->ID),
            'title' => esc_html($post->post_title),
        ]);
    }

    /**
     * Handle deletion of any post, page, or custom post type.
     */
    public function handle_post_delete($post_id) {
        $post_id = absint($post_id);
        if ($post_id <= 0) return;

        if (!current_user_can('delete_post', $post_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $post = get_post($post_id);
        if (!$post) return;

        $post_type = sanitize_key($post->post_type);
        $allowed_types = $this->get_allowed_post_types();

        if (!in_array($post_type, $allowed_types, true)) {
            return;
        }

        // WooCommerce products are removed by handle_product_delete under the 'products' key.
        if ($post_type === 'product' && class_exists('WooCommerce')) {
            return;
        }

        $item = [
            'id'    => $post_id,
            'title' => esc_html($post->post_title),
        ];

        $this->client->sync_item_async($assistant_id, 'delete', $post_type, $item);
    }

    /**
     * Handle saving/updating WooCommerce products with rich attributes & pricing.
     */
    public function handle_product_save($product_id) {
        $product_id = absint($product_id);
        if ($product_id <= 0 || !class_exists('WooCommerce')) return;

        $allowed_types = $this->get_allowed_post_types();
        if (!in_array('product', $allowed_types, true)) {
            return;
        }

        if (!current_user_can('edit_post', $product_id)) {
            return;
        }

        $assistant_id = sanitize_text_field(get_option('ai_assistant_id', ''));
        if (empty($assistant_id)) return;

        $product = wc_get_product($product_id);
        if (!$product || $product->get_status() !== 'publish') return;

        $cats     = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'names']);
        $tags     = wp_get_post_terms($product_id, 'product_tag', ['fields' => 'names']);
        $image_id = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

        // Extract Attributes
        $attributes = [];
        foreach ($product->get_attributes() as $attr) {
            if (is_object($attr)) {
                $attr_name = wc_attribute_label($attr->get_name());
                if ($attr->is_taxonomy()) {
                    $terms = wc_get_product_terms($product_id, $attr->get_name(), ['fields' => 'names']);
                    $attributes[$attr_name] = is_array($terms) ? array_map('esc_html', $terms) : [];
                } else {
                    $options = $attr->get_options();
                    $attributes[$attr_name] = is_array($options) ? array_map('esc_html', $options) : [];
                }
            }
        }

        $item = [
            'id'               => $product_id,
            'title'            => esc_html($product->get_name()),
            'postType'         => 'product',
            'sku'              => sanitize_text_field($product->get_sku()),
            'price'            => html_entity_decode(strip_tags(wc_price($product->get_price()))),
            'regularPrice'     => html_entity_decode(strip_tags(wc_price($product->get_regular_price()))),
            'salePrice'        => $product->is_on_sale() ? html_entity_decode(strip_tags(wc_price($product->get_sale_price()))) : '',
            'stockStatus'      => sanitize_text_field($product->get_stock_status()),
            'stockQuantity'    => $product->get_stock_quantity() !== null ? intval($product->get_stock_quantity()) : null,
            'categories'       => is_wp_error($cats) ? [] : array_map('esc_html', (array) $cats),
            'tags'             => is_wp_error($tags) ? [] : array_map('esc_html', (array) $tags),
            'attributes'       => $attributes,
            'shortDescription' => wp_strip_all_tags(strip_shortcodes($product->get_short_description())),
            'description'      => wp_strip_all_tags(strip_shortcodes($product->get_description())),
            'url'              => esc_url_raw(get_permalink($product_id)),
            'imageUrl'         => $image_url ? esc_url_raw($image_url) : '',
        ];

        $this->client->sync_item_async($assistant_id, 'update', 'products', $item);
    }

    /**
     * Handle deleting WooCommerce products.
     */
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
