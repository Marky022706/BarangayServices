<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/reference_generator.php';
require_once __DIR__ . '/ApplicationsController.php';

/**
 * PATCH /api/staff/applications/:id/approve
 */
function handleApproveApplication(string $id, array $body): void {
    $staffUser = requireAuth(['admin', 'staff']);
    $staffName = (string)($staffUser['fullName'] ?? 'Barangay Staff');
    $staffUserId = isset($staffUser['id']) ? (int)$staffUser['id'] : null;

    $remarks             = isset($body['remarks']) ? trim((string)$body['remarks']) : '';
    $customControlNumber = isset($body['customControlNumber']) ? trim((string)$body['customControlNumber']) : '';

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        if ($app['status'] === 'Approved' || $app['status'] === 'Ready for Claiming') {
            $pdo->rollBack();
            sendJsonResponse([
                'success' => false,
                'message' => "Application is already {$app['status']}.",
            ], 400);
        }

        $controlNumber = !empty($app['control_number'])
            ? (string)$app['control_number']
            : ($customControlNumber !== '' ? $customControlNumber : '');

        if ($controlNumber === '') {
            $docType = (string)$app['document_type'];
            $cat = $docType === 'clearance' ? 'CLR' : ($docType === 'indigency' ? 'IND' : 'RES');
            $controlNumber = generateSequentialCode($pdo, $cat, '{CAT}-{YEAR}');
        }

        $finalRemarks = $remarks !== '' ? $remarks : 'Approved by Barangay Officer. Ready for final printing and signature.';

        $updStmt = $pdo->prepare("
            UPDATE applications
            SET status = 'Approved',
                control_number = ?,
                remarks = ?,
                verified_by = ?,
                processed_by_user_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([$controlNumber, $finalRemarks, $staffName, $staffUserId, (int)$app['id']]);

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, ?, 'Approved', 'APPROVED', ?, ?)
        ");
        $histStmt->execute([(int)$app['id'], (string)$app['status'], $finalRemarks, $staffName]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([(int)$app['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success' => true,
            'message' => 'Application approved successfully.',
            'data'    => mapRowToApplicationRecord($updated ?: $app),
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP APPROVE ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to process approval.'], 500);
    }
}

/**
 * PATCH /api/staff/applications/:id/reject
 */
function handleRejectApplication(string $id, array $body): void {
    $staffUser = requireAuth(['admin', 'staff']);
    $staffName = (string)($staffUser['fullName'] ?? 'Barangay Staff');
    $staffUserId = isset($staffUser['id']) ? (int)$staffUser['id'] : null;

    $reason  = isset($body['reason']) ? trim((string)$body['reason']) : '';
    $remarks = isset($body['remarks']) ? trim((string)$body['remarks']) : '';

    if ($reason === '') {
        sendJsonResponse(['success' => false, 'message' => 'A rejection reason is required.'], 400);
    }

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        $finalRemarks = $remarks !== '' ? $remarks : "Application was reviewed and rejected. Reason: {$reason}";

        $updStmt = $pdo->prepare("
            UPDATE applications
            SET status = 'Rejected',
                rejection_reason = ?,
                remarks = ?,
                processed_by_user_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([$reason, $finalRemarks, $staffUserId, (int)$app['id']]);

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, ?, 'Rejected', 'REJECTED', ?, ?)
        ");
        $histStmt->execute([(int)$app['id'], (string)$app['status'], "Reason: {$reason}", $staffName]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([(int)$app['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success' => true,
            'message' => 'Application rejected.',
            'data'    => mapRowToApplicationRecord($updated ?: $app),
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP REJECT ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to process rejection.'], 500);
    }
}

/**
 * PATCH /api/staff/applications/:id/ready
 */
function handleMarkReadyForClaiming(string $id, array $body): void {
    $staffUser = requireAuth(['admin', 'staff']);
    $staffName = (string)($staffUser['fullName'] ?? 'Barangay Staff');
    $staffUserId = isset($staffUser['id']) ? (int)$staffUser['id'] : null;
    $remarks = isset($body['remarks']) ? trim((string)$body['remarks']) : '';

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        $controlNumber = !empty($app['control_number']) ? (string)$app['control_number'] : '';
        if ($controlNumber === '') {
            $docType = (string)$app['document_type'];
            $cat = $docType === 'clearance' ? 'CLR' : ($docType === 'indigency' ? 'IND' : 'RES');
            $controlNumber = generateSequentialCode($pdo, $cat, '{CAT}-{YEAR}');
        }

        $finalRemarks = $remarks !== '' ? $remarks : 'Document signed and sealed. Ready for resident pick-up at Window 2.';

        $updStmt = $pdo->prepare("
            UPDATE applications
            SET status = 'Ready for Claiming',
                control_number = ?,
                remarks = ?,
                processed_by_user_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([$controlNumber, $finalRemarks, $staffUserId, (int)$app['id']]);

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, ?, 'Ready for Claiming', 'MARKED_READY', ?, ?)
        ");
        $histStmt->execute([(int)$app['id'], (string)$app['status'], $finalRemarks, $staffName]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([(int)$app['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success' => true,
            'message' => 'Application marked as Ready for Claiming.',
            'data'    => mapRowToApplicationRecord($updated ?: $app),
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP READY ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to update application status.'], 500);
    }
}

/**
 * PATCH /api/staff/applications/:id/verify
 */
function handleMoveToVerification(string $id, array $body): void {
    $staffUser = requireAuth(['admin', 'staff']);
    $staffName = (string)($staffUser['fullName'] ?? 'Barangay Staff');
    $staffUserId = isset($staffUser['id']) ? (int)$staffUser['id'] : null;
    $remarks = isset($body['remarks']) ? trim((string)$body['remarks']) : '';

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        $finalRemarks = $remarks !== '' ? $remarks : 'Document in queue for community records and Lupon clearance validation.';

        $updStmt = $pdo->prepare("
            UPDATE applications
            SET status = 'Under Verification',
                remarks = ?,
                processed_by_user_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([$finalRemarks, $staffUserId, (int)$app['id']]);

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, ?, 'Under Verification', 'VERIFICATION_STARTED', ?, ?)
        ");
        $histStmt->execute([(int)$app['id'], (string)$app['status'], $finalRemarks, $staffName]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([(int)$app['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success' => true,
            'message' => 'Application moved to Under Verification.',
            'data'    => mapRowToApplicationRecord($updated ?: $app),
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP VERIFY ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to update application status.'], 500);
    }
}

/**
 * PATCH /api/staff/applications/:id/claim
 */
function handleMarkClaimed(string $id, array $body): void {
    $staffUser = requireAuth(['admin', 'staff']);
    $staffName = (string)($staffUser['fullName'] ?? 'Barangay Staff');
    $staffUserId = isset($staffUser['id']) ? (int)$staffUser['id'] : null;
    $remarks = isset($body['remarks']) ? trim((string)$body['remarks']) : '';

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? LIMIT 1 FOR UPDATE');
        $stmt->execute([$id, $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'message' => 'Application record not found.'], 404);
        }

        $finalRemarks     = $remarks !== '' ? $remarks : 'Official document received and claimed by applicant. Transaction successfully completed.';
        $newPaymentStatus = ($app['payment_status'] ?? 'Pending') === 'Pending' ? 'Paid' : (string)$app['payment_status'];

        $updStmt = $pdo->prepare("
            UPDATE applications
            SET status = 'Successful',
                payment_status = ?,
                remarks = ?,
                processed_by_user_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $updStmt->execute([$newPaymentStatus, $finalRemarks, $staffUserId, (int)$app['id']]);

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, ?, 'Successful', 'DOCUMENT_CLAIMED', ?, ?)
        ");
        $histStmt->execute([(int)$app['id'], (string)$app['status'], $finalRemarks, $staffName]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([(int)$app['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success' => true,
            'message' => 'Application marked as Successful (Claimed).',
            'data'    => mapRowToApplicationRecord($updated ?: $app),
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP CLAIM ERROR] ' . $e->getMessage());
        sendJsonResponse(['success' => false, 'message' => 'Failed to update application status.'], 500);
    }
}

