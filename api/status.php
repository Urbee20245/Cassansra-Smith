<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(200);
    echo json_encode([
        'connected' => false,
        'error'     => $conn->connect_error,
        'tables'    => [],
    ]);
    exit;
}

$conn->set_charset('utf8mb4');

$needed = ['events', 'links', 'registrations', 'admin_settings'];
$tables = [];
foreach ($needed as $t) {
    $r = $conn->query("SHOW TABLES LIKE '$t'");
    $tables[$t] = $r && $r->num_rows > 0;
}

$conn->close();

echo json_encode([
    'connected' => true,
    'tables'    => $tables,
    'all_ready' => !in_array(false, $tables, true),
]);
