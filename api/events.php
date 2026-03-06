<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = get_db();

switch ($method) {

    case 'GET':
        $result = $db->query("SELECT * FROM events ORDER BY event_date ASC");
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id'          => $row['id'],
                'heading'     => $row['heading'],
                'title'       => $row['title'],
                'description' => $row['description'],
                'imageUrl'    => $row['image_url'] ?? '',
                'eventDate'   => $row['event_date'],
                'location'    => $row['location'] ?? '',
                'createdAt'   => $row['created_at'],
            ];
        }
        send($rows);
        break;

    case 'POST':
        $d = json_body();
        if (empty($d['id']) || empty($d['title']) || empty($d['eventDate'])) {
            send(['error' => 'Missing required fields (id, title, eventDate)'], 400);
        }
        $stmt = $db->prepare(
            "INSERT INTO events (id, heading, title, description, image_url, event_date, location, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $createdAt = $d['createdAt'] ?? date('Y-m-d H:i:s');
        $stmt->bind_param('ssssssss',
            $d['id'], $d['heading'], $d['title'], $d['description'],
            $d['imageUrl'], $d['eventDate'], $d['location'], $createdAt
        );
        if ($stmt->execute()) {
            send(['ok' => true, 'id' => $d['id']], 201);
        } else {
            send(['error' => $stmt->error], 500);
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        if (!$id) send(['error' => 'Missing ?id='], 400);
        $d = json_body();
        $stmt = $db->prepare(
            "UPDATE events SET heading=?, title=?, description=?, image_url=?, event_date=?, location=?
             WHERE id=?"
        );
        $stmt->bind_param('sssssss',
            $d['heading'], $d['title'], $d['description'],
            $d['imageUrl'], $d['eventDate'], $d['location'], $id
        );
        if ($stmt->execute()) {
            send(['ok' => true]);
        } else {
            send(['error' => $stmt->error], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) send(['error' => 'Missing ?id='], 400);
        $stmt = $db->prepare("DELETE FROM events WHERE id=?");
        $stmt->bind_param('s', $id);
        if ($stmt->execute()) {
            send(['ok' => true]);
        } else {
            send(['error' => $stmt->error], 500);
        }
        break;

    default:
        send(['error' => 'Method not allowed'], 405);
}
$db->close();
