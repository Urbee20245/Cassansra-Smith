<?php
// Shared database connection helper
// config.php lives at /public_html/config.php (one level above /api/).
// It is NOT in git — create it manually on the server with your real credentials.
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function ensure_tables($conn) {
    $queries = [
        "CREATE TABLE IF NOT EXISTS events (
            id           VARCHAR(100)  NOT NULL PRIMARY KEY,
            heading      VARCHAR(255)  NOT NULL DEFAULT '',
            title        VARCHAR(255)  NOT NULL,
            description  TEXT          NOT NULL DEFAULT '',
            image_url    TEXT,
            event_date   DATETIME      NOT NULL,
            location     VARCHAR(255),
            created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS links (
            id           VARCHAR(100)  NOT NULL PRIMARY KEY,
            label        VARCHAR(255)  NOT NULL,
            url          TEXT          NOT NULL,
            description  TEXT,
            created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS registrations (
            id            VARCHAR(100)  NOT NULL PRIMARY KEY,
            event_id      VARCHAR(100)  NOT NULL DEFAULT '',
            event_title   VARCHAR(255)  NOT NULL DEFAULT '',
            first_name    VARCHAR(255)  NOT NULL,
            last_name     VARCHAR(255)  NOT NULL,
            email         VARCHAR(255),
            phone         VARCHAR(50),
            message       TEXT,
            registered_at DATETIME      DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS admin_settings (
            setting_key   VARCHAR(50)   NOT NULL PRIMARY KEY,
            setting_value TEXT          NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];
    foreach ($queries as $sql) {
        $conn->query($sql);
    }
}

function get_db() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    $conn->set_charset('utf8mb4');
    ensure_tables($conn);
    return $conn;
}

function json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return $data ?? [];
}

function send($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
