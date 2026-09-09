<?php
/**
 * Standalone test harness for gpformation-sessions.php (no WordPress needed).
 * Run: php services/wordpress/test-gpformation-sessions.php
 */

declare(strict_types=1);

// --- Minimal WordPress stubs -------------------------------------------------
define('ABSPATH', __DIR__ . '/');
define('MINUTE_IN_SECONDS', 60);
define('DAY_IN_SECONDS', 86400);

$GLOBALS['wp'] = array(
    'transients' => array(),
    'options' => array(),
    'shortcodes' => array(),
    'actions' => array(),
    'filters' => array(),
    'http' => null,
    'http_calls' => 0,
    'purged' => array(),
    'post_id' => 42,
);

function add_shortcode($tag, $callback) { $GLOBALS['wp']['shortcodes'][$tag] = $callback; }
function add_action($hook, $callback) { $GLOBALS['wp']['actions'][$hook][] = $callback; }
function add_filter($hook, $callback) { $GLOBALS['wp']['filters'][$hook][] = $callback; }
function shortcode_atts(array $defaults, $atts, $shortcode = '') { return array_merge($defaults, array_intersect_key((array) $atts, $defaults)); }
function get_transient($key) { return $GLOBALS['wp']['transients'][$key] ?? false; }
function set_transient($key, $value, $ttl = 0) { $GLOBALS['wp']['transients'][$key] = $value; return true; }
function get_option($key, $default = false) { return $GLOBALS['wp']['options'][$key] ?? $default; }
function update_option($key, $value, $autoload = null) { $GLOBALS['wp']['options'][$key] = $value; return true; }
function get_the_ID() { return $GLOBALS['wp']['post_id']; }
function wp_json_encode($value) { return json_encode($value); }
function wp_next_scheduled($hook) { return false; }
function wp_schedule_event($timestamp, $recurrence, $hook) { return true; }
function esc_html($text) { return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8'); }
function esc_attr($text) { return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8'); }
function esc_url($url) { return htmlspecialchars((string) $url, ENT_QUOTES, 'UTF-8'); }
function is_wp_error($thing) { return $thing instanceof WP_Error; }
function wp_remote_get($url, $args = array()) { $GLOBALS['wp']['http_calls']++; return $GLOBALS['wp']['http']; }
function wp_remote_retrieve_response_code($response) { return $response['code'] ?? 0; }
function wp_remote_retrieve_body($response) { return $response['body'] ?? ''; }
function rocket_clean_post($post_id) { $GLOBALS['wp']['purged'][] = $post_id; }
class WP_Error {}

require __DIR__ . '/gpformation-sessions.php';

// --- Helpers -----------------------------------------------------------------
$failures = 0;
function check(bool $condition, string $message): void
{
    global $failures;
    if ($condition) {
        echo "  ok  $message\n";
    } else {
        $failures++;
        echo "  FAIL $message\n";
    }
}
function render(array $atts = array()): string
{
    return call_user_func($GLOBALS['wp']['shortcodes']['gpformation_sessions'], $atts);
}
function api_response(array $sessions, int $code = 200): array
{
    return array('code' => $code, 'body' => json_encode(array('sessions' => $sessions)));
}
function reset_state(): void
{
    $GLOBALS['wp']['transients'] = array();
    $GLOBALS['wp']['options'] = array();
    $GLOBALS['wp']['http_calls'] = 0;
    $GLOBALS['wp']['purged'] = array();
}

$sessions = array(
    array('start' => '2026-10-05', 'end' => '2026-10-06', 'label' => '5 octobre 2026 — 6 octobre 2026'),
    array('start' => '2026-11-16', 'end' => '2026-11-17', 'label' => '16 novembre 2026 — 17 novembre 2026'),
);

echo "Shortcode registration\n";
check(isset($GLOBALS['wp']['shortcodes']['gpformation_sessions']), 'registers [gpformation_sessions]');

echo "List rendering\n";
reset_state();
$GLOBALS['wp']['http'] = api_response($sessions);
$html = render();
check(strpos($html, 'action="https://www.gpformation.fr/recuperation-de-points#inscription-points"') !== false, 'form targets the registration page with the anchor');
check(strpos($html, 'name="canal" value="ecolegallieni"') !== false, 'default channel is ecolegallieni');
check(strpos($html, '<option value="2026-10-05">5 octobre 2026 — 6 octobre 2026</option>') !== false, 'renders each session as an option');
check(substr_count($html, '<option value="2026-') === 2, 'renders exactly the sessions returned by the API');
check(strpos($html, 'name="session" required') !== false, 'session select is required');
check($GLOBALS['wp']['options'][GPFORMATION_SESSIONS_POSTS_OPTION] === array(42), 'remembers the post embedding the shortcode');

echo "Caching\n";
$calls = $GLOBALS['wp']['http_calls'];
render();
check($GLOBALS['wp']['http_calls'] === $calls, 'second render is served from the transient');

echo "Button rendering\n";
$html = render(array('affichage' => 'boutons', 'bouton' => 'Réserver'));
check(strpos($html, 'href="https://www.gpformation.fr/recuperation-de-points?canal=ecolegallieni&amp;session=2026-11-16#inscription-points"') !== false, 'each button links to the session with channel and anchor');
check(substr_count($html, 'class="et_pb_button gpf-sessions__button"') === 2, 'one Divi-styled button per session');

echo "Channel validation\n";
$html = render(array('canal' => '<script>'));
check(strpos($html, 'value="ecolegallieni"') !== false && strpos($html, '<script>') === false, 'unknown channel falls back to ecolegallieni and is never echoed');
$html = render(array('canal' => 'gpformation'));
check(strpos($html, 'name="canal" value="gpformation"') !== false, 'whitelisted channel is honoured');

echo "API failure with backup copy\n";
$GLOBALS['wp']['transients'] = array(GPFORMATION_SESSIONS_BACKUP_TRANSIENT => $sessions);
$GLOBALS['wp']['http'] = new WP_Error();
$html = render();
check(substr_count($html, '<option value="2026-') === 2, 'serves the last known sessions when the API is down');

echo "API failure without any copy\n";
reset_state();
$GLOBALS['wp']['http'] = array('code' => 503, 'body' => '{}');
$html = render();
check(strpos($html, 'gpf-sessions--empty') !== false, 'renders the empty state');
check(strpos($html, 'href="https://www.gpformation.fr/recuperation-de-points?canal=ecolegallieni#inscription-points"') !== false, 'empty state still links to the form with the channel');

echo "Payload validation\n";
reset_state();
$GLOBALS['wp']['http'] = api_response(array(
    array('start' => '05/10/2026', 'end' => '2026-10-06'),
    array('start' => '2026-12-01', 'end' => '2026-12-02', 'label' => '<b>x</b>'),
    'garbage',
));
$html = render();
check(substr_count($html, '<option value="2026-') === 1, 'drops sessions with invalid dates');
check(strpos($html, '&lt;b&gt;x&lt;/b&gt;') !== false, 'escapes labels coming from the API');

echo "Page cache purge when dates change\n";
reset_state();
$GLOBALS['wp']['options'][GPFORMATION_SESSIONS_POSTS_OPTION] = array(42, 43);
$GLOBALS['wp']['http'] = api_response($sessions);
gpformation_get_sessions(true);
check($GLOBALS['wp']['purged'] === array(42, 43), 'first fetch purges the remembered pages');
$GLOBALS['wp']['purged'] = array();
gpformation_get_sessions(true);
check($GLOBALS['wp']['purged'] === array(), 'unchanged dates do not purge');
$GLOBALS['wp']['http'] = api_response(array_slice($sessions, 0, 1));
gpformation_get_sessions(true);
check($GLOBALS['wp']['purged'] === array(42, 43), 'changed dates purge again');

echo "Cron\n";
check(isset($GLOBALS['wp']['actions']['init'], $GLOBALS['wp']['actions'][GPFORMATION_SESSIONS_CRON_HOOK]), 'schedules and handles the refresh cron');
$schedules = call_user_func($GLOBALS['wp']['filters']['cron_schedules'][0], array());
check(($schedules['gpformation_ten_minutes']['interval'] ?? 0) === 600, 'declares a ten-minute schedule');

echo $failures === 0 ? "\nAll checks passed\n" : "\n$failures check(s) failed\n";
exit($failures === 0 ? 0 : 1);
