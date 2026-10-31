<?php
declare(strict_types=1);

namespace App\Modules\Dashboard\Controllers;

require_once __DIR__ . '/../../../../controllers/DashboardController.php';

class DashboardController {
    public static function statistics(): never {
        handleGetDashboardStatistics();
    }
}

