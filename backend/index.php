<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Manila');

// ── Shared Response Helper ───────────────────────────────────────────────────
function sendJsonResponse(array $payload, int $statusCode = 200): never {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ── Configure CORS Headers ───────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://localhost',
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Load Core Configuration & Modular Dependencies ───────────────────────────
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/app/Config/Database.php';
require_once __DIR__ . '/app/Utils/ResponseUtil.php';
require_once __DIR__ . '/app/Utils/JwtUtil.php';
require_once __DIR__ . '/app/Utils/ReferenceGenerator.php';
require_once __DIR__ . '/app/Http/Middleware/AuthMiddleware.php';

// ── Load Domain Modules ──────────────────────────────────────────────────────
require_once __DIR__ . '/app/Modules/Authentication/Controllers/AuthController.php';
require_once __DIR__ . '/app/Modules/DocumentServices/Controllers/ServicesController.php';
require_once __DIR__ . '/app/Modules/Applications/Controllers/ApplicationsController.php';
require_once __DIR__ . '/app/Modules/DocumentProcessing/Controllers/StaffProcessingController.php';
require_once __DIR__ . '/app/Modules/Dashboard/Controllers/DashboardController.php';

// ── Parse JSON Request Body ──────────────────────────────────────────────────
$rawBody = file_get_contents('php://input');
$body = [];
if (is_string($rawBody) && trim($rawBody) !== '') {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}

// ── Normalize Request Path ───────────────────────────────────────────────────
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// Strip optional Laragon subdirectory prefix (e.g. /BarangayServices)
$path = (string)preg_replace('#^/BarangayServices#i', '', $path);
$path = rtrim($path, '/') ?: '/';

// ── Route Request via Modular Route Dispatcher ────────────────────────────────
require __DIR__ . '/routes/api.php';
