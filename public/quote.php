<?php
/**
 * JNT Suppliers quote form handler.
 *
 * - No database. Settings and secrets come from a config file OUTSIDE public_html.
 * - Checks: POST only, same origin, honeypot, minimum fill time, Cloudflare Turnstile,
 *   per-IP rate limit, field validation. Header injection is blocked by stripping line
 *   breaks from every value that goes into a mail header.
 * - Replies with JSON for fetch() requests, or a 303 redirect for plain form posts.
 */

declare(strict_types=1);

ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// ---------- Config ----------
// /home/<user>/public_html[/sub] -> /home/<user>/jnt-form-config.php (outside the web root).
$home = preg_replace('#/public_html(/.*)?$#', '', __DIR__);
if ($home === __DIR__) {
    $home = dirname(__DIR__); // local development: one level above the web root
}
$configFile = getenv('JNT_FORM_CONFIG') ?: $home . '/jnt-form-config.php';
if (!is_readable($configFile)) {
    error_log('[quote] config file missing: ' . $configFile);
    respond(false, 'The form is not available right now. Please WhatsApp or call us.', [], 500);
}
$config = require $configFile;

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

// ---------- Request checks ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Method not allowed.', [], 405);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    respond(false, 'Request not allowed.', [], 403);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    respond(false, 'Your message is too long.', [], 413);
}

// Honeypot filled, or the form was sent faster than a person can type: pretend it worked.
$opened = (int) ($_POST['t'] ?? 0);
$elapsedMs = (int) (microtime(true) * 1000) - $opened;
if (trim((string) ($_POST['fax_number'] ?? '')) !== '' || $opened === 0 || $elapsedMs < 3000 || $elapsedMs > 86400000) {
    respond(true);
}

// ---------- Rate limit: N submissions per IP per hour ----------
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!rate_limit_ok($config['data_dir'], $ip, (int) ($config['max_per_hour'] ?? 5))) {
    respond(false, 'Too many requests from your connection. Please WhatsApp or call us instead.', [], 429);
}

// ---------- Fields ----------
$name     = clean_line($_POST['name'] ?? '', 100);
$company  = clean_line($_POST['company'] ?? '', 120);
$phone    = clean_line($_POST['phone'] ?? '', 30);
$email    = clean_line($_POST['email'] ?? '', 160);
$product  = clean_line($_POST['product'] ?? '', 40);
$quantity = clean_line($_POST['quantity'] ?? '', 80);
$message  = clean_text($_POST['message'] ?? '', 3000);

$errors = [];
if ($name === '') {
    $errors['name'] = 'Please enter your name.';
}
if (!preg_match('/^[+\d][\d\s()\-]{6,}$/', $phone)) {
    $errors['phone'] = 'Please enter a phone or WhatsApp number.';
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'This email address looks incomplete.';
}
if (mb_strlen($message) < 5) {
    $errors['message'] = 'Please tell us a little about what you need.';
}
if ($product !== '' && !preg_match('/^[a-z-]+$/', $product)) {
    $product = '';
}
if ($errors) {
    respond(false, 'Please check the highlighted fields.', $errors, 422);
}

// ---------- Turnstile ----------
if (empty($config['dev_skip_turnstile'])) {
    $token = (string) ($_POST['cf-turnstile-response'] ?? '');
    if ($token === '' || !turnstile_ok($config, $token, $ip)) {
        respond(false, 'The spam check failed. Please try again, or WhatsApp us.', [], 400);
    }
}

// ---------- Send ----------
$productLabel = $product === '' ? 'Not specified' : ucwords(str_replace('-', ' ', $product));
$subject = 'Quote request: ' . $productLabel . ' – ' . $name;

$body = implode("\n", [
    'New quote request from the website',
    '',
    'Name:     ' . $name,
    'Company:  ' . ($company ?: '-'),
    'Phone:    ' . $phone,
    'Email:    ' . ($email ?: '-'),
    'Product:  ' . $productLabel,
    'Quantity: ' . ($quantity ?: '-'),
    '',
    'Message:',
    $message,
    '',
    '--',
    'Sent ' . gmdate('Y-m-d H:i') . ' UTC from ' . ($config['site_name'] ?? 'the website'),
]);

$from = $config['from'];
$headers = [
    'From' => 'JNT Suppliers website <' . $from . '>',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
    'MIME-Version' => '1.0',
];
if ($email !== '') {
    $headers['Reply-To'] = $email;
}

$sent = mail(
    $config['to'],
    mb_encode_mimeheader($subject, 'UTF-8', 'Q'),
    $body,
    $headers,
    '-f' . $from
);

if (!$sent) {
    error_log('[quote] mail() failed');
    respond(false, 'Sorry, your request could not be sent. Please WhatsApp or call us.', [], 500);
}
respond(true);

// ---------- Helpers ----------

/** Single-line value: no control characters or line breaks (blocks header injection). */
function clean_line($value, int $max): string
{
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

/** Multi-line value: keep newlines, drop other control characters. */
function clean_text($value, int $max): string
{
    $value = is_string($value) ? $value : '';
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

function rate_limit_ok(string $dir, string $ip, int $max): bool
{
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        error_log('[quote] cannot create data dir');
        return true; // fail open, Turnstile still applies
    }
    $file = $dir . '/rl-' . hash('sha256', $ip) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return true;
    }
    flock($fh, LOCK_EX);
    $now = time();
    $hits = json_decode(stream_get_contents($fh) ?: '[]', true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], fn ($t) => is_int($t) && $t > $now - 3600));
    $ok = count($hits) < $max;
    if ($ok) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);

    // Occasionally remove stale files.
    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/rl-*.json') ?: [] as $f) {
            if (filemtime($f) < $now - 86400) {
                @unlink($f);
            }
        }
    }
    return $ok;
}

function turnstile_ok(array $config, string $token, string $ip): bool
{
    $payload = http_build_query([
        'secret' => $config['turnstile_secret'],
        'response' => $token,
        'remoteip' => $ip,
    ]);
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
        ]);
        $raw = curl_exec($ch);
        curl_close($ch);
    } else {
        $raw = @file_get_contents($url, false, stream_context_create(['http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $payload,
            'timeout' => 8,
        ]]));
    }
    if (!is_string($raw)) {
        error_log('[quote] turnstile request failed');
        return false;
    }
    $res = json_decode($raw, true);
    if (empty($res['success'])) {
        return false;
    }
    $hosts = $config['allowed_hostnames'] ?? [];
    return !$hosts || in_array($res['hostname'] ?? '', $hosts, true);
}

function respond(bool $ok, string $message = '', array $errors = [], int $status = 200): void
{
    global $wantsJson, $config;
    $thanks = $config['thanks_url'] ?? '/contact/thanks/';
    $contact = $config['contact_url'] ?? '/contact/';

    if (!empty($wantsJson)) {
        http_response_code($ok ? 200 : $status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true, 'redirect' => $thanks] : ['ok' => false, 'message' => $message, 'errors' => (object) $errors]);
        exit;
    }
    header('Location: ' . ($ok ? $thanks : $contact . '?sent=0'), true, 303);
    exit;
}
