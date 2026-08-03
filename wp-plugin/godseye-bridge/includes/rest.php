<?php

function godseye_bridge_register_routes() {
    register_rest_route('godseye/v1', '/status', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_status',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('godseye/v1', '/connect', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_connect_site',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
    ));

    register_rest_route('godseye/v1', '/capabilities', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_capabilities',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('godseye/v1', '/site', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_site',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/posts', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_posts',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/posts', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_create_post',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/pages', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_pages',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/pages', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_create_page',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/pages/(?P<id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_update_page',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/media', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_media',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/comments', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_comments',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/comments/(?P<id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_update_comment',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/taxonomy', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_taxonomy',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/taxonomy', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_create_term',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/woocommerce/products', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_list_products',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/woocommerce/products/(?P<id>\d+)', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_update_product',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/seo', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_seo_status',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/plugins', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_plugin_status',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/themes', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_theme_status',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/cache/flush', array(
        'methods' => 'POST',
        'callback' => 'godseye_bridge_flush_cache',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));

    register_rest_route('godseye/v1', '/cron', array(
        'methods' => 'GET',
        'callback' => 'godseye_bridge_cron_status',
        'permission_callback' => 'godseye_bridge_authorize_request',
    ));
}

function godseye_bridge_status() {
    return rest_ensure_response(godseye_bridge_get_settings());
}

function godseye_bridge_connect_site() {
    $settings = godseye_bridge_get_settings();
    $backend_url = trailingslashit($settings['backend_url']);
    $license_key = $settings['license_key'];

    if (empty($backend_url) || empty($license_key)) {
        return new WP_Error('godseye_missing_settings', 'Backend URL and license key are required.');
    }

    $payload = array(
        'licenseKey' => $license_key,
        'siteUrl' => home_url(),
        'bridgeUrl' => rest_url('godseye/v1'),
        'siteName' => get_bloginfo('name'),
        'pluginVersion' => GODSEYE_BRIDGE_VERSION,
        'wpVersion' => get_bloginfo('version'),
    );

    $response = wp_remote_post($backend_url . 'api/sites/connect', array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => wp_json_encode($payload),
        'timeout' => 15,
    ));

    if (is_wp_error($response)) {
        return $response;
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status < 200 || $status >= 300 || empty($body['site']['id'])) {
        $message = isset($body['error']) ? $body['error'] : 'Connection failed.';
        return new WP_Error('godseye_connect_failed', $message);
    }

    $settings['site_id'] = sanitize_text_field($body['site']['id']);
    $settings['backend_secret'] = sanitize_text_field($body['site']['backendSecret']);
    $settings['connection_status'] = sanitize_text_field($body['site']['connectionStatus']);
    $settings['last_synced_at'] = current_time('mysql');
    update_option('godseye_bridge_settings', $settings);

    $verify = wp_remote_post($backend_url . 'api/sites/verify', array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => wp_json_encode(array(
            'siteId' => $settings['site_id'],
            'backendSecret' => $settings['backend_secret'],
        )),
        'timeout' => 15,
    ));

    if (!is_wp_error($verify)) {
        $verify_status = wp_remote_retrieve_response_code($verify);
        $verify_body = json_decode(wp_remote_retrieve_body($verify), true);
        if ($verify_status >= 200 && $verify_status < 300 && !empty($verify_body['site']['connectionStatus'])) {
            $settings['connection_status'] = sanitize_text_field($verify_body['site']['connectionStatus']);
            $settings['last_synced_at'] = current_time('mysql');
            update_option('godseye_bridge_settings', $settings);
        }
    }

    return rest_ensure_response(array(
        'connected' => true,
        'settings' => $settings,
    ));
}

function godseye_bridge_capabilities() {
    $active_plugins = (array) get_option('active_plugins', array());
    $plugin_slugs = implode(' ', $active_plugins);

    return rest_ensure_response(array(
        'content' => true,
        'media' => true,
        'comments' => true,
        'taxonomy' => true,
        'users' => current_user_can('list_users'),
        'woocommerce' => class_exists('WooCommerce') || strpos($plugin_slugs, 'woocommerce') !== false,
        'seo' => defined('WPSEO_VERSION') || defined('RANK_MATH_VERSION'),
        'plugins' => current_user_can('activate_plugins'),
        'themes' => current_user_can('switch_themes'),
        'cache' => function_exists('wp_cache_flush'),
        'cron' => current_user_can('manage_options'),
        'options' => current_user_can('manage_options'),
    ));
}

