<?php
declare(strict_types=1);

namespace App\Modules\Authentication\Controllers;

require_once __DIR__ . '/../../../../controllers/AuthController.php';

class AuthController {
    public static function login(array $body): never {
        handleAuthLogin($body);
    }

    public static function logout(): never {
        handleAuthLogout();
    }

    public static function me(): never {
        handleAuthMe();
    }
}

