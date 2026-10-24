import { Request, Response } from 'express';
import pool from '../database/db';
import type { RowDataPacket } from 'mysql2';

export async function getDashboardStatistics(req: Request, res: Response): Promise<void> {
  try {
    // 1. Status counts
    const [statusRows] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count FROM applications GROUP BY status`
    );

    let total = 0;
    let pending = 0;
    let verification = 0;
    let approved = 0;
    let ready = 0;
    let rejected = 0;
    let successful = 0;

    for (const r of statusRows) {
      const c = Number(r.count);
      total += c;
      if (r.status === 'Pending Review') pending = c;
      else if (r.status === 'Under Verification') verification = c;
      else if (r.status === 'Approved') approved = c;
      else if (r.status === 'Ready for Claiming') ready = c;
      else if (r.status === 'Rejected') rejected = c;
      else if (r.status === 'Successful') successful = c;
    }

    // 2. Service distribution
    const [serviceRows] = await pool.query<RowDataPacket[]>(
      `SELECT document_type, COUNT(*) as count FROM applications GROUP BY document_type`
    );

    const serviceCounts: Record<string, number> = {
      clearance: 0,
      indigency: 0,
      residency: 0
    };
    for (const s of serviceRows) {
      serviceCounts[s.document_type] = Number(s.count);
    }

    // 3. Applications submitted today
    const [todayRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as todayCount FROM applications WHERE DATE(created_at) = CURRENT_DATE()`
    );
    const submittedToday = todayRows[0]?.todayCount ?? 0;

    res.json({
      success: true,
      data: {
        totalApplications: total,
        pendingReview: pending,
        underVerification: verification,
        approved,
        readyForClaiming: ready,
        rejected,
        successful,
        submittedToday,
        byService: serviceCounts
      }
    });
  } catch (err: any) {
    console.error('[DASHBOARD STATS ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard statistics.' });
  }
}

export async function getApplicationHistory(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const [appRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, reference_number FROM applications WHERE id = ? OR app_code = ? OR reference_number = ?',
      [id, id, id]
    );

    const app = appRows[0];
    if (!app) {
      res.status(404).json({ success: false, message: 'Application record not found.' });
      return;
    }

    const [historyRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, previous_status, new_status, action_type, remarks, changed_by_name, created_at 
       FROM application_history 
       WHERE application_id = ? 
       ORDER BY created_at ASC`,
      [app.id]
    );

    const formattedHistory = historyRows.map((h) => ({
      id: h.id,
      previousStatus: h.previous_status,
      newStatus: h.new_status,
      actionType: h.action_type,
      remarks: h.remarks,
      changedBy: h.changed_by_name,
      timestamp: new Date(h.created_at).toLocaleString('en-PH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }));

    res.json({
      success: true,
      referenceNumber: app.reference_number,
      history: formattedHistory
    });
  } catch (err: any) {
    console.error('[APP HISTORY ERROR]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve application history.' });
  }
}
