<?php
// Resolve credentials in priority order:
// 1. $_SERVER / $_ENV / getenv()  (Hostinger hPanel env vars, if they work)
// 2. api/.env file               (create this file in Hostinger File Manager)
// 3. Empty string (connection will fail with a clear error)

function _env(string $key): string {
    // Try superglobals / getenv first
    $val = $_SERVER[$key] ?? $_ENV[$key] ?? (getenv($key) ?: '');
    if ($val !== '') return $val;

    // Fall back to .env file in the same directory
    static $dotenv = null;
    if ($dotenv === null) {
        $dotenv = [];
        $file = __DIR__ . '/.env';
        if (is_readable($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') continue;
                if (strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $dotenv[trim($k)] = trim($v, " \t\"'");
            }
        }
    }
    return $dotenv[$key] ?? '';
}

define('DB_HOST', _env('DB_HOST') ?: 'localhost');
define('DB_NAME', _env('DB_NAME') ?: '');
define('DB_USER', _env('DB_USER') ?: '');
define('DB_PASS', _env('DB_PASS') ?: '');
