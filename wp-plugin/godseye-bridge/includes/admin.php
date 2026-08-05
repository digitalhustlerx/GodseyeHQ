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

    $active_tab = isset($_GET['tab']) && $_GET['tab'] === 'referral' ? 'referral' : 'connect';
    ?>
    <div class="wrap">
        <h1>GodsEye</h1>
        <h2 class="nav-tab-wrapper">
            <a href="<?php echo esc_url(admin_url('admin.php?page=godseye-bridge')); ?>" class="nav-tab<?php echo $active_tab === 'connect' ? ' nav-tab-active' : ''; ?>">Connect</a>
            <a href="<?php echo esc_url(admin_url('admin.php?page=godseye-bridge&tab=referral')); ?>" class="nav-tab<?php echo $active_tab === 'referral' ? ' nav-tab-active' : ''; ?>">Bring your team</a>
        </h2>

        <?php if ($active_tab === 'referral'): ?>
            <div id="godseye-referral-wrap" style="max-width:680px;margin-top:16px;">
                <p><strong>Bring your team.</strong> Send your link to the people who live in WordPress admin from their phone. When they pay, your next month's free — and you both keep working in the same shared view.</p>
                <p id="godseye-referral-status" style="color:#666;">Loading your referral link…</p>
                <div id="godseye-referral-content" style="display:none;">
                    <h3 style="margin-bottom:4px;">Your invite link</h3>
                    <p style="margin-top:4px;">Share this with your team — they get in, you get rewarded.</p>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                        <input type="text" id="godseye-referral-link" readonly style="flex:1;padding:8px;font-family:monospace;border:1px solid #ccd0d4;" />
                        <button type="button" id="godseye-referral-copy" class="button button-primary">Copy link</button>
                    </div>
                    <h3>Your reward ladder</h3>
                    <ul id="godseye-referral-ladder" style="list-style:disc;padding-left:20px;line-height:1.6;"></ul>
                    <p style="color:#555;font-size:13px;"><em>Reward confirmation: your invite went through, your teammate is now in your workspace, and your next month is free.</em></p>
                </div>
            </div>
            <script>
            (function () {
                var status = document.getElementById('godseye-referral-status');
                var content = document.getElementById('godseye-referral-content');
                var license = <?php echo wp_json_encode($settings['license_key']); ?>;
                var backend = <?php echo wp_json_encode(trailingslashit($settings['backend_url'])); ?>;

                if (!license) {
                    status.innerHTML = 'No license key saved yet. Go to the <strong>Connect</strong> tab and save your license key first, then come back here.';
                    return;
                }

                fetch(backend + 'api/referral/link?licenseKey=' + encodeURIComponent(license))
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        if (!data || !data.ok || !data.referral_link) {
                            status.innerHTML = 'Couldn\u2019t load your referral link. Make sure the license key is valid and the site is connected.';
                            return;
                        }
                        status.style.display = 'none';
                        content.style.display = 'block';
                        var link = document.getElementById('godseye-referral-link');
                        link.value = data.referral_link;
                        var ladder = document.getElementById('godseye-referral-ladder');
                        ladder.innerHTML = '';
                        var defs = [
                            '1 invite … launch pricing locked for you both, waitlist priority',
                            '1 paying teammate … your next month\u2019s free (cap: Pro)',
                            '3 paying teammates … 14-day God Mode trial',
                            '5 paying teammates … lifetime \u221220% on your own plan'
                        ];
                        if (data.stats && data.stats.rewards) {
                            var r = data.stats.rewards;
                            var paid = r.paid_count || 0;
                            var waiting = r.waiting || 0;
                            if (paid >= 1) { defs[1] = '1 paying teammate met — next month free is unlocked'; }
                            defs.splice(0, 0, paid + ' paying teammates so far' + (waiting ? ' · ' + waiting + ' signed up, not yet paid' : ''));
                        }
                        defs.forEach(function (line) {
                            var li = document.createElement('li');
                            li.textContent = line;
                            ladder.appendChild(li);
                        });
                        var copy = document.getElementById('godseye-referral-copy');
                        copy.addEventListener('click', function () {
                            link.select();
                            try { document.execCommand('copy'); } catch (e) {}
                            copy.textContent = 'Copied ✓';
                            setTimeout(function () { copy.textContent = 'Copy link'; }, 1600);
                        });
                    })
                    .catch(function (err) {
                        status.innerHTML = 'Error loading your referral link: ' + (err && err.message ? err.message : 'unknown error');
                    });
            })();
            </script>
        <?php else: ?>
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
        <?php endif; ?>
    </div>
    <?php
}
