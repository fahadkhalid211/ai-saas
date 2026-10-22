<?php
/**
 * Runs when the plugin is deleted from the Plugins screen: removes every option the plugin stored,
 * including the connector key and site secret.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

$options = [
    'ai_assistant_host_url', 'ai_assistant_id', 'ai_assistant_api_key', 'ai_assistant_site_secret',
    'ai_assistant_account_email', 'ai_assistant_assistant_name', 'ai_assistant_connected_at',
    'ai_assistant_enabled', 'ai_assistant_wizard_completed', 'ai_assistant_allowed_post_types',
    'ai_assistant_scrape_include_meta', 'ai_assistant_scrape_include_taxonomies',
    'ai_assistant_scrape_include_excerpt', 'ai_assistant_scrape_method', 'ai_assistant_batch_size',
    'ai_assistant_auto_sync', 'ai_assistant_website_type', 'ai_assistant_objective',
    'ai_assistant_features', 'ai_assistant_last_scraped', 'ai_assistant_scrape_stats',
];

foreach ($options as $option) {
    delete_option($option);
}
