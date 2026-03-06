<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = get_db();

switch ($method) {

    case 'GET':
        $result = $db->query("SELECT * FROM links ORDER BY created_at ASC");
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id'          => $row['id'],
                'label'       => $row['label'],
                'url'         => $row['url'],
                'description' => $row['description'] ?? '',
                'createdAt'   => $row['created_at'],
            ];
        }
        send($rows);
        break;

    case 'POST':
        $d = json_body();
        if (empty($d['id']) || empty($d['label']) || empty($d['url'])) {
            send(['error' => 'Missing required fields (id, label, url)'], 400);
        }
        $stmt = $db->prepare(
            "INSERT INTO links (id, label, url, description, created_at) VALUES (?, ?, ?, ?, ?)"
        );
        $createdAt = $d['createdAt'] ?? date('Y-m-d H:i:s');
        $desc = $d['description'] ?? '';
        $stmt->bind_param('sssss', $d['id'], $d['label'], $d['url'], $desc, $createdAt);
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
        $stmt = $db->prepare("UPDATE links SET label=?, url=?, description=? WHERE id=?");
        $desc = $d['description'] ?? '';
        $stmt->bind_param('ssss', $d['label'], $d['url'], $desc, $id);
        if ($stmt->execute()) {
            send(['ok' => true]);
        } else {
            send(['error' => $stmt->error], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) send(['error' => 'Missing ?id='], 400);
        $stmt = $db->prepare("DELETE FROM links WHERE id=?");
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