function godseye_bridge_authorize_request(WP_REST_Request $request) {
    $settings = godseye_bridge_get_settings();
    $site_id = $request->get_header('x-godseye-site-id');
    $timestamp = $request->get_header('x-godseye-timestamp');
    $signature = $request->get_header('x-godseye-signature');

    if (empty($settings['site_id']) || empty($settings['backend_secret'])) {
        return new WP_Error('godseye_not_connected', 'Godseye bridge is not connected.', array('status' => 403));
    }

    if ($site_id !== $settings['site_id'] || empty($timestamp) || empty($signature)) {
        return new WP_Error('godseye_bad_auth', 'Missing or invalid Godseye bridge headers.', array('status' => 403));
    }

    if (abs(time() - intval($timestamp)) > 300) {
        return new WP_Error('godseye_stale_request', 'Godseye bridge request expired.', array('status' => 403));
    }

    $route = '/' . trim($request->get_route(), '/');
    $route = preg_replace('#^/godseye/v1#', '', $route);
    $body = $request->get_body();
    $message = strtoupper($request->get_method()) . "\n" . $route . "\n" . $timestamp . "\n" . $body;
    $expected = hash_hmac('sha256', $message, $settings['backend_secret']);

    if (!hash_equals($expected, $signature)) {
        return new WP_Error('godseye_bad_signature', 'Invalid Godseye bridge signature.', array('status' => 403));
    }

    return true;
}

function godseye_bridge_site() {
    $theme = wp_get_theme();

    return rest_ensure_response(array(
        'name' => get_bloginfo('name'),
        'url' => home_url(),
        'wpVersion' => get_bloginfo('version'),
        'pluginVersion' => GODSEYE_BRIDGE_VERSION,
        'activeTheme' => $theme->get('Name'),
        'capabilities' => godseye_bridge_capabilities()->get_data(),
    ));
}

function godseye_bridge_list_posts(WP_REST_Request $request) {
    $limit = min(max(intval($request->get_param('limit') ?: 10), 1), 50);
    $status = sanitize_key($request->get_param('status') ?: 'any');
    $search = sanitize_text_field($request->get_param('search') ?: '');

    $query = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => $status,
        'posts_per_page' => $limit,
        's' => $search,
    ));

    $posts = array_map(function ($post) {
        return array(
            'id' => $post->ID,
            'title' => get_the_title($post),
            'status' => get_post_status($post),
            'date' => get_the_date('c', $post),
            'link' => get_permalink($post),
            'editLink' => get_edit_post_link($post->ID, ''),
        );
    }, $query->posts);

    return rest_ensure_response(array('posts' => $posts));
}

function godseye_bridge_create_post(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $title = sanitize_text_field($params['title'] ?? 'Godseye draft');
    $content = wp_kses_post($params['content'] ?? '');
    $excerpt = sanitize_textarea_field($params['excerpt'] ?? '');
    $status = sanitize_key($params['status'] ?? 'draft');

    if ($status !== 'draft') {
        return new WP_Error('godseye_publish_blocked', 'Only draft creation is allowed by this bridge endpoint.', array('status' => 403));
    }

    $post_id = wp_insert_post(array(
        'post_title' => $title,
        'post_content' => $content,
        'post_excerpt' => $excerpt,
        'post_status' => 'draft',
        'post_type' => 'post',
    ), true);

    if (is_wp_error($post_id)) {
        return $post_id;
    }

    return rest_ensure_response(array(
        'post' => array(
            'id' => $post_id,
            'title' => get_the_title($post_id),
            'status' => get_post_status($post_id),
            'link' => get_permalink($post_id),
            'editLink' => get_edit_post_link($post_id, ''),
        ),
    ));
}

function godseye_bridge_post_summary($post) {
    return array(
        'id' => $post->ID,
        'title' => get_the_title($post),
        'status' => get_post_status($post),
        'date' => get_the_date('c', $post),
        'link' => get_permalink($post),
        'editLink' => get_edit_post_link($post->ID, ''),
    );
}

function godseye_bridge_query_posts($post_type, $limit, $status, $search) {
    $query = new WP_Query(array(
        'post_type' => $post_type,
        'post_status' => $status,
        'posts_per_page' => min(max(intval($limit), 1), 50),
        's' => sanitize_text_field($search),
    ));

    return array_map('godseye_bridge_post_summary', $query->posts);
}

