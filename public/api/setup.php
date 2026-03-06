<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
header('Content-Type: application/json');

// One-time setup: creates all required database tables.
// Visit this URL once after deploying, then delete or restrict access.
require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}
$conn->set_charset('utf8mb4');

$queries = [
    // Events table
    "CREATE TABLE IF NOT EXISTS events (
        id           VARCHAR(100)  NOT NULL PRIMARY KEY,
        heading      VARCHAR(255)  NOT NULL,
        title        VARCHAR(255)  NOT NULL,
        description  TEXT          NOT NULL,
        image_url    TEXT,
        event_date   DATETIME      NOT NULL,
        location     VARCHAR(255),
        created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Links table
    "CREATE TABLE IF NOT EXISTS links (
        id           VARCHAR(100)  NOT NULL PRIMARY KEY,
        label        VARCHAR(255)  NOT NULL,
        url          TEXT          NOT NULL,
        description  TEXT,
        created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Event Registrations / Leads table
    "CREATE TABLE IF NOT EXISTS registrations (
        id            VARCHAR(100)  NOT NULL PRIMARY KEY,
        event_id      VARCHAR(100)  NOT NULL,
        event_title   VARCHAR(255)  NOT NULL,
        first_name    VARCHAR(255)  NOT NULL,
        last_name     VARCHAR(255)  NOT NULL,
        email         VARCHAR(255),
        phone         VARCHAR(50),
        message       TEXT,
        registered_at DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Admin settings table (key/value pairs)
    "CREATE TABLE IF NOT EXISTS admin_settings (
        setting_key   VARCHAR(50)   NOT NULL PRIMARY KEY,
        setting_value TEXT          NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

$results = [];
foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        // Extract table name for the message
        preg_match('/TABLE IF NOT EXISTS (\w+)/', $sql, $m);
        $results[] = ['table' => $m[1] ?? 'unknown', 'status' => 'created or already exists'];
    } else {
        $results[] = ['status' => 'error', 'message' => $conn->error];
    }
}
$conn->close();

echo json_encode(['setup' => 'complete', 'tables' => $results], JSON_PRETTY_PRINT);
