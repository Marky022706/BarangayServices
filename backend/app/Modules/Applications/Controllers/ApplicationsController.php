<?php
declare(strict_types=1);

namespace App\Modules\Applications\Controllers;

require_once __DIR__ . '/../../../../controllers/ApplicationsController.php';

class ApplicationsController {
    public static function store(array $body): never {
        handleCreateApplication($body);
    }

    public static function index(): never {
        handleGetApplications();
    }

    public static function track(string $ref): never {
        handleTrackApplication($ref);
    }

    public static function show(string $id): never {
        handleGetApplicationById($id);
    }

    public static function history(string $id): never {
        handleGetApplicationHistory($id);
    }
}

