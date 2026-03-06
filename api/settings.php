<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = get_db();

switch ($method) {

    case 'GET':
        $result = $db->query("SELECT setting_key, setting_value FROM admin_settings");
        $settings = ['eventsEnabled' => false, 'linksEnabled' => false];
        while ($row = $result->fetch_assoc()) {
            if ($row['setting_key'] === 'eventsEnabled') {
                $settings['eventsEnabled'] = $row['setting_value'] === '1';
            }
            if ($row['setting_key'] === 'linksEnabled') {
                $settings['linksEnabled'] = $row['setting_value'] === '1';
            }
        }
        send($settings);
        break;

    case 'POST':
        $d = json_body();
        $eventsEnabled = isset($d['eventsEnabled']) && $d['eventsEnabled'] ? '1' : '0';
        $linksEnabled  = isset($d['linksEnabled'])  && $d['linksEnabled']  ? '1' : '0';

        $stmt = $db->prepare(
            "INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)"
        );

        $key = 'eventsEnabled';
        $stmt->bind_param('ss', $key, $eventsEnabled);
        $stmt->execute();

        $key = 'linksEnabled';
        $stmt->bind_param('ss', $key, $linksEnabled);
        $stmt->execute();

        send(['ok' => true]);
        break;

    default:
        send(['error' => 'Method not allowed'], 405);
}
$db->close();
