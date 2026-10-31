<?php
/**
 * Fired when the plugin is uninstalled via WordPress Admin.
 *
 * Removes all persistent options and transients stored by Crescelo,
 * including connection credentials and scraper configurations.
 *
 * @package Crescelo
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

$crescelo_options = [
    // Standard crescelo_* keys
    'crescelo_host_url',
    'crescelo_id',
    'crescelo_api_key',
    'crescelo_site_secret',
    'crescelo_account_email',
    'crescelo_assistant_name',
    'crescelo_connected_at',
    'crescelo_enabled',
    'crescelo_wizard_completed',
    'crescelo_allowed_post_types',
    'crescelo_scrape_include_meta',
    'crescelo_scrape_include_taxonomies',
    'crescelo_scrape_include_excerpt',
    'crescelo_scrape_method',
    'crescelo_batch_size',
    'crescelo_auto_sync',
    'crescelo_ecommerce_enabled',
    'crescelo_allow_order_cancellation',
    'crescelo_website_type',
    'crescelo_objective',
    'crescelo_features',
    'crescelo_last_scraped',
    'crescelo_scrape_stats',
    // Legacy ai_assistant_* keys
    'ai_assistant_host_url',
    'ai_assistant_id',
    'ai_assistant_api_key',
    'ai_assistant_site_secret',
    'ai_assistant_account_email',
    'ai_assistant_assistant_name',
    'ai_assistant_connected_at',
    'ai_assistant_enabled',
    'ai_assistant_wizard_completed',
    'ai_assistant_allowed_post_types',
    'ai_assistant_scrape_include_meta',
    'ai_assistant_scrape_include_taxonomies',
    'ai_assistant_scrape_include_excerpt',
    'ai_assistant_scrape_method',
    'ai_assistant_batch_size',
    'ai_assistant_auto_sync',
    'ai_assistant_website_type',
    'ai_assistant_objective',
    'ai_assistant_features',
    'ai_assistant_last_scraped',
    'ai_assistant_scrape_stats',
];

foreach ($crescelo_options as $option_name) {
    delete_option($option_name);
}

// Delete transients
delete_transient('crescelo_admin_notice');
delete_transient('crescelo_admin_error');
