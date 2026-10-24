import pool from './db';

async function alterStatusEnum() {
  try {
    console.log('[MIGRATION] Altering applications status enum to include Successful...');
    await pool.query(`
      ALTER TABLE applications 
      MODIFY COLUMN status ENUM('Pending Review', 'Under Verification', 'Approved', 'Rejected', 'Ready for Claiming', 'Successful') 
      NOT NULL DEFAULT 'Pending Review'
    `);
    console.log('[MIGRATION] Status ENUM successfully updated in MySQL!');
    process.exit(0);
  } catch (err) {
    console.error('[MIGRATION ERROR]', err);
    process.exit(1);
  }
}

alterStatusEnum();
