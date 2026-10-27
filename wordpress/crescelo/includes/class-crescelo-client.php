<?php
/**
 * Crescelo API Client for WordPress
 *
 * Handles authenticated communication between WordPress and the Crescelo AI SaaS backend.
 *
 * @package Crescelo
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Client {

    private $host_url;
    private $api_key;
    private $site_secret;

    public function __construct($host_url = null, $api_key = null) {
        $raw_host = $host_url ?: crescelo_get_option('host_url', CRESCELO_DEFAULT_HOST);
        $clean_host = esc_url_raw(trim($raw_host));
        $parsed = wp_parse_url($clean_host);

        if (!empty($parsed['scheme']) && in_array($parsed['scheme'], ['http', 'https'], true)) {
            $this->host_url = untrailingslashit($clean_host);
        } else {
            $this->host_url = CRESCELO_DEFAULT_HOST;
        }

        $this->api_key     = sanitize_text_field($api_key ?: crescelo_get_option('api_key', ''));
        $this->site_secret = sanitize_text_field(crescelo_get_option('site_secret', ''));
    }

    /**
     * Register or link the WordPress site with the Crescelo backend.
     *
     * @param array $data Site configuration data.
     * @return array
     */
    public function register_site($data) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/register';

        $body = array_merge([
            'siteUrl'             => esc_url_raw(home_url()),
            'siteName'            => sanitize_text_field(get_bloginfo('name')),
            'adminEmail'          => sanitize_email(get_option('admin_email')),
            'websiteType'         => 'woocommerce',
            'objective'           => 'sales',
            'features'            => [],
            'existingAssistantId' => sanitize_text_field(crescelo_get_option('id', '')),
        ], $data);

        $headers = [
            'Content-Type'   => 'application/json',
            'X-Crescelo-Key' => $this->api_key,
        ];
        if (!empty($this->site_secret)) {
            $headers['X-Crescelo-Secret'] = $this->site_secret;
        }

        $response = wp_remote_post($endpoint, [
            'timeout'     => 45,
            'headers'     => $headers,
            'body'        => wp_json_encode($body),
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error'   => sanitize_text_field($response->get_error_message()),
            ];
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200 || empty($body['success'])) {
            return [
                'success' => false,
                'error'   => !empty($body['error']) 
                    ? sanitize_text_field($body['error']) 
                    : sprintf(
                        /* translators: %d: HTTP status response code */
                        esc_html__('Registration failed with HTTP code %d', 'crescelo'),
                        $code
                    ),
            ];
        }

        return $body;
    }

    /**
     * Dispatch a batch of extracted items (products, pages, documents) to Crescelo.
     *
     * @param string $assistant_id Target assistant identifier.
     * @param string $batch_type   Type of items (e.g. 'page', 'post', 'products').
     * @param array  $items        Array of formatted content items.
     * @return array
     */
    public function sync_batch($assistant_id, $batch_type, $items) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/sync';

        $payload = [
            'assistantId' => sanitize_text_field($assistant_id),
            'batchType'   => sanitize_key($batch_type),
            'items'       => is_array($items) ? $items : [],
        ];

        $headers = [
            'Content-Type'   => 'application/json',
            'X-Crescelo-Key' => $this->api_key,
        ];
        if (!empty($this->site_secret)) {
            $headers['X-Crescelo-Secret'] = $this->site_secret;
        }

        $response = wp_remote_post($endpoint, [
            'timeout'     => 90,
            'headers'     => $headers,
            'body'        => wp_json_encode($payload),
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error'   => sanitize_text_field($response->get_error_message()),
            ];
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200 || empty($body['success'])) {
            return [
                'success' => false,
                'error'   => !empty($body['error']) 
                    ? sanitize_text_field($body['error']) 
                    : sprintf(
                        /* translators: %d: HTTP status response code */
                        esc_html__('Sync failed with HTTP code %d', 'crescelo'),
                        $code
                    ),
            ];
        }

        return $body;
    }

    /**
     * Non-blocking single-item incremental sync (for save_post / woocommerce_update_product).
     *
     * @param string $assistant_id Target assistant identifier.
     * @param string $action       Action performed ('update' or 'delete').
     * @param string $batch_type   Type of item.
     * @param array  $item         Content data.
     */
    public function sync_item_async($assistant_id, $action, $batch_type, $item) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/sync-item';

        $payload = [
            'assistantId' => sanitize_text_field($assistant_id),
            'action'      => sanitize_key($action),
            'batchType'   => sanitize_key($batch_type),
            'item'        => is_array($item) ? $item : [],
        ];

        $headers = [
            'Content-Type'   => 'application/json',
            'X-Crescelo-Key' => $this->api_key,
        ];
        if (!empty($this->site_secret)) {
            $headers['X-Crescelo-Secret'] = $this->site_secret;
        }

        wp_remote_post($endpoint, [
            'timeout'     => 10,
            'blocking'    => false, // Non-blocking so admin/author does not wait
            'headers'     => $headers,
            'body'        => wp_json_encode($payload),
            'data_format' => 'body',
        ]);
    }
}
