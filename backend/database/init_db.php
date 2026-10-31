<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

try {
    $cfg = getDbConfig();
    echo "[PHP DB INIT] Connecting to MySQL server at {$cfg['host']}:{$cfg['port']} as {$cfg['user']}...\n";
    initializeDatabase();
    echo "[PHP DB INIT] Database initialization and migrations completed successfully.\n";
    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, "[PHP DB INIT ERROR] " . $e->getMessage() . "\n");
    exit(1);
}

