<?php
/**
 * Plugin Name: GP Formation – Sessions de récupération de points
 * Description: Shortcode [gpformation_sessions] : affiche les prochaines sessions publiées par gpformation.fr et renvoie vers son formulaire d'inscription avec le canal d'acquisition du site partenaire.
 * Version: 1.0.0
 * Author: GP Formation
 *
 * Installation : copier ce fichier dans wp-content/mu-plugins/ (créer le
 * dossier si besoin). Aucune activation nécessaire.
 *
 * Usage : [gpformation_sessions]
 *         [gpformation_sessions affichage="boutons"]
 *         [gpformation_sessions canal="ecolegallieni" bouton="Je m'inscris"]
 */

if (!defined('ABSPATH')) {
    exit;
}

const GPFORMATION_SESSIONS_API_URL = 'https://www.gpformation.fr/api/recovery-sessions';
const GPFORMATION_REGISTRATION_URL = 'https://www.gpformation.fr/recuperation-de-points';
const GPFORMATION_REGISTRATION_ANCHOR = 'inscription-points';
const GPFORMATION_DEFAULT_CHANNEL = 'ecolegallieni';
const GPFORMATION_ALLOWED_CHANNELS = array('gpformation', 'ecolegallieni');
const GPFORMATION_SESSIONS_TRANSIENT = 'gpformation_recovery_sessions';
const GPFORMATION_SESSIONS_BACKUP_TRANSIENT = 'gpformation_recovery_sessions_backup';
const GPFORMATION_SESSIONS_TTL = 10 * MINUTE_IN_SECONDS;
const GPFORMATION_SESSIONS_BACKUP_TTL = 7 * DAY_IN_SECONDS;
const GPFORMATION_SESSIONS_HASH_OPTION = 'gpformation_recovery_sessions_hash';
const GPFORMATION_SESSIONS_POSTS_OPTION = 'gpformation_recovery_sessions_posts';
const GPFORMATION_SESSIONS_CRON_HOOK = 'gpformation_refresh_recovery_sessions';

/**
 * Downloads the upcoming sessions from gpformation.fr.
 *
 * @return array<int, array{start: string, end: string, label: string}>|null
 *         Null when the API is unreachable or returns an unexpected payload.
 */
function gpformation_fetch_sessions_from_api()
{
    $response = wp_remote_get(
        GPFORMATION_SESSIONS_API_URL,
        array(
            'timeout' => 5,
            'headers' => array('Accept' => 'application/json'),
        )
    );

    if (is_wp_error($response) || (int) wp_remote_retrieve_response_code($response) !== 200) {
        return null;
    }

    $payload = json_decode(wp_remote_retrieve_body($response), true);

    if (!is_array($payload) || !isset($payload['sessions']) || !is_array($payload['sessions'])) {
        return null;
    }

    $sessions = array();

    foreach ($payload['sessions'] as $session) {
        if (
            !is_array($session)
            || !isset($session['start'], $session['end'])
            || !gpformation_is_iso_date($session['start'])
            || !gpformation_is_iso_date($session['end'])
        ) {
            continue;
        }

        $label = isset($session['label']) && is_string($session['label']) && $session['label'] !== ''
            ? $session['label']
            : gpformation_format_session_label($session['start'], $session['end']);

        $sessions[] = array(
            'start' => $session['start'],
            'end' => $session['end'],
            'label' => $label,
        );
    }

    return $sessions;
}

function gpformation_is_iso_date($value)
{
    return is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1;
}

function gpformation_format_session_label($start, $end)
{
    $format = function ($date) {
        $timestamp = strtotime($date . ' 12:00:00 UTC');
        return function_exists('wp_date') ? wp_date('j F Y', $timestamp) : date('j F Y', $timestamp);
    };

    return $format($start) . ' — ' . $format($end);
}

/**
 * Returns the sessions to display, refreshing the cache when needed.
 *
 * A short transient keeps the API traffic low; a long-lived backup copy keeps
 * the page working when gpformation.fr is temporarily unreachable.
 *
 * @return array<int, array{start: string, end: string, label: string}>
 */
function gpformation_get_sessions($force_refresh = false)
{
    if (!$force_refresh) {
        $cached = get_transient(GPFORMATION_SESSIONS_TRANSIENT);
        if (is_array($cached)) {
            return $cached;
        }
    }

    $sessions = gpformation_fetch_sessions_from_api();

    if ($sessions === null) {
        $backup = get_transient(GPFORMATION_SESSIONS_BACKUP_TRANSIENT);
        return is_array($backup) ? $backup : array();
    }

    set_transient(GPFORMATION_SESSIONS_TRANSIENT, $sessions, GPFORMATION_SESSIONS_TTL);
    set_transient(GPFORMATION_SESSIONS_BACKUP_TRANSIENT, $sessions, GPFORMATION_SESSIONS_BACKUP_TTL);
    gpformation_purge_page_cache_if_changed($sessions);

    return $sessions;
}

/**
 * WP Rocket serves the rendered page for hours: when the session list
 * changes, the pages that embed the shortcode are purged so visitors see the
 * new dates on their next visit.
 */
function gpformation_purge_page_cache_if_changed(array $sessions)
{
    $hash = md5(wp_json_encode($sessions));

    if (get_option(GPFORMATION_SESSIONS_HASH_OPTION) === $hash) {
        return;
    }

    update_option(GPFORMATION_SESSIONS_HASH_OPTION, $hash, false);

    if (!function_exists('rocket_clean_post')) {
        return;
    }

    $post_ids = get_option(GPFORMATION_SESSIONS_POSTS_OPTION, array());

    foreach (is_array($post_ids) ? $post_ids : array() as $post_id) {
        rocket_clean_post((int) $post_id);
    }
}

