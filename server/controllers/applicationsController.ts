import { Request, Response } from 'express';
import pool from '../database/db';
import { generateSequentialCode } from '../utils/referenceGenerator';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ApplicationRow extends RowDataPacket {
  id: number;
  app_code: string;
  reference_number: string;
  control_number: string | null;
  document_type: string;
  status: string;
  user_id: number | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  date_of_birth: string;
  place_of_birth: string;
  civil_status: string;
  contact_number: string;
  email: string | null;
  house_street: string | null;
  purok_sitio: string;
  barangay: string;
  city_municipality: string;
  province: string;
  purpose: string;
  other_purpose: string | null;
  assistance_type: string | null;
  additional_info: string | null;
  length_of_residency: string | null;
  payment_method: string;
  payment_status: string;
  gcash_number: string | null;
  gcash_name: string | null;
  gcash_reference_number: string | null;
  amount_paid: string | null;
  remarks: string | null;
  rejection_reason: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToApplicationRecord(r: ApplicationRow) {
  // Format dates for display
  const subDate = new Date(r.created_at).toLocaleString('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updDate = new Date(r.updated_at).toLocaleString('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    id: r.app_code,
    internalId: r.id,
    referenceNumber: r.reference_number,
    controlNumber: r.control_number || undefined,
    documentType: r.document_type,
    status: r.status,
    submissionDate: subDate,
    lastUpdatedDate: updDate,
    remarks: r.remarks || undefined,
    rejectionReason: r.rejection_reason || undefined,
    verifiedBy: r.verified_by || undefined,
    personalInfo: {
      firstName: r.first_name,
      middleName: r.middle_name || undefined,
      lastName: r.last_name,
      suffix: r.suffix || undefined,
      dateOfBirth: r.date_of_birth,
      placeOfBirth: r.place_of_birth,
      civilStatus: r.civil_status,
      contactNumber: r.contact_number,
      email: r.email || undefined,
      houseStreet: r.house_street || undefined,
      purokSitio: r.purok_sitio,
      barangay: r.barangay,
      cityMunicipality: r.city_municipality,
      province: r.province
    },
    details: {
      purpose: r.purpose,
      otherPurpose: r.other_purpose || undefined,
      assistanceType: r.assistance_type || undefined,
      additionalInfo: r.additional_info || undefined,
      lengthOfResidency: r.length_of_residency || undefined
    },
    payment: {
      method: r.payment_method,
      status: r.payment_status,
      gcashNumber: r.gcash_number || undefined,
      gcashName: r.gcash_name || undefined,
      gcashReferenceNumber: r.gcash_reference_number || undefined,
      amountPaid: r.amount_paid || undefined
    }
  };
}

/**
 * POST /api/applications
 * Resident submits a new document request.
 */
export async function createApplication(req: Request, res: Response): Promise<void> {
  const { documentType, personalInfo, details, payment } = req.body;

  // Validation
  if (!documentType || !['clearance', 'indigency', 'residency'].includes(documentType)) {
    res.status(400).json({ success: false, message: 'A valid document service type is required.' });
    return;
  }

  if (!personalInfo?.firstName || !personalInfo?.lastName || !personalInfo?.contactNumber || !personalInfo?.purokSitio) {
    res.status(400).json({
      success: false,
      message: 'First name, last name, contact number, and purok/sitio are required.'
    });
    return;
  }

  if (!details?.purpose) {
    res.status(400).json({ success: false, message: 'Application purpose is required.' });
    return;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Determine category prefix
    const cat = documentType === 'clearance' ? 'CLR' : documentType === 'indigency' ? 'IND' : 'RES';

    // 1. Generate collision-free reference number
    const referenceNumber = await generateSequentialCode(conn, cat, 'BRGY-{YEAR}-{CAT}');

    // 2. Generate internal application code
    const appCode = await generateSequentialCode(conn, 'APP', 'APP-{YEAR}');

    // 3. Insert into applications table
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO applications (
        app_code, reference_number, document_type, status, user_id,
        first_name, middle_name, last_name, suffix, date_of_birth, place_of_birth,
        civil_status, contact_number, email, house_street, purok_sitio, barangay,
        city_municipality, province, purpose, other_purpose, assistance_type,
        additional_info, length_of_residency, payment_method, payment_status,
        gcash_number, gcash_name, gcash_reference_number, amount_paid, remarks
      ) VALUES (
        ?, ?, ?, 'Pending Review', ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )`,
      [
        appCode,
        referenceNumber,
        documentType,
        (req as any).user?.id || null,
        personalInfo.firstName.trim(),
        personalInfo.middleName?.trim() || null,
        personalInfo.lastName.trim(),
        personalInfo.suffix?.trim() || null,
        personalInfo.dateOfBirth,
        personalInfo.placeOfBirth.trim(),
        personalInfo.civilStatus,
        personalInfo.contactNumber.trim(),
        personalInfo.email?.trim() || null,
        personalInfo.houseStreet?.trim() || null,
        personalInfo.purokSitio.trim(),
        personalInfo.barangay?.trim() || 'Barangay San Isidro',
        personalInfo.cityMunicipality?.trim() || 'Quezon City',
        personalInfo.province?.trim() || 'Metro Manila',
        details.purpose.trim(),
        details.otherPurpose?.trim() || null,
        details.assistanceType?.trim() || null,
        details.additionalInfo?.trim() || null,
        details.lengthOfResidency?.trim() || null,
        payment?.method || 'pay_on_pickup',
        payment?.status || 'Pending',
        payment?.gcashNumber?.trim() || null,
        payment?.gcashName?.trim() || null,
        payment?.gcashReferenceNumber?.trim()?.slice(0, 100) || null,
        payment?.amountPaid?.trim()?.slice(0, 150) || null,
        'Application received and placed in queue for initial document review.'
      ]
    );

    const insertedId = result.insertId;

    // 4. Log initial history
    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, NULL, 'Pending Review', 'SUBMITTED', 'Application submitted online for administrative review.', ?)`,
      [insertedId, `${personalInfo.firstName} ${personalInfo.lastName}`]
    );

    await conn.commit();

    // 5. Fetch newly created record
    const [createdRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [insertedId]
    );

    const record = mapRowToApplicationRecord(createdRows[0]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      referenceNumber,
      data: record
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[CREATE APPLICATION ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please check your inputs and try again.'
    });
  } finally {
    conn.release();
  }
}

