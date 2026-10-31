<?php
declare(strict_types=1);

namespace App\Modules\DocumentServices\Controllers;

require_once __DIR__ . '/../../../../controllers/ServicesController.php';

class ServicesController {
    public static function index(): never {
        handleGetServices();
    }

    public static function show(string $serviceId): never {
        handleGetServiceById($serviceId);
    }
}

