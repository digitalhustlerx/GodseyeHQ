<?php

function godseye_bridge_defaults() {
    return array(
        'backend_url' => 'https://api.godseyes.digitalhustlerx.com',
        'license_key' => '',
        'site_id' => '',
        'backend_secret' => '',
        'connection_status' => 'disconnected',
        'last_synced_at' => '',
    );
}

function godseye_bridge_get_settings() {
    return wp_parse_args(get_option('godseye_bridge_settings', array()), godseye_bridge_defaults());
}

function godseye_bridge_register_settings() {
    register_setting('godseye_bridge', 'godseye_bridge_settings');
}

function godseye_bridge_admin_menu() {
    add_menu_page(
        'GodsEye',
        'GodsEye',
        'manage_options',
        'godseye-bridge',
        'godseye_bridge_render_admin_page',
        'dashicons-admin-network'
    );
}

function godseye_bridge_render_admin_page() {
    $settings = godseye_bridge_get_settings();
    if (!current_user_can('manage_options')) {
        return;
    }

    if (isset($_POST['godseye_bridge_save'])) {
        check_admin_referer('godseye_bridge_save');
        $settings['backend_url'] = esc_url_raw(wp_unslash($_POST['backend_url'] ?? ''));
        $settings['license_key'] = sanitize_text_field(wp_unslash($_POST['license_key'] ?? ''));
        update_option('godseye_bridge_settings', $settings);
        echo '<div class="notice notice-success"><p>Settings saved.</p></div>';
    }

    if (isset($_POST['godseye_bridge_connect'])) {
        check_admin_referer('godseye_bridge_connect');
        $result = godseye_bridge_connect_site();
        if (is_wp_error($result)) {
            echo '<div class="notice notice-error"><p>' . esc_html($result->get_error_message()) . '</p></div>';
        } else {
            echo '<div class="notice notice-success"><p>Site connected. You can now manage this site from Telegram.</p></div>';
            $settings = godseye_bridge_get_settings();
        }
    }
    ?>
    <div class="wrap">
        <h1>GodsEye</h1>
        <p>Link this site to your GodsEye agent, then manage it from Telegram.</p>
        <form method="post">
            <?php wp_nonce_field('godseye_bridge_save'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="backend_url">GodsEye API URL</label></th>
                    <td><input name="backend_url" id="backend_url" type="url" class="regular-text" value="<?php echo esc_attr($settings['backend_url']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="license_key">License Key</label></th>
                    <td><input name="license_key" id="license_key" type="text" class="regular-text" value="<?php echo esc_attr($settings['license_key']); ?>"></td>
                </tr>
            </table>
            <p><button class="button button-primary" name="godseye_bridge_save" value="1">Save</button></p>
        </form>
        <form method="post">
            <?php wp_nonce_field('godseye_bridge_connect'); ?>
            <p><button class="button button-secondary" name="godseye_bridge_connect" value="1">Connect Site</button></p>
        </form>
        <hr>
        <p><strong>Status:</strong> <?php echo esc_html($settings['connection_status']); ?></p>
        <p><strong>Site ID:</strong> <?php echo esc_html($settings['site_id']); ?></p>
        <p><strong>Last Sync:</strong> <?php echo esc_html($settings['last_synced_at']); ?></p>
    </div>
    <?php
}
