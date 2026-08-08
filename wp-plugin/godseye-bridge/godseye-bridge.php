<?php
/**
 * Plugin Name: GodsEye — WordPress Agent
 * Description: Take control of your WordPress site from Telegram. One agent for content, security, WooCommerce, and more.
 * Version: 1.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GODSEYE_BRIDGE_VERSION', '1.2.0');
define('GODSEYE_BRIDGE_FILE', __FILE__);
define('GODSEYE_BRIDGE_DIR', plugin_dir_path(__FILE__));

require_once GODSEYE_BRIDGE_DIR . 'includes/admin.php';
require_once GODSEYE_BRIDGE_DIR . 'includes/rest.php';

add_action('admin_menu', 'godseye_bridge_admin_menu');
add_action('admin_init', 'godseye_bridge_register_settings');
add_action('rest_api_init', 'godseye_bridge_register_routes');
