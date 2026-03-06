<?php
// Helper: check $_ENV, $_SERVER, then getenv() — Hostinger/PHP-FPM
// may expose env vars in $_SERVER rather than getenv().
function env(string $key, string $default = ''): string {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    $v = getenv($key);
    return ($v !== false && $v !== '') ? $v : $default;
}

// If env vars are not set, load from a credentials file stored OUTSIDE public_html
// so it survives git redeployments and is never web-accessible.
// Path: /home/u699505866/db_credentials.php  (4 levels up from /public_html/api/)
// Must be included BEFORE defining constants so its define() calls take effect.
if (env('DB_PASS') === '') {
    $credFile = dirname(__DIR__, 4) . '/db_credentials.php';
    if (file_exists($credFile)) {
        require_once $credFile;
    }
}

if (!defined('DB_HOST')) define('DB_HOST', env('DB_HOST', 'localhost'));
if (!defined('DB_NAME')) define('DB_NAME', env('DB_NAME', 'u699505866_gapbridgecs'));
if (!defined('DB_USER')) define('DB_USER', env('DB_USER', 'u699505866_gapbridgecs'));
if (!defined('DB_PASS')) define('DB_PASS', env('DB_PASS'));
