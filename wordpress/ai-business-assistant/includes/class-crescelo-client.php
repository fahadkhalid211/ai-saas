<?php
/**
 * Crescelo API Client for WordPress
 *
 * Handles authenticated communication between WordPress and the Crescelo AI SaaS backend.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Crescelo_Client {

    private $host_url;
    private $api_key;

    public function __construct($host_url = null, $api_key = null) {
        $this->host_url = untrailingslashit($host_url ?: get_option('ai_assistant_host_url', 'http://localhost:3000'));
        $this->api_key  = $api_key ?: get_option('ai_assistant_api_key', '');
    }

    /**
     * Register or link the WordPress site with the Crescelo backend.
     */
    public function register_site($data) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/register';

        $body = array_merge([
            'siteUrl'             => home_url(),
            'siteName'            => get_bloginfo('name'),
            'adminEmail'          => get_option('admin_email'),
            'websiteType'         => 'woocommerce',
            'objective'           => 'sales',
            'features'            => [],
            'existingAssistantId' => get_option('ai_assistant_id', ''),
        ], $data);

        $response = wp_remote_post($endpoint, [
            'timeout'     => 45,
            'headers'     => [
                'Content-Type'   => 'application/json',
                'X-Crescelo-Key' => $this->api_key,
            ],
            'body'        => wp_json_encode($body),
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error'   => $response->get_error_message(),
            ];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200 || empty($body['success'])) {
            return [
                'success' => false,
                'error'   => !empty($body['error']) ? $body['error'] : 'Registration failed with HTTP code ' . $code,
            ];
        }

        return $body;
    }

    /**
     * Dispatch a batch of extracted items (products, pages, documents) to Crescelo.
     */
    public function sync_batch($assistant_id, $batch_type, $items) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/sync';

        $payload = [
            'assistantId' => $assistant_id,
            'batchType'   => $batch_type,
            'items'       => $items,
        ];

        $response = wp_remote_post($endpoint, [
            'timeout'     => 90,
            'headers'     => [
                'Content-Type'   => 'application/json',
                'X-Crescelo-Key' => $this->api_key,
            ],
            'body'        => wp_json_encode($payload),
            'data_format' => 'body',
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error'   => $response->get_error_message(),
            ];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code !== 200 || empty($body['success'])) {
            return [
                'success' => false,
                'error'   => !empty($body['error']) ? $body['error'] : 'Sync failed with HTTP code ' . $code,
            ];
        }

        return $body;
    }

    /**
     * Non-blocking single-item incremental sync (for save_post / woocommerce_update_product).
     */
    public function sync_item_async($assistant_id, $action, $batch_type, $item) {
        $endpoint = $this->host_url . '/api/connectors/wordpress/sync-item';

        $payload = [
            'assistantId' => $assistant_id,
            'action'      => $action, // 'update' or 'delete'
            'batchType'   => $batch_type,
            'item'        => $item,
        ];

        wp_remote_post($endpoint, [
            'timeout'     => 10,
            'blocking'    => false, // Non-blocking so admin/author doesn't wait
            'headers'     => [
                'Content-Type'   => 'application/json',
                'X-Crescelo-Key' => $this->api_key,
            ],
            'body'        => wp_json_encode($payload),
            'data_format' => 'body',
        ]);
    }
}
