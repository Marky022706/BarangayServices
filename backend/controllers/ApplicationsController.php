<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/reference_generator.php';

function formatDisplayDate(?string $dateStr): string {
    if (!$dateStr) {
        return date('m/d/Y, h:i A');
    }
    $ts = strtotime($dateStr);
    if ($ts === false) {
        return $dateStr;
    }
    return date('m/d/Y, h:i A', $ts);
}

function mapRowToApplicationRecord(array $r): array {
    $record = [
        'id'              => (string)$r['app_code'],
        'internalId'      => (int)$r['id'],
        'referenceNumber' => (string)$r['reference_number'],
        'documentType'    => (string)$r['document_type'],
        'status'          => (string)$r['status'],
        'submissionDate'  => formatDisplayDate($r['created_at'] ?? null),
        'lastUpdatedDate' => formatDisplayDate($r['updated_at'] ?? null),
        'personalInfo'    => [
            'firstName'        => (string)$r['first_name'],
            'lastName'         => (string)$r['last_name'],
            'dateOfBirth'      => (string)$r['date_of_birth'],
            'placeOfBirth'     => (string)$r['place_of_birth'],
            'civilStatus'      => (string)$r['civil_status'],
            'contactNumber'    => (string)$r['contact_number'],
            'purokSitio'       => (string)$r['purok_sitio'],
            'barangay'         => (string)$r['barangay'],
            'cityMunicipality' => (string)$r['city_municipality'],
            'province'         => (string)$r['province'],
        ],
        'details'         => [
            'purpose' => (string)$r['purpose'],
        ],
        'payment'         => [
            'method' => (string)$r['payment_method'],
            'status' => (string)$r['payment_status'],
        ],
    ];

    if (!empty($r['control_number'])) {
        $record['controlNumber'] = (string)$r['control_number'];
    }
    if (!empty($r['remarks'])) {
        $record['remarks'] = (string)$r['remarks'];
    }
    if (!empty($r['rejection_reason'])) {
        $record['rejectionReason'] = (string)$r['rejection_reason'];
    }
    if (!empty($r['verified_by'])) {
        $record['verifiedBy'] = (string)$r['verified_by'];
    }

    // Optional personalInfo fields
    if (!empty($r['middle_name'])) {
        $record['personalInfo']['middleName'] = (string)$r['middle_name'];
    }
    if (!empty($r['suffix'])) {
        $record['personalInfo']['suffix'] = (string)$r['suffix'];
    }
    if (!empty($r['email'])) {
        $record['personalInfo']['email'] = (string)$r['email'];
    }
    if (!empty($r['house_street'])) {
        $record['personalInfo']['houseStreet'] = (string)$r['house_street'];
    }

    // Optional details fields
    if (!empty($r['other_purpose'])) {
        $record['details']['otherPurpose'] = (string)$r['other_purpose'];
    }
    if (!empty($r['assistance_type'])) {
        $record['details']['assistanceType'] = (string)$r['assistance_type'];
    }
    if (!empty($r['additional_info'])) {
        $record['details']['additionalInfo'] = (string)$r['additional_info'];
    }
    if (!empty($r['length_of_residency'])) {
        $record['details']['lengthOfResidency'] = (string)$r['length_of_residency'];
    }

    // Optional payment fields
    if (!empty($r['gcash_number'])) {
        $record['payment']['gcashNumber'] = (string)$r['gcash_number'];
    }
    if (!empty($r['gcash_name'])) {
        $record['payment']['gcashName'] = (string)$r['gcash_name'];
    }
    if (!empty($r['gcash_reference_number'])) {
        $record['payment']['gcashReferenceNumber'] = (string)$r['gcash_reference_number'];
    }
    if (!empty($r['amount_paid'])) {
        $record['payment']['amountPaid'] = (string)$r['amount_paid'];
    }

    return $record;
}

/**
 * POST /api/applications
 */
