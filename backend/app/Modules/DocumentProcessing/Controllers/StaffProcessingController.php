<?php
declare(strict_types=1);

namespace App\Modules\DocumentProcessing\Controllers;

require_once __DIR__ . '/../../../../controllers/StaffController.php';

class StaffProcessingController {
    public static function index(): never {
        handleGetApplications();
    }

    public static function approve(string $id, array $body): never {
        handleApproveApplication($id, $body);
    }

    public static function reject(string $id, array $body): never {
        handleRejectApplication($id, $body);
    }

    public static function verify(string $id, array $body): never {
        handleMoveToVerification($id, $body);
    }

    public static function ready(string $id, array $body): never {
        handleMarkReadyForClaiming($id, $body);
    }

    public static function claim(string $id, array $body): never {
        handleMarkClaimed($id, $body);
    }
}

