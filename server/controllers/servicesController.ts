import { Request, Response } from 'express';
import pool from '../database/db';
import type { RowDataPacket } from 'mysql2';

interface ServiceRow extends RowDataPacket {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  icon_name: string;
  standard_fee: string;
  processing_time: string;
  requirements_json: string | string[];
  is_available: number;
}

export async function getServices(req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query<ServiceRow[]>(
      'SELECT id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json FROM services WHERE is_available = 1'
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      title: r.title,
      shortDescription: r.short_description,
      fullDescription: r.full_description,
      iconName: r.icon_name,
      standardFee: r.standard_fee,
      processingTime: r.processing_time,
      requirements: typeof r.requirements_json === 'string' ? JSON.parse(r.requirements_json) : r.requirements_json
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err: any) {
    console.error('[SERVICES ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available services from database.'
    });
  }
}

export async function getServiceById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const [rows] = await pool.query<ServiceRow[]>(
      'SELECT id, title, short_description, full_description, icon_name, standard_fee, processing_time, requirements_json FROM services WHERE id = ? AND is_available = 1',
      [id]
    );

    const r = rows[0];
    if (!r) {
      res.status(404).json({
        success: false,
        message: 'Requested barangay service was not found.'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: r.id,
        title: r.title,
        shortDescription: r.short_description,
        fullDescription: r.full_description,
        iconName: r.icon_name,
        standardFee: r.standard_fee,
        processingTime: r.processing_time,
        requirements: typeof r.requirements_json === 'string' ? JSON.parse(r.requirements_json) : r.requirements_json
      }
    });
  } catch (err: any) {
    console.error('[SERVICE BY ID ERROR]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service details.'
    });
  }
}
