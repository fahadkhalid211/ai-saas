<?php
/**
 * Site Scanner and Content Scraper
 *
 * Inspects WordPress database and content structure, allowing administrators
 * to discover, select, and scrape any registered post types (pages, posts, products,
 * custom post types) and media documents into the AI Knowledge Base.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Site_Scanner {

    /**
     * Internal post types that should always be excluded from scraping.
     */
    private $excluded_post_types = [
        'attachment',
        'revision',
        'nav_menu_item',
        'custom_css',
        'customize_changeset',
        'oembed_cache',
        'user_request',
        'wp_block',
        'wp_template',
        'wp_template_part',
        'wp_navigation',
        'action_monitor_log',
    ];

    /**
     * Get all public registered post types available for scraping.
     *
     * @return array Associative array of post types indexed by slug.
     */
    public function get_available_post_types() {
        $post_types_objects = get_post_types(['public' => true], 'objects');
        $available = [];

        foreach ($post_types_objects as $slug => $obj) {
            if (in_array($slug, $this->excluded_post_types, true)) {
                continue;
            }

            $count_obj = wp_count_posts($slug);
            $publish_count = isset($count_obj->publish) ? (int) $count_obj->publish : 0;

            // Fetch sample posts
            $samples_raw = get_posts([
                'post_type'        => $slug,
                'post_status'      => 'publish',
                'posts_per_page'   => 10,
                'orderby'          => 'menu_order post_date',
                'order'            => 'DESC',
                'suppress_filters' => true,
            ]);

            $samples = [];
            foreach ($samples_raw as $s) {
                $samples[] = [
                    'id'    => (int) $s->ID,
                    'title' => esc_html($s->post_title ?: ('Untitled ' . $obj->labels->singular_name . ' #' . $s->ID)),
                    'slug'  => sanitize_title($s->post_name),
                    'url'   => esc_url_raw(get_permalink($s->ID)),
                ];
            }

            // Associated taxonomies
            $tax_objects = get_object_taxonomies($slug, 'objects');
            $taxonomies = [];
            foreach ($tax_objects as $tax_slug => $tax_obj) {
                if ($tax_obj->public || $tax_obj->show_ui) {
                    $taxonomies[] = [
                        'slug'  => $tax_slug,
                        'label' => esc_html($tax_obj->labels->name ?: $tax_slug),
                    ];
                }
            }

            $available[$slug] = [
                'slug'           => $slug,
                'label'          => esc_html($obj->labels->name ?: ucfirst($slug)),
                'singular_label' => esc_html($obj->labels->singular_name ?: ucfirst($slug)),
                'description'    => esc_html($obj->description ?: ''),
                'count'          => $publish_count,
                'is_woo'         => ($slug === 'product' && class_exists('WooCommerce')),
                'taxonomies'     => $taxonomies,
                'samples'        => $samples,
            ];
        }

        return $available;
    }

    /**
     * Get the array of post types currently allowed for scraping by administrator.
     *
     * @return array Array of post type slug strings.
     */
    public function get_allowed_post_types() {
        $saved = get_option('ai_assistant_allowed_post_types', null);

        if (is_array($saved) && !empty($saved)) {
            return array_map('sanitize_key', $saved);
        }

        // Default set: pages, posts, and WooCommerce products if present
        $defaults = ['page', 'post'];
        if (class_exists('WooCommerce')) {
            $defaults[] = 'product';
        }

        return $defaults;
    }

    /**
     * Run a comprehensive diagnostic scan of the entire site and database.
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

        // Available & Allowed Post Types
        $available_post_types = $this->get_available_post_types();
        $allowed_post_types   = $this->get_allowed_post_types();

        // Calculate total items across all allowed post types
        $total_allowed_items = 0;
        foreach ($allowed_post_types as $pt) {
            if (isset($available_post_types[$pt])) {
                $total_allowed_items += $available_post_types[$pt]['count'];
            }
        }

        // Count published pages (uses object cache)
        $page_count = isset($available_post_types['page']['count']) ? $available_post_types['page']['count'] : 0;
        $key_pages  = isset($available_post_types['page']['samples']) ? $available_post_types['page']['samples'] : [];

        // Count published blog posts (uses object cache)
        $post_count = isset($available_post_types['post']['count']) ? $available_post_types['post']['count'] : 0;

        // Media Library Documents (PDF, Word, CSV, TXT)
        $doc_mimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv',
            'text/plain',
        ];

        $placeholders = implode(', ', array_fill(0, count($doc_mimes), '%s'));

        $doc_count_query = $wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'attachment' AND post_mime_type IN ($placeholders)",
            $doc_mimes
        );
        $doc_count = (int) $wpdb->get_var($doc_count_query);

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
            'site_name'           => esc_html(get_bloginfo('name')),
            'site_url'            => esc_url_raw(home_url()),
            'admin_email'         => sanitize_email(get_option('admin_email')),
            'wp_version'          => sanitize_text_field(get_bloginfo('version')),
            'post_types'          => $available_post_types,
            'allowed_post_types'  => $allowed_post_types,
            'total_allowed_items' => $total_allowed_items,
            'pages'               => [
                'count'   => $page_count,
                'samples' => $key_pages,
            ],
            'posts'               => [
                'count' => $post_count,
            ],
            'documents'           => [
                'count'   => $doc_count,
                'samples' => $sample_docs,
            ],
            'woocommerce'         => $woo_data,
            'booking'             => [
                'active'  => $has_booking,
                'systems' => array_map('esc_html', $booking_systems),
            ],
            'scrape_settings'     => [
                'include_meta'        => (bool) get_option('ai_assistant_scrape_include_meta', true),
                'include_taxonomies'  => (bool) get_option('ai_assistant_scrape_include_taxonomies', true),
                'include_excerpt'     => (bool) get_option('ai_assistant_scrape_include_excerpt', true),
                'scrape_method'       => sanitize_key(get_option('ai_assistant_scrape_method', 'db')),
                'batch_size'          => (int) get_option('ai_assistant_batch_size', 15),
                'last_scraped'        => get_option('ai_assistant_last_scraped', ''),
                'scrape_stats'        => get_option('ai_assistant_scrape_stats', []),
            ],
        ];
    }

    /**
     * Retrieve paginated and cleaned items for batch syncing / scraping.
     *
     * @param string $batch_type   The post type slug, 'products', or 'documents'.
     * @param int    $offset       Query offset.
     * @param int    $limit        Number of items per batch.
     * @param array  $selected_ids Optional array of specific IDs.
     * @param array  $options      Optional scraper options override.
     * @return array Array of formatted items ready for Knowledge Base ingestion.
     */
    public function get_items_batch($batch_type, $offset = 0, $limit = 20, $selected_ids = [], $options = []) {
        $offset = absint($offset);
        $limit  = min(50, max(1, absint($limit)));
        $clean_ids = !empty($selected_ids) ? array_map('absint', (array) $selected_ids) : [];

        // Normalize batch type
        $batch_type = sanitize_key($batch_type);

        if (($batch_type === 'products' || $batch_type === 'product') && class_exists('WooCommerce')) {
            return $this->get_products_batch($offset, $limit, $clean_ids, $options);
        } elseif ($batch_type === 'documents' || $batch_type === 'attachment') {
            return $this->get_documents_batch($offset, $limit, $clean_ids);
        } elseif ($batch_type === 'pages') {
            return $this->get_posts_batch('page', $offset, $limit, $clean_ids, $options);
        } else {
            // Any standard or custom post type
            return $this->get_posts_batch($batch_type, $offset, $limit, $clean_ids, $options);
        }
    }

    /**
     * Extract and format WooCommerce products.
     */
    private function get_products_batch($offset, $limit, $selected_ids = [], $options = []) {
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
                        $attr_options = $attr->get_options();
                        $attributes[$attr_name] = is_array($attr_options) ? array_map('esc_html', $attr_options) : [];
                    }
                }
            }

            // High-res Image URL
            $image_id  = $product->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

            $items[] = [
                'id'               => $pid,
                'title'            => esc_html($product->get_name()),
                'postType'         => 'product',
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
     * Extract and format any post type (page, post, or custom post type).
     *
     * @param string $post_type    The target post type slug.
     * @param int    $offset       Batch offset.
     * @param int    $limit        Batch limit.
     * @param array  $selected_ids Specific IDs to query.
     * @param array  $options      Scraper options.
     * @return array
     */
    public function get_posts_batch($post_type, $offset = 0, $limit = 15, $selected_ids = [], $options = []) {
        $post_type = sanitize_key($post_type);

        $include_meta       = isset($options['include_meta']) ? (bool) $options['include_meta'] : (bool) get_option('ai_assistant_scrape_include_meta', true);
        $include_taxonomies = isset($options['include_taxonomies']) ? (bool) $options['include_taxonomies'] : (bool) get_option('ai_assistant_scrape_include_taxonomies', true);
        $include_excerpt    = isset($options['include_excerpt']) ? (bool) $options['include_excerpt'] : (bool) get_option('ai_assistant_scrape_include_excerpt', true);
        $scrape_method      = isset($options['scrape_method']) ? sanitize_key($options['scrape_method']) : sanitize_key(get_option('ai_assistant_scrape_method', 'db'));

        $args = [
            'post_type'        => $post_type,
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

        // Discover taxonomies for this post type
        $tax_objects = $include_taxonomies ? get_object_taxonomies($post_type, 'objects') : [];

        foreach ($query->posts as $post) {
            $pid = absint($post->ID);
            $permalink = get_permalink($pid);

            // Featured Image URL
            $image_id  = get_post_thumbnail_id($pid);
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'medium_large') : '';

            // Author Name
            $author_name = '';
            if (!empty($post->post_author)) {
                $author_name = get_the_author_meta('display_name', $post->post_author);
            }

            // Taxonomies
            $post_taxonomies = [];
            $categories      = [];
            $tags            = [];

            if ($include_taxonomies && !empty($tax_objects)) {
                foreach ($tax_objects as $tax_name => $tax_obj) {
                    if (!$tax_obj->public && !$tax_obj->show_ui) continue;

                    $terms = wp_get_post_terms($pid, $tax_name, ['fields' => 'names']);
                    if (!is_wp_error($terms) && !empty($terms) && is_array($terms)) {
                        $term_names = array_map('esc_html', $terms);
                        $post_taxonomies[$tax_obj->labels->name ?: $tax_name] = $term_names;

                        if ($tax_name === 'category') {
                            $categories = $term_names;
                        } elseif ($tax_name === 'post_tag') {
                            $tags = $term_names;
                        }
                    }
                }
            }

            // Custom Fields / Post Meta (Filtering private underscore keys)
            $clean_meta = [];
            if ($include_meta) {
                $raw_meta = get_post_meta($pid);
                if (is_array($raw_meta)) {
                    foreach ($raw_meta as $key => $values) {
                        // Skip internal private meta starting with underscore
                        if (substr($key, 0, 1) === '_') continue;

                        $raw_val = $values[0] ?? '';
                        $unserialized = maybe_unserialize($raw_val);

                        if (is_string($unserialized) || is_numeric($unserialized)) {
                            $val_str = trim((string) $unserialized);
                            if ($val_str !== '' && strlen($val_str) < 3000) {
                                $clean_meta[sanitize_text_field($key)] = sanitize_text_field($val_str);
                            }
                        } elseif (is_array($unserialized)) {
                            // Simple array of strings
                            $flattened = [];
                            foreach ($unserialized as $sub_k => $sub_v) {
                                if (is_scalar($sub_v)) {
                                    $flattened[] = sanitize_text_field((string)$sub_v);
                                }
                            }
                            if (!empty($flattened)) {
                                $clean_meta[sanitize_text_field($key)] = $flattened;
                            }
                        }
                    }
                }
            }

            // Content Extraction
            $content = '';
            if ($scrape_method === 'html' && !empty($permalink)) {
                // Try rendered extraction, fallback to DB content if remote get fails
                $rendered = $this->scrape_rendered_url($permalink);
                $content  = !empty($rendered) ? $rendered : $this->clean_text($post->post_content);
            } else {
                $content = $this->clean_text($post->post_content);
            }

            $excerpt = $include_excerpt ? $this->clean_text($post->post_excerpt ?: wp_trim_words($post->post_content, 40)) : '';

            $items[] = [
                'id'            => $pid,
                'title'         => esc_html($post->post_title ?: ('Untitled #' . $pid)),
                'postType'      => sanitize_key($post->post_type),
                'content'       => $content,
                'excerpt'       => $excerpt,
                'url'           => esc_url_raw($permalink),
                'imageUrl'      => $image_url ? esc_url_raw($image_url) : '',
                'author'        => sanitize_text_field($author_name),
                'categories'    => $categories,
                'tags'          => $tags,
                'taxonomies'    => $post_taxonomies,
                'meta'          => $clean_meta,
                'datePublished' => sanitize_text_field($post->post_date),
                'dateModified'  => sanitize_text_field($post->post_modified),
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
                'title'    => esc_html($post->post_title ?: ('Document #' . $pid)),
                'postType' => 'document',
                'mimeType' => sanitize_mime_type($post->post_mime_type),
                'url'      => esc_url_raw($doc_url),
                'content'  => "Document Reference: " . esc_html($post->post_title) . "\nFile URL: " . esc_url_raw($doc_url),
            ];
        }

        return $items;
    }

    /**
     * Safely scrape the public rendered HTML for a given URL and extract clean text.
     * Strips headers, navigation menus, footers, forms, scripts, and styling.
     */
    public function scrape_rendered_url($url) {
        if (empty($url) || !wp_http_validate_url($url)) {
            return '';
        }

        $response = wp_remote_get($url, [
            'timeout'    => 12,
            'user-agent' => 'CresceloKnowledgeScraper/2.1 (WordPress ' . get_bloginfo('version') . ')',
            // Verify TLS by default. A site with a self-signed staging certificate can opt out with this filter.
            'sslverify'  => (bool) apply_filters('crescelo_scrape_sslverify', true),
        ]);

        if (is_wp_error($response)) {
            return '';
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return '';
        }

        $html = wp_remote_retrieve_body($response);
        if (empty($html)) {
            return '';
        }

        // Remove script, style, noscript tags and content
        $html = preg_replace('/<(script|style|noscript)\b[^>]*>(.*?)<\/\1>/is', '', $html);

        // Remove header, nav, footer, sidebar, and form tags to isolate main page content
        $html = preg_replace('/<(header|nav|footer|aside|form)\b[^>]*>(.*?)<\/\1>/is', '', $html);

        // Extract main or article if present
        if (preg_match('/<main\b[^>]*>(.*?)<\/main>/is', $html, $matches)) {
            $html = $matches[1];
        } elseif (preg_match('/<article\b[^>]*>(.*?)<\/article>/is', $html, $matches)) {
            $html = $matches[1];
        }

        return $this->clean_text($html);
    }

    /**
     * Strip HTML, block comments, shortcodes, and excess whitespace from post content.
     */
    public function clean_text($text) {
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