function gpformation_remember_shortcode_post()
{
    $post_id = (int) get_the_ID();

    if ($post_id <= 0) {
        return;
    }

    $post_ids = get_option(GPFORMATION_SESSIONS_POSTS_OPTION, array());
    $post_ids = is_array($post_ids) ? $post_ids : array();

    if (!in_array($post_id, $post_ids, true)) {
        $post_ids[] = $post_id;
        update_option(GPFORMATION_SESSIONS_POSTS_OPTION, $post_ids, false);
    }
}

function gpformation_normalize_channel($value)
{
    return in_array($value, GPFORMATION_ALLOWED_CHANNELS, true) ? $value : GPFORMATION_DEFAULT_CHANNEL;
}

function gpformation_registration_url($channel, $session_start = '')
{
    $query = array('canal' => $channel);

    if ($session_start !== '') {
        $query['session'] = $session_start;
    }

    return GPFORMATION_REGISTRATION_URL . '?' . http_build_query($query) . '#' . GPFORMATION_REGISTRATION_ANCHOR;
}

/**
 * [gpformation_sessions] shortcode.
 *
 * Attributes:
 * - canal      : acquisition channel sent to gpformation.fr (default: ecolegallieni)
 * - affichage  : "liste" (select + button, default) or "boutons" (one button per date)
 * - bouton     : button label
 * - titre      : label displayed above the select
 * - vide       : message when no session is open
 */
function gpformation_sessions_shortcode($atts = array())
{
    $atts = shortcode_atts(
        array(
            'canal' => GPFORMATION_DEFAULT_CHANNEL,
            'affichage' => 'liste',
            'bouton' => "Je m'inscris",
            'titre' => 'Session',
            'vide' => 'Aucune session n’est ouverte pour le moment. Contactez-nous pour connaître les prochaines dates.',
        ),
        $atts,
        'gpformation_sessions'
    );

    gpformation_remember_shortcode_post();

    $channel = gpformation_normalize_channel($atts['canal']);
    $sessions = gpformation_get_sessions();
    $fallback_url = gpformation_registration_url($channel);

    if (empty($sessions)) {
        return '<div class="gpf-sessions gpf-sessions--empty">'
            . '<p>' . esc_html($atts['vide']) . '</p>'
            . '<a class="et_pb_button gpf-sessions__button" href="' . esc_url($fallback_url) . '">'
            . esc_html($atts['bouton']) . '</a>'
            . '</div>';
    }

    if ($atts['affichage'] === 'boutons') {
        $html = '<div class="gpf-sessions gpf-sessions--boutons">';
        foreach ($sessions as $session) {
            $html .= '<a class="et_pb_button gpf-sessions__button" href="'
                . esc_url(gpformation_registration_url($channel, $session['start'])) . '">'
                . esc_html($session['label']) . '</a>';
        }
        return $html . '</div>';
    }

    $select_id = 'gpf-session-' . substr(md5((string) get_the_ID() . $channel), 0, 8);
    $html = '<form class="gpf-sessions gpf-sessions--liste" method="get" action="'
        . esc_url(GPFORMATION_REGISTRATION_URL . '#' . GPFORMATION_REGISTRATION_ANCHOR) . '">'
        . '<input type="hidden" name="canal" value="' . esc_attr($channel) . '" />'
        . '<label class="gpf-sessions__label" for="' . esc_attr($select_id) . '">' . esc_html($atts['titre']) . '</label>'
        . '<select class="gpf-sessions__select" id="' . esc_attr($select_id) . '" name="session" required>'
        . '<option value="">Sélectionner une session</option>';

    foreach ($sessions as $session) {
        $html .= '<option value="' . esc_attr($session['start']) . '">' . esc_html($session['label']) . '</option>';
    }

    $html .= '</select>'
        . '<button type="submit" class="et_pb_button gpf-sessions__button">' . esc_html($atts['bouton']) . '</button>'
        . '</form>';

    return $html;
}
add_shortcode('gpformation_sessions', 'gpformation_sessions_shortcode');

function gpformation_sessions_styles()
{
    echo '<style id="gpformation-sessions-css">'
        . '.gpf-sessions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}'
        . '.gpf-sessions--boutons{flex-direction:column;align-items:stretch}'
        . '.gpf-sessions__label{font-weight:600}'
        . '.gpf-sessions__select{min-width:240px;padding:10px 12px;border:1px solid #ccc;border-radius:4px}'
        . '.gpf-sessions__button{cursor:pointer;text-align:center}'
        . '</style>';
}
add_action('wp_head', 'gpformation_sessions_styles');

/**
 * Background refresh so that the page cache is purged when dates change
 * even if nobody triggers a shortcode render in the meantime.
 */
function gpformation_schedule_sessions_refresh()
{
    if (!wp_next_scheduled(GPFORMATION_SESSIONS_CRON_HOOK)) {
        wp_schedule_event(time() + GPFORMATION_SESSIONS_TTL, 'gpformation_ten_minutes', GPFORMATION_SESSIONS_CRON_HOOK);
    }
}
add_action('init', 'gpformation_schedule_sessions_refresh');

function gpformation_sessions_cron_schedules(array $schedules)
{
    $schedules['gpformation_ten_minutes'] = array(
        'interval' => GPFORMATION_SESSIONS_TTL,
        'display' => 'Toutes les dix minutes (GP Formation)',
    );
    return $schedules;
}
add_filter('cron_schedules', 'gpformation_sessions_cron_schedules');

function gpformation_refresh_sessions_cron()
{
    gpformation_get_sessions(true);
}
add_action(GPFORMATION_SESSIONS_CRON_HOOK, 'gpformation_refresh_sessions_cron');
