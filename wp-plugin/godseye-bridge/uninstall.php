<?php
/**
 * GodsEye — WordPress Agent
 *
 * Cleanup on plugin delete: remove all stored settings, including the bridge
 * backend secret, so a deactivated-and-deleted install no longer holds any
 * credentials that could be used to control the site.
 *
 * @package GodsEye
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('godseye_bridge_settings');
