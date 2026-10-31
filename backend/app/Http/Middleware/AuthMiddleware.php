<?php
declare(strict_types=1);

namespace App\Http\Middleware;

require_once __DIR__ . '/../../Utils/JwtUtil.php';

class AuthMiddleware {
    /**
     * Enforce authentication and role verification
     *
     * @param array $allowedRoles
     * @return array Verified user payload
     */
    public static function handle(array $allowedRoles = []): array {
        return requireAuth($allowedRoles);
    }

    /**
     * Optional authentication check
     */
    public static function optionalUser(): ?array {
        return getOptionalAuthUser();
    }
}

