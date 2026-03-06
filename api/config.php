<?php
// Read from Hostinger environment variables first; fall back to hardcoded values.
// In Hostinger → Hosting → Configuration → PHP → Environment Variables, set:
//   DB_HOST, DB_USER, DB_PASS, DB_NAME
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'u699505866_gapbridgecs');
define('DB_PASS', getenv('DB_PASS') ?: 'T3S7!8db#0u1htt@');
define('DB_NAME', getenv('DB_NAME') ?: 'u699505866_gapbridgecs');