function handleCreateApplication(array $body): void {
    $documentType = isset($body['documentType']) ? trim((string)$body['documentType']) : '';
    $personalInfo = is_array($body['personalInfo'] ?? null) ? $body['personalInfo'] : [];
    $details      = is_array($body['details'] ?? null) ? $body['details'] : [];
    $payment      = is_array($body['payment'] ?? null) ? $body['payment'] : [];

    if (!in_array($documentType, ['clearance', 'indigency', 'residency'], true)) {
        sendJsonResponse([
            'success' => false,
            'message' => 'A valid document service type is required.',
        ], 400);
    }

    $firstName     = trim((string)($personalInfo['firstName'] ?? ''));
    $lastName      = trim((string)($personalInfo['lastName'] ?? ''));
    $contactNumber = trim((string)($personalInfo['contactNumber'] ?? ''));
    $purokSitio    = trim((string)($personalInfo['purokSitio'] ?? ''));

    if ($firstName === '' || $lastName === '' || $contactNumber === '' || $purokSitio === '') {
        sendJsonResponse([
            'success' => false,
            'message' => 'Please complete all required fields: first name, last name, mobile contact number, and Purok/Sitio.',
        ], 400);
    }

    $normalizedPhone = preg_replace('/[\s\-]/', '', $contactNumber);
    if (!preg_match('/^(09|\+639)\d{9}$/', (string)$normalizedPhone)) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Please enter a valid 11-digit Philippine mobile number starting with 09 (e.g., 09171234567).',
        ], 400);
    }

    $rawDob = trim((string)($personalInfo['dateOfBirth'] ?? ''));
    if ($rawDob !== '') {
        $dobTs = strtotime($rawDob);
        if ($dobTs === false || $dobTs > time()) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Please enter a valid Date of Birth that is not in the future.',
            ], 400);
        }
    }

    $rawEmail = trim((string)($personalInfo['email'] ?? ''));
    if ($rawEmail !== '' && !filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Please enter a valid email address or leave the email field blank.',
        ], 400);
    }

    $purpose = trim((string)($details['purpose'] ?? ''));
    if ($purpose === '') {
        sendJsonResponse([
            'success' => false,
            'message' => 'Please select or specify the purpose of your document request.',
        ], 400);
    }

    if ($purpose === 'Other') {
        $otherPurposeCheck = trim((string)($details['otherPurpose'] ?? ''));
        if (mb_strlen($otherPurposeCheck) < 5) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Please specify a valid other purpose (at least 5 characters).',
            ], 400);
        }
    }

    $paymentMethodCheck = !empty($payment['method']) ? (string)$payment['method'] : 'pay_on_pickup';
    if ($paymentMethodCheck === 'gcash') {
        $gcashNumberCheck = preg_replace('/[\s\-]/', '', trim((string)($payment['gcashNumber'] ?? '')));
        $gcashNameCheck   = trim((string)($payment['gcashName'] ?? ''));
        if (!preg_match('/^(09|\+639)\d{9}$/', (string)$gcashNumberCheck)) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Please enter a valid 11-digit GCash mobile number starting with 09.',
            ], 400);
        }
        if (mb_strlen($gcashNameCheck) < 3) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Please enter the full account name registered with your GCash account.',
            ], 400);
        }
    }

    $pdo = getDbConnection();
    $authUser = getOptionalAuthUser();

    try {
        $pdo->beginTransaction();

        $cat = $documentType === 'clearance' ? 'CLR' : ($documentType === 'indigency' ? 'IND' : 'RES');

        $referenceNumber = generateSequentialCode($pdo, $cat, 'BRGY-{YEAR}-{CAT}');
        $appCode         = generateSequentialCode($pdo, 'APP', 'APP-{YEAR}');

        $middleName        = !empty($personalInfo['middleName']) ? trim((string)$personalInfo['middleName']) : null;
        $suffix            = !empty($personalInfo['suffix']) ? trim((string)$personalInfo['suffix']) : null;
        $dateOfBirth       = trim((string)($personalInfo['dateOfBirth'] ?? ''));
        $placeOfBirth      = trim((string)($personalInfo['placeOfBirth'] ?? ''));
        $civilStatus       = trim((string)($personalInfo['civilStatus'] ?? 'Single'));
        $email             = !empty($personalInfo['email']) ? trim((string)$personalInfo['email']) : null;
        $houseStreet       = !empty($personalInfo['houseStreet']) ? trim((string)$personalInfo['houseStreet']) : null;
        $barangay          = !empty($personalInfo['barangay']) ? trim((string)$personalInfo['barangay']) : 'Barangay San Isidro';
        $cityMunicipality  = !empty($personalInfo['cityMunicipality']) ? trim((string)$personalInfo['cityMunicipality']) : 'Quezon City';
        $province          = !empty($personalInfo['province']) ? trim((string)$personalInfo['province']) : 'Metro Manila';

        $otherPurpose      = !empty($details['otherPurpose']) ? trim((string)$details['otherPurpose']) : null;
        $assistanceType    = !empty($details['assistanceType']) ? trim((string)$details['assistanceType']) : null;
        $additionalInfo    = !empty($details['additionalInfo']) ? trim((string)$details['additionalInfo']) : null;
        $lengthOfResidency = !empty($details['lengthOfResidency']) ? mb_substr(trim((string)$details['lengthOfResidency']), 0, 100) : null;

        $paymentMethod     = !empty($payment['method']) ? (string)$payment['method'] : 'pay_on_pickup';
        $paymentStatus     = !empty($payment['status']) ? (string)$payment['status'] : 'Pending';
        $gcashNumber       = !empty($payment['gcashNumber']) ? trim((string)$payment['gcashNumber']) : null;
        $gcashName         = !empty($payment['gcashName']) ? trim((string)$payment['gcashName']) : null;
        $gcashRef          = !empty($payment['gcashReferenceNumber']) ? mb_substr(trim((string)$payment['gcashReferenceNumber']), 0, 100) : null;
        $amountPaid        = !empty($payment['amountPaid']) ? mb_substr(trim((string)$payment['amountPaid']), 0, 150) : null;

        $insertStmt = $pdo->prepare("
            INSERT INTO applications (
                app_code, reference_number, document_type, status, user_id,
                first_name, middle_name, last_name, suffix, date_of_birth, place_of_birth,
                civil_status, contact_number, email, house_street, purok_sitio, barangay,
                city_municipality, province, purpose, other_purpose, assistance_type,
                additional_info, length_of_residency, payment_method, payment_status,
                gcash_number, gcash_name, gcash_reference_number, amount_paid, remarks
            ) VALUES (
                ?, ?, ?, 'Pending Review', ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        ");

        $insertStmt->execute([
            $appCode,
            $referenceNumber,
            $documentType,
            $authUser['id'] ?? null,
            $firstName,
            $middleName,
            $lastName,
            $suffix,
            $dateOfBirth,
            $placeOfBirth,
            $civilStatus,
            $contactNumber,
            $email,
            $houseStreet,
            $purokSitio,
            $barangay,
            $cityMunicipality,
            $province,
            $purpose,
            $otherPurpose,
            $assistanceType,
            $additionalInfo,
            $lengthOfResidency,
            $paymentMethod,
            $paymentStatus,
            $gcashNumber,
            $gcashName,
            $gcashRef,
            $amountPaid,
            'Application received and placed in queue for initial document review.',
        ]);

        $insertedId = (int)$pdo->lastInsertId();

        $histStmt = $pdo->prepare("
            INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
            VALUES (?, NULL, 'Pending Review', 'SUBMITTED', 'Application submitted online for administrative review.', ?)
        ");
        $histStmt->execute([$insertedId, "{$firstName} {$lastName}"]);

        $pdo->commit();

        $fetchStmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? LIMIT 1');
        $fetchStmt->execute([$insertedId]);
        $createdRow = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success'         => true,
            'message'         => 'Application submitted successfully.',
            'referenceNumber' => $referenceNumber,
            'data'            => mapRowToApplicationRecord($createdRow ?: []),
        ], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[PHP CREATE APPLICATION ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to submit application. Please check your inputs and try again.',
        ], 500);
    }
}