/**
 * GET /api/applications
 * Staff/Admin application listing with search, status filter, and pagination.
 */
export async function getApplications(req: Request, res: Response): Promise<void> {
  const { search, status, documentType, page = '1', limit = '50' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  try {
    const conditions: string[] = [];
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(reference_number LIKE ? OR control_number LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ?)');
      params.push(q, q, q, q, q);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (documentType && typeof documentType === 'string' && documentType !== 'all') {
      conditions.push('document_type = ?');
      params.push(documentType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for pagination
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM applications ${whereClause}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    // Fetch records
    const [rows] = await pool.query<ApplicationRow[]>(
      `SELECT * FROM applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const data = rows.map(mapRowToApplicationRecord);

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error('[GET APPLICATIONS ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications from database.'
    });
  }
}

/**
 * GET /api/applications/:id
 * Retrieve application by app_code or internal numeric ID.
 */
export async function getApplicationById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const [rows] = await pool.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? OR reference_number = ?',
      [id, id, id]
    );

    const r = rows[0];
    if (!r) {
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    // Retrieve history
    const [historyRows] = await pool.query<RowDataPacket[]>(
      'SELECT previous_status, new_status, action_type, remarks, changed_by_name, created_at FROM application_history WHERE application_id = ? ORDER BY created_at ASC',
      [r.id]
    );

    const record = mapRowToApplicationRecord(r);

    res.json({
      success: true,
      data: {
        ...record,
        history: historyRows.map((h) => ({
          previousStatus: h.previous_status,
          newStatus: h.new_status,
          actionType: h.action_type,
          remarks: h.remarks,
          changedBy: h.changed_by_name,
          timestamp: new Date(h.created_at).toLocaleString('en-PH', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: true
          })
        }))
      }
    });
  } catch (err: any) {
    console.error('[GET APP BY ID ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve application details.' });
  }
}

/**
 * GET /api/applications/track/:referenceNumber
 * Public Tracking endpoint for residents.
 */
export async function trackApplication(req: Request, res: Response): Promise<void> {
  const paramVal = req.params.referenceNumber;
  const referenceNumber = (Array.isArray(paramVal) ? paramVal[0] : paramVal) || '';

  if (!referenceNumber || !referenceNumber.trim()) {
    res.status(400).json({ success: false, message: 'Reference number is required for tracking.' });
    return;
  }

  const cleanRef = referenceNumber.trim();

  try {
    const [rows] = await pool.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE UPPER(TRIM(reference_number)) = UPPER(TRIM(?))',
      [cleanRef]
    );

    const r = rows[0];
    if (!r) {
      res.status(404).json({
        success: false,
        message: 'No application was found matching reference number ' + cleanRef.toUpperCase() + '. Please verify the number from your confirmation receipt.'
      });
      return;
    }

    const record = mapRowToApplicationRecord(r);

    res.json({
      success: true,
      data: record
    });
  } catch (err: any) {
    console.error('[TRACK APP ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to query tracking information.' });
  }
}
