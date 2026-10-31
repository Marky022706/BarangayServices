<?php
declare(strict_types=1);

function getJwtSecret(): string {
    return getenv('JWT_SECRET') ?: 'brgy_eservices_secret_key_2026_production_grade';
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

/**
 * Generate HS256 JWT token valid for 12 hours
 */
function generateToken(array $user): string {
    $header = base64UrlEncode((string)json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $now = time();
    $payload = base64UrlEncode((string)json_encode([
        'id'       => (int)$user['id'],
        'username' => (string)$user['username'],
        'role'     => (string)$user['role'],
        'fullName' => (string)$user['fullName'],
        'iat'      => $now,
        'exp'      => $now + (12 * 3600),
    ]));

    $signature = hash_hmac('sha256', "{$header}.{$payload}", getJwtSecret(), true);
    $encodedSig = base64UrlEncode($signature);

    return "{$header}.{$payload}.{$encodedSig}";
}

/**
 * Verify and decode HS256 JWT token
 */
function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$headerB64, $payloadB64, $sigB64] = $parts;
    $expectedSig = base64UrlEncode(hash_hmac('sha256', "{$headerB64}.{$payloadB64}", getJwtSecret(), true));

    if (!hash_equals($expectedSig, $sigB64)) {
        return null;
    }

    $payloadJson = base64UrlDecode($payloadB64);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }

    if (isset($payload['exp']) && time() >= (int)$payload['exp']) {
        return null;
    }

    return $payload;
}

/**
 * Extract bearer token from Authorization header or brgy_token cookie
 */
function extractRequestToken(): ?string {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $k => $v) {
            if (strtolower((string)$k) === 'authorization') {
                $authHeader = $v;
                break;
            }
        }
    }

    if (is_string($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
        return trim(substr($authHeader, 7));
    }

    if (!empty($_COOKIE['brgy_token']) && is_string($_COOKIE['brgy_token'])) {
        return $_COOKIE['brgy_token'];
    }

    return null;
}

function getOptionalAuthUser(): ?array {
    $token = extractRequestToken();
    if (!$token) {
        return null;
    }
    return verifyToken($token);
}

/**
 * Enforce authentication and optional role-based access control
 */
function requireAuth(array $allowedRoles = []): array {
    $token = extractRequestToken();
    if (!$token) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Authentication required. Please log in to access this resource.',
        ], 401);
    }

    $decoded = verifyToken($token);
    if (!$decoded) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Session expired or invalid token. Please log in again.',
        ], 401);
    }

    if (!empty($allowedRoles) && !in_array($decoded['role'] ?? '', $allowedRoles, true)) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Access denied: insufficient privileges for this operation.',
        ], 403);
    }

    return $decoded;
}

