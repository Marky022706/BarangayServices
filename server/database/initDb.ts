import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'barangay_eservices_db';

export async function initializeDatabase(): Promise<void> {
  console.log(`[DB INIT] Connecting to MySQL server at ${host}:${port} as ${user}...`);

  // 1. Initial connection without database to ensure DB exists
  const rootConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    dateStrings: true
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // 2. Connect to the target database
  const dbConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    dateStrings: true
  });

  console.log(`[DB INIT] Applying database schema for \`${database}\`...`);
  const schemaPath = path.resolve(process.cwd(), 'server/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await dbConn.query(schemaSql);

  // 3. Seed Services if not present
  console.log('[DB INIT] Checking available services...');
  const [existingServices] = await dbConn.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as cnt FROM services');
  if (existingServices[0]?.cnt === 0) {
    console.log('[DB INIT] Seeding standard barangay services...');
    const services = [
      {
        id: 'clearance',
        title: 'Barangay Clearance',
        shortDescription: 'Request a barangay clearance for employment, school, or other legitimate purposes.',
        fullDescription: 'An official certification issued by the Barangay verifying that the resident has no derogatory criminal record or pending dispute within the jurisdiction and is in good standing.',
        iconName: 'FileCheck',
        standardFee: '₱100.00 (Standard) / Free for First-Time Jobseekers (RA 11261)',
        processingTime: '1 - 2 Working Days',
        requirements: [
          '1 Valid Government-issued Photo ID or School ID',
          'Recent 1x1 or 2x2 ID Photo (taken within 6 months)',
          'Proof of residency (Purok Certification or Utility Bill)',
          'Barangay verification fee receipt or First-time Jobseeker Oath'
        ]
      },
      {
        id: 'indigency',
        title: 'Certificate of Indigency',
        shortDescription: 'Apply for a certificate of indigency for eligible assistance and other accepted purposes.',
        fullDescription: 'Issued to bona fide indigent residents or families belonging to low-income brackets seeking medical, financial, funeral, or educational assistance from government or private institutions.',
        iconName: 'HandHeart',
        standardFee: 'FREE (No Fee / Waived)',
        processingTime: '1 Working Day',
        requirements: [
          '1 Valid Government-issued Photo ID or Voter’s Certificate',
          'Certificate from Purok / Sitio Leader attesting indigent status',
          'Social Case Study Report or Hospital Bill / Prescription (for medical aid)',
          'Assessment by Barangay Social Welfare Desk'
        ]
      },
      {
        id: 'residency',
        title: 'Certificate of Residency',
        shortDescription: 'Request proof of residence within the barangay.',
        fullDescription: 'An official document verifying that an individual has been residing at a specified physical address in the barangay for a stated period of time, commonly used for banking, schools, and utility connections.',
        iconName: 'House',
        standardFee: '₱50.00 (Free for Senior Citizens & PWDs)',
        processingTime: 'Same Day / 1 Working Day',
        requirements: [
          '1 Valid Government ID with residential address',
          'Proof of billing (Meralco, Manila Water, or Internet bill) or Lease Contract',
          'Minimum of six (6) months continuous residency in the Barangay',
          'Endorsement from Purok / Sitio President'
        ]
      }
    ];

    for (const s of services) {
      await dbConn.query(
        `INSERT INTO services (id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.id, s.title, s.shortDescription, s.fullDescription, s.iconName, s.standardFee, s.processingTime, JSON.stringify(s.requirements)]
      );
    }
    console.log('[DB INIT] Services seeded successfully.');
  }

  // 4. Seed Staff Accounts if not present
  console.log('[DB INIT] Checking default staff users...');
  const [existingUsers] = await dbConn.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as cnt FROM users');
  if (existingUsers[0]?.cnt === 0) {
    console.log('[DB INIT] Seeding default staff accounts...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('barangay2026', salt);

    await dbConn.query(
      `INSERT INTO users (username, password_hash, full_name, role, email, contact_number, is_active)
       VALUES 
       (?, ?, ?, 'admin', 'admin@barangay.gov.ph', '09170001122', 1),
       (?, ?, ?, 'staff', 'records@barangay.gov.ph', '09170003344', 1)`,
      [
        'admin', passwordHash, 'Administrator — Hon. Honorio A. Reyes',
        'staff1', passwordHash, 'Records Officer — Maria Clara De Jesus'
      ]
    );
    console.log('[DB INIT] Staff accounts (admin, staff1) seeded successfully.');
  }

  // 5. Initialize reference counters if empty
  const currentYear = new Date().getFullYear();
  const categories = ['CLR', 'IND', 'RES', 'APP', 'CTRL'];
  for (const cat of categories) {
    await dbConn.query(
      `INSERT IGNORE INTO reference_counter (category, year, last_number) VALUES (?, ?, 0)`,
      [cat, currentYear]
    );
  }

  await dbConn.end();
  console.log('[DB INIT] Database initialization completed successfully.');
}

if (process.argv[1]?.includes('initDb')) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[DB INIT ERROR]', err);
      process.exit(1);
    });
}
