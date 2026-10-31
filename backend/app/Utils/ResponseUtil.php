<?php
declare(strict_types=1);

namespace App\Utils;

if (!function_exists('sendJsonResponse')) {
    /**
     * Send structured JSON response and terminate request.
     */
    function sendJsonResponse(array $payload, int $statusCode = 200): never {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

