<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/jwt.php';

function handleAuthLogin(array $body): void {
    $identifier = isset($body['username']) ? trim((string)$body['username']) : (isset($body['email']) ? trim((string)$body['email']) : '');
    $password   = isset($body['password']) ? (string)$body['password'] : '';

    if ($identifier === '' || $password === '') {
        sendJsonResponse([
            'success' => false,
            'message' => 'Please enter both your email/username and password.',
        ], 400);
    }

    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1');
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fallback: if user entered an email address like admin@..., also check the local prefix against username
        if (!$user && str_contains($identifier, '@')) {
            $localPart = explode('@', $identifier, 2)[0];
            if ($localPart !== '') {
                $stmt->execute([$localPart, $localPart]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
            }
        }

        if (!$user) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Invalid email or password. Please try again.',
            ], 401);
        }

        if (!(int)$user['is_active']) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Your account is currently deactivated. Please contact the barangay administrator.',
            ], 403);
        }

        $hash = (string)$user['password_hash'];
        // Normalize $2a$ / $2b$ hashes from Node bcryptjs if needed for PHP password_verify
        if (str_starts_with($hash, '$2a$') || str_starts_with($hash, '$2b$')) {
            $normalizedHash = '$2y$' . substr($hash, 4);
        } else {
            $normalizedHash = $hash;
        }

        if (!password_verify($password, $normalizedHash) && !password_verify($password, $hash)) {
            sendJsonResponse([
                'success' => false,
                'message' => 'Invalid email or password. Please try again.',
            ], 401);
        }

        $authUser = [
            'id'       => (int)$user['id'],
            'username' => (string)$user['username'],
            'role'     => (string)$user['role'],
            'fullName' => (string)$user['full_name'],
        ];

        $token = generateToken($authUser);

        setcookie('brgy_token', $token, [
            'expires'  => time() + (12 * 3600),
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $authUser,
            'data'    => [
                'token' => $token,
                'user'  => $authUser,
            ],
        ]);
    } catch (Throwable $e) {
        error_log('[PHP AUTH LOGIN ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'An internal error occurred during authentication.',
        ], 500);
    }
}

function handleAuthLogout(): void {
    setcookie('brgy_token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Logged out successfully.',
    ]);
}

function handleAuthMe(): void {
    $authUser = requireAuth();

    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, username, full_name, role, is_active FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([(int)$authUser['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !(int)$user['is_active']) {
            sendJsonResponse([
                'success' => false,
                'message' => 'User session is no longer active.',
            ], 401);
        }

        $userPayload = [
            'id'       => (int)$user['id'],
            'username' => (string)$user['username'],
            'role'     => (string)$user['role'],
            'fullName' => (string)$user['full_name'],
        ];

        sendJsonResponse([
            'success' => true,
            'user'    => $userPayload,
            'data'    => [
                'user' => $userPayload,
            ],
        ]);
    } catch (Throwable $e) {
        error_log('[PHP AUTH ME ERROR] ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'message' => 'Failed to retrieve profile.',
        ], 500);
    }
}

