<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/ApplicationsController.php';

/**
 * GET /api/dashboard/statistics
 */
function handleGetDashboardStatistics(): void {
    try {
        $pdo = getDbConnection();

        $statusRows = $pdo->query('SELECT status, COUNT(*) as count FROM applications GROUP BY status')->fetchAll(PDO::FETCH_ASSOC);

        $total        = 0;
        $pending      = 0;
        $verification = 0;
        $approved     = 0;
        $ready        = 0;
        $rejected     = 0;
        $successful   = 0;

        foreach ($statusRows as $r) {
            $c = (int)$r['count'];
            $total += $c;
            switch ($r['status']) {
                case 'Pending Review':
                    $pending = $c;
                    break;
                case 'Under Verification':
                    $verification = $c;
                    break;
                case 'Approved':
                    $approved = $c;
                    break;
                case 'Ready for Claiming':
                    $ready = $c;
                    break;
                case 'Rejected':
                    $rejected = $c;
                    break;
                case 'Successful':
                    $successful = $c;
                    break;
            }
        }

        $serviceRows = $pdo->query('SELECT document_type, COUNT(*) as count FROM applications GROUP BY document_type')->fetchAll(PDO::FETCH_ASSOC);
        $serviceCounts = [
            'clearance' => 0,
            'indigency' => 0,
            'residency' => 0,
        ];
        foreach ($serviceRows as $s) {
            $docType = (string)$s['document_type'];
            $serviceCounts[$docType] = (int)$s['count'];
        }

        $submittedToday = (int)$pdo->query('SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURRENT_DATE()')->fetchColumn();

        // Compute daily application volume over the last 30 days for Application Trends chart
        $trendStmt = $pdo->query("
            SELECT DATE(created_at) as day_date, COUNT(*) as count
            FROM applications
            WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY)
            GROUP BY DATE(created_at)
            ORDER BY day_date ASC
        ");
        $trendRows = $trendStmt ? $trendStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $countsByDate = [];
        foreach ($trendRows as $tr) {
            $countsByDate[(string)$tr['day_date']] = (int)$tr['count'];
        }

        $dailyTrends30d = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateKey = date('Y-m-d', strtotime("-{$i} days"));
            $label   = date('M j', strtotime("-{$i} days"));
            $dailyTrends30d[] = [
                'date'  => $dateKey,
                'label' => $label,
                'count' => $countsByDate[$dateKey] ?? 0,
            ];
        }

        sendJsonResponse([
            'success' => true,
            'data'    => [
                'totalApplications' => $total,
                'pendingReview'     => $pending,
                'underVerification' => $verification,
                'approved'          => $approved,
                'readyForClaiming'  => $ready,
                'rejected'          => $rejected,
                'successful'        => $successful,
                'submittedToday'    => $submittedToday,
                'byService'         => $serviceCounts,
                'dailyTrends'       => $dailyTrends30d,
            ],
        ]);
    } catch (Throwable $e) {
        error_log('[PHP DASHBOARD STATS ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to compute dashboard statistics.'], 500);
    }
}

/**
 * GET /api/applications/:id/history
 */
function handleGetApplicationHistory(string $id): void {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, reference_number FROM applications WHERE id = ? OR app_code = ? OR reference_number = ? LIMIT 1');
        $stmt->execute([$id, $id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        $histStmt = $pdo->prepare('
            SELECT id, previous_status, new_status, action_type, remarks, changed_by_name, created_at
            FROM application_history
            WHERE application_id = ?
            ORDER BY created_at ASC
        ');
        $histStmt->execute([(int)$app['id']]);
        $historyRows = $histStmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedHistory = array_map(static function (array $h): array {
            return [
                'id'             => (int)$h['id'],
                'previousStatus' => $h['previous_status'],
                'newStatus'      => (string)$h['new_status'],
                'actionType'     => (string)$h['action_type'],
                'remarks'        => $h['remarks'],
                'changedBy'      => (string)$h['changed_by_name'],
                'timestamp'      => formatDisplayDate($h['created_at'] ?? null),
            ];
        }, $historyRows);

        sendJsonResponse([
            'success'         => true,
            'referenceNumber' => (string)$app['reference_number'],
            'history'         => $formattedHistory,
        ]);
    } catch (Throwable $e) {
        error_log('[PHP APP HISTORY ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to retrieve application history.'], 500);
    }
}

