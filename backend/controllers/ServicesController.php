<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function formatServiceRow(array $r): array {
    $reqs = $r['requirements_json'] ?? '[]';
    if (is_string($reqs)) {
        $decoded = json_decode($reqs, true);
        $reqs = is_array($decoded) ? $decoded : [];
    }

    return [
        'id'               => (string)$r['id'],
        'title'            => (string)$r['title'],
        'shortDescription' => (string)$r['short_description'],
        'fullDescription'  => (string)$r['full_description'],
        'iconName'         => (string)$r['icon_name'],
        'standardFee'      => (string)$r['standard_fee'],
        'processingTime'   => (string)$r['processing_time'],
        'requirements'     => $reqs,
    ];
}

function handleGetServices(): void {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json FROM services WHERE is_available = 1');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map('formatServiceRow', $rows);

        sendJsonResponse([
            'success' => true,
            'data'    => $formatted,
        ]);
    } catch (Throwable $e) {
        error_log('[PHP SERVICES ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to retrieve available services from database.',
        ], 500);
    }
}

function handleGetServiceById(string $id): void {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json FROM services WHERE id = ? AND is_available = 1 LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Requested barangay service was not found.',
            ], 404);
        }

        sendJsonResponse([
            'success' => true,
            'data'    => formatServiceRow($row),
        ]);
    } catch (Throwable $e) {
        error_log('[PHP SERVICE BY ID ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to retrieve service details.',
        ], 500);
    }
}

