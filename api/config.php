<?php
// Hostinger may expose env vars via $_SERVER, $_ENV, or getenv() depending
// on the PHP SAPI (CGI vs FPM). Try all three, fall back to empty string.
function _env(string $key): string {
    return $_SERVER[$key] ?? $_ENV[$key] ?? (getenv($key) ?: '');
}

define('DB_HOST', _env('DB_HOST') ?: 'localhost');
define('DB_NAME', _env('DB_NAME') ?: '');
define('DB_USER', _env('DB_USER') ?: '');
define('DB_PASS', _env('DB_PASS') ?: '');
