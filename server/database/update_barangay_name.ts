import pool from './db';

async function updateBarangay() {
  try {
    await pool.query("ALTER TABLE applications ALTER COLUMN barangay SET DEFAULT 'Barangay San Isidro'");
    const [res]: any = await pool.query("UPDATE applications SET barangay = 'Barangay San Isidro' WHERE barangay = 'Barangay San Jose'");
    console.log('[DB] Updated rows:', res.affectedRows);
    console.log('[DB] Default column set to Barangay San Isidro successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[DB ERROR]', err);
    process.exit(1);
  }
}

updateBarangay();