function godseye_bridge_list_pages(WP_REST_Request $request) {
    return rest_ensure_response(array(
        'pages' => godseye_bridge_query_posts(
            'page',
            $request->get_param('limit') ?: 10,
            sanitize_key($request->get_param('status') ?: 'any'),
            $request->get_param('search') ?: ''
        ),
    ));
}

function godseye_bridge_create_page(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $page_id = wp_insert_post(array(
        'post_title' => sanitize_text_field($params['title'] ?? 'Godseye page draft'),
        'post_content' => wp_kses_post($params['content'] ?? ''),
        'post_excerpt' => sanitize_textarea_field($params['excerpt'] ?? ''),
        'post_status' => 'draft',
        'post_type' => 'page',
    ), true);

    if (is_wp_error($page_id)) {
        return $page_id;
    }

    return rest_ensure_response(array('page' => godseye_bridge_post_summary(get_post($page_id))));
}

function godseye_bridge_update_page(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $page_id = intval($request['id']);
    $page = get_post($page_id);

    if (!$page || $page->post_type !== 'page') {
        return new WP_Error('godseye_page_not_found', 'Page not found.', array('status' => 404));
    }

    $update = array('ID' => $page_id);
    if (isset($params['title'])) {
        $update['post_title'] = sanitize_text_field($params['title']);
    }
    if (isset($params['content'])) {
        $update['post_content'] = wp_kses_post($params['content']);
    }
    if (isset($params['excerpt'])) {
        $update['post_excerpt'] = sanitize_textarea_field($params['excerpt']);
    }

    $updated = wp_update_post($update, true);
    if (is_wp_error($updated)) {
        return $updated;
    }

    return rest_ensure_response(array('page' => godseye_bridge_post_summary(get_post($page_id))));
}

function godseye_bridge_list_media(WP_REST_Request $request) {
    $attachments = get_posts(array(
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => min(max(intval($request->get_param('limit') ?: 20), 1), 50),
    ));

    $media = array_map(function ($attachment) {
        return array(
            'id' => $attachment->ID,
            'title' => get_the_title($attachment),
            'mimeType' => get_post_mime_type($attachment),
            'url' => wp_get_attachment_url($attachment->ID),
            'date' => get_the_date('c', $attachment),
        );
    }, $attachments);

    return rest_ensure_response(array('media' => $media));
}

function godseye_bridge_list_comments(WP_REST_Request $request) {
    $comments = get_comments(array(
        'number' => min(max(intval($request->get_param('limit') ?: 20), 1), 50),
        'status' => sanitize_key($request->get_param('status') ?: 'all'),
    ));

    return rest_ensure_response(array(
        'comments' => array_map(function ($comment) {
            return array(
                'id' => intval($comment->comment_ID),
                'postId' => intval($comment->comment_post_ID),
                'author' => $comment->comment_author,
                'status' => wp_get_comment_status($comment),
                'date' => mysql2date('c', $comment->comment_date_gmt),
                'excerpt' => wp_trim_words($comment->comment_content, 24),
            );
        }, $comments),
    ));
}

function godseye_bridge_update_comment(WP_REST_Request $request) {
    $comment_id = intval($request['id']);
    $params = $request->get_json_params();
    $action = sanitize_key($params['action'] ?? '');

    if (!get_comment($comment_id)) {
        return new WP_Error('godseye_comment_not_found', 'Comment not found.', array('status' => 404));
    }

    if ($action === 'approve') {
        wp_set_comment_status($comment_id, 'approve');
    } elseif ($action === 'unapprove') {
        wp_set_comment_status($comment_id, 'hold');
    } elseif ($action === 'trash') {
        wp_trash_comment($comment_id);
    } else {
        return new WP_Error('godseye_bad_comment_action', 'Unsupported comment action.', array('status' => 400));
    }

    return rest_ensure_response(array(
        'comment' => array(
            'id' => $comment_id,
            'status' => wp_get_comment_status($comment_id),
        ),
    ));
}

function godseye_bridge_list_taxonomy() {
    $format = function ($term) {
        return array(
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => $term->count,
        );
    };

    return rest_ensure_response(array(
        'categories' => array_map($format, get_terms(array('taxonomy' => 'category', 'hide_empty' => false))),
        'tags' => array_map($format, get_terms(array('taxonomy' => 'post_tag', 'hide_empty' => false))),
    ));
}

