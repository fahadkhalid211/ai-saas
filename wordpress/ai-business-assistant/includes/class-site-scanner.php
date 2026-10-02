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

        // Detect booking plugins safely
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

        // Count published pages (uses object cache)
        $page_counts = wp_count_posts('page');
        $page_count  = isset($page_counts->publish) ? (int) $page_counts->publish : 0;

        // Sample key pages using core get_posts
        $key_pages_raw = get_posts([
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => 20,
            'orderby'        => 'menu_order post_date',
            'order'          => 'DESC',
            'suppress_filters' => true,
        ]);

        $key_pages = [];
        foreach ($key_pages_raw as $kp) {
            $key_pages[] = [
                'id'    => (int) $kp->ID,
                'title' => esc_html($kp->post_title),
                'slug'  => sanitize_title($kp->post_name),
                'url'   => esc_url_raw(get_permalink($kp->ID)),
            ];
        }

        // Count published blog posts (uses object cache)
        $post_counts = wp_count_posts('post');
        $post_count  = isset($post_counts->publish) ? (int) $post_counts->publish : 0;

        // Media Library Documents (PDF, Word, CSV, TXT) with prepared statements
        $doc_mimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv',
            'text/plain',
        ];

        $placeholders = implode(', ', array_fill(0, count($doc_mimes), '%s'));

        // Count documents with safe parameterization
        $doc_count_query = $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type IN ($placeholders)",
            $doc_mimes
        );
        $doc_count = (int) $wpdb->get_var($doc_count_query);

        // Fetch sample documents with safe parameterization
        $doc_sample_query = $wpdb->prepare(
            "SELECT ID, post_title, post_mime_type FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type IN ($placeholders) ORDER BY post_date DESC LIMIT 10",
            $doc_mimes
        );
        $sample_docs_raw = $wpdb->get_results($doc_sample_query, ARRAY_A);

        $sample_docs = [];
        if (!empty($sample_docs_raw)) {
            foreach ($sample_docs_raw as $d) {
                $doc_url = wp_get_attachment_url((int) $d['ID']);
                if ($doc_url) {
                    $sample_docs[] = [
                        'id'    => (int) $d['ID'],
                        'title' => esc_html($d['post_title']),
                        'type'  => sanitize_mime_type($d['post_mime_type']),
                        'url'   => esc_url_raw($doc_url),
                    ];
                }
            }
        }

        // WooCommerce Stats
        $woo_data = [
            'active'         => $has_woo,
            'total_products' => 0,
            'categories'     => [],
            'attributes'     => [],
            'has_variations' => false,
        ];

        if ($has_woo) {
            $product_counts = wp_count_posts('product');
            $woo_data['total_products'] = isset($product_counts->publish) ? (int) $product_counts->publish : 0;

            // Product Categories
            $categories = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => true,
                'number'     => 30,
            ]);
            if (!is_wp_error($categories) && is_array($categories)) {
                foreach ($categories as $cat) {
                    $woo_data['categories'][] = [
                        'id'    => (int) $cat->term_id,
                        'name'  => esc_html($cat->name),
                        'count' => (int) $cat->count,
                    ];
                }
            }

            // Global Attributes
            if (function_exists('wc_get_attribute_taxonomies')) {
                $attrs = wc_get_attribute_taxonomies();
                foreach ($attrs as $attr) {
                    $woo_data['attributes'][] = esc_html($attr->attribute_label ?: $attr->attribute_name);
                }
            }

            // Check if variable products exist
            $var_count_query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s",
                'product_variation'
            );
            $var_count = (int) $wpdb->get_var($var_count_query);
            $woo_data['has_variations'] = ($var_count > 0);
        }

        return [
            'site_name'   => esc_html(get_bloginfo('name')),
            'site_url'    => esc_url_raw(home_url()),
            'admin_email' => sanitize_email(get_option('admin_email')),
            'wp_version'  => sanitize_text_field(get_bloginfo('version')),
            'pages'       => [
                'count'   => $page_count,
                'samples' => $key_pages,
            ],
            'posts'       => [
                'count' => $post_count,
            ],
            'documents'   => [
                'count'   => $doc_count,
                'samples' => $sample_docs,
            ],
            'woocommerce' => $woo_data,
            'booking'     => [
                'active'  => $has_booking,
                'systems' => array_map('esc_html', $booking_systems),
            ],
        ];
    }

    /**
     * Retrieve paginated and cleaned items for batch syncing.
     */
    public function get_items_batch($batch_type, $offset = 0, $limit = 20, $selected_ids = []) {
        $offset = absint($offset);
        $limit  = min(50, max(1, absint($limit)));
        $clean_ids = !empty($selected_ids) ? array_map('absint', (array) $selected_ids) : [];

        if ($batch_type === 'products' && class_exists('WooCommerce')) {
            return $this->get_products_batch($offset, $limit, $clean_ids);
        } elseif ($batch_type === 'pages') {
            return $this->get_pages_batch($offset, $limit, $clean_ids);
        } elseif ($batch_type === 'documents') {
            return $this->get_documents_batch($offset, $limit, $clean_ids);
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
            $args['include'] = array_map('absint', $selected_ids);
        }

        $products = wc_get_products($args);
        $items = [];

        foreach ($products as $product) {
            if (!$product) continue;

            $pid = absint($product->get_id());

            // Extract Categories
            $cats = wp_get_post_terms($pid, 'product_cat', ['fields' => 'names']);
            if (is_wp_error($cats) || !is_array($cats)) $cats = [];

            // Extract Tags
            $tags = wp_get_post_terms($pid, 'product_tag', ['fields' => 'names']);
            if (is_wp_error($tags) || !is_array($tags)) $tags = [];

            // Extract Attributes & Variations
            $attributes = [];
            foreach ($product->get_attributes() as $attr) {
                if (is_object($attr)) {
                    $attr_name = wc_attribute_label($attr->get_name());
                    if ($attr->is_taxonomy()) {
                        $terms = wc_get_product_terms($pid, $attr->get_name(), ['fields' => 'names']);
                        $attributes[$attr_name] = is_array($terms) ? array_map('esc_html', $terms) : [];
                    } else {
                        $options = $attr->get_options();
                        $attributes[$attr_name] = is_array($options) ? array_map('esc_html', $options) : [];
                    }
                }
            }

            // High-res Image URL
            $image_id  = $product->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

            $items[] = [
                'id'               => $pid,
                'title'            => esc_html($product->get_name()),
                'sku'              => sanitize_text_field($product->get_sku()),
                'price'            => html_entity_decode(strip_tags(wc_price($product->get_price()))),
                'regularPrice'     => html_entity_decode(strip_tags(wc_price($product->get_regular_price()))),
                'salePrice'        => $product->is_on_sale() ? html_entity_decode(strip_tags(wc_price($product->get_sale_price()))) : '',
                'stockStatus'      => sanitize_text_field($product->get_stock_status()),
                'stockQuantity'    => $product->get_stock_quantity() !== null ? intval($product->get_stock_quantity()) : null,
                'categories'       => array_map('esc_html', $cats),
                'tags'             => array_map('esc_html', $tags),
                'attributes'       => $attributes,
                'shortDescription' => $this->clean_text($product->get_short_description()),
                'description'      => $this->clean_text($product->get_description()),
                'url'              => esc_url_raw(get_permalink($pid)),
                'imageUrl'         => $image_url ? esc_url_raw($image_url) : '',
            ];
        }

        return $items;
    }

    /**
     * Extract and format standard Pages or Posts.
     */
    private function get_pages_batch($offset, $limit, $selected_ids = []) {
        $args = [
            'post_type'        => ['page', 'post'],
            'post_status'      => 'publish',
            'posts_per_page'   => $limit,
            'offset'           => $offset,
            'orderby'          => 'menu_order post_date',
            'order'            => 'DESC',
            'suppress_filters' => true,
        ];

        if (!empty($selected_ids)) {
            $args['post__in'] = array_map('absint', $selected_ids);
        }

        $query = new WP_Query($args);
        $items = [];

        foreach ($query->posts as $post) {
            $pid = absint($post->ID);
            $items[] = [
                'id'           => $pid,
                'title'        => esc_html($post->post_title),
                'postType'     => sanitize_key($post->post_type),
                'content'      => $this->clean_text($post->post_content),
                'excerpt'      => $this->clean_text($post->post_excerpt),
                'url'          => esc_url_raw(get_permalink($pid)),
                'dateModified' => sanitize_text_field($post->post_modified),
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
            'post_type'        => 'attachment',
            'post_status'      => 'inherit',
            'post_mime_type'   => $doc_mimes,
            'posts_per_page'   => $limit,
            'offset'           => $offset,
            'suppress_filters' => true,
        ];

        if (!empty($selected_ids)) {
            $args['post__in'] = array_map('absint', $selected_ids);
        }

        $query = new WP_Query($args);
        $items = [];

        foreach ($query->posts as $post) {
            $pid = absint($post->ID);
            $doc_url = wp_get_attachment_url($pid);
            if (!$doc_url) continue;

            $items[] = [
                'id'       => $pid,
                'title'    => esc_html($post->post_title),
                'mimeType' => sanitize_mime_type($post->post_mime_type),
                'url'      => esc_url_raw($doc_url),
                'content'  => "Document Reference: " . esc_html($post->post_title) . "\nDownload / View URL: " . esc_url_raw($doc_url),
            ];
        }

        return $items;
    }

    /**
     * Strip HTML, block comments, shortcodes, and excess whitespace from post content.
     */
    private function clean_text($text) {
        if (empty($text) || !is_string($text)) return '';

        // Strip non-printable control characters (protects JSON serialization and parser bugs)
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);

        // Strip shortcodes
        $clean = strip_shortcodes($clean);

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