/**
 * GET /api/applications & GET /api/staff/applications
 */
function handleGetApplications(): void {
    $search       = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $status       = isset($_GET['status']) ? trim((string)$_GET['status']) : '';
    $documentType = isset($_GET['documentType']) ? trim((string)$_GET['documentType']) : '';
    $pageNum      = max(1, (int)($_GET['page'] ?? 1));
    $limitNum     = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $offset       = ($pageNum - 1) * $limitNum;

    try {
        $pdo = getDbConnection();
        $conditions = [];
        $params     = [];

        if ($search !== '') {
            $q = "%{$search}%";
            $conditions[] = '(reference_number LIKE ? OR control_number LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ?)';
            array_push($params, $q, $q, $q, $q, $q);
        }

        if ($status !== '' && $status !== 'all') {
            $conditions[] = 'status = ?';
            $params[]     = $status;
        }

        if ($documentType !== '' && $documentType !== 'all') {
            $conditions[] = 'document_type = ?';
            $params[]     = $documentType;
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM applications {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = sprintf(
            'SELECT * FROM applications %s ORDER BY created_at DESC LIMIT %d OFFSET %d',
            $whereClause,
            $limitNum,
            $offset
        );
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = array_map('mapRowToApplicationRecord', $rows);

        sendJsonResponse([
            'success'    => true,
            'data'       => $data,
            'pagination' => [
                'page'       => $pageNum,
                'limit'      => $limitNum,
                'total'      => $total,
                'totalPages' => (int)ceil($total / $limitNum),
            ],
        ]);
    } catch (Throwable $e) {
        error_log('[PHP GET APPLICATIONS ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to retrieve applications from database.',
        ], 500);
    }
}

/**
 * GET /api/applications/:id
 */
function handleGetApplicationById(string $id): void {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ? OR app_code = ? OR reference_number = ? LIMIT 1');
        $stmt->execute([$id, $id, $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Application record not found.',
            ], 404);
        }

        $histStmt = $pdo->prepare('SELECT previous_status, new_status, action_type, remarks, changed_by_name, created_at FROM application_history WHERE application_id = ? ORDER BY created_at ASC');
        $histStmt->execute([(int)$row['id']]);
        $historyRows = $histStmt->fetchAll(PDO::FETCH_ASSOC);

        $record = mapRowToApplicationRecord($row);
        $record['history'] = array_map(static function (array $h): array {
            return [
                'previousStatus' => $h['previous_status'],
                'newStatus'      => (string)$h['new_status'],
                'actionType'     => (string)$h['action_type'],
                'remarks'        => $h['remarks'],
                'changedBy'      => (string)$h['changed_by_name'],
                'timestamp'      => formatDisplayDate($h['created_at'] ?? null),
            ];
        }, $historyRows);

        sendJsonResponse([
            'success' => true,
            'data'    => $record,
        ]);
    } catch (Throwable $e) {
        error_log('[PHP GET APP BY ID ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to retrieve application details.',
        ], 500);
    }
}

/**
 * GET /api/applications/track/:referenceNumber
 */
function handleTrackApplication(string $referenceNumber): void {
    $cleanRef = trim(urldecode($referenceNumber));
    if ($cleanRef === '') {
        sendJsonResponse([
            'success' => false,
            'message' => 'Reference number is required for tracking.',
        ], 400);
    }

    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM applications WHERE UPPER(TRIM(reference_number)) = UPPER(TRIM(?)) LIMIT 1');
        $stmt->execute([$cleanRef]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            sendJsonResponse([
                'success' => false,
                'message' => 'No application was found matching reference number ' . strtoupper($cleanRef) . '. Please verify the number from your confirmation receipt.',
            ], 404);
        }

        sendJsonResponse([
            'success' => true,
            'data'    => mapRowToApplicationRecord($row),
        ]);
    } catch (Throwable $e) {
        error_log('[PHP TRACK APP ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to query tracking information.',
        ], 500);
    }
}