function godseye_bridge_create_term(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $taxonomy = sanitize_key($params['taxonomy'] ?? 'category');
    if (!in_array($taxonomy, array('category', 'post_tag'), true)) {
        return new WP_Error('godseye_bad_taxonomy', 'Only category and post_tag terms are supported.', array('status' => 400));
    }

    $created = wp_insert_term(sanitize_text_field($params['name'] ?? ''), $taxonomy);
    if (is_wp_error($created)) {
        return $created;
    }

    return rest_ensure_response(array(
        'term' => array(
            'id' => intval($created['term_id']),
            'taxonomy' => $taxonomy,
            'name' => sanitize_text_field($params['name'] ?? ''),
        ),
    ));
}

function godseye_bridge_list_products(WP_REST_Request $request) {
    if (!class_exists('WooCommerce') || !function_exists('wc_get_products')) {
        return rest_ensure_response(array('available' => false, 'products' => array()));
    }

    $products = wc_get_products(array(
        'limit' => min(max(intval($request->get_param('limit') ?: 20), 1), 50),
        'status' => sanitize_key($request->get_param('status') ?: 'any'),
    ));

    return rest_ensure_response(array(
        'available' => true,
        'products' => array_map(function ($product) {
            return array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'status' => $product->get_status(),
                'price' => $product->get_price(),
                'sku' => $product->get_sku(),
                'stockStatus' => $product->get_stock_status(),
            );
        }, $products),
    ));
}

function godseye_bridge_update_product(WP_REST_Request $request) {
    if (!class_exists('WooCommerce') || !function_exists('wc_get_product')) {
        return rest_ensure_response(array('available' => false));
    }

    $product = wc_get_product(intval($request['id']));
    if (!$product) {
        return new WP_Error('godseye_product_not_found', 'Product not found.', array('status' => 404));
    }

    $params = $request->get_json_params();
    if (isset($params['name'])) {
        $product->set_name(sanitize_text_field($params['name']));
    }
    if (isset($params['regularPrice'])) {
        $product->set_regular_price(sanitize_text_field($params['regularPrice']));
    }
    if (isset($params['salePrice'])) {
        $product->set_sale_price(sanitize_text_field($params['salePrice']));
    }
    if (isset($params['description'])) {
        $product->set_description(wp_kses_post($params['description']));
    }
    if (isset($params['shortDescription'])) {
        $product->set_short_description(wp_kses_post($params['shortDescription']));
    }
    $product->save();

    return rest_ensure_response(array(
        'available' => true,
        'product' => array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'price' => $product->get_price(),
        ),
    ));
}

function godseye_bridge_seo_status() {
    $plugin = null;
    if (defined('WPSEO_VERSION')) {
        $plugin = 'yoast';
    } elseif (defined('RANK_MATH_VERSION')) {
        $plugin = 'rank_math';
    }

    return rest_ensure_response(array(
        'available' => $plugin !== null,
        'plugin' => $plugin,
    ));
}

function godseye_bridge_plugin_status() {
    $active_plugins = (array) get_option('active_plugins', array());
    return rest_ensure_response(array(
        'plugins' => array_map(function ($plugin) use ($active_plugins) {
            return array(
                'file' => $plugin,
                'active' => in_array($plugin, $active_plugins, true),
            );
        }, $active_plugins),
    ));
}

function godseye_bridge_theme_status() {
    $active = wp_get_theme();
    return rest_ensure_response(array(
        'activeTheme' => array(
            'name' => $active->get('Name'),
            'version' => $active->get('Version'),
            'stylesheet' => $active->get_stylesheet(),
        ),
    ));
}

function godseye_bridge_flush_cache() {
    if (!function_exists('wp_cache_flush')) {
        return rest_ensure_response(array('flushed' => false));
    }

    return rest_ensure_response(array('flushed' => (bool) wp_cache_flush()));
}

function godseye_bridge_cron_status() {
    $cron = _get_cron_array();
    $events = array();

    foreach ((array) $cron as $timestamp => $hooks) {
        foreach ((array) $hooks as $hook => $items) {
            $events[] = array(
                'hook' => $hook,
                'timestamp' => intval($timestamp),
                'date' => gmdate('c', intval($timestamp)),
                'count' => count((array) $items),
            );
            if (count($events) >= 50) {
                break 2;
            }
        }
    }

    return rest_ensure_response(array('events' => $events));
}
