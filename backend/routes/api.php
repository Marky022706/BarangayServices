<?php
declare(strict_types=1);

use App\Http\Middleware\AuthMiddleware;
use App\Modules\Authentication\Controllers\AuthController;
use App\Modules\DocumentServices\Controllers\ServicesController;
use App\Modules\Applications\Controllers\ApplicationsController;
use App\Modules\DocumentProcessing\Controllers\StaffProcessingController;
use App\Modules\Dashboard\Controllers\DashboardController;

// ── Health Check ─────────────────────────────────────────────────────────────
if ($method === 'GET' && $path === '/api/health') {
    sendJsonResponse([
        'status'    => 'healthy',
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        'service'   => 'Barangay e-Services Modular PHP Backend API',
        'runtime'   => 'PHP ' . PHP_VERSION,
        'database'  => 'MySQL 8.4 connected (PDO)',
    ]);
}

// ── 1. Authentication Module ─────────────────────────────────────────────────
if ($method === 'POST' && $path === '/api/auth/login') {
    AuthController::login($body);
}

if ($method === 'POST' && $path === '/api/auth/logout') {
    AuthController::logout();
}

if ($method === 'GET' && $path === '/api/auth/me') {
    AuthController::me();
}

// ── 2. Document Services Module ──────────────────────────────────────────────
if ($method === 'GET' && $path === '/api/services') {
    ServicesController::index();
}

if ($method === 'GET' && preg_match('#^/api/services/([^/]+)$#', $path, $m)) {
    ServicesController::show($m[1]);
}

// ── 3. Applications Module (Resident Portal) ─────────────────────────────────
if ($method === 'POST' && $path === '/api/applications') {
    ApplicationsController::store($body);
}

if ($method === 'GET' && $path === '/api/applications') {
    ApplicationsController::index();
}

if ($method === 'GET' && preg_match('#^/api/applications/track/(.+)$#', $path, $m)) {
    ApplicationsController::track($m[1]);
}

if ($method === 'GET' && preg_match('#^/api/applications/([^/]+)/history$#', $path, $m)) {
    ApplicationsController::history($m[1]);
}

if ($method === 'GET' && preg_match('#^/api/applications/([^/]+)$#', $path, $m)) {
    ApplicationsController::show($m[1]);
}

// ── 4. Document Processing Module (Staff / RBAC Protected) ───────────────────
if ($method === 'GET' && $path === '/api/staff/applications') {
    AuthMiddleware::handle(['admin', 'staff']);
    StaffProcessingController::index();
}

if ($method === 'PATCH' && preg_match('#^/api/staff/applications/([^/]+)/approve$#', $path, $m)) {
    StaffProcessingController::approve($m[1], $body);
}

if ($method === 'PATCH' && preg_match('#^/api/staff/applications/([^/]+)/reject$#', $path, $m)) {
    StaffProcessingController::reject($m[1], $body);
}

if ($method === 'PATCH' && preg_match('#^/api/staff/applications/([^/]+)/verify$#', $path, $m)) {
    StaffProcessingController::verify($m[1], $body);
}

if ($method === 'PATCH' && preg_match('#^/api/staff/applications/([^/]+)/ready$#', $path, $m)) {
    StaffProcessingController::ready($m[1], $body);
}

if ($method === 'PATCH' && preg_match('#^/api/staff/applications/([^/]+)/claim$#', $path, $m)) {
    StaffProcessingController::claim($m[1], $body);
}

// ── 5. Dashboard Module ──────────────────────────────────────────────────────
if ($method === 'GET' && $path === '/api/dashboard/statistics') {
    DashboardController::statistics();
}

// ── 404 Fallback for Unmatched API Routes ────────────────────────────────────
sendJsonResponse([
    'success' => false,
    'message' => "API endpoint '{$method} {$path}' was not found in modular routing table.",
], 404);

