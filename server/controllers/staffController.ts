import { Request, Response } from 'express';
import pool from '../database/db';
import { generateSequentialCode } from '../utils/referenceGenerator';
import { mapRowToApplicationRecord, ApplicationRow } from './applicationsController';

/**
 * PATCH /api/staff/applications/:id/approve
 * Approves an application, generates an official control number if not yet set,
 * and records staff audit log.
 */
export async function approveApplication(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { remarks, customControlNumber } = req.body;
  const staffName = req.user?.fullName || 'Barangay Staff';
  const staffUserId = req.user?.id || null;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Fetch current application
    const [rows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? FOR UPDATE',
      [id, id]
    );

    const app = rows[0];
    if (!app) {
      await conn.rollback();
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    if (app.status === 'Approved' || app.status === 'Ready for Claiming') {
      await conn.rollback();
      res.status(400).json({
        success: false,
        message: `Application is already ${app.status}.`
      });
      return;
    }

    // 2. Determine or generate control number
    let controlNumber = app.control_number || customControlNumber;
    if (!controlNumber) {
      const cat = app.document_type === 'clearance' ? 'CLR' : app.document_type === 'indigency' ? 'IND' : 'RES';
      controlNumber = await generateSequentialCode(conn, cat, '{CAT}-{YEAR}');
    }

    const finalRemarks = remarks?.trim() || 'Approved by Barangay Officer. Ready for final printing and signature.';
    const verifiedBy = staffName;

    // 3. Update application status
    await conn.query(
      `UPDATE applications 
       SET status = 'Approved',
           control_number = ?,
           remarks = ?,
           verified_by = ?,
           processed_by_user_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [controlNumber, finalRemarks, verifiedBy, staffUserId, app.id]
    );

    // 4. Record audit log
    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, ?, 'Approved', 'APPROVED', ?, ?)`,
      [app.id, app.status, finalRemarks, staffName]
    );

    await conn.commit();

    // 5. Fetch updated record
    const [updatedRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [app.id]
    );

    res.json({
      success: true,
      message: 'Application approved successfully.',
      data: mapRowToApplicationRecord(updatedRows[0])
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[APPROVE ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to process approval.' });
  } finally {
    conn.release();
  }
}

/**
 * PATCH /api/staff/applications/:id/reject
 * Rejects an application with a mandatory reason.
 */
export async function rejectApplication(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { reason, remarks } = req.body;
  const staffName = req.user?.fullName || 'Barangay Staff';
  const staffUserId = req.user?.id || null;

  if (!reason || !reason.trim()) {
    res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    return;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? FOR UPDATE',
      [id, id]
    );

    const app = rows[0];
    if (!app) {
      await conn.rollback();
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    const rejectionReason = reason.trim();
    const finalRemarks = remarks?.trim() || `Application was reviewed and rejected. Reason: ${rejectionReason}`;

    await conn.query(
      `UPDATE applications 
       SET status = 'Rejected',
           rejection_reason = ?,
           remarks = ?,
           processed_by_user_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [rejectionReason, finalRemarks, staffUserId, app.id]
    );

    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, ?, 'Rejected', 'REJECTED', ?, ?)`,
      [app.id, app.status, `Reason: ${rejectionReason}`, staffName]
    );

    await conn.commit();

    const [updatedRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [app.id]
    );

    res.json({
      success: true,
      message: 'Application rejected.',
      data: mapRowToApplicationRecord(updatedRows[0])
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[REJECT ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to process rejection.' });
  } finally {
    conn.release();
  }
}

/**
 * PATCH /api/staff/applications/:id/ready
 * Marks an application as Ready for Claiming at Window 2.
 */
export async function markReadyForClaiming(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { remarks } = req.body;
  const staffName = req.user?.fullName || 'Barangay Staff';
  const staffUserId = req.user?.id || null;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? FOR UPDATE',
      [id, id]
    );

    const app = rows[0];
    if (!app) {
      await conn.rollback();
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    // Ensure control number exists
    let controlNumber = app.control_number;
    if (!controlNumber) {
      const cat = app.document_type === 'clearance' ? 'CLR' : app.document_type === 'indigency' ? 'IND' : 'RES';
      controlNumber = await generateSequentialCode(conn, cat, '{CAT}-{YEAR}');
    }

    const finalRemarks = remarks?.trim() || 'Document signed and sealed. Ready for resident pick-up at Window 2.';

    await conn.query(
      `UPDATE applications 
       SET status = 'Ready for Claiming',
           control_number = ?,
           remarks = ?,
           processed_by_user_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [controlNumber, finalRemarks, staffUserId, app.id]
    );

    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, ?, 'Ready for Claiming', 'MARKED_READY', ?, ?)`,
      [app.id, app.status, finalRemarks, staffName]
    );

    await conn.commit();

    const [updatedRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [app.id]
    );

    res.json({
      success: true,
      message: 'Application marked as Ready for Claiming.',
      data: mapRowToApplicationRecord(updatedRows[0])
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[READY ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to update application status.' });
  } finally {
    conn.release();
  }
}

/**
 * PATCH /api/staff/applications/:id/verify
 * Moves an application to Under Verification status.
 */
export async function moveToVerification(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { remarks } = req.body;
  const staffName = req.user?.fullName || 'Barangay Staff';
  const staffUserId = req.user?.id || null;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? FOR UPDATE',
      [id, id]
    );

    const app = rows[0];
    if (!app) {
      await conn.rollback();
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    const finalRemarks = remarks?.trim() || 'Document in queue for community records and Lupon clearance validation.';

    await conn.query(
      `UPDATE applications 
       SET status = 'Under Verification',
           remarks = ?,
           processed_by_user_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [finalRemarks, staffUserId, app.id]
    );

    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, ?, 'Under Verification', 'VERIFICATION_STARTED', ?, ?)`,
      [app.id, app.status, finalRemarks, staffName]
    );

    await conn.commit();

    const [updatedRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [app.id]
    );

    res.json({
      success: true,
      message: 'Application moved to Under Verification.',
      data: mapRowToApplicationRecord(updatedRows[0])
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[VERIFY ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to update application status.' });
  } finally {
    conn.release();
  }
}

/**
 * PATCH /api/staff/applications/:id/claim
 * Marks an application as Successful when claimed by the resident.
 */
export async function markClaimed(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { remarks } = req.body;
  const staffName = req.user?.fullName || 'Barangay Staff';
  const staffUserId = req.user?.id || null;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ? OR app_code = ? FOR UPDATE',
      [id, id]
    );

    const app = rows[0];
    if (!app) {
      await conn.rollback();
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    const finalRemarks = remarks?.trim() || 'Official document received and claimed by applicant. Transaction successfully completed.';
    const newPaymentStatus = app.payment_status === 'Pending' ? 'Paid' : app.payment_status;

    await conn.query(
      `UPDATE applications 
       SET status = 'Successful',
           payment_status = ?,
           remarks = ?,
           processed_by_user_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [newPaymentStatus, finalRemarks, staffUserId, app.id]
    );

    await conn.query(
      `INSERT INTO application_history (application_id, previous_status, new_status, action_type, remarks, changed_by_name)
       VALUES (?, ?, 'Successful', 'DOCUMENT_CLAIMED', ?, ?)`,
      [app.id, app.status, finalRemarks, staffName]
    );

    await conn.commit();

    const [updatedRows] = await conn.query<ApplicationRow[]>(
      'SELECT * FROM applications WHERE id = ?',
      [app.id]
    );

    res.json({
      success: true,
      message: 'Application marked as Successful (Claimed).',
      data: mapRowToApplicationRecord(updatedRows[0])
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[CLAIM ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to update application status.' });
  } finally {
    conn.release();
  }
}

