import { PoolConnection } from 'mysql2/promise';

/**
 * Generates an atomic, collision-free sequential reference number or control number
 * using the `reference_counter` table inside an active database transaction.
 */
export async function generateSequentialCode(
  connection: PoolConnection,
  category: 'CLR' | 'IND' | 'RES' | 'APP' | 'CTRL',
  prefixFormat: string
): Promise<string> {
  const currentYear = new Date().getFullYear();

  // 1. Lock and increment counter atomically for this category and year
  await connection.query(
    `INSERT INTO reference_counter (category, year, last_number) 
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE last_number = last_number + 1`,
    [category, currentYear]
  );

  // 2. Fetch the newly incremented number
  const [rows] = await connection.query<any[]>(
    `SELECT last_number FROM reference_counter WHERE category = ? AND year = ?`,
    [category, currentYear]
  );

  const nextSeq = rows[0]?.last_number ?? 1;
  const paddedSeq = String(nextSeq).padStart(4, '0');

  // Prefix format examples:
  // "BRGY-{YEAR}-{CAT}" -> "BRGY-2026-CLR-0001"
  // "APP-{YEAR}" -> "APP-2026-0001"
  // "{CAT}-{YEAR}" -> "CLR-2026-0001"
  return prefixFormat
    .replace('{YEAR}', String(currentYear))
    .replace('{CAT}', category) + `-${paddedSeq}`;
}
