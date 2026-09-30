<?php
/**
 * Site Scanner and Content Reader
 *
 * Inspects the WordPress database and content structure, preparing clean,
 * structured representations of pages, WooCommerce products, and media documents.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Site_Scanner {

    /**
     * Run a lightweight diagnostic scan of the entire site.
     * Returns structured summary metrics without loading heavy content into RAM.
     */
    public function scan_site_summary() {
        global $wpdb;

        $has_woo = class_exists('WooCommerce');
        $has_booking = false;
        $booking_systems = [];

        // Detect booking plugins
        if (defined('AMELIA_VERSION') || class_exists('AmeliaBooking\Plugin')) {
            $has_booking = true;
            $booking_systems[] = 'Amelia Booking';
        }
        if (defined('BOOKLY_VERSION') || class_exists('Bookly\Lib\Plugin')) {
            $has_booking = true;
            $booking_systems[] = 'Bookly';
        }
        if (defined('SSA_VERSION') || class_exists('Simply_Schedule_Appointments')) {
            $has_booking = true;
            $booking_systems[] = 'Simply Schedule Appointments';
        }
        if (class_exists('WC_Bookings')) {
            $has_booking = true;
            $booking_systems[] = 'WooCommerce Bookings';
        }

        // Count published pages
        $page_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'page' AND post_status = 'publish'");

        // Sample key pages
        $key_pages = $wpdb->get_results(
            "SELECT ID, post_title, post_name FROM {$wpdb->posts} WHERE post_type = 'page' AND post_status = 'publish' ORDER BY menu_order ASC, post_date DESC LIMIT 20",
            ARRAY_A
        );

        // Count published blog posts
        $post_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'post' AND post_status = 'publish'");

        // Media Library Documents (PDF, Word, CSV, TXT)
        $doc_mimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv',
            'text/plain',
        ];
        $mimes_placeholder = "'" . implode("','", array_map('esc_sql', $doc_mimes)) . "'";
        $doc_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type IN ({$mimes_placeholder})");

        $sample_docs = $wpdb->get_results(
            "SELECT ID, post_title, post_mime_type, guid FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type IN ({$mimes_placeholder}) ORDER BY post_date DESC LIMIT 10",
            ARRAY_A
        );

        // WooCommerce Stats
        $woo_data = [
            'active'          => $has_woo,
            'total_products'  => 0,
            'categories'      => [],
            'attributes'      => [],
            'has_variations'  => false,
        ];

        if ($has_woo) {
            $product_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status = 'publish'");
            $woo_data['total_products'] = $product_count;

            // Product Categories
            $categories = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => true,
                'number'     => 30,
            ]);
            if (!is_wp_error($categories)) {
                foreach ($categories as $cat) {
                    $woo_data['categories'][] = [
                        'id'    => $cat->term_id,
                        'name'  => $cat->name,
                        'count' => $cat->count,
                    ];
                }
            }

            // Global Attributes
            if (function_exists('wc_get_attribute_taxonomies')) {
                $attrs = wc_get_attribute_taxonomies();
                foreach ($attrs as $attr) {
                    $woo_data['attributes'][] = $attr->attribute_label ?: $attr->attribute_name;
                }
            }

            // Check if variable products exist
            $var_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'product_variation'");
            $woo_data['has_variations'] = ($var_count > 0);
        }

        return [
            'site_name'       => get_bloginfo('name'),
            'site_url'        => home_url(),
            'admin_email'     => get_option('admin_email'),
            'wp_version'      => get_bloginfo('version'),
            'pages'           => [
                'count'   => $page_count,
                'samples' => array_map(function ($p) {
                    return [
                        'id'    => (int) $p['ID'],
                        'title' => $p['post_title'],
                        'slug'  => $p['post_name'],
                        'url'   => get_permalink($p['ID']),
                    ];
                }, $key_pages),
            ],
            'posts'           => [
                'count' => $post_count,
            ],
            'documents'       => [
                'count'   => $doc_count,
                'samples' => array_map(function ($d) {
                    return [
                        'id'    => (int) $d['ID'],
                        'title' => $d['post_title'],
                        'type'  => $d['post_mime_type'],
                        'url'   => wp_get_attachment_url($d['ID']),
                    ];
                }, $sample_docs),
            ],
            'woocommerce'     => $woo_data,
            'booking'         => [
                'active'  => $has_booking,
                'systems' => $booking_systems,
            ],
        ];
    }

    /**
     * Retrieve paginated and cleaned items for batch syncing.
     */
    public function get_items_batch($batch_type, $offset = 0, $limit = 20, $selected_ids = []) {
        if ($batch_type === 'products' && class_exists('WooCommerce')) {
            return $this->get_products_batch($offset, $limit, $selected_ids);
        } elseif ($batch_type === 'pages') {
            return $this->get_pages_batch($offset, $limit, $selected_ids);
        } elseif ($batch_type === 'documents') {
            return $this->get_documents_batch($offset, $limit, $selected_ids);
        }

        return [];
    }

    /**
     * Extract and format WooCommerce products.
     */
    private function get_products_batch($offset, $limit, $selected_ids = []) {
        $args = [
            'status'   => 'publish',
            'limit'    => $limit,
            'offset'   => $offset,
            'orderby'  => 'date',
            'order'    => 'DESC',
        ];

        if (!empty($selected_ids)) {
            $args['include'] = array_map('intval', $selected_ids);
        }

        $products = wc_get_products($args);
        $items = [];

        foreach ($products as $product) {
            if (!$product) continue;

            $pid = $product->get_id();

            // Extract Categories
            $cats = wp_get_post_terms($pid, 'product_cat', ['fields' => 'names']);
            if (is_wp_error($cats)) $cats = [];

            // Extract Tags
            $tags = wp_get_post_terms($pid, 'product_tag', ['fields' => 'names']);
            if (is_wp_error($tags)) $tags = [];

            // Extract Attributes & Variations
            $attributes = [];
            foreach ($product->get_attributes() as $attr) {
                if (is_object($attr)) {
                    $attr_name = wc_attribute_label($attr->get_name());
                    if ($attr->is_taxonomy()) {
                        $terms = wc_get_product_terms($pid, $attr->get_name(), ['fields' => 'names']);
                        $attributes[$attr_name] = $terms;
                    } else {
                        $attributes[$attr_name] = $attr->get_options();
                    }
                }
            }

            // High-res Image
            $image_id = $product->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

            $items[] = [
                'id'               => $pid,
                'title'            => $product->get_name(),
                'sku'              => $product->get_sku(),
                'price'            => html_entity_decode(strip_tags(wc_price($product->get_price()))),
                'regularPrice'     => html_entity_decode(strip_tags(wc_price($product->get_regular_price()))),
                'salePrice'        => $product->is_on_sale() ? html_entity_decode(strip_tags(wc_price($product->get_sale_price()))) : '',
                'stockStatus'      => $product->get_stock_status(),
                'stockQuantity'    => $product->get_stock_quantity(),
                'categories'       => $cats,
                'tags'             => $tags,
                'attributes'       => $attributes,
                'shortDescription' => $this->clean_text($product->get_short_description()),
                'description'      => $this->clean_text($product->get_description()),
                'url'              => get_permalink($pid),
                'imageUrl'         => $image_url,
            ];
        }

        return $items;
    }

    /**
     * Extract and format standard Pages or Posts.
     */
    private function get_pages_batch($offset, $limit, $selected_ids = []) {
        $args = [
            'post_type'      => ['page', 'post'],
            'post_status'    => 'publish',
            'posts_per_page' => $limit,
            'offset'         => $offset,
            'orderby'        => 'menu_order post_date',
            'order'          => 'DESC',
        ];

        if (!empty($selected_ids)) {
            $args['post__in'] = array_map('intval', $selected_ids);
        }

        $query = new WP_Query($args);
        $items = [];

        foreach ($query->posts as $post) {
            $pid = $post->ID;
            $items[] = [
                'id'           => $pid,
                'title'        => $post->post_title,
                'postType'     => $post->post_type,
                'content'      => $this->clean_text($post->post_content),
                'excerpt'      => $this->clean_text($post->post_excerpt),
                'url'          => get_permalink($pid),
                'dateModified' => $post->post_modified,
            ];
        }

        return $items;
    }

    /**
     * Extract uploaded documents from Media Library.
     */
    private function get_documents_batch($offset, $limit, $selected_ids = []) {
        $doc_mimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv',
            'text/plain',
        ];

        $args = [
            'post_type'      => 'attachment',
            'post_status'    => 'inherit',
            'post_mime_type' => $doc_mimes,
            'posts_per_page' => $limit,
            'offset'         => $offset,
        ];

        if (!empty($selected_ids)) {
            $args['post__in'] = array_map('intval', $selected_ids);
        }

        $query = new WP_Query($args);
        $items = [];

        foreach ($query->posts as $post) {
            $items[] = [
                'id'       => $post->ID,
                'title'    => $post->post_title,
                'mimeType' => $post->post_mime_type,
                'url'      => wp_get_attachment_url($post->ID),
                'content'  => "Document Reference: " . $post->post_title . "\nDownload / View URL: " . wp_get_attachment_url($post->ID),
            ];
        }

        return $items;
    }

    /**
     * Strip HTML, block comments, shortcodes, and excess whitespace from post content.
     */
    private function clean_text($text) {
        if (empty($text)) return '';
        // Strip shortcodes
        $clean = strip_shortcodes($text);
        // Strip HTML comments (e.g. Gutenberg blocks <!-- wp:... -->)
        $clean = preg_replace('/<!--(.|\s)*?-->/', '', $clean);
        // Strip script & style tags
        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $clean);
        $clean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $clean);
        // Strip tags
        $clean = wp_strip_all_tags($clean);
        // Decode entities
        $clean = html_entity_decode($clean, ENT_QUOTES, 'UTF-8');
        // Collapse whitespace
        $clean = preg_replace('/[ \t]+/', ' ', $clean);
        $clean = preg_replace('/\n\s*\n+/', "\n\n", $clean);
        return trim($clean);
    }
}
