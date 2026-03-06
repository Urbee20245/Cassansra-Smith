<?php
// Helper: check $_ENV, $_SERVER, then getenv() — Hostinger/PHP-FPM
// may expose env vars in $_SERVER rather than getenv().
function env(string $key, string $default = ''): string {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    $v = getenv($key);
    return ($v !== false && $v !== '') ? $v : $default;
}

define('DB_HOST', env('DB_HOST', 'srv756.hstgr.io'));
define('DB_NAME', env('DB_NAME'));
define('DB_USER', env('DB_USER'));
define('DB_PASS', env('DB_PASS'));
