<?php
declare(strict_types=1);

/**
 * Load environment variables from project root .env file
 */
function loadEnvFile(string $envPath): void {
    if (!file_exists($envPath)) {
        return;
    }
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }
        $parts = explode('=', $trimmed, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1], " \t\n\r\0\x0B\"'");
            if (getenv($key) === false) {
                putenv("{$key}={$value}");
                $_ENV[$key] = $value;
            }
        }
    }
}

loadEnvFile(dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env');

function getDbConfig(): array {
    return [
        'host'     => getenv('DB_HOST') ?: '127.0.0.1',
        'port'     => (int)(getenv('DB_PORT') ?: 3306),
        'user'     => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '',
        'database' => getenv('DB_NAME') ?: 'barangay_eservices_db',
    ];
}

/**
 * Get singleton PDO connection to MySQL database
 */
function getDbConnection(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $cfg = getDbConfig();
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $cfg['host'],
        $cfg['port'],
        $cfg['database']
    );

    try {
        $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // If database does not exist yet, initialize it automatically
        initializeDatabase();
        $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    return $pdo;
}

/**
 * Ensure database, tables, column migrations, and default seed data exist
 */
function initializeDatabase(): void {
    $cfg = getDbConfig();
    $rootDsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $cfg['host'], $cfg['port']);

    $rootPdo = new PDO($rootDsn, $cfg['user'], $cfg['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $dbName = $cfg['database'];
    $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $rootPdo = null;

    $dbDsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $cfg['host'], $cfg['port'], $dbName);
    $dbPdo = new PDO($dbDsn, $cfg['user'], $cfg['password'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $schemaPath = dirname(__DIR__, 2) . '/server/database/schema.sql';
    if (file_exists($schemaPath)) {
        $schemaSql = file_get_contents($schemaPath);
        if ($schemaSql !== false) {
            $dbPdo->exec($schemaSql);
        }
    }

    // Ensure column widths and status enum are up to date
    $dbPdo->exec("
        ALTER TABLE applications
          MODIFY COLUMN status ENUM('Pending Review', 'Under Verification', 'Approved', 'Rejected', 'Ready for Claiming', 'Successful') NOT NULL DEFAULT 'Pending Review',
          MODIFY COLUMN length_of_residency VARCHAR(100) NULL,
          MODIFY COLUMN gcash_reference_number VARCHAR(100) NULL,
          MODIFY COLUMN amount_paid VARCHAR(150) NULL;
    ");

    // Seed services if empty
    $svcCount = (int)$dbPdo->query('SELECT COUNT(*) FROM services')->fetchColumn();
    if ($svcCount === 0) {
        $services = [
            [
                'id'               => 'clearance',
                'title'            => 'Barangay Clearance',
                'shortDescription' => 'Request a barangay clearance for employment, school, or other legitimate purposes.',
                'fullDescription'  => 'An official certification issued by the Barangay verifying that the resident has no derogatory criminal record or pending dispute within the jurisdiction and is in good standing.',
                'iconName'         => 'FileCheck',
                'standardFee'      => '₱100.00 (Standard) / Free for First-Time Jobseekers (RA 11261)',
                'processingTime'   => '1 - 2 Working Days',
                'requirements'     => [
                    '1 Valid Government-issued Photo ID or School ID',
                    'Recent 1x1 or 2x2 ID Photo (taken within 6 months)',
                    'Proof of residency (Purok Certification or Utility Bill)',
                    'Barangay verification fee receipt or First-time Jobseeker Oath',
                ],
            ],
            [
                'id'               => 'indigency',
                'title'            => 'Certificate of Indigency',
                'shortDescription' => 'Apply for a certificate of indigency for eligible assistance and other accepted purposes.',
                'fullDescription'  => 'Issued to bona fide indigent residents or families belonging to low-income brackets seeking medical, financial, funeral, or educational assistance from government or private institutions.',
                'iconName'         => 'HandHeart',
                'standardFee'      => 'FREE (No Fee / Waived)',
                'processingTime'   => '1 Working Day',
                'requirements'     => [
                    '1 Valid Government-issued Photo ID or Voter’s Certificate',
                    'Certificate from Purok / Sitio Leader attesting indigent status',
                    'Social Case Study Report or Hospital Bill / Prescription (for medical aid)',
                    'Assessment by Barangay Social Welfare Desk',
                ],
            ],
            [
                'id'               => 'residency',
                'title'            => 'Certificate of Residency',
                'shortDescription' => 'Request proof of residence within the barangay.',
                'fullDescription'  => 'An official document verifying that an individual has been residing at a specified physical address in the barangay for a stated period of time, commonly used for banking, schools, and utility connections.',
                'iconName'         => 'House',
                'standardFee'      => '₱50.00 (Free for Senior Citizens & PWDs)',
                'processingTime'   => 'Same Day / 1 Working Day',
                'requirements'     => [
                    '1 Valid Government ID with residential address',
                    'Proof of billing (Meralco, Manila Water, or Internet bill) or Lease Contract',
                    'Minimum of six (6) months continuous residency in the Barangay',
                    'Endorsement from Purok / Sitio President',
                ],
            ],
        ];

        $stmt = $dbPdo->prepare("
            INSERT INTO services (id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json, is_available)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");

        foreach ($services as $s) {
            $stmt->execute([
                $s['id'],
                $s['title'],
                $s['shortDescription'],
                $s['fullDescription'],
                $s['iconName'],
                $s['standardFee'],
                $s['processingTime'],
                json_encode($s['requirements'], JSON_UNESCAPED_UNICODE),
            ]);
        }
    }

    // Seed default staff accounts if empty
    $userCount = (int)$dbPdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($userCount === 0) {
        $passwordHash = password_hash('barangay2026', PASSWORD_BCRYPT, ['cost' => 10]);
        $stmt = $dbPdo->prepare("
            INSERT INTO users (username, password_hash, full_name, role, email, contact_number, is_active)
            VALUES
            (?, ?, ?, 'admin', 'admin@barangay.gov.ph', '09170001122', 1),
            (?, ?, ?, 'staff', 'records@barangay.gov.ph', '09170003344', 1)
        ");
        $stmt->execute([
            'admin',  $passwordHash, 'Administrator — Hon. Honorio A. Reyes',
            'staff1', $passwordHash, 'Records Officer — Maria Clara De Jesus',
        ]);
    }

    // Initialize reference counters if empty
    $currentYear = (int)date('Y');
    $categories = ['CLR', 'IND', 'RES', 'APP', 'CTRL'];
    $counterStmt = $dbPdo->prepare("INSERT IGNORE INTO reference_counter (category, year, last_number) VALUES (?, ?, 0)");
    foreach ($categories as $cat) {
        $counterStmt->execute([$cat, $currentYear]);
    }
}

