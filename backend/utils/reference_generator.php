<?php
declare(strict_types=1);

/**
 * Generates an atomic, collision-free sequential reference number or control number
 * using the `reference_counter` table inside an active database transaction.
 */
function generateSequentialCode(PDO $pdo, string $category, string $prefixFormat): string {
    $currentYear = (int)date('Y');

    // 1. Lock and increment counter atomically for this category and year
    $stmt = $pdo->prepare("
        INSERT INTO reference_counter (category, year, last_number)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE last_number = last_number + 1
    ");
    $stmt->execute([$category, $currentYear]);

    // 2. Fetch the newly incremented number
    $selectStmt = $pdo->prepare("SELECT last_number FROM reference_counter WHERE category = ? AND year = ?");
    $selectStmt->execute([$category, $currentYear]);
    $row = $selectStmt->fetch(PDO::FETCH_ASSOC);

    $nextSeq = isset($row['last_number']) ? (int)$row['last_number'] : 1;
    $paddedSeq = str_pad((string)$nextSeq, 4, '0', STR_PAD_LEFT);

    $prefix = str_replace(
        ['{YEAR}', '{CAT}'],
        [(string)$currentYear, $category],
        $prefixFormat
    );

    return "{$prefix}-{$paddedSeq}";
}

