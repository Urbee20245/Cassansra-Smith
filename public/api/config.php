<?php
// Helper: check $_ENV, $_SERVER, then getenv() — Hostinger/PHP-FPM
// may expose env vars in $_SERVER rather than getenv().
function env(string $key, string $default = ''): string {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    $v = getenv($key);
    return ($v !== false && $v !== '') ? $v : $default;
}

define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'u699505866_gapbridgecs'));
define('DB_USER', env('DB_USER', 'u699505866_gapbridgecs'));
define('DB_PASS', env('DB_PASS'));

// If env var still empty, load from a local credentials file (never committed to git).
// Create this file manually in Hostinger File Manager if needed.
if (DB_PASS === '' && file_exists(__DIR__ . '/credentials.php')) {
    require_once __DIR__ . '/credentials.php';
}
