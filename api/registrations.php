<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = get_db();

switch ($method) {

    case 'GET':
        $result = $db->query("SELECT * FROM registrations ORDER BY registered_at DESC");
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id'           => $row['id'],
                'eventId'      => $row['event_id'],
                'eventTitle'   => $row['event_title'],
                'firstName'    => $row['first_name'],
                'lastName'     => $row['last_name'],
                'email'        => $row['email'] ?? '',
                'phone'        => $row['phone'] ?? '',
                'message'      => $row['message'] ?? '',
                'registeredAt' => $row['registered_at'],
            ];
        }
        send($rows);
        break;

    case 'POST':
        $d = json_body();
        if (empty($d['id']) || empty($d['firstName']) || empty($d['lastName'])) {
            send(['error' => 'Missing required fields (id, firstName, lastName)'], 400);
        }
        $stmt = $db->prepare(
            "INSERT INTO registrations
             (id, event_id, event_title, first_name, last_name, email, phone, message, registered_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $registeredAt = $d['registeredAt'] ?? date('Y-m-d H:i:s');
        $email   = $d['email']      ?? '';
        $phone   = $d['phone']      ?? '';
        $message = $d['message']    ?? '';
        $eventId    = $d['eventId']    ?? '';
        $eventTitle = $d['eventTitle'] ?? '';
        $stmt->bind_param('sssssssss',
            $d['id'], $eventId, $eventTitle,
            $d['firstName'], $d['lastName'],
            $email, $phone, $message, $registeredAt
        );
        if ($stmt->execute()) {
            send(['ok' => true], 201);
        } else {
            send(['error' => $stmt->error], 500);
        }
        break;

    default:
        send(['error' => 'Method not allowed'], 405);
}
$db->close();
